import { randomBytes, createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { AccountStatus, BusinessStatus, MembershipStatus, RoleScope } from "@prisma/client";
import { env } from "../../config/env";
import { ApiError } from "../../lib/errors";
import { prisma } from "../../lib/prisma";
import { authRepository } from "./auth.repository";
import type { AuthenticatedUser, AuthResult, RequestMeta } from "./auth.types";
import type { LoginInput, RegisterInput } from "./auth.schema";

const SESSION_COOKIE = "inventory_session";
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
const newToken = () => randomBytes(32).toString("base64url");
const sessionExpiry = () => new Date(Date.now() + env.AUTH_SESSION_DAYS * 86400000);
const resetExpiry = () => new Date(Date.now() + env.AUTH_RESET_TOKEN_MINUTES * 60000);
const verificationExpiry = () => new Date(Date.now() + env.AUTH_VERIFICATION_TOKEN_HOURS * 3600000);

function safeUser(
  user: NonNullable<Awaited<ReturnType<typeof authRepository.findUserById>>>,
): AuthenticatedUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    status: user.status,
    emailVerifiedAt: user.emailVerifiedAt,
    memberships: user.memberships.map((membership) => ({
      id: membership.id,
      businessId: membership.businessId,
      status: membership.status,
      business: {
        id: membership.business.id,
        name: membership.business.name,
        status: membership.business.status,
      },
      roles: membership.roles.map((membershipRole) => ({
        role: {
          id: membershipRole.role.id,
          name: membershipRole.role.name,
          scope: membershipRole.role.scope,
          permissions: membershipRole.role.permissions.map((item) => ({
            permission: { key: item.permission.key },
          })),
        },
      })),
    })),
  };
}

async function createSession(userId: string, meta: RequestMeta) {
  const token = newToken();
  const expiresAt = sessionExpiry();
  await prisma.session.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    },
  });
  return { token, expiresAt };
}

async function issueVerificationToken(userId: string) {
  const token = newToken();
  await prisma.emailVerificationToken.create({
    data: { userId, tokenHash: hashToken(token), expiresAt: verificationExpiry() },
  });
  return token;
}

export async function register(input: RegisterInput, meta: RequestMeta): Promise<AuthResult> {
  const currency = input.currency ?? "USD";
  const timeZone = input.timeZone ?? "UTC";
  const existing = await authRepository.findUserByEmail(input.email);
  if (existing)
    throw new ApiError(409, "EMAIL_IN_USE", "An account with this email already exists.");

  const passwordHash = await bcrypt.hash(input.password, 12);
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        status: AccountStatus.ACTIVE,
      },
    });
    const business = await tx.business.create({
      data: {
        name: input.businessName,
        businessType: input.businessType,
        industry: input.industry,
        email: input.businessEmail ?? input.email,
        currency,
        timeZone,
        status: BusinessStatus.ACTIVE,
        ownerId: user.id,
      },
    });
    const membership = await tx.businessMembership.create({
      data: {
        businessId: business.id,
        userId: user.id,
        status: MembershipStatus.ACTIVE,
        joinedAt: new Date(),
      },
    });
    const role = await tx.role.create({
      data: {
        businessId: business.id,
        name: "Business Owner",
        scope: RoleScope.BUSINESS,
        isSystem: true,
      },
    });
    const permissions = await tx.permission.findMany({
      where: { key: { startsWith: "business." } },
    });
    if (permissions.length)
      await tx.rolePermission.createMany({
        data: permissions.map((permission) => ({ roleId: role.id, permissionId: permission.id })),
        skipDuplicates: true,
      });
    await tx.membershipRole.create({ data: { membershipId: membership.id, roleId: role.id } });
    return user;
  });

  const user = await authRepository.findUserById(result.id);
  if (!user)
    throw new ApiError(
      500,
      "REGISTRATION_FAILED",
      "The account could not be loaded after registration.",
    );
  const session = await createSession(result.id, meta);
  const verificationToken = await issueVerificationToken(result.id);
  return {
    user: safeUser(user),
    sessionToken: session.token,
    expiresAt: session.expiresAt,
    verificationToken: env.NODE_ENV === "production" ? undefined : verificationToken,
  };
}

export async function login(input: LoginInput, meta: RequestMeta): Promise<AuthResult> {
  const user = await authRepository.findUserByEmail(input.email);
  const valid = user?.passwordHash
    ? await bcrypt.compare(input.password, user.passwordHash)
    : false;
  if (!user || !valid)
    throw new ApiError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
  if (
    (
      [
        AccountStatus.SUSPENDED,
        AccountStatus.LOCKED,
        AccountStatus.DEACTIVATED,
        AccountStatus.INACTIVE,
      ] as AccountStatus[]
    ).includes(user.status)
  )
    throw new ApiError(403, "ACCOUNT_UNAVAILABLE", "This account is not available.");
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  const session = await createSession(user.id, meta);
  return { user: safeUser(user), sessionToken: session.token, expiresAt: session.expiresAt };
}

export async function authenticateSession(token: string) {
  const session = await authRepository.findSession(hashToken(token));
  if (!session || session.revokedAt || session.expiresAt <= new Date())
    throw new ApiError(401, "UNAUTHENTICATED", "Authentication is required.");
  if (
    (
      [
        AccountStatus.SUSPENDED,
        AccountStatus.LOCKED,
        AccountStatus.DEACTIVATED,
        AccountStatus.INACTIVE,
      ] as AccountStatus[]
    ).includes(session.user.status)
  )
    throw new ApiError(403, "ACCOUNT_UNAVAILABLE", "This account is not available.");
  await prisma.session.update({ where: { id: session.id }, data: { lastUsedAt: new Date() } });
  const user = await authRepository.findUserById(session.userId);
  if (!user) throw new ApiError(401, "UNAUTHENTICATED", "Authentication is required.");
  return { session, user: safeUser(user) };
}

export async function logout(token: string) {
  await prisma.session.updateMany({
    where: { tokenHash: hashToken(token), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.passwordHash || !(await bcrypt.compare(currentPassword, user.passwordHash)))
    throw new ApiError(401, "INVALID_PASSWORD", "Current password is incorrect.");
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
    prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
}

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return undefined;
  const token = newToken();
  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash: hashToken(token), expiresAt: resetExpiry() },
  });
  return env.NODE_ENV === "production" ? undefined : token;
}

export async function resetPassword(token: string, password: string) {
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });
  if (!record || record.usedAt || record.expiresAt <= new Date())
    throw new ApiError(
      400,
      "INVALID_RESET_TOKEN",
      "The password reset token is invalid or expired.",
    );
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash, status: AccountStatus.ACTIVE },
    }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    prisma.session.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
}

export async function verifyEmail(token: string) {
  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });
  if (!record || record.usedAt || record.expiresAt <= new Date())
    throw new ApiError(
      400,
      "INVALID_VERIFICATION_TOKEN",
      "The verification token is invalid or expired.",
    );
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: new Date(), status: AccountStatus.ACTIVE },
    }),
    prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);
}

export { SESSION_COOKIE };

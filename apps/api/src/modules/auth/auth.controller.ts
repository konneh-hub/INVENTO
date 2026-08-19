// TODO: Define auth controller boundary in a later phase.
import { NextRequest, NextResponse } from "next/server";
import { ZodSchema } from "zod";
import { ApiError } from "../../lib/errors";
import {
  authenticateSession,
  changePassword,
  login,
  logout,
  register,
  requestPasswordReset,
  resetPassword,
  SESSION_COOKIE,
  verifyEmail,
} from "./auth.service";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "./auth.schema";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

function meta(request: NextRequest) {
  return {
    ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined,
    userAgent: request.headers.get("user-agent") ?? undefined,
  };
}
async function body<T>(request: NextRequest, schema: ZodSchema<T>) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) throw new ApiError(400, "INVALID_INPUT", "Request data is invalid.");
  return parsed.data;
}
function response(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}
function errorResponse(error: unknown) {
  const normalized =
    error instanceof ApiError
      ? error
      : new ApiError(500, "INTERNAL_ERROR", "An unexpected error occurred.");
  return response(
    { error: { code: normalized.code, message: normalized.message } },
    normalized.statusCode,
  );
}

export async function registerHandler(request: NextRequest) {
  try {
    const result = await register(await body(request, registerSchema), meta(request));
    const next = response({ user: result.user, verificationToken: result.verificationToken });
    next.cookies.set(SESSION_COOKIE, result.sessionToken, {
      ...cookieOptions,
      maxAge: Math.floor((result.expiresAt.getTime() - Date.now()) / 1000),
    });
    return next;
  } catch (error) {
    return errorResponse(error);
  }
}
export async function loginHandler(request: NextRequest) {
  try {
    const result = await login(await body(request, loginSchema), meta(request));
    const next = response({ user: result.user });
    next.cookies.set(SESSION_COOKIE, result.sessionToken, {
      ...cookieOptions,
      maxAge: Math.floor((result.expiresAt.getTime() - Date.now()) / 1000),
    });
    return next;
  } catch (error) {
    return errorResponse(error);
  }
}
export async function logoutHandler(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (token) await logout(token);
    const next = response({ success: true });
    next.cookies.set(SESSION_COOKIE, "", { ...cookieOptions, maxAge: 0 });
    return next;
  } catch (error) {
    return errorResponse(error);
  }
}
export async function meHandler(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) throw new ApiError(401, "UNAUTHENTICATED", "Authentication is required.");
    const result = await authenticateSession(token);
    return response({ user: result.user });
  } catch (error) {
    return errorResponse(error);
  }
}
export async function changePasswordHandler(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) throw new ApiError(401, "UNAUTHENTICATED", "Authentication is required.");
    const { user } = await authenticateSession(token);
    const input = await body(request, changePasswordSchema);
    await changePassword(user.id, input.currentPassword, input.newPassword);
    const next = response({ success: true });
    next.cookies.set(SESSION_COOKIE, "", { ...cookieOptions, maxAge: 0 });
    return next;
  } catch (error) {
    return errorResponse(error);
  }
}
export async function forgotPasswordHandler(request: NextRequest) {
  try {
    const input = await body(request, forgotPasswordSchema);
    const resetToken = await requestPasswordReset(input.email);
    return response({ success: true, ...(resetToken ? { resetToken } : {}) });
  } catch (error) {
    return errorResponse(error);
  }
}
export async function resetPasswordHandler(request: NextRequest) {
  try {
    const input = await body(request, resetPasswordSchema);
    await resetPassword(input.token, input.password);
    return response({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
export async function verifyEmailHandler(request: NextRequest) {
  try {
    const input = await body(request, verifyEmailSchema);
    await verifyEmail(input.token);
    return response({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}

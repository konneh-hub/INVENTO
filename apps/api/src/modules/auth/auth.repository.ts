import { prisma } from "../../lib/prisma";

export const authRepository = {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
          include: {
            business: true,
            roles: {
              include: { role: { include: { permissions: { include: { permission: true } } } } },
            },
          },
        },
      },
    });
  },
  findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        memberships: {
          include: {
            business: true,
            roles: {
              include: { role: { include: { permissions: { include: { permission: true } } } } },
            },
          },
        },
      },
    });
  },
  findSession(tokenHash: string) {
    return prisma.session.findUnique({ where: { tokenHash }, include: { user: true } });
  },
};

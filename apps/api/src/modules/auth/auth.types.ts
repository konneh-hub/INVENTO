export type RequestMeta = { ipAddress?: string; userAgent?: string };

export type AuthenticatedUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  emailVerifiedAt: Date | null;
  memberships: Array<{
    id: string;
    businessId: string;
    status: string;
    business: { id: string; name: string; status: string };
    roles: Array<{
      role: {
        id: string;
        name: string;
        scope: string;
        permissions: Array<{ permission: { key: string } }>;
      };
    }>;
  }>;
};

export type AuthResult = {
  user: Omit<AuthenticatedUser, "memberships"> & { memberships: AuthenticatedUser["memberships"] };
  sessionToken: string;
  expiresAt: Date;
  verificationToken?: string;
};

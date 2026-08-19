// TODO: Add authentication middleware in a later phase.
import { NextRequest } from "next/server";
import { ApiError } from "../lib/errors";
import { authenticateSession, SESSION_COOKIE } from "../modules/auth/auth.service";

export async function requireAuthentication(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) throw new ApiError(401, "UNAUTHENTICATED", "Authentication is required.");
  return authenticateSession(token);
}

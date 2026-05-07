import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractTokenFromHeader, JWTPayload } from "./auth";
import { UserRole } from "@prisma/client";

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

export async function authenticateRequest(
  request: NextRequest
): Promise<{ user: JWTPayload } | { error: NextResponse }> {
  const authHeader = request.headers.get("authorization");
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  try {
    const user = verifyToken(token);
    const { prisma } = await import("./db");

    // Check isBlocked — must be synchronous to prevent blocked users from acting
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { isBlocked: true, lastActiveAt: true },
    });

    if (!dbUser) {
      return { error: NextResponse.json({ error: "User not found" }, { status: 401 }) };
    }
    if (dbUser.isBlocked) {
      return { error: NextResponse.json({ error: "Your account has been suspended. Please contact support." }, { status: 403 }) };
    }

    // Update lastActiveAt async — non-blocking, best-effort
    void prisma.user.update({
      where: { id: user.userId },
      data: { lastActiveAt: new Date() },
    }).catch(() => null);

    return { user };
  } catch {
    return { error: NextResponse.json({ error: "Invalid or expired token" }, { status: 401 }) };
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return async (request: NextRequest): Promise<{ user: JWTPayload } | { error: NextResponse }> => {
    const authResult = await authenticateRequest(request);
    if ("error" in authResult) return authResult;
    if (!allowedRoles.includes(authResult.user.role)) {
      return { error: NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 }) };
    }
    return { user: authResult.user };
  };
}

export function requireCompany() {
  return requireRole([UserRole.COMPANY]);
}

export function requireClient() {
  return requireRole([UserRole.CLIENT]);
}

export function requireAuth() {
  return requireRole([UserRole.CLIENT, UserRole.COMPANY, UserRole.ADMIN]);
}

export function requireAdmin() {
  return requireRole([UserRole.ADMIN]);
}

export async function assertEmailVerified(userId: string): Promise<void> {
  const { prisma } = await import("./db");
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailVerified: true },
  });
  if (!user?.emailVerified) {
    throw Object.assign(new Error("Email not verified"), { status: 403 });
  }
}

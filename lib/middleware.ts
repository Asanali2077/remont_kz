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
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  try {
    const user = verifyToken(token);
    return { user };
  } catch (error) {
    return {
      error: NextResponse.json({ error: "Invalid or expired token" }, { status: 401 }),
    };
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return async (request: NextRequest): Promise<{ user: JWTPayload } | { error: NextResponse }> => {
    const authResult = await authenticateRequest(request);
    if ("error" in authResult) {
      return authResult;
    }

    const { user } = authResult;
    if (!allowedRoles.includes(user.role)) {
      return {
        error: NextResponse.json(
          { error: "Forbidden: Insufficient permissions" },
          { status: 403 }
        ),
      };
    }

    return { user };
  };
}

export function requireCompany() {
  return requireRole([UserRole.COMPANY]);
}

export function requireClient() {
  return requireRole([UserRole.CLIENT]);
}

export function requireAuth() {
  return requireRole([UserRole.CLIENT, UserRole.COMPANY]);
}



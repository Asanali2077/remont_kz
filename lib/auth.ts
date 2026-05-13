import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

const DEFAULT_SECRET = "your-super-secret-jwt-key-change-in-production";
const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

if (process.env.NODE_ENV === "production" && JWT_SECRET === DEFAULT_SECRET) {
  throw new Error("FATAL: JWT_SECRET is not set. Configure a strong secret before deploying.");
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET as jwt.Secret, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}



import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword, generateToken } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/utils";
import { sendWelcomeEmail, sendVerificationEmail } from "@/lib/email";
import { randomUUID } from "crypto";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/\d/, "Password must contain at least one digit"),
  role: z.enum(["client", "company"]),
  name: z.string().optional(),
  phone: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const rl = rateLimit(`register:${getClientIp(request)}`, 5, 60 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many registration attempts. Please try again later." }, { status: 429 });
    }

    const body = await request.json();
    const { honeypot } = body as { honeypot?: string };
    if (honeypot) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    const isDev = process.env.NODE_ENV !== "production";
    const verifyToken = isDev ? null : randomUUID();

    // Create user — auto-verified in dev, requires email link in production
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role.toUpperCase() as UserRole,
        name: validatedData.name,
        phone: validatedData.phone,
        emailVerified: isDev,
        emailVerifyToken: verifyToken,
      },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        phone: true,
        createdAt: true,
      },
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    void sendWelcomeEmail(user.email, user.name ?? "").catch((err) => console.error("sendWelcomeEmail failed", { to: user.email, err }));
    if (!isDev && verifyToken) {
      const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/auth/verify-email?token=${verifyToken}`;
      void sendVerificationEmail(user.email, verifyUrl).catch((err) => console.error("sendVerificationEmail failed", { to: user.email, err }));
    }

    return NextResponse.json({ user, token }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    const msg = error instanceof Error ? error.message : String(error);
    console.error("Registration error:", msg);
    return NextResponse.json(
      { error: "Internal server error", detail: process.env.NODE_ENV !== "production" ? msg : undefined },
      { status: 500 }
    );
  }
}



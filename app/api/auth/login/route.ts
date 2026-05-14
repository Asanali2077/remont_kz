import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import speakeasy from "speakeasy";
import { prisma } from "@/lib/db";
import { verifyPassword, generateToken } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
  try {
    const rl = rateLimit(`login:${getClientIp(request)}`, 10, 15 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many login attempts. Please try again later." }, { status: 429 });
    }

    const body = await request.json();
    const { honeypot } = body as { honeypot?: string };
    if (honeypot) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    const validatedData = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (user.isBlocked) {
      return NextResponse.json(
        { error: "Your account has been suspended. Please contact support." },
        { status: 403 }
      );
    }

    const isValidPassword = await verifyPassword(validatedData.password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (user.twoFactorEnabled && user.twoFactorSecret) {
      const { totpCode } = body as { totpCode?: string };
      if (!totpCode) {
        return NextResponse.json({ requires2FA: true }, { status: 200 });
      }
      const valid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: totpCode,
        window: 1,
      });
      if (!valid) {
        return NextResponse.json({ error: "Invalid authentication code" }, { status: 401 });
      }
    }

    const token = generateToken({ userId: user.id, email: user.email, role: user.role });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        phone: user.phone,
      },
      token,
      emailVerified: user.emailVerified,
      // In dev: expose verify URL if email not yet verified
      ...(process.env.NODE_ENV !== "production" && !user.emailVerified && user.emailVerifyToken && {
        verifyUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/auth/verify-email?token=${user.emailVerifyToken}`,
      }),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

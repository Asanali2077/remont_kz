import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

const schema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters").regex(/\d/, "Password must contain at least one digit"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = schema.parse(body);

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiresAt: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Reset link is invalid or has expired" }, { status: 400 });
    }

    const hashed = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, resetToken: null, resetTokenExpiresAt: null },
    });

    return NextResponse.json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Validation error" }, { status: 400 });
    }
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

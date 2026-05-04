import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { user } = authResult;

    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(dbUser);
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const deleteSchema = z.object({
  password: z.string().min(1, "Password is required for account deletion"),
});

export async function DELETE(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if ("error" in auth) return auth.error;

    const body = await request.json();
    const { password } = deleteSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: auth.user.userId },
      select: { id: true, password: true },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { verifyPassword } = await import("@/lib/auth");
    const valid = await verifyPassword(password, user.password);
    if (!valid) return NextResponse.json({ error: "Invalid password" }, { status: 401 });

    await prisma.user.delete({ where: { id: user.id } });

    return NextResponse.json({ message: "Account deleted successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message }, { status: 400 });
    }
    console.error("Delete account error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}








import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.redirect(new URL("/verify-email?error=missing", request.url));

  try {
    const user = await prisma.user.findFirst({ where: { emailVerifyToken: token } });
    if (!user) return NextResponse.redirect(new URL("/verify-email?error=invalid", request.url));

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, emailVerifyToken: null },
    });

    return NextResponse.redirect(new URL("/verify-email?success=1", request.url));
  } catch {
    return NextResponse.redirect(new URL("/verify-email?error=server", request.url));
  }
}

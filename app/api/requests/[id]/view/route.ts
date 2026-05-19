import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/middleware";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth()(req);
  if ("error" in authResult) return authResult.error;
  if (authResult.user.role !== "COMPANY") return NextResponse.json({ error: "Company only" }, { status: 403 });

  const { id } = await params;

  await prisma.request.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });

  return NextResponse.json({ ok: true });
}

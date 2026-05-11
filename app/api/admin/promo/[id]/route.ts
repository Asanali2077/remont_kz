import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/middleware";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin()(request);
  if ("error" in authResult) return authResult.error;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const promo = await prisma.promoCode.update({
    where: { id },
    data: { isActive: body.isActive ?? false },
  });
  return NextResponse.json(promo);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin()(request);
  if ("error" in authResult) return authResult.error;

  const { id } = await params;
  await prisma.promoCode.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

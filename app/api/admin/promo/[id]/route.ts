import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/middleware";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdmin()(request);
    if ("error" in authResult) return authResult.error;

    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const existing = await prisma.promoCode.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const promo = await prisma.promoCode.update({
      where: { id },
      data: { isActive: body.isActive ?? false },
    });
    return NextResponse.json(promo);
  } catch (error) {
    console.error("Admin PATCH promo error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdmin()(request);
    if ("error" in authResult) return authResult.error;

    const { id } = await params;

    const existing = await prisma.promoCode.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.promoCode.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin DELETE promo error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

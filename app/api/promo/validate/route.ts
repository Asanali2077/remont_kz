import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/middleware";

const schema = z.object({ code: z.string().min(1) });

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth()(request);
    if ("error" in authResult) return authResult.error;

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    const promo = await prisma.promoCode.findUnique({
      where: { code: parsed.data.code.toUpperCase() },
    });

    if (!promo || !promo.isActive) {
      return NextResponse.json({ error: "Invalid or inactive promo code" }, { status: 404 });
    }
    if (promo.expiresAt && promo.expiresAt < new Date()) {
      return NextResponse.json({ error: "Promo code has expired" }, { status: 410 });
    }
    if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
      return NextResponse.json({ error: "Promo code usage limit reached" }, { status: 410 });
    }

    return NextResponse.json({ id: promo.id, code: promo.code, discount: promo.discount });
  } catch (error) {
    console.error("POST promo validate error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

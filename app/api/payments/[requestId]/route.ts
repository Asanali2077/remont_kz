import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireClient } from "@/lib/middleware";

export async function GET(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const authResult = await requireClient()(request);
    if ("error" in authResult) return authResult.error;

    const req = await prisma.request.findUnique({
      where: { id: params.requestId },
      select: { clientId: true },
    });
    if (!req) return NextResponse.json({ error: "Request not found" }, { status: 404 });
    if (req.clientId !== authResult.user.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const payment = await prisma.payment.findUnique({
      where: { requestId: params.requestId },
    });
    return NextResponse.json(payment ?? null);
  } catch (error) {
    console.error("GET payment error", { requestId: params.requestId, error });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const authResult = await requireClient()(request);
    if ("error" in authResult) return authResult.error;

    const req = await prisma.request.findUnique({
      where: { id: params.requestId },
      include: { offers: { where: { status: "ACCEPTED" }, take: 1 } },
    });
    if (!req) return NextResponse.json({ error: "Request not found" }, { status: 404 });
    if (req.clientId !== authResult.user.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (req.status !== "IN_PROGRESS" && req.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Payment is only available for in-progress or completed requests" },
        { status: 400 }
      );
    }

    const existing = await prisma.payment.findUnique({ where: { requestId: params.requestId } });
    if (existing) {
      return NextResponse.json({ error: "Payment already exists for this request" }, { status: 409 });
    }

    const amount = req.offers[0]?.price ?? req.budgetTo ?? req.budgetFrom;
    if (!amount) {
      return NextResponse.json(
        { error: "Cannot determine payment amount. Please set a budget or accept an offer first." },
        { status: 422 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const promoCodeInput = typeof body.promoCode === "string" ? body.promoCode.toUpperCase() : null;

    let discountAmount = 0;
    let promoCodeId: string | null = null;

    if (promoCodeInput) {
      const promo = await prisma.promoCode.findUnique({ where: { code: promoCodeInput } });
      if (
        promo &&
        promo.isActive &&
        (!promo.expiresAt || promo.expiresAt > new Date()) &&
        (promo.maxUses === null || promo.usedCount < promo.maxUses)
      ) {
        discountAmount = Math.round((amount * promo.discount) / 100);
        promoCodeId = promo.id;
        await prisma.promoCode.update({
          where: { id: promo.id },
          data: { usedCount: { increment: 1 } },
        });
      }
    }

    const payment = await prisma.payment.create({
      data: { requestId: params.requestId, clientId: authResult.user.userId, amount, discountAmount, promoCodeId },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("POST payment error", { requestId: params.requestId, error });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

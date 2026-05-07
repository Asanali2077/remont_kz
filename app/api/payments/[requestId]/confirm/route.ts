import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireClient } from "@/lib/middleware";

const confirmSchema = z.object({
  method: z.enum(["card", "kaspi", "transfer"]).default("card"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const authResult = await requireClient()(request);
    if ("error" in authResult) return authResult.error;

    const payment = await prisma.payment.findUnique({
      where: { requestId: params.requestId },
      include: { request: { select: { clientId: true } } },
    });
    if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    if (payment.request.clientId !== authResult.user.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (payment.status === "PAID") {
      return NextResponse.json({ error: "Already paid" }, { status: 409 });
    }

    const body = await request.json().catch(() => ({}));
    const parsed = confirmSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation error", details: parsed.error.flatten() }, { status: 400 });
    }

    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "PAID", method: parsed.data.method, paidAt: new Date() },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("POST payment confirm error", { requestId: params.requestId, error });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireClient } from "@/lib/middleware";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireClient()(request);
    if ("error" in authResult) return authResult.error;

    const payments = await prisma.payment.findMany({
      where: { clientId: authResult.user.userId },
      include: {
        request: {
          select: {
            id: true, description: true, category: true,
            service: { select: { id: true, name: true } },
            company: { select: { id: true, name: true } },
          },
        },
        promoCode: { select: { code: true, discount: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("GET payments list error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

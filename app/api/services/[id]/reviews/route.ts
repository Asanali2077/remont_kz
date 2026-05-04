import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviews = await prisma.request.findMany({
      where: {
        serviceId: params.id,
        status: "COMPLETED",
        rating: { not: null },
      },
      select: {
        id: true,
        rating: true,
        review: true,
        companyReply: true,
        createdAt: true,
        client: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Get reviews error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

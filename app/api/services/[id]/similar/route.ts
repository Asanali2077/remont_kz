import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const service = await prisma.service.findUnique({
      where: { id: params.id },
      select: { category: true, city: true },
    });

    if (!service) return NextResponse.json([], { status: 200 });

    const similar = await prisma.service.findMany({
      where: {
        id: { not: params.id },
        category: service.category,
        active: true,
      },
      include: {
        images: { orderBy: { order: "asc" }, take: 1 },
        company: { select: { id: true, name: true, email: true, phone: true } },
        _count: { select: { requests: true } },
      },
      orderBy: [
        { city: service.city ? "asc" : "desc" },
        { rating: "desc" },
      ],
      take: 4,
    });

    return NextResponse.json(similar);
  } catch (error) {
    console.error("Similar services error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

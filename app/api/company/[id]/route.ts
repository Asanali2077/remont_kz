import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const company = await prisma.user.findFirst({
      where: { id: params.id, role: "COMPANY" },
      select: {
        id: true, name: true, email: true, phone: true,
        avatarUrl: true, address: true, createdAt: true,
        services: {
          where: { active: true },
          include: {
            images: { orderBy: { order: "asc" }, take: 1 },
            _count: { select: { requests: true } },
          },
          orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
        },
        companyRequests: {
          where: { status: "COMPLETED", rating: { not: null } },
          select: {
            id: true, rating: true, review: true, companyReply: true,
            createdAt: true,
            client: { select: { name: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });

    const ratings = company.companyRequests.map(r => r.rating!).filter(Boolean);
    const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
    const completedCount = company.companyRequests.length;

    return NextResponse.json({ ...company, avgRating, completedCount });
  } catch (error) {
    console.error("Company profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

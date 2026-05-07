import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin()(request);
  if ("error" in authResult) return authResult.error;

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const active = searchParams.get("active");
  const search = searchParams.get("search");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = 20;

  const where: Record<string, unknown> = {};
  if (category) where.category = category.toUpperCase();
  if (active === "true") where.active = true;
  if (active === "false") where.active = false;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { company: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [services, total] = await Promise.all([
    prisma.service.findMany({
      where,
      select: {
        id: true,
        name: true,
        category: true,
        active: true,
        city: true,
        priceFrom: true,
        priceTo: true,
        rating: true,
        createdAt: true,
        company: { select: { id: true, name: true, email: true } },
        _count: { select: { requests: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.service.count({ where }),
  ]);

  return NextResponse.json({ services, total, page, pages: Math.ceil(total / limit) });
}

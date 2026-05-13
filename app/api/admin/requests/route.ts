import { NextRequest, NextResponse } from "next/server";
import { RequestStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/middleware";
import { prisma } from "@/lib/db";

const VALID_STATUSES = new Set(Object.values(RequestStatus));

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin()(request);
    if ("error" in authResult) return authResult.error;

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = 20;

    const where: Record<string, unknown> = {};
    if (statusParam) {
      const upperStatus = statusParam.toUpperCase();
      if (!VALID_STATUSES.has(upperStatus as RequestStatus)) {
        return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
      }
      where.status = upperStatus;
    }

    const [requests, total] = await Promise.all([
      prisma.request.findMany({
        where,
        select: {
          id: true, description: true, category: true, city: true,
          status: true, budgetFrom: true, budgetTo: true,
          createdAt: true, expiresAt: true,
          client: { select: { id: true, name: true, email: true } },
          company: { select: { id: true, name: true, email: true } },
          _count: { select: { offers: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.request.count({ where }),
    ]);

    return NextResponse.json({ requests, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Admin requests error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

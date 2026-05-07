import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/middleware";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin()(request);
    if ("error" in authResult) return authResult.error;

    const { searchParams } = new URL(request.url);
    const entity = searchParams.get("entity");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = 50;

    const where = entity ? { entity } : {};

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { actor: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json({ logs, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Admin audit log error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

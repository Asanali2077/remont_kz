import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin()(request);
  if ("error" in authResult) return authResult.error;

  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");
  const blocked = searchParams.get("blocked");
  const search = searchParams.get("search");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = 20;

  const where: Record<string, unknown> = { NOT: { role: "ADMIN" } };
  if (role === "client") where.role = "CLIENT";
  else if (role === "company") where.role = "COMPANY";
  if (blocked === "true") where.isBlocked = true;
  if (blocked === "false") where.isBlocked = false;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        phone: true,
        avatarUrl: true,
        emailVerified: true,
        isBlocked: true,
        blockReason: true,
        isVerified: true,
        lastActiveAt: true,
        createdAt: true,
        _count: { select: { clientRequests: true, services: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({ users, total, page, pages: Math.ceil(total / limit) });
}

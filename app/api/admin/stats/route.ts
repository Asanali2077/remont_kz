import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin()(request);
    if ("error" in authResult) return authResult.error;

    const [
      totalUsers, totalClients, totalCompanies,
      totalServices, activeServices,
      totalRequests, completedRequests, newRequests, blockedUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "CLIENT" } }),
      prisma.user.count({ where: { role: "COMPANY" } }),
      prisma.service.count(),
      prisma.service.count({ where: { active: true } }),
      prisma.request.count(),
      prisma.request.count({ where: { status: "COMPLETED" } }),
      prisma.request.count({ where: { status: "NEW" } }),
      prisma.user.count({ where: { isBlocked: true } }),
    ]);

    return NextResponse.json({
      users: { total: totalUsers, clients: totalClients, companies: totalCompanies, blocked: blockedUsers },
      services: { total: totalServices, active: activeServices },
      requests: { total: totalRequests, completed: completedRequests, new: newRequests },
    });
  } catch (error) {
    console.error("Admin stats error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

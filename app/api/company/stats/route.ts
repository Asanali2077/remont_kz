import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireCompany } from "@/lib/middleware";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireCompany()(request);
    if ("error" in authResult) return authResult.error;

    const companyId = authResult.user.userId;

    const [services, requests] = await Promise.all([
      prisma.service.findMany({
        where: { companyId },
        select: { id: true, rating: true },
      }),
      prisma.request.findMany({
        where: {
          OR: [
            { companyId },
            { service: { companyId } },
          ],
        },
        select: {
          status: true,
          createdAt: true,
          companyId: true,
          offers: {
            where: { companyId },
            select: { price: true },
          },
        },
      }),
    ]);

    const totalServices = services.length;
    const totalRequests = requests.length;

    const byStatus = {
      new: requests.filter((r) => r.status === "NEW").length,
      accepted: requests.filter((r) => r.status === "ACCEPTED").length,
      in_progress: requests.filter((r) => r.status === "IN_PROGRESS").length,
      completed: requests.filter((r) => r.status === "COMPLETED").length,
    };

    const ratings = services
      .filter((s) => s.rating !== null && s.rating !== undefined)
      .map((s) => s.rating as number);
    const avgRating =
      ratings.length > 0
        ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
        : null;

    /* Revenue: sum of offer prices on requests assigned to this company */
    const revenue = requests.reduce((sum, r) => {
      const offer = r.offers[0];
      if (
        offer &&
        r.companyId === companyId &&
        ["ACCEPTED", "IN_PROGRESS", "COMPLETED"].includes(r.status)
      ) {
        return sum + offer.price;
      }
      return sum;
    }, 0);

    /* Requests received in the last 30 days, grouped by day */
    const now = new Date();
    const byDay: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      byDay[d.toISOString().slice(0, 10)] = 0;
    }
    for (const r of requests) {
      const key = new Date(r.createdAt).toISOString().slice(0, 10);
      if (key in byDay) byDay[key]++;
    }
    const requestsByDay = Object.entries(byDay).map(([date, count]) => ({ date, count }));

    return NextResponse.json({
      totalServices,
      totalRequests,
      byStatus,
      avgRating,
      revenue,
      requestsByDay,
    });
  } catch (error) {
    console.error("Company stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

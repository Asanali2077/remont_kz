import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireCompany } from "@/lib/middleware";
import { RequestStatus, Prisma, ServiceCategory } from "@prisma/client";

// GET /api/analytics - Get analytics data (Company only)
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireCompany()(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { user } = authResult;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const category = searchParams.get("category");
    const city = searchParams.get("city");

    const dateFilter: Prisma.DateTimeFilter = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    // Total services
    const totalServices = await prisma.service.count({
      where: {
        companyId: user.userId,
        ...(category && { category: category.toUpperCase() as ServiceCategory }),
        ...(city && { city }),
      },
    });

    // Requests statistics
    const requestWhere: Prisma.RequestWhereInput = {
      companyId: user.userId,
      ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
    };

    const [completedRequests, pendingRequests] = await Promise.all([
      prisma.request.count({
        where: {
          ...requestWhere,
          status: RequestStatus.COMPLETED,
        },
      }),
      prisma.request.count({
        where: {
          ...requestWhere,
          status: { in: [RequestStatus.NEW, RequestStatus.IN_PROGRESS] },
        },
      }),
    ]);

    // Revenue calculation (simplified - in production, track actual payments)
    // For now, we'll calculate based on completed requests and average service prices
    const completedRequestsCount = await prisma.request.count({
      where: {
        ...requestWhere,
        status: RequestStatus.COMPLETED,
      },
    });

    const avgPrice = await prisma.service.aggregate({
      where: {
        companyId: user.userId,
      },
      _avg: {
        priceTo: true,
      },
    });

    const estimatedRevenue = Math.round((avgPrice._avg.priceTo || 0) * completedRequestsCount);

    // Requests by status
    const requestsByStatus = await prisma.request.groupBy({
      by: ["status"],
      where: requestWhere,
      _count: {
        id: true,
      },
    });

    // Requests by service
    const requestsByService = await prisma.request.groupBy({
      by: ["serviceId"],
      where: requestWhere,
      _count: {
        id: true,
      },
    });

    const serviceIds = requestsByService.map((r) => r.serviceId);
    const services = await prisma.service.findMany({
      where: {
        id: { in: serviceIds },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const requestsByServiceWithNames = requestsByService.map((r) => {
      const service = services.find((s) => s.id === r.serviceId);
      return {
        serviceName: service?.name || "Unknown",
        count: r._count.id,
      };
    });

    // Revenue by month (last 6 months)
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(date);
    }

    const revenueByMonth = await Promise.all(
      months.map(async (month) => {
        const nextMonth = new Date(month);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        const count = await prisma.request.count({
          where: {
            ...requestWhere,
            status: RequestStatus.COMPLETED,
            createdAt: {
              gte: month,
              lt: nextMonth,
            },
          },
        });

        // Simplified revenue calculation (average service price * count)
        const avgPrice = await prisma.service.aggregate({
          where: {
            companyId: user.userId,
          },
          _avg: {
            priceTo: true,
          },
        });

        return {
          month: month.toLocaleDateString("ru-RU", { month: "short" }),
          revenue: Math.round((avgPrice._avg.priceTo || 0) * count),
        };
      })
    );

    // Requests by city
    const requestsByCity = await prisma.request.groupBy({
      by: ["serviceId"],
      where: requestWhere,
      _count: {
        id: true,
      },
    });

    const cityData = await prisma.service.findMany({
      where: {
        id: { in: requestsByCity.map((r) => r.serviceId) },
        city: { not: null },
      },
      select: {
        city: true,
      },
    });

    const cityCounts: Record<string, number> = {};
    requestsByCity.forEach((r, index) => {
      const city = cityData[index]?.city;
      if (city) {
        cityCounts[city] = (cityCounts[city] || 0) + r._count.id;
      }
    });

    const requestsByCityFormatted = Object.entries(cityCounts).map(([city, count]) => ({
      city,
      count,
    }));

    return NextResponse.json({
      totalServices,
      completedRequests,
      pendingRequests,
      revenue: estimatedRevenue,
      requestsByStatus: requestsByStatus.map((r) => ({
        status: r.status.toLowerCase(),
        count: r._count.id,
      })),
      requestsByService: requestsByServiceWithNames,
      revenueByMonth,
      requestsByCity: requestsByCityFormatted,
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


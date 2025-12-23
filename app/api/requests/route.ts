import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAuth, requireClient } from "@/lib/middleware";
import { RequestStatus, Prisma } from "@prisma/client";

const createRequestSchema = z.object({
  serviceId: z.string().uuid("Invalid service ID"),
  message: z.string().min(1, "Message is required"),
});

// GET /api/requests - List requests (filtered by role)
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth()(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { user } = authResult;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const serviceId = searchParams.get("serviceId");

    const where: Prisma.RequestWhereInput = {};

    // Filter by role
    if (user.role === "CLIENT") {
      where.clientId = user.userId;
    } else if (user.role === "COMPANY") {
      where.companyId = user.userId;
    }

    if (status) {
      where.status = status.toUpperCase() as RequestStatus;
    }
    if (serviceId) {
      where.serviceId = serviceId;
    }

    const requests = await prisma.request.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Get requests error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/requests - Create request (Client only)
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireClient()(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { user } = authResult;
    const body = await request.json();
    const validatedData = createRequestSchema.parse(body);

    // Check if service exists
    const service = await prisma.service.findUnique({
      where: { id: validatedData.serviceId },
      include: {
        company: true,
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    if (!service.active) {
      return NextResponse.json(
        { error: "Service is not active" },
        { status: 400 }
      );
    }

    // Create request
    const newRequest = await prisma.request.create({
      data: {
        clientId: user.userId,
        serviceId: validatedData.serviceId,
        companyId: service.companyId,
        message: validatedData.message,
        status: RequestStatus.NEW,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Create request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


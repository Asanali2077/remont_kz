import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireCompany } from "@/lib/middleware";
import { ServiceCategory, Prisma } from "@prisma/client";

const serviceCategories = ["automobiles", "real-estate", "other"] as const;

const updateServiceSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.enum(serviceCategories).optional(),
  description: z.string().min(1).optional(),
  priceFrom: z.number().positive().optional(),
  priceTo: z.number().positive().optional(),
  city: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  licensed: z.boolean().optional(),
  availabilityDays: z.number().int().positive().optional(),
  urgency: z.enum(["low", "medium", "high"]).optional(),
  tags: z.array(z.string()).optional(),
  customAttributes: z.record(z.string(), z.string()).optional(),
  active: z.boolean().optional(),
});

// GET /api/services/[id] - Get single service
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const service = await prisma.service.findUnique({
      where: { id: params.id },
      include: {
        images: {
          orderBy: { order: "asc" },
        },
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        reviews: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            requests: true,
            reviews: true,
          },
        },
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error("Get service error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/services/[id] - Update service (Company only, owner only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireCompany()(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { user } = authResult;
    const body = await request.json();
    const validatedData = updateServiceSchema.parse(body);

    // Check if service exists and belongs to user
    const existingService = await prisma.service.findUnique({
      where: { id: params.id },
    });

    if (!existingService) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    if (existingService.companyId !== user.userId) {
      return NextResponse.json(
        { error: "Forbidden: You can only update your own services" },
        { status: 403 }
      );
    }

    // Validate price range if both are provided
    if (validatedData.priceFrom && validatedData.priceTo) {
      if (validatedData.priceFrom > validatedData.priceTo) {
        return NextResponse.json(
          { error: "priceFrom must be less than or equal to priceTo" },
          { status: 400 }
        );
      }
    }

    const updateData: Prisma.ServiceUpdateInput = {};
    if (validatedData.name) updateData.name = validatedData.name;
    if (validatedData.category) updateData.category = validatedData.category.toUpperCase() as ServiceCategory;
    if (validatedData.description) updateData.description = validatedData.description;
    if (validatedData.priceFrom !== undefined) updateData.priceFrom = validatedData.priceFrom;
    if (validatedData.priceTo !== undefined) updateData.priceTo = validatedData.priceTo;
    if (validatedData.city !== undefined) updateData.city = validatedData.city;
    if (validatedData.rating !== undefined) updateData.rating = validatedData.rating;
    if (validatedData.licensed !== undefined) updateData.licensed = validatedData.licensed;
    if (validatedData.availabilityDays !== undefined) updateData.availabilityDays = validatedData.availabilityDays;
    if (validatedData.urgency !== undefined) updateData.urgency = validatedData.urgency;
    if (validatedData.tags !== undefined) updateData.tags = validatedData.tags;
    if (validatedData.customAttributes !== undefined)
      updateData.customAttributes = validatedData.customAttributes as Prisma.InputJsonValue;
    if (validatedData.active !== undefined) updateData.active = validatedData.active;

    const service = await prisma.service.update({
      where: { id: params.id },
      data: updateData,
      include: {
        images: {
          orderBy: { order: "asc" },
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

    return NextResponse.json(service);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Update service error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/services/[id] - Delete service (Company only, owner only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireCompany()(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { user } = authResult;

    // Check if service exists and belongs to user
    const existingService = await prisma.service.findUnique({
      where: { id: params.id },
    });

    if (!existingService) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    if (existingService.companyId !== user.userId) {
      return NextResponse.json(
        { error: "Forbidden: You can only delete your own services" },
        { status: 403 }
      );
    }

    await prisma.service.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Delete service error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


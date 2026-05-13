import { NextRequest, NextResponse } from "next/server";
import { Prisma, ServiceCategory } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireCompany } from "@/lib/middleware";
import { geocodeAddress } from "@/lib/geocode";

const serviceCategories = [
  "automobiles", "real-estate", "plumbing", "electrical",
  "painting", "cleaning", "renovation", "welding", "roofing", "other",
] as const;

const categoryMap: Record<(typeof serviceCategories)[number], ServiceCategory> = {
  automobiles:  ServiceCategory.AUTOMOBILES,
  "real-estate":ServiceCategory.REAL_ESTATE,
  plumbing:     ServiceCategory.PLUMBING,
  electrical:   ServiceCategory.ELECTRICAL,
  painting:     ServiceCategory.PAINTING,
  cleaning:     ServiceCategory.CLEANING,
  renovation:   ServiceCategory.RENOVATION,
  welding:      ServiceCategory.WELDING,
  roofing:      ServiceCategory.ROOFING,
  other:        ServiceCategory.OTHER,
};

const updateServiceSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.enum(serviceCategories).optional(),
  description: z.string().min(1).optional(),
  priceFrom: z.number().positive().optional(),
  priceTo: z.number().positive().optional(),
  city: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  licensed: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  customAttributes: z.record(z.string(), z.string()).optional(),
  active: z.boolean().optional(),
  address: z.string().optional(),
  imageUrls: z.array(z.string()).max(10).optional(),
  startDate: z.string().datetime({ offset: true }).optional().nullable(),
  endDate: z.string().datetime({ offset: true }).optional().nullable(),
  imageUrl: z.union([z.string().min(1), z.literal(""), z.null()]).optional(),
});

export async function GET(
  _request: NextRequest,
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
            isVerified: true,
          },
        },
        _count: {
          select: {
            requests: true,
          },
        },
      },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error("Get service error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireCompany()(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const existingService = await prisma.service.findUnique({
      where: { id: params.id },
    });

    if (!existingService) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    if (existingService.companyId !== authResult.user.userId) {
      return NextResponse.json(
        { error: "Forbidden: You can only update your own services" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateServiceSchema.parse(body);

    const nextPriceFrom = validatedData.priceFrom ?? existingService.priceFrom;
    const nextPriceTo = validatedData.priceTo ?? existingService.priceTo;

    if (nextPriceFrom > nextPriceTo) {
      return NextResponse.json(
        { error: "priceFrom must be less than or equal to priceTo" },
        { status: 400 }
      );
    }

    const updateData: Prisma.ServiceUpdateInput = {};

    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.category !== undefined) {
      updateData.category = categoryMap[validatedData.category];
    }
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.priceFrom !== undefined) updateData.priceFrom = validatedData.priceFrom;
    if (validatedData.priceTo !== undefined) updateData.priceTo = validatedData.priceTo;
    if (validatedData.city !== undefined) updateData.city = validatedData.city;
    if (validatedData.rating !== undefined) updateData.rating = validatedData.rating;
    if (validatedData.licensed !== undefined) updateData.licensed = validatedData.licensed;
    if (validatedData.tags !== undefined) updateData.tags = validatedData.tags;
    if (validatedData.customAttributes !== undefined) {
      updateData.customAttributes = validatedData.customAttributes as Prisma.InputJsonValue;
    }
    if (validatedData.active !== undefined) updateData.active = validatedData.active;
    if (validatedData.startDate !== undefined) updateData.startDate = validatedData.startDate ? new Date(validatedData.startDate) : null;
    if (validatedData.endDate !== undefined) updateData.endDate = validatedData.endDate ? new Date(validatedData.endDate) : null;
    if (validatedData.address !== undefined) {
      updateData.address = validatedData.address || null;
      if (validatedData.address) {
        const geocoded = await geocodeAddress(validatedData.address);
        updateData.lat = geocoded?.lat ?? null;
        updateData.lng = geocoded?.lng ?? null;
      } else {
        updateData.lat = null;
        updateData.lng = null;
      }
    }
    if (validatedData.imageUrls !== undefined) {
      updateData.images = {
        deleteMany: {},
        ...(validatedData.imageUrls.length
          ? { create: validatedData.imageUrls.map((url, order) => ({ url, order })) }
          : {}),
      };
    }

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
            phone: true,
            isVerified: true,
          },
        },
        _count: {
          select: {
            requests: true,
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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireCompany()(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const existingService = await prisma.service.findUnique({
      where: { id: params.id },
    });

    if (!existingService) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    if (existingService.companyId !== authResult.user.userId) {
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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireCompany } from "@/lib/middleware";
import { ServiceCategory, Prisma } from "@prisma/client";

const serviceCategories = ["automobiles", "real-estate", "other"] as const;

const createServiceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.enum(serviceCategories),
  description: z.string().min(1, "Description is required"),
  priceFrom: z.number().positive("Price must be positive"),
  priceTo: z.number().positive("Price must be positive"),
  city: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  licensed: z.boolean().optional(),
  availabilityDays: z.number().int().positive().optional(),
  urgency: z.enum(["low", "medium", "high"]).optional(),
  tags: z.array(z.string()).optional(),
  customAttributes: z.record(z.string(), z.string()).optional(),
  active: z.boolean().optional().default(true),
});

// GET /api/services - List services (public or filtered by company)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");
    const category = searchParams.get("category");
    const city = searchParams.get("city");
    const active = searchParams.get("active");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const minRating = searchParams.get("minRating");
    const licensed = searchParams.get("licensed");
    const tags = searchParams.get("tags");

    const where: Prisma.ServiceWhereInput = {};

    if (companyId) where.companyId = companyId;
    if (category) where.category = category.toUpperCase() as ServiceCategory;
    if (city) where.city = city;
    if (active !== null) where.active = active === "true";
    if (minPrice) where.priceFrom = { gte: parseFloat(minPrice) };
    if (maxPrice) where.priceTo = { lte: parseFloat(maxPrice) };
    if (minRating) where.rating = { gte: parseFloat(minRating) };
    if (licensed === "true") where.licensed = true;
    if (tags) {
      const tagArray = tags.split(",");
      where.tags = { hasSome: tagArray };
    }

    const services = await prisma.service.findMany({
      where,
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
        _count: {
          select: {
            requests: true,
            reviews: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("Get services error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/services - Create service (Company only)
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireCompany()(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { user } = authResult;
    const body = await request.json();
    const validatedData = createServiceSchema.parse(body);

    // Validate price range
    if (validatedData.priceFrom > validatedData.priceTo) {
      return NextResponse.json(
        { error: "priceFrom must be less than or equal to priceTo" },
        { status: 400 }
      );
    }

    const service = await prisma.service.create({
      data: {
        name: validatedData.name,
        category: validatedData.category.toUpperCase() as ServiceCategory,
        description: validatedData.description,
        priceFrom: validatedData.priceFrom,
        priceTo: validatedData.priceTo,
        city: validatedData.city,
        rating: validatedData.rating,
        licensed: validatedData.licensed ?? false,
        availabilityDays: validatedData.availabilityDays,
        urgency: validatedData.urgency,
        tags: validatedData.tags || [],
        customAttributes: (validatedData.customAttributes || {}) as Prisma.InputJsonValue,
        active: validatedData.active,
        companyId: user.userId,
      },
      include: {
        images: true,
        company: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Create service error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


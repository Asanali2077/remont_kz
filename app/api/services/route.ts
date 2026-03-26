import { NextRequest, NextResponse } from "next/server";
import { Prisma, ServiceCategory } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireCompany } from "@/lib/middleware";

const serviceCategories = ["automobiles", "real-estate", "other"] as const;
const urgencyLevels = ["low", "medium", "high"] as const;

const categoryMap: Record<(typeof serviceCategories)[number], ServiceCategory> = {
  automobiles: ServiceCategory.AUTOMOBILES,
  "real-estate": ServiceCategory.REAL_ESTATE,
  other: ServiceCategory.OTHER,
};

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
  urgency: z.enum(urgencyLevels).optional(),
  tags: z.array(z.string()).optional(),
  customAttributes: z.record(z.string(), z.string()).optional(),
  active: z.boolean().optional().default(true),
  imageUrl: z.union([z.string().url("Image URL must be a valid URL"), z.literal(""), z.null()]).optional(),
});

function toPrismaCategory(category: string | null): ServiceCategory | null {
  if (!category) {
    return null;
  }

  return categoryMap[category as keyof typeof categoryMap] ?? null;
}

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

    if (companyId) {
      where.companyId = companyId;
    }

    if (category) {
      const mappedCategory = toPrismaCategory(category);
      if (!mappedCategory) {
        return NextResponse.json({ error: "Invalid category" }, { status: 400 });
      }
      where.category = mappedCategory;
    }

    if (city) {
      where.city = city;
    }

    if (active !== null) {
      where.active = active === "true";
    } else if (!companyId) {
      where.active = true;
    }

    if (minPrice) {
      where.priceFrom = { gte: parseFloat(minPrice) };
    }

    if (maxPrice) {
      where.priceTo = { lte: parseFloat(maxPrice) };
    }

    if (minRating) {
      where.rating = { gte: parseFloat(minRating) };
    }

    if (licensed === "true") {
      where.licensed = true;
    }

    if (tags) {
      where.tags = { hasSome: tags.split(",").filter(Boolean) };
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
            phone: true,
          },
        },
        _count: {
          select: {
            requests: true,
          },
        },
      },
      orderBy: [{ active: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("Get services error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireCompany()(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const body = await request.json();
    const validatedData = createServiceSchema.parse(body);

    if (validatedData.priceFrom > validatedData.priceTo) {
      return NextResponse.json(
        { error: "priceFrom must be less than or equal to priceTo" },
        { status: 400 }
      );
    }

    const service = await prisma.service.create({
      data: {
        name: validatedData.name,
        category: categoryMap[validatedData.category],
        description: validatedData.description,
        priceFrom: validatedData.priceFrom,
        priceTo: validatedData.priceTo,
        city: validatedData.city,
        rating: validatedData.rating,
        licensed: validatedData.licensed ?? false,
        availabilityDays: validatedData.availabilityDays,
        urgency: validatedData.urgency,
        tags: validatedData.tags ?? [],
        customAttributes: validatedData.customAttributes as Prisma.InputJsonValue | undefined,
        active: validatedData.active,
        companyId: authResult.user.userId,
        images: validatedData.imageUrl
          ? {
              create: [
                {
                  url: validatedData.imageUrl,
                  order: 0,
                },
              ],
            }
          : undefined,
      },
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
        _count: {
          select: {
            requests: true,
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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

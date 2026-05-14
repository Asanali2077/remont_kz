import { NextRequest, NextResponse } from "next/server";
import { Prisma, ServiceCategory } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireCompany, assertEmailVerified } from "@/lib/middleware";
import { geocodeAddress } from "@/lib/geocode";
import { sanitizeText } from "@/lib/utils";

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

const createServiceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.enum(serviceCategories),
  description: z.string().min(1, "Description is required"),
  priceFrom: z.number().positive("Price must be positive"),
  priceTo: z.number().positive("Price must be positive"),
  city: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  licensed: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  customAttributes: z.record(z.string(), z.string()).optional(),
  active: z.boolean().optional().default(true),
  address: z.string().optional(),
  imageUrls: z.array(z.string()).max(10).optional(),
  startDate: z.string().datetime({ offset: true }).optional().nullable(),
  endDate: z.string().datetime({ offset: true }).optional().nullable(),
  schedule: z.string().optional().nullable(),
  imageUrl: z.union([z.string().min(1), z.literal(""), z.null()]).optional(),
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
    const hasPhotos = searchParams.get("hasPhotos");
    const search = searchParams.get("search");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const radiusKm = searchParams.get("radius"); // kilometres
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10)));

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

    if (hasPhotos === "true") {
      where.images = { some: {} };
    }

    if (search) {
      const q = search.trim();
      if (q) {
        // Postgres FTS with plainto_tsquery (handles multi-word, no special syntax needed)
        const ftsRows = await prisma.$queryRaw<{ id: string }[]>`
          SELECT s.id
          FROM "Service" s
          LEFT JOIN "User" u ON u.id = s."companyId"
          WHERE to_tsvector('simple',
            coalesce(s.name, '') || ' ' ||
            coalesce(s.description, '') || ' ' ||
            coalesce(s.city, '') || ' ' ||
            coalesce(u.name, '')
          ) @@ plainto_tsquery('simple', ${q})
          ORDER BY ts_rank(
            to_tsvector('simple',
              coalesce(s.name, '') || ' ' ||
              coalesce(s.description, '') || ' ' ||
              coalesce(s.city, '') || ' ' ||
              coalesce(u.name, '')
            ),
            plainto_tsquery('simple', ${q})
          ) DESC
        `;

        if (ftsRows.length > 0) {
          where.id = { in: ftsRows.map(r => r.id) };
        } else {
          // Fallback to LIKE if FTS returns nothing (e.g., single partial word)
          where.OR = [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { tags: { hasSome: [q] } },
            { company: { name: { contains: q, mode: "insensitive" } } },
            { city: { contains: q, mode: "insensitive" } },
          ];
        }
      }
    }

    // Radius search using Haversine formula (only when lat/lng/radius provided)
    if (lat && lng && radiusKm) {
      const latF = parseFloat(lat);
      const lngF = parseFloat(lng);
      const km = parseFloat(radiusKm);
      if (!isNaN(latF) && !isNaN(lngF) && !isNaN(km) && km > 0) {
        const nearbyRows = await prisma.$queryRaw<{ id: string }[]>`
          SELECT id FROM "Service"
          WHERE lat IS NOT NULL AND lng IS NOT NULL AND active = true
          AND (
            6371 * acos(
              cos(radians(${latF})) * cos(radians(lat)) *
              cos(radians(lng) - radians(${lngF})) +
              sin(radians(${latF})) * sin(radians(lat))
            )
          ) <= ${km}
        `;
        const nearbyIds = new Set(nearbyRows.map(r => r.id));
        // Intersect with any existing id filter from FTS
        if (where.id && typeof where.id === "object" && "in" in where.id) {
          where.id = { in: (where.id.in as string[]).filter(id => nearbyIds.has(id)) };
        } else {
          where.id = { in: [...nearbyIds] };
        }
      }
    }

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        include: {
          images: { orderBy: { order: "asc" } },
          company: { select: { id: true, name: true, email: true, phone: true, isVerified: true } },
          _count: { select: { requests: true } },
        },
        orderBy: [{ active: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.service.count({ where }),
    ]);

    // Return flat array for backward compat if no pagination params used
    const usedPagination = searchParams.has("page") || searchParams.has("limit");
    if (!usedPagination) return NextResponse.json(services);

    return NextResponse.json({
      data: services,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Get services error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireCompany()(request);
    if ("error" in authResult) return authResult.error;

    try { await assertEmailVerified(authResult.user.userId); }
    catch { return NextResponse.json({ error: "Please verify your email before publishing services." }, { status: 403 }); }

    const body = await request.json();
    const validatedData = createServiceSchema.parse(body);

    if (validatedData.priceFrom > validatedData.priceTo) {
      return NextResponse.json(
        { error: "priceFrom must be less than or equal to priceTo" },
        { status: 400 }
      );
    }

    let geocoded: { lat: number; lng: number } | null = null;
    if (validatedData.address) {
      geocoded = await geocodeAddress(validatedData.address);
    }

    const service = await prisma.service.create({
      data: {
        name: validatedData.name,
        category: categoryMap[validatedData.category],
        description: sanitizeText(validatedData.description, 2000),
        priceFrom: validatedData.priceFrom,
        priceTo: validatedData.priceTo,
        city: validatedData.city,
        address: validatedData.address,
        lat: geocoded?.lat,
        lng: geocoded?.lng,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
        schedule: validatedData.schedule ?? undefined,
        rating: validatedData.rating,
        licensed: validatedData.licensed ?? false,
        tags: validatedData.tags ?? [],
        customAttributes: validatedData.customAttributes as Prisma.InputJsonValue | undefined,
        active: validatedData.active,
        companyId: authResult.user.userId,
        images: validatedData.imageUrls?.length
          ? { create: validatedData.imageUrls.map((url, order) => ({ url, order })) }
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

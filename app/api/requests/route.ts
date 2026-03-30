import { NextRequest, NextResponse } from "next/server";
import { Prisma, RequestStatus, ServiceCategory } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAuth, requireClient } from "@/lib/middleware";

const requestStatuses = ["new", "accepted", "in_progress", "completed"] as const;
const requestScopes = ["assigned", "unassigned", "all"] as const;
const serviceCategories = ["automobiles", "real-estate", "other"] as const;

const requestStatusMap: Record<(typeof requestStatuses)[number], RequestStatus> = {
  new: RequestStatus.NEW,
  accepted: RequestStatus.ACCEPTED,
  in_progress: RequestStatus.IN_PROGRESS,
  completed: RequestStatus.COMPLETED,
};

const categoryMap: Record<(typeof serviceCategories)[number], ServiceCategory> = {
  automobiles: ServiceCategory.AUTOMOBILES,
  "real-estate": ServiceCategory.REAL_ESTATE,
  other: ServiceCategory.OTHER,
};

const createRequestSchema = z
  .object({
    serviceId: z.string().uuid("Invalid service ID").optional(),
    companyId: z.string().uuid("Invalid company ID").nullable().optional(),
    description: z.string().min(1, "Description is required"),
    category: z.enum(serviceCategories).optional(),
    city: z.string().min(1, "City is required").optional(),
    imageUrl: z.string().min(1).optional(),
    budgetFrom: z.number().positive().optional(),
    budgetTo: z.number().positive().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.serviceId) {
      if (!data.category) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Category is required for a custom request",
          path: ["category"],
        });
      }

      if (!data.city) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "City is required for a custom request",
          path: ["city"],
        });
      }
    }
  });

function toRequestStatus(status: string | null): RequestStatus | null {
  if (!status) {
    return null;
  }

  return requestStatusMap[status as keyof typeof requestStatusMap] ?? null;
}

function toServiceCategory(category: string | null): ServiceCategory | null {
  if (!category) {
    return null;
  }

  return categoryMap[category as keyof typeof categoryMap] ?? null;
}

const requestInclude = {
  client: { select: { id: true, name: true, email: true, phone: true } },
  service: { select: { id: true, name: true, category: true, city: true } },
  company: { select: { id: true, name: true, email: true, phone: true } },
} as const;

function buildUnassignedCondition(
  companyCategories: ServiceCategory[],
  companyCities: string[],
  minPrice: number
): Prisma.RequestWhereInput {
  const now = new Date();
  const cityCondition: Prisma.RequestWhereInput =
    companyCities.length > 0
      ? { OR: [{ city: null }, { city: { in: companyCities } }] }
      : {};
  const budgetCondition: Prisma.RequestWhereInput =
    minPrice > 0
      ? { OR: [{ budgetTo: null }, { budgetTo: { gte: minPrice } }] }
      : {};

  return {
    companyId: null,
    category: { in: companyCategories },
    OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    AND: [cityCondition, budgetCondition].filter(
      (c) => Object.keys(c).length > 0
    ) as Prisma.RequestWhereInput[],
  };
}

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
    const category = searchParams.get("category");
    const city = searchParams.get("city");
    const scope = searchParams.get("scope");

    const where: Prisma.RequestWhereInput = {};

    if (user.role === "CLIENT") {
      where.clientId = user.userId;
    } else {
      const resolvedScope = (scope ?? "assigned") as (typeof requestScopes)[number];

      if (!requestScopes.includes(resolvedScope)) {
        return NextResponse.json({ error: "Invalid scope" }, { status: 400 });
      }

      if (resolvedScope === "assigned") {
        where.companyId = user.userId;
      } else {
        const companyServices = await prisma.service.findMany({
          where: { companyId: user.userId },
          select: { category: true, priceFrom: true, city: true },
        });

        const companyCategories = Array.from(new Set(companyServices.map((s) => s.category)));
        const companyCities = Array.from(new Set(companyServices.map((s) => s.city).filter((c): c is string => Boolean(c))));
        const minPrice = companyServices.length > 0
          ? Math.min(...companyServices.map((s) => s.priceFrom))
          : 0;

        if (resolvedScope === "unassigned") {
          Object.assign(where, buildUnassignedCondition(companyCategories, companyCities, minPrice));
        } else {
          where.OR = [
            { companyId: user.userId },
            buildUnassignedCondition(companyCategories, companyCities, minPrice),
          ];
        }
      }
    }

    if (status) {
      const mappedStatus = toRequestStatus(status);
      if (!mappedStatus) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      where.status = mappedStatus;
    }

    if (serviceId) {
      where.serviceId = serviceId;
    }

    if (category) {
      const mappedCategory = toServiceCategory(category);
      if (!mappedCategory) {
        return NextResponse.json({ error: "Invalid category" }, { status: 400 });
      }
      where.category = mappedCategory;
    }

    if (city) {
      where.city = city;
    }

    const isClient = user.role === "CLIENT";

    const requests = await prisma.request.findMany({
      where,
      include: {
        ...requestInclude,
        ...(isClient
          ? {
              offers: {
                include: { company: { select: { id: true, name: true, email: true, phone: true } } },
                orderBy: { createdAt: "asc" },
              },
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Get requests error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireClient()(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const body = await request.json();
    const validatedData = createRequestSchema.parse(body);

    let service = null;
    if (validatedData.serviceId) {
      service = await prisma.service.findUnique({
        where: { id: validatedData.serviceId },
      });

      if (!service) {
        return NextResponse.json({ error: "Service not found" }, { status: 404 });
      }

      if (!service.active) {
        return NextResponse.json({ error: "Service is not active" }, { status: 400 });
      }

      if (validatedData.companyId && validatedData.companyId !== service.companyId) {
        return NextResponse.json(
          { error: "companyId must match the selected service" },
          { status: 400 }
        );
      }
    }

    const isCustomRequest = !validatedData.serviceId;
    const expiresAt = isCustomRequest
      ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      : null;

    const createdRequest = await prisma.request.create({
      data: {
        clientId: authResult.user.userId,
        serviceId: service?.id ?? null,
        companyId: service?.companyId ?? validatedData.companyId ?? null,
        description: validatedData.description,
        category: service?.category ?? categoryMap[validatedData.category as keyof typeof categoryMap],
        city: validatedData.city ?? service?.city ?? null,
        imageUrl: validatedData.imageUrl,
        budgetFrom: validatedData.budgetFrom ?? null,
        budgetTo: validatedData.budgetTo ?? null,
        status: RequestStatus.NEW,
        expiresAt,
      },
      include: requestInclude,
    });

    return NextResponse.json(createdRequest, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Create request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

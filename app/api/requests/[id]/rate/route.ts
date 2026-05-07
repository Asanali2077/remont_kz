import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireClient } from "@/lib/middleware";

const rateSchema = z.object({
  rating: z.number().int().min(1).max(5),
  review: z.string().max(1000).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireClient()(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { id } = await params;
    const body = await request.json();
    const { rating, review } = rateSchema.parse(body);

    const existingRequest = await prisma.request.findUnique({
      where: { id },
    });

    if (!existingRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (existingRequest.clientId !== authResult.user.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (existingRequest.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Can only rate completed requests" },
        { status: 400 }
      );
    }

    if (existingRequest.rating !== null) {
      return NextResponse.json(
        { error: "Request already rated" },
        { status: 400 }
      );
    }

    const updated = await prisma.request.update({
      where: { id },
      data: { rating, ...(review ? { review } : {}) },
      include: {
        client: { select: { id: true, name: true, email: true, phone: true } },
        service: { select: { id: true, name: true, category: true, city: true } },
        company: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    // Recalculate company-wide rating — isolated so failure doesn't affect the response
    if (existingRequest.companyId) {
      try {
        const ratedRequests = await prisma.request.findMany({
          where: { companyId: existingRequest.companyId, rating: { not: null } },
          select: { rating: true },
        });
        const avg =
          ratedRequests.reduce((sum, r) => sum + (r.rating ?? 0), 0) /
          ratedRequests.length;
        await prisma.service.updateMany({
          where: { companyId: existingRequest.companyId },
          data: { rating: avg },
        });
      } catch (recalcError) {
        console.error("Rating recalculation failed (rating was saved)", recalcError);
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Rate request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireClient } from "@/lib/middleware";
import { RequestStatus } from "@prisma/client";

const acceptOfferSchema = z.object({
  companyId: z.string().uuid("Invalid company ID"),
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
    const { companyId } = acceptOfferSchema.parse(body);

    const existingRequest = await prisma.request.findUnique({
      where: { id },
    });

    if (!existingRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (existingRequest.clientId !== authResult.user.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (existingRequest.status !== RequestStatus.NEW) {
      return NextResponse.json(
        { error: "Can only accept offers on new requests" },
        { status: 400 }
      );
    }

    if (existingRequest.companyId !== null) {
      return NextResponse.json(
        { error: "Request already has an assigned company" },
        { status: 400 }
      );
    }

    const offer = await prisma.requestOffer.findUnique({
      where: {
        requestId_companyId: { requestId: id, companyId },
      },
    });

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    // Accept offer: assign company, move to ACCEPTED, delete all other offers
    // WHERE clause includes status=NEW to prevent race conditions (optimistic lock)
    const [updatedRequest] = await prisma.$transaction([
      prisma.request.update({
        where: { id, status: RequestStatus.NEW, companyId: null },
        data: {
          companyId,
          status: RequestStatus.ACCEPTED,
        },
        include: {
          client: { select: { id: true, name: true, email: true, phone: true } },
          service: { select: { id: true, name: true, category: true, city: true } },
          company: { select: { id: true, name: true, email: true, phone: true } },
          offers: {
            include: { company: { select: { id: true, name: true, email: true, phone: true } } },
          },
        },
      }),
      prisma.requestOffer.deleteMany({
        where: { requestId: id },
      }),
    ]);

    return NextResponse.json(updatedRequest);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Accept offer error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

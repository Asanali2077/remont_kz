import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireCompany } from "@/lib/middleware";
import { RequestStatus } from "@prisma/client";

const offerSchema = z.object({
  price: z.number().int().positive("Price must be a positive integer"),
  message: z.string().max(500).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireCompany()(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { id } = await params;
    const body = await request.json();
    const { price, message } = offerSchema.parse(body);

    const existingRequest = await prisma.request.findUnique({
      where: { id },
    });

    if (!existingRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (existingRequest.companyId !== null) {
      return NextResponse.json(
        { error: "Request is already assigned to a company" },
        { status: 400 }
      );
    }

    if (existingRequest.status !== RequestStatus.NEW) {
      return NextResponse.json(
        { error: "Can only respond to new requests" },
        { status: 400 }
      );
    }

    if (existingRequest.expiresAt && existingRequest.expiresAt < new Date()) {
      return NextResponse.json({ error: "Request has expired" }, { status: 400 });
    }

    const offer = await prisma.requestOffer.upsert({
      where: {
        requestId_companyId: {
          requestId: id,
          companyId: authResult.user.userId,
        },
      },
      create: {
        requestId: id,
        companyId: authResult.user.userId,
        price,
        message: message ?? null,
      },
      update: {
        price,
        message: message ?? null,
      },
      include: {
        company: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    return NextResponse.json(offer, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Create offer error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireCompany()(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { id } = await params;

    const offer = await prisma.requestOffer.findUnique({
      where: {
        requestId_companyId: {
          requestId: id,
          companyId: authResult.user.userId,
        },
      },
    });

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    await prisma.requestOffer.delete({
      where: {
        requestId_companyId: {
          requestId: id,
          companyId: authResult.user.userId,
        },
      },
    });

    return NextResponse.json({ message: "Offer withdrawn" });
  } catch (error) {
    console.error("Delete offer error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

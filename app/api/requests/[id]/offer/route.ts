import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireCompany, assertEmailVerified } from "@/lib/middleware";
import { RequestStatus } from "@prisma/client";
import { sendNewOfferEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

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
    if ("error" in authResult) return authResult.error;

    try { await assertEmailVerified(authResult.user.userId); }
    catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message === "Email not verified") {
        return NextResponse.json({ error: "Please verify your email before submitting offers." }, { status: 403 });
      }
      console.error("assertEmailVerified DB error", err);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    // 20 offers per hour per company
    const rl = rateLimit(`offer:${authResult.user.userId}`, 20, 60 * 60_000);
    if (!rl.allowed) return NextResponse.json({ error: "Too many offers. Try again later." }, { status: 429 });

    const { id } = await params;
    const body = await request.json();
    const { price, message } = offerSchema.parse(body);

    const existingRequest = await prisma.request.findUnique({
      where: { id },
      include: { service: { select: { companyId: true } } },
    });

    if (!existingRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (existingRequest.service?.companyId === authResult.user.userId) {
      return NextResponse.json({ error: "Cannot offer on your own service's request." }, { status: 403 });
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

    // Notify client about new offer (non-blocking)
    const reqWithClient = await prisma.request.findUnique({
      where: { id },
      select: { client: { select: { email: true, name: true } } },
    });
    if (reqWithClient?.client?.email) {
      void sendNewOfferEmail(
        reqWithClient.client.email,
        reqWithClient.client.name ?? "",
        offer.company?.name ?? "Company",
        price,
        "/my-requests"
      ).catch((err) => console.error("sendNewOfferEmail failed", { requestId: id, err }));
    }

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

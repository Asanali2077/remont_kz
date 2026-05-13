import { NextRequest, NextResponse } from "next/server";
import { Prisma, RequestStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAuth, requireClient, requireCompany } from "@/lib/middleware";
import { sendRequestAcceptedEmail, sendJobCompletedEmail } from "@/lib/email";

const requestStatuses = ["accepted", "in_progress", "completed", "cancelled"] as const;

const requestStatusMap: Record<(typeof requestStatuses)[number], RequestStatus> = {
  accepted: RequestStatus.ACCEPTED,
  in_progress: RequestStatus.IN_PROGRESS,
  completed: RequestStatus.COMPLETED,
  cancelled: RequestStatus.CANCELLED,
};

const updateRequestSchema = z.object({
  status: z.enum(requestStatuses),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth()(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const requestData = await prisma.request.findUnique({
      where: { id: params.id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        service: {
          include: {
            images: {
              orderBy: { order: "asc" },
            },
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            receiver: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!requestData) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (authResult.user.role === "CLIENT" && requestData.clientId !== authResult.user.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (
      authResult.user.role === "COMPANY" &&
      requestData.companyId !== null &&
      requestData.companyId !== authResult.user.userId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(requestData);
  } catch (error) {
    console.error("Get request error:", error);
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

    const existingRequest = await prisma.request.findUnique({
      where: { id: params.id },
    });

    if (!existingRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (existingRequest.companyId !== null && existingRequest.companyId !== authResult.user.userId) {
      return NextResponse.json(
        { error: "Forbidden: You can only update requests assigned to you" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateRequestSchema.parse(body);
    const nextStatus = requestStatusMap[validatedData.status];
    const updateData: Prisma.RequestUpdateInput = {};

    if (nextStatus === RequestStatus.ACCEPTED) {
      if (existingRequest.status !== RequestStatus.NEW) {
        return NextResponse.json(
          { error: "Only new requests can be accepted" },
          { status: 400 }
        );
      }

      if (existingRequest.companyId === null) {
        return NextResponse.json(
          { error: "Use the offer system for unassigned requests" },
          { status: 400 }
        );
      }

      updateData.company = { connect: { id: authResult.user.userId } };
      updateData.status = RequestStatus.ACCEPTED;
    }

    if (nextStatus === RequestStatus.IN_PROGRESS) {
      if (existingRequest.companyId !== authResult.user.userId) {
        return NextResponse.json(
          { error: "Accept the request before starting work" },
          { status: 400 }
        );
      }

      if (existingRequest.status !== RequestStatus.ACCEPTED) {
        return NextResponse.json(
          { error: "Only accepted requests can move to in progress" },
          { status: 400 }
        );
      }

      updateData.status = RequestStatus.IN_PROGRESS;
    }

    if (nextStatus === RequestStatus.COMPLETED) {
      if (existingRequest.companyId !== authResult.user.userId) {
        return NextResponse.json(
          { error: "Only the assigned company can complete the request" },
          { status: 400 }
        );
      }

      if (existingRequest.status !== RequestStatus.IN_PROGRESS) {
        return NextResponse.json(
          { error: "Only in-progress requests can be completed" },
          { status: 400 }
        );
      }

      updateData.status = RequestStatus.COMPLETED;
    }

    const updatedRequest = await prisma.request.update({
      where: { id: params.id },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            category: true,
            city: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // Send email notifications (non-blocking)
    if (nextStatus === RequestStatus.ACCEPTED && updatedRequest.client?.email) {
      void sendRequestAcceptedEmail(
        updatedRequest.client.email,
        updatedRequest.client.name ?? "",
        updatedRequest.company?.name ?? "Company",
        `/chat/${updatedRequest.id}`
      ).catch((err) => console.error("sendRequestAcceptedEmail failed", { requestId: updatedRequest.id, err }));
    }
    if (nextStatus === RequestStatus.COMPLETED && updatedRequest.client?.email) {
      void sendJobCompletedEmail(
        updatedRequest.client.email,
        updatedRequest.client.name ?? "",
        updatedRequest.company?.name ?? "Company",
        "/my-requests"
      ).catch((err) => console.error("sendJobCompletedEmail failed", { requestId: updatedRequest.id, err }));
    }

    return NextResponse.json(updatedRequest);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Update request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth()(request);
    if ("error" in authResult) return authResult.error;

    const { id } = params;

    if (authResult.user.role !== "CLIENT") {
      return NextResponse.json({ error: "Forbidden: Only clients can edit requests" }, { status: 403 });
    }

    const existing = await prisma.request.findUnique({
      where: { id },
      select: { clientId: true, status: true },
    });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (existing.clientId !== authResult.user.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (existing.status !== RequestStatus.NEW) {
      return NextResponse.json({ error: "Can only edit requests with status NEW" }, { status: 400 });
    }

    const editSchema = z.object({
      description: z.string().min(10).optional(),
      budgetFrom: z.number().positive().optional().nullable(),
      budgetTo: z.number().positive().optional().nullable(),
      city: z.string().optional(),
      deadline: z.string().datetime().optional().nullable(),
    });

    const body = await request.json().catch(() => ({}));
    const parsed = editSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation error", details: parsed.error.flatten() }, { status: 400 });
    }

    const offerCount = await prisma.requestOffer.count({ where: { requestId: id } });
    if (offerCount > 0) {
      await prisma.requestOffer.deleteMany({ where: { requestId: id } });
    }

    const updateData: Record<string, unknown> = {};
    if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
    if (parsed.data.budgetFrom !== undefined) updateData.budgetFrom = parsed.data.budgetFrom;
    if (parsed.data.budgetTo !== undefined) updateData.budgetTo = parsed.data.budgetTo;
    if (parsed.data.city !== undefined) updateData.city = parsed.data.city;
    if (parsed.data.deadline !== undefined) updateData.deadline = parsed.data.deadline ? new Date(parsed.data.deadline) : null;

    const updated = await prisma.request.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ ...updated, offersReset: offerCount > 0 });
  } catch (error) {
    console.error("Edit request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireClient()(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const existingRequest = await prisma.request.findUnique({
      where: { id: params.id },
    });

    if (!existingRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (existingRequest.clientId !== authResult.user.userId) {
      return NextResponse.json({ error: "Forbidden: You can only cancel your own requests" }, { status: 403 });
    }

    const cancellableStatuses: RequestStatus[] = [RequestStatus.NEW, RequestStatus.ACCEPTED, RequestStatus.IN_PROGRESS];
    if (!cancellableStatuses.includes(existingRequest.status)) {
      return NextResponse.json({ error: "Completed requests cannot be cancelled" }, { status: 400 });
    }

    // NEW requests: physically delete (nothing to keep)
    if (existingRequest.status === RequestStatus.NEW) {
      await prisma.request.delete({ where: { id: params.id } });
    } else {
      // ACCEPTED / IN_PROGRESS: mark as CANCELLED to preserve history
      await prisma.request.update({
        where: { id: params.id },
        data: { status: RequestStatus.CANCELLED, companyId: null },
      });
    }

    return NextResponse.json({ message: "Request cancelled" });
  } catch (error) {
    console.error("Delete request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

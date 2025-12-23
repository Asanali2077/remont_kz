import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/middleware";
import { MessageType, Prisma } from "@prisma/client";

const createMessageSchema = z.object({
  requestId: z.string().uuid().optional(),
  receiverId: z.string().uuid("Invalid receiver ID"),
  content: z.string().min(1, "Content is required"),
  type: z.enum(["text", "image", "audio"]).default("text"),
  imageUrl: z.string().url().optional(),
  audioUrl: z.string().url().optional(),
});

// GET /api/messages - List messages (conversations)
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth()(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { user } = authResult;
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get("requestId");
    const receiverId = searchParams.get("receiverId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const where: Prisma.MessageWhereInput = {
      OR: [
        { senderId: user.userId },
        { receiverId: user.userId },
      ],
    };

    if (requestId) {
      where.requestId = requestId;
    }
    if (receiverId) {
      where.OR = [
        {
          AND: [
            { senderId: user.userId },
            { receiverId },
          ],
        },
        {
          AND: [
            { senderId: receiverId },
            { receiverId: user.userId },
          ],
        },
      ];
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
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
          request: {
            select: {
              id: true,
              status: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip,
      }),
      prisma.message.count({ where }),
    ]);

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        ...where,
        receiverId: user.userId,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/messages - Send message
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth()(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { user } = authResult;
    const body = await request.json();
    const validatedData = createMessageSchema.parse(body);

    // Validate that user is not sending to themselves
    if (validatedData.receiverId === user.userId) {
      return NextResponse.json(
        { error: "Cannot send message to yourself" },
        { status: 400 }
      );
    }

    // If requestId is provided, verify it exists and user has access
    if (validatedData.requestId) {
      const requestData = await prisma.request.findUnique({
        where: { id: validatedData.requestId },
      });

      if (!requestData) {
        return NextResponse.json(
          { error: "Request not found" },
          { status: 404 }
        );
      }

      // Verify user is part of the request
      if (requestData.clientId !== user.userId && requestData.companyId !== user.userId) {
        return NextResponse.json(
          { error: "Forbidden: You are not part of this request" },
          { status: 403 }
        );
      }
    }

    // Validate type-specific fields
    if (validatedData.type === "image" && !validatedData.imageUrl) {
      return NextResponse.json(
        { error: "imageUrl is required for image messages" },
        { status: 400 }
      );
    }
    if (validatedData.type === "audio" && !validatedData.audioUrl) {
      return NextResponse.json(
        { error: "audioUrl is required for audio messages" },
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: {
        requestId: validatedData.requestId,
        senderId: user.userId,
        receiverId: validatedData.receiverId,
        content: validatedData.content,
        type: validatedData.type.toUpperCase() as MessageType,
        imageUrl: validatedData.imageUrl,
        audioUrl: validatedData.audioUrl,
        read: false,
      },
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
        request: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Create message error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


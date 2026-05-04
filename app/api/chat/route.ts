import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/middleware";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth()(request);
    if ("error" in auth) return auth.error;

    const userId = auth.user.userId;
    const role = auth.user.role;

    // Get requests where the user is involved and there are messages
    const requests = await prisma.request.findMany({
      where: {
        ...(role === "CLIENT"
          ? { clientId: userId }
          : { companyId: userId }),
        companyId: { not: null },
        messages: { some: {} },
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        service: { select: { id: true, name: true } },
        client: { select: { id: true, name: true, email: true } },
        company: { select: { id: true, name: true, email: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true,
            read: true,
          },
        },
        _count: {
          select: {
            messages: { where: { receiverId: userId, read: false } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(
      requests.map((r) => ({
        requestId: r.id,
        status: r.status,
        service: r.service,
        otherParty: role === "CLIENT" ? r.company : r.client,
        lastMessage: r.messages[0] ?? null,
        unreadCount: r._count.messages,
      }))
    );
  } catch (error) {
    console.error("Chat inbox error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

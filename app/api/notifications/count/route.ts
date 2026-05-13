import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateRequest } from "@/lib/middleware";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if ("error" in auth) return auth.error;

    const userId = auth.user.userId;

    const [unreadMessages, newOffers] = await Promise.all([
      prisma.message.count({
        where: { receiverId: userId, read: false },
      }),
      auth.user.role === "CLIENT"
        ? prisma.requestOffer.count({
            where: {
              request: { clientId: userId },
              status: "PENDING",
              createdAt: { gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            },
          })
        : Promise.resolve(0),
    ]);

    return NextResponse.json({ unreadMessages, newOffers, total: unreadMessages + newOffers });
  } catch (error) {
    console.error("Notification count error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

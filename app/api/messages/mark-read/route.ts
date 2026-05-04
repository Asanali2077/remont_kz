import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/middleware";

const schema = z.object({ requestId: z.string() });

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth()(request);
    if ("error" in auth) return auth.error;

    const body = await request.json();
    const { requestId } = schema.parse(body);

    await prisma.message.updateMany({
      where: {
        requestId,
        receiverId: auth.user.userId,
        read: false,
      },
      data: { read: true },
    });

    return NextResponse.json({ message: "Marked as read" });
  } catch (error) {
    console.error("Mark read error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/middleware";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth()(request);
    if ("error" in auth) return auth.error;

    const favorites = await prisma.favorite.findMany({
      where: { userId: auth.user.userId },
      include: {
        service: {
          include: {
            images: { orderBy: { order: "asc" } },
            company: { select: { id: true, name: true, email: true, phone: true } },
            _count: { select: { requests: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(favorites.map((f) => f.service));
  } catch (error) {
    console.error("Get favorites error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const addSchema = z.object({ serviceId: z.string() });

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth()(request);
    if ("error" in auth) return auth.error;

    const body = await request.json();
    const { serviceId } = addSchema.parse(body);

    await prisma.favorite.upsert({
      where: { userId_serviceId: { userId: auth.user.userId, serviceId } },
      create: { userId: auth.user.userId, serviceId },
      update: {},
    });

    return NextResponse.json({ message: "Added to favorites" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error" }, { status: 400 });
    }
    console.error("Add favorite error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

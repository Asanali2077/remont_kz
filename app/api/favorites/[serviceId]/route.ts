import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/middleware";

export async function GET(
  request: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  try {
    const auth = await requireAuth()(request);
    if ("error" in auth) return auth.error;

    const fav = await prisma.favorite.findUnique({
      where: { userId_serviceId: { userId: auth.user.userId, serviceId: params.serviceId } },
    });

    return NextResponse.json({ isFavorite: !!fav });
  } catch (error) {
    console.error("Check favorite error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  try {
    const auth = await requireAuth()(request);
    if ("error" in auth) return auth.error;

    await prisma.favorite.deleteMany({
      where: { userId: auth.user.userId, serviceId: params.serviceId },
    });

    return NextResponse.json({ message: "Removed from favorites" });
  } catch (error) {
    console.error("Remove favorite error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

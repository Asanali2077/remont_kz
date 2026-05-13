import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireCompany } from "@/lib/middleware";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; imageId: string } }
) {
  try {
    const authResult = await requireCompany()(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const image = await prisma.serviceImage.findUnique({
      where: { id: params.imageId },
      include: { service: true },
    });

    if (!image || image.serviceId !== params.id) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    if (image.service.companyId !== authResult.user.userId) {
      return NextResponse.json(
        { error: "Forbidden: You can only delete images from your own services" },
        { status: 403 }
      );
    }

    await prisma.serviceImage.delete({
      where: { id: params.imageId },
    });

    return NextResponse.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Delete image error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

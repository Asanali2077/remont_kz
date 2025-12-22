import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireCompany } from "@/lib/middleware";
import { handleFileUpload } from "@/lib/upload";

// POST /api/services/[id]/images - Upload service images
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireCompany()(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { user } = authResult;

    // Check if service exists and belongs to user
    const service = await prisma.service.findUnique({
      where: { id: params.id },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    if (service.companyId !== user.userId) {
      return NextResponse.json(
        { error: "Forbidden: You can only upload images to your own services" },
        { status: 403 }
      );
    }

    // Handle file upload
    const uploadResult = await handleFileUpload(request, "file", "images");

    if (!uploadResult) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Get current image count for ordering
    const imageCount = await prisma.serviceImage.count({
      where: { serviceId: params.id },
    });

    // Create image record
    const image = await prisma.serviceImage.create({
      data: {
        serviceId: params.id,
        url: uploadResult.url,
        order: imageCount,
      },
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error("Upload image error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// DELETE /api/services/[id]/images/[imageId] - Delete service image
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; imageId: string } }
) {
  try {
    const authResult = await requireCompany()(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { user } = authResult;

    // Check if image exists and service belongs to user
    const image = await prisma.serviceImage.findUnique({
      where: { id: params.imageId },
      include: { service: true },
    });

    if (!image) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      );
    }

    if (image.service.companyId !== user.userId) {
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


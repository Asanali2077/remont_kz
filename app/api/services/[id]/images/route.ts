import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireCompany } from "@/lib/middleware";
import { handleFileUpload } from "@/lib/upload";

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
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


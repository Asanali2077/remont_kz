import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireCompany } from "@/lib/middleware";
import { uploadFile } from "@/lib/upload";

const MAX_PORTFOLIO_PHOTOS = 20;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  if (!companyId) {
    return NextResponse.json({ error: "companyId is required" }, { status: 400 });
  }

  try {
    const photos = await prisma.portfolioPhoto.findMany({
      where: { companyId },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(photos);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireCompany()(request);
  if ("error" in authResult) return authResult.error;

  try {
    const count = await prisma.portfolioPhoto.count({
      where: { companyId: authResult.user.userId },
    });
    if (count >= MAX_PORTFOLIO_PHOTOS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_PORTFOLIO_PHOTOS} portfolio photos allowed` },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const caption = formData.get("caption")?.toString()?.slice(0, 200) ?? null;
    const uploadResult = await uploadFile(file, "images");

    const photo = await prisma.portfolioPhoto.create({
      data: {
        companyId: authResult.user.userId,
        url: uploadResult.url,
        caption,
        order: count,
      },
    });
    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

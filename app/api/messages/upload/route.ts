import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware";
import { handleFileUpload } from "@/lib/upload";

// POST /api/messages/upload - Upload file for message (image or audio)
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth()(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "image"; // "image" or "audio"

    if (type !== "image" && type !== "audio") {
      return NextResponse.json(
        { error: "Invalid type. Must be 'image' or 'audio'" },
        { status: 400 }
      );
    }

    const uploadResult = await handleFileUpload(
      request,
      "file",
      type as "images" | "audio"
    );

    if (!uploadResult) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      url: uploadResult.url,
      type: type,
      size: uploadResult.size,
      mimetype: uploadResult.mimetype,
    });
  } catch (error) {
    console.error("Upload file error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.cwd(), process.env.UPLOAD_DIR)
  : path.join(process.cwd(), "public", "uploads");

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
  ".gif": "image/gif", ".webp": "image/webp", ".mp3": "audio/mpeg",
  ".wav": "audio/wav", ".ogg": "audio/ogg", ".m4a": "audio/mp4",
  ".pdf": "application/pdf",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    verifyToken(token);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const { path: pathParts } = await params;
  const filePath = path.resolve(UPLOAD_DIR, ...pathParts);

  // Prevent path traversal
  if (!filePath.startsWith(UPLOAD_DIR)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ext = path.extname(filePath).toLowerCase();
  const mimeType = MIME[ext] ?? "application/octet-stream";
  const fileBuffer = fs.readFileSync(filePath);

  return new NextResponse(fileBuffer, {
    headers: { "Content-Type": mimeType, "Cache-Control": "private, max-age=3600" },
  });
}

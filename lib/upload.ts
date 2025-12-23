import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { NextRequest } from "next/server";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./public/uploads";
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "10485760"); // 10MB
const ALLOWED_IMAGE_TYPES = (process.env.ALLOWED_IMAGE_TYPES || "image/jpeg,image/png,image/webp").split(",");
const ALLOWED_AUDIO_TYPES = (process.env.ALLOWED_AUDIO_TYPES || "audio/mpeg,audio/wav,audio/ogg").split(",");

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

export async function uploadFile(
  file: File,
  subfolder: "images" | "audio" = "images"
): Promise<UploadResult> {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  // Validate file type
  const allowedTypes = subfolder === "images" ? ALLOWED_IMAGE_TYPES : ALLOWED_AUDIO_TYPES;
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(", ")}`);
  }

  // Generate unique filename
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = file.name.split(".").pop();
  const filename = `${timestamp}-${randomString}.${extension}`;

  // Create directory if it doesn't exist
  const uploadPath = join(process.cwd(), UPLOAD_DIR, subfolder);
  await mkdir(uploadPath, { recursive: true });

  // Convert file to buffer and save
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filePath = join(uploadPath, filename);
  await writeFile(filePath, buffer);

  // Return URL (in production, this would be a CDN URL)
  const url = `/uploads/${subfolder}/${filename}`;

  return {
    url,
    filename,
    size: file.size,
    mimetype: file.type,
  };
}

export async function handleFileUpload(
  request: NextRequest,
  fieldName: string = "file",
  subfolder: "images" | "audio" = "images"
): Promise<UploadResult | null> {
  try {
    const formData = await request.formData();
    const file = formData.get(fieldName) as File;

    if (!file) {
      return null;
    }

    return await uploadFile(file, subfolder);
  } catch (error) {
    console.error("File upload error:", error);
    throw error;
  }
}



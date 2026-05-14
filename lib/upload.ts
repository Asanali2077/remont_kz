import { writeFile, mkdir } from "fs/promises";
import { join, resolve } from "path";
import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import sharp from "sharp";

const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? resolve(process.env.UPLOAD_DIR)
  : join(process.cwd(), "public", "uploads");
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "10485760"); // 10 MB
const ALLOWED_IMAGE_TYPES = (
  process.env.ALLOWED_IMAGE_TYPES || "image/jpeg,image/png,image/webp"
).split(",");
const ALLOWED_AUDIO_TYPES = (
  process.env.ALLOWED_AUDIO_TYPES || "audio/mpeg,audio/wav,audio/ogg"
).split(",");

// Cloudinary (preferred for Vercel)
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY    = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

// S3-compatible storage (optional fallback)
const S3_ENDPOINT = process.env.S3_ENDPOINT;
const S3_BUCKET   = process.env.S3_BUCKET;
const S3_REGION   = process.env.S3_REGION   || "auto";
const S3_KEY      = process.env.S3_ACCESS_KEY_ID;
const S3_SECRET   = process.env.S3_SECRET_ACCESS_KEY;
const S3_PUBLIC_URL = process.env.S3_PUBLIC_URL;

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

/** Magic-byte signatures for allowed file types */
const MAGIC: Array<{ mime: string; bytes: number[] }> = [
  { mime: "image/jpeg",  bytes: [0xFF, 0xD8, 0xFF] },
  { mime: "image/png",   bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A] },
  { mime: "image/webp",  bytes: [0x52, 0x49, 0x46, 0x46] }, // RIFF header; webp checked via offset 8
  { mime: "audio/mpeg",  bytes: [0xFF, 0xFB] },
  { mime: "audio/mpeg",  bytes: [0x49, 0x44, 0x33] }, // ID3 tag
  { mime: "audio/wav",   bytes: [0x52, 0x49, 0x46, 0x46] }, // RIFF header
  { mime: "audio/ogg",   bytes: [0x4F, 0x67, 0x67, 0x53] },
];

function detectMimeFromBytes(buf: Buffer): string | null {
  for (const sig of MAGIC) {
    if (sig.bytes.every((b, i) => buf[i] === b)) {
      if (sig.mime === "image/webp") {
        // WebP has "WEBP" at offset 8
        const marker = buf.slice(8, 12).toString("ascii");
        if (marker !== "WEBP") continue;
      }
      return sig.mime;
    }
  }
  return null;
}

async function uploadToCloudinary(
  buf: Buffer,
  filename: string,
  subfolder: string,
  mimetype: string
): Promise<string> {
  const { v2: cloudinary } = await import("cloudinary");
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });

  const resourceType = mimetype.startsWith("audio/") ? "video" : "image";
  const folder = `remont_kz/${subfolder}`;

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType, public_id: filename.replace(/\.[^.]+$/, "") },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Cloudinary upload failed"));
        resolve(result.secure_url);
      }
    );
    stream.end(buf);
  });
}

async function uploadToS3(
  buf: Buffer,
  filename: string,
  subfolder: string,
  mimetype: string
): Promise<string> {
  if (!S3_ENDPOINT || !S3_BUCKET || !S3_KEY || !S3_SECRET) {
    throw new Error("S3 environment variables are not fully configured.");
  }

  const key = `${subfolder}/${filename}`;
  const url = `${S3_ENDPOINT}/${S3_BUCKET}/${key}`;

  // AWS Signature V4 — minimal implementation for PutObject
  const { createHmac, createHash } = await import("crypto");
  const now = new Date();
  const amzDate  = now.toISOString().replace(/[:-]/g, "").slice(0, 15) + "Z";
  const dateStamp = amzDate.slice(0, 8);

  const payloadHash = createHash("sha256").update(buf).digest("hex");

  const headers: Record<string, string> = {
    "Content-Type": mimetype,
    "Content-Length": String(buf.length),
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
    "Host": new URL(S3_ENDPOINT).host,
  };

  const signedHeaders = Object.keys(headers).sort().join(";");
  const canonicalHeaders = Object.entries(headers)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k.toLowerCase()}:${v.trim()}`)
    .join("\n") + "\n";

  const canonicalRequest = [
    "PUT", `/${S3_BUCKET}/${key}`, "",
    canonicalHeaders, signedHeaders, payloadHash,
  ].join("\n");

  const credentialScope = `${dateStamp}/${S3_REGION}/s3/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256", amzDate, credentialScope,
    createHash("sha256").update(canonicalRequest).digest("hex"),
  ].join("\n");

  const sign = (key: Buffer | string, data: string) =>
    createHmac("sha256", key).update(data).digest();

  const signingKey = sign(
    sign(sign(sign(`AWS4${S3_SECRET}`, dateStamp), S3_REGION), "s3"),
    "aws4_request"
  );
  const signature = createHmac("sha256", signingKey).update(stringToSign).digest("hex");

  headers["Authorization"] =
    `AWS4-HMAC-SHA256 Credential=${S3_KEY}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(url, { method: "PUT", headers, body: new Uint8Array(buf) });
  if (!res.ok) throw new Error(`S3 upload failed: ${res.status} ${await res.text()}`);

  const publicBase = S3_PUBLIC_URL ?? `${S3_ENDPOINT}/${S3_BUCKET}`;
  return `${publicBase}/${key}`;
}

export async function uploadFile(
  file: File,
  subfolder: "images" | "audio" = "images"
): Promise<UploadResult> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Max size: ${MAX_FILE_SIZE / 1024 / 1024} MB`);
  }

  const allowedTypes = subfolder === "images" ? ALLOWED_IMAGE_TYPES : ALLOWED_AUDIO_TYPES;
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed.`);
  }

  const bytes = await file.arrayBuffer();
  const buf = Buffer.from(bytes);

  // Magic-byte validation (prevents MIME spoofing)
  const detected = detectMimeFromBytes(buf);
  if (!detected || !allowedTypes.includes(detected)) {
    throw new Error("File content does not match the declared type.");
  }

  // Compress images: resize to max 1920px wide, convert to WebP at quality 80
  let finalBuf: Buffer = buf;
  let finalMime = file.type;
  let finalExt = file.name.split(".").pop() ?? (subfolder === "images" ? "jpg" : "mp3");

  if (subfolder === "images") {
    const compressed = await sharp(buf)
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
    finalBuf = Buffer.from(compressed);
    finalMime = "image/webp";
    finalExt = "webp";
  }

  const filename = `${Date.now()}-${randomUUID()}.${finalExt}`;

  // Cloudinary → S3 → local disk
  if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
    const url = await uploadToCloudinary(finalBuf, filename, subfolder, finalMime);
    return { url, filename, size: finalBuf.length, mimetype: finalMime };
  }

  if (S3_ENDPOINT && S3_BUCKET && S3_KEY && S3_SECRET) {
    const url = await uploadToS3(finalBuf, filename, subfolder, finalMime);
    return { url, filename, size: finalBuf.length, mimetype: finalMime };
  }

  const uploadPath = join(UPLOAD_DIR, subfolder);
  await mkdir(uploadPath, { recursive: true });
  await writeFile(join(uploadPath, filename), finalBuf);

  return {
    url: `/api/files/${subfolder}/${filename}`,
    filename,
    size: finalBuf.length,
    mimetype: finalMime,
  };
}

export async function handleFileUpload(
  request: NextRequest,
  fieldName = "file",
  subfolder: "images" | "audio" = "images"
): Promise<UploadResult | null> {
  const formData = await request.formData();
  const file = formData.get(fieldName) as File | null;
  if (!file) return null;
  return uploadFile(file, subfolder);
}

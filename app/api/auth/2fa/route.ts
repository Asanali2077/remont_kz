import { NextRequest, NextResponse } from "next/server";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/middleware";

/** GET — return status; generate secret + QR only if 2FA is not yet enabled */
export async function GET(request: NextRequest) {
  const auth = await requireAuth()(request);
  if ("error" in auth) return auth.error;

  const user = await prisma.user.findUnique({ where: { id: auth.user.userId }, select: { email: true, twoFactorEnabled: true } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (user.twoFactorEnabled) {
    return NextResponse.json({ enabled: true, qrCode: null, secret: null });
  }

  const secret = speakeasy.generateSecret({
    name: `Remont.kz (${user.email})`,
    issuer: "Remont.kz",
    length: 20,
  });

  await prisma.user.update({
    where: { id: auth.user.userId },
    data: { twoFactorSecret: secret.base32 },
  });

  const qrUrl = await QRCode.toDataURL(secret.otpauth_url!);

  return NextResponse.json({
    secret: secret.base32,
    qrCode: qrUrl,
    enabled: false,
  });
}

/** POST — verify TOTP and enable 2FA */
export async function POST(request: NextRequest) {
  const auth = await requireAuth()(request);
  if ("error" in auth) return auth.error;

  const { token } = await request.json() as { token?: string };
  if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id: auth.user.userId },
    select: { twoFactorSecret: true },
  });
  if (!user?.twoFactorSecret) return NextResponse.json({ error: "No secret configured" }, { status: 400 });

  const valid = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token,
    window: 1,
  });

  if (!valid) return NextResponse.json({ error: "Invalid code" }, { status: 400 });

  await prisma.user.update({
    where: { id: auth.user.userId },
    data: { twoFactorEnabled: true },
  });

  return NextResponse.json({ ok: true, message: "2FA enabled" });
}

/** DELETE — disable 2FA */
export async function DELETE(request: NextRequest) {
  const auth = await requireAuth()(request);
  if ("error" in auth) return auth.error;

  const { token } = await request.json() as { token?: string };
  if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id: auth.user.userId },
    select: { twoFactorSecret: true, twoFactorEnabled: true },
  });
  if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
    return NextResponse.json({ error: "2FA is not enabled" }, { status: 400 });
  }

  const valid = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token,
    window: 1,
  });

  if (!valid) return NextResponse.json({ error: "Invalid code" }, { status: 400 });

  await prisma.user.update({
    where: { id: auth.user.userId },
    data: { twoFactorEnabled: false, twoFactorSecret: null },
  });

  return NextResponse.json({ ok: true, message: "2FA disabled" });
}

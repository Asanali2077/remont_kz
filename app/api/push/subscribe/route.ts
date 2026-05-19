import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/middleware";

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

export async function POST(req: NextRequest) {
  const auth = await requireAuth()(req);
  if ("error" in auth) return auth.error;

  try {
    const body = await req.json();
    const { endpoint, keys } = subscribeSchema.parse(body);

    await prisma.pushSubscription.upsert({
      where: { endpoint },
      create: { userId: auth.user.userId, endpoint, p256dh: keys.p256dh, auth: keys.auth },
      update: { userId: auth.user.userId, p256dh: keys.p256dh, auth: keys.auth },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
    console.error("Push subscribe error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAuth()(req);
  if ("error" in auth) return auth.error;

  try {
    const { endpoint } = await req.json() as { endpoint: string };
    await prisma.pushSubscription.deleteMany({ where: { endpoint, userId: auth.user.userId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

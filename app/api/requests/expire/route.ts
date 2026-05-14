import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// Called by Vercel cron (GET) or manual trigger (POST) to mark expired requests.
// Vercel cron sends GET with Authorization: Bearer <CRON_SECRET>.
async function runExpire() {
  const result = await prisma.request.updateMany({
    where: {
      status: "NEW",
      companyId: null,
      expiresAt: { lt: new Date() },
    },
    data: { status: "CANCELLED" },
  });
  return NextResponse.json({ expired: result.count, processedAt: new Date().toISOString() });
}

function authorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET ?? "remont-cron-2024";
  // Vercel sends: Authorization: Bearer <secret>
  const bearer = request.headers.get("authorization")?.replace("Bearer ", "");
  // Legacy: x-cron-secret header
  const legacy = request.headers.get("x-cron-secret");
  return bearer === cronSecret || legacy === cronSecret;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return await runExpire();
  } catch (error) {
    console.error("Expire requests error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return await runExpire();
  } catch (error) {
    console.error("Expire requests error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", db: true, ts: new Date().toISOString() });
  } catch {
    return NextResponse.json({ status: "degraded", db: false, ts: new Date().toISOString() }, { status: 503 });
  }
}

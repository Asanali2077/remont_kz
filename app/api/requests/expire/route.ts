import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Called via cron job or manual trigger to mark expired requests
// Protect with a secret token
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret");
  if (secret !== (process.env.CRON_SECRET ?? "remont-cron-2024")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await prisma.request.updateMany({
      where: {
        status: "NEW",
        companyId: null,
        expiresAt: { lt: new Date() },
      },
      data: { status: "COMPLETED" }, // Mark as closed/expired
    });

    return NextResponse.json({ expired: result.count, processedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Expire requests error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

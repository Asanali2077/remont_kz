import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireCompany } from "@/lib/middleware";

const schema = z.object({
  companyReply: z.string().min(1).max(1000),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireCompany()(request);
    if ("error" in auth) return auth.error;

    const existing = await prisma.request.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: "Request not found" }, { status: 404 });
    if (existing.companyId !== auth.user.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!existing.review) {
      return NextResponse.json({ error: "No review to reply to" }, { status: 400 });
    }

    const body = await request.json();
    const { companyReply } = schema.parse(body);

    const updated = await prisma.request.update({
      where: { id: params.id },
      data: { companyReply },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Validation error" }, { status: 400 });
    }
    console.error("Company reply error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

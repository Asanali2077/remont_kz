import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/middleware";

const createSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  discount: z.number().min(1).max(100),
  maxUses: z.number().int().positive().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
});

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin()(request);
  if ("error" in authResult) return authResult.error;

  const codes = await prisma.promoCode.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(codes);
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin()(request);
  if ("error" in authResult) return authResult.error;

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", details: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.promoCode.findUnique({ where: { code: parsed.data.code } });
  if (existing) {
    return NextResponse.json({ error: "Code already exists" }, { status: 409 });
  }

  const promo = await prisma.promoCode.create({
    data: {
      code: parsed.data.code,
      discount: parsed.data.discount,
      maxUses: parsed.data.maxUses ?? null,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
    },
  });
  return NextResponse.json(promo, { status: 201 });
}

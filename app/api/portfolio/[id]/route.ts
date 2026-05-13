import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireCompany } from "@/lib/middleware";

const patchSchema = z.object({
  caption: z.string().max(200).nullable().optional(),
  order: z.number().int().min(0).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireCompany()(request);
  if ("error" in authResult) return authResult.error;

  const photo = await prisma.portfolioPhoto.findUnique({ where: { id: params.id } });
  if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (photo.companyId !== authResult.user.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const result = patchSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
  }
  const updated = await prisma.portfolioPhoto.update({ where: { id: params.id }, data: result.data });
  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireCompany()(request);
  if ("error" in authResult) return authResult.error;

  const photo = await prisma.portfolioPhoto.findUnique({ where: { id: params.id } });
  if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (photo.companyId !== authResult.user.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.portfolioPhoto.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

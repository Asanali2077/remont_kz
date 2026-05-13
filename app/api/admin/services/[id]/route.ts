import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdmin()(request);
    if ("error" in authResult) return authResult.error;

    const { id } = await params;
    const body = await request.json();

    const service = await prisma.service.findUnique({ where: { id }, select: { id: true } });
    if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

    const data: Record<string, unknown> = {};
    if (typeof body.active === "boolean") data.active = body.active;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const updated = await prisma.service.update({ where: { id }, data });
    void logAudit(authResult.user.userId, "toggle_service", "service", id, { active: data.active });

    return NextResponse.json({ id: updated.id, active: updated.active });
  } catch (error) {
    console.error("Admin PATCH service error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdmin()(request);
    if ("error" in authResult) return authResult.error;

    const { id } = await params;

    const service = await prisma.service.findUnique({ where: { id }, select: { id: true } });
    if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

    await prisma.service.delete({ where: { id } });
    void logAudit(authResult.user.userId, "delete_service", "service", id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin DELETE service error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

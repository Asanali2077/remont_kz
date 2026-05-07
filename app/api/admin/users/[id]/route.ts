import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdmin()(request);
    if ("error" in authResult) return authResult.error;

    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, role: true, name: true, phone: true,
        avatarUrl: true, address: true, emailVerified: true,
        isBlocked: true, blockReason: true, lastActiveAt: true, createdAt: true,
        _count: { select: { clientRequests: true, services: true } },
      },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch (error) {
    console.error("Admin GET user error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdmin()(request);
    if ("error" in authResult) return authResult.error;

    const { id } = await params;
    const body = await request.json();

    const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
    if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (target.role === "ADMIN" && body.isBlocked === true) {
      return NextResponse.json({ error: "Cannot block admin accounts" }, { status: 403 });
    }

    const allowed = ["isBlocked", "blockReason", "name", "emailVerified"] as const;
    const data: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) data[key] = body[key];
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const updated = await prisma.user.update({ where: { id }, data });

    const action = body.isBlocked === true ? "block_user" : body.isBlocked === false ? "unblock_user" : "edit_user";
    void logAudit(authResult.user.userId, action, "user", id, { changes: data });

    return NextResponse.json({ id: updated.id, isBlocked: updated.isBlocked, blockReason: updated.blockReason });
  } catch (error) {
    console.error("Admin PATCH user error", error);
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

    if (id === authResult.user.userId) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 403 });
    }

    const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
    if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (target.role === "ADMIN") {
      return NextResponse.json({ error: "Cannot delete admin accounts" }, { status: 403 });
    }

    await prisma.user.delete({ where: { id } });
    void logAudit(authResult.user.userId, "delete_user", "user", id, { role: target.role });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin DELETE user error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

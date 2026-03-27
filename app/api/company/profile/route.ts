import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireCompany } from "@/lib/middleware";

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireCompany()(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const user = await prisma.user.findUnique({
      where: { id: authResult.user.userId },
      select: { id: true, email: true, name: true, phone: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireCompany()(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: authResult.user.userId },
      data: {
        ...(validatedData.name !== undefined && { name: validatedData.name }),
        ...(validatedData.phone !== undefined && { phone: validatedData.phone }),
      },
      select: { id: true, email: true, name: true, phone: true, role: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

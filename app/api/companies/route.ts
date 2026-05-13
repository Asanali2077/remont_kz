import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const companies = await prisma.user.findMany({
      where: { role: "COMPANY", services: { some: { active: true } } },
      select: {
        id: true, name: true, email: true, phone: true,
        avatarUrl: true, address: true,
        _count: {
          select: {
            services: { where: { active: true } },
            companyRequests: { where: { status: "COMPLETED" } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(companies);
  } catch (error) {
    console.error("Companies list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireCompany } from "@/lib/middleware";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireCompany()(request);
    if ("error" in auth) return auth.error;

    const requests = await prisma.request.findMany({
      where: { companyId: auth.user.userId },
      include: {
        client: { select: { name: true, email: true, phone: true } },
        service: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const headers = ["ID", "Status", "Service", "Client", "Client Email", "Client Phone", "Budget From", "Budget To", "City", "Rating", "Created"];
    const rows = requests.map((r) => [
      r.id,
      r.status,
      r.service?.name ?? "Custom",
      r.client?.name ?? "",
      r.client?.email ?? "",
      r.client?.phone ?? "",
      r.budgetFrom?.toString() ?? "",
      r.budgetTo?.toString() ?? "",
      r.city ?? "",
      r.rating?.toString() ?? "",
      new Date(r.createdAt).toISOString().slice(0, 10),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\r\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="requests-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    console.error("CSV export error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

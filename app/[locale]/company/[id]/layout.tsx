import type { Metadata } from "next";
import { prisma } from "@/lib/db";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const company = await prisma.user.findFirst({
      where: { id: params.id, role: "COMPANY" },
      select: { name: true, address: true },
    });
    if (!company) return { title: "Company not found" };
    const title = company.name ?? "Company";
    return {
      title: `${title} — Services`,
      description: `View services and reviews for ${title}${company.address ? ` in ${company.address}` : ""} on Remont.kz`,
    };
  } catch {
    return { title: "Company | Remont.kz" };
  }
}

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

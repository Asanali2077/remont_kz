import type { Metadata } from "next";
import { prisma } from "@/lib/db";

export async function generateMetadata(
  { params }: { params: { id: string; locale: string } }
): Promise<Metadata> {
  try {
    const company = await prisma.user.findUnique({
      where: { id: params.id, role: "COMPANY" },
      select: {
        name: true,
        address: true,
        avatarUrl: true,
        _count: { select: { services: { where: { active: true } } } },
      },
    });

    if (!company) return { title: "Company not found — Remont.kz" };

    const name         = company.name ?? "Company";
    const serviceCount = company._count.services;
    const location     = company.address ?? "Kazakhstan";
    const title        = `${name} — Remont.kz`;
    const description  = `${name} on Remont.kz. ${serviceCount} active service${serviceCount !== 1 ? "s" : ""} · ${location}. Find reviews, prices, and contact information.`;

    return {
      title,
      description,
      keywords: [name, "repair", "renovation", location, "Remont.kz", "company", "Kazakhstan"],
      openGraph: {
        title,
        description,
        type: "profile",
        locale: params.locale === "kk" ? "kk_KZ" : params.locale === "en" ? "en_US" : "ru_RU",
        ...(company.avatarUrl
          ? { images: [{ url: company.avatarUrl, width: 400, height: 400, alt: name }] }
          : {}),
      },
      twitter: {
        card: company.avatarUrl ? "summary_large_image" : "summary",
        title,
        description,
        ...(company.avatarUrl ? { images: [company.avatarUrl] } : {}),
      },
      robots: { index: true, follow: true },
    };
  } catch {
    return { title: "Company | Remont.kz" };
  }
}

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

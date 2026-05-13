import type { Metadata } from "next";
import { prisma } from "@/lib/db";

export async function generateMetadata(
  { params }: { params: { id: string; locale: string } }
): Promise<Metadata> {
  try {
    const service = await prisma.service.findUnique({
      where: { id: params.id },
      select: {
        name: true,
        description: true,
        city: true,
        priceFrom: true,
        priceTo: true,
        category: true,
        rating: true,
        images: { orderBy: { order: "asc" }, take: 1, select: { url: true } },
        company: { select: { name: true } },
      },
    });

    if (!service) return { title: "Service not found — Remont.kz" };

    const priceStr = service.priceFrom
      ? ` · from ${service.priceFrom.toLocaleString("ru-RU")} ₸`
      : "";
    const cityStr  = service.city ? ` · ${service.city}` : "";
    const title    = `${service.name} — ${service.company.name} | Remont.kz`;
    const description = `${service.description.slice(0, 120)}${priceStr}${cityStr}`;
    const imageUrl = service.images[0]?.url ?? null;

    return {
      title,
      description,
      keywords: [
        service.name,
        service.company.name ?? "",
        service.category.toLowerCase().replace("_", " "),
        service.city ?? "",
        "ремонт", "услуги", "Казахстан", "Remont.kz",
      ].filter(Boolean),
      openGraph: {
        title,
        description,
        type: "article",
        locale: params.locale === "kk" ? "kk_KZ" : params.locale === "en" ? "en_US" : "ru_RU",
        ...(imageUrl
          ? { images: [{ url: imageUrl, width: 1200, height: 630, alt: service.name }] }
          : {}),
      },
      twitter: {
        card: imageUrl ? "summary_large_image" : "summary",
        title,
        description,
        ...(imageUrl ? { images: [imageUrl] } : {}),
      },
      robots: { index: true, follow: true },
    };
  } catch {
    return { title: "Service | Remont.kz" };
  }
}

export default function ServiceDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

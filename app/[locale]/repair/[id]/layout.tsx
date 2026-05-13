import type { Metadata } from "next";
import { prisma } from "@/lib/db";

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  try {
    const service = await prisma.service.findUnique({
      where: { id: params.id },
      select: {
        name: true,
        description: true,
        city: true,
        images: { orderBy: { order: "asc" }, take: 1, select: { url: true } },
        company: { select: { name: true } },
      },
    });

    if (!service) {
      return { title: "Service not found" };
    }

    const title = `${service.name} — ${service.company.name}`;
    const description = service.description.slice(0, 155);

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: service.images[0] ? [service.images[0].url] : [],
      },
    };
  } catch {
    return { title: "Service | Remont.kz" };
  }
}

export default function ServiceDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

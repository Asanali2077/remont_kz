import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  let services: { id: string; updatedAt: Date }[] = [];
  let companies: { id: string; updatedAt: Date }[] = [];

  try {
    [services, companies] = await Promise.all([
      prisma.service.findMany({
        where: { active: true },
        select: { id: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.user.findMany({
        where: { role: "COMPANY", services: { some: { active: true } } },
        select: { id: true, updatedAt: true },
      }),
    ]);
  } catch {
    // DB unavailable during build — return static routes only
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base,                    lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${base}/repair`,        lastModified: new Date(), changeFrequency: "hourly",  priority: 0.9 },
    { url: `${base}/companies`,     lastModified: new Date(), changeFrequency: "daily",   priority: 0.7 },
    { url: `${base}/guide`,         lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/compare`,       lastModified: new Date(), changeFrequency: "weekly",  priority: 0.4 },
  ];

  const serviceRoutes: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${base}/repair/${s.id}`,
    lastModified: s.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const companyRoutes: MetadataRoute.Sitemap = companies.map((c) => ({
    url: `${base}/company/${c.id}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...serviceRoutes, ...companyRoutes];
}

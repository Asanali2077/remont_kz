import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://remont.kz';
const locales = ['ru', 'en', 'kk'];

const staticRoutes = [
  { path: '',          priority: 1.0, freq: 'daily' as const },
  { path: '/repair',   priority: 0.9, freq: 'daily' as const },
  { path: '/companies',priority: 0.8, freq: 'weekly' as const },
  { path: '/guide',    priority: 0.6, freq: 'monthly' as const },
  { path: '/about',    priority: 0.5, freq: 'monthly' as const },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Static routes for all locales
  for (const locale of locales) {
    for (const route of staticRoutes) {
      entries.push({
        url: `${BASE_URL}/${locale}${route.path}`,
        lastModified: new Date(),
        changeFrequency: route.freq,
        priority: route.priority,
      });
    }
  }

  // Dynamic service pages
  try {
    const services = await prisma.service.findMany({
      where: { active: true },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 1000,
    });

    for (const service of services) {
      for (const locale of locales) {
        entries.push({
          url: `${BASE_URL}/${locale}/repair/${service.id}`,
          lastModified: service.updatedAt,
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    }

    // Dynamic company pages
    const companies = await prisma.user.findMany({
      where: { role: 'COMPANY' },
      select: { id: true, updatedAt: true },
      take: 500,
    });

    for (const company of companies) {
      for (const locale of locales) {
        entries.push({
          url: `${BASE_URL}/${locale}/company/${company.id}`,
          lastModified: company.updatedAt,
          changeFrequency: 'weekly',
          priority: 0.65,
        });
      }
    }
  } catch {
    // DB unavailable at build time — static only
  }

  return entries;
}

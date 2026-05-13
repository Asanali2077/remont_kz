import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { ClientProviders } from '@/components/ClientProviders';
import { MainNavbar } from '@/components/nav/MainNavbar';
import '../globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://remont.kz';

export const metadata: Metadata = {
  title: {
    default: 'Remont.kz — Ремонт и обслуживание в Казахстане',
    template: '%s | Remont.kz',
  },
  description: 'Найдите проверенных подрядчиков по ремонту в Казахстане. Сравните цены, читайте отзывы, оставляйте заявки онлайн.',
  manifest: '/manifest.json',
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: 'website',
    siteName: 'Remont.kz',
    title: 'Remont.kz — Ремонт и обслуживание в Казахстане',
    description: 'Найдите проверенных подрядчиков по ремонту в Казахстане. Сравните цены, читайте отзывы, оставляйте заявки.',
    url: BASE_URL,
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Remont.kz' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Remont.kz — Ремонт и обслуживание в Казахстане',
    description: 'Найдите проверенных подрядчиков по ремонту в Казахстане.',
    images: ['/opengraph-image'],
  },
  keywords: ['ремонт', 'Казахстан', 'подрядчики', 'строительство', 'сантехника', 'электрика', 'remont.kz'],
  authors: [{ name: 'Remont.kz' }],
  robots: { index: true, follow: true },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <ClientProviders>
            <MainNavbar />
            {children}
          </ClientProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

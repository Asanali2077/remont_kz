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

export const metadata: Metadata = {
  title: {
    default: 'Remont.kz — Ремонт и обслуживание в Казахстане',
    template: '%s | Remont.kz',
  },
  description: 'Найдите проверенных подрядчиков по ремонту в Казахстане. Сравните цены, читайте отзывы, оставляйте заявки.',
  manifest: '/manifest.json',
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

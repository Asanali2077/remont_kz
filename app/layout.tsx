import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "@/components/ClientProviders";
import { MainNavbar } from "@/components/nav/MainNavbar";
import { SecondaryNavbar } from "@/components/nav/SecondaryNavbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Remont.kz",
  description: "Платформа Remont.kz для поиска подрядчиков по ремонту, обслуживанию и другим услугам в Казахстане",
  keywords: ["ремонт", "услуги", "авто", "недвижимость", "обслуживание", "Казахстан", "Remont"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <ClientProviders>
          <MainNavbar />
          <SecondaryNavbar />
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}

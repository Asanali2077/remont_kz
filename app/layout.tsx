import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "@/components/ClientProviders";
import { MainNavbar } from "@/components/nav/MainNavbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Remont.kz — Repair & Renovation Services in Kazakhstan",
    template: "%s | Remont.kz",
  },
  description: "Find trusted repair and renovation contractors in Kazakhstan. Compare prices, read reviews, and submit requests in minutes.",
  keywords: ["repair", "renovation", "contractors", "Kazakhstan", "auto repair", "real estate", "maintenance", "Remont.kz"],
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_KZ",
    url: "https://remont.kz",
    siteName: "Remont.kz",
    title: "Remont.kz — Repair & Renovation Services in Kazakhstan",
    description: "Find trusted repair and renovation contractors in Kazakhstan. Compare prices, read reviews, and submit requests in minutes.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Remont.kz",
    description: "Find trusted repair and renovation contractors in Kazakhstan.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientProviders>
          <MainNavbar />
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "@/components/ClientProviders";
import { MainNavbar } from "@/components/nav/MainNavbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Remont.kz",
  description: "Remont.kz — find repair and maintenance contractors in Kazakhstan",
  keywords: ["repair", "services", "auto", "real estate", "maintenance", "Kazakhstan", "Remont"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProviders>
          <MainNavbar />
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}

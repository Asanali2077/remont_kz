import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Service Catalog",
  description: "Browse repair and renovation services in Kazakhstan. Filter by city, price, category and rating.",
};

export default function RepairLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

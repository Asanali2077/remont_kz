import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Services",
  description: "Compare repair and renovation services side-by-side by price, rating, city and availability.",
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

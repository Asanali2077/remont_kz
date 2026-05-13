import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Remont Guide — How It Works | Remont.kz",
  description: "Learn how to find repair and renovation services in Kazakhstan. Step-by-step guide for clients and companies.",
};

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

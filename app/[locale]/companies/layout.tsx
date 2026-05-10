import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Companies",
  description: "Browse all verified service providers on Remont.kz — find contractors by city and category.",
};

export default function CompaniesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

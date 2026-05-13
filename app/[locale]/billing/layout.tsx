import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billing & Plans",
  description: "Choose a subscription plan that fits your needs.",
};

export default function BillingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

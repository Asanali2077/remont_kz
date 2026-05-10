import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Requests",
  description: "Track your repair and renovation service requests, view offers and manage bookings.",
};

export default function MyRequestsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

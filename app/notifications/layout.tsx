import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Your activity and updates from Remont.kz",
};

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

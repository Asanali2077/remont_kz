import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saved Services",
  description: "Your saved and favorite repair services.",
};

export default function FavoritesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

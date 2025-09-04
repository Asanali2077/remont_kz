"use client";

import { Toaster } from "sonner";
import { FavoritesProvider } from "@/components/favorites/FavoritesProvider";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <FavoritesProvider>
      {children}
      <Toaster />
    </FavoritesProvider>
  );
}

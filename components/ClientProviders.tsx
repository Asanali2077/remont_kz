"use client";

import { Toaster } from "sonner";
import { FavoritesProvider } from "@/components/favorites/FavoritesProvider";
import { LangProvider } from "@/components/nav/LangSwitcher";
import { AuthProvider } from "@/components/auth/AuthProvider";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <LangProvider>
      <AuthProvider>
        <FavoritesProvider>
          {children}
          <Toaster />
        </FavoritesProvider>
      </AuthProvider>
    </LangProvider>
  );
}

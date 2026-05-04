"use client";

import { Toaster } from "sonner";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ThemeProvider } from "next-themes";
import { CompareProvider } from "@/components/CompareContext";
import { CompareBar } from "@/components/CompareBar";
import { MobileNav } from "@/components/MobileNav";
import { OfflineToast } from "@/components/OfflineToast";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <CompareProvider>
          {children}
          <CompareBar />
          <MobileNav />
          <OfflineToast />
          <Toaster />
        </CompareProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

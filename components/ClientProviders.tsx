"use client";

import { Toaster } from "sonner";
import { AuthProvider } from "@/components/auth/AuthProvider";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster />
    </AuthProvider>
  );
}

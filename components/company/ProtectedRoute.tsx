"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "client" | "company";
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.push("/");
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      router.push("/");
    }
  }, [loading, requiredRole, router, user]);

  if (loading) {
    return <div className="py-16 text-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  if (requiredRole && user.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}

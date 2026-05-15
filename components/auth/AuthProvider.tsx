"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { UserRole } from "@/lib/types";

export type { UserRole };

export type User = {
  id: string;
  email: string;
  role: UserRole;
  name?: string | null;
  phone?: string | null;
  token?: string;
  emailVerified?: boolean;
} | null;

type AuthContextValue = {
  user: User;
  login: (email: string, password: string, totpCode?: string) => Promise<{ requires2FA?: boolean }>;
  register: (email: string, password: string, role: "client" | "company", name?: string, phone?: string) => Promise<{ verifyUrl?: string }>;
  logout: () => void;
  loading: boolean;
  updateUser: (data: { name?: string | null; phone?: string | null }) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    try {
      const raw = localStorage.getItem("session:user");
      if (raw) {
        const parsed = JSON.parse(raw) as { token?: string };
        if (parsed.token) {
          api.getMe()
            .then((data) => {
              if (cancelled) return;
              setUser({
                id: data.id,
                email: data.email,
                role: data.role.toLowerCase() as UserRole,
                name: data.name,
                phone: data.phone,
                token: parsed.token!,
                emailVerified: data.emailVerified,
              });
            })
            .catch(() => {
              if (cancelled) return;
              // Token invalid or expired — clear storage explicitly
              try { localStorage.removeItem("session:user"); } catch {}
              setUser(null);
            })
            .finally(() => { if (!cancelled) setLoading(false); });
          return () => { cancelled = true; };
        }
      }
    } catch {}
    setLoading(false);
  }, []);

  // Only persist when user is set — removal is handled explicitly in logout / catch above
  useEffect(() => {
    if (!user) return;
    try {
      localStorage.setItem("session:user", JSON.stringify(user));
    } catch {}
  }, [user]);

  const login = async (email: string, password: string, totpCode?: string): Promise<{ requires2FA?: boolean }> => {
    try {
      const response = await api.login(email, password, totpCode);
      if (response.requires2FA) {
        return { requires2FA: true };
      }
      const role = response.user!.role.toLowerCase() as UserRole;
      setUser({
        id: response.user!.id,
        email: response.user!.email,
        role,
        name: response.user!.name,
        phone: response.user!.phone,
        token: response.token!,
        emailVerified: response.emailVerified ?? true,
      });
      if (response.emailVerified === false) {
        toast.warning("Please verify your email to access all features.", { duration: 6000 });
      } else {
        toast.success("Signed in");
      }
      return {};
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign in failed";
      toast.error(message);
      throw error;
    }
  };

  const register = async (
    email: string,
    password: string,
    role: "client" | "company",
    name?: string,
    phone?: string,
  ): Promise<{ verifyUrl?: string }> => {
    try {
      const response = await api.register({ email, password, role, name, phone });
      setUser({
        id: response.user!.id,
        email: response.user!.email,
        role: response.user!.role.toLowerCase() as UserRole,
        name: response.user!.name,
        phone: response.user!.phone,
        token: response.token!,
        emailVerified: false,
      });
      // Toast is shown by AuthModal after getting verifyUrl
      return { verifyUrl: response.verifyUrl };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed";
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    try { localStorage.removeItem("session:user"); } catch {}
    setUser(null);
    toast.success("Signed out");
  };

  const updateUser = (data: { name?: string | null; phone?: string | null }) => {
    setUser((prev) => prev ? { ...prev, ...data } : prev);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

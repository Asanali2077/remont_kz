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
} | null;

type AuthContextValue = {
  user: User;
  login: (email: string, password: string) => Promise<void>;
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
    // Try to restore session from localStorage
    try {
      const raw = localStorage.getItem("session:user");
      if (raw) {
        const userData = JSON.parse(raw);
        if (userData.token) {
          // Verify token by fetching user data
          api.getMe()
            .then((userData) => {
              const role = userData.role.toLowerCase() as UserRole;
              setUser({
                id: userData.id,
                email: userData.email,
                role,
                name: userData.name,
                phone: userData.phone,
                token: JSON.parse(raw).token,
              });
            })
            .catch(() => {
              // Token invalid, clear storage
              localStorage.removeItem("session:user");
              setUser(null);
            })
            .finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem("session:user", JSON.stringify(user));
      } catch {}
    } else {
      try {
        localStorage.removeItem("session:user");
      } catch {}
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.login(email, password);
      const role = response.user.role.toLowerCase() as UserRole;
      setUser({
        id: response.user.id,
        email: response.user.email,
        role,
        name: response.user.name,
        phone: response.user.phone,
        token: response.token,
      });
      if (response.emailVerified === false) {
        toast.warning("Please verify your email to access all features.", { duration: 6000 });
      } else {
        toast.success("Signed in");
      }
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
    phone?: string
  ): Promise<{ verifyUrl?: string }> => {
    try {
      const response = await api.register({ email, password, role, name, phone });
      setUser({
        id: response.user.id,
        email: response.user.email,
        role: response.user.role.toLowerCase() as UserRole,
        name: response.user.name,
        phone: response.user.phone,
        token: response.token,
      });
      // Toast is shown by AuthModal after getting verifyUrl
      return { verifyUrl: response.verifyUrl };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed";
      toast.error(message);
      throw error;
      return {};
    }
  };

  const logout = () => {
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

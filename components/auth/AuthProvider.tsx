"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export type UserRole = "client" | "company";

export type User = {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  phone?: string;
  token?: string;
} | null;

type AuthContextValue = {
  user: User;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (email: string, password: string, role: UserRole, name?: string, phone?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
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
              setUser({
                id: userData.id,
                email: userData.email,
                role: userData.role.toLowerCase() as UserRole,
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

  const login = async (email: string, password: string, role: UserRole) => {
    try {
      const response = await api.login(email, password);
      if (response.user.role.toLowerCase() !== role) {
        throw new Error("Role mismatch");
      }
      setUser({
        id: response.user.id,
        email: response.user.email,
        role: response.user.role.toLowerCase() as UserRole,
        name: response.user.name,
        phone: response.user.phone,
        token: response.token,
      });
      toast.success("Успешный вход");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ошибка входа";
      toast.error(message);
      throw error;
    }
  };

  const register = async (
    email: string,
    password: string,
    role: UserRole,
    name?: string,
    phone?: string
  ) => {
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
      toast.success("Регистрация успешна");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ошибка регистрации";
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    toast.success("Выход выполнен");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

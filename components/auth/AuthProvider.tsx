"use client";

import { createContext, useContext, useEffect, useState } from "react";

type User = { email: string } | null;
type AuthContextValue = {
  user: User;
  login: (email: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("session:user");
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem("session:user", JSON.stringify(user)); } catch {}
  }, [user]);
  const login = (email: string) => setUser({ email });
  const logout = () => setUser(null);
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}



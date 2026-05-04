"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ServiceRecord } from "@/lib/types";

const MAX = 3;
const KEY = "compare:services";

interface CompareContextValue {
  selected: ServiceRecord[];
  add: (service: ServiceRecord) => void;
  remove: (id: string) => void;
  toggle: (service: ServiceRecord) => void;
  isSelected: (id: string) => boolean;
  clear: () => void;
}

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = useState<ServiceRecord[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSelected(JSON.parse(raw) as ServiceRecord[]);
    } catch {/* ignore */}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(selected));
    } catch {/* ignore */}
  }, [selected]);

  const add = useCallback((service: ServiceRecord) => {
    setSelected((prev) => {
      if (prev.find((s) => s.id === service.id)) return prev;
      if (prev.length >= MAX) return prev;
      return [...prev, service];
    });
  }, []);

  const remove = useCallback((id: string) => {
    setSelected((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const toggle = useCallback((service: ServiceRecord) => {
    setSelected((prev) => {
      if (prev.find((s) => s.id === service.id)) return prev.filter((s) => s.id !== service.id);
      if (prev.length >= MAX) return prev;
      return [...prev, service];
    });
  }, []);

  const isSelected = useCallback((id: string) => selected.some((s) => s.id === id), [selected]);

  const clear = useCallback(() => setSelected([]), []);

  return (
    <CompareContext.Provider value={{ selected, add, remove, toggle, isSelected, clear }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}

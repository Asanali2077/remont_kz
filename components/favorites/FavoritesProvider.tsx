"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type FavoritesContextValue = {
  favorites: Set<number>;
  isFavorite: (id: number) => boolean;
  toggleFavorite: (id: number) => void;
  addFavorite: (id: number) => void;
  removeFavorite: (id: number) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<number[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("favorites:orgIds");
      if (raw) setIds(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("favorites:orgIds", JSON.stringify(ids));
    } catch {}
  }, [ids]);

  const value = useMemo<FavoritesContextValue>(() => {
    const set = new Set(ids);
    return {
      favorites: set,
      isFavorite: (id: number) => set.has(id),
      toggleFavorite: (id: number) => {
        setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
      },
      addFavorite: (id: number) => {
        setIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      },
      removeFavorite: (id: number) => {
        setIds((prev) => prev.filter((x) => x !== id));
      },
    };
  }, [ids]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}



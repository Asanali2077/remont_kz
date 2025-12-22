"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Lang } from "@/lib/translations";

export type { Lang };

type LangContextValue = { lang: Lang; setLang: (l: Lang) => void };
const LangContext = createContext<LangContextValue | undefined>(undefined);

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("ru");
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("lang") : null;
    if (saved === "ru" || saved === "kaz") setLang(saved);
  }, []);
  useEffect(() => {
    try { localStorage.setItem("lang", lang); } catch {}
  }, [lang]);
  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}

export function LangSwitcher() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex items-center gap-2 text-sm">
      <button className={lang === "ru" ? "font-semibold" : "text-muted-foreground"} onClick={() => setLang("ru")}>RU</button>
      <span className="text-muted-foreground">|</span>
      <button className={lang === "kaz" ? "font-semibold" : "text-muted-foreground"} onClick={() => setLang("kaz")}>KAZ</button>
    </div>
  );
}

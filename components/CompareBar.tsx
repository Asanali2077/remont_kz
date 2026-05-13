"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { X, ArrowRight } from "lucide-react";
import { useCompare } from "@/components/CompareContext";
import { Button } from "@/components/ui/button";

export function CompareBar() {
  const t = useTranslations("compare");
  const { selected, remove, clear } = useCompare();

  if (selected.length < 2) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur shadow-lg">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3 flex-wrap">
        <span className="text-sm font-semibold shrink-0">{t("title")} ({selected.length}/3):</span>
        <div className="flex-1 flex flex-wrap gap-2 min-w-0">
          {selected.map((s) => (
            <div key={s.id} className="flex items-center gap-1.5 bg-muted rounded-lg px-3 py-1.5 text-sm font-medium">
              <span className="truncate max-w-[140px]">{s.name}</span>
              <button onClick={() => remove(s.id)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={clear}>{t("clear")}</Button>
          <Link href="/compare">
            <Button size="sm" className="gap-1.5">
              {t("title")} <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

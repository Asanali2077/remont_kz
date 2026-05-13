"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { useTransition } from "react";

const LABELS: Record<string, string> = {
  ru: "RU",
  en: "EN",
  kk: "ҚАЗ",
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function switchLocale(next: string) {
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <div className="flex items-center gap-0.5">
      {(["ru", "en", "kk"] as const).map((l) => (
        <button
          key={l}
          onClick={() => switchLocale(l)}
          disabled={isPending}
          className={`px-2 py-1 text-xs rounded-md font-medium transition-colors ${
            locale === l
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { LangSwitcher } from "@/components/nav/LangSwitcher";

export function MainNavbar() {
  const [open, setOpen] = useState(false);
  const [bizOpen, setBizOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setBizOpen(false);
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return (
    <div className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-3">
            <Link href="/automobiles" className="text-sm hover:underline">Авто</Link>
            <Link href="/real-estate" className="text-sm hover:underline">Недвижимость</Link>
            <Link href="/other" className="text-sm hover:underline">Другое</Link>
          </nav>
          <Button className="md:hidden" variant="outline" size="sm" onClick={() => setOpen(!open)}>
            Меню
          </Button>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <LangSwitcher />
          <Link href="/guide" className="text-sm hover:underline">Remont Гид</Link>
          <div className="relative" ref={menuRef}>
            <button className="text-sm" onClick={() => setBizOpen(!bizOpen)}>Для бизнеса</button>
            {bizOpen && (
              <div className="absolute right-0 mt-2 bg-popover border rounded-md shadow-md p-2 w-44">
                <Link href="/partners" className="block px-3 py-2 text-sm hover:bg-muted rounded">Партнерам</Link>
                <Link href="/ads" className="block px-3 py-2 text-sm hover:bg-muted rounded">Рекламодателям</Link>
              </div>
            )}
          </div>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t bg-background">
          <div className="mx-auto max-w-6xl px-4 py-3 grid gap-2">
            <Link href="/automobiles" className="text-sm">Авто</Link>
            <Link href="/real-estate" className="text-sm">Недвижимость</Link>
            <Link href="/other" className="text-sm">Другое</Link>
            <div className="h-px bg-border my-2" />
            <LangSwitcher />
            <Link href="/guide" className="text-sm">Remont Гид</Link>
            <details>
              <summary className="text-sm cursor-pointer">Для бизнеса</summary>
              <div className="pl-3 grid gap-1 mt-1">
                <Link href="/partners" className="text-sm">Партнерам</Link>
                <Link href="/ads" className="text-sm">Рекламодателям</Link>
              </div>
            </details>
          </div>
        </div>
      )}
    </div>
  );
}



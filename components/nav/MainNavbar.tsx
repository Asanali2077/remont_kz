"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function MainNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-3">
            <Link href="/repair" className="text-sm hover:underline">
              Каталог
            </Link>
          </nav>
          <Button className="md:hidden" variant="outline" size="sm" onClick={() => setOpen(!open)}>
            Меню
          </Button>
        </div>

        <div className="hidden md:flex items-center gap-4" />
      </div>

      {open && (
        <div className="md:hidden border-t bg-background">
          <div className="mx-auto max-w-6xl px-4 py-3 grid gap-2">
            <Link href="/repair" className="text-sm">
              Каталог
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

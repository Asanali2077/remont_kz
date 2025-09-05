"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { AuthModal } from "@/components/auth/AuthModal";

export function SecondaryNavbar() {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="border-b bg-background">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold hover:underline">Remont.kz</Link>
        <div className="hidden md:flex items-center gap-4">
          <Link href="/favorites" className="text-sm hover:underline">Избранное</Link>
          <Link href="/messages" className="text-sm hover:underline">Сообщения</Link>
          <Link href="/balance" className="text-sm hover:underline">Пополнить счёт</Link>
          <Link href="/cabinet" className="text-sm hover:underline">Кабинет</Link>
          <Button className="gap-2"><Plus className="h-4 w-4"/>Подать объявление</Button>
          <AuthModal trigger={<Button variant="outline" size="sm" className="gap-2">👤 Вход / Регистрация</Button>} />
        </div>
        <Button className="md:hidden" variant="outline" size="sm" onClick={() => setOpen(!open)}>Меню</Button>
      </div>
      {open && (
        <div className="md:hidden border-t bg-background">
          <div className="mx-auto max-w-6xl px-4 py-3 grid gap-2">
            <Link href="/favorites" className="text-sm">Избранное</Link>
            <Link href="/messages" className="text-sm">Сообщения</Link>
            <Link href="/balance" className="text-sm">Пополнить счёт</Link>
            <Link href="/cabinet" className="text-sm">Кабинет</Link>
            <Button className="gap-2 justify-start"><Plus className="h-4 w-4"/>Подать объявление</Button>
            <AuthModal trigger={<Button variant="outline" size="sm" className="gap-2">👤 Вход / Регистрация</Button>} />
          </div>
        </div>
      )}
    </div>
  );
}



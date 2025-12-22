"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, LogOut } from "lucide-react";
import { useState } from "react";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLang } from "@/components/nav/LangSwitcher";
import { t } from "@/lib/translations";

export function SecondaryNavbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { lang } = useLang();
  const tr = t(lang);

  return (
    <div className="border-b bg-background">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold hover:underline">Remont.kz</Link>
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              {user.role === "client" ? (
                <>
                  <Link href="/favorites" className="text-sm hover:underline">{tr.nav.favorites}</Link>
                  <Link href="/messages" className="text-sm hover:underline">{tr.nav.messages}</Link>
                  <Link href="/balance" className="text-sm hover:underline">{tr.nav.balance}</Link>
                  <Link href="/cabinet" className="text-sm hover:underline">{tr.nav.cabinet}</Link>
                </>
              ) : (
                <>
                  <Link href="/company/dashboard" className="text-sm hover:underline flex items-center gap-1">
                    <LayoutDashboard className="h-4 w-4" />
                    {tr.nav.dashboard}
                  </Link>
                </>
              )}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{user.email}</span>
                <Button variant="outline" size="sm" onClick={logout} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  {tr.auth.logout}
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link href="/favorites" className="text-sm hover:underline">{tr.nav.favorites}</Link>
              <Link href="/messages" className="text-sm hover:underline">{tr.nav.messages}</Link>
              <Link href="/balance" className="text-sm hover:underline">{tr.nav.balance}</Link>
              <Link href="/cabinet" className="text-sm hover:underline">{tr.nav.cabinet}</Link>
              <AuthModal trigger={<Button variant="outline" size="sm" className="gap-2">👤 {tr.auth.login} / {tr.auth.register}</Button>} />
            </>
          )}
        </div>
        <Button className="md:hidden" variant="outline" size="sm" onClick={() => setOpen(!open)}>
          {lang === "kaz" ? "Мәзір" : "Меню"}
        </Button>
      </div>
      {open && (
        <div className="md:hidden border-t bg-background">
          <div className="mx-auto max-w-6xl px-4 py-3 grid gap-2">
            {user ? (
              <>
                {user.role === "client" ? (
                  <>
                    <Link href="/favorites" className="text-sm">{tr.nav.favorites}</Link>
                    <Link href="/messages" className="text-sm">{tr.nav.messages}</Link>
                    <Link href="/balance" className="text-sm">{tr.nav.balance}</Link>
                    <Link href="/cabinet" className="text-sm">{tr.nav.cabinet}</Link>
                  </>
                ) : (
                  <>
                    <Link href="/company/dashboard" className="text-sm flex items-center gap-1">
                      <LayoutDashboard className="h-4 w-4" />
                      {tr.nav.dashboard}
                    </Link>
                  </>
                )}
                <div className="text-sm text-muted-foreground py-2">{user.email}</div>
                <Button variant="outline" size="sm" onClick={logout} className="gap-2 justify-start">
                  <LogOut className="h-4 w-4" />
                  {tr.auth.logout}
                </Button>
              </>
            ) : (
              <>
                <Link href="/favorites" className="text-sm">{tr.nav.favorites}</Link>
                <Link href="/messages" className="text-sm">{tr.nav.messages}</Link>
                <Link href="/balance" className="text-sm">{tr.nav.balance}</Link>
                <Link href="/cabinet" className="text-sm">{tr.nav.cabinet}</Link>
                <AuthModal trigger={<Button variant="outline" size="sm" className="gap-2 justify-start">👤 {tr.auth.login} / {tr.auth.register}</Button>} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

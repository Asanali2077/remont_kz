"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, LogOut } from "lucide-react";
import { useState } from "react";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/components/auth/AuthProvider";

export function SecondaryNavbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="border-b bg-background">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold hover:underline">
          Remont.kz
        </Link>
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              {user.role === "company" && (
                <Link href="/company/dashboard" className="text-sm hover:underline flex items-center gap-1">
                  <LayoutDashboard className="h-4 w-4" />
                  Панель компании
                </Link>
              )}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{user.email}</span>
                <Button variant="outline" size="sm" onClick={logout} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Выйти
                </Button>
              </div>
            </>
          ) : (
            <AuthModal
              trigger={
                <Button variant="outline" size="sm" className="gap-2">
                  Войти / Регистрация
                </Button>
              }
            />
          )}
        </div>
        <Button className="md:hidden" variant="outline" size="sm" onClick={() => setOpen(!open)}>
          Меню
        </Button>
      </div>
      {open && (
        <div className="md:hidden border-t bg-background">
          <div className="mx-auto max-w-6xl px-4 py-3 grid gap-2">
            {user ? (
              <>
                {user.role === "company" && (
                  <Link href="/company/dashboard" className="text-sm flex items-center gap-1">
                    <LayoutDashboard className="h-4 w-4" />
                    Панель компании
                  </Link>
                )}
                <div className="text-sm text-muted-foreground py-2">{user.email}</div>
                <Button variant="outline" size="sm" onClick={logout} className="gap-2 justify-start">
                  <LogOut className="h-4 w-4" />
                  Выйти
                </Button>
              </>
            ) : (
              <AuthModal
                trigger={
                  <Button variant="outline" size="sm" className="gap-2 justify-start">
                    Войти / Регистрация
                  </Button>
                }
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

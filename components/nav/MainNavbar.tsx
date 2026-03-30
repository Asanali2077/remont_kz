"use client";

import Link from "next/link";
import { useState } from "react";
import { LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";

export function MainNavbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  const catalogHref = user?.role === "company" ? "/company/catalog" : "/repair";

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">

        {/* Лого */}
        <Link href="/" className="font-bold text-lg hover:opacity-80 transition-opacity">
          Remont.kz
        </Link>

        {/* Центр — навигация (desktop) */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href={catalogHref}
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Catalog
          </Link>
        </nav>

        {/* Правая часть (desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {user.role === "client" && (
                <Link href="/my-requests" className="text-sm hover:underline underline-offset-4">
                  My Requests
                </Link>
              )}
              {user.role === "company" && (
                <Link
                  href="/company/dashboard"
                  className="flex items-center gap-1 text-sm hover:underline underline-offset-4"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              )}
              <span className="max-w-[160px] truncate text-sm text-muted-foreground">{user.email}</span>
              <Button variant="outline" size="sm" onClick={logout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Log Out
              </Button>
            </>
          ) : (
            <AuthModal
              trigger={
                <Button variant="outline" size="sm">
                  Log In
                </Button>
              }
            />
          )}
        </div>

        {/* Мобильный бургер */}
        <Button
          className="md:hidden"
          variant="ghost"
          size="sm"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Мобильное меню */}
      {open && (
        <div className="border-t bg-background md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4">
            <Link
              href={catalogHref}
              className="text-sm font-medium"
              onClick={() => setOpen(false)}
            >
              Catalog
            </Link>

            {user ? (
              <>
                {user.role === "client" && (
                  <Link
                    href="/my-requests"
                    className="text-sm"
                    onClick={() => setOpen(false)}
                  >
                    My Requests
                  </Link>
                )}
                {user.role === "company" && (
                  <Link
                    href="/company/dashboard"
                    className="flex items-center gap-1 text-sm"
                    onClick={() => setOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                )}
                <div className="text-sm text-muted-foreground">{user.email}</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { logout(); setOpen(false); }}
                  className="justify-start gap-2 w-fit"
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </Button>
              </>
            ) : (
              <AuthModal
                trigger={
                  <Button variant="outline" size="sm" className="w-fit">
                    Log In
                  </Button>
                }
              />
            )}
          </div>
        </div>
      )}
    </header>
  );
}

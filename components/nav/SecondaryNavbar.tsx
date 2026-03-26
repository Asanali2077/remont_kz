"use client";

import Link from "next/link";
import { useState } from "react";
import { LayoutDashboard, LogOut } from "lucide-react";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";

export function SecondaryNavbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="border-b bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-bold hover:underline">
          Remont.kz
        </Link>

        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <>
              {user.role === "client" ? (
                <Link href="/my-requests" className="text-sm hover:underline">
                  My requests
                </Link>
              ) : null}

              {user.role === "company" ? (
                <Link
                  href="/company/dashboard"
                  className="flex items-center gap-1 text-sm hover:underline"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Company dashboard
                </Link>
              ) : null}

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{user.email}</span>
                <Button variant="outline" size="sm" onClick={logout} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Log out
                </Button>
              </div>
            </>
          ) : (
            <AuthModal
              trigger={
                <Button variant="outline" size="sm" className="gap-2">
                  Log in / Register
                </Button>
              }
            />
          )}
        </div>

        <Button className="md:hidden" variant="outline" size="sm" onClick={() => setOpen(!open)}>
          Menu
        </Button>
      </div>

      {open ? (
        <div className="border-t bg-background md:hidden">
          <div className="mx-auto grid max-w-6xl gap-2 px-4 py-3">
            {user ? (
              <>
                {user.role === "client" ? (
                  <Link href="/my-requests" className="text-sm">
                    My requests
                  </Link>
                ) : null}

                {user.role === "company" ? (
                  <Link href="/company/dashboard" className="flex items-center gap-1 text-sm">
                    <LayoutDashboard className="h-4 w-4" />
                    Company dashboard
                  </Link>
                ) : null}

                <div className="py-2 text-sm text-muted-foreground">{user.email}</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="justify-start gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </Button>
              </>
            ) : (
              <AuthModal
                trigger={
                  <Button variant="outline" size="sm" className="justify-start gap-2">
                    Log in / Register
                  </Button>
                }
              />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

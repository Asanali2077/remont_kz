"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import {
  LogOut, Menu, X, Moon, Sun, ChevronDown, ClipboardList,
  Bell, BookOpen, User, CreditCard, LayoutDashboard,
  Heart, MessageSquare, Search, ShieldCheck, History, Briefcase, Shield, Lock,
} from "lucide-react";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNotifications } from "@/lib/use-notifications";
import { timeAgo } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

/* ── Notification bell ── */
function NotificationBell({ role }: { role: "client" | "company" }) {
  const t = useTranslations("nav");
  const { items, unreadCount, markRead } = useNotifications(role);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function handleOpen() {
    setOpen((v) => !v);
    if (!open) markRead();
  }

  return (
    <div className="relative" ref={ref}>
      <Button variant="ghost" size="icon" className="h-9 w-9 relative" onClick={handleOpen}>
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-popover border border-border rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
            <span className="text-sm font-semibold">{t("notifications")}</span>
            <Link href={role === "company" ? "/company/dashboard?tab=notifications" : "/my-requests?tab=notifications"} onClick={() => setOpen(false)} className="text-xs text-primary hover:underline">{t("seeAll")}</Link>
          </div>
          {items.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">{t("noNewNotifications")}</div>
          ) : (
            <div className="divide-y max-h-72 overflow-y-auto">
              {items.slice(0, 6).map((item) => (
                <Link key={item.id} href={item.href} onClick={() => setOpen(false)}
                  className="block px-4 py-3 hover:bg-muted/40 transition-colors">
                  <div className="flex justify-between gap-2">
                    <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                    <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo(item.time)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.desc}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main navbar ── */
export function MainNavbar() {
  const t = useTranslations("nav");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();


  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true); }
      if (e.key === "Escape") setSearchOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [searchOpen]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const base = user?.role === "company" ? "/company/catalog" : "/repair";
    router.push(`${base}?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
    setSearchQuery("");
  }

  const catalogHref = user?.role === "company" ? "/company/catalog" : "/repair";
  const dashboardHref = user?.role === "company" ? "/company/dashboard" : "/my-requests";

  const initials = (user?.name?.[0] ?? user?.email?.[0] ?? "U").toUpperCase();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function toggleTheme() { setTheme(theme === "dark" ? "light" : "dark"); }

  /* ── company dropdown items ── */
  const companyMenuItems = [
    { href: "/company/dashboard",                    icon: LayoutDashboard, label: t("overview") },
    { href: "/company/dashboard?tab=requests",       icon: ClipboardList,   label: t("requests") },
    { href: "/company/dashboard?tab=services",       icon: Briefcase,       label: t("services") },
    { href: "/company/dashboard?tab=notifications",  icon: Bell,            label: t("notifications") },
    { href: "/company/dashboard?tab=messages",       icon: MessageSquare,   label: t("chat") },
    { href: "/company/dashboard?tab=billing",        icon: CreditCard,      label: t("billing") },
    { href: "/company/dashboard?tab=profile",        icon: User,            label: t("profile") },
    { href: "/company/dashboard?tab=security",       icon: Shield,          label: t("security") },
  ];

  /* ── client dropdown items ── */
  const clientMenuItems = [
    { href: "/my-requests",                    icon: ClipboardList, label: t("myRequests") },
    { href: "/my-requests?tab=messages",       icon: MessageSquare, label: t("chat") },
    { href: "/my-requests?tab=favorites",      icon: Heart,         label: t("favorites") },
    { href: "/my-requests?tab=notifications",  icon: Bell,          label: t("notifications") },
    { href: "/my-requests?tab=history",        icon: History,       label: t("orderHistory") },
    { href: "/my-requests?tab=profile",        icon: User,          label: t("profile") },
    { href: "/my-requests?tab=settings",       icon: Lock,          label: t("security") },
  ];

  return (
    <>
    <header
      className={`sticky top-0 z-40 transition-all duration-200 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 ${
        scrolled ? "border-b shadow-sm" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">

        {/* Logo */}
        <Link href="/" className="font-bold text-xl hover:opacity-80 transition-opacity select-none">
          Remont<span className="text-primary">.kz</span>
        </Link>

        {/* Center nav — desktop */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href={catalogHref} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {t("catalog")}
          </Link>
          {user?.role !== "company" && (
            <Link href="/companies" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {t("companies")}
            </Link>
          )}
          <Link href="/guide" className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <BookOpen className="h-3.5 w-3.5" /> {t("guide")}
          </Link>
          <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {t("about")}
          </Link>
        </nav>

        {/* Right — desktop */}
        <div className="hidden md:flex items-center gap-1">
          {/* Global search button */}
          <Button variant="ghost" size="sm" onClick={() => setSearchOpen(true)}
            className="h-10 gap-2.5 px-4 rounded-xl border border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/60 transition-colors hidden lg:flex">
            <Search className="h-4 w-4" />
            <span className="text-sm font-medium">{t("searchBtn")}</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} className="h-9 w-9 lg:hidden">
            <Search className="h-4 w-4" />
          </Button>

          {/* Theme toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9 relative">
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Language switcher */}
          <LanguageSwitcher />

          {user ? (
            <>
              {/* Notification bell */}
              <NotificationBell role={user.role === "company" ? "company" : "client"} />

              {/* Avatar — click = cabinet, hover = dropdown */}
              <div
                className="relative ml-1"
                ref={dropdownRef}
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <Link
                  href={user.role === "admin" ? "/admin/dashboard" : dashboardHref}
                  className="flex items-center gap-2 rounded-xl border border-border/60 px-2.5 py-1.5 hover:bg-muted hover:border-border transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold select-none shrink-0">
                    {initials}
                  </div>
                  <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
                </Link>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full pt-1.5 w-56 z-50">
                  <div className="bg-popover border border-border rounded-xl shadow-lg overflow-hidden">
                    {/* User info */}
                    <div className="px-4 py-3 border-b bg-muted/30">
                      <p className="text-sm font-semibold truncate">{user.name ?? user.email}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.role === "company" ? t("roleCompany") : user.role === "admin" ? t("roleAdmin") : t("roleClient")}</p>
                    </div>

                    {/* Client items */}
                    {user.role === "client" && clientMenuItems.map(({ href, icon: Icon, label }) => (
                      <Link key={href} href={href}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                        onClick={() => setDropdownOpen(false)}>
                        <Icon className="h-4 w-4 text-muted-foreground" /> {label}
                      </Link>
                    ))}

                    {/* Company items */}
                    {user.role === "company" && companyMenuItems.map(({ href, icon: Icon, label }) => (
                      <Link key={href} href={href}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                        onClick={() => setDropdownOpen(false)}>
                        <Icon className="h-4 w-4 text-muted-foreground" /> {label}
                      </Link>
                    ))}

                    {/* Admin */}
                    {user.role === "admin" && (
                      <Link href="/admin/dashboard"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors text-red-600 dark:text-red-400 font-medium"
                        onClick={() => setDropdownOpen(false)}>
                        <ShieldCheck className="h-4 w-4" /> {t("adminPanel")}
                      </Link>
                    )}

                    <div className="border-t">
                      <button
                        onClick={() => { logout(); setDropdownOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors text-destructive"
                      >
                        <LogOut className="h-4 w-4" /> {t("logout")}
                      </button>
                    </div>
                  </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <AuthModal defaultMode="login" trigger={<Button variant="ghost" size="sm" className="text-sm">{t("login")}</Button>} />
              <AuthModal defaultMode="register" trigger={<Button size="sm" className="text-sm shadow-sm shadow-primary/20">{t("register")}</Button>} />
            </>
          )}
        </div>

        {/* Mobile right */}
        <div className="flex items-center gap-1 md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9 relative">
            <Sun className="h-4 w-4 rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
          </Button>
          {user && <NotificationBell role={user.role === "company" ? "company" : "client"} />}
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)} className="h-9 w-9">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t bg-background md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4">
            <Link href={catalogHref} className="px-2 py-2.5 text-sm font-medium rounded-lg hover:bg-muted" onClick={() => setMobileOpen(false)}>{t("catalog")}</Link>
            <Link href="/guide" className="flex items-center gap-2 px-2 py-2.5 text-sm rounded-lg hover:bg-muted" onClick={() => setMobileOpen(false)}>
              <BookOpen className="h-4 w-4" /> {t("guide")}
            </Link>

            <div className="my-1 border-t" />

            {user ? (
              <>
                <div className="flex items-center gap-3 px-2 py-2">
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">{initials}</div>
                  <div>
                    <p className="text-sm font-medium">{user.name ?? user.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                  </div>
                </div>
                {user.role !== "admin" && (
                  <Link href={dashboardHref} className="flex items-center gap-3 px-2 py-2.5 text-sm rounded-lg hover:bg-muted font-medium text-primary" onClick={() => setMobileOpen(false)}>
                    <LayoutDashboard className="h-4 w-4" /> {t("cabinet")}
                  </Link>
                )}
                {user.role === "client" && (
                  <Link href="/favorites" className="flex items-center gap-3 px-2 py-2.5 text-sm rounded-lg hover:bg-muted" onClick={() => setMobileOpen(false)}>
                    <Heart className="h-4 w-4 text-muted-foreground" /> {t("favorites")}
                  </Link>
                )}
                <Link href="/profile" className="flex items-center gap-3 px-2 py-2.5 text-sm rounded-lg hover:bg-muted" onClick={() => setMobileOpen(false)}>
                  <User className="h-4 w-4 text-muted-foreground" /> {t("profile")}
                </Link>
                <Link href="/my-requests?tab=settings" className="flex items-center gap-3 px-2 py-2.5 text-sm rounded-lg hover:bg-muted" onClick={() => setMobileOpen(false)}>
                  <Lock className="h-4 w-4 text-muted-foreground" /> {t("security")}
                </Link>
                <button onClick={() => { logout(); setMobileOpen(false); }} className="flex items-center gap-3 px-2 py-2.5 text-sm text-destructive rounded-lg hover:bg-muted w-full text-left">
                  <LogOut className="h-4 w-4" /> {t("logout")}
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-1">
                <AuthModal defaultMode="login" trigger={<Button variant="outline" size="sm" className="flex-1">{t("login")}</Button>} />
                <AuthModal defaultMode="register" trigger={<Button size="sm" className="flex-1">{t("register")}</Button>} />
              </div>
            )}
          </div>
        </div>
      )}
    </header>

    {/* ── Global search overlay ── */}
    {searchOpen && (
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
        onClick={() => setSearchOpen(false)}>
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        <form onSubmit={handleSearch}
          className="relative w-full max-w-lg bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/40">
            <Search className="h-5 w-5 text-muted-foreground shrink-0" />
            <Input
              ref={searchRef}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="border-0 shadow-none focus-visible:ring-0 text-base bg-transparent px-0 h-auto"
            />
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0 rounded-lg"
              onClick={() => setSearchOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="px-4 py-3 flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground">{t("quickLinks")}</span>
            {[
              { label: "🚗 Auto repair", q: "auto" },
              { label: "🏠 Renovation", q: "renovation" },
              { label: "⚡ Electrical", q: "electrical" },
              { label: "🔧 Plumbing", q: "plumbing" },
            ].map(({ label, q }) => (
              <button key={q} type="button"
                onClick={() => { const base = user?.role === "company" ? "/company/catalog" : "/repair"; router.push(`${base}?q=${q}`); setSearchOpen(false); setSearchQuery(""); }}
                className="text-xs rounded-full border border-border/50 px-2.5 py-1 hover:bg-muted hover:border-primary/30 transition-colors">
                {label}
              </button>
            ))}
          </div>
          <div className="px-4 pb-3 flex justify-between items-center text-xs text-muted-foreground">
            <span>{t("pressEnter")}</span>
            <Button type="submit" size="sm" className="rounded-xl h-7 text-xs" disabled={!searchQuery.trim()}>
              {t("searchButton")}
            </Button>
          </div>
        </form>
      </div>
    )}

</>
  );
}

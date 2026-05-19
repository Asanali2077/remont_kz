"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Wrench } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

export function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const tC = useTranslations("company");
  const { user } = useAuth();
  const isCompany = user?.role === "company";

  const clientAccountLinks = [
    { label: tNav("myRequests"), href: "/my-requests" },
    { label: tNav("favorites"),  href: "/favorites" },
    { label: tNav("chat"),       href: "/chat" },
    { label: tNav("profile"),    href: "/profile" },
    { label: tNav("settings"),   href: "/settings" },
  ];

  const companyAccountLinks = [
    { label: tC("dashboard"),    href: "/company/dashboard" },
    { label: tNav("chat"),       href: "/chat" },
    { label: tNav("profile"),    href: "/profile" },
    { label: tNav("settings"),   href: "/settings" },
  ];

  const FOOTER_LINKS = {
    catalog: [
      { label: t("allServices"),   href: "/repair" },
      { label: t("automobiles"),   href: "/repair?category=AUTOMOBILES" },
      { label: t("realEstate"),    href: "/repair?category=REAL_ESTATE" },
      { label: t("other"),         href: "/repair?category=OTHER" },
    ],
    platform: [
      { label: tNav("companies"),  href: "/companies" },
      { label: t("howItWorks"),    href: "/#how-it-works" },
      { label: t("helpCenter"),    href: "/guide" },
      { label: tNav("about"),      href: "/about" },
    ],
    account: isCompany ? companyAccountLinks : clientAccountLinks,
  };

  return (
    <footer className="border-t bg-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 font-black text-xl mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Wrench className="h-4 w-4 text-primary-foreground" />
              </div>
              Remont<span className="text-primary">.kz</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              {t("description")}
            </p>
            <div className="mt-5 flex gap-2">
              <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">{t("citiesCount")}</span>
              <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">{t("companiesCount")}</span>
            </div>
          </div>

          {/* Catalog */}
          <div>
            <h4 className="text-sm font-bold mb-4 tracking-wide">{t("servicesColumn")}</h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.catalog.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-sm font-bold mb-4 tracking-wide">{t("platformColumn")}</h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.platform.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-sm font-bold mb-4 tracking-wide">{t("accountColumn")}</h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.account.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">© 2026 Remont.kz. {t("rights")}.</p>
        </div>
      </div>
    </footer>
  );
}

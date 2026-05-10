import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <Link href="/" className="font-bold text-xl">
              Remont<span className="text-primary">.kz</span>
            </Link>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed max-w-xs">
              Find trusted repair professionals across Kazakhstan. Fast, transparent, and reliable.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Services</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/repair?category=AUTOMOBILES" className="hover:text-foreground transition-colors">
                  Automobiles
                </Link>
              </li>
              <li>
                <Link href="/repair?category=REAL_ESTATE" className="hover:text-foreground transition-colors">
                  Real Estate
                </Link>
              </li>
              <li>
                <Link href="/repair?category=OTHER" className="hover:text-foreground transition-colors">
                  Other Repairs
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/#how-it-works" className="hover:text-foreground transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/#about" className="hover:text-foreground transition-colors">
                  {t("about")}
                </Link>
              </li>
              <li>
                <Link href="/repair" className="hover:text-foreground transition-colors">
                  {t("catalog")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">© 2024 Remont.kz. {t("rights")}.</p>
          <p className="text-xs text-muted-foreground">Demo version for development and testing</p>
        </div>
      </div>
    </footer>
  );
}

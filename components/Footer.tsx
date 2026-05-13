import { Link } from "@/i18n/routing";
import { Wrench } from "lucide-react";

const FOOTER_LINKS = {
  catalog: [
    { label: "All Services",   href: "/repair" },
    { label: "Automobiles",    href: "/repair?category=automobiles" },
    { label: "Real Estate",    href: "/repair?category=real-estate" },
    { label: "Plumbing",       href: "/repair?category=plumbing" },
    { label: "Electrical",     href: "/repair?category=electrical" },
    { label: "Renovation",     href: "/repair?category=renovation" },
  ],
  platform: [
    { label: "Companies",      href: "/companies" },
    { label: "How It Works",   href: "/#how-it-works" },
    { label: "Help Center",    href: "/guide" },
    { label: "About Us",       href: "/about" },
  ],
  account: [
    { label: "My Requests",    href: "/my-requests" },
    { label: "Favorites",      href: "/favorites" },
    { label: "Messages",       href: "/chat" },
    { label: "Profile",        href: "/profile" },
    { label: "Settings",       href: "/settings" },
  ],
};

export function Footer() {
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
              Marketplace connecting clients with verified repair professionals across Kazakhstan.
            </p>
            <div className="mt-5 flex gap-2">
              <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">14 cities</span>
              <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">200+ companies</span>
            </div>
          </div>

          {/* Catalog */}
          <div>
            <h4 className="text-sm font-bold mb-4 tracking-wide">Services</h4>
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
            <h4 className="text-sm font-bold mb-4 tracking-wide">Platform</h4>
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
            <h4 className="text-sm font-bold mb-4 tracking-wide">Account</h4>
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
          <p className="text-sm text-muted-foreground">© 2026 Remont.kz. All rights reserved.</p>
          <p className="text-xs text-muted-foreground">
            Protected by reCAPTCHA —{" "}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">Privacy</a>
            {" & "}
            <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">Terms</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

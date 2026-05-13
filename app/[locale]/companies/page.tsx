"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { Building2, Search, MapPin, CheckCircle2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Footer } from "@/components/Footer";

interface CompanyItem {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  address: string | null;
  _count: { services: number; companyRequests: number };
}

export default function CompaniesPage() {
  const t = useTranslations("companies");
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    void fetch("/api/companies").then(r => r.json()).then(setCompanies).catch(() => null).finally(() => setLoading(false));
  }, []);

  const filtered = companies.filter(c => {
    const q = query.toLowerCase();
    return !q || (c.name?.toLowerCase().includes(q) ?? false) || c.email.toLowerCase().includes(q) || (c.address?.toLowerCase().includes(q) ?? false);
  });

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t("subtitle")}</p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search by name or city…" className="pl-10 rounded-xl h-10" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border/50 rounded-2xl">
            <Building2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-medium">{t("noCompanies")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(c => {
              const name = c.name ?? c.email;
              return (
                <Link key={c.id} href={`/company/${c.id}` as `/company/${string}`}>
                  <div className="bg-card border border-border/50 rounded-2xl p-5 hover:shadow-md hover:border-border hover:-translate-y-0.5 transition-all duration-200 cursor-pointer h-full flex flex-col gap-3">
                    {/* Avatar + name */}
                    <div className="flex items-center gap-3">
                      {c.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.avatarUrl} alt={name} className="h-12 w-12 rounded-xl object-cover border border-border shrink-0" />
                      ) : (
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-lg font-black text-primary shrink-0">
                          {name[0].toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-sm truncate">{name}</p>
                        {c.address && (
                          <p className="text-xs text-muted-foreground flex items-center gap-0.5 mt-0.5 truncate">
                            <MapPin className="h-3 w-3 shrink-0" />{c.address}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto pt-2 border-t border-border/40">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" />
                        {c._count.services} {t("services")}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                        {c._count.companyRequests} completed
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

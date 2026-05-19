/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter, Link } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import {
  Star, MapPin, Phone, Mail, Building2, ArrowLeft,
  CheckCircle2, Calendar, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrgCard } from "@/components/OrgCard";
import { Footer } from "@/components/Footer";
import type { ServiceRecord } from "@/lib/types";
import { toast } from "sonner";

interface CompanyProfile {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  address: string | null;
  createdAt: string;
  avgRating: number | null;
  completedCount: number;
  services: ServiceRecord[];
  companyRequests: {
    id: string; rating: number | null; review: string | null;
    companyReply: string | null; createdAt: string;
    client: { name: string | null; email: string };
  }[];
}

export default function CompanyPublicPage() {
  const t = useTranslations("companies");
  const tC = useTranslations("company");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(`/api/company/${id}`);
        if (!res.ok) throw new Error();
        setCompany(await res.json());
      } catch {
        toast.error(t("notFound"));
        router.push("/companies");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
  if (!company) return null;

  const name = company.name ?? company.email;
  const initial = name[0].toUpperCase();
  const memberSince = new Date(company.createdAt).toLocaleDateString(locale, { year: "numeric", month: "long" });

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-5xl px-4 py-8">

        {/* Back */}
        <button onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" /> {tCommon("back")}
        </button>

        {/* ── Company header ── */}
        <div className="bg-card border border-border/50 rounded-2xl p-6 mb-5">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {/* Avatar */}
            {company.avatarUrl ? (
              <img src={company.avatarUrl} alt={name}
                className="w-20 h-20 rounded-2xl object-cover border border-border shrink-0" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-2xl font-black text-primary shrink-0">
                {initial}
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h1 className="text-2xl font-black tracking-tight">{name}</h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm text-muted-foreground">
                    {company.address && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {company.address}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> {tC("memberSince", { date: memberSince })}
                    </span>
                  </div>
                </div>

                {/* Rating badge */}
                {company.avgRating !== null && (
                  <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2 shrink-0">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-black text-sm">{company.avgRating.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">/ 5.0</span>
                  </div>
                )}
              </div>

              {/* Stats row */}
              <div className="flex flex-wrap gap-3 mt-4">
                <div className="flex items-center gap-1.5 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="font-semibold">{company.completedCount}</span>
                  <span className="text-muted-foreground">{tC("jobsCompleted")}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{company.services.length}</span>
                  <span className="text-muted-foreground">{tC("activeServices")}</span>
                </div>
              </div>

              {/* Contact */}
              <div className="flex flex-wrap gap-2 mt-4">
                {company.phone && (
                  <a href={`tel:${company.phone}`}>
                    <Button variant="outline" size="sm" className="gap-1.5 rounded-xl h-9">
                      <Phone className="h-3.5 w-3.5" /> {company.phone}
                    </Button>
                  </a>
                )}
                <a href={`mailto:${company.email}`}>
                  <Button variant="outline" size="sm" className="gap-1.5 rounded-xl h-9">
                    <Mail className="h-3.5 w-3.5" /> {company.email}
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── Services ── */}
        {company.services.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{t("servicesCount", { count: company.services.length })}</h2>
            </div>
            <div className="flex flex-col gap-3">
              {company.services.map((s) => (
                <OrgCard key={s.id} service={s} hideCompare />
              ))}
            </div>
          </section>
        )}

        {/* ── Reviews ── */}
        {company.companyRequests.length > 0 && (
          <section>
            <h2 className="text-lg font-bold mb-4">
              {t("reviewsCount", { count: company.companyRequests.length })}
            </h2>
            <div className="space-y-3">
              {company.companyRequests.map((req) => (
                <div key={req.id} className="bg-card border border-border/50 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                        {(req.client.name ?? req.client.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{req.client.name ?? tCommon("client")}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(req.createdAt).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    {req.rating !== null && (
                      <div className="flex gap-0.5 shrink-0">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={`h-4 w-4 ${s <= req.rating! ? "fill-amber-400 text-amber-400" : "fill-muted text-muted-foreground/30"}`} />
                        ))}
                      </div>
                    )}
                  </div>
                  {req.review && <p className="text-sm text-muted-foreground leading-relaxed">{req.review}</p>}
                  {req.companyReply && (
                    <div className="pl-4 border-l-2 border-primary/30">
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-0.5">{t("companyReply")}</p>
                      <p className="text-sm text-muted-foreground italic">&ldquo;{req.companyReply}&rdquo;</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {company.services.length === 0 && company.companyRequests.length === 0 && (
          <div className="text-center py-12 bg-card border border-border/50 rounded-2xl">
            <p className="text-muted-foreground">{t("noContent")}</p>
            <Link href="/repair"><Button variant="outline" className="mt-4 rounded-xl">{t("browseCatalog")}</Button></Link>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

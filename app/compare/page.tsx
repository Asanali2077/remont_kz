/* eslint-disable @next/next/no-img-element */
"use client";
import { CATEGORY_COLORS, fmtNum } from "@/lib/utils";

import { useCompare } from "@/components/CompareContext";
import { SERVICE_CATEGORY_LABELS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Clock, CheckCircle2, X, ArrowLeft, GitCompare } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Footer } from "@/components/Footer";
import { RequestCreateDialog } from "@/components/RequestCreateDialog";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthModal } from "@/components/auth/AuthModal";

export default function ComparePage() {
  const { selected, remove, clear } = useCompare();
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (selected.length === 0) router.push("/repair");
  }, [selected.length, router]);

  if (selected.length === 0) return null;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-5xl px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <GitCompare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Compare Services</h1>
              <p className="text-xs text-muted-foreground">{selected.length} selected</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-xl gap-1.5" onClick={clear}>
              <X className="h-3.5 w-3.5" /> Clear all
            </Button>
            <Link href="/repair">
              <Button variant="ghost" size="sm" className="rounded-xl gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </Button>
            </Link>
          </div>
        </div>

        {/* Compare table */}
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
          {/* Service headers */}
          <div className="grid border-b border-border/50" style={{ gridTemplateColumns: `180px repeat(${selected.length}, 1fr)` }}>
            <div className="px-5 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-r border-border/40" />
            {selected.map((s) => (
              <div key={s.id} className="px-4 py-4 border-r border-border/40 last:border-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Link href={`/repair/${s.id}`} className="font-semibold text-sm leading-snug hover:text-primary transition-colors line-clamp-2">
                    {s.name}
                  </Link>
                  <button onClick={() => remove(s.id)} className="shrink-0 p-0.5 text-muted-foreground hover:text-foreground transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">{s.company.name}</p>
              </div>
            ))}
          </div>

          {/* Photo row */}
          <div className="grid border-b border-border/50" style={{ gridTemplateColumns: `180px repeat(${selected.length}, 1fr)` }}>
            <div className="px-5 py-4 text-xs font-semibold text-muted-foreground border-r border-border/40 flex items-center">Photo</div>
            {selected.map((s) => (
              <div key={s.id} className="p-3 border-r border-border/40 last:border-0">
                {s.images[0] ? (
                  <img src={s.images[0].url} alt={s.name} className="w-full h-28 object-cover rounded-xl" />
                ) : (
                  <div className="w-full h-28 rounded-xl bg-muted flex items-center justify-center text-xs text-muted-foreground">No photo</div>
                )}
              </div>
            ))}
          </div>

          {/* Data rows */}
          {[
            {
              label: "Category",
              render: (s: typeof selected[0]) => (
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${CATEGORY_COLORS[s.category] ?? CATEGORY_COLORS.other}`}>
                  {SERVICE_CATEGORY_LABELS[s.category]}
                </span>
              ),
            },
            {
              label: "City",
              render: (s: typeof selected[0]) => s.city ? (
                <span className="flex items-center gap-1 text-sm"><MapPin className="h-3.5 w-3.5 text-muted-foreground" />{s.city}</span>
              ) : <span className="text-muted-foreground text-sm">—</span>,
            },
            {
              label: "Price",
              render: (s: typeof selected[0]) => (
                <span className="text-base font-bold">
                  {fmtNum(s.priceFrom)}
                  {s.priceTo !== s.priceFrom && <> – {fmtNum(s.priceTo)}</>}
                  <span className="text-xs font-normal text-muted-foreground ml-1">₸</span>
                </span>
              ),
            },
            {
              label: "Rating",
              render: (s: typeof selected[0]) => typeof s.rating === "number" ? (
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map((n) => (
                    <Star key={n} className={`h-3.5 w-3.5 ${n <= Math.round(s.rating!) ? "fill-amber-400 text-amber-400" : "fill-muted text-muted-foreground/30"}`} />
                  ))}
                  <span className="ml-0.5 text-sm font-semibold">{s.rating.toFixed(1)}</span>
                </div>
              ) : <span className="text-xs text-muted-foreground">No ratings</span>,
            },
            {
              label: "Availability",
              render: (s: typeof selected[0]) => (s.startDate || s.endDate) ? (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {s.startDate && new Date(s.startDate).toLocaleDateString("en", { month: "short", day: "numeric" })}
                  {s.startDate && s.endDate && " – "}
                  {s.endDate && new Date(s.endDate).toLocaleDateString("en", { month: "short", day: "numeric" })}
                </span>
              ) : <span className="text-sm text-emerald-600 font-medium">Available now</span>,
            },
            {
              label: "Action",
              render: (s: typeof selected[0]) => {
                if (!user) return <AuthModal trigger={<Button size="sm" className="w-full rounded-xl">Log in</Button>} />;
                if (user.role !== "client") return null;
                return (
                  <RequestCreateDialog service={s} trigger={
                    <Button size="sm" className="w-full rounded-xl gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Request
                    </Button>
                  } />
                );
              },
            },
          ].map((row) => (
            <div key={row.label} className="grid border-b border-border/50 last:border-0" style={{ gridTemplateColumns: `180px repeat(${selected.length}, 1fr)` }}>
              <div className="px-5 py-4 text-xs font-semibold text-muted-foreground border-r border-border/40 flex items-center">{row.label}</div>
              {selected.map((s) => (
                <div key={s.id} className="px-4 py-4 border-r border-border/40 last:border-0 flex items-center">
                  {row.render(s)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}



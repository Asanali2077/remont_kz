"use client";
import { useTranslations } from "next-intl";
import { fmtNum } from "@/lib/utils";

import { useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "@/i18n/routing";
import { CheckCircle2, Loader2, Smartphone, CreditCard, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { SettingsSidebar } from "@/components/SettingsSidebar";

const PLANS = [
  {
    name: "Free",
    price: 0,
    period: "",
    desc: "For occasional users",
    features: ["Up to 3 requests/month", "Basic catalog access", "Standard matching", "Email support"],
    current: true,
    popular: false,
  },
  {
    name: "Standard",
    price: 2990,
    period: "/month",
    desc: "For regular users",
    features: ["Unlimited requests", "Priority matching", "In-app chat", "Ratings & reviews", "Saved favorites", "Phone support"],
    current: false,
    popular: true,
  },
  {
    name: "Premium",
    price: 7990,
    period: "/month",
    desc: "Maximum features",
    features: ["Everything in Standard", "Dedicated manager", "1-hour response guarantee", "24/7 priority support", "Early access to features", "Kaspi Pay integration"],
    current: false,
    popular: false,
  },
];

export default function BillingPage() {
  const t = useTranslations("billing");
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!authLoading && !user) router.push("/"); }, [user, authLoading, router]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="flex gap-6 items-start">
          <SettingsSidebar active="billing" />

          <div className="flex-1 min-w-0 space-y-4">
            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">{t("title")}</h2>
              <p className="text-xs text-muted-foreground mb-6">Choose the plan that fits your needs</p>

              <div className="grid grid-cols-1 gap-3">
                {PLANS.map((plan) => (
                  <div key={plan.name} className={`relative rounded-xl border p-5 transition-all ${
                    plan.popular
                      ? "border-primary bg-primary/5 dark:bg-primary/10"
                      : plan.current
                      ? "border-border/50 bg-muted/30"
                      : "border-border/50 bg-background"
                  }`}>
                    {plan.popular && (
                      <span className="absolute top-4 right-4 text-[11px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                        Most Popular
                      </span>
                    )}
                    {plan.current && (
                      <span className="absolute top-4 right-4 text-[11px] font-semibold bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                        Current plan
                      </span>
                    )}

                    <div className="flex items-start gap-5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-1.5 mb-0.5">
                          <span className="text-xl font-black">
                            {plan.price > 0 ? `${fmtNum(plan.price)} ₸` : "Free"}
                          </span>
                          {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
                        </div>
                        <p className="text-sm font-semibold">{plan.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{plan.desc}</p>

                        <div className="mt-3 grid grid-cols-2 gap-1.5">
                          {plan.features.map((f) => (
                            <div key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                              {f}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="shrink-0 mt-1">
                        <Button
                          variant={plan.popular ? "default" : "outline"}
                          size="sm" className="rounded-xl"
                          disabled={plan.current}
                        >
                          {plan.current ? "Active" : "Upgrade"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Kaspi Pay mock */}
            <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border/40 bg-[#ef3124]/5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ef3124] shrink-0">
                  <Smartphone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-sm">Pay with Kaspi</p>
                  <p className="text-xs text-muted-foreground">Fast and secure payment via Kaspi.kz</p>
                </div>
                <span className="ml-auto text-[10px] font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">Coming Soon</span>
              </div>
              <div className="px-5 py-5 flex flex-col sm:flex-row items-center gap-6">
                {/* QR placeholder */}
                <div className="h-32 w-32 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center shrink-0 bg-muted/30">
                  <div className="grid grid-cols-3 gap-0.5 opacity-30">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className={`h-4 w-4 rounded-sm bg-foreground ${[0,2,6,8].includes(i) ? "opacity-100" : "opacity-40"}`} />
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 font-semibold">Kaspi QR</p>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">How it will work:</p>
                  {["Open Kaspi.kz app on your phone", "Scan the QR code", "Confirm payment — done!"].map((step, i) => (
                    <div key={i} className="flex items-center gap-2 text-muted-foreground">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#ef3124]/10 text-[#ef3124] text-[10px] font-black shrink-0">{i + 1}</span>
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: CreditCard, title: "Secure payments", desc: "Bank-level encryption. Cancel anytime with no hidden fees." },
                { icon: Zap, title: "Instant activation", desc: "Your plan activates immediately after payment." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-card border border-border/50 rounded-2xl p-5 flex items-start gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}



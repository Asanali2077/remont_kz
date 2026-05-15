"use client";

import { useTranslations } from "next-intl";
import { useAuth } from "@/components/auth/AuthProvider";
import { CheckCircle2, Circle, ChevronRight } from "lucide-react";
import type { ServiceRecord } from "@/lib/types";

interface Props {
  services: ServiceRecord[];
  hasCompletedRequest: boolean;
  hasAvatar: boolean;
  onNavigate: (tab: string) => void;
}

export function OnboardingChecklist({ services, hasCompletedRequest, hasAvatar, onNavigate }: Props) {
  const t = useTranslations("company");
  const { user } = useAuth();

  const steps = [
    { label: t("onboarding.completeProfile"),   done: !!(user?.name && user?.phone),                  tab: "profile" },
    { label: t("onboarding.addAvatar"),         done: hasAvatar,                                      tab: "profile" },
    { label: t("onboarding.addService"),        done: services.length > 0,                            tab: "services" },
    { label: t("onboarding.addServicePhoto"),   done: services.some(s => s.images.length > 0),        tab: "services" },
    { label: t("onboarding.completeRequest"),   done: hasCompletedRequest,                            tab: "requests" },
  ];

  const completed = steps.filter(s => s.done).length;
  const pct = Math.round((completed / steps.length) * 100);

  if (completed === steps.length) return null;

  return (
    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border/40">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-sm">{t("onboarding.title")}</h3>
          <span className="text-xs font-semibold text-muted-foreground">{completed}/{steps.length} done</span>
        </div>
        {/* Progress bar */}
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-500"
            style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">
          {pct < 40 ? "Great start! Keep going →" : pct < 80 ? "Almost there! 💪" : "Just a few more steps!"}
        </p>
      </div>

      {/* Steps */}
      <div className="divide-y divide-border/40">
        {steps.map(({ label, done, tab }, i) => (
          <button key={i} onClick={() => !done && onNavigate(tab)}
            disabled={done}
            className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${done ? "opacity-60" : "hover:bg-muted/40"}`}>
            {done
              ? <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
              : <Circle className="h-5 w-5 text-muted-foreground/40 shrink-0" />}
            <span className={`text-sm flex-1 ${done ? "line-through text-muted-foreground" : "font-medium"}`}>
              {label}
            </span>
            {!done && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
          </button>
        ))}
      </div>
    </div>
  );
}

/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { MapPin, Heart, GitCompare, Star, CheckCircle2, ArrowRight, Camera, BadgeCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthModal } from "@/components/auth/AuthModal";
import { RequestCreateDialog } from "@/components/RequestCreateDialog";
import { ServiceRecord, SERVICE_CATEGORY_LABELS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useCompare } from "@/components/CompareContext";
import { CATEGORY_COLORS, fmtNum } from "@/lib/utils";

interface OrgCardProps {
  service: ServiceRecord;
  initialFavorited?: boolean;
  onUnfavorited?: (serviceId: string) => void;
  disableNavigation?: boolean;
}

export function OrgCard({ service, initialFavorited, onUnfavorited, disableNavigation = false }: OrgCardProps) {
  const t = useTranslations("service");
  const tc = useTranslations("common");
  const { user } = useAuth();
  const { toggle, isSelected } = useCompare();
  const [imgError, setImgError] = useState(false);
  const [isFav, setIsFav] = useState(initialFavorited ?? false);
  const [favLoading, setFavLoading] = useState(false);

  const isClient = user?.role === "client";
  const inCompare = isSelected(service.id);

  const primaryImage = !imgError && service.images[0]?.url
    ? service.images[0].url
    : null;

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user || !isClient) return;
    if (favLoading) return;
    setFavLoading(true);
    try {
      if (isFav) {
        await api.removeFavorite(service.id);
        setIsFav(false);
        toast.success(t("removedFromSaved"));
        onUnfavorited?.(service.id);
      } else {
        await api.addFavorite(service.id);
        setIsFav(true);
        toast.success(t("savedToFavorites"));
      }
    } catch {
      toast.error(t("failedFavorites"));
    } finally {
      setFavLoading(false);
    }
  }

  const ratingNum = typeof service.rating === "number" ? service.rating : null;
  const requestCount = service._count?.requests ?? 0;

  const categoryColor = CATEGORY_COLORS[service.category] ?? CATEGORY_COLORS.other;

  return (
    <article className="group flex bg-card rounded-2xl border border-border/50 overflow-hidden transition-all duration-200 hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] hover:border-border dark:hover:shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:shadow-md transition-shadow">

      {/* ── Photo column ── */}
      {disableNavigation ? (
        <div className="relative shrink-0 w-48 md:w-60 bg-muted overflow-hidden opacity-50">
          {primaryImage ? (
            <img src={primaryImage} alt={service.name} onError={() => setImgError(true)}
              className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground/40">
              <Camera className="h-8 w-8" />
              <span className="text-xs">{t("noPhoto")}</span>
            </div>
          )}
          {(service.images?.length ?? 0) > 1 && (
            <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded-full bg-black/50 backdrop-blur-sm px-2 py-0.5 text-white text-[11px] font-medium">
              <Camera className="h-2.5 w-2.5" />
              {service.images?.length}
            </div>
          )}
        </div>
      ) : (
        <Link href={`/repair/${service.id}`} className="relative shrink-0 w-48 md:w-60 bg-muted overflow-hidden">
          {primaryImage ? (
            <img src={primaryImage} alt={service.name} onError={() => setImgError(true)}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground/40">
              <Camera className="h-8 w-8" />
              <span className="text-xs">{t("noPhoto")}</span>
            </div>
          )}
          {(service.images?.length ?? 0) > 1 && (
            <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded-full bg-black/50 backdrop-blur-sm px-2 py-0.5 text-white text-[11px] font-medium">
              <Camera className="h-2.5 w-2.5" />
              {service.images?.length}
            </div>
          )}
          <div className="absolute top-2.5 right-2.5">
            {isClient ? (
              <button onClick={(e) => void toggleFavorite(e)} disabled={favLoading}
                className={`flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-sm transition-all duration-200 ${isFav ? "bg-rose-500 text-white shadow-sm" : "bg-black/30 text-white hover:bg-black/50"}`}
                title={isFav ? t("removeFavorite") : t("addFavorite")}>
                <Heart className={`h-3.5 w-3.5 ${isFav ? "fill-white" : ""}`} />
              </button>
            ) : !user ? (
              <AuthModal trigger={
                <button className="flex h-7 w-7 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-colors">
                  <Heart className="h-3.5 w-3.5" />
                </button>
              } />
            ) : null}
          </div>
        </Link>
      )}

      {/* ── Content column ── */}
      <div className="flex flex-1 min-w-0 flex-col p-4 md:p-5">

        {/* Row 1: Category + City + Date */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide ${categoryColor}`}>
            {SERVICE_CATEGORY_LABELS[service.category]}
          </span>
          {service.city && (
            <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 text-muted-foreground/60" />
              {service.city}
            </span>
          )}
          {(service.startDate || service.endDate) && (
            <span className="text-xs text-muted-foreground">
              {service.startDate && new Date(service.startDate).toLocaleDateString("en", { month: "short", day: "numeric" })}
              {service.startDate && service.endDate && " – "}
              {service.endDate && new Date(service.endDate).toLocaleDateString("en", { month: "short", day: "numeric" })}
            </span>
          )}
        </div>

        {/* Row 2: Title */}
        {disableNavigation ? (
          <h3 className="text-[15px] md:text-base font-semibold leading-snug line-clamp-2 mb-1 opacity-50">
            {service.name}
          </h3>
        ) : (
          <Link href={`/repair/${service.id}`} className="block mb-1 group/title">
            <h3 className="text-[15px] md:text-base font-semibold leading-snug line-clamp-2 group-hover/title:text-primary transition-colors">
              {service.name}
            </h3>
          </Link>
        )}

        {/* Row 3: Company */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <span className="truncate">{service.company?.name}</span>
          {service.company?.isVerified && (
            <BadgeCheck className="h-4 w-4 text-blue-500 shrink-0" aria-label="Верифицированная компания" />
          )}
        </div>

        {/* Row 4: Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed flex-1">
          {service.description}
        </p>

        {/* Divider */}
        <div className="my-3 border-t border-border/60" />

        {/* Row 5: Rating + Price + Actions */}
        <div className="flex items-center justify-between gap-2 flex-wrap">

          {/* Left: Rating + Price */}
          <div className="flex flex-col gap-0.5">
            {ratingNum !== null ? (
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-3.5 w-3.5 ${s <= Math.round(ratingNum) ? "fill-amber-400 text-amber-400" : "fill-muted text-muted-foreground/30"}`}
                  />
                ))}
                <span className="ml-0.5 text-xs font-semibold text-foreground">{ratingNum.toFixed(1)}</span>
                {requestCount > 0 && (
                  <span className="text-xs text-muted-foreground">({tc("reviews", { count: requestCount })})</span>
                )}
              </div>
            ) : (
              <span className="text-[11px] text-muted-foreground">{t("noReviews")}</span>
            )}
            <p className="text-base font-semibold text-foreground leading-tight">
              {fmtNum(service.priceFrom)}
              {service.priceTo !== service.priceFrom && (
                <> – {fmtNum(service.priceTo)}</>
              )}
              <span className="ml-0.5 text-sm font-medium text-muted-foreground"> ₸</span>
            </p>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Compare — hidden for company accounts */}
            {user?.role !== "company" && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(service); }}
                title={inCompare ? t("compare") : t("compare")}
                className={`h-8 w-8 flex items-center justify-center rounded-xl border transition-all duration-150 ${
                  inCompare
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5"
                }`}
              >
                <GitCompare className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Details */}
            {!disableNavigation && (
              <Link href={`/repair/${service.id}`}>
                <Button variant="outline" size="sm" className="h-8 gap-1 text-xs font-medium">
                  {t("details")} <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            )}

            {/* Request */}
            {!user ? (
              <AuthModal trigger={
                <Button size="sm" className="h-8 gap-1.5 text-xs font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {t("createRequest")}
                </Button>
              } />
            ) : isClient ? (
              <RequestCreateDialog service={service} trigger={
                <Button size="sm" className="h-8 gap-1.5 text-xs font-medium shadow-sm shadow-primary/20">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {t("createRequest")}
                </Button>
              } />
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

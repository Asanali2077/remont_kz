/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/routing";
import {
  ArrowLeft, MapPin, Star, CheckCircle2,
  Phone, Mail, X, ChevronLeft, ChevronRight, Building2, MessageSquare, Camera, BadgeCheck,
  Share2,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthModal } from "@/components/auth/AuthModal";
import { RequestCreateDialog } from "@/components/RequestCreateDialog";
import { Currency } from "@/components/Currency";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { SERVICE_CATEGORY_LABELS, type ServiceRecord, type ReviewRecord } from "@/lib/types";
import { OrgCard } from "@/components/OrgCard";
import { toast } from "sonner";
import { CATEGORY_COLORS } from "@/lib/utils";

/* ── Lightbox ── */
function Lightbox({ images, startIndex, onClose }: {
  images: { url: string }[];
  startIndex: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIndex);
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIdx((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft") setIdx((i) => (i - 1 + images.length) % images.length);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [images.length, onClose]);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center" onClick={onClose}>
      <button className="absolute top-4 right-4 text-white/80 hover:text-white" onClick={onClose}>
        <X className="h-7 w-7" />
      </button>
      {images.length > 1 && (
        <>
          <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/40 rounded-full p-2"
            onClick={(e) => { e.stopPropagation(); setIdx((i) => (i - 1 + images.length) % images.length); }}>
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/40 rounded-full p-2"
            onClick={(e) => { e.stopPropagation(); setIdx((i) => (i + 1) % images.length); }}>
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
      <img src={images[idx].url} alt={`Photo ${idx + 1}`}
        className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()} />
      {images.length > 1 && (
        <div className="absolute bottom-4 flex gap-2">
          {images.map((_, i) => (
            <button key={i}
              className={`w-2 h-2 rounded-full transition-colors ${i === idx ? "bg-white" : "bg-white/40"}`}
              onClick={(e) => { e.stopPropagation(); setIdx(i); }} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Location card: Google Maps iframe embed + 2GIS button ── */
function LocationCard({ address, city, locationLabel, openInLabel }: { address?: string | null; city?: string | null; locationLabel: string; openInLabel: string }) {
  if (!address && !city) return null;

  const displayAddress = [address, city].filter(Boolean).join(", ");
  const fullQuery = [address, city, "Kazakhstan"].filter(Boolean).join(", ");
  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(fullQuery)}&output=embed&z=15&hl=ru`;
  const twoGisUrl = `https://2gis.kz/search/${encodeURIComponent(displayAddress)}`;

  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-lg">{locationLabel}</h2>

      <p className="text-sm text-muted-foreground flex items-start gap-1.5">
        <MapPin className="h-4 w-4 shrink-0 text-primary mt-0.5" />
        {displayAddress}
      </p>

      {/* Google Maps iframe — works with address string, no API key needed */}
      <div className="rounded-xl overflow-hidden border shadow-sm">
        <iframe
          src={embedUrl}
          width="100%"
          height="260"
          style={{ border: 0, display: "block" }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Map location"
        />
      </div>

      {/* 2GIS navigation button */}
      <a
        href={twoGisUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-semibold bg-[#1ba052] hover:bg-[#179047] text-white transition-colors shadow-sm"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
        {openInLabel}
      </a>
    </div>
  );
}

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const t = useTranslations("service");
  const tCommon = useTranslations("common");

  const [service, setService] = useState<ServiceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [similar, setSimilar] = useState<ServiceRecord[]>([]);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      try {
        const [svc, revs, sim] = await Promise.all([
          api.getService(id),
          api.getServiceReviews(id).catch(() => []),
          api.getSimilarServices(id).catch(() => []),
        ]);
        setService(svc);
        setReviews(revs);
        setSimilar(sim);
      } catch {
        toast.error(tCommon("notFound"));
        router.push("/repair");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  const requestButton = (() => {
    if (!service) return null;
    if (!user) return (
      <AuthModal trigger={
        <Button size="lg" className="w-full gap-2">
          <CheckCircle2 className="h-4 w-4" /> {t("createRequest")}
        </Button>
      } />
    );
    if (user.role !== "client") return (
      <Button size="lg" disabled className="w-full">{t("createRequest")}</Button>
    );
    return (
      <RequestCreateDialog service={service} trigger={
        <Button size="lg" className="w-full gap-2 shadow-lg shadow-primary/25">
          <CheckCircle2 className="h-4 w-4" /> {t("createRequest")}
        </Button>
      } />
    );
  })();

  if (loading) return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="h-5 w-20 bg-muted rounded animate-pulse mb-5" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-6">
          {/* Gallery skeleton */}
          <div className="lg:col-span-3 space-y-2">
            <div className="w-full aspect-[4/3] rounded-2xl bg-muted animate-pulse" />
            <div className="flex gap-2">
              {[1,2,3].map(i => <div key={i} className="flex-1 aspect-[4/3] rounded-xl bg-muted animate-pulse" />)}
            </div>
          </div>
          {/* Action card skeleton */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-4">
              <div className="h-3 w-20 bg-muted rounded animate-pulse" />
              <div className="h-10 w-48 bg-muted rounded animate-pulse" />
              <div className="h-10 bg-muted rounded-xl animate-pulse" />
              <div className="h-10 bg-muted rounded-xl animate-pulse" />
              <div className="space-y-2 pt-2">
                <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                <div className="h-8 w-full bg-muted rounded-xl animate-pulse" />
                <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                <div className="h-5 w-40 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 space-y-4">
            <div className="flex gap-2">
              <div className="h-6 w-24 bg-muted rounded-full animate-pulse" />
              <div className="h-6 w-20 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-8 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-5 w-1/3 bg-muted rounded animate-pulse" />
            <div className="bg-card border border-border/50 rounded-2xl p-5 space-y-2">
              <div className="h-3 w-20 bg-muted rounded animate-pulse" />
              {[1,2,3,4].map(i => <div key={i} className="h-4 bg-muted rounded animate-pulse" />)}
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="h-64 bg-muted rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
  if (!service) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    provider: {
      "@type": "LocalBusiness",
      name: service.company.name,
      email: service.company.email,
      ...(service.company.phone && { telephone: service.company.phone }),
      ...(service.company.address && { address: { "@type": "PostalAddress", streetAddress: service.company.address, addressCountry: "KZ" } }),
    },
    areaServed: service.city ?? "Kazakhstan",
    offers: {
      "@type": "Offer",
      priceCurrency: "KZT",
      priceSpecification: { "@type": "PriceSpecification", minPrice: service.priceFrom, maxPrice: service.priceTo, priceCurrency: "KZT" },
    },
    ...(typeof service.rating === "number" && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: service.rating.toFixed(1),
        reviewCount: service._count?.requests ?? 0,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };

  const images = (service.images?.length ?? 0) > 0
    ? service.images
    : [{ url: "https://placehold.co/800x600/e2e8f0/94a3b8?text=No+photo", id: "ph", serviceId: service.id, order: 0, createdAt: "" }];

  const safeIdx = Math.min(selectedImg, images.length - 1);

  return (
    <div className="min-h-screen bg-muted/30">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {lightboxIdx !== null && (
        <Lightbox images={images} startIndex={lightboxIdx} onClose={() => setLightboxIdx(null)} />
      )}

      <div className="mx-auto max-w-6xl px-4 py-6">

        {/* Breadcrumb */}
        <button onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5 group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" /> {tCommon("back")}
        </button>

        {/* ══ TOP: gallery LEFT + action card RIGHT ══ */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-6 lg:items-stretch">

          {/* Gallery — 3/5 */}
          <div className="lg:col-span-3 flex flex-col h-full">
            {/* Main image — fills remaining height after thumbnail strip */}
            <div className="relative flex-1 min-h-[240px] rounded-2xl overflow-hidden cursor-pointer bg-muted"
              onClick={() => setLightboxIdx(safeIdx)}>
              <img src={images[safeIdx].url} alt={service.name}
                className="h-full w-full object-cover transition-all duration-300 hover:scale-[1.03]" />
              <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/50 backdrop-blur-sm px-2.5 py-1 text-white text-xs font-medium">
                <Camera className="h-3 w-3" /> {safeIdx + 1} / {images.length}
              </div>
            </div>

            {/* Thumbnail strip — always visible */}
            <div className="flex gap-2 mt-2 overflow-x-auto pb-1 shrink-0" style={{ scrollbarWidth: "thin" }}>
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImg(i)}
                  className={`relative shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                    i === safeIdx
                      ? "border-primary shadow-md shadow-primary/20 scale-[1.04]"
                      : "border-transparent opacity-60 hover:opacity-90"
                  }`}
                >
                  <img src={img.url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Action card — 2/5 */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-5 lg:sticky lg:top-20">
              {/* Price */}
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">Price range</p>
                <p className="text-3xl font-black tracking-tight">
                  <Currency value={service.priceFrom} />
                  {service.priceTo !== service.priceFrom && <> – <Currency value={service.priceTo} /></>}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">KZT</p>
              </div>

              {/* Rating */}
              {typeof service.rating === "number" && (
                <div className="flex items-center gap-2 py-3 border-y border-border/40">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className={`h-4 w-4 ${s <= Math.round(service.rating!) ? "fill-amber-400 text-amber-400" : "fill-muted text-muted-foreground/30"}`} />
                    ))}
                  </div>
                  <span className="font-bold text-sm">{service.rating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">· {service._count?.requests ?? 0} requests</span>
                </div>
              )}

              {/* CTA */}
              {requestButton}

              {/* WhatsApp quick contact */}
              {service.company.phone && (
                <a
                  href={`https://wa.me/${service.company.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#25D366] hover:bg-[#1ebe5d] text-white transition-colors shadow-sm"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
              )}

              {/* Share button */}
              <button
                onClick={() => {
                  if (navigator.share) {
                    void navigator.share({ title: service.name, text: service.description.slice(0, 100), url: window.location.href });
                  } else {
                    void navigator.clipboard.writeText(window.location.href).then(() => {
                      toast.success(t("linkCopied"));
                    });
                  }
                }}
                className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-xl text-sm font-medium border border-border hover:bg-muted transition-colors"
              >
                <Share2 className="h-4 w-4" /> {t("share")}
              </button>

              {/* Company block */}
              <div className="pt-1 space-y-3">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">{t("company")}</p>
                <Link href={`/company/${service.companyId}`}
                  className="flex items-center gap-2.5 group hover:bg-primary/5 -mx-2 px-2 py-1.5 rounded-xl transition-colors">
                  {service.company.avatarUrl ? (
                    <img src={service.company.avatarUrl} alt={service.company.name ?? ""} className="h-9 w-9 rounded-xl object-cover border border-border shrink-0" />
                  ) : (
                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                      {(service.company.name ?? service.company.email)[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-semibold text-sm group-hover:text-primary transition-colors truncate">{service.company.name}</span>
                    {service.company.isVerified && (
                      <BadgeCheck className="h-5 w-5 text-blue-500 shrink-0" aria-label="Верифицированная компания" />
                    )}
                  </div>
                </Link>
                <div className="space-y-2">
                  {service.company.phone && (
                    <a href={`tel:${service.company.phone}`}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors rounded-xl hover:bg-primary/5 p-2 -mx-2">
                      <Phone className="h-3.5 w-3.5 shrink-0" /> {service.company.phone}
                    </a>
                  )}
                  <a href={`mailto:${service.company.email}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors rounded-xl hover:bg-primary/5 p-2 -mx-2">
                    <Mail className="h-3.5 w-3.5 shrink-0" /> {service.company.email}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══ BOTTOM: full-width info ══ */}
        <div className="space-y-5">

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_COLORS[service.category] ?? CATEGORY_COLORS.other}`}>
              {SERVICE_CATEGORY_LABELS[service.category]}
            </span>
            {service.city && (
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> {service.city}
              </span>
            )}
          </div>

          {/* Title */}
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-1.5">{service.name}</h1>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Building2 className="h-4 w-4" />
              <span>{service.company.name}</span>
              {service.company.isVerified && (
                <BadgeCheck className="h-4 w-4 text-blue-500 shrink-0" aria-label="Верифицированная компания" />
              )}
            </div>
          </div>

          {/* Description */}
          <div className="bg-card border border-border/50 rounded-2xl p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">{t("description")}</p>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{service.description}</p>
          </div>

          {/* Availability */}
          {(service.startDate || service.endDate) && (
            <div className="bg-card border border-border/50 rounded-2xl p-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Availability</p>
              <div className="flex gap-6 text-sm">
                {service.startDate && (
                  <div>
                    <p className="text-muted-foreground text-xs">From</p>
                    <p className="font-semibold">{new Date(service.startDate).toLocaleDateString("en", { day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                )}
                {service.endDate && (
                  <div>
                    <p className="text-muted-foreground text-xs">Until</p>
                    <p className="font-semibold">{new Date(service.endDate).toLocaleDateString("en", { day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {service.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {service.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Company card — full width */}
          <div className="bg-card border border-border/50 rounded-2xl p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">{t("company")}</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Link href={`/company/${service.companyId}`} className="flex items-center gap-3 flex-1 min-w-0 group">
                {service.company.avatarUrl ? (
                  <img src={service.company.avatarUrl} alt={service.company.name ?? ""} className="h-12 w-12 rounded-2xl object-cover border border-border shrink-0" />
                ) : (
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-lg font-black text-primary shrink-0">
                    {(service.company.name ?? service.company.email)[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-base truncate group-hover:text-primary transition-colors">{service.company.name}</span>
                    {service.company.isVerified && (
                      <BadgeCheck className="h-5 w-5 text-blue-500 shrink-0" aria-label="Верифицированная компания" />
                    )}
                  </div>
                  {service.company.address && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 shrink-0" /> {service.company.address}
                    </p>
                  )}
                  <p className="text-xs text-primary/70 mt-0.5 group-hover:text-primary transition-colors">{t("viewProfile")} →</p>
                </div>
              </Link>
              <div className="flex flex-wrap gap-3 shrink-0">
                {service.company.phone && (
                  <a href={`tel:${service.company.phone}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors bg-muted/50 hover:bg-primary/5 rounded-xl px-3 py-2">
                    <Phone className="h-3.5 w-3.5 shrink-0" /> {service.company.phone}
                  </a>
                )}
                <a href={`mailto:${service.company.email}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors bg-muted/50 hover:bg-primary/5 rounded-xl px-3 py-2">
                  <Mail className="h-3.5 w-3.5 shrink-0" /> {service.company.email}
                </a>
              </div>
            </div>
          </div>

          {/* Map — full width */}
          <LocationCard address={service.address} city={service.city} locationLabel={t("location")} openInLabel={t("openIn2GIS")} />
        </div>

        {/* ══ REVIEWS ══ */}
        {reviews.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/40">
                <MessageSquare className="h-4 w-4 text-amber-600" />
              </div>
              <h2 className="font-bold text-lg">{t("reviews")}</h2>
              <span className="text-sm text-muted-foreground">({reviews.length})</span>
            </div>
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="bg-card border border-border/50 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                        {(review.client?.name ?? review.client?.email ?? "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">
                          {review.client?.name ?? review.client?.email ?? "Anonymous"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString("en", {
                            year: "numeric", month: "long", day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.review && (
                    <p className="text-sm text-muted-foreground leading-relaxed pl-10">
                      {review.review}
                    </p>
                  )}
                  {review.companyReply && (
                    <div className="pl-10 ml-2 border-l-2 border-primary/20">
                      <p className="text-xs font-semibold text-muted-foreground mb-0.5">Company reply:</p>
                      <p className="text-sm text-muted-foreground italic">{review.companyReply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ══ SIMILAR SERVICES ══ */}
      {similar.length > 0 && (
        <div className="mx-auto max-w-6xl px-4 pb-8 mt-8">
          <div className="flex items-center gap-2.5 mb-4">
            <h2 className="font-bold text-lg">{t("similarServices")}</h2>
            <span className="text-sm text-muted-foreground">({similar.length})</span>
          </div>
          <div className="flex flex-col gap-3">
            {similar.map((s) => <OrgCard key={s.id} service={s} />)}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

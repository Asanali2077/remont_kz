"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  CheckCircle2, Building2, User as UserIcon, Phone, Mail,
  MapPin, Calendar, Star, FileText, Printer, ArrowLeft,
  Clock, Zap, PlayCircle, Hash, BadgeCheck, DollarSign,
} from "lucide-react";
import { api } from "@/lib/api";
import { RequestRecord } from "@/lib/types";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { formatBudget, fmtNum } from "@/lib/utils";
import { toast } from "sonner";

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
      ))}
    </div>
  );
}

export default function OrderSummaryPage() {
  const t = useTranslations("orderSummary");
  const locale = useLocale();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [req, setReq] = useState<RequestRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);
  const backHref = user?.role === "company" ? "/company/dashboard?tab=requests" : "/my-requests";
  const backLabel = user?.role === "company" ? t("orders") : t("myOrders");

  const STATUS_LABELS: Record<string, string> = {
    new: t("statusNew"), accepted: t("statusAccepted"),
    in_progress: t("statusInProgress"), completed: t("statusCompleted"),
    cancelled: t("statusCancelled"),
  };

  function formatDate(d: string | null | undefined) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString(locale, {
      day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  function formatDateShort(d: string | null | undefined) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString(locale, {
      day: "numeric", month: "long", year: "numeric",
    });
  }

  useEffect(() => {
    api.getRequest(id)
      .then(setReq)
      .catch(() => toast.error(t("loadError")))
      .finally(() => setLoading(false));
  }, [id, t]);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!req) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <FileText className="h-16 w-16 text-muted-foreground/30" />
        <p className="text-muted-foreground">{t("notFound")}</p>
        <Link href={backHref}>
          <Button variant="outline">← {t("back")}</Button>
        </Link>
      </div>
    );
  }

  const orderId = `#${req.id.slice(0, 8).toUpperCase()}`;
  const timeline = [
    { icon: FileText,    label: t("created"),   date: req.createdAt, done: true },
    { icon: Zap,         label: t("accepted"),  date: req.updatedAt, done: ["accepted","in_progress","completed"].includes(req.status) },
    { icon: PlayCircle,  label: t("started"),   date: req.updatedAt, done: ["in_progress","completed"].includes(req.status) },
    { icon: BadgeCheck,  label: t("completed"), date: req.updatedAt, done: req.status === "completed" },
  ];

  return (
    /* Page background */
    <div className="min-h-screen print:min-h-0 print:h-[297mm] print:overflow-hidden bg-gray-200 dark:bg-gray-950 print:bg-white py-0">

      {/* Toolbar — hidden on print, aligned to navbar max-w-6xl bounds */}
      <div className="print:hidden bg-white dark:bg-gray-900 border-b border-border/40 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href={backHref}>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Button>
          </Link>
          <Button onClick={handlePrint} size="sm" className="gap-2">
            <Printer className="h-4 w-4" />
            {t("printPdf")}
          </Button>
        </div>
      </div>

      {/* A4 sheet wrapper */}
      <div className="print:hidden flex justify-center py-8">
        <A4Document t={t} req={req} orderId={orderId} timeline={timeline} formatDate={formatDate} formatDateShort={formatDateShort} STATUS_LABELS={STATUS_LABELS} printRef={printRef} />
      </div>

      {/* Print-only: document without wrapper padding */}
      <div className="hidden print:block">
        <A4Document t={t} req={req} orderId={orderId} timeline={timeline} formatDate={formatDate} formatDateShort={formatDateShort} STATUS_LABELS={STATUS_LABELS} printRef={printRef} />
      </div>
    </div>
  );
}

/* ── The actual A4 document ── */
function A4Document({
  t, req, orderId, timeline, formatDate, formatDateShort, STATUS_LABELS, printRef,
}: {
  t: ReturnType<typeof useTranslations<"orderSummary">>;
  req: RequestRecord;
  orderId: string;
  timeline: { icon: React.ElementType; label: string; date: string | null | undefined; done: boolean }[];
  formatDate: (d: string | null | undefined) => string;
  formatDateShort: (d: string | null | undefined) => string;
  STATUS_LABELS: Record<string, string>;
  printRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div
      ref={printRef}
      /* A4: 210mm × 297mm. Screen px approx; print exact mm */
      className="w-[794px] min-h-[1123px] print:h-[297mm] print:min-h-0 bg-white print:bg-white shadow-2xl print:shadow-none rounded-lg print:rounded-none overflow-hidden flex flex-col"
    >
      {/* ── HEADER ── */}
      <div className="bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] px-10 py-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center text-base font-black">R</div>
              <span className="text-xl font-bold tracking-tight">Remont.kz</span>
            </div>
            <p className="text-white/70 text-sm">{t("actTitle")}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black font-mono">{orderId}</div>
            <div className="text-white/70 text-sm mt-1">{t("createdDate", { date: formatDateShort(req.createdAt) })}</div>
          </div>
        </div>

        {/* Status banner */}
        <div className="mt-6 flex items-center gap-3 bg-white/15 rounded-xl px-5 py-3.5">
          <CheckCircle2 className="h-5 w-5 text-green-300 shrink-0" />
          <div>
            <div className="font-semibold">
              {t("statusLabel")}: <span className="text-green-200">{STATUS_LABELS[req.status] ?? req.status}</span>
            </div>
            {req.status === "completed" && (
              <div className="text-white/60 text-sm mt-0.5">
                {t("completedDate", { date: formatDateShort(req.updatedAt) })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="flex-1 px-10 py-8 space-y-7">

        {/* Parties row */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <UserIcon className="h-4 w-4 text-blue-600" />
              <span className="font-bold text-xs uppercase tracking-wider text-gray-500">{t("client")}</span>
            </div>
            <p className="font-semibold text-gray-900">{req.client?.name ?? "—"}</p>
            {req.client?.email && (
              <div className="flex items-center gap-1.5 mt-1.5 text-sm text-gray-500">
                <Mail className="h-3.5 w-3.5" />{req.client.email}
              </div>
            )}
            {req.client?.phone && (
              <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                <Phone className="h-3.5 w-3.5" />{req.client.phone}
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="h-4 w-4 text-blue-600" />
              <span className="font-bold text-xs uppercase tracking-wider text-gray-500">{t("contractor")}</span>
            </div>
            {req.company ? (
              <>
                <p className="font-semibold text-gray-900">{req.company.name ?? "—"}</p>
                {req.company.email && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-sm text-gray-500">
                    <Mail className="h-3.5 w-3.5" />{req.company.email}
                  </div>
                )}
                {req.company.phone && (
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                    <Phone className="h-3.5 w-3.5" />{req.company.phone}
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-400 text-sm">{t("noContractor")}</p>
            )}
          </div>
        </div>

        {/* Order Details + Timeline — side by side */}
        <div className="grid grid-cols-2 gap-6 items-start">

          {/* Order details table */}
          <div>
            <h2 className="font-bold text-base mb-3 flex items-center gap-2 text-gray-800">
              <FileText className="h-4 w-4 text-blue-600" />
              {t("orderDetails")}
            </h2>
            <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden text-sm">
              {req.service && <Row label={t("service")} value={req.service.name} />}
              <Row label={t("category")} value={req.service?.category ?? req.category ?? "—"} />
              {req.city && <RowIcon label={t("city")} value={req.city} icon={<MapPin className="h-3.5 w-3.5 text-gray-400" />} />}
              {req.deadline && <RowIcon label={t("deadline")} value={formatDateShort(req.deadline)} icon={<Calendar className="h-3.5 w-3.5 text-gray-400" />} />}
              {(req.budgetFrom || req.budgetTo) && <Row label={t("budget")} value={formatBudget(req.budgetFrom ?? null, req.budgetTo ?? null) ?? "—"} />}
              {req.finalPrice && (
                <RowIcon
                  label={t("finalPrice")}
                  value={`${fmtNum(req.finalPrice)} ₸`}
                  icon={<DollarSign className="h-3.5 w-3.5 text-blue-600" />}
                  highlight
                />
              )}
              <Row label={t("orderNumber")} value={orderId} mono />
              <Row label={t("created")} value={formatDate(req.createdAt)} />
            </div>
          </div>

          {/* Timeline — aligned to Order Details top */}
          <div>
            <h2 className="font-bold text-base mb-3 flex items-center gap-2 text-gray-800">
              <Clock className="h-4 w-4 text-blue-600" />
              {t("timeline")}
            </h2>
            <div className="relative pl-7">
              <div className="absolute left-3 top-3 bottom-3 w-px bg-gray-200" />
              {timeline.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="relative mb-5 last:mb-0">
                    <div className={`absolute -left-7 h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                      item.done ? "border-blue-600 bg-blue-600 text-white" : "border-gray-200 bg-white text-gray-300"
                    }`}>
                      <Icon className="h-3 w-3" />
                    </div>
                    <div className={`ml-2 ${item.done ? "" : "opacity-30"}`}>
                      <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                      {item.done && <p className="text-xs text-gray-400 mt-0.5">{formatDate(item.date)}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Description — full width below */}
        <div>
          <h2 className="font-bold text-base mb-3 flex items-center gap-2 text-gray-800">
            <Hash className="h-4 w-4 text-blue-600" />
            {t("description")}
          </h2>
          <div className="bg-gray-50 rounded-xl px-5 py-4">
            <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-wrap">{req.description}</p>
          </div>
        </div>

        {/* Rating & Review */}
        {req.status === "completed" && req.rating !== null && req.rating !== undefined && (
          <div>
            <h2 className="font-bold text-base mb-3 flex items-center gap-2 text-gray-800">
              <Star className="h-4 w-4 text-amber-500" />
              {t("ratingAndReview")}
            </h2>
            <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-5 space-y-2">
              <div className="flex items-center gap-3">
                <StarRow rating={req.rating} />
                <span className="font-bold text-lg text-amber-600">{req.rating}/5</span>
              </div>
              {req.review && (
                <p className="text-sm text-gray-500 italic">&ldquo;{req.review}&rdquo;</p>
              )}
              {req.companyReply && (
                <div className="pl-4 border-l-2 border-blue-200 mt-2">
                  <p className="text-xs text-gray-400 font-semibold mb-1">{t("companyReply")}:</p>
                  <p className="text-sm text-gray-500 italic">{req.companyReply}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div className="px-10 py-5 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400">{t("marketplaceDesc")}</span>
        <span className="text-xs text-gray-400">{t("docGenerated", { date: formatDateShort(new Date().toISOString()) })}</span>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-white">
      <span className="text-gray-500">{label}</span>
      <span className={`font-medium text-gray-800 text-right ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

function RowIcon({ label, value, icon, highlight }: { label: string; value: string; icon: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-4 py-2.5 ${highlight ? "bg-blue-50" : "bg-white"}`}>
      <span className="text-gray-500">{label}</span>
      <div className={`flex items-center gap-1.5 font-medium ${highlight ? "text-blue-600 font-bold" : "text-gray-800"}`}>
        {icon}
        {value}
      </div>
    </div>
  );
}

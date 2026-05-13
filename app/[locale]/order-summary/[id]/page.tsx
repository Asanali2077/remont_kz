"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import {
  CheckCircle2, Building2, User as UserIcon, Phone, Mail,
  MapPin, Calendar, Star, FileText, Printer, ArrowLeft,
  Clock, Zap, PlayCircle, Hash, BadgeCheck,
} from "lucide-react";
import { api } from "@/lib/api";
import { RequestRecord } from "@/lib/types";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { formatBudget } from "@/lib/utils";
import { toast } from "sonner";

function formatDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ru-KZ", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatDateShort(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ru-KZ", {
    day: "numeric", month: "long", year: "numeric",
  });
}

const STATUS_LABELS: Record<string, string> = {
  new: "Новая", accepted: "Принята", in_progress: "В работе",
  completed: "Завершена", cancelled: "Отменена",
};

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
}

export default function OrderSummaryPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [req, setReq] = useState<RequestRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);
  const backHref = user?.role === "company" ? "/company/dashboard?tab=requests" : "/my-requests";

  useEffect(() => {
    api.getRequest(id)
      .then(setReq)
      .catch(() => toast.error("Не удалось загрузить данные заказа"))
      .finally(() => setLoading(false));
  }, [id]);

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
        <p className="text-muted-foreground">Заказ не найден</p>
        <Link href={backHref}>
          <Button variant="outline">← Назад</Button>
        </Link>
      </div>
    );
  }

  const orderId = `#${req.id.slice(0, 8).toUpperCase()}`;
  const timeline = [
    { icon: FileText,    label: "Создан",      date: req.createdAt, done: true },
    { icon: Zap,         label: "Оффер принят", date: req.updatedAt, done: ["accepted","in_progress","completed"].includes(req.status) },
    { icon: PlayCircle,  label: "В работе",    date: req.updatedAt,  done: ["in_progress","completed"].includes(req.status) },
    { icon: BadgeCheck,  label: "Завершён",    date: req.updatedAt,  done: req.status === "completed" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 print:bg-white">
      {/* Toolbar — hidden on print */}
      <div className="print:hidden sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-border/40 px-4 py-3 flex items-center justify-between">
        <Link href={backHref}>
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            {user?.role === "company" ? "Заказы" : "Мои заказы"}
          </Button>
        </Link>
        <Button onClick={handlePrint} size="sm" className="gap-2">
          <Printer className="h-4 w-4" />
          Распечатать / PDF
        </Button>
      </div>

      {/* Document */}
      <div ref={printRef} className="max-w-3xl mx-auto my-8 print:my-0 bg-white dark:bg-gray-900 print:bg-white shadow-xl print:shadow-none rounded-2xl print:rounded-none overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 print:from-blue-600 print:to-blue-500 px-8 py-8 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center text-sm font-black">R</div>
                <span className="text-lg font-bold tracking-tight">Remont.kz</span>
              </div>
              <p className="text-white/70 text-sm">Акт выполненных работ</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black font-mono">{orderId}</div>
              <div className="text-white/70 text-xs mt-1">от {formatDateShort(req.createdAt)}</div>
            </div>
          </div>

          {/* Status banner */}
          <div className="mt-6 flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
            <CheckCircle2 className="h-5 w-5 text-green-300 shrink-0" />
            <div>
              <div className="font-semibold text-sm">
                Статус: <span className="text-green-200">{STATUS_LABELS[req.status] ?? req.status}</span>
              </div>
              {req.status === "completed" && (
                <div className="text-white/60 text-xs mt-0.5">
                  Завершён {formatDateShort(req.updatedAt)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-7 space-y-8">
          {/* Parties */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Client */}
            <div className="bg-gray-50 dark:bg-gray-800/50 print:bg-gray-50 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <UserIcon className="h-4 w-4 text-primary" />
                <span className="font-bold text-sm uppercase tracking-wide text-muted-foreground">Клиент</span>
              </div>
              <p className="font-semibold">{req.client?.name ?? "—"}</p>
              {req.client?.email && (
                <div className="flex items-center gap-1.5 mt-1.5 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  {req.client.email}
                </div>
              )}
              {req.client?.phone && (
                <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  {req.client.phone}
                </div>
              )}
            </div>

            {/* Company */}
            <div className="bg-gray-50 dark:bg-gray-800/50 print:bg-gray-50 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="font-bold text-sm uppercase tracking-wide text-muted-foreground">Исполнитель</span>
              </div>
              {req.company ? (
                <>
                  <p className="font-semibold">{req.company.name ?? "—"}</p>
                  {req.company.email && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      {req.company.email}
                    </div>
                  )}
                  {req.company.phone && (
                    <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      {req.company.phone}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground text-sm">Исполнитель не назначен</p>
              )}
            </div>
          </div>

          {/* Service / request details */}
          <div>
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Детали заказа
            </h2>
            <div className="divide-y divide-border/50 border border-border/50 rounded-xl overflow-hidden">
              {req.service && (
                <Row label="Услуга" value={req.service.name} />
              )}
              <Row label="Категория" value={req.service?.category ?? req.category ?? "—"} />
              {req.city && (
                <RowIcon label="Город" value={req.city} icon={<MapPin className="h-3.5 w-3.5 text-muted-foreground" />} />
              )}
              {req.deadline && (
                <RowIcon label="Дедлайн" value={formatDateShort(req.deadline)} icon={<Calendar className="h-3.5 w-3.5 text-muted-foreground" />} />
              )}
              {(req.budgetFrom || req.budgetTo) && (
                <Row label="Бюджет" value={formatBudget(req.budgetFrom ?? null, req.budgetTo ?? null) ?? "—"} />
              )}
              <Row label="Номер заказа" value={orderId} mono />
              <Row label="Дата создания" value={formatDate(req.createdAt)} />
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="font-bold text-base mb-3 flex items-center gap-2">
              <Hash className="h-4 w-4 text-primary" />
              Описание работ
            </h2>
            <div className="bg-gray-50 dark:bg-gray-800/50 print:bg-gray-50 rounded-xl p-5">
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{req.description}</p>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              История статусов
            </h2>
            <div className="relative pl-6">
              <div className="absolute left-2.5 top-2 bottom-2 w-px bg-border/50" />
              {timeline.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="relative mb-4 last:mb-0">
                    <div className={`absolute -left-6 h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                      item.done
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-background text-muted-foreground/30"
                    }`}>
                      <Icon className="h-2.5 w-2.5" />
                    </div>
                    <div className={`ml-3 ${item.done ? "opacity-100" : "opacity-30"}`}>
                      <p className="text-sm font-semibold">{item.label}</p>
                      {item.done && <p className="text-xs text-muted-foreground">{formatDate(item.date)}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rating & Review */}
          {req.status === "completed" && req.rating !== null && req.rating !== undefined && (
            <div>
              <h2 className="font-bold text-base mb-3 flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500" />
                Оценка и отзыв
              </h2>
              <div className="bg-amber-50 dark:bg-amber-950/20 print:bg-amber-50 border border-amber-200/50 dark:border-amber-800/30 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <StarRow rating={req.rating} />
                  <span className="font-bold text-lg text-amber-600">{req.rating}/5</span>
                </div>
                {req.review && (
                  <p className="text-sm text-muted-foreground italic">&ldquo;{req.review}&rdquo;</p>
                )}
                {req.companyReply && (
                  <div className="pl-4 border-l-2 border-primary/30 mt-2">
                    <p className="text-xs text-muted-foreground font-semibold mb-1">Ответ исполнителя:</p>
                    <p className="text-sm text-muted-foreground italic">{req.companyReply}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-border/50 pt-6 flex items-center justify-between text-xs text-muted-foreground">
            <span>Remont.kz — маркетплейс услуг по ремонту</span>
            <span>Документ сформирован {formatDateShort(new Date().toISOString())}</span>
          </div>
        </div>
      </div>

      <div className="print:hidden h-8" />
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900/50 print:bg-white">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium text-right ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

function RowIcon({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900/50 print:bg-white">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5 text-sm font-medium">
        {icon}
        {value}
      </div>
    </div>
  );
}

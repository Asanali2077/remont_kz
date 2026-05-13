"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { RequestRecord } from "@/lib/types";
import { Link } from "@/i18n/routing";

const STATUS_COLOR: Record<string, string> = {
  accepted:    "bg-blue-500",
  in_progress: "bg-amber-500",
  completed:   "bg-green-500",
  cancelled:   "bg-red-400",
  new:         "bg-slate-400",
};

const STATUS_LABEL: Record<string, string> = {
  accepted: "Принята", in_progress: "В работе",
  completed: "Завершена", cancelled: "Отменена", new: "Новая",
};

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function firstWeekday(year: number, month: number) {
  // Monday-based (0 = Mon … 6 = Sun)
  const d = new Date(year, month, 1).getDay();
  return (d + 6) % 7;
}

export function CompanyCalendar() {
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed
  const [selected, setSelected] = useState<string | null>(null); // selected date string YYYY-MM-DD

  useEffect(() => {
    api.getRequests({ scope: "assigned" })
      .then(setRequests)
      .catch(() => {/* silent */})
      .finally(() => setLoading(false));
  }, []);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  // Index requests by date (using deadline or updatedAt fallback)
  const byDate = new Map<string, RequestRecord[]>();
  for (const req of requests) {
    const dateStr = req.deadline
      ? req.deadline.slice(0, 10)
      : req.updatedAt.slice(0, 10);
    if (!byDate.has(dateStr)) byDate.set(dateStr, []);
    byDate.get(dateStr)!.push(req);
  }

  const totalDays = daysInMonth(viewYear, viewMonth);
  const startOffset = firstWeekday(viewYear, viewMonth);
  const todayStr = today.toISOString().slice(0, 10);
  const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  const MONTHS = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];

  const selectedReqs = selected ? (byDate.get(selected) ?? []) : [];

  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Календарь заказов
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-xl" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold min-w-[140px] text-center">
            {MONTHS[viewMonth]} {viewYear}
          </span>
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-xl" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-border/50">
          {DAYS.map(d => (
            <div key={d} className={`py-2 text-center text-xs font-bold text-muted-foreground ${d === "Сб" || d === "Вс" ? "text-rose-400/70" : ""}`}>
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {/* Leading empty cells */}
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`e-${i}`} className="h-24 border-r border-b border-border/30 bg-muted/20" />
          ))}

          {/* Day cells */}
          {Array.from({ length: totalDays }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayReqs = byDate.get(dateStr) ?? [];
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selected;
            const weekday = (startOffset + i) % 7; // 0=Mon..6=Sun
            const isWeekend = weekday >= 5;

            return (
              <div
                key={day}
                onClick={() => setSelected(isSelected ? null : dateStr)}
                className={`h-24 border-r border-b border-border/30 p-1.5 cursor-pointer transition-colors ${
                  isSelected ? "bg-primary/5 ring-1 ring-inset ring-primary/30" :
                  isToday ? "bg-primary/5" : isWeekend ? "bg-muted/20" : "hover:bg-muted/30"
                }`}
              >
                <div className={`text-xs font-bold mb-1 h-5 w-5 flex items-center justify-center rounded-full ${
                  isToday ? "bg-primary text-primary-foreground" : isWeekend ? "text-rose-400/80" : "text-muted-foreground"
                }`}>
                  {day}
                </div>
                <div className="space-y-0.5 overflow-hidden">
                  {dayReqs.slice(0, 3).map((req) => (
                    <div
                      key={req.id}
                      className={`text-[9px] leading-tight rounded px-1 py-0.5 text-white font-medium truncate ${STATUS_COLOR[req.status] ?? "bg-slate-400"}`}
                    >
                      {req.service?.name ?? "Заказ"}
                    </div>
                  ))}
                  {dayReqs.length > 3 && (
                    <div className="text-[9px] text-muted-foreground font-medium pl-1">+{dayReqs.length - 3} ещё</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected day detail */}
      {selected && (
        <div className="bg-card border border-border/50 rounded-2xl p-5">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            {new Date(selected + "T12:00:00").toLocaleDateString("ru-KZ", { day: "numeric", month: "long", year: "numeric" })}
          </h3>
          {selectedReqs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Нет заказов на эту дату</p>
          ) : (
            <div className="space-y-3">
              {selectedReqs.map(req => (
                <Link key={req.id} href={`/chat/${req.id}`}>
                  <div className="flex items-start gap-3 p-3 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors cursor-pointer">
                    <div className={`mt-0.5 h-3 w-3 rounded-full shrink-0 ${STATUS_COLOR[req.status] ?? "bg-slate-400"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{req.service?.name ?? "Заказ"}</span>
                        <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          #{req.id.slice(0, 8).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full text-white ${STATUS_COLOR[req.status]}`}>
                          {STATUS_LABEL[req.status] ?? req.status}
                        </span>
                        {req.city && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />{req.city}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{req.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(STATUS_LABEL).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className={`h-2.5 w-2.5 rounded-full ${STATUS_COLOR[k]}`} />
            {v}
          </div>
        ))}
      </div>
    </div>
  );
}

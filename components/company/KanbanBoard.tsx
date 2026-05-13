"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { RequestRecord, RequestStatus } from "@/lib/types";
import { SERVICE_CATEGORY_LABELS } from "@/lib/types";
import { toast } from "sonner";
import {
  Clock, CheckCircle2, PlayCircle, Zap, User,
  MessageSquare, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { timeAgo, formatBudget, fmtNum } from "@/lib/utils";
import { OfferDialog } from "@/components/OfferDialog";

const COLUMN_DEFS: { id: RequestStatus | "unassigned"; labelKey: string; icon: React.ElementType; color: string; headerColor: string }[] = [
  { id: "unassigned",  labelKey: "unassigned",  icon: Star,         color: "bg-amber-50 dark:bg-amber-950/20",    headerColor: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300" },
  { id: "new",         labelKey: "kanban.new",  icon: Clock,        color: "bg-slate-50 dark:bg-slate-900/30",    headerColor: "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300" },
  { id: "accepted",    labelKey: "kanban.accepted", icon: CheckCircle2, color: "bg-blue-50 dark:bg-blue-950/20",  headerColor: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300" },
  { id: "in_progress", labelKey: "kanban.inProgress", icon: PlayCircle, color: "bg-violet-50 dark:bg-violet-950/20", headerColor: "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300" },
  { id: "completed",   labelKey: "kanban.completed", icon: Zap,      color: "bg-green-50 dark:bg-green-950/20",   headerColor: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300" },
];


function KanbanCard({ request, onMove, onOffer, myId }: {
  request: RequestRecord;
  onMove: (id: string, status: RequestStatus) => void;
  onOffer: (r: RequestRecord) => void;
  myId: string;
}) {
  const t = useTranslations("requests");
  const isAssigned = !!request.companyId && request.companyId === myId;
  const isUnassigned = !request.companyId;
  const myOffer = request.offers?.find(o => o.companyId === myId);

  return (
    <div className="bg-card border border-border/50 rounded-xl p-3.5 space-y-3 hover:shadow-md hover:border-border transition-all duration-200">
      {/* Top row: client + time */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
            {(request.client?.name ?? request.client?.email ?? "?")[0].toUpperCase()}
          </div>
          <span className="text-xs font-medium text-muted-foreground truncate max-w-[100px]">
            {request.client?.name ?? request.client?.email ?? "Client"}
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo(request.createdAt)}</span>
      </div>

      {/* Title */}
      <div>
        <p className="text-sm font-semibold leading-snug line-clamp-2">
          {request.service?.name || "Custom request"}
        </p>
        {request.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{request.description}</p>
        )}
      </div>

      {/* Meta chips */}
      <div className="flex flex-wrap gap-1.5">
        {request.category && (
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
            {SERVICE_CATEGORY_LABELS[request.category]}
          </span>
        )}
        {request.city && (
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
            📍 {request.city}
          </span>
        )}
        {formatBudget(request.budgetFrom, request.budgetTo) && (
          <span className="inline-flex items-center rounded-full bg-primary/8 text-primary px-2 py-0.5 text-[10px] font-semibold">
            {formatBudget(request.budgetFrom, request.budgetTo)}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-1.5 pt-1 border-t border-border/40">
        {isUnassigned && !myOffer && (
          <Button size="sm" className="h-7 text-[11px] rounded-lg gap-1 flex-1" onClick={() => onOffer(request)}>
            <CheckCircle2 className="h-3 w-3" /> {t("makeOffer")}
          </Button>
        )}
        {isUnassigned && myOffer && (
          <span className="text-[11px] text-muted-foreground px-2 py-1">
            {t("makeOffer")}: {fmtNum(myOffer.price)} ₸
          </span>
        )}
        {isAssigned && request.status === "new" && (
          <Button size="sm" className="h-7 text-[11px] rounded-lg flex-1" onClick={() => onMove(request.id, "accepted")}>
            {t("acceptOffer")}
          </Button>
        )}
        {isAssigned && request.status === "accepted" && (
          <Button size="sm" variant="outline" className="h-7 text-[11px] rounded-lg flex-1" onClick={() => onMove(request.id, "in_progress")}>
            {t("workStarted")}
          </Button>
        )}
        {isAssigned && request.status === "in_progress" && (
          <Button size="sm" variant="outline" className="h-7 text-[11px] rounded-lg flex-1 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400" onClick={() => onMove(request.id, "completed")}>
            {t("workCompleted")}
          </Button>
        )}
        {isAssigned && (request.status === "accepted" || request.status === "in_progress") && (
          <Link href={`/chat/${request.id}` as `/chat/${string}`}>
            <Button size="sm" variant="ghost" className="h-7 text-[11px] rounded-lg px-2">
              <MessageSquare className="h-3 w-3" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({ userId }: { userId: string }) {
  const t = useTranslations("company");
  const tCommon = useTranslations("common");
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [offerTarget, setOfferTarget] = useState<RequestRecord | null>(null);

  const COLUMNS = COLUMN_DEFS.map(col => ({
    ...col,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    label: col.labelKey === "unassigned" ? tCommon("all") : t(col.labelKey as any),
  }));

  const load = useCallback(async () => {
    setLoading(true);
    try { setRequests(await api.getRequests({ scope: "all" })); }
    catch { toast.error("Failed to load requests"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function handleMove(requestId: string, status: RequestStatus) {
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
    try { await api.updateRequest(requestId, { status }); toast.success("Status updated"); }
    catch { toast.error("Failed to update"); void load(); }
  }

  function getColumn(col: typeof COLUMNS[number]) {
    if (col.id === "unassigned") return requests.filter(r => !r.companyId);
    return requests.filter(r => r.companyId === userId && r.status === col.id);
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {COLUMNS.map(c => (
          <div key={c.id} className="space-y-3">
            <div className="h-8 rounded-xl bg-muted animate-pulse" />
            {[1,2].map(i => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 overflow-x-auto pb-2">
        {COLUMNS.map(col => {
          const items = getColumn(col);
          const Icon = col.icon;
          return (
            <div key={col.id} className={`rounded-2xl p-3 min-h-[300px] ${col.color}`}>
              {/* Column header */}
              <div className={`flex items-center gap-2 rounded-xl px-3 py-2 mb-3 ${col.headerColor}`}>
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="text-xs font-bold flex-1">{col.label}</span>
                <span className="text-xs font-black bg-background/60 px-1.5 py-0.5 rounded-full">{items.length}</span>
              </div>

              {/* Cards */}
              <div className="space-y-2.5">
                {items.length === 0 ? (
                  <div className="text-center py-8 text-xs text-muted-foreground/60">
                    <User className="h-6 w-6 mx-auto mb-1 opacity-30" />
                    Empty
                  </div>
                ) : (
                  items.map(r => (
                    <KanbanCard key={r.id} request={r} onMove={handleMove} onOffer={setOfferTarget} myId={userId} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <OfferDialog
        request={offerTarget}
        open={offerTarget !== null}
        onOpenChange={(v) => { if (!v) setOfferTarget(null); }}
        onSubmit={async (price, message) => {
          if (!offerTarget) return;
          await api.createOffer(offerTarget.id, { price, message: message || undefined });
          toast.success("Offer sent!");
          setOfferTarget(null);
          void load();
        }}
      />
    </>
  );
}


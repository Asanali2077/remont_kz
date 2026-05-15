"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/routing";
import { LayoutGrid, LayoutList, CheckCircle2, Star, ClipboardList, Download, DollarSign, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { RequestRecord, RequestStatus, SERVICE_CATEGORY_LABELS } from "@/lib/types";
import { formatBudget, formatDate, fmtNum } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";
import { KanbanBoard } from "./KanbanBoard";
import { StatusBadge } from "@/components/StatusBadge";
import { OfferDialog } from "@/components/OfferDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type RequestFilter = RequestStatus | "all";

async function fetchRequests(statusFilter: RequestFilter, forMe: boolean) {
  return api.getRequests({ scope: forMe ? "unassigned" : "browse", status: statusFilter === "all" ? undefined : statusFilter });
}


const PAGE_SIZE = 6;

async function downloadCsv() {
  const session = localStorage.getItem("session:user");
  const token = session ? JSON.parse(session).token : null;
  const res = await fetch("/api/company/export", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) { toast.error("Export failed"); return; }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `requests-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function RequestsManagement() {
  const t = useTranslations("company");
  const tReq = useTranslations("requests");
  const tCommon = useTranslations("common");
  const { user } = useAuth();

  const TAB_OPTIONS: { value: RequestFilter; label: string }[] = [
    { value: "all",         label: tCommon("all") },
    { value: "new",         label: tReq("status.new") },
    { value: "accepted",    label: tReq("status.accepted") },
    { value: "in_progress", label: tReq("status.in_progress") },
    { value: "completed",   label: tReq("status.completed") },
  ];
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<RequestFilter>("all");
  const [forMe, setForMe] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [offerDialogRequestId, setOfferDialogRequestId] = useState<string | null>(null);
  const [offerSubmitting, setOfferSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [replyRequestId, setReplyRequestId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [startWorkId, setStartWorkId] = useState<string | null>(null);
  const [finalPriceInput, setFinalPriceInput] = useState("");

  useEffect(() => {
    void (async () => {
      try { setLoading(true); setRequests(await fetchRequests(statusFilter, forMe)); }
      catch (e) { toast.error(e instanceof Error ? e.message : tCommon("error")); }
      finally { setLoading(false); }
    })();
    setPage(1);
  }, [statusFilter, forMe]);

  async function updateStatus(requestId: string, status: RequestStatus, finalPrice?: number) {
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status, ...(finalPrice && { finalPrice }) } : r));
    try { await api.updateRequest(requestId, { status, ...(finalPrice && { finalPrice }) }); toast.success(t("updated")); }
    catch (e) { toast.error(e instanceof Error ? e.message : tCommon("error")); setRequests(await fetchRequests(statusFilter, forMe)); }
  }

  async function confirmStartWork() {
    const price = parseInt(finalPriceInput, 10);
    if (!startWorkId || isNaN(price) || price <= 0) return;
    const id = startWorkId;
    setStartWorkId(null);
    setFinalPriceInput("");
    await updateStatus(id, "in_progress", price);
  }

  async function handleSubmitOffer(price: number, message: string): Promise<void> {
    if (!offerDialogRequestId) return;
    setOfferSubmitting(true);
    try {
      await api.createOffer(offerDialogRequestId, { price, message: message || undefined });
      toast.success(t("offerSent"));
      setOfferDialogRequestId(null);
      setRequests(await fetchRequests(statusFilter, forMe));
    } catch (e) { toast.error(e instanceof Error ? e.message : tCommon("error")); }
    finally { setOfferSubmitting(false); }
  }

  async function handleReply() {
    if (!replyRequestId || !replyText.trim()) return;
    setReplySubmitting(true);
    try {
      await api.replyToReview(replyRequestId, replyText.trim());
      toast.success(t("replySent"));
      setReplyRequestId(null); setReplyText("");
      setRequests(await fetchRequests(statusFilter, forMe));
    } catch (e) { toast.error(e instanceof Error ? e.message : tCommon("error")); }
    finally { setReplySubmitting(false); }
  }

  const assigned   = useMemo(() => requests.filter(r => Boolean(r.companyId)), [requests]);
  const unassigned = useMemo(() => requests.filter(r => !r.companyId), [requests]);
  const myId = user?.id ?? "";
  const offerDialogReq = unassigned.find(r => r.id === offerDialogRequestId) ?? null;

  const totalPages = Math.ceil(assigned.length / PAGE_SIZE);
  const assignedPage = assigned.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* Tab counts */
  const counts = useMemo(() => ({
    all: requests.length,
    new: requests.filter(r => r.status === "new").length,
    accepted: requests.filter(r => r.status === "accepted").length,
    in_progress: requests.filter(r => r.status === "in_progress").length,
    completed: requests.filter(r => r.status === "completed").length,
    cancelled: requests.filter(r => r.status === "cancelled").length,
  }), [requests]);

  if (loading) return (
    <div className="space-y-3">
      {[1,2,3].map(i => <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />)}
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{t("requests")}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{requests.length} total · {unassigned.length} available</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setForMe(v => !v)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
              forMe
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30"
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            {t("forMe")}
          </button>
          <Button variant="outline" size="sm" className="h-8 rounded-xl gap-1.5 text-xs" onClick={downloadCsv}>
            <Download className="h-3.5 w-3.5" /> CSV
          </Button>
          <div className="flex items-center gap-1 border border-border/50 rounded-xl p-0.5 bg-card">
            <button onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              <LayoutList className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode("kanban")}
              className={`p-2 rounded-lg transition-all ${viewMode === "kanban" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Kanban view */}
      {viewMode === "kanban" && user?.id && (
        <KanbanBoard userId={user.id} />
      )}

      {/* List view */}
      {viewMode === "list" && (
        <>
          {/* Status tabs */}
          <div className="flex flex-wrap gap-1.5">
            {TAB_OPTIONS.map(({ value, label }) => (
              <button key={value} onClick={() => setStatusFilter(value)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  statusFilter === value ? "bg-primary text-primary-foreground shadow-sm" : "bg-card border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30"
                }`}>
                {label}
                <span className={`rounded-full px-1.5 py-0 text-[10px] font-black ${statusFilter === value ? "bg-white/25" : "bg-muted"}`}>
                  {counts[value]}
                </span>
              </button>
            ))}
          </div>

          {/* Assigned requests */}
          {assigned.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">{tReq("offers")}</h3>
              <div className="space-y-3">
                {assignedPage.map(req => (
                  <RequestCard key={req.id} req={req}
                    onUpdateStatus={updateStatus}
                    onStartWork={id => { setStartWorkId(id); setFinalPriceInput(""); }}
                    onReply={(id) => { setReplyRequestId(id); setReplyText(""); }} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button variant="outline" size="sm" className="rounded-xl" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</Button>
                  <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
                  <Button variant="outline" size="sm" className="rounded-xl" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</Button>
                </div>
              )}
            </section>
          )}

          {/* Unassigned */}
          {unassigned.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">{tReq("noOffers")}</h3>
              <div className="space-y-3">
                {unassigned.slice(0, 10).map(req => (
                  <UnassignedCard key={req.id} req={req} myId={myId} onOffer={setOfferDialogRequestId} />
                ))}
              </div>
            </section>
          )}

          {assigned.length === 0 && unassigned.length === 0 && (
            <div className="text-center py-14 rounded-2xl border border-dashed border-border/60 bg-card">
              <ClipboardList className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-semibold">No requests found</p>
              <p className="text-sm text-muted-foreground mt-1">Try a different status filter</p>
            </div>
          )}
        </>
      )}

      {/* Offer dialog */}
      {offerDialogReq && (
        <OfferDialog request={offerDialogReq} open={!!offerDialogRequestId}
          onOpenChange={v => { if (!v) setOfferDialogRequestId(null); }}
          onSubmit={handleSubmitOffer} submitting={offerSubmitting} />
      )}

      {/* Final price dialog */}
      <Dialog open={startWorkId !== null} onOpenChange={v => { if (!v) { setStartWorkId(null); setFinalPriceInput(""); } }}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              {tReq("finalPriceTitle")}
            </DialogTitle>
            <DialogDescription>{tReq("finalPriceDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {tReq("finalPrice")}
            </Label>
            <div className="relative">
              <Input
                type="number"
                min={1}
                value={finalPriceInput}
                onChange={e => setFinalPriceInput(e.target.value)}
                placeholder={tReq("finalPricePlaceholder")}
                className="rounded-xl pr-8"
                autoFocus
                onKeyDown={e => { if (e.key === "Enter") void confirmStartWork(); }}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">₸</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setStartWorkId(null); setFinalPriceInput(""); }}>
              {tCommon("cancel")}
            </Button>
            <Button
              onClick={() => void confirmStartWork()}
              disabled={!finalPriceInput || parseInt(finalPriceInput, 10) <= 0}
            >
              {tReq("finalPriceStart")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reply dialog */}
      <Dialog open={replyRequestId !== null} onOpenChange={v => { if (!v) setReplyRequestId(null); }}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader><DialogTitle>{tReq("review")}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <Textarea rows={4} placeholder="Write a professional response to the client's review…"
              value={replyText} onChange={e => setReplyText(e.target.value)} maxLength={1000} className="rounded-xl" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setReplyRequestId(null)} className="rounded-xl">{tCommon("cancel")}</Button>
              <Button onClick={() => void handleReply()} disabled={!replyText.trim() || replySubmitting} className="rounded-xl">
                {replySubmitting ? tCommon("loading") : tCommon("send")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ── Assigned request card ── */
function RequestCard({ req, onUpdateStatus, onStartWork, onReply }: {
  req: RequestRecord;
  onUpdateStatus: (id: string, s: RequestStatus) => void;
  onStartWork: (id: string) => void;
  onReply?: (id: string) => void;
}) {
  const t = useTranslations("company");
  const tReq = useTranslations("requests");
  const borderColor = ({
    new: "border-l-slate-300 dark:border-l-slate-600",
    accepted: "border-l-blue-400",
    in_progress: "border-l-amber-400",
    completed: "border-l-green-500",
    cancelled: "border-l-red-400",
  } as Record<string, string>)[req.status] ?? "border-l-border";

  return (
    <div className={`bg-card border border-l-4 rounded-2xl overflow-hidden ${borderColor}`}>
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-sm leading-snug">{req.service?.name || t("customRequest")}</h4>
              <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">#{req.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-muted-foreground">
              {req.client?.name && <span>👤 {req.client.name}</span>}
              {req.category && <span>{SERVICE_CATEGORY_LABELS[req.category]}</span>}
              {req.city && <span>📍 {req.city}</span>}
              <span>{formatDate(req.createdAt)}</span>
            </div>
          </div>
          <StatusBadge status={req.status} />
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{req.description}</p>

        {formatBudget(req.budgetFrom, req.budgetTo) && (
          <p className="text-xs mb-3"><span className="text-muted-foreground">Budget: </span><span className="font-semibold">{formatBudget(req.budgetFrom, req.budgetTo)}</span></p>
        )}

        {req.finalPrice && (req.status === "in_progress" || req.status === "completed") && (
          <div className="flex items-center gap-2 rounded-xl bg-primary/5 border border-primary/20 px-3 py-2 mb-3">
            <DollarSign className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="text-xs text-muted-foreground">{tReq("finalPrice")}:</span>
            <span className="text-sm font-bold text-primary ml-auto">{fmtNum(req.finalPrice)} ₸</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 items-center">
          {req.status === "new" && (
            <Button size="sm" className="h-8 rounded-xl text-xs gap-1" onClick={() => onUpdateStatus(req.id, "accepted")}>
              <CheckCircle2 className="h-3.5 w-3.5" /> {tReq("acceptOffer")}
            </Button>
          )}
          {req.status === "accepted" && (
            <>
              <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs gap-1" onClick={() => onStartWork(req.id)}>
                <DollarSign className="h-3.5 w-3.5" /> {tReq("workStarted")}
              </Button>
              <Link href={`/chat/${req.id}` as `/chat/${string}`}>
                <Button size="sm" variant="ghost" className="h-8 rounded-xl text-xs gap-1.5">💬 Chat</Button>
              </Link>
            </>
          )}
          {req.status === "in_progress" && (
            <>
              <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs border-green-300 dark:border-green-700 text-green-700 dark:text-green-400" onClick={() => onUpdateStatus(req.id, "completed")}>
                ✓ {tReq("workCompleted")}
              </Button>
              <Link href={`/chat/${req.id}` as `/chat/${string}`}>
                <Button size="sm" variant="ghost" className="h-8 rounded-xl text-xs">💬 Chat</Button>
              </Link>
            </>
          )}
          {req.status === "completed" && req.rating !== null && !req.companyReply && onReply && (
            <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs gap-1">
              <Star className="h-3.5 w-3.5" />
              <span onClick={() => onReply(req.id)}>{tReq("review")}</span>
            </Button>
          )}
          {req.companyReply && (
            <p className="text-xs text-muted-foreground">Your reply: &ldquo;{req.companyReply.slice(0, 60)}&hellip;&rdquo;</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Unassigned request card ── */
function UnassignedCard({ req, myId, onOffer }: {
  req: RequestRecord; myId: string; onOffer: (id: string) => void;
}) {
  const t = useTranslations("company");
  const tReq = useTranslations("requests");
  const myOffer = req.offers?.find(o => o.companyId === myId);
  return (
    <div className="bg-card border border-border/50 rounded-2xl px-5 py-4 hover:border-primary/30 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-sm">{req.service?.name || t("customRequest")}</h4>
            <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">#{req.id.slice(0, 8).toUpperCase()}</span>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5 text-xs text-muted-foreground">
            {req.category && <span>{SERVICE_CATEGORY_LABELS[req.category]}</span>}
            {req.city && <span>📍 {req.city}</span>}
            {(() => { const b = formatBudget(req.budgetFrom, req.budgetTo); return b && <span className="font-semibold text-primary">{b}</span>; })()}
          </div>
        </div>
        <Badge variant="outline" className="text-[11px] shrink-0">New</Badge>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{req.description}</p>
      {myOffer ? (
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-primary">Offer sent: {fmtNum(myOffer.price)} ₸</span>
          {myOffer.message ? ` — "${myOffer.message}"` : ""}
        </p>
      ) : (
        <Button size="sm" className="h-8 rounded-xl text-xs gap-1.5 shadow-sm shadow-primary/20" onClick={() => onOffer(req.id)}>
          <CheckCircle2 className="h-3.5 w-3.5" /> {tReq("makeOffer")}
        </Button>
      )}
    </div>
  );
}




"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Star, Phone, Mail, CheckCircle2, Clock, Zap, PlayCircle,
         AlertCircle, Sparkles, Building2, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { RequestRecord, RequestStatus, SERVICE_CATEGORY_LABELS } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { ProtectedRoute } from "@/components/company/ProtectedRoute";
import { ClientSidebar } from "@/components/ClientSidebar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatBudget, fmtNum } from "@/lib/utils";
import { RequestCreateDialog } from "@/components/RequestCreateDialog";

/* ── Timeline stepper ── */
const STEPS: { status: RequestStatus | "offered"; label: string; icon: React.ElementType }[] = [
  { status: "new",         label: "Posted",     icon: Clock },
  { status: "offered",     label: "Offers",     icon: Zap },
  { status: "accepted",    label: "Accepted",   icon: CheckCircle2 },
  { status: "in_progress", label: "In Progress",icon: PlayCircle },
  { status: "completed",   label: "Done",       icon: CheckCircle2 },
];

function getStepIndex(status: RequestStatus, hasOffers: boolean): number {
  if (status === "completed")   return 4;
  if (status === "in_progress") return 3;
  if (status === "accepted")    return 2;
  if (hasOffers)                return 1;
  return 0;
}

function RequestTimeline({ status, hasOffers, offerCount }: { status: RequestStatus; hasOffers: boolean; offerCount: number }) {
  const active = getStepIndex(status, hasOffers);
  return (
    <div className="flex items-center gap-0 overflow-x-auto pb-1">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const done = i < active;
        const current = i === active;
        const isLast = i === STEPS.length - 1;
        return (
          <div key={step.status} className="flex items-center shrink-0">
            <div className="flex flex-col items-center">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all ${
                done    ? "border-primary bg-primary text-primary-foreground" :
                current ? "border-primary bg-primary/10 text-primary" :
                          "border-border bg-background text-muted-foreground/40"
              }`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <span className={`text-[10px] font-semibold mt-1 whitespace-nowrap ${
                current ? "text-primary" : done ? "text-muted-foreground" : "text-muted-foreground/40"
              }`}>
                {step.status === "offered" && offerCount > 0 ? `Offers (${offerCount})` : step.label}
              </span>
            </div>
            {!isLast && (
              <div className={`h-0.5 w-8 md:w-12 mx-1 mb-4 rounded-full transition-all ${done ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}


/* ── Offer card ── */
function OfferCard({ offer, requestId, onAccept, onReject, accepting }: {
  offer: { id: string; companyId: string; price: number; message?: string | null; company?: { name?: string | null; email: string; phone?: string | null } };
  requestId: string;
  onAccept: (requestId: string, companyId: string) => Promise<void>;
  onReject: (requestId: string) => void;
  accepting: boolean;
}) {
  const name = offer.company?.name ?? offer.company?.email ?? "Company";
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-background p-3.5 hover:border-primary/30 hover:shadow-sm transition-all">
      <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
        {name[0].toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-bold">{name}</span>
          <span className="text-base font-black text-primary">{fmtNum(offer.price)} ₸</span>
        </div>
        {offer.message && <p className="text-xs text-muted-foreground line-clamp-2">{offer.message}</p>}
      </div>
      <div className="flex flex-col gap-1.5 shrink-0">
        <Button size="sm" className="h-8 rounded-xl text-xs gap-1 shadow-sm shadow-primary/20"
          disabled={accepting} onClick={() => void onAccept(requestId, offer.companyId)}>
          <CheckCircle2 className="h-3.5 w-3.5" />
          {accepting ? "..." : "Accept"}
        </Button>
        <Button size="sm" variant="ghost" className="h-8 rounded-xl text-xs text-muted-foreground"
          onClick={() => onReject(requestId)}>
          <X className="h-3 w-3 mr-1" /> Decline
        </Button>
      </div>
    </div>
  );
}

/* ── Deadline countdown ── */
function DeadlineCountdown({ deadline }: { deadline: string }) {
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
  if (days < 0) return <span className="text-xs text-destructive font-medium">Просрочен</span>;
  if (days === 0) return <span className="text-xs text-destructive font-medium">Сегодня</span>;
  if (days === 1) return <span className="text-xs text-orange-500 font-medium">Завтра</span>;
  return <span className="text-xs text-muted-foreground">Осталось {days} д.</span>;
}

/* ── Expiry helper ── */
function getExpiry(expiresAt: string | null | undefined): { label: string; expired: boolean } | null {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return { label: "Expired", expired: true };
  const d = Math.ceil(diff / 86400000);
  return { label: `Expires in ${d} day${d !== 1 ? "s" : ""}`, expired: false };
}

/* ════════════════════════════════
   MAIN PAGE
════════════════════════════════ */
export default function MyRequestsPage() {
  const t = useTranslations("requests");
  const tCommon = useTranslations("common");
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [acceptingOfferId, setAcceptingOfferId] = useState<string | null>(null);
  const [reviewRequest, setReviewRequest] = useState<RequestRecord | null>(null);
  const [reviewStars, setReviewStars] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewHover, setReviewHover] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [repeatData, setRepeatData] = useState<{ description: string; city?: string; budgetFrom?: number; budgetTo?: number } | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => { void load(); }, []);

  useEffect(() => {
    if (repeatData) setCreateOpen(true);
  }, [repeatData]);

  async function load() {
    setLoading(true);
    try { setRequests(await api.getRequests()); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed to load"); }
    finally { setLoading(false); }
  }

  async function handleAcceptOffer(requestId: string, companyId: string) {
    setAcceptingOfferId(companyId);
    try { await api.acceptOffer(requestId, companyId); toast.success("Offer accepted!"); await load(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setAcceptingOfferId(null); }
  }

  async function handleCancel() {
    if (!cancelId) return;
    setCancelling(true);
    try { await api.deleteRequest(cancelId); toast.success("Cancelled"); setCancelId(null); await load(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setCancelling(false); }
  }

  async function handleReview() {
    if (!reviewRequest || reviewStars === 0) return;
    setSubmittingReview(true);
    try {
      await api.rateRequest(reviewRequest.id, reviewStars, reviewText.trim() || undefined);
      toast.success("Review submitted!");
      setReviewRequest(null); setReviewStars(0); setReviewText("");
      await load();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setSubmittingReview(false); }
  }

  /* Stats */
  const stats = useMemo(() => ({
    total:     requests.length,
    completed: requests.filter(r => r.status === "completed").length,
    active:    requests.filter(r => ["accepted","in_progress"].includes(r.status)).length,
    spent:     requests.filter(r => r.status === "completed").reduce((sum, r) => sum + (r.budgetFrom ?? 0), 0),
  }), [requests]);

  return (
    <ProtectedRoute requiredRole="client">
      <div className="min-h-screen bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{t("noRequestsDesc")}</p>
            </div>
            <RequestCreateDialog
              trigger={
                <Button className="rounded-xl gap-2 shadow-sm shadow-primary/20">
                  <Sparkles className="h-4 w-4" /> {t("createRequest")}
                </Button>
              }
              onCreated={load}
              open={createOpen}
              onOpenChange={(v) => { setCreateOpen(v); if (!v) setRepeatData(null); }}
              defaultValues={repeatData ?? undefined}
            />
          </div>

          <div className="flex gap-6 items-start">
            <ClientSidebar />

            <div className="flex-1 min-w-0 space-y-5">

              {/* ── Stats ── */}
              {!loading && requests.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Total",     value: stats.total,     color: "text-foreground",       icon: "📋" },
                    { label: "Completed", value: stats.completed, color: "text-green-600",         icon: "✅" },
                    { label: "Active",    value: stats.active,    color: "text-amber-600",         icon: "⚡" },
                    { label: "Requests",  value: `${requests.filter(r => r.status === "new").length} new`, color: "text-primary", icon: "🔔" },
                  ].map(({ label, value, color, icon }) => (
                    <div key={label} className="bg-card border border-border/50 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">{icon}</span>
                        <span className="text-xs text-muted-foreground font-medium">{label}</span>
                      </div>
                      <p className={`text-2xl font-black ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Loading skeleton ── */}
              {loading && (
                <div className="space-y-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="rounded-2xl border bg-card p-5 space-y-4 animate-pulse">
                      <div className="flex justify-between">
                        <div className="h-5 bg-muted rounded w-1/3" />
                        <div className="h-5 bg-muted rounded w-20" />
                      </div>
                      <div className="flex gap-2">
                        {[1,2,3,4,5].map(j => <div key={j} className="flex-1 h-7 bg-muted rounded-full" />)}
                      </div>
                      <div className="h-3 bg-muted rounded w-full" />
                      <div className="h-3 bg-muted rounded w-3/4" />
                    </div>
                  ))}
                </div>
              )}

              {/* ── Empty state / Onboarding ── */}
              {!loading && requests.length === 0 && (
                <div className="bg-card border border-border/50 rounded-2xl p-10 text-center">
                  <div className="text-5xl mb-5">👋</div>
                  <h2 className="text-xl font-bold mb-2">{t("noRequests")}</h2>
                  <p className="text-muted-foreground mb-8 max-w-sm mx-auto text-sm leading-relaxed">
                    {t("noRequestsDesc")}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left mb-8">
                    {[
                      { n: "1", icon: "📝", title: "Describe your task", desc: "Tell us what needs to be done" },
                      { n: "2", icon: "📬", title: "Receive offers",      desc: "Companies respond with prices" },
                      { n: "3", icon: "✅", title: "Choose the best",     desc: "Compare and confirm" },
                    ].map(({ n, icon, title, desc }) => (
                      <div key={n} className="rounded-xl border border-border/50 bg-muted/30 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-black">{n}</span>
                          <span className="text-lg">{icon}</span>
                        </div>
                        <p className="font-semibold text-sm">{title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 justify-center">
                    <RequestCreateDialog
                      trigger={<Button className="rounded-xl gap-2"><Sparkles className="h-4 w-4" /> {t("createRequest")}</Button>}
                      onCreated={load}
                    />
                    <Link href="/repair"><Button variant="outline" className="rounded-xl">{tCommon("more")}</Button></Link>
                  </div>
                </div>
              )}

              {/* ── Request cards ── */}
              {!loading && requests.length > 0 && (
                <div className="space-y-4">
                  {requests.map((req) => {
                    const expiry = getExpiry(req.expiresAt);
                    const isExpired = expiry?.expired && req.status === "new" && !req.companyId;
                    const hasOffers = (req.offers?.length ?? 0) > 0;
                    const isAccepted = !!req.companyId && req.status !== "new";
                    const borderColor = {
                      new:         "border-l-slate-300 dark:border-l-slate-600",
                      accepted:    "border-l-blue-400",
                      in_progress: "border-l-amber-400",
                      completed:   "border-l-green-500",
                    }[req.status] ?? "border-l-border";

                    return (
                      <div key={req.id} className={`bg-card rounded-2xl border border-l-4 overflow-hidden ${borderColor}`}>

                        {/* Card header */}
                        <div className="px-5 pt-5 pb-3">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-base leading-snug">
                                {req.service?.name || "Custom request"}
                              </h3>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                                {req.category && <span>{SERVICE_CATEGORY_LABELS[req.category]}</span>}
                                {req.city && <span>📍 {req.city}</span>}
                                <span>{new Date(req.createdAt).toLocaleDateString("en", { day: "numeric", month: "short" })}</span>
                                {expiry && <span className={expiry.expired ? "text-destructive font-semibold" : "text-amber-600"}>{expiry.label}</span>}
                                {req.status === "new" && req.deadline && <DeadlineCountdown deadline={req.deadline} />}
                              </div>
                            </div>
                            <StatusBadge status={isExpired ? "expired" : req.status} />
                          </div>

                          {/* Timeline */}
                          <RequestTimeline status={req.status} hasOffers={hasOffers} offerCount={req.offers?.length ?? 0} />
                        </div>

                        {/* Card body */}
                        <div className="px-5 pb-5 space-y-4 border-t border-border/40 pt-4">
                          <p className="text-sm text-muted-foreground leading-relaxed">{req.description}</p>

                          {formatBudget(req.budgetFrom, req.budgetTo) && (
                            <p className="text-sm">
                              <span className="text-muted-foreground">Budget: </span>
                              <span className="font-semibold">{formatBudget(req.budgetFrom, req.budgetTo)}</span>
                            </p>
                          )}

                          {/* Assigned company */}
                          {req.companyId && (
                            <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
                              <div className="flex items-center gap-2.5 mb-3">
                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                                  {(req.company?.name ?? req.company?.email ?? "C")[0].toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold">{req.company?.name ?? "Company"}</p>
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Building2 className="h-3 w-3" /> Assigned company
                                  </p>
                                </div>
                              </div>
                              {isAccepted && (
                                <div className="flex flex-wrap gap-2">
                                  {req.company?.phone && (
                                    <a href={`tel:${req.company.phone}`}>
                                      <Button size="sm" variant="outline" className="h-8 rounded-xl gap-1.5 text-xs">
                                        <Phone className="h-3.5 w-3.5" /> {req.company.phone}
                                      </Button>
                                    </a>
                                  )}
                                  {req.company?.email && (
                                    <a href={`mailto:${req.company.email}`}>
                                      <Button size="sm" variant="outline" className="h-8 rounded-xl gap-1.5 text-xs">
                                        <Mail className="h-3.5 w-3.5" /> Email
                                      </Button>
                                    </a>
                                  )}
                                  <Link href={`/chat/${req.id}`}>
                                    <Button size="sm" className="h-8 rounded-xl gap-1.5 text-xs">
                                      💬 Open Chat
                                    </Button>
                                  </Link>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Offers */}
                          {!req.companyId && hasOffers && (
                            <div className="space-y-2.5">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-amber-500" />
                                <p className="text-sm font-semibold">
                                  {req.offers?.length ?? 0} offer{(req.offers?.length ?? 0) !== 1 ? "s" : ""} received — choose one
                                </p>
                              </div>
                              <div className="space-y-2">
                                {(req.offers ?? []).map((offer) => (
                                  <OfferCard
                                    key={offer.id}
                                    offer={offer}
                                    requestId={req.id}
                                    onAccept={handleAcceptOffer}
                                    onReject={() => void api.deleteOffer(req.id).then(load).catch(() => toast.error("Failed"))}
                                    accepting={acceptingOfferId === offer.companyId}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          {!req.companyId && !hasOffers && !isExpired && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <div className="flex gap-0.5">
                                {[1,2,3].map(i => <div key={i} className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />)}
                              </div>
                              Waiting for company offers…
                            </div>
                          )}

                          {/* Actions row */}
                          <div className="flex items-center justify-between pt-1">
                            <div className="flex gap-2">
                              {req.status === "new" && !isExpired && (
                                <Button variant="outline" size="sm" className="h-8 rounded-xl text-xs text-muted-foreground"
                                  onClick={() => setCancelId(req.id)}>
                                  {t("deleteRequest")}
                                </Button>
                              )}
                              {req.status === "completed" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 rounded-xl text-xs"
                                  onClick={() => setRepeatData({
                                    description: req.description,
                                    city: req.city ?? undefined,
                                    budgetFrom: req.budgetFrom ?? undefined,
                                    budgetTo: req.budgetTo ?? undefined,
                                  })}
                                >
                                  Повторить заявку
                                </Button>
                              )}
                            </div>
                            {req.status === "completed" && req.rating === null && (
                              <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs gap-1.5 border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                                onClick={() => { setReviewRequest(req); setReviewStars(0); setReviewText(""); }}>
                                <Star className="h-3.5 w-3.5" /> {t("rateWork")}
                              </Button>
                            )}
                          </div>

                          {/* Existing rating */}
                          {req.rating !== null && req.rating !== undefined && (
                            <div className="rounded-xl bg-muted/40 px-4 py-3 space-y-1.5">
                              <div className="flex items-center gap-1">
                                {[1,2,3,4,5].map(s => (
                                  <Star key={s} className={`h-4 w-4 ${s <= req.rating! ? "fill-amber-400 text-amber-400" : "fill-muted text-muted-foreground/30"}`} />
                                ))}
                                <span className="ml-1 text-xs text-muted-foreground">Your review</span>
                              </div>
                              {req.review && <p className="text-sm text-muted-foreground italic">&ldquo;{req.review}&rdquo;</p>}
                              {req.companyReply && (
                                <div className="pl-3 border-l-2 border-primary/30 mt-2">
                                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-0.5">Company reply</p>
                                  <p className="text-sm text-muted-foreground italic">&ldquo;{req.companyReply}&rdquo;</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel dialog */}
      <Dialog open={cancelId !== null} onOpenChange={(v) => { if (!v) setCancelId(null); }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{t("deleteRequest")}</DialogTitle>
            <DialogDescription>{t("deleteConfirm")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelId(null)} disabled={cancelling} className="rounded-xl">{tCommon("cancel")}</Button>
            <Button variant="destructive" onClick={() => void handleCancel()} disabled={cancelling} className="rounded-xl">
              {cancelling ? "..." : tCommon("confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review dialog */}
      <Dialog open={reviewRequest !== null} onOpenChange={(v) => { if (!v) setReviewRequest(null); }}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>{t("rateWork")}</DialogTitle>
            <DialogDescription>{t("review")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <p className="text-sm font-semibold mb-3">{t("rating")} *</p>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(s => (
                  <button key={s} onMouseEnter={() => setReviewHover(s)} onMouseLeave={() => setReviewHover(0)}
                    onClick={() => setReviewStars(s)} className="transition-transform hover:scale-110">
                    <Star className={`h-9 w-9 transition-colors ${s <= (reviewHover || reviewStars) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                  </button>
                ))}
              </div>
              {reviewStars > 0 && (
                <p className="text-xs text-muted-foreground mt-1.5">{["","Poor","Below avg","Average","Good","Excellent"][reviewStars]}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">{t("review")}</label>
              <Textarea rows={3} placeholder={t("review")} value={reviewText}
                onChange={e => setReviewText(e.target.value)} maxLength={1000} className="rounded-xl" />
              <p className="text-xs text-muted-foreground text-right">{reviewText.length}/1000</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewRequest(null)} className="rounded-xl">{tCommon("cancel")}</Button>
            <Button onClick={() => void handleReview()} disabled={reviewStars === 0 || submittingReview} className="rounded-xl">
              {submittingReview ? "..." : t("submitRating")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}



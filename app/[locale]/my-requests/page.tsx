/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Star, Phone, Mail, CheckCircle2, Clock, Zap, PlayCircle,
         AlertCircle, Sparkles, Building2, X, Heart, MessageSquare,
         Loader2, Eye, EyeOff, Bell, MapPin, User as UserIcon,
         History, CalendarDays, BadgeCheck, CircleDashed, FileText,
         ClipboardList, Shield, ShieldCheck, ShieldOff, Trash2 } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { RequestRecord, RequestStatus, ServiceRecord, SERVICE_CATEGORY_LABELS } from "@/lib/types";
import { buildNotifications, type NotifItem } from "@/lib/use-notifications";
import { StatusBadge } from "@/components/StatusBadge";
import { ProtectedRoute } from "@/components/company/ProtectedRoute";
import { ClientSidebar, type CabinetTab } from "@/components/ClientSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatBudget, fmtNum, timeAgo } from "@/lib/utils";
import { RequestCreateDialog } from "@/components/RequestCreateDialog";
import { OrgCard } from "@/components/OrgCard";
import { useAuth } from "@/components/auth/AuthProvider";

/* ── Timeline stepper ── */

const STEP_STYLES = [
  { dot: "border-blue-500 bg-blue-500",   active: "border-blue-400 text-blue-600 bg-blue-50 dark:bg-blue-950/30",   ping: "bg-blue-400",   line: "bg-gradient-to-r from-blue-400 to-violet-400" },
  { dot: "border-violet-500 bg-violet-500", active: "border-violet-400 text-violet-600 bg-violet-50 dark:bg-violet-950/30", ping: "bg-violet-400", line: "bg-gradient-to-r from-violet-400 to-indigo-400" },
  { dot: "border-indigo-500 bg-indigo-500", active: "border-indigo-400 text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30", ping: "bg-indigo-400", line: "bg-gradient-to-r from-indigo-400 to-amber-400" },
  { dot: "border-amber-500 bg-amber-500",  active: "border-amber-400 text-amber-600 bg-amber-50 dark:bg-amber-950/30",  ping: "bg-amber-400",  line: "bg-gradient-to-r from-amber-400 to-green-400" },
  { dot: "border-green-500 bg-green-500",  active: "border-green-400 text-green-600 bg-green-50 dark:bg-green-950/30",  ping: "bg-green-400",  line: "bg-green-400" },
] as const;

function getStepIndex(status: RequestStatus, hasOffers: boolean): number {
  if (status === "completed")   return 4;
  if (status === "in_progress") return 3;
  if (status === "accepted")    return 2;
  if (hasOffers)                return 1;
  return 0;
}

function RequestTimeline({ status, hasOffers, offerCount, createdAt }: {
  status: RequestStatus;
  hasOffers: boolean;
  offerCount: number;
  createdAt: string;
}) {
  const tR = useTranslations("requests");
  const STEPS = [
    { status: "new",         label: tR("stepPosted"),           icon: Clock },
    { status: "offered",     label: offerCount > 0 ? `${offerCount} ${tR("stepOffers")}` : tR("stepOffers"), icon: Zap },
    { status: "accepted",    label: tR("status.accepted"),      icon: CheckCircle2 },
    { status: "in_progress", label: tR("status.in_progress"),   icon: PlayCircle },
    { status: "completed",   label: tR("stepDone"),             icon: CheckCircle2 },
  ];
  const active = getStepIndex(status, hasOffers);
  return (
    <div className="flex items-center gap-0 overflow-x-auto pb-1">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const done    = i < active;
        const current = i === active;
        const isLast  = i === STEPS.length - 1;
        const s = STEP_STYLES[i];
        const label = step.label;
        return (
          <div key={step.status} className="flex items-center shrink-0">
            <div className="flex flex-col items-center">
              <div className="relative">
                {current && (
                  <div className={`absolute inset-0 rounded-full animate-ping opacity-40 ${s.ping}`} />
                )}
                <div className={`relative flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                  done    ? `${s.dot} text-white shadow-sm` :
                  current ? s.active :
                            "border-border/40 bg-background text-muted-foreground/25"
                }`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
              </div>
              <span className={`text-[10px] font-bold mt-1.5 whitespace-nowrap leading-none ${
                current ? "text-foreground" : done ? "text-muted-foreground/60" : "text-muted-foreground/25"
              }`}>{label}</span>
              {i === 0 && (
                <span className="text-[9px] text-muted-foreground/40 mt-0.5 whitespace-nowrap">
                  {new Date(createdAt).toLocaleDateString("en", { day: "numeric", month: "short" })}
                </span>
              )}
            </div>
            {!isLast && (
              <div className={`h-0.5 w-8 md:w-14 mx-1 mb-5 rounded-full transition-all duration-700 ${done ? s.line : "bg-border/25"}`} />
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
  const tR = useTranslations("requests");
  const tC = useTranslations("common");
  const name = offer.company?.name ?? offer.company?.email ?? tC("company");
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
          {accepting ? "..." : tR("acceptOffer")}
        </Button>
        <Button size="sm" variant="ghost" className="h-8 rounded-xl text-xs text-muted-foreground"
          onClick={() => onReject(requestId)}>
          <X className="h-3 w-3 mr-1" /> {tR("declineOffer")}
        </Button>
      </div>
    </div>
  );
}

/* ── Deadline countdown ── */
function DeadlineCountdown({ deadline }: { deadline: string }) {
  const tR = useTranslations("requests");
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
  if (days < 0) return <span className="text-xs text-destructive font-medium">{tR("expiredLabel")}</span>;
  if (days === 0) return <span className="text-xs text-destructive font-medium">{tR("today")}</span>;
  if (days === 1) return <span className="text-xs text-orange-500 font-medium">{tR("tomorrow")}</span>;
  return <span className="text-xs text-muted-foreground">{tR("expiresInDays", { count: days })}</span>;
}

/* ── Expiry helper (locale-agnostic) ── */
function getExpiry(expiresAt: string | null | undefined): { days: number; expired: boolean } | null {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return { days: 0, expired: true };
  const d = Math.ceil(diff / 86400000);
  return { days: d, expired: false };
}

/* ════════════════════════════════
   INLINE PANELS
════════════════════════════════ */

/* ─── Messages Panel ─── */
interface ChatItem {
  requestId: string; status: string;
  service: { id: string; name: string } | null;
  otherParty: { id: string; name?: string | null; email: string } | null;
  lastMessage: { content: string; createdAt: string; senderId: string } | null;
  unreadCount: number;
}

function MessagesPanel() {
  const tCh = useTranslations("chat");
  const tC = useTranslations("common");
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void api.getChatInbox()
      .then(d => setChats(d as ChatItem[]))
      .catch(() => toast.error(tC("error")))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-muted-foreground" /></div>;

  if (chats.length === 0) return (
    <div className="bg-card border border-border/50 rounded-2xl py-16 text-center">
      <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
      <p className="font-medium">{tCh("noMessages")}</p>
      <p className="text-sm text-muted-foreground mt-1">{tCh("noMessagesDesc")}</p>
    </div>
  );

  return (
    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
      {chats.map((chat, i) => {
        const name = chat.otherParty?.name ?? chat.otherParty?.email ?? "—";
        const title = chat.service?.name ?? tCh("title");
        return (
          <Link key={chat.requestId} href={`/chat/${chat.requestId}` as `/chat/${string}`}>
            <div className={`flex items-center gap-3.5 px-5 py-4 hover:bg-muted/40 transition-colors cursor-pointer ${i !== 0 ? "border-t border-border/40" : ""}`}>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                {name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-sm truncate">{name}</p>
                  {chat.lastMessage && (
                    <span className="text-[11px] text-muted-foreground shrink-0">{timeAgo(chat.lastMessage.createdAt)}</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{title}</p>
                {chat.lastMessage && (
                  <p className="text-xs text-muted-foreground/70 truncate mt-0.5">{chat.lastMessage.content}</p>
                )}
              </div>
              {chat.unreadCount > 0 && (
                <span className="shrink-0 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {chat.unreadCount}
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

/* ─── Favorites Panel ─── */
function FavoritesPanel() {
  const tFav = useTranslations("favorites");
  const tC = useTranslations("common");
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void api.getFavorites()
      .then(setServices)
      .catch(() => toast.error(tC("error")))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-muted-foreground" /></div>;

  if (services.length === 0) return (
    <div className="bg-card border border-border/50 rounded-2xl py-16 text-center">
      <Heart className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
      <p className="font-medium">{tFav("noFavorites")}</p>
      <p className="text-sm text-muted-foreground mt-1">{tFav("noFavoritesDesc")}</p>
      <Link href="/repair">
        <Button variant="outline" size="sm" className="mt-4 rounded-xl">{tFav("browseCatalog")}</Button>
      </Link>
    </div>
  );

  return (
    <div className="space-y-3">
      {services.map(s => (
        <OrgCard key={s.id} service={s} onUnfavorited={(id) => setServices(prev => prev.filter(x => x.id !== id))} />
      ))}
    </div>
  );
}

/* ─── Notifications Panel ─── */
const NOTIF_ICONS = {
  offer:     { icon: Zap,           bg: "bg-amber-100 dark:bg-amber-950/40",   text: "text-amber-600" },
  accepted:  { icon: CheckCircle2,  bg: "bg-blue-100 dark:bg-blue-950/40",    text: "text-blue-600" },
  completed: { icon: Star,          bg: "bg-green-100 dark:bg-green-950/40",  text: "text-green-600" },
  chat:      { icon: MessageSquare, bg: "bg-violet-100 dark:bg-violet-950/40", text: "text-violet-600" },
  review:    { icon: Star,          bg: "bg-rose-100 dark:bg-rose-950/40",    text: "text-rose-600" },
} as const;

function NotificationsPanel() {
  const tN = useTranslations("notifications");
  const tC = useTranslations("common");
  const [notifs, setNotifs] = useState<NotifItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void api.getRequests()
      .then(reqs => setNotifs(buildNotifications(reqs)))
      .catch(() => toast.error(tC("error")))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-muted-foreground" /></div>;

  if (notifs.length === 0) return (
    <div className="bg-card border border-border/50 rounded-2xl py-16 text-center">
      <Bell className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
      <p className="font-medium">{tN("noNotifications")}</p>
      <p className="text-sm text-muted-foreground mt-1">{tN("allCaughtUp")}</p>
    </div>
  );

  return (
    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden divide-y divide-border/40">
      {notifs.map((notif) => {
        const cfg = NOTIF_ICONS[notif.type] ?? NOTIF_ICONS.offer;
        const Icon = cfg.icon;
        return (
          <Link key={notif.id} href={notif.href as `/${string}`}
            className="flex items-start gap-4 px-5 py-4 hover:bg-muted/40 transition-colors">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${cfg.bg}`}>
              <Icon className={`h-5 w-5 ${cfg.text}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className={`text-sm font-semibold leading-snug ${!notif.read ? "text-foreground" : "text-muted-foreground"}`}>
                  {notif.title}
                  {!notif.read && <span className="inline-block h-2 w-2 rounded-full bg-primary ml-2 align-middle" />}
                </p>
                <span className="text-[11px] text-muted-foreground shrink-0">{timeAgo(notif.time)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.desc}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

/* ─── Profile Panel ─── */
function ProfilePanel() {
  const { user, updateUser, logout } = useAuth();
  const tP = useTranslations("profile");
  const tC = useTranslations("common");
  const tNav = useTranslations("nav");
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    void api.getProfile().then(p => {
      setName(p.name ?? "");
      setPhone(p.phone ?? "");
      setAddress(p.address ?? "");
    }).catch(() => toast.error(tC("error"))).finally(() => setLoaded(true));
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave() {
    setSaving(true);
    try {
      await api.updateProfile({
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
      });
      updateUser?.({ name: name.trim() || undefined });
      toast.success(tP("saved"));
    } catch { toast.error(tC("error")); }
    finally { setSaving(false); }
  }

  async function handleDeleteAccount() {
    if (!deletePassword) return;
    setDeleteLoading(true);
    try {
      await api.deleteAccount(deletePassword);
      logout();
      router.push("/");
    } catch {
      toast.error(tC("error"));
    } finally {
      setDeleteLoading(false);
    }
  }

  if (!loaded) return (
    <div className="flex justify-center py-16">
      <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
    </div>
  );

  const initials = (name?.[0] ?? user?.email?.[0] ?? "U").toUpperCase();

  return (
    <div className="space-y-4 max-w-xl">

      {/* Avatar + name header */}
      <div className="bg-card border border-border/50 rounded-2xl p-6 flex items-center gap-5">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/50 flex items-center justify-center text-2xl font-black text-primary shrink-0 select-none">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-lg font-bold truncate">{name || "—"}</p>
          <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
          <span className="mt-1.5 inline-block px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
            {tC("client")}
          </span>
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-card border border-border/50 rounded-2xl divide-y divide-border/40">
        <div className="px-5 py-4 flex items-center gap-4">
          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">{tP("name")}</p>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={tP("namePlaceholder")}
              className="h-8 border-0 shadow-none p-0 text-sm font-medium focus-visible:ring-0 bg-transparent"
            />
          </div>
        </div>
        <div className="px-5 py-4 flex items-center gap-4">
          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <Phone className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">{tP("phone")}</p>
            <Input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+7 (---) --- -- --"
              className="h-8 border-0 shadow-none p-0 text-sm font-medium focus-visible:ring-0 bg-transparent"
            />
          </div>
        </div>
        <div className="px-5 py-4 flex items-center gap-4">
          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">{tP("cityAddress")}</p>
            <Input
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Almaty"
              className="h-8 border-0 shadow-none p-0 text-sm font-medium focus-visible:ring-0 bg-transparent"
            />
          </div>
        </div>
        <div className="px-5 py-4 flex items-center gap-4">
          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <Mail className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">{tP("email")}</p>
            <p className="text-sm font-medium text-muted-foreground">{user?.email}</p>
          </div>
          <span className="text-[11px] font-bold text-green-600 bg-green-500/10 px-2.5 py-0.5 rounded-full shrink-0">
            {tP("verified")}
          </span>
        </div>
        <div className="px-5 py-4">
          <Button
            onClick={() => void handleSave()}
            disabled={saving}
            className="w-full rounded-xl h-10 font-semibold"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {tP("saveChanges")}
          </Button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-card border border-red-200 dark:border-red-900/50 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide mb-1">{tNav("deleteAccount")}</h2>
        <p className="text-sm text-muted-foreground mb-4">{tNav("deleteAccountConfirmDesc")}</p>
        <Button variant="destructive" size="sm" className="gap-2 rounded-xl" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="h-4 w-4" /> {tNav("deleteAccount")}
        </Button>
      </div>

      <Dialog open={deleteOpen} onOpenChange={(o) => { setDeleteOpen(o); if (!o) setDeletePassword(""); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 dark:text-red-400">{tNav("deleteAccountConfirmTitle")}</DialogTitle>
            <DialogDescription>{tNav("deleteAccountConfirmDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <label className="text-sm font-medium">{tNav("deleteAccountPasswordLabel")}</label>
            <Input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void handleDeleteAccount()}
              className="border-red-200 focus-visible:ring-red-400"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setDeleteOpen(false); setDeletePassword(""); }}>
              {tNav("deleteAccountCancel")}
            </Button>
            <Button variant="destructive" onClick={() => void handleDeleteAccount()} disabled={!deletePassword || deleteLoading}>
              <Trash2 className="h-4 w-4 mr-2" />
              {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : tNav("deleteAccountConfirmBtn")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── Settings Panel ─── */
function SettingsPanel() {
  const tP = useTranslations("profile");
  const tS = useTranslations("settings");
  const tC = useTranslations("common");
  const { user } = useAuth();

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);

  // 2FA state
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFAQR, setTwoFAQR] = useState<string | null>(null);
  const [twoFASecret, setTwoFASecret] = useState<string | null>(null);
  const [twoFACode, setTwoFACode] = useState("");
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [twoFASetupOpen, setTwoFASetupOpen] = useState(false);

  useEffect(() => { void load2FAStatus(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  async function load2FAStatus() {
    if (!user?.token) return;
    try {
      const res = await fetch("/api/auth/2fa", { headers: { Authorization: `Bearer ${user.token}` } });
      if (res.ok) {
        const data = await res.json() as { enabled: boolean };
        setTwoFAEnabled(data.enabled);
      }
    } catch { /* silent */ }
  }

  async function openSetup() {
    setTwoFASetupOpen(true);
    if (!twoFAEnabled && user?.token) {
      const res = await fetch("/api/auth/2fa", { headers: { Authorization: `Bearer ${user.token}` } });
      if (res.ok) {
        const data = await res.json() as { enabled: boolean; qrCode: string | null; secret: string | null };
        setTwoFAQR(data.qrCode);
        setTwoFASecret(data.secret);
      }
    }
  }

  async function enable2FA() {
    if (!twoFACode || !user?.token) return;
    setTwoFALoading(true);
    try {
      const res = await fetch("/api/auth/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ token: twoFACode }),
      });
      if (!res.ok) { const e = await res.json() as { error: string }; throw new Error(e.error); }
      toast.success(tS("twoFactor.enabledSuccess"));
      setTwoFAEnabled(true); setTwoFASetupOpen(false); setTwoFACode("");
    } catch (e) { toast.error(e instanceof Error ? e.message : tS("twoFactor.invalidCode")); }
    finally { setTwoFALoading(false); }
  }

  async function disable2FA() {
    if (!twoFACode || !user?.token) return;
    setTwoFALoading(true);
    try {
      const res = await fetch("/api/auth/2fa", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ token: twoFACode }),
      });
      if (!res.ok) { const e = await res.json() as { error: string }; throw new Error(e.error); }
      toast.success(tS("twoFactor.disabledSuccess"));
      setTwoFAEnabled(false); setTwoFASetupOpen(false); setTwoFACode("");
    } catch (e) { toast.error(e instanceof Error ? e.message : tS("twoFactor.invalidCode")); }
    finally { setTwoFALoading(false); }
  }

  const isValid = !!(currentPassword && newPassword && confirmPassword && newPassword === confirmPassword && newPassword.length >= 8);

  async function handleChangePassword() {
    if (!isValid) return;
    setSaving(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      toast.success(tP("saved"));
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tC("error"));
    } finally { setSaving(false); }
  }

  return (
    <div className="space-y-4 max-w-md">
      {/* Password card */}
      <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-6">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">{tC("security")}</p>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{tP("currentPassword")}</label>
            <div className="relative">
              <Input type={showCurrent ? "text" : "password"} value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" className="rounded-xl h-10 pr-10" />
              <button type="button" tabIndex={-1} onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{tP("newPassword")}</label>
            <div className="relative">
              <Input type={showNew ? "text" : "password"} value={newPassword}
                onChange={e => setNewPassword(e.target.value)} placeholder={tP("passwordHint")} className="rounded-xl h-10 pr-10" />
              <button type="button" tabIndex={-1} onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{tP("confirmNewPassword")}</label>
            <Input type="password" value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" className="rounded-xl h-10" />
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-destructive">{tP("confirmPassword")}</p>
            )}
          </div>
          <Button onClick={() => void handleChangePassword()} disabled={!isValid || saving} className="rounded-xl w-full">
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {tP("changePasswordBtn")}
          </Button>
        </div>
      </div>

      {/* 2FA card */}
      <div className="bg-card border border-border/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {twoFAEnabled
              ? <ShieldCheck className="h-5 w-5 text-green-500" />
              : <Shield className="h-5 w-5 text-muted-foreground" />}
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{tS("twoFactor.title")}</h2>
          </div>
          {twoFAEnabled
            ? <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-semibold px-2 py-0.5 rounded-full">{tS("twoFactor.enabled")}</span>
            : <span className="text-xs bg-muted text-muted-foreground font-semibold px-2 py-0.5 rounded-full">{tS("twoFactor.disabled")}</span>}
        </div>

        {!twoFASetupOpen ? (
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {twoFAEnabled ? tS("twoFactor.activeDesc") : tS("twoFactor.inactiveDesc")}
            </p>
            <Button size="sm" variant={twoFAEnabled ? "outline" : "default"} className="rounded-xl shrink-0"
              onClick={() => void openSetup()}>
              {twoFAEnabled
                ? <><ShieldOff className="h-3.5 w-3.5 mr-1.5" />{tS("twoFactor.disable")}</>
                : <><Shield className="h-3.5 w-3.5 mr-1.5" />{tS("twoFactor.enable")}</>}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {!twoFAEnabled && twoFAQR && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">{tS("twoFactor.scanQr")}</p>
                <img src={twoFAQR} alt="2FA QR Code" className="h-40 w-40 rounded-xl border border-border/50" />
                {twoFASecret && (
                  <p className="text-xs font-mono bg-muted px-3 py-2 rounded-lg text-muted-foreground">
                    {tS("twoFactor.secretKey", { key: twoFASecret })}
                  </p>
                )}
              </div>
            )}
            <div className="space-y-2 max-w-xs">
              <p className="text-sm font-medium">{twoFAEnabled ? tS("twoFactor.enterCodeDisable") : tS("twoFactor.enterCodeEnable")}</p>
              <Input
                value={twoFACode}
                onChange={e => setTwoFACode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="rounded-xl text-center text-lg font-mono tracking-widest"
                maxLength={6}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="rounded-xl" disabled={twoFACode.length !== 6 || twoFALoading}
                onClick={() => void (twoFAEnabled ? disable2FA() : enable2FA())}>
                {twoFALoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                {twoFAEnabled ? tS("twoFactor.disableBtn") : tS("twoFactor.confirmBtn")}
              </Button>
              <Button size="sm" variant="ghost" className="rounded-xl"
                onClick={() => { setTwoFASetupOpen(false); setTwoFACode(""); }}>
                {tC("cancel")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Order History Panel ─── */
const STATUS_STYLE_BASE: Record<string, { color: string; icon: React.ElementType }> = {
  completed:   { color: "text-green-600 bg-green-500/10",     icon: BadgeCheck },
  in_progress: { color: "text-amber-600 bg-amber-500/10",     icon: CircleDashed },
  accepted:    { color: "text-blue-600 bg-blue-500/10",       icon: CheckCircle2 },
  new:         { color: "text-muted-foreground bg-muted",     icon: Clock },
  cancelled:   { color: "text-destructive bg-destructive/10", icon: X },
};

function HistoryPanel() {
  const tR = useTranslations("requests");
  const tC = useTranslations("common");
  const [orders, setOrders] = useState<RequestRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void api.getRequests()
      .then(reqs => setOrders(reqs.filter(r => ["completed", "in_progress", "accepted", "cancelled"].includes(r.status))))
      .catch(() => toast.error(tC("error")))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-muted-foreground" /></div>;

  if (orders.length === 0) return (
    <div className="bg-card border border-border/50 rounded-2xl py-16 text-center">
      <History className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
      <p className="font-medium">{tR("noHistory")}</p>
      <p className="text-sm text-muted-foreground mt-1">{tR("noHistoryDesc")}</p>
    </div>
  );

  const completed  = orders.filter(r => r.status === "completed");
  const inProgress = orders.filter(r => r.status !== "completed");

  return (
    <div className="space-y-5">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: tR("totalOrders"),         value: orders.length,     color: "text-foreground" },
          { label: tR("status.completed"),    value: completed.length,  color: "text-green-600" },
          { label: tR("status.in_progress"),  value: inProgress.length, color: "text-amber-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card border border-border/50 rounded-2xl p-4 text-center">
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-xs text-muted-foreground mt-1 font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Order list */}
      <div className="bg-card border border-border/50 rounded-2xl overflow-hidden divide-y divide-border/40">
        {orders.map((req) => {
          const st = STATUS_STYLE_BASE[req.status] ?? STATUS_STYLE_BASE.new;
          const StatusIcon = st.icon;
          const statusLabel = tR(`status.${req.status as string}` as Parameters<typeof tR>[0]);
          const rated = req.status === "completed" && req.rating !== null && req.rating !== undefined;
          return (
            <div key={req.id} className="px-5 py-4 flex items-start gap-4 hover:bg-muted/30 transition-colors">
              {/* Status icon */}
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${st.color}`}>
                <StatusIcon className="h-5 w-5" />
              </div>

              {/* Main info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm leading-snug truncate">
                      {req.service?.name ?? req.description.slice(0, 60)}
                    </p>
                    <span className="font-mono text-[10px] text-muted-foreground/70">#{req.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <span className={`shrink-0 inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${st.color}`}>
                    {statusLabel}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                  {req.company?.name && (
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" /> {req.company.name}
                    </span>
                  )}
                  {req.city && <span>📍 {req.city}</span>}
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    {new Date(req.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>

                {/* Rating row */}
                {rated && (
                  <div className="flex items-center gap-1 mt-2">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`h-3.5 w-3.5 ${s <= req.rating! ? "fill-amber-400 text-amber-400" : "fill-muted text-muted-foreground/30"}`} />
                    ))}
                    {req.review && <span className="text-xs text-muted-foreground ml-1 italic truncate">&ldquo;{req.review}&rdquo;</span>}
                  </div>
                )}
                {req.status === "completed" && !rated && (
                  <p className="text-xs text-muted-foreground/60 mt-1.5 italic">{tR("noReviewLeft")}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════
   MAIN PAGE
════════════════════════════════ */
export default function MyRequestsPage() {
  const t = useTranslations("requests");
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");

  const TAB_TITLES: Record<CabinetTab, string> = {
    requests:      tNav("myRequests"),
    messages:      tNav("chat"),
    favorites:     tNav("favorites"),
    notifications: tNav("notifications"),
    history:       tNav("orderHistory"),
    profile:       tNav("profile"),
    settings:      tNav("settings"),
  };
  const searchParams = useSearchParams();
  const VALID_TABS: CabinetTab[] = ["requests","messages","favorites","notifications","history","profile","settings"];
  const initialTab = (searchParams.get("tab") as CabinetTab | null) ?? "requests";
  const [activeTab, setActiveTab] = useState<CabinetTab>(
    VALID_TABS.includes(initialTab) ? initialTab : "requests"
  );

  useEffect(() => {
    const tab = searchParams.get("tab") as CabinetTab | null;
    if (tab && VALID_TABS.includes(tab)) setActiveTab(tab);
    else if (!tab) setActiveTab("requests");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
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
  useEffect(() => { if (repeatData) setCreateOpen(true); }, [repeatData]);

  async function load() {
    setLoading(true);
    try { setRequests(await api.getRequests()); }
    catch (e) { toast.error(e instanceof Error ? e.message : tCommon("error")); }
    finally { setLoading(false); }
  }

  async function handleAcceptOffer(requestId: string, companyId: string) {
    setAcceptingOfferId(companyId);
    try { await api.acceptOffer(requestId, companyId); toast.success(t("offerAccepted")); await load(); }
    catch (e) { toast.error(e instanceof Error ? e.message : tCommon("error")); }
    finally { setAcceptingOfferId(null); }
  }

  async function handleCancel() {
    if (!cancelId) return;
    setCancelling(true);
    try { await api.deleteRequest(cancelId); toast.success(t("cancelledMsg")); setCancelId(null); await load(); }
    catch (e) { toast.error(e instanceof Error ? e.message : tCommon("error")); }
    finally { setCancelling(false); }
  }

  async function handleReview() {
    if (!reviewRequest || reviewStars === 0) return;
    setSubmittingReview(true);
    try {
      await api.rateRequest(reviewRequest.id, reviewStars, reviewText.trim() || undefined);
      toast.success(t("reviewSubmitted"));
      setReviewRequest(null); setReviewStars(0); setReviewText("");
      await load();
    } catch (e) { toast.error(e instanceof Error ? e.message : tCommon("error")); }
    finally { setSubmittingReview(false); }
  }

  const stats = useMemo(() => ({
    total:     requests.length,
    completed: requests.filter(r => r.status === "completed").length,
    active:    requests.filter(r => ["accepted","in_progress"].includes(r.status)).length,
    newCount:  requests.filter(r => r.status === "new").length,
  }), [requests]);

  return (
    <ProtectedRoute requiredRole="client">
      <div className="min-h-screen bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{TAB_TITLES[activeTab]}</h1>
              {activeTab === "requests" && (
                <p className="text-sm text-muted-foreground mt-0.5">{t("noRequestsDesc")}</p>
              )}
            </div>
            {activeTab === "requests" && (
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
            )}
          </div>

          <div className="flex gap-6 items-start">
            <ClientSidebar activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="flex-1 min-w-0">

              {/* ── Messages tab ── */}
              {activeTab === "messages" && <MessagesPanel />}

              {/* ── Favorites tab ── */}
              {activeTab === "favorites" && <FavoritesPanel />}

              {/* ── Notifications tab ── */}
              {activeTab === "notifications" && <NotificationsPanel />}

              {/* ── History tab ── */}
              {activeTab === "history" && <HistoryPanel />}

              {/* ── Profile tab ── */}
              {activeTab === "profile" && <ProfilePanel />}

              {/* ── Settings tab ── */}
              {activeTab === "settings" && <SettingsPanel />}

              {/* ── Requests tab ── */}
              {activeTab === "requests" && (
                <div className="space-y-5">
                  {/* Stats */}
                  {!loading && requests.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: t("statsTotal"),     value: stats.total,     numColor: "text-foreground",  icon: ClipboardList, iconBg: "bg-muted",                                    iconColor: "text-muted-foreground" },
                        { label: t("statsCompleted"), value: stats.completed, numColor: "text-green-600",   icon: CheckCircle2,  iconBg: "bg-green-100 dark:bg-green-950/40",           iconColor: "text-green-600" },
                        { label: t("statsActive"),    value: stats.active,    numColor: "text-amber-600",   icon: Zap,           iconBg: "bg-amber-100 dark:bg-amber-950/40",           iconColor: "text-amber-600" },
                        { label: t("statsNew"),       value: stats.newCount,  numColor: "text-primary",     icon: Bell,          iconBg: "bg-primary/10",                               iconColor: "text-primary" },
                      ].map(({ label, value, numColor, icon: Icon, iconBg, iconColor }) => (
                        <div key={label} className="bg-card border border-border/50 rounded-2xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${iconBg}`}>
                              <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
                            </div>
                            <span className="text-xs text-muted-foreground font-medium">{label}</span>
                          </div>
                          <p className={`text-2xl font-black ${numColor}`}>{value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Loading skeleton */}
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

                  {/* Empty state */}
                  {!loading && requests.length === 0 && (
                    <div className="bg-card border border-border/50 rounded-2xl p-10 text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-5">
                        <ClipboardList className="h-8 w-8 text-primary" />
                      </div>
                      <h2 className="text-xl font-bold mb-2">{t("noRequests")}</h2>
                      <p className="text-muted-foreground mb-8 max-w-sm mx-auto text-sm leading-relaxed">{t("noRequestsDesc")}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left mb-8">
                        {[
                          { n: "1", icon: FileText,     title: t("describeTask"),  desc: t("tellUsWhat") },
                          { n: "2", icon: Bell,         title: t("receiveOffers"), desc: t("companiesRespond") },
                          { n: "3", icon: CheckCircle2, title: t("chooseBest"),    desc: t("compareAndConfirm") },
                        ].map(({ n, icon: Icon, title, desc }) => (
                          <div key={n} className="rounded-xl border border-border/50 bg-muted/30 p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-black">{n}</span>
                              <Icon className="h-4 w-4 text-primary" />
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

                  {/* Request cards */}
                  {!loading && requests.length > 0 && (
                    <div className="space-y-4">
                      {requests.map((req) => {
                        const expiry = getExpiry(req.expiresAt);
                        const isExpired = expiry?.expired && req.status === "new" && !req.companyId;
                        const hasOffers = (req.offers?.length ?? 0) > 0;
                        const isAccepted = !!req.companyId && req.status !== "new";
                        const borderColor = ({
                          new:         "border-l-slate-300 dark:border-l-slate-600",
                          accepted:    "border-l-blue-400",
                          in_progress: "border-l-amber-400",
                          completed:   "border-l-green-500",
                          cancelled:   "border-l-red-400",
                        } as Record<string, string>)[req.status] ?? "border-l-border";

                        return (
                          <div key={req.id} className={`bg-card rounded-2xl border border-l-4 overflow-hidden ${borderColor}`}>
                            <div className="px-5 pt-5 pb-3">
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-bold text-base leading-snug">{req.service?.name || t("customRequest")}</h3>
                                    <span className="font-mono text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">#{req.id.slice(0, 8).toUpperCase()}</span>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                                    {req.category && <span>{SERVICE_CATEGORY_LABELS[req.category]}</span>}
                                    {req.city && <span>📍 {req.city}</span>}
                                    <span>{new Date(req.createdAt).toLocaleDateString("en", { day: "numeric", month: "short" })}</span>
                                    {expiry && <span className={expiry.expired ? "text-destructive font-semibold" : "text-amber-600"}>{expiry.expired ? t("expiredLabel") : t("expiresInDays", { count: expiry.days })}</span>}
                                    {req.status === "new" && req.deadline && <DeadlineCountdown deadline={req.deadline} />}
                                  </div>
                                </div>
                                <StatusBadge status={isExpired ? "expired" : req.status} />
                              </div>
                              <RequestTimeline status={req.status} hasOffers={hasOffers} offerCount={req.offers?.length ?? 0} createdAt={req.createdAt} />
                            </div>

                            <div className="px-5 pb-5 space-y-4 border-t border-border/40 pt-4">
                              <p className="text-sm text-muted-foreground leading-relaxed">{req.description}</p>

                              {formatBudget(req.budgetFrom, req.budgetTo) && (
                                <p className="text-sm">
                                  <span className="text-muted-foreground">{tCommon("budget")}: </span>
                                  <span className="font-semibold">{formatBudget(req.budgetFrom, req.budgetTo)}</span>
                                </p>
                              )}

                              {req.finalPrice && (req.status === "in_progress" || req.status === "completed") && (
                                <div className="flex items-center gap-2 rounded-xl bg-primary/5 border border-primary/20 px-4 py-2.5">
                                  <FileText className="h-4 w-4 text-primary shrink-0" />
                                  <span className="text-sm text-muted-foreground">{t("finalPrice")}:</span>
                                  <span className="text-sm font-bold text-primary ml-auto">{fmtNum(req.finalPrice)} ₸</span>
                                </div>
                              )}

                              {req.companyId && (
                                <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
                                  <div className="flex items-center gap-2.5 mb-3">
                                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                                      {(req.company?.name ?? req.company?.email ?? "C")[0].toUpperCase()}
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold">{req.company?.name ?? "Company"}</p>
                                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Building2 className="h-3 w-3" /> {t("assignedCompany")}
                                      </p>
                                    </div>
                                  </div>
                                  {isAccepted && (
                                    <div className="flex flex-wrap gap-2">
                                      {req.company?.phone && (
                                        <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl border border-border text-xs text-muted-foreground">
                                          <Phone className="h-3.5 w-3.5" /> {req.company.phone}
                                        </span>
                                      )}
                                      {req.company?.email && (
                                        <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl border border-border text-xs text-muted-foreground">
                                          <Mail className="h-3.5 w-3.5" /> {req.company.email}
                                        </span>
                                      )}
                                      <Link href={`/chat/${req.id}`}>
                                        <Button size="sm" className="h-8 rounded-xl gap-1.5 text-xs">
                                          💬 {t("openChat")}
                                        </Button>
                                      </Link>
                                    </div>
                                  )}
                                </div>
                              )}

                              {!req.companyId && hasOffers && (
                                <div className="space-y-2.5">
                                  <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-amber-500" />
                                    <p className="text-sm font-semibold">
                                      {t("offersReceived", { count: req.offers?.length ?? 0 })}
                                    </p>
                                  </div>
                                  <div className="space-y-2">
                                    {(req.offers ?? []).map((offer) => (
                                      <OfferCard
                                        key={offer.id}
                                        offer={offer}
                                        requestId={req.id}
                                        onAccept={handleAcceptOffer}
                                        onReject={() => void api.deleteOffer(req.id).then(load).catch(() => toast.error(tCommon("error")))}
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
                                  {t("waitingForOffers")}
                                </div>
                              )}

                              <div className="flex items-center justify-between pt-1">
                                <div className="flex gap-2">
                                  {(req.status === "new" && !isExpired) && (
                                    <Button variant="outline" size="sm" className="h-8 rounded-xl text-xs text-muted-foreground"
                                      onClick={() => setCancelId(req.id)}>
                                      {t("deleteRequest")}
                                    </Button>
                                  )}
                                  {(req.status === "accepted" || req.status === "in_progress") && (
                                    <Button variant="outline" size="sm" className="h-8 rounded-xl text-xs text-destructive border-destructive/30 hover:bg-destructive/5"
                                      onClick={() => setCancelId(req.id)}>
                                      ✕ {t("cancelRequest")}
                                    </Button>
                                  )}
                                  {req.status === "completed" && (
                                    <>
                                      <Link href={`/order-summary/${req.id}`}>
                                        <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/5">
                                          <FileText className="h-3.5 w-3.5" />
                                          {t("document")}
                                        </Button>
                                      </Link>
                                      <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs"
                                        onClick={() => setRepeatData({ description: req.description, city: req.city ?? undefined, budgetFrom: req.budgetFrom ?? undefined, budgetTo: req.budgetTo ?? undefined })}>
                                        {t("repeatRequest")}
                                      </Button>
                                    </>
                                  )}
                                </div>
                                {req.status === "completed" && req.rating === null && (
                                  <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs gap-1.5 border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                                    onClick={() => { setReviewRequest(req); setReviewStars(0); setReviewText(""); }}>
                                    <Star className="h-3.5 w-3.5" /> {t("rateWork")}
                                  </Button>
                                )}
                              </div>

                              {req.rating !== null && req.rating !== undefined && (
                                <div className="rounded-xl bg-muted/40 px-4 py-3 space-y-1.5">
                                  <div className="flex items-center gap-1">
                                    {[1,2,3,4,5].map(s => (
                                      <Star key={s} className={`h-4 w-4 ${s <= req.rating! ? "fill-amber-400 text-amber-400" : "fill-muted text-muted-foreground/30"}`} />
                                    ))}
                                    <span className="ml-1 text-xs text-muted-foreground">{t("yourReview")}</span>
                                  </div>
                                  {req.review && <p className="text-sm text-muted-foreground italic">&ldquo;{req.review}&rdquo;</p>}
                                  {req.companyReply && (
                                    <div className="pl-3 border-l-2 border-primary/30 mt-2">
                                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-0.5">{t("companyReply")}</p>
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
                <p className="text-xs text-muted-foreground mt-1.5">{(t.raw("ratingLabels") as string[])[reviewStars]}</p>
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

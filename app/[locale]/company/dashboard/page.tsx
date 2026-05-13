/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ProtectedRoute } from "@/components/company/ProtectedRoute";
import { RequestsManagement } from "@/components/company/RequestsManagement";
import { ServicesManagement } from "@/components/company/ServicesManagement";
import { CompanyOverview } from "@/components/company/CompanyOverview";
import { CompanyCalendar } from "@/components/company/CompanyCalendar";
import { useAuth } from "@/components/auth/AuthProvider";
import { api } from "@/lib/api";
import type { RequestRecord } from "@/lib/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fmtNum, timeAgo } from "@/lib/utils";
import {
  LayoutDashboard, Briefcase, ClipboardList, Menu, X,
  MessageSquare, CreditCard, User, Shield, Bell,
  Loader2, ArrowRight, Circle, CheckCircle2, Eye, EyeOff,
  Camera, MapPin, Smartphone, Zap, CalendarDays,
} from "lucide-react";

type Tab = "overview" | "services" | "requests" | "calendar" | "notifications" | "messages" | "billing" | "profile" | "security";

/* ── Types ── */
interface ChatItem {
  requestId: string;
  service: { id: string; name: string } | null;
  otherParty: { id: string; name?: string | null; email: string } | null;
  lastMessage: { content: string; createdAt: string } | null;
  unreadCount: number;
}

/* ── Billing plans ── */
const PLANS = [
  { name: "Free",     price: 0,    period: "",       desc: "For occasional use",  current: true,  popular: false,
    features: ["Up to 3 requests/month", "Basic catalog access", "Standard matching", "Email support"] },
  { name: "Standard", price: 2990, period: "/month", desc: "For regular users",   current: false, popular: true,
    features: ["Unlimited requests", "Priority matching", "In-app chat", "Ratings & reviews", "Saved favorites", "Phone support"] },
  { name: "Premium",  price: 7990, period: "/month", desc: "Maximum features",    current: false, popular: false,
    features: ["Everything in Standard", "Dedicated manager", "1-hour response guarantee", "24/7 priority support", "Early access to features", "Kaspi Pay integration"] },
];

/* ══════════════════════════════════════════════════════════ PANELS ══ */

function NotificationsPanel({ requests }: { requests: RequestRecord[] }) {
  const STATUS_LABEL: Record<string, string> = { new: "New", accepted: "Accepted", in_progress: "In progress", completed: "Completed" };
  const STATUS_COLOR: Record<string, string> = {
    new: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
    accepted: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
    in_progress: "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400",
    completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  };
  const recent = [...requests]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 20);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Notifications</h2>
      {recent.length === 0 ? (
        <div className="bg-card border border-border/50 rounded-2xl py-16 flex flex-col items-center text-muted-foreground">
          <Bell className="h-10 w-10 mb-3 opacity-30" />
          <p className="font-medium">No notifications yet</p>
        </div>
      ) : (
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
          {recent.map((r, i) => (
            <div key={r.id} className={`flex items-start gap-4 px-5 py-4 ${i !== recent.length - 1 ? "border-b border-border/40" : ""}`}>
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium">{r.service?.name ?? "Custom request"}</p>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${STATUS_COLOR[r.status] ?? ""}`}>
                    {STATUS_LABEL[r.status] ?? r.status}
                  </span>
                </div>
                {r.city && <p className="text-xs text-muted-foreground mt-0.5">{r.city}</p>}
                <p className="text-[11px] text-muted-foreground mt-1">{timeAgo(r.updatedAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MessagesPanel() {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try { setChats((await api.getChatInbox()) as ChatItem[]); }
      catch { toast.error("Failed to load messages"); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Messages</h2>
      {chats.length === 0 ? (
        <div className="bg-card border border-border/50 rounded-2xl py-16 flex flex-col items-center text-muted-foreground">
          <MessageSquare className="h-10 w-10 mb-3 opacity-30" />
          <p className="font-medium">No conversations yet</p>
        </div>
      ) : (
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
          {chats.map((chat, i) => {
            const name = chat.otherParty?.name ?? chat.otherParty?.email ?? "Unknown";
            const title = chat.service?.name ?? "Custom request";
            const preview = chat.lastMessage?.content ?? "No messages yet";
            const time = chat.lastMessage?.createdAt ? timeAgo(chat.lastMessage.createdAt) : "";
            const hasUnread = chat.unreadCount > 0;
            return (
              <Link key={chat.requestId} href={`/chat/${chat.requestId}` as `/chat/${string}`}
                className={`flex items-center gap-4 px-5 py-4 hover:bg-muted/50 transition-colors ${i !== chats.length - 1 ? "border-b border-border/40" : ""}`}>
                <div className="relative shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-sm font-bold text-primary">
                    {name[0].toUpperCase()}
                  </div>
                  {hasUnread && <Circle className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 fill-primary text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className={`text-sm truncate ${hasUnread ? "font-semibold" : "font-medium"}`}>{name}</p>
                    <span className="text-[11px] text-muted-foreground shrink-0">{time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mb-0.5">{title}</p>
                  <p className={`text-xs truncate ${hasUnread ? "font-medium text-foreground" : "text-muted-foreground"}`}>{preview}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {hasUnread && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                      {chat.unreadCount > 9 ? "9+" : chat.unreadCount}
                    </span>
                  )}
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BillingPanel() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Billing</h2>

      <div className="bg-card border border-border/50 rounded-2xl p-6">
        <p className="text-xs text-muted-foreground mb-5">Choose the plan that fits your needs</p>
        <div className="grid grid-cols-1 gap-3">
          {PLANS.map((plan) => (
            <div key={plan.name} className={`rounded-xl border p-5 ${
              plan.popular ? "border-primary bg-primary/5 dark:bg-primary/10" :
              plan.current ? "border-border/50 bg-muted/30" : "border-border/50 bg-background"
            }`}>
              <div className="flex items-start gap-5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1.5 mb-0.5">
                    <span className="text-xl font-black">{plan.price > 0 ? `${fmtNum(plan.price)} ₸` : "Free"}</span>
                    {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
                  </div>
                  <p className="text-sm font-semibold">{plan.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{plan.desc}</p>
                  <div className="mt-3 grid grid-cols-2 gap-1.5">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />{f}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-2">
                  {plan.popular && <span className="text-[11px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Most Popular</span>}
                  {plan.current && <span className="text-[11px] font-semibold bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Current plan</span>}
                  <Button variant={plan.popular ? "default" : "outline"} size="sm" className="rounded-xl" disabled={plan.current}>
                    {plan.current ? "Active" : "Upgrade"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border/40 bg-[#ef3124]/5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ef3124] shrink-0">
            <Smartphone className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm">Pay with Kaspi</p>
            <p className="text-xs text-muted-foreground">Fast and secure payment via Kaspi.kz</p>
          </div>
          <span className="ml-auto text-[10px] font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">Coming Soon</span>
        </div>
        <div className="px-5 py-5 flex flex-col sm:flex-row items-center gap-6">
          <div className="h-32 w-32 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center shrink-0 bg-muted/30">
            <div className="grid grid-cols-3 gap-0.5 opacity-30">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className={`h-4 w-4 rounded-sm bg-foreground ${[0,2,6,8].includes(i) ? "opacity-100" : "opacity-40"}`} />
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 font-semibold">Kaspi QR</p>
          </div>
          <div className="space-y-2 text-sm">
            <p className="font-semibold">How it will work:</p>
            {["Open Kaspi.kz app on your phone", "Scan the QR code", "Confirm payment — done!"].map((step, i) => (
              <div key={i} className="flex items-center gap-2 text-muted-foreground">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#ef3124]/10 text-[#ef3124] text-[10px] font-black shrink-0">{i + 1}</span>
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { icon: CreditCard, title: "Secure payments", desc: "Bank-level encryption. Cancel anytime with no hidden fees." },
          { icon: Zap,        title: "Instant activation", desc: "Your plan activates immediately after payment." },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-card border border-border/50 rounded-2xl p-5 flex items-start gap-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 shrink-0">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfilePanel() {
  const { user, updateUser } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const p = await api.getProfile();
        setName(p.name ?? ""); setPhone(p.phone ?? "");
        setAddress(p.address ?? ""); setDescription(p.description ?? "");
        setAvatarUrl(p.avatarUrl);
        setCreatedAt(p.createdAt);
      } catch { toast.error("Failed to load profile"); }
      finally { setLoaded(true); }
    })();
  }, []);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const { url } = await api.uploadAvatar(file);
      setAvatarUrl(url); toast.success("Photo updated");
    } catch { toast.error("Failed to upload photo"); setAvatarPreview(null); }
    finally { setUploading(false); }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await api.updateProfile({ name: name.trim() || undefined, phone: phone.trim() || null, avatarUrl, address: address.trim() || null, description: description.trim() || null });
      updateUser({ name: updated.name, phone: updated.phone });
      toast.success("Profile saved");
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed to save"); }
    finally { setSaving(false); }
  }

  const displayAvatar = avatarPreview ?? avatarUrl;
  if (!loaded) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4 max-w-2xl">
      <h2 className="text-xl font-bold">Profile</h2>

      <div className="bg-card border border-border/50 rounded-2xl p-6">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-5">Photo</h3>
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            {displayAvatar ? (
              <img src={displayAvatar} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover border border-border" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-border flex items-center justify-center">
                <span className="text-2xl font-black text-primary">{(user?.name?.[0] ?? user?.email?.[0] ?? "C").toUpperCase()}</span>
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              </div>
            )}
          </div>
          <div>
            <Button variant="outline" size="sm" className="gap-2 rounded-xl" onClick={() => fileRef.current?.click()} disabled={uploading}>
              <Camera className="h-3.5 w-3.5" /> Upload photo
            </Button>
            <p className="text-xs text-muted-foreground mt-1.5">JPG, PNG, WEBP · max 5 MB</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => void handleAvatarChange(e)} />
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-6">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-5">Information</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</label>
              <Input value={user?.email ?? ""} disabled className="bg-muted/50 rounded-xl h-10" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Role</label>
              <Input value="Company" disabled className="bg-muted/50 rounded-xl h-10" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Company name" className="rounded-xl h-10" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Phone</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 (777) 000-00-00" className="rounded-xl h-10" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Address
            </label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="City, street, building" className="rounded-xl h-10" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell clients about your company — specialization, experience, advantages…"
              maxLength={1000}
              rows={4}
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
            />
            <p className="text-[11px] text-muted-foreground text-right">{description.length}/1000</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        {createdAt && (
          <p className="text-xs text-muted-foreground">Member since {new Date(createdAt).toLocaleDateString("en", { year: "numeric", month: "long" })}</p>
        )}
        <Button onClick={() => void handleSave()} disabled={saving || uploading} className="rounded-xl px-6">
          {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving…</> : "Save changes"}
        </Button>
      </div>
    </div>
  );
}

function SecurityPanel() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
    if (newPassword.length < 6) { toast.error("Minimum 6 characters"); return; }
    setSaving(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      toast.success("Password changed successfully");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change password");
    } finally { setSaving(false); }
  }

  const isValid = !!(currentPassword && newPassword && confirmPassword && newPassword === confirmPassword);

  return (
    <div className="space-y-4 max-w-2xl">
      <h2 className="text-xl font-bold">Security</h2>

      <div className="bg-card border border-border/50 rounded-2xl p-6">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-5">Change Password</h3>
        <div className="space-y-4 max-w-md">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Current password</label>
            <div className="relative">
              <Input type={showCurrent ? "text" : "password"} value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" className="rounded-xl h-10 pr-10" />
              <button type="button" tabIndex={-1} onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">New password</label>
            <div className="relative">
              <Input type={showNew ? "text" : "password"} value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 6 characters" className="rounded-xl h-10 pr-10" />
              <button type="button" tabIndex={-1} onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Confirm password</label>
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password" className="rounded-xl h-10" />
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-destructive">Passwords do not match</p>
            )}
          </div>
          <Button onClick={() => void handleChangePassword()} disabled={!isValid || saving} className="rounded-xl">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Save
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-6">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">Security Tips</h3>
        <ul className="space-y-2.5">
          {["Use at least 8 characters", "Mix uppercase, lowercase, numbers, and symbols",
            "Don't reuse passwords from other sites", "Never share your password with anyone"].map((tip) => (
            <li key={tip} className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />{tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ PAGE ══ */

export default function CompanyDashboardPage() {
  const t = useTranslations("company");
  const { user } = useAuth();
  const VALID_TABS: Tab[] = ["overview","services","requests","calendar","notifications","messages","billing","profile","security"];
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const t = searchParams.get("tab") as Tab | null;
    return t && (["overview","services","requests","notifications","messages","billing","profile","security"] as string[]).includes(t) ? t : "overview";
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [requests, setRequests] = useState<RequestRecord[]>([]);

  /* Sync tab when URL changes (e.g. navbar dropdown click) */
  useEffect(() => {
    const tab = searchParams.get("tab") as Tab | null;
    if (tab && VALID_TABS.includes(tab)) setActiveTab(tab);
    else if (!tab) setActiveTab("overview");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const loadRequests = useCallback(async () => {
    try { setRequests(await api.getRequests({ scope: "all" })); } catch { /* silent */ }
  }, []);

  useEffect(() => {
    void loadRequests();
    const id = setInterval(() => void loadRequests(), 30_000);
    return () => clearInterval(id);
  }, [loadRequests]);

  const newCount       = requests.filter(r => !r.companyId).length;
  const actionCount    = requests.filter(r => r.companyId && r.status === "new").length;
  const totalBadge     = newCount + actionCount;
  const unreadMessages = requests.filter(r => r.companyId && (r.status === "accepted" || r.status === "in_progress")).length;

  const NAV: { id: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: "overview",  label: t("overview"),  icon: LayoutDashboard, badge: totalBadge > 0 ? totalBadge : undefined },
    { id: "requests",  label: t("requests"),  icon: ClipboardList,   badge: totalBadge > 0 ? totalBadge : undefined },
    { id: "services",  label: t("services"),  icon: Briefcase },
    { id: "calendar",  label: "Calendar",      icon: CalendarDays },
  ];

  const EXTRA: { id: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "messages",      label: "Messages",      icon: MessageSquare, badge: unreadMessages > 0 ? unreadMessages : undefined },
    { id: "billing",       label: "Billing",       icon: CreditCard },
    { id: "profile",       label: "Profile",       icon: User },
    { id: "security",      label: "Security",      icon: Shield },
  ];

  const allNav = [...NAV, ...EXTRA];
  const activeLabel = allNav.find(n => n.id === activeTab)?.label ?? "";

  function navigate(tab: string) {
    setActiveTab(tab as Tab);
    setSidebarOpen(false);
    const url = new URL(window.location.href);
    if (tab === "overview") url.searchParams.delete("tab");
    else url.searchParams.set("tab", tab);
    window.history.replaceState({}, "", url.toString());
  }

  function NavBtn({ id, label, icon: Icon, badge }: { id: Tab; label: string; icon: React.ElementType; badge?: number }) {
    return (
      <button onClick={() => navigate(id)}
        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left ${
          activeTab === id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}>
        <Icon className="h-4 w-4 shrink-0" />
        <span className="flex-1">{label}</span>
        {badge !== undefined && badge > 0 && (
          <span className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-black ${
            activeTab === id ? "bg-primary/20 text-primary" : "bg-destructive text-destructive-foreground"
          }`}>
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </button>
    );
  }

  return (
    <ProtectedRoute requiredRole="company">
      <div className="min-h-[calc(100vh-56px)] bg-muted/20">
        <div className="mx-auto max-w-6xl flex min-h-[calc(100vh-56px)]">

          {sidebarOpen && (
            <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
          )}

          {/* ── Sidebar ── */}
          <aside className={`
            fixed md:sticky top-0 md:top-20 z-30 md:z-auto
            w-60 shrink-0
            bg-background border-r border-border/50
            md:bg-transparent md:border-0
            flex flex-col
            transition-transform duration-300 md:translate-x-0
            md:py-4
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}>
            {/* Mobile close */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 md:hidden">
              <span className="font-semibold text-sm">{t("dashboard")}</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSidebarOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Card */}
            <div className="flex flex-col overflow-hidden md:bg-card md:border md:border-border/50 md:rounded-2xl">
              <div className="px-4 py-4 border-b border-border/40">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-sm font-black text-primary shrink-0">
                    {(user?.name?.[0] ?? user?.email?.[0] ?? "C").toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{user?.name ?? "Company"}</p>
                    <p className="text-[11px] text-muted-foreground">Company</p>
                  </div>
                </div>
              </div>

              <nav className="p-2 space-y-0.5">
                {NAV.map(item => <NavBtn key={item.id} {...item} />)}
                <div className="my-1 border-t border-border/30" />
                {EXTRA.map(item => <NavBtn key={item.id} {...item} />)}
              </nav>
            </div>
          </aside>

          {/* ── Main ── */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-background md:hidden sticky top-0 z-10">
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 relative" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
                {totalBadge > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[9px] font-black">
                    {totalBadge > 9 ? "9+" : totalBadge}
                  </span>
                )}
              </Button>
              <span className="font-bold text-sm">{activeLabel}</span>
            </div>

            <div className="flex-1 p-5 md:p-7 overflow-auto">
              {activeTab === "overview"       && <CompanyOverview onNavigate={navigate} />}
              {activeTab === "services"       && <ServicesManagement />}
              {activeTab === "requests"       && <RequestsManagement />}
              {activeTab === "calendar"       && <CompanyCalendar />}
              {activeTab === "notifications"  && <NotificationsPanel requests={requests} />}
              {activeTab === "messages"       && <MessagesPanel />}
              {activeTab === "billing"        && <BillingPanel />}
              {activeTab === "profile"        && <ProfilePanel />}
              {activeTab === "security"       && <SecurityPanel />}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

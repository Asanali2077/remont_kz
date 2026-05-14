"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "@/i18n/routing";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Eye, EyeOff, CheckCircle2, Shield, ShieldCheck, ShieldOff } from "lucide-react";
import { Footer } from "@/components/Footer";
import { SettingsSidebar } from "@/components/SettingsSidebar";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
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

  useEffect(() => { if (!authLoading && !user) router.push("/"); }, [user, authLoading, router]);

  async function fetch2FAStatus() {
    if (!user?.token) return;
    const res = await fetch("/api/auth/2fa", { headers: { Authorization: `Bearer ${user.token}` } });
    if (res.ok) {
      const data = await res.json() as { enabled: boolean; qrCode: string; secret: string };
      setTwoFAEnabled(data.enabled);
      setTwoFAQR(data.qrCode);
      setTwoFASecret(data.secret);
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
      toast.success(t("twoFactor.enabledSuccess"));
      setTwoFAEnabled(true);
      setTwoFASetupOpen(false);
      setTwoFACode("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("twoFactor.invalidCode"));
    } finally { setTwoFALoading(false); }
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
      toast.success(t("twoFactor.disabledSuccess"));
      setTwoFAEnabled(false);
      setTwoFASetupOpen(false);
      setTwoFACode("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("twoFactor.invalidCode"));
    } finally { setTwoFALoading(false); }
  }

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) { toast.error(t("passwordMismatch")); return; }
    if (newPassword.length < 6) { toast.error(t("passwordMinChars")); return; }
    setSaving(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      toast.success(t("passwordChanged"));
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tCommon("error"));
    } finally { setSaving(false); }
  }

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (!user) return null;

  const isValid = !!(currentPassword && newPassword && confirmPassword && newPassword === confirmPassword);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="flex gap-6 items-start">
          <SettingsSidebar active="security" />

          <div className="flex-1 min-w-0 space-y-4">
            {/* Password card */}
            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-5">{t("changePassword")}</h2>
              <div className="space-y-4 max-w-md">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("currentPassword")}</label>
                  <div className="relative">
                    <Input type={showCurrent ? "text" : "password"} value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" className="rounded-xl h-10 pr-10" />
                    <button type="button" tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowCurrent(!showCurrent)}>
                      {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("newPassword")}</label>
                  <div className="relative">
                    <Input type={showNew ? "text" : "password"} value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)} placeholder={t("passwordMinChars")} className="rounded-xl h-10 pr-10" />
                    <button type="button" tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowNew(!showNew)}>
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("repeatPassword")}</label>
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t("repeatPassword")} className="rounded-xl h-10" />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-destructive">{t("passwordMismatch")}</p>
                  )}
                </div>
                <Button onClick={() => void handleChangePassword()} disabled={!isValid || saving} className="rounded-xl">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {t("save")}
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
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t("twoFactor.title")}</h2>
                </div>
                {twoFAEnabled
                  ? <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-semibold px-2 py-0.5 rounded-full">{t("twoFactor.enabled")}</span>
                  : <span className="text-xs bg-muted text-muted-foreground font-semibold px-2 py-0.5 rounded-full">{t("twoFactor.disabled")}</span>}
              </div>

              {!twoFASetupOpen ? (
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    {twoFAEnabled ? t("twoFactor.activeDesc") : t("twoFactor.inactiveDesc")}
                  </p>
                  <Button size="sm" variant={twoFAEnabled ? "outline" : "default"} className="rounded-xl shrink-0"
                    onClick={async () => { setTwoFASetupOpen(true); await fetch2FAStatus(); }}>
                    {twoFAEnabled
                      ? <><ShieldOff className="h-3.5 w-3.5 mr-1.5" />{t("twoFactor.disable")}</>
                      : <><Shield className="h-3.5 w-3.5 mr-1.5" />{t("twoFactor.enable")}</>}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {!twoFAEnabled && twoFAQR && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">{t("twoFactor.scanQr")}</p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={twoFAQR} alt="2FA QR Code" className="h-40 w-40 rounded-xl border border-border/50" />
                      {twoFASecret && (
                        <p className="text-xs font-mono bg-muted px-3 py-2 rounded-lg text-muted-foreground">
                          {t("twoFactor.secretKey", { key: twoFASecret })}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="space-y-2 max-w-xs">
                    <p className="text-sm font-medium">{twoFAEnabled ? t("twoFactor.enterCodeDisable") : t("twoFactor.enterCodeEnable")}</p>
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
                      {twoFAEnabled ? t("twoFactor.disableBtn") : t("twoFactor.confirmBtn")}
                    </Button>
                    <Button size="sm" variant="ghost" className="rounded-xl"
                      onClick={() => { setTwoFASetupOpen(false); setTwoFACode(""); }}>
                      {tCommon("cancel")}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Security tips */}
            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">{t("securityTips.title")}</h2>
              <ul className="space-y-2.5">
                {[t("securityTips.tip1"), t("securityTips.tip2"), t("securityTips.tip3"), t("securityTips.tip4")].map((tip) => (
                  <li key={tip} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

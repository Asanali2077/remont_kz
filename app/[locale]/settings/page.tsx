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
  const t = useTranslations("profile");
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
      toast.success("2FA включена!");
      setTwoFAEnabled(true);
      setTwoFASetupOpen(false);
      setTwoFACode("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Неверный код");
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
      toast.success("2FA отключена");
      setTwoFAEnabled(false);
      setTwoFASetupOpen(false);
      setTwoFACode("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Неверный код");
    } finally { setTwoFALoading(false); }
  }

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
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("security")}</label>
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
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("changePassword")}</label>
                  <div className="relative">
                    <Input type={showNew ? "text" : "password"} value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 6 characters" className="rounded-xl h-10 pr-10" />
                    <button type="button" tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowNew(!showNew)}>
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("changePassword")}</label>
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password" className="rounded-xl h-10" />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-destructive">Passwords do not match</p>
                  )}
                </div>
                <Button onClick={() => void handleChangePassword()} disabled={!isValid || saving} className="rounded-xl">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {tCommon("save")}
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
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Двухфакторная аутентификация</h2>
                </div>
                {twoFAEnabled
                  ? <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-semibold px-2 py-0.5 rounded-full">Включена</span>
                  : <span className="text-xs bg-muted text-muted-foreground font-semibold px-2 py-0.5 rounded-full">Выключена</span>}
              </div>

              {!twoFASetupOpen ? (
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    {twoFAEnabled
                      ? "2FA активна. Приложение-аутентификатор требуется при каждом входе."
                      : "Защитите аккаунт одноразовыми кодами из Google Authenticator, Authy или аналогов."}
                  </p>
                  <Button size="sm" variant={twoFAEnabled ? "outline" : "default"} className="rounded-xl shrink-0"
                    onClick={async () => { setTwoFASetupOpen(true); await fetch2FAStatus(); }}>
                    {twoFAEnabled ? <><ShieldOff className="h-3.5 w-3.5 mr-1.5" />Отключить</> : <><Shield className="h-3.5 w-3.5 mr-1.5" />Включить</>}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {!twoFAEnabled && twoFAQR && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">Отсканируйте QR-код в приложении:</p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={twoFAQR} alt="2FA QR Code" className="h-40 w-40 rounded-xl border border-border/50" />
                      {twoFASecret && (
                        <p className="text-xs font-mono bg-muted px-3 py-2 rounded-lg text-muted-foreground">
                          Ключ: {twoFASecret}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="space-y-2 max-w-xs">
                    <p className="text-sm font-medium">{twoFAEnabled ? "Введите код для отключения:" : "Введите код для подтверждения:"}</p>
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
                      {twoFAEnabled ? "Отключить 2FA" : "Подтвердить"}
                    </Button>
                    <Button size="sm" variant="ghost" className="rounded-xl"
                      onClick={() => { setTwoFASetupOpen(false); setTwoFACode(""); }}>
                      Отмена
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Security tips */}
            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">{t("security")}</h2>
              <ul className="space-y-2.5">
                {[
                  "Use at least 8 characters",
                  "Mix uppercase, lowercase, numbers, and symbols",
                  "Don't reuse passwords from other sites",
                  "Never share your password with anyone",
                ].map((tip) => (
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

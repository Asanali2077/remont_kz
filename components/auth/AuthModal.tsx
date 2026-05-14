"use client";

import { ReactNode, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/components/auth/AuthProvider";
import { Eye, EyeOff, Loader2, Wrench, CheckCircle2, Mail, Shield } from "lucide-react";

export function AuthModal({ trigger, defaultMode = "login" }: { trigger?: ReactNode; defaultMode?: "login" | "register" }) {
  const t = useTranslations("auth");
  const { login, register } = useAuth();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "register">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"client" | "company">("client");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [devVerifyUrl, setDevVerifyUrl] = useState<string | null>(null);
  const [requires2FA, setRequires2FA] = useState(false);
  const [totpCode, setTotpCode] = useState("");

  const isValid = mode === "login"
    ? !!(email && password)
    : !!(email && password && password === confirm && role && name);

  async function submit() {
    if (!isValid || loading) return;
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        const result = await login(email, password);
        if (result?.requires2FA) {
          setRequires2FA(true);
        } else {
          setOpen(false);
        }
      } else {
        const result = await register(email, password, role, name, phone);
        setRegisteredEmail(email);
        if (result?.verifyUrl) setDevVerifyUrl(result.verifyUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function verify2FA() {
    if (totpCode.length !== 6 || loading) return;
    setError("");
    setLoading(true);
    try {
      await login(email, password, totpCode);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(v: boolean) {
    setOpen(v);
    if (!v) {
      setEmail(""); setPassword(""); setConfirm("");
      setName(""); setPhone(""); setError(""); setShowPw(false);
      setMode(defaultMode); setDevVerifyUrl(null); setRegisteredEmail(null);
      setRequires2FA(false); setTotpCode("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? <Button variant="outline" size="sm">Log In</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden gap-0">

        {/* ── 2FA step ── */}
        {requires2FA && (
          <div className="px-7 py-8 space-y-5">
            <div className="text-center space-y-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mx-auto">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="font-bold text-lg">{t("twoFactorTitle")}</p>
                <p className="text-sm text-muted-foreground mt-1">{t("twoFactorDesc")}</p>
              </div>
            </div>
            <Input
              value={totpCode}
              onChange={e => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="rounded-xl text-center text-2xl font-mono tracking-widest h-12"
              maxLength={6}
              autoFocus
              onKeyDown={e => { if (e.key === "Enter") void verify2FA(); }}
            />
            {error && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-3 py-2.5">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            <Button onClick={() => void verify2FA()} disabled={totpCode.length !== 6 || loading} className="w-full h-10 rounded-xl font-semibold">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {t("verify")}
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => { setRequires2FA(false); setTotpCode(""); setError(""); }}>
              {t("back")}
            </Button>
          </div>
        )}

        {/* ── Email verification screen ── */}
        {registeredEmail && (
          <div className="px-7 py-8 text-center space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/40 mx-auto">
              <CheckCircle2 className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <p className="font-bold text-lg">{t("accountCreated")}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {t("verificationSent")}
              </p>
              <p className="font-semibold text-sm mt-0.5">{registeredEmail}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {t("checkEmail")}
              </p>
            </div>

            {/* Dev mode — show clickable link */}
            {devVerifyUrl && (
              <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-3 text-left">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Mail className="h-3.5 w-3.5 text-amber-600" />
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                    {t("devVerifyLink")}
                  </span>
                </div>
                <Link href={devVerifyUrl} onClick={() => handleOpenChange(false)}
                  className="text-xs text-primary break-all hover:underline underline-offset-2 font-mono">
                  {devVerifyUrl}
                </Link>
              </div>
            )}

            <Button className="w-full rounded-xl" onClick={() => handleOpenChange(false)}>
              {t("closeWindow")}
            </Button>
          </div>
        )}

        {!registeredEmail && !requires2FA && <>
        {/* Header */}
        <div className="px-7 pt-7 pb-5 border-b border-border/50">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Wrench className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-base">Remont.kz</span>
          </div>
          <h2 className="text-xl font-bold mt-3">
            {mode === "login" ? t("welcomeBack") : t("createAccount")}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {mode === "login"
              ? t("signIn")
              : "Join thousands of users on Remont.kz"}
          </p>
        </div>

        {/* Form */}
        <div className="px-7 py-5 space-y-3.5">
          {/* Honeypot — bots fill this, humans don't */}
          <input type="text" name="website" autoComplete="off" tabIndex={-1} style={{ display: "none" }} />
          {mode === "register" && (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("accountType")}</Label>
                <Select value={role} onValueChange={(v: "client" | "company") => setRole(v)}>
                  <SelectTrigger className="rounded-xl h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">{t("clientRole")}</SelectItem>
                    <SelectItem value="company">{t("companyRole")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {t("name")}
                </Label>
                <Input
                  value={name} onChange={(e) => setName(e.target.value)}
                  placeholder={role === "company" ? "Company LLC" : "Full name"}
                  className="rounded-xl h-10"
                />
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("email")}</Label>
            <Input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" className="rounded-xl h-10"
              onKeyDown={(e) => { if (e.key === "Enter" && mode === "login") void submit(); }}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("password")}</Label>
              {mode === "login" && (
                <Link href="/forgot-password" onClick={() => setOpen(false)}
                  className="text-xs text-primary hover:underline underline-offset-2">
                  {t("forgotPassword")}
                </Link>
              )}
            </div>
            <div className="relative">
              <Input
                type={showPw ? "text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "register" ? "At least 6 characters" : "••••••••"}
                className="rounded-xl h-10 pr-10"
                onKeyDown={(e) => { if (e.key === "Enter" && mode === "login") void submit(); }}
              />
              <button type="button" tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {mode === "register" && (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("confirmPassword")}</Label>
                <Input
                  type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat password" className="rounded-xl h-10"
                />
                {confirm && password !== confirm && (
                  <p className="text-xs text-destructive">{t("passwordMismatch")}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {t("phone")}
                </Label>
                <Input
                  value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 (777) 000-00-00" className="rounded-xl h-10"
                />
              </div>
            </>
          )}

          {error && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-3 py-2.5">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button onClick={() => void submit()} disabled={!isValid || loading} className="w-full h-10 rounded-xl font-semibold mt-1">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {mode === "login" ? t("loginButton") : t("registerButton")}
          </Button>
        </div>

        {/* Footer */}
        <div className="px-7 pb-6 text-center">
          <p className="text-sm text-muted-foreground">
            {mode === "login" ? t("noAccount") + " " : t("hasAccount") + " "}
            <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
              className="font-semibold text-primary hover:underline underline-offset-2">
              {mode === "login" ? t("signUp") : t("loginButton")}
            </button>
          </p>
        </div>
        </> }
      </DialogContent>
    </Dialog>
  );
}

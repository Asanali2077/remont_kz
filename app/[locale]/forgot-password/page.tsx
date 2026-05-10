"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/routing";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, ArrowLeft, CheckCircle2, Wrench } from "lucide-react";

export default function ForgotPasswordPage() {
  const t = useTranslations("forgotPassword");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await api.forgotPassword(email.trim());
      setSent(true);
      if (res.resetUrl) setDevLink(res.resetUrl);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Wrench className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">Remont.kz</span>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-7 pt-7 pb-5 border-b border-border/50">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 mb-4">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold">{t("title")}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("description")}
            </p>
          </div>

          <div className="px-7 py-6">
            {sent ? (
              <div className="text-center space-y-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/50 mx-auto">
                  <CheckCircle2 className="h-7 w-7 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold">{t("sent")}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("sentDesc")} <strong>{email}</strong>
                  </p>
                </div>
                {devLink && (
                  <div className="rounded-xl border bg-muted/50 p-3 text-left">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Dev mode — reset link:</p>
                    <Link href={devLink} className="text-xs text-primary break-all hover:underline">
                      {devLink}
                    </Link>
                  </div>
                )}
                <Button variant="outline" className="w-full rounded-xl" onClick={() => { setSent(false); setDevLink(null); }}>
                  {t("send")}
                </Button>
              </div>
            ) : (
              <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("email")}</label>
                  <Input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" required className="rounded-xl h-10"
                  />
                </div>
                <Button type="submit" className="w-full rounded-xl h-10 font-semibold" disabled={loading || !email.trim()}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {t("send")}
                </Button>
              </form>
            )}
          </div>

          <div className="px-7 pb-6 text-center">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> {t("backToLogin")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

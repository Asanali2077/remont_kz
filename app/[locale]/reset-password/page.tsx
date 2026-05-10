"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Lock, Eye, EyeOff, CheckCircle2, ArrowLeft, Wrench } from "lucide-react";

function ResetContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
    if (newPassword.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (!/\d/.test(newPassword)) { toast.error("Password must contain at least one digit"); return; }
    setLoading(true);
    try {
      await api.resetPassword(token, newPassword);
      setDone(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 mx-auto">
          <Lock className="h-6 w-6 text-destructive" />
        </div>
        <div>
          <p className="font-semibold">Invalid reset link</p>
          <p className="text-sm text-muted-foreground mt-1">This link is invalid or has expired.</p>
        </div>
        <Link href="/forgot-password">
          <Button variant="outline" className="rounded-xl">Request new link</Button>
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/50 mx-auto">
          <CheckCircle2 className="h-7 w-7 text-green-600" />
        </div>
        <div>
          <p className="font-semibold">Password updated!</p>
          <p className="text-sm text-muted-foreground mt-1">You can now log in with your new password.</p>
        </div>
        <Button className="w-full rounded-xl" onClick={() => router.push("/")}>
          Go to login
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">New password</label>
        <div className="relative">
          <Input type={showPw ? "text" : "password"} value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 6 characters"
            required className="rounded-xl h-10 pr-10" />
          <button type="button" tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setShowPw(!showPw)}>
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Confirm password</label>
        <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repeat password" required className="rounded-xl h-10" />
        {confirmPassword && newPassword !== confirmPassword && (
          <p className="text-xs text-destructive">Passwords do not match</p>
        )}
      </div>
      <Button type="submit" className="w-full rounded-xl h-10 font-semibold" disabled={loading || !newPassword || !confirmPassword}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Set new password
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Wrench className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">Remont.kz</span>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-7 pt-7 pb-5 border-b border-border/50">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 mb-4">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold">Set new password</h1>
            <p className="text-sm text-muted-foreground mt-1">Choose a strong password for your account</p>
          </div>

          <div className="px-7 py-6">
            <Suspense fallback={<Loader2 className="h-6 w-6 animate-spin mx-auto" />}>
              <ResetContent />
            </Suspense>
          </div>

          <div className="px-7 pb-6 text-center">
            <Link href="/forgot-password" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

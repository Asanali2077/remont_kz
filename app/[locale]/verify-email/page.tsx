"use client";

import { useTranslations } from "next-intl";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { CheckCircle2, XCircle, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function Content() {
  const t = useTranslations("verifyEmail");
  const params = useSearchParams();
  const success = params.get("success") === "1";
  const error = params.get("error");

  if (success) return (
    <div className="text-center space-y-5">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/40 mx-auto">
        <CheckCircle2 className="h-8 w-8 text-green-600" />
      </div>
      <div>
        <h2 className="text-xl font-bold">{t("success")}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t("successDesc")}</p>
      </div>
      <Link href="/"><Button className="rounded-xl">{t("goHome")}</Button></Link>
    </div>
  );

  if (error) return (
    <div className="text-center space-y-5">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mx-auto">
        <XCircle className="h-8 w-8 text-destructive" />
      </div>
      <div>
        <h2 className="text-xl font-bold">{t("error")}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t("errorDesc")}</p>
      </div>
      <Link href="/"><Button variant="outline" className="rounded-xl">{t("goHome")}</Button></Link>
    </div>
  );

  return (
    <div className="text-center space-y-5">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto">
        <Mail className="h-8 w-8 text-primary" />
      </div>
      <div>
        <h2 className="text-xl font-bold">{t("verifying")}</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
          {t("successDesc")}
        </p>
      </div>
      <p className="text-xs text-muted-foreground">Link expires in 24 hours</p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-card border border-border/50 rounded-2xl p-8 shadow-sm">
        <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />}>
          <Content />
        </Suspense>
      </div>
    </div>
  );
}

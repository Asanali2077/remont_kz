"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function Content() {
  const params = useSearchParams();
  const success = params.get("success") === "1";
  const error = params.get("error");

  if (success) return (
    <div className="text-center space-y-5">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/40 mx-auto">
        <CheckCircle2 className="h-8 w-8 text-green-600" />
      </div>
      <div>
        <h2 className="text-xl font-bold">Email verified!</h2>
        <p className="text-sm text-muted-foreground mt-1">Your account is now fully activated.</p>
      </div>
      <Link href="/"><Button className="rounded-xl">Go to Home</Button></Link>
    </div>
  );

  if (error) return (
    <div className="text-center space-y-5">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mx-auto">
        <XCircle className="h-8 w-8 text-destructive" />
      </div>
      <div>
        <h2 className="text-xl font-bold">Invalid link</h2>
        <p className="text-sm text-muted-foreground mt-1">This verification link is invalid or has expired.</p>
      </div>
      <Link href="/"><Button variant="outline" className="rounded-xl">Back to Home</Button></Link>
    </div>
  );

  return (
    <div className="text-center space-y-5">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto">
        <Mail className="h-8 w-8 text-primary" />
      </div>
      <div>
        <h2 className="text-xl font-bold">Check your email</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
          We sent a verification link to your email address. Click it to activate your account.
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

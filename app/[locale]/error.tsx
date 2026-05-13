"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-4 text-center">
      <div className="space-y-6 max-w-md">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <div>
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-muted-foreground">
            An unexpected error occurred. Please try again or contact support if the problem persists.
          </p>
          {error.digest && (
            <p className="mt-2 text-xs text-muted-foreground font-mono">Error ID: {error.digest}</p>
          )}
        </div>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" onClick={() => window.location.href = "/"}>
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

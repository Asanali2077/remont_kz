"use client";

import { useEffect, useState } from "react";
import { X, Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("pwa:dismissed")) return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setVisible(true), 3000);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", () => { setInstalled(true); setVisible(false); });

    // Register service worker
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js");
    }

    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  function dismiss() {
    setVisible(false);
    localStorage.setItem("pwa:dismissed", "1");
  }

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setVisible(false);
    setDeferredPrompt(null);
  }

  if (!visible || installed) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-80 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-card border border-border/50 rounded-2xl shadow-xl shadow-black/10 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
            <Smartphone className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">Install Remont.kz</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Add to home screen for fast access and offline browsing.
            </p>
          </div>
          <button onClick={dismiss} className="shrink-0 p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-2 mt-4">
          <Button className="flex-1 h-9 rounded-xl gap-1.5 text-sm" onClick={() => void install()}>
            <Download className="h-4 w-4" /> Install
          </Button>
          <Button variant="outline" size="sm" className="h-9 rounded-xl text-xs" onClick={dismiss}>
            Not now
          </Button>
        </div>
      </div>
    </div>
  );
}

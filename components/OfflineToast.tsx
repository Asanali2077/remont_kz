"use client";

import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";

export function OfflineToast() {
  const [offline, setOffline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const goOffline = () => { setOffline(true); setWasOffline(true); };
    const goOnline  = () => { setOffline(false); };

    window.addEventListener("offline", goOffline);
    window.addEventListener("online",  goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online",  goOnline);
    };
  }, []);

  if (!offline && !wasOffline) return null;

  return (
    <div className={`fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-2xl border px-4 py-3 shadow-lg text-sm font-semibold transition-all duration-300 ${
      offline
        ? "bg-destructive text-destructive-foreground border-destructive/20"
        : "bg-green-600 text-white border-green-500/20"
    }`}>
      {offline
        ? <><WifiOff className="h-4 w-4" /> No internet connection</>
        : <><Wifi className="h-4 w-4" /> Back online</>}
    </div>
  );
}

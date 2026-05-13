"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter, Link } from "@/i18n/routing";
import { api } from "@/lib/api";
import { ServiceRecord } from "@/lib/types";
import { OrgCard } from "@/components/OrgCard";
import { toast } from "sonner";
import { Heart, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";

export default function FavoritesPage() {
  const t = useTranslations("favorites");
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (!authLoading && !user) router.push("/"); }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      try { setServices(await api.getFavorites()); }
      catch { toast.error("Failed to load favorites"); }
      finally { setLoading(false); }
    })();
  }, [user]);

  function handleUnfavorited(serviceId: string) {
    setServices((prev) => prev.filter((s) => s.id !== serviceId));
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950/40">
              <Heart className="h-5 w-5 fill-rose-500 text-rose-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{t("title")}</h1>
              {services.length > 0 && <p className="text-xs text-muted-foreground">{services.length} saved</p>}
            </div>
          </div>
          <Link href="/repair">
            <Button variant="outline" size="sm" className="gap-1.5 rounded-xl">
              <Search className="h-3.5 w-3.5" /> {t("browseCatalog")}
            </Button>
          </Link>
        </div>

        {services.length === 0 ? (
          <div className="bg-card border border-border/50 rounded-2xl py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/30 mx-auto mb-4">
              <Heart className="h-7 w-7 text-rose-400" />
            </div>
            <p className="font-semibold text-lg mb-1">{t("noFavorites")}</p>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
              {t("noFavoritesDesc")}
            </p>
            <Link href="/repair"><Button className="rounded-xl">{t("browseCatalog")}</Button></Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {services.map((service) => (
              <OrgCard key={service.id} service={service} initialFavorited={true} onUnfavorited={handleUnfavorited} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

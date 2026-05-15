"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ClipboardList, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/company/ProtectedRoute";
import { CategoryFilter, type CategoryFilterValue } from "@/components/filters/CategoryFilter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CitySelect } from "@/components/ui/CitySelect";
import { Label } from "@/components/ui/label";
import { Footer } from "@/components/Footer";
import { OfferDialog } from "@/components/OfferDialog";
import { useAuth } from "@/components/auth/AuthProvider";
import { api } from "@/lib/api";
import type { RequestRecord } from "@/lib/types";
import { fmtNum } from "@/lib/utils";

function RequestCard({
  request,
  myCompanyId,
  onMakeOffer,
  onWithdrawOffer,
  offerSubmitting,
}: {
  request: RequestRecord;
  myCompanyId: string;
  onMakeOffer: (id: string) => void;
  onWithdrawOffer: (id: string) => void;
  offerSubmitting: boolean;
}) {
  const t = useTranslations("catalog");
  const tCat = useTranslations("categories");

  const categoryKey = request.category
    ? request.category.toUpperCase().replace(/-/g, "_")
    : null;
  const categoryLabel = categoryKey ? tCat(categoryKey) : null;
  const myOffer = request.offers?.find((o) => o.companyId === myCompanyId);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          {categoryLabel && <Badge variant="secondary">{categoryLabel}</Badge>}
          {request.city && <span className="text-sm text-muted-foreground">{request.city}</span>}
          {(request.offers?.length ?? 0) > 0 && (
            <span className="text-xs text-muted-foreground ml-auto">
              {t("offersCount", { n: request.offers!.length })}
            </span>
          )}
        </div>
        <p className="text-sm line-clamp-3">{request.description}</p>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {(request.budgetFrom || request.budgetTo) && (
          <p className="text-xs text-muted-foreground">
            {t("budget")}: {request.budgetFrom?.toLocaleString()} – {request.budgetTo?.toLocaleString()} ₸
          </p>
        )}
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs text-muted-foreground">
            {request.client?.name || request.client?.email || t("clientLabel")}
            {" · "}
            {new Date(request.createdAt).toLocaleDateString()}
          </div>
          {myOffer ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {t("offerSentPrice", { price: fmtNum(myOffer.price) })}
              </span>
              <Button size="sm" variant="outline" disabled={offerSubmitting} onClick={() => onWithdrawOffer(request.id)}>
                {t("withdraw")}
              </Button>
            </div>
          ) : (
            <Button size="sm" disabled={offerSubmitting} onClick={() => onMakeOffer(request.id)}>
              {t("makeOffer")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CatalogContent() {
  const t = useTranslations("catalog");
  const { user } = useAuth();
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilterValue>({});
  const [city, setCity] = useState("");
  const [offerDialogRequestId, setOfferDialogRequestId] = useState<string | null>(null);
  const [offerSubmitting, setOfferSubmitting] = useState(false);
  const [forMe, setForMe] = useState(false);

  useEffect(() => {
    void loadRequests();
  }, [forMe]);

  async function loadRequests() {
    try {
      setLoading(true);
      const data = await api.getRequests({ scope: forMe ? "unassigned" : "browse" });
      setRequests(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitOffer(price: number, message: string): Promise<void> {
    if (!offerDialogRequestId) return;
    setOfferSubmitting(true);
    try {
      await api.createOffer(offerDialogRequestId, { price, message: message || undefined });
      toast.success(t("offerSentToast"));
      setOfferDialogRequestId(null);
      await loadRequests();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("offerFailedToast"));
    } finally {
      setOfferSubmitting(false);
    }
  }

  async function handleWithdrawOffer(requestId: string) {
    setOfferSubmitting(true);
    try {
      await api.deleteOffer(requestId);
      toast.success(t("withdrawSuccessToast"));
      await loadRequests();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("withdrawFailedToast"));
    } finally {
      setOfferSubmitting(false);
    }
  }

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const matchesCategory = categoryFilter.category
        ? r.category === (categoryFilter.category === "AUTOMOBILES"
            ? "automobiles"
            : categoryFilter.category === "REAL_ESTATE"
            ? "real-estate"
            : "other")
        : true;
      const matchesCity = city ? r.city === city : true;
      return matchesCategory && matchesCity;
    });
  }, [requests, categoryFilter, city]);

  const offerDialogRequest = requests.find((r) => r.id === offerDialogRequestId) ?? null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold mb-1">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
          <button
            onClick={() => setForMe(v => !v)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition-all ${
              forMe
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30"
            }`}
          >
            <UserCheck className="h-4 w-4" />
            {t("forMe")}
          </button>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-4 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>{t("category")}</Label>
                <CategoryFilter value={categoryFilter} onChange={setCategoryFilter} />
              </div>
              <div className="space-y-1">
                <Label>{t("city")}</Label>
                <CitySelect value={city} onChange={setCity} allowAny />
              </div>
            </div>
            {(categoryFilter.category || city) && (
              <div className="mt-3">
                <Button variant="ghost" size="sm" onClick={() => { setCategoryFilter({}); setCity(""); }}>
                  {t("resetFilters")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {loading ? (
          <div className="py-16 text-center text-muted-foreground">{t("loadingRequests")}</div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ClipboardList className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                {requests.length === 0 ? t("noRequestsYet") : t("noRequestsFilter")}
              </p>
              {requests.length > 0 && (
                <Button variant="ghost" size="sm" className="mt-2" onClick={() => { setCategoryFilter({}); setCity(""); }}>
                  {t("resetFilters")}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-3 text-sm text-muted-foreground">
              {t("requestsFound", { n: filtered.length })}
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filtered.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  myCompanyId={user?.id ?? ""}
                  onMakeOffer={setOfferDialogRequestId}
                  onWithdrawOffer={handleWithdrawOffer}
                  offerSubmitting={offerSubmitting}
                />
              ))}
            </div>
          </>
        )}
      </main>
      <Footer />

      <OfferDialog
        request={offerDialogRequest}
        open={offerDialogRequestId !== null}
        onOpenChange={(v) => { if (!v) setOfferDialogRequestId(null); }}
        onSubmit={handleSubmitOffer}
        submitting={offerSubmitting}
      />
    </div>
  );
}

export default function CompanyCatalogPage() {
  return (
    <ProtectedRoute requiredRole="company">
      <CatalogContent />
    </ProtectedRoute>
  );
}

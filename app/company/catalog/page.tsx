"use client";
import { fmtNum } from "@/lib/utils";

import { useEffect, useMemo, useState } from "react";
import { ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/company/ProtectedRoute";
import { CategoryFilter, type CategoryFilterValue } from "@/components/filters/CategoryFilter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CitySelect } from "@/components/ui/CitySelect";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/components/auth/AuthProvider";
import { api } from "@/lib/api";
import type { RequestRecord } from "@/lib/types";
import { TOP_CATEGORY_LABELS } from "@/lib/categories";

const CATEGORY_LABELS: Record<string, string> = {
  automobiles: TOP_CATEGORY_LABELS.AUTOMOBILES,
  "real-estate": TOP_CATEGORY_LABELS.REAL_ESTATE,
  other: TOP_CATEGORY_LABELS.OTHER,
};

function OfferDialog({
  request,
  open,
  onOpenChange,
  onSubmit,
  submitting,
}: {
  request: RequestRecord;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (price: number, message: string) => void;
  submitting: boolean;
}) {
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (open) { setPrice(""); setMessage(""); }
  }, [open]);

  const priceNum = parseInt(price || "0", 10);
  const isValid = priceNum > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Make an offer</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground line-clamp-2">{request.description}</p>
          {request.budgetFrom || request.budgetTo ? (
            <p className="text-xs text-muted-foreground">
              Client budget: {request.budgetFrom?.toLocaleString()} – {request.budgetTo?.toLocaleString()} ₸
            </p>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="offer-price">Your price (₸) *</Label>
            <Input
              id="offer-price"
              type="number"
              min={1}
              placeholder="e.g. 50000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="offer-message">Message (optional)</Label>
            <Textarea
              id="offer-message"
              rows={3}
              placeholder="Briefly describe your approach, timeline, etc."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={() => onSubmit(priceNum, message)} disabled={!isValid || submitting}>
              {submitting ? "Sending..." : "Send offer"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
  const categoryLabel = request.category ? CATEGORY_LABELS[request.category] : null;
  const myOffer = request.offers?.find((o) => o.companyId === myCompanyId);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          {categoryLabel && <Badge variant="secondary">{categoryLabel}</Badge>}
          {request.city && <span className="text-sm text-muted-foreground">{request.city}</span>}
          {(request.offers?.length ?? 0) > 0 && (
            <span className="text-xs text-muted-foreground ml-auto">
              {request.offers!.length} offer{request.offers!.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <p className="text-sm line-clamp-3">{request.description}</p>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {(request.budgetFrom || request.budgetTo) && (
          <p className="text-xs text-muted-foreground">
            Budget: {request.budgetFrom?.toLocaleString()} – {request.budgetTo?.toLocaleString()} ₸
          </p>
        )}
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs text-muted-foreground">
            {request.client?.name || request.client?.email || "Client"}
            {" · "}
            {new Date(request.createdAt).toLocaleDateString()}
          </div>
          {myOffer ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Offer sent: {fmtNum(myOffer.price)} ₸
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={offerSubmitting}
                onClick={() => onWithdrawOffer(request.id)}
              >
                Withdraw
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              disabled={offerSubmitting}
              onClick={() => onMakeOffer(request.id)}
            >
              Make offer
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CatalogContent() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilterValue>({});
  const [city, setCity] = useState("");
  const [offerDialogRequestId, setOfferDialogRequestId] = useState<string | null>(null);
  const [offerSubmitting, setOfferSubmitting] = useState(false);

  useEffect(() => {
    void loadRequests();
  }, []);

  async function loadRequests() {
    try {
      setLoading(true);
      const data = await api.getRequests({ scope: "unassigned" });
      setRequests(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitOffer(price: number, message: string) {
    if (!offerDialogRequestId) return;
    setOfferSubmitting(true);
    try {
      await api.createOffer(offerDialogRequestId, { price, message: message || undefined });
      toast.success("Offer sent");
      setOfferDialogRequestId(null);
      await loadRequests();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send offer");
    } finally {
      setOfferSubmitting(false);
    }
  }

  async function handleWithdrawOffer(requestId: string) {
    setOfferSubmitting(true);
    try {
      await api.deleteOffer(requestId);
      toast.success("Offer withdrawn");
      await loadRequests();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to withdraw offer");
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

  const offerDialogRequest = filtered.find((r) => r.id === offerDialogRequestId) ?? null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1">Request Catalog</h1>
          <p className="text-sm text-muted-foreground">
            Client requests looking for a service provider
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-4 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Category</Label>
                <CategoryFilter value={categoryFilter} onChange={setCategoryFilter} />
              </div>
              <div className="space-y-1">
                <Label>City</Label>
                <CitySelect value={city} onChange={setCity} allowAny />
              </div>
            </div>
            {(categoryFilter.category || city) && (
              <div className="mt-3">
                <Button variant="ghost" size="sm" onClick={() => { setCategoryFilter({}); setCity(""); }}>
                  Reset filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {loading ? (
          <div className="py-16 text-center text-muted-foreground">Loading requests...</div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ClipboardList className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                {requests.length === 0
                  ? "No new requests yet"
                  : "No requests match the selected filters"}
              </p>
              {requests.length > 0 && (
                <Button variant="ghost" size="sm" className="mt-2" onClick={() => { setCategoryFilter({}); setCity(""); }}>
                  Reset filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-3 text-sm text-muted-foreground">
              Requests found: {filtered.length}
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

      {offerDialogRequest && (
        <OfferDialog
          request={offerDialogRequest}
          open={offerDialogRequestId !== null}
          onOpenChange={(v) => { if (!v) setOfferDialogRequestId(null); }}
          onSubmit={handleSubmitOffer}
          submitting={offerSubmitting}
        />
      )}
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



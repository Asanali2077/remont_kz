"use client";

import { useEffect, useMemo, useState } from "react";
import { ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/company/ProtectedRoute";
import { CategoryFilter, type CategoryFilterValue } from "@/components/filters/CategoryFilter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CitySelect } from "@/components/ui/CitySelect";
import { Label } from "@/components/ui/label";
import { Footer } from "@/components/Footer";
import { api } from "@/lib/api";
import type { RequestRecord } from "@/lib/types";
import { TOP_CATEGORY_LABELS } from "@/lib/categories";

const CATEGORY_LABELS: Record<string, string> = {
  automobiles: TOP_CATEGORY_LABELS.AUTOMOBILES,
  "real-estate": TOP_CATEGORY_LABELS.REAL_ESTATE,
  other: TOP_CATEGORY_LABELS.OTHER,
};

function RequestCard({
  request,
  onAccept,
  accepting,
}: {
  request: RequestRecord;
  onAccept: (id: string) => void;
  accepting: boolean;
}) {
  const categoryLabel = request.category ? CATEGORY_LABELS[request.category] : null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {categoryLabel && (
                <Badge variant="secondary">{categoryLabel}</Badge>
              )}
              {request.city && (
                <span className="text-sm text-muted-foreground">{request.city}</span>
              )}
            </div>
            <p className="text-sm line-clamp-3">{request.description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs text-muted-foreground">
            {request.client?.name || request.client?.email || "Client"}
            {" · "}
            {new Date(request.createdAt).toLocaleDateString()}
          </div>
          <Button
            size="sm"
            disabled={accepting}
            onClick={() => onAccept(request.id)}
          >
            {accepting ? "Accepting..." : "Accept request"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CatalogContent() {
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilterValue>({});
  const [city, setCity] = useState("");
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

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

  async function handleAccept(id: string) {
    setAcceptingId(id);
    try {
      await api.updateRequest(id, { status: "accepted" });
      toast.success("Request accepted");
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to accept request";
      toast.error(message);
    } finally {
      setAcceptingId(null);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1">Request Catalog</h1>
          <p className="text-sm text-muted-foreground">
            Client requests looking for a service provider
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-4 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Category</Label>
                <CategoryFilter
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                />
              </div>
              <div className="space-y-1">
                <Label>City</Label>
                <CitySelect value={city} onChange={setCity} allowAny />
              </div>
            </div>
            {(categoryFilter.category || city) && (
              <div className="mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setCategoryFilter({}); setCity(""); }}
                >
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => { setCategoryFilter({}); setCity(""); }}
                >
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
                  onAccept={handleAccept}
                  accepting={acceptingId === request.id}
                />
              ))}
            </div>
          </>
        )}
      </main>
      <Footer />
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

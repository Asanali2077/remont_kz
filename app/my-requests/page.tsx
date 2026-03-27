"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
  REQUEST_STATUS_LABELS,
  RequestRecord,
  RequestStatus,
  SERVICE_CATEGORY_LABELS,
} from "@/lib/types";
import { ProtectedRoute } from "@/components/company/ProtectedRoute";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    void loadRequests();
  }, []);

  async function loadRequests() {
    try {
      setLoading(true);
      const data = await api.getRequests();
      setRequests(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load requests";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmCancel() {
    if (!cancelId) return;
    setCancelling(true);
    try {
      await api.deleteRequest(cancelId);
      toast.success("Request cancelled");
      setCancelId(null);
      await loadRequests();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to cancel request";
      toast.error(message);
    } finally {
      setCancelling(false);
    }
  }

  async function handleRate(requestId: string, rating: number) {
    try {
      await api.rateRequest(requestId, rating);
      toast.success("Thank you for your rating!");
      await loadRequests();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit rating";
      toast.error(message);
    }
  }

  return (
    <ProtectedRoute requiredRole="client">
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">My requests</h1>
              <p className="text-sm text-muted-foreground">
                Track statuses and see which company is assigned to each request.
              </p>
            </div>
            <Link href="/repair">
              <Button>Create another request</Button>
            </Link>
          </div>

          {loading ? (
            <div className="py-16 text-center">Loading requests...</div>
          ) : requests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="mb-4 text-muted-foreground">You do not have any requests yet.</p>
                <Link href="/repair">
                  <Button variant="outline">Browse services</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg">
                          {request.service?.name || "Custom request"}
                        </CardTitle>
                        <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                          {request.category ? (
                            <span>Category: {SERVICE_CATEGORY_LABELS[request.category]}</span>
                          ) : null}
                          {request.city ? <span>City: {request.city}</span> : null}
                          <span>Created: {new Date(request.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                      <StatusBadge status={request.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm">{request.description}</p>
                    {request.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={request.imageUrl}
                        alt="Request photo"
                        className="max-h-48 rounded-md object-cover"
                      />
                    )}
                    {(request.budgetFrom || request.budgetTo) && (
                      <p className="text-sm text-muted-foreground">
                        Budget:{" "}
                        {request.budgetFrom === request.budgetTo
                          ? `${request.budgetFrom?.toLocaleString()} ₸`
                          : `${request.budgetFrom?.toLocaleString()} – ${request.budgetTo?.toLocaleString()} ₸`}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Assigned company: {request.company?.name || "Not assigned yet"}
                      </div>
                      {request.status === "new" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCancelId(request.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                    {request.status === "completed" && request.rating === null && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Rate this service:</p>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => void handleRate(request.id, star)}
                              className="text-muted-foreground hover:text-yellow-400 transition-colors"
                            >
                              <Star className="h-6 w-6" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {request.rating !== null && request.rating !== undefined && (
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${star <= (request.rating ?? 0) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                          />
                        ))}
                        <span className="ml-1 text-sm text-muted-foreground">Your rating</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cancel confirmation dialog */}
      <Dialog open={cancelId !== null} onOpenChange={(open) => { if (!open) setCancelId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel request?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The request will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelId(null)} disabled={cancelling}>
              Keep
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleConfirmCancel()}
              disabled={cancelling}
            >
              {cancelling ? "Cancelling..." : "Cancel request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}

function StatusBadge({ status }: { status: RequestStatus }) {
  return <Badge>{REQUEST_STATUS_LABELS[status]}</Badge>;
}

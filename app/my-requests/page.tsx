"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [loading, setLoading] = useState(true);

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

  async function handleCancel(id: string) {
    if (!confirm("Cancel this request?")) return;
    try {
      await api.deleteRequest(id);
      toast.success("Request cancelled");
      await loadRequests();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to cancel request";
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
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Assigned company: {request.company?.name || "Not assigned yet"}
                      </div>
                      {request.status === "new" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void handleCancel(request.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

function StatusBadge({ status }: { status: RequestStatus }) {
  return <Badge>{REQUEST_STATUS_LABELS[status]}</Badge>;
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, CheckCircle2, PlayCircle, User, Phone, Mail, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
  REQUEST_STATUS_LABELS,
  RequestRecord,
  RequestStatus,
  SERVICE_CATEGORY_LABELS,
} from "@/lib/types";
import { useAuth } from "@/components/auth/AuthProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type RequestFilter = RequestStatus | "all";

const filterOptions: RequestFilter[] = ["all", "new", "accepted", "in_progress", "completed"];

async function fetchRequests(statusFilter: RequestFilter) {
  return api.getRequests({
    scope: "all",
    status: statusFilter === "all" ? undefined : statusFilter,
  });
}

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
            <Label htmlFor="rm-offer-price">Your price (₸) *</Label>
            <Input
              id="rm-offer-price"
              type="number"
              min={1}
              placeholder="e.g. 50000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rm-offer-message">Message (optional)</Label>
            <Textarea
              id="rm-offer-message"
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

export function RequestsManagement() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<RequestFilter>("all");
  const [loading, setLoading] = useState(true);
  const [offerDialogRequestId, setOfferDialogRequestId] = useState<string | null>(null);
  const [offerSubmitting, setOfferSubmitting] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const data = await fetchRequests(statusFilter);
        setRequests(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load requests";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [statusFilter]);

  async function updateStatus(requestId: string, status: RequestStatus) {
    try {
      await api.updateRequest(requestId, { status });
      toast.success("Request updated");
      const data = await fetchRequests(statusFilter);
      setRequests(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update request";
      toast.error(message);
    }
  }

  async function handleSubmitOffer(price: number, message: string) {
    if (!offerDialogRequestId) return;
    setOfferSubmitting(true);
    try {
      await api.createOffer(offerDialogRequestId, { price, message: message || undefined });
      toast.success("Offer sent");
      setOfferDialogRequestId(null);
      const data = await fetchRequests(statusFilter);
      setRequests(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send offer");
    } finally {
      setOfferSubmitting(false);
    }
  }

  const assignedRequests = useMemo(
    () => requests.filter((request) => Boolean(request.companyId)),
    [requests]
  );

  const unassignedRequests = useMemo(
    () => requests.filter((request) => !request.companyId),
    [requests]
  );

  const offerDialogRequest = unassignedRequests.find((r) => r.id === offerDialogRequestId) ?? null;

  if (loading) {
    return <div className="py-12 text-center">Loading requests...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Requests</h2>
        <Select value={statusFilter} onValueChange={(value: RequestFilter) => setStatusFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option === "all" ? "All" : REQUEST_STATUS_LABELS[option]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <AssignedRequestSection
        title="Assigned to your company"
        emptyText="No assigned requests."
        requests={assignedRequests}
        onUpdateStatus={updateStatus}
      />

      <UnassignedRequestSection
        title="Unassigned requests"
        emptyText="No unassigned requests."
        requests={unassignedRequests}
        myCompanyId={user?.id ?? ""}
        onMakeOffer={setOfferDialogRequestId}
      />

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

function AssignedRequestSection({
  title,
  emptyText,
  requests,
  onUpdateStatus,
}: {
  title: string;
  emptyText: string;
  requests: RequestRecord[];
  onUpdateStatus: (requestId: string, status: RequestStatus) => Promise<void>;
}) {
  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">{emptyText}</CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">
                      {request.service?.name || "Custom request"}
                    </CardTitle>
                    <RequestMeta request={request} />
                  </div>
                  <StatusBadge status={request.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">{request.description}</p>
                {request.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={request.imageUrl} alt="Request photo" className="max-h-48 rounded-md object-cover" />
                )}
                <RequestDetails request={request} />
                <div className="flex flex-wrap gap-2">
                  {request.companyId && request.status === "new" ? (
                    <Button size="sm" onClick={() => void onUpdateStatus(request.id, "accepted")}>
                      Accept
                    </Button>
                  ) : null}
                  {request.companyId && request.status === "accepted" ? (
                    <Button size="sm" variant="outline" onClick={() => void onUpdateStatus(request.id, "in_progress")}>
                      Start work
                    </Button>
                  ) : null}
                  {request.companyId && request.status === "in_progress" ? (
                    <Button size="sm" variant="outline" onClick={() => void onUpdateStatus(request.id, "completed")}>
                      Complete
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

function UnassignedRequestSection({
  title,
  emptyText,
  requests,
  myCompanyId,
  onMakeOffer,
}: {
  title: string;
  emptyText: string;
  requests: RequestRecord[];
  myCompanyId: string;
  onMakeOffer: (id: string) => void;
}) {
  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">{emptyText}</CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => {
            const myOffer = request.offers?.find((o) => o.companyId === myCompanyId);
            return (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">
                        {request.service?.name || "Custom request"}
                      </CardTitle>
                      <RequestMeta request={request} />
                    </div>
                    <StatusBadge status={request.status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">{request.description}</p>
                  {request.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={request.imageUrl} alt="Request photo" className="max-h-48 rounded-md object-cover" />
                  )}
                  <RequestDetails request={request} />
                  <div className="flex flex-wrap gap-2 items-center">
                    {myOffer ? (
                      <span className="text-sm text-muted-foreground">
                        Offer sent: {myOffer.price.toLocaleString()} ₸
                        {myOffer.message ? ` — "${myOffer.message}"` : ""}
                      </span>
                    ) : (
                      <Button size="sm" onClick={() => onMakeOffer(request.id)}>
                        Make offer
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}

function RequestMeta({ request }: { request: RequestRecord }) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
      <span className="flex items-center gap-1">
        <User className="h-4 w-4" />
        {request.client?.name || request.client?.email || "Client"}
      </span>
      {request.client?.email ? (
        <span className="flex items-center gap-1">
          <Mail className="h-4 w-4" />
          {request.client.email}
        </span>
      ) : null}
      {request.client?.phone ? (
        <span className="flex items-center gap-1">
          <Phone className="h-4 w-4" />
          {request.client.phone}
        </span>
      ) : null}
      {request.company?.name ? (
        <span className="flex items-center gap-1">
          <Briefcase className="h-4 w-4" />
          {request.company.name}
        </span>
      ) : null}
    </div>
  );
}

function RequestDetails({ request }: { request: RequestRecord }) {
  return (
    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
      {request.category ? (
        <span>Category: {SERVICE_CATEGORY_LABELS[request.category]}</span>
      ) : null}
      {request.city ? <span>City: {request.city}</span> : null}
      {(request.budgetFrom || request.budgetTo) ? (
        <span>
          Budget:{" "}
          {request.budgetFrom === request.budgetTo
            ? `${request.budgetFrom?.toLocaleString()} ₸`
            : `${request.budgetFrom?.toLocaleString()} – ${request.budgetTo?.toLocaleString()} ₸`}
        </span>
      ) : null}
      <span>Created: {formatDate(request.createdAt)}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: RequestStatus }) {
  if (status === "completed") {
    return (
      <Badge className="bg-green-600 text-white hover:bg-green-700">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        {REQUEST_STATUS_LABELS[status]}
      </Badge>
    );
  }

  if (status === "in_progress") {
    return (
      <Badge variant="secondary">
        <PlayCircle className="mr-1 h-3 w-3" />
        {REQUEST_STATUS_LABELS[status]}
      </Badge>
    );
  }

  return (
    <Badge variant="default">
      <Clock className="mr-1 h-3 w-3" />
      {REQUEST_STATUS_LABELS[status]}
    </Badge>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

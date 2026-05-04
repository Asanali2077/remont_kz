"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2 } from "lucide-react";
import { formatBudget } from "@/lib/utils";
import type { RequestRecord } from "@/lib/types";

interface OfferDialogProps {
  request: RequestRecord | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (price: number, message: string) => Promise<void>;
  submitting?: boolean;
}

export function OfferDialog({ request, open, onOpenChange, onSubmit, submitting }: OfferDialogProps) {
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (open) { setPrice(""); setMessage(""); }
  }, [open]);

  const priceNum = parseInt(price || "0", 10);
  const isValid = priceNum > 0;
  const budget = request ? formatBudget(request.budgetFrom, request.budgetTo) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Make an offer</DialogTitle>
        </DialogHeader>

        {request && (
          <div className="space-y-4 py-1">
            {/* Request preview */}
            <div className="rounded-xl bg-muted/40 border border-border/50 p-3 space-y-1">
              <p className="text-sm font-semibold line-clamp-2">{request.service?.name ?? request.description.slice(0, 80)}</p>
              {budget && (
                <p className="text-xs text-muted-foreground">Client budget: <span className="font-semibold text-foreground">{budget}</span></p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your price (₸) *</Label>
              <Input
                type="number" min={1} placeholder="e.g. 50,000"
                value={price} onChange={e => setPrice(e.target.value)}
                className="rounded-xl h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Message <span className="font-normal text-muted-foreground/60">(optional)</span>
              </Label>
              <Textarea
                rows={3}
                placeholder="Timeline, approach, guarantees…"
                value={message} onChange={e => setMessage(e.target.value)}
                maxLength={500} className="rounded-xl"
              />
              <p className="text-[11px] text-muted-foreground text-right">{message.length}/500</p>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button
                onClick={() => void onSubmit(priceNum, message)}
                disabled={!isValid || submitting}
                className="rounded-xl gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4" />
                {submitting ? "Sending…" : "Send offer"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { Badge } from "@/components/ui/badge";

type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

const LABELS: Record<PaymentStatus, string> = {
  PENDING: "Awaiting payment",
  PAID: "Paid",
  FAILED: "Payment failed",
  REFUNDED: "Refunded",
};

const VARIANTS: Record<PaymentStatus, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline",
  PAID: "default",
  FAILED: "destructive",
  REFUNDED: "secondary",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge variant={VARIANTS[status]}>{LABELS[status]}</Badge>;
}

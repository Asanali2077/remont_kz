/* eslint-disable @next/next/no-img-element */
"use client";

import { Building2, CheckCircle2, Clock, MapPin } from "lucide-react";
import { useMemo } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthModal } from "@/components/auth/AuthModal";
import { RequestCreateDialog } from "@/components/RequestCreateDialog";
import { Currency } from "@/components/Currency";
import { Stars } from "@/components/Stars";
import { ServiceRecord, SERVICE_CATEGORY_LABELS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OrgCardProps {
  service: ServiceRecord;
}

export function OrgCard({ service }: OrgCardProps) {
  const { user } = useAuth();
  const primaryImage = useMemo(
    () =>
      service.images[0]?.url ||
      "https://placehold.co/800x450/e2e8f0/94a3b8?text=No+photo",
    [service.images]
  );

  const requestButton = (() => {
    if (!user) {
      return (
        <AuthModal
          trigger={
            <Button className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Log in to request
            </Button>
          }
        />
      );
    }

    if (user.role !== "client") {
      return (
        <Button disabled className="gap-2">
          Client account required
        </Button>
      );
    }

    return (
      <RequestCreateDialog
        service={service}
        trigger={
          <Button className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Request service
          </Button>
        }
      />
    );
  })();

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <div className="relative aspect-[16/9] w-full">
        <img src={primaryImage} alt={service.name} className="h-full w-full object-cover" loading="lazy" />
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5" />
              {service.name}
            </CardTitle>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>{SERVICE_CATEGORY_LABELS[service.category]}</span>
              {service.city ? (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {service.city}
                </span>
              ) : null}
              {service.availabilityDays ? (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Start in {service.availabilityDays} days
                </span>
              ) : null}
            </div>
          </div>

          <div className="text-right">
            {typeof service.rating === "number" ? (
              <Stars value={service.rating} />
            ) : (
              <div className="text-xs text-muted-foreground">No ratings yet</div>
            )}
            <div className="text-xs text-muted-foreground">
              {service._count?.requests ?? 0} requests
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        <div className="text-sm text-muted-foreground">{service.company.name}</div>
        <div className="line-clamp-3 text-sm text-muted-foreground">{service.description}</div>

        <div className="flex items-center justify-between pt-1">
          <div className="text-sm">
            Budget: <Currency value={service.priceFrom} /> - <Currency value={service.priceTo} />
          </div>
          {requestButton}
        </div>
      </CardContent>
    </Card>
  );
}

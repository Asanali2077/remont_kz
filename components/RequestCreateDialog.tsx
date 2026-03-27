"use client";

import { ReactNode, useMemo, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { ServiceRecord } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CitySelect } from "@/components/ui/CitySelect";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CategoryFilter, type CategoryFilterValue } from "@/components/filters/CategoryFilter";

// Маппинг TopCategory → ServiceCategory (для API)
const CATEGORY_MAP: Record<string, "automobiles" | "real-estate" | "other"> = {
  AUTOMOBILES: "automobiles",
  REAL_ESTATE: "real-estate",
  OTHER: "other",
};

interface RequestCreateDialogProps {
  trigger: ReactNode;
  service?: ServiceRecord;
  onCreated?: () => Promise<void> | void;
}

export function RequestCreateDialog({ trigger, service, onCreated }: RequestCreateDialogProps) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilterValue>({});
  const [city, setCity] = useState(service?.city || "");
  const [file, setFile] = useState<File | null>(null);
  const [budgetFrom, setBudgetFrom] = useState("");
  const [budgetTo, setBudgetTo] = useState("");
  const [fixedBudget, setFixedBudget] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isCustomRequest = !service;

  const canSubmit = useMemo(() => {
    if (!description.trim()) return false;
    if (!isCustomRequest) return true;
    return Boolean(categoryFilter.category && city.trim());
  }, [categoryFilter.category, city, description, isCustomRequest]);

  async function handleSubmit() {
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    try {
      let imageUrl: string | undefined;
      if (file) {
        const upload = await api.uploadMessageFile(file, "image");
        imageUrl = upload.url;
      }

      const budgetFromNum = budgetFrom ? parseFloat(budgetFrom) : undefined;
      const budgetToNum = fixedBudget ? budgetFromNum : (budgetTo ? parseFloat(budgetTo) : undefined);

      if (service) {
        await api.createRequest({
          serviceId: service.id,
          companyId: service.companyId,
          description: description.trim(),
          imageUrl,
          budgetFrom: budgetFromNum,
          budgetTo: budgetToNum,
        });
      } else {
        const apiCategory = categoryFilter.category ? CATEGORY_MAP[categoryFilter.category] : undefined;
        await api.createRequest({
          description: description.trim(),
          category: apiCategory,
          city: city.trim(),
          imageUrl,
          budgetFrom: budgetFromNum,
          budgetTo: budgetToNum,
        });
      }

      toast.success("Request submitted");
      setDescription("");
      setCategoryFilter({});
      setCity(service?.city || "");
      setFile(null);
      setBudgetFrom("");
      setBudgetTo("");
      setFixedBudget(false);
      setOpen(false);
      await onCreated?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create request";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>
            {service ? "Request for service" : "Submit a request"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {service ? (
            <div className="rounded-md border bg-muted/30 p-3 text-sm">
              <div className="font-medium">{service.name}</div>
              <div className="text-muted-foreground">{service.company.name}</div>
              {service.city && <div className="text-muted-foreground">{service.city}</div>}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Service Category</Label>
                <CategoryFilter
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  showAll={false}
                />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <CitySelect value={city} onChange={setCity} />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="request-description">Description</Label>
            <Textarea
              id="request-description"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your task in more detail..."
            />
          </div>

          <div className="space-y-3">
            <Label>Budget (optional)</Label>
            <div className="flex items-center gap-2">
              <Checkbox
                id="fixedBudget"
                checked={fixedBudget}
                onCheckedChange={(checked) => setFixedBudget(Boolean(checked))}
              />
              <Label htmlFor="fixedBudget" className="cursor-pointer font-normal">
                Fixed budget (single amount)
              </Label>
            </div>

            {fixedBudget ? (
              <Input
                type="number"
                placeholder="Budget (₸)"
                value={budgetFrom}
                onChange={(e) => setBudgetFrom(e.target.value)}
              />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  placeholder="From (₸)"
                  value={budgetFrom}
                  onChange={(e) => setBudgetFrom(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="To (₸)"
                  value={budgetTo}
                  onChange={(e) => setBudgetTo(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="request-image">Photo (optional)</Label>
            <Input
              id="request-image"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={!canSubmit || submitting} onClick={() => void handleSubmit()}>
              {submitting ? "Saving..." : "Submit request"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

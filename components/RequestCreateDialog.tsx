"use client";

import { ReactNode, useMemo, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
  SERVICE_CATEGORY_LABELS,
  SERVICE_CATEGORY_OPTIONS,
  ServiceCategory,
  ServiceRecord,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface RequestCreateDialogProps {
  trigger: ReactNode;
  service?: ServiceRecord;
  onCreated?: () => Promise<void> | void;
}

export function RequestCreateDialog({
  trigger,
  service,
  onCreated,
}: RequestCreateDialogProps) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ServiceCategory>("real-estate");
  const [city, setCity] = useState(service?.city || "");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isCustomRequest = !service;
  const canSubmit = useMemo(() => {
    if (!description.trim()) {
      return false;
    }

    if (!isCustomRequest) {
      return true;
    }

    return Boolean(category && city.trim());
  }, [category, city, description, isCustomRequest]);

  async function handleSubmit() {
    if (!canSubmit || submitting) {
      return;
    }

    setSubmitting(true);

    try {
      let imageUrl: string | undefined;

      if (file) {
        const upload = await api.uploadMessageFile(file, "image");
        imageUrl = upload.url;
      }

      if (service) {
        await api.createRequest({
          serviceId: service.id,
          companyId: service.companyId,
          description: description.trim(),
          imageUrl,
        });
      } else {
        await api.createRequest({
          description: description.trim(),
          category,
          city: city.trim(),
          imageUrl,
        });
      }

      toast.success("Request created");
      setDescription("");
      setCategory("real-estate");
      setCity(service?.city || "");
      setFile(null);
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
          <DialogTitle>{service ? "Create request from service" : "Create custom request"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {service ? (
            <div className="rounded-md border bg-muted/30 p-3 text-sm">
              <div className="font-medium">{service.name}</div>
              <div className="text-muted-foreground">{service.company.name}</div>
              {service.city ? <div className="text-muted-foreground">{service.city}</div> : null}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="request-category">Category</Label>
                <Select
                  value={category}
                  onValueChange={(value: ServiceCategory) => setCategory(value)}
                >
                  <SelectTrigger id="request-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_CATEGORY_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {SERVICE_CATEGORY_LABELS[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="request-city">City</Label>
                <Input
                  id="request-city"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="request-description">Description</Label>
            <Textarea
              id="request-description"
              rows={5}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe the work that needs to be done"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="request-image">Optional image</Label>
            <Input
              id="request-image"
              type="file"
              accept="image/*"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={!canSubmit || submitting} onClick={() => void handleSubmit()}>
              {submitting ? "Saving..." : "Create request"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

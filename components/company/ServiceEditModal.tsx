/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useRef, useState } from "react";
import type { ServiceCategory, ServiceFormValues, ServiceRecord } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CitySelect } from "@/components/ui/CitySelect";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CategoryFilter, type CategoryFilterValue } from "@/components/filters/CategoryFilter";
import { api } from "@/lib/api";
import type { TopCategory } from "@/lib/categories";

const CATEGORY_MAP: Record<TopCategory, ServiceCategory> = {
  AUTOMOBILES: "automobiles",
  REAL_ESTATE: "real-estate",
  OTHER: "other",
};

const CATEGORY_REVERSE_MAP: Record<ServiceCategory, TopCategory> = {
  "automobiles": "AUTOMOBILES",
  "real-estate": "REAL_ESTATE",
  "other": "OTHER",
};

interface ServiceEditModalProps {
  service: ServiceRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (service: ServiceFormValues) => void;
}

export function ServiceEditModal({
  service,
  open,
  onOpenChange,
  onSave,
}: ServiceEditModalProps) {
  const [name, setName] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilterValue>({});
  const [description, setDescription] = useState("");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [fixedPrice, setFixedPrice] = useState(false);
  const [city, setCity] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (service) {
      setName(service.name);
      setCategoryFilter({ category: CATEGORY_REVERSE_MAP[service.category] });
      setDescription(service.description);
      setPriceFrom(service.priceFrom.toString());
      setPriceTo(service.priceTo.toString());
      setFixedPrice(service.priceFrom === service.priceTo);
      setCity(service.city || "");
      setImageFile(null);
      setImagePreview(service.images[0]?.url || null);
      return;
    }

    resetForm();
  }, [open, service]);

  function resetForm() {
    setName("");
    setCategoryFilter({});
    setDescription("");
    setPriceFrom("");
    setPriceTo("");
    setFixedPrice(false);
    setCity("");
    setImageFile(null);
    setImagePreview(null);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(service?.images[0]?.url || null);
    }
  }

  async function handleSubmit() {
    if (!name || !description || !priceFrom || !categoryFilter.category) {
      return;
    }
    if (!fixedPrice && !priceTo) return;

    setSubmitting(true);
    try {
      let imageUrl: string | undefined;
      if (imageFile) {
        const upload = await api.uploadMessageFile(imageFile, "image");
        imageUrl = upload.url;
      } else if (service?.images[0]?.url) {
        imageUrl = service.images[0].url;
      }

      const apiCategory: ServiceCategory = CATEGORY_MAP[categoryFilter.category];
      const resolvedPriceTo = fixedPrice ? parseInt(priceFrom, 10) : parseInt(priceTo, 10);

      onSave({
        id: service?.id,
        name,
        category: apiCategory,
        description,
        priceFrom: parseInt(priceFrom, 10),
        priceTo: resolvedPriceTo,
        city: city || undefined,
        imageUrl,
      });
    } finally {
      setSubmitting(false);
    }
  }

  const priceFromNum = parseInt(priceFrom || "0", 10);
  const priceToNum = parseInt(priceTo || "0", 10);
  const isValid =
    Boolean(name) &&
    Boolean(description) &&
    Boolean(priceFrom) &&
    Boolean(categoryFilter.category) &&
    (fixedPrice ? priceFromNum > 0 : (Boolean(priceTo) && priceFromNum <= priceToNum));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{service ? "Edit Service" : "Add Service"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Service Category *</Label>
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

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="fixedPrice"
                checked={fixedPrice}
                onCheckedChange={(checked) => setFixedPrice(Boolean(checked))}
              />
              <Label htmlFor="fixedPrice" className="cursor-pointer font-normal">
                Fixed price (single rate)
              </Label>
            </div>

            {fixedPrice ? (
              <div className="space-y-2">
                <Label htmlFor="priceFixed">Price (₸) *</Label>
                <Input
                  id="priceFixed"
                  type="number"
                  value={priceFrom}
                  onChange={(e) => setPriceFrom(e.target.value)}
                  placeholder="e.g. 5000"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priceFrom">Price From (₸) *</Label>
                  <Input
                    id="priceFrom"
                    type="number"
                    value={priceFrom}
                    onChange={(e) => setPriceFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceTo">Price To (₸) *</Label>
                  <Input
                    id="priceTo"
                    type="number"
                    value={priceTo}
                    onChange={(e) => setPriceTo(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Service Photo</Label>
            <Input
              id="image"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {imagePreview && (
              <div className="relative mt-2 aspect-video w-full overflow-hidden rounded-md border">
                <img src={imagePreview} alt={name || "Service photo"} className="h-full w-full object-cover" />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handleSubmit()} disabled={!isValid || submitting}>
              {submitting ? "Saving..." : service ? "Save" : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

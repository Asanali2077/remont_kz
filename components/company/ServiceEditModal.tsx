/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  SERVICE_CATEGORY_LABELS,
  SERVICE_CATEGORY_OPTIONS,
  ServiceCategory,
  ServiceFormValues,
  ServiceRecord,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ServiceEditModalProps {
  service: ServiceRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (service: ServiceFormValues) => void;
}

const urgencyOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
] as const;

export function ServiceEditModal({
  service,
  open,
  onOpenChange,
  onSave,
}: ServiceEditModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ServiceCategory>("real-estate");
  const [description, setDescription] = useState("");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [active, setActive] = useState(true);
  const [city, setCity] = useState("");
  const [rating, setRating] = useState("");
  const [licensed, setLicensed] = useState(false);
  const [availabilityDays, setAvailabilityDays] = useState("");
  const [urgency, setUrgency] = useState<"low" | "medium" | "high">("medium");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [customAttributes, setCustomAttributes] = useState<Record<string, string>>({});
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    if (service) {
      setName(service.name);
      setCategory(service.category);
      setDescription(service.description);
      setPriceFrom(service.priceFrom.toString());
      setPriceTo(service.priceTo.toString());
      setActive(service.active);
      setCity(service.city || "");
      setRating(service.rating?.toString() || "");
      setLicensed(Boolean(service.licensed));
      setAvailabilityDays(service.availabilityDays?.toString() || "");
      setUrgency((service.urgency as "low" | "medium" | "high" | null) ?? "medium");
      setTags(service.tags || []);
      setCustomAttributes(service.customAttributes || {});
      setImageUrl(service.images[0]?.url || "");
      setTagInput("");
      return;
    }

    resetForm();
  }, [open, service]);

  function resetForm() {
    setName("");
    setCategory("real-estate");
    setDescription("");
    setPriceFrom("");
    setPriceTo("");
    setActive(true);
    setCity("");
    setRating("");
    setLicensed(false);
    setAvailabilityDays("");
    setUrgency("medium");
    setTags([]);
    setTagInput("");
    setCustomAttributes({});
    setImageUrl("");
  }

  function handleAddTag() {
    const value = tagInput.trim();
    if (!value || tags.includes(value)) {
      return;
    }

    setTags((current) => [...current, value]);
    setTagInput("");
  }

  function handleRemoveTag(tag: string) {
    setTags((current) => current.filter((item) => item !== tag));
  }

  function handleAddCustomAttribute() {
    const key = prompt("Attribute key");
    if (!key?.trim()) {
      return;
    }

    const value = prompt("Attribute value");
    if (value === null) {
      return;
    }

    setCustomAttributes((current) => ({
      ...current,
      [key.trim()]: value,
    }));
  }

  function handleRemoveCustomAttribute(key: string) {
    setCustomAttributes((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function handleSubmit() {
    if (!name || !description || !priceFrom || !priceTo) {
      return;
    }

    onSave({
      id: service?.id,
      name,
      category,
      description,
      priceFrom: parseInt(priceFrom, 10),
      priceTo: parseInt(priceTo, 10),
      active,
      city: city || undefined,
      rating: rating ? parseFloat(rating) : undefined,
      licensed,
      availabilityDays: availabilityDays ? parseInt(availabilityDays, 10) : undefined,
      urgency,
      tags: tags.length > 0 ? tags : undefined,
      customAttributes:
        Object.keys(customAttributes).length > 0 ? customAttributes : undefined,
      imageUrl: imageUrl.trim() || "",
    });
  }

  const isValid =
    Boolean(name) &&
    Boolean(description) &&
    Boolean(priceFrom) &&
    Boolean(priceTo) &&
    parseInt(priceFrom || "0", 10) <= parseInt(priceTo || "0", 10);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{service ? "Edit service" : "Add service"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={(value: ServiceCategory) => setCategory(value)}>
                <SelectTrigger>
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
              <Label htmlFor="city">City</Label>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priceFrom">Price from *</Label>
              <Input
                id="priceFrom"
                type="number"
                value={priceFrom}
                onChange={(e) => setPriceFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceTo">Price to *</Label>
              <Input
                id="priceTo"
                type="number"
                value={priceTo}
                onChange={(e) => setPriceTo(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <Input
                id="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="availabilityDays">Availability (days)</Label>
              <Input
                id="availabilityDays"
                type="number"
                value={availabilityDays}
                onChange={(e) => setAvailabilityDays(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="urgency">Urgency</Label>
            <Select
              value={urgency}
              onValueChange={(value: "low" | "medium" | "high") => setUrgency(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {urgencyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="licensed"
              checked={licensed}
              onCheckedChange={(checked) => setLicensed(checked === true)}
            />
            <Label htmlFor="licensed">Licensed</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="active"
              checked={active}
              onCheckedChange={(checked) => setActive(checked === true)}
            />
            <Label htmlFor="active">Active</Label>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                Add
              </Button>
            </div>
            {tags.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Custom attributes</Label>
            <Button type="button" variant="outline" size="sm" onClick={handleAddCustomAttribute}>
              Add attribute
            </Button>
            {Object.entries(customAttributes).map(([key, value]) => (
              <div key={key} className="mt-2 flex items-center gap-2 rounded bg-muted p-2">
                <span className="text-sm font-medium">{key}:</span>
                <span className="flex-1 text-sm">{value}</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveCustomAttribute(key)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              MVP mode: use a direct image URL instead of uploading a file.
            </p>
            {imageUrl ? (
              <div className="relative mt-2 aspect-video w-full overflow-hidden rounded-md border">
                <img src={imageUrl} alt={name || "Service image"} className="h-full w-full object-cover" />
              </div>
            ) : null}
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!isValid}>
              {service ? "Save" : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

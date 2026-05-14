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
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { X, Plus, Loader2 } from "lucide-react";
import type { TopCategory } from "@/lib/categories";
import { toast } from "sonner";

const MAX_PHOTOS = 10;

const CATEGORY_MAP: Record<TopCategory, ServiceCategory> = {
  AUTOMOBILES: "automobiles",
  REAL_ESTATE: "real-estate",
  OTHER: "other",
};

const CATEGORY_REVERSE_MAP: Record<ServiceCategory, TopCategory> = {
  "automobiles": "AUTOMOBILES",
  "real-estate": "REAL_ESTATE",
  "plumbing":    "REAL_ESTATE",
  "electrical":  "REAL_ESTATE",
  "painting":    "REAL_ESTATE",
  "cleaning":    "REAL_ESTATE",
  "renovation":  "REAL_ESTATE",
  "welding":     "OTHER",
  "roofing":     "REAL_ESTATE",
  "other":       "OTHER",
};

interface ServiceEditModalProps {
  service: ServiceRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (service: ServiceFormValues) => void;
}

export function ServiceEditModal({ service, open, onOpenChange, onSave }: ServiceEditModalProps) {
  const t = useTranslations("company");
  const tCommon = useTranslations("common");
  const [name, setName] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilterValue>({});
  const [description, setDescription] = useState("");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [fixedPrice, setFixedPrice] = useState(false);
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  /* Multi-photo state */
  const [existingUrls, setExistingUrls] = useState<string[]>([]);   // already uploaded
  const [newFiles, setNewFiles] = useState<File[]>([]);             // selected, not yet uploaded
  const [newPreviews, setNewPreviews] = useState<string[]>([]);     // blob previews

  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalCount = existingUrls.length + newFiles.length;
  const canAddMore = totalCount < MAX_PHOTOS;

  useEffect(() => {
    if (!open) return;
    if (service) {
      setName(service.name);
      setCategoryFilter({ category: CATEGORY_REVERSE_MAP[service.category] });
      setDescription(service.description);
      setPriceFrom(service.priceFrom.toString());
      setPriceTo(service.priceTo.toString());
      setFixedPrice(service.priceFrom === service.priceTo);
      setCity(service.city || "");
      setAddress(service.address || "");
      setStartDate(service.startDate ? new Date(service.startDate).toISOString().slice(0, 10) : "");
      setEndDate(service.endDate ? new Date(service.endDate).toISOString().slice(0, 10) : "");
      setTags(service.tags ?? []);
      setTagInput("");
      setExistingUrls(service.images.map((img) => img.url));
      setNewFiles([]);
      setNewPreviews([]);
    } else {
      resetForm();
    }
  }, [open, service]);

  function resetForm() {
    setName(""); setCategoryFilter({}); setDescription("");
    setPriceFrom(""); setPriceTo(""); setFixedPrice(false);
    setCity(""); setAddress(""); setStartDate(""); setEndDate("");
    setTags([]); setTagInput("");
    setExistingUrls([]); setNewFiles([]); setNewPreviews([]);
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags([...tags, t]);
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  function handleAddPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const remaining = MAX_PHOTOS - totalCount;
    const toAdd = files.slice(0, remaining);
    setNewFiles((prev) => [...prev, ...toAdd]);
    setNewPreviews((prev) => [...prev, ...toAdd.map((f) => URL.createObjectURL(f))]);
    // Reset input so same file can be re-added if deleted
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeExisting(idx: number) {
    setExistingUrls((prev) => prev.filter((_, i) => i !== idx));
  }

  function removeNew(idx: number) {
    URL.revokeObjectURL(newPreviews[idx]);
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
    setNewPreviews((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit() {
    if (!name || !description || !priceFrom || !categoryFilter.category) return;
    if (!fixedPrice && !priceTo) return;

    setSubmitting(true);
    try {
      /* Upload new files */
      setUploading(true);
      const uploadedUrls: string[] = [];
      for (const file of newFiles) {
        try {
          const res = await api.uploadMessageFile(file, "image");
          uploadedUrls.push(res.url);
        } catch {
          toast.error(`Failed to upload ${file.name}`);
        }
      }
      setUploading(false);

      const allUrls = [...existingUrls, ...uploadedUrls];
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
        address: address.trim() || undefined,
        imageUrls: allUrls,
        tags,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
      });
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  }

  const priceFromNum = parseInt(priceFrom || "0", 10);
  const priceToNum = parseInt(priceTo || "0", 10);
  const isValid =
    Boolean(name) && Boolean(description) && Boolean(priceFrom) && Boolean(categoryFilter.category) &&
    (fixedPrice ? priceFromNum > 0 : Boolean(priceTo) && priceFromNum <= priceToNum);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[580px]">
        <DialogHeader>
          <DialogTitle>{service ? t("editService") : t("addService")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">

          {/* ── Photos (first field) ── */}
          <div className="space-y-2">
            <Label>
              {t("photos")} <span className="text-muted-foreground font-normal text-xs">({totalCount}/{MAX_PHOTOS})</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {/* Existing photos */}
              {existingUrls.map((url, i) => (
                <div key={url} className="relative w-20 h-20 rounded-lg overflow-hidden border group">
                  <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExisting(i)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {/* New (not yet uploaded) photos */}
              {newPreviews.map((url, i) => (
                <div key={url} className="relative w-20 h-20 rounded-lg overflow-hidden border group">
                  <img src={url} alt={`New photo ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNew(i)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {/* "new" indicator */}
                  <div className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-[9px] px-1 rounded">{t("newBadge")}</div>
                </div>
              ))}

              {/* Add button */}
              {canAddMore && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 hover:border-primary/60 hover:bg-muted/30 transition-colors"
                >
                  <Plus className="h-5 w-5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{t("addPhoto")}</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleAddPhotos}
            />
            {totalCount === 0 && (
              <p className="text-xs text-muted-foreground">{t("photosHint", { max: String(MAX_PHOTOS) })}</p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{t("serviceName")} *</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>{t("serviceCategory")} *</Label>
            <CategoryFilter value={categoryFilter} onChange={setCategoryFilter} showAll={false} />
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label>{t("city")}</Label>
            <CitySelect value={city} onChange={setCity} />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">
              {t("address")} <span className="text-muted-foreground font-normal text-xs">({t("addressOptional")})</span>
            </Label>
            <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t("addressPlaceholder")} />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>
              {t("tags")} <span className="text-muted-foreground font-normal text-xs">({t("tagsHint")})</span>
            </Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder={t("tagsPlaceholder")}
                className="rounded-xl h-9 text-sm flex-1"
                maxLength={30}
              />
              <Button type="button" variant="outline" size="sm" className="rounded-xl h-9 shrink-0" onClick={addTag}>
                + {t("addTag")}
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1">
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive transition-colors ml-0.5">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">{t("startDate")}</Label>
              <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">{t("endDate")}</Label>
              <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate || undefined} />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t("description")} *</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
          </div>

          {/* Price */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox id="fixedPrice" checked={fixedPrice} onCheckedChange={(c) => setFixedPrice(Boolean(c))} />
              <Label htmlFor="fixedPrice" className="cursor-pointer font-normal">{t("fixedPrice")}</Label>
            </div>
            {fixedPrice ? (
              <div className="space-y-2">
                <Label htmlFor="priceFixed">{t("price")} (₸) *</Label>
                <Input id="priceFixed" type="number" value={priceFrom} onChange={(e) => setPriceFrom(e.target.value)} placeholder="e.g. 5000" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priceFrom">{t("priceFrom")} (₸) *</Label>
                  <Input id="priceFrom" type="number" value={priceFrom} onChange={(e) => setPriceFrom(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceTo">{t("priceTo")} (₸) *</Label>
                  <Input id="priceTo" type="number" value={priceTo} onChange={(e) => setPriceTo(e.target.value)} />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>{tCommon("cancel")}</Button>
            <Button onClick={() => void handleSubmit()} disabled={!isValid || submitting}>
              {uploading
                ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />{t("uploading")}</>
                : submitting
                ? t("saving")
                : service ? tCommon("save") : t("createBtn")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CompanyService, ServiceCategory } from "@/lib/types";
import { CITIES } from "@/lib/data";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useLang } from "@/components/nav/LangSwitcher";
import { t } from "@/lib/translations";
import Image from "next/image";

interface ServiceEditModalProps {
  service: CompanyService | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (service: CompanyService) => void;
}

export function ServiceEditModal({
  service,
  open,
  onOpenChange,
  onSave,
}: ServiceEditModalProps) {
  const { lang } = useLang();
  const tr = t(lang);
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
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (service) {
      setName(service.name);
      setCategory(service.category);
      setDescription(service.description);
      setPriceFrom(service.priceFrom.toString());
      setPriceTo(service.priceTo.toString());
      setActive(service.active);
      setCity(service.city || "");
      setRating(service.rating?.toString() || "");
      setLicensed(service.licensed || false);
      setAvailabilityDays(service.availabilityDays?.toString() || "");
      setUrgency(service.urgency || "medium");
      setTags(service.tags || []);
      setCustomAttributes(service.customAttributes || {});
      setImages(service.images || []);
    } else {
      resetForm();
    }
  }, [service, open]);

  const resetForm = () => {
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
    setImages([]);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    try {
      const file = files[0];
      if (file && file.type.startsWith("image/")) {
        if (service?.id) {
          // Upload to existing service
          const result = await api.uploadServiceImage(service.id, file);
          setImages([...images, result.url]);
          toast.success(lang === "kaz" ? "Сурет жүктелді" : "Изображение загружено");
        } else {
          // For new service, convert to base64 for now
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            setImages([...images, result]);
          };
          reader.readAsDataURL(file);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : tr.common.error;
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (index: number) => {
    if (service?.id && images[index]?.startsWith("/uploads")) {
      // If it's an uploaded image, delete from server
      try {
        // Find image ID - this would need to be stored separately
        // For now, just remove from local state
        setImages(images.filter((_, i) => i !== index));
      } catch (error) {
        const message = error instanceof Error ? error.message : tr.common.error;
        toast.error(message);
      }
    } else {
      setImages(images.filter((_, i) => i !== index));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleAddCustomAttribute = () => {
    const key = prompt(lang === "kaz" ? "Атрибут кілті:" : "Введите ключ атрибута:");
    if (key && key.trim()) {
      const value = prompt(lang === "kaz" ? "Мәні:" : "Введите значение:");
      if (value !== null) {
        setCustomAttributes({ ...customAttributes, [key.trim()]: value });
      }
    }
  };

  const handleRemoveCustomAttribute = (key: string) => {
    const newAttrs = { ...customAttributes };
    delete newAttrs[key];
    setCustomAttributes(newAttrs);
  };

  const handleSubmit = () => {
    if (!name || !description || !priceFrom || !priceTo) return;

    const serviceData: CompanyService = {
      id: service?.id || "",
      name,
      category,
      description,
      priceFrom: parseInt(priceFrom),
      priceTo: parseInt(priceTo),
      active,
      city: city || undefined,
      rating: rating ? parseFloat(rating) : undefined,
      licensed: licensed || undefined,
      availabilityDays: availabilityDays ? parseInt(availabilityDays) : undefined,
      urgency,
      tags: tags.length > 0 ? tags : undefined,
      customAttributes: Object.keys(customAttributes).length > 0 ? customAttributes : undefined,
      images: images.length > 0 ? images : undefined,
    };

    onSave(serviceData);
  };

  const isValid = name && description && priceFrom && priceTo && parseInt(priceFrom) <= parseInt(priceTo);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {service ? tr.services.editService : tr.services.addService}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">{tr.services.name} *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={lang === "kaz" ? "Мысалы: Толық жөндеу" : "Например: Ремонт под ключ"}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">{tr.services.category} *</Label>
              <Select value={category} onValueChange={(value: ServiceCategory) => setCategory(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="real-estate">{lang === "kaz" ? "Меншік" : "Недвижимость"}</SelectItem>
                  <SelectItem value="automobiles">{lang === "kaz" ? "Авто" : "Авто"}</SelectItem>
                  <SelectItem value="other">{lang === "kaz" ? "Басқа" : "Другое"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">{tr.services.city}</Label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger>
                  <SelectValue placeholder={lang === "kaz" ? "Қаланы таңдаңыз" : "Выберите город"} />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{tr.services.description} *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={lang === "kaz" ? "Қызметтің толық сипаттамасы" : "Подробное описание услуги"}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priceFrom">{tr.services.priceFrom} *</Label>
              <Input
                id="priceFrom"
                type="number"
                value={priceFrom}
                onChange={(e) => setPriceFrom(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceTo">{tr.services.priceTo} *</Label>
              <Input
                id="priceTo"
                type="number"
                value={priceTo}
                onChange={(e) => setPriceTo(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rating">{tr.services.rating}</Label>
              <Input
                id="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="0.0 - 5.0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="availabilityDays">{tr.services.availabilityDays}</Label>
              <Input
                id="availabilityDays"
                type="number"
                value={availabilityDays}
                onChange={(e) => setAvailabilityDays(e.target.value)}
                placeholder={lang === "kaz" ? "Күн саны" : "Количество дней"}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="urgency">
              {lang === "kaz" ? "Шұғылдық" : "Срочность"}
            </Label>
            <Select value={urgency} onValueChange={(value: "low" | "medium" | "high") => setUrgency(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">{lang === "kaz" ? "Төмен" : "Низкая"}</SelectItem>
                <SelectItem value="medium">{lang === "kaz" ? "Орташа" : "Средняя"}</SelectItem>
                <SelectItem value="high">{lang === "kaz" ? "Жоғары" : "Высокая"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="licensed"
              checked={licensed}
              onCheckedChange={(checked) => setLicensed(checked === true)}
            />
            <Label htmlFor="licensed" className="cursor-pointer">
              {tr.services.licensed}
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="active"
              checked={active}
              onCheckedChange={(checked) => setActive(checked === true)}
            />
            <Label htmlFor="active" className="cursor-pointer">
              {tr.services.active}
            </Label>
          </div>

          <div className="space-y-2">
            <Label>{tr.services.tags}</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder={lang === "kaz" ? "Тег қосу" : "Добавить тег"}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                {tr.common.add}
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              {lang === "kaz" ? "Пайдаланушы атрибуттары" : "Пользовательские атрибуты"}
            </Label>
            <Button type="button" variant="outline" size="sm" onClick={handleAddCustomAttribute}>
              {tr.common.add} {lang === "kaz" ? "атрибут" : "атрибут"}
            </Button>
            {Object.keys(customAttributes).length > 0 && (
              <div className="space-y-2 mt-2">
                {Object.entries(customAttributes).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <span className="text-sm font-medium">{key}:</span>
                    <span className="text-sm flex-1">{value}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCustomAttribute(key)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>{tr.services.images}</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
              disabled={uploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? tr.common.loading : tr.services.uploadImages}
            </Button>
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {images.map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                    <Image src={img} alt={`Upload ${index + 1}`} fill className="object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {tr.common.cancel}
            </Button>
            <Button onClick={handleSubmit} disabled={!isValid || uploading}>
              {uploading ? tr.common.loading : service ? tr.common.save : tr.common.add}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

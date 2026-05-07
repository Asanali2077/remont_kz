"use client";

import { ReactNode, useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { ServiceRecord } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { CitySelect } from "@/components/ui/CitySelect";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CategoryFilter, type CategoryFilterValue } from "@/components/filters/CategoryFilter";
import {
  CheckCircle2, ChevronRight, ChevronLeft, Loader2,
  MessageSquare, MapPin, Wallet, Camera, X,
} from "lucide-react";

const CATEGORY_MAP: Record<string, "automobiles" | "real-estate" | "other"> = {
  AUTOMOBILES: "automobiles", REAL_ESTATE: "real-estate", OTHER: "other",
};

interface Props {
  trigger: ReactNode;
  service?: ServiceRecord;
  onCreated?: () => Promise<void> | void;
}

const STEPS = ["Task", "Details", "Confirm"];

export function RequestCreateDialog({ trigger, service, onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  /* Step 1 */
  const [description, setDescription] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilterValue>({});

  /* Step 2 */
  const [city, setCity] = useState(service?.city || "");
  const [budgetFrom, setBudgetFrom] = useState("");
  const [budgetTo, setBudgetTo] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  /* Submit */
  const [submitting, setSubmitting] = useState(false);

  const isCustom = !service;

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function canProceed(s: number): boolean {
    if (s === 0) {
      if (!description.trim()) return false;
      if (isCustom && !categoryFilter.category) return false;
      return true;
    }
    if (s === 1) {
      if (isCustom && !city.trim()) return false;
      return true;
    }
    return true;
  }

  function resetAll() {
    setStep(0); setDescription(""); setCategoryFilter({});
    setCity(service?.city || ""); setBudgetFrom(""); setBudgetTo("");
    setFile(null); setPreview(null);
  }

  function handleClose(v: boolean) {
    setOpen(v);
    if (!v) resetAll();
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      let imageUrl: string | undefined;
      if (file) imageUrl = (await api.uploadMessageFile(file, "image")).url;

      const budgetFromNum = budgetFrom ? parseFloat(budgetFrom) : undefined;
      const budgetToNum = budgetTo ? parseFloat(budgetTo) : budgetFromNum;

      if (service) {
        await api.createRequest({ serviceId: service.id, companyId: service.companyId, description: description.trim(), imageUrl, budgetFrom: budgetFromNum, budgetTo: budgetToNum });
      } else {
        await api.createRequest({ description: description.trim(), category: categoryFilter.category ? CATEGORY_MAP[categoryFilter.category] : undefined, city: city.trim(), imageUrl, budgetFrom: budgetFromNum, budgetTo: budgetToNum });
      }

      toast.success("Request submitted! Companies will respond shortly.");
      setOpen(false);
      resetAll();
      await onCreated?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create request");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border/50">
          <h2 className="text-lg font-bold mb-4">
            {service ? `Request: ${service.name}` : "Post a request"}
          </h2>

          {/* Progress */}
          <div className="flex items-center gap-2">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-2 flex-1 last:flex-none">
                <div className="flex items-center gap-1.5">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                    i < step  ? "bg-primary text-primary-foreground" :
                    i === step ? "bg-primary/20 text-primary border-2 border-primary" :
                                 "bg-muted text-muted-foreground"
                  }`}>
                    {i < step ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                  </div>
                  <span className={`text-xs font-semibold whitespace-nowrap hidden sm:block ${i === step ? "text-primary" : i < step ? "text-muted-foreground" : "text-muted-foreground/50"}`}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 rounded-full mx-1 ${i < step ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 min-h-[280px]">

          {/* ── Step 0: Task ── */}
          {step === 0 && (
            <div className="space-y-4">
              {/* Service preview */}
              {service ? (
                <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/30 p-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-primary">{(service.company?.name ?? service.company?.email ?? "?")[0]}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{service.name}</p>
                    <p className="text-xs text-muted-foreground">{service.company?.name} {service.city ? `· ${service.city}` : ""}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Service type *
                  </label>
                  <CategoryFilter value={categoryFilter} onChange={setCategoryFilter} showAll={false} />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-primary" /> Describe your task *
                </label>
                <Textarea
                  rows={5}
                  placeholder="What exactly needs to be done? The more detail — the better offers you'll get. Example: Replace kitchen faucet, install new shower head, fix leaking pipe under sink."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="resize-none rounded-xl text-sm"
                  maxLength={1000}
                />
                <p className="text-[11px] text-muted-foreground text-right">{description.length}/1000</p>
              </div>
            </div>
          )}

          {/* ── Step 1: Details ── */}
          {step === 1 && (
            <div className="space-y-4">
              {isCustom && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" /> City *
                  </label>
                  <CitySelect value={city} onChange={setCity} />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <Wallet className="h-3.5 w-3.5 text-primary" /> Budget (optional)
                </label>
                <div className="flex items-center gap-2">
                  <Input value={budgetFrom} onChange={e => setBudgetFrom(e.target.value)} type="number" placeholder="Min (₸)" className="rounded-xl h-10" />
                  <span className="text-muted-foreground text-sm shrink-0">—</span>
                  <Input value={budgetTo} onChange={e => setBudgetTo(e.target.value)} type="number" placeholder="Max (₸)" className="rounded-xl h-10" />
                </div>
                <p className="text-[11px] text-muted-foreground">Leave empty if not sure. Companies will suggest their price.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <Camera className="h-3.5 w-3.5 text-primary" /> Photo (optional)
                </label>
                {preview ? (
                  <div className="relative w-full h-36 rounded-xl overflow-hidden border border-border/50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                    <button onClick={() => { setFile(null); setPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                      className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => fileRef.current?.click()}
                    className="w-full h-24 rounded-xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary">
                    <Camera className="h-6 w-6" />
                    <span className="text-xs font-medium">Upload a photo of the problem</span>
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
              </div>
            </div>
          )}

          {/* ── Step 2: Confirm ── */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border/50 bg-muted/30 divide-y divide-border/40 overflow-hidden">
                {service && (
                  <div className="flex justify-between items-start px-4 py-3 text-sm">
                    <span className="text-muted-foreground">Service</span>
                    <span className="font-semibold text-right max-w-[60%]">{service.name}</span>
                  </div>
                )}
                {categoryFilter.category && (
                  <div className="flex justify-between items-center px-4 py-3 text-sm">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-semibold">{
                      { AUTOMOBILES: "🚗 Automobiles", REAL_ESTATE: "🏠 Real Estate", OTHER: "🔧 Other" }[categoryFilter.category]
                    }</span>
                  </div>
                )}
                {city && (
                  <div className="flex justify-between items-center px-4 py-3 text-sm">
                    <span className="text-muted-foreground">City</span>
                    <span className="font-semibold">📍 {city}</span>
                  </div>
                )}
                {(budgetFrom || budgetTo) && (
                  <div className="flex justify-between items-center px-4 py-3 text-sm">
                    <span className="text-muted-foreground">Budget</span>
                    <span className="font-semibold">{budgetFrom && `${Number(budgetFrom).toLocaleString()} ₸`}{budgetTo && ` – ${Number(budgetTo).toLocaleString()} ₸`}</span>
                  </div>
                )}
                {file && (
                  <div className="flex justify-between items-center px-4 py-3 text-sm">
                    <span className="text-muted-foreground">Photo</span>
                    <span className="font-semibold text-primary">✓ Attached</span>
                  </div>
                )}
                <div className="px-4 py-3">
                  <p className="text-xs text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{description}</p>
                </div>
              </div>
              <div className="rounded-xl bg-primary/5 border border-primary/20 px-4 py-3 flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  After submitting, verified companies matching your request will be notified and will send offers within a few hours. You can review and accept the best one.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/50 flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" className="rounded-xl gap-1" onClick={() => step > 0 ? setStep(s => s - 1) : handleClose(false)}>
            <ChevronLeft className="h-4 w-4" />
            {step === 0 ? "Cancel" : "Back"}
          </Button>

          {step < 2 ? (
            <Button className="rounded-xl gap-2 px-6" disabled={!canProceed(step)} onClick={() => setStep(s => s + 1)}>
              Continue <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button className="rounded-xl gap-2 px-6 shadow-sm shadow-primary/20" disabled={submitting} onClick={() => void handleSubmit()}>
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : <><CheckCircle2 className="h-4 w-4" /> Submit request</>}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

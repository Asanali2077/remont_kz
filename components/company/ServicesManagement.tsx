/* eslint-disable @next/next/no-img-element */
"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  CheckCircle2, Edit, Plus, Trash2, XCircle, Loader2,
  Star, TrendingUp, ImageIcon, MapPin,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { SERVICE_CATEGORY_LABELS, ServiceFormValues, ServiceRecord } from "@/lib/types";
import { CATEGORY_COLORS, fmtNum } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";
import { ServiceEditModal } from "./ServiceEditModal";
import { OnboardingChecklist } from "./OnboardingChecklist";
import { Button } from "@/components/ui/button";

export function ServicesManagement() {
  const t = useTranslations("company");
  const tCommon = useTranslations("common");
  const { user } = useAuth();
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [editingService, setEditingService] = useState<ServiceRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [hasAvatar, setHasAvatar] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    void Promise.all([
      api.getServices({ companyId: user.id }).then(setServices),
      api.getProfile().then(p => setHasAvatar(!!p.avatarUrl)),
      api.getRequests({ scope: "assigned" }).then(reqs => setHasCompleted(reqs.some(r => r.status === "completed"))),
    ]).catch(() => null).finally(() => setLoading(false));
  }, [user?.id]);

  async function reload() {
    if (!user?.id) return;
    setServices(await api.getServices({ companyId: user.id }));
  }

  async function handleToggleActive(id: string, active: boolean) {
    try { await api.updateService(id, { active: !active }); await reload(); }
    catch (e) { toast.error(e instanceof Error ? e.message : tCommon("error")); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this service?")) return;
    try {
      await api.deleteService(id);
      toast.success(t("deleted"));
      setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
      await reload();
    } catch (e) { toast.error(e instanceof Error ? e.message : tCommon("error")); }
  }

  async function handleBulkDelete() {
    if (selected.size === 0 || !confirm(`Delete ${selected.size} service(s)?`)) return;
    setDeleting(true);
    let failed = 0;
    for (const id of Array.from(selected)) {
      try { await api.deleteService(id); } catch { failed++; }
    }
    setSelected(new Set());
    if (failed) toast.error(`${failed} failed`); else toast.success(`${selected.size} deleted`);
    await reload();
    setDeleting(false);
  }

  async function handleSave(service: ServiceFormValues) {
    try {
      if (service.id) { await api.updateService(service.id, service); toast.success(t("updated")); }
      else { await api.createService(service); toast.success(t("created")); }
      setIsModalOpen(false); setEditingService(null);
      await reload();
    } catch (e) { toast.error(e instanceof Error ? e.message : tCommon("error")); }
  }

  function toggleSelect(id: string) {
    setSelected(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }

  function toggleSelectAll() {
    setSelected(selected.size === services.length ? new Set() : new Set(services.map(s => s.id)));
  }

  if (loading) return <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />)}</div>;

  return (
    <div className="space-y-5">
      {/* Onboarding checklist */}
      <OnboardingChecklist
        services={services}
        hasCompletedRequest={hasCompleted}
        hasAvatar={hasAvatar}
        onNavigate={() => {}}
      />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-bold">{t("services")}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{services.length} total · {services.filter(s => s.active).length} active</p>
        </div>
        <div className="flex items-center gap-2">
          {services.length > 0 && (
            <div className="flex items-center gap-2">
              <Checkbox checked={selected.size === services.length && services.length > 0} onCheckedChange={toggleSelectAll} id="sel-all" />
              <label htmlFor="sel-all" className="text-sm cursor-pointer select-none text-muted-foreground">
                {selected.size > 0 ? `${selected.size} selected` : "Select all"}
              </label>
              {selected.size > 0 && (
                <Button variant="destructive" size="sm" className="rounded-xl gap-1.5" onClick={() => void handleBulkDelete()} disabled={deleting}>
                  {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                  Delete {selected.size}
                </Button>
              )}
            </div>
          )}
          <Button onClick={() => { setEditingService(null); setIsModalOpen(true); }} className="rounded-xl gap-2">
            <Plus className="h-4 w-4" /> {t("addService")}
          </Button>
        </div>
      </div>

      {/* Empty */}
      {services.length === 0 && (
        <div className="text-center py-14 rounded-2xl border border-dashed border-border/60 bg-card">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mx-auto mb-4">
            <Plus className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="font-semibold mb-1">{t("noServices")}</p>
          <p className="text-sm text-muted-foreground mb-5">Add your first service so clients can find you</p>
          <Button className="rounded-xl gap-2" onClick={() => { setEditingService(null); setIsModalOpen(true); }}>
            <Plus className="h-4 w-4" /> {t("addService")}
          </Button>
        </div>
      )}

      {/* Service cards */}
      {services.length > 0 && (
        <div className="space-y-3">
          {services.map(service => {
            const isSelected = selected.has(service.id);
            return (
              <div key={service.id}
                className={`bg-card border rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-md ${isSelected ? "ring-2 ring-primary border-primary/50" : "border-border/50 hover:border-border"}`}>
                <div className="flex items-stretch">
                  {/* Checkbox column */}
                  <div className="flex items-start pt-4 pl-4 pr-2 shrink-0">
                    <Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(service.id)} />
                  </div>

                  {/* Photo */}
                  {service.images[0]?.url ? (
                    <div className="relative w-28 md:w-36 shrink-0 overflow-hidden">
                      <img src={service.images[0].url} alt={service.name} className="h-full w-full object-cover" />
                      {service.images.length > 1 && (
                        <div className="absolute bottom-2 right-2 flex items-center gap-1 text-[10px] bg-black/50 text-white px-1.5 py-0.5 rounded-full">
                          <ImageIcon className="h-2.5 w-2.5" /> {service.images.length}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-28 md:w-36 shrink-0 bg-muted flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0 p-4 flex flex-col gap-2">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-sm">{service.name}</h3>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${CATEGORY_COLORS[service.category] ?? CATEGORY_COLORS.other}`}>
                            {SERVICE_CATEGORY_LABELS[service.category]}
                          </span>
                          {service.city && (
                            <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                              <MapPin className="h-3 w-3" />{service.city}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold mt-1">
                          {fmtNum(service.priceFrom)}
                          {service.priceTo !== service.priceFrom && <> – {fmtNum(service.priceTo)}</>}
                          <span className="text-xs font-normal text-muted-foreground ml-1">₸</span>
                        </p>
                      </div>

                      {/* Active toggle */}
                      <button
                        onClick={() => void handleToggleActive(service.id, service.active)}
                        className={`shrink-0 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold transition-all ${
                          service.active
                            ? "border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950/40 dark:text-green-400"
                            : "border-border bg-muted text-muted-foreground"
                        }`}
                      >
                        {service.active ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {service.active ? tCommon("yes") : tCommon("no")}
                      </button>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground line-clamp-1">{service.description}</p>

                    {/* Performance metrics */}
                    <div className="flex items-center gap-4 pt-1">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span className="font-semibold text-foreground">{service._count?.requests ?? 0}</span> requests
                      </span>
                      {typeof service.rating === "number" ? (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-semibold text-foreground">{service.rating.toFixed(1)}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">No ratings yet</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1 border-t border-border/40 mt-1">
                      <Button variant="outline" size="sm" className="h-8 rounded-xl text-xs gap-1.5" onClick={() => { setEditingService(service); setIsModalOpen(true); }}>
                        <Edit className="h-3.5 w-3.5" /> {tCommon("edit")}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 rounded-xl text-xs text-destructive hover:bg-destructive/10" onClick={() => void handleDelete(service.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ServiceEditModal service={editingService} open={isModalOpen} onOpenChange={setIsModalOpen} onSave={handleSave} />
    </div>
  );
}



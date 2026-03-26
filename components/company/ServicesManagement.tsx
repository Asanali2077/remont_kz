/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Edit, Plus, Trash2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
  SERVICE_CATEGORY_LABELS,
  ServiceFormValues,
  ServiceRecord,
} from "@/lib/types";
import { useAuth } from "@/components/auth/AuthProvider";
import { ServiceEditModal } from "./ServiceEditModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ServicesManagement() {
  const { user } = useAuth();
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [editingService, setEditingService] = useState<ServiceRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    void loadServices(user.id);
  }, [user?.id]);

  async function loadServices(companyId: string) {
    try {
      setLoading(true);
      const data = await api.getServices({ companyId });
      setServices(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load services";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  function handleAdd() {
    setEditingService(null);
    setIsModalOpen(true);
  }

  function handleEdit(service: ServiceRecord) {
    setEditingService(service);
    setIsModalOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this service?")) {
      return;
    }

    try {
      await api.deleteService(id);
      toast.success("Service deleted");
      if (user?.id) {
        await loadServices(user.id);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete service";
      toast.error(message);
    }
  }

  async function handleSave(service: ServiceFormValues) {
    try {
      const payload = {
        name: service.name,
        category: service.category,
        description: service.description,
        priceFrom: service.priceFrom,
        priceTo: service.priceTo,
        city: service.city,
        rating: service.rating,
        licensed: service.licensed,
        availabilityDays: service.availabilityDays,
        urgency: service.urgency,
        tags: service.tags,
        customAttributes: service.customAttributes,
        active: service.active,
        imageUrl: service.imageUrl,
      };

      if (service.id) {
        await api.updateService(service.id, payload);
        toast.success("Service updated");
      } else {
        await api.createService(payload);
        toast.success("Service created");
      }

      setIsModalOpen(false);
      setEditingService(null);
      if (user?.id) {
        await loadServices(user.id);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save service";
      toast.error(message);
    }
  }

  if (loading) {
    return <div className="py-12 text-center">Loading services...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Services</h2>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Add service
        </Button>
      </div>

      {services.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="mb-4 text-muted-foreground">No services yet.</p>
            <Button variant="outline" onClick={handleAdd}>
              Add your first service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {SERVICE_CATEGORY_LABELS[service.category]}
                    </p>
                  </div>
                  <Badge variant={service.active ? "default" : "secondary"}>
                    {service.active ? (
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                    ) : (
                      <XCircle className="mr-1 h-3 w-3" />
                    )}
                    {service.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {service.images[0] ? (
                  <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-md">
                    <img
                      src={service.images[0].url}
                      alt={service.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : null}

                <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                  {service.description}
                </p>

                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-semibold">
                    {service.priceFrom.toLocaleString()} - {service.priceTo.toLocaleString()} KZT
                  </span>
                </div>

                <div className="mb-4 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Requests</span>
                  <span className="font-semibold">{service._count?.requests ?? 0}</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(service)}
                  >
                    <Edit className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(service.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ServiceEditModal
        service={editingService}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSave}
      />
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { ServiceEditModal } from "./ServiceEditModal";
import { CompanyService, ServiceCategory } from "@/lib/types";
import { api } from "@/lib/api";
import { toast } from "sonner";
import Image from "next/image";

export function ServicesManagement() {
  const [services, setServices] = useState<CompanyService[]>([]);
  const [editingService, setEditingService] = useState<CompanyService | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await api.getServices();
      interface ApiService {
        id: string;
        name: string;
        category: string;
        description: string;
        priceFrom: number;
        priceTo: number;
        active: boolean;
        city?: string;
        rating?: number;
        licensed?: boolean;
        availabilityDays?: number;
        urgency?: string;
        tags?: string[];
        customAttributes?: Record<string, string>;
        images?: Array<{ url: string }>;
      }
      const transformed = data.map((s: ApiService) => ({
        id: s.id,
        name: s.name,
        category: s.category.toLowerCase() as ServiceCategory,
        description: s.description,
        priceFrom: s.priceFrom,
        priceTo: s.priceTo,
        active: s.active,
        city: s.city,
        rating: s.rating,
        licensed: s.licensed,
        availabilityDays: s.availabilityDays,
        urgency: s.urgency?.toLowerCase() as "low" | "medium" | "high" | undefined,
        tags: s.tags || [],
        customAttributes: s.customAttributes || {},
        images: s.images?.map((img) => img.url) || [],
      }));
      setServices(transformed);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ошибка загрузки услуг";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  const handleEdit = (service: CompanyService) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить услугу?")) {
      return;
    }
    try {
      await api.deleteService(id);
      toast.success("Услуга удалена");
      loadServices();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ошибка удаления услуги";
      toast.error(message);
    }
  };

  const handleSave = async (service: CompanyService) => {
    try {
      if (editingService) {
        await api.updateService(service.id, {
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
        });
        toast.success("Услуга сохранена");
      } else {
        await api.createService({
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
        });
        toast.success("Услуга добавлена");
      }
      setIsModalOpen(false);
      setEditingService(null);
      loadServices();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ошибка сохранения услуги";
      toast.error(message);
    }
  };

  const getCategoryLabel = (category: ServiceCategory) => {
    const labels: Record<ServiceCategory, string> = {
      "real-estate": "Недвижимость",
      automobiles: "Авто",
      other: "Другое",
    };
    return labels[category];
  };

  if (loading) {
    return <div className="text-center py-12">Загрузка...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Услуги</h2>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Добавить услугу
        </Button>
      </div>

      {services.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">У вас пока нет услуг</p>
            <Button onClick={handleAdd} variant="outline">
              Добавить первую услугу
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {getCategoryLabel(service.category)}
                    </CardDescription>
                  </div>
                  <Badge variant={service.active ? "default" : "secondary"}>
                    {service.active ? (
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1" />
                    )}
                    {service.active ? "Активна" : "Неактивна"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {service.images && service.images.length > 0 && (
                  <div className="relative aspect-video w-full mb-4 rounded-md overflow-hidden">
                    <Image
                      src={service.images[0]}
                      alt={service.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {service.description}
                </p>
                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="text-muted-foreground">Цена:</span>
                  <span className="font-semibold">
                    {service.priceFrom.toLocaleString()} - {service.priceTo.toLocaleString()} ₸
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(service)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Редактировать
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(service.id)}
                  >
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

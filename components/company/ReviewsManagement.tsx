"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "lucide-react";
import { Review } from "@/lib/types";
import { Stars } from "@/components/Stars";

// Mock data - replace with API calls
const mockReviews: Review[] = [
  {
    id: "1",
    clientName: "Иван Петров",
    rating: 5,
    comment: "Отличная работа! Все сделано качественно и в срок. Рекомендую!",
    serviceId: "1",
    serviceName: "Ремонт под ключ",
    createdAt: "2024-01-12T18:00:00Z",
  },
  {
    id: "2",
    clientName: "Мария Сидорова",
    rating: 4,
    comment: "Хороший сервис, но можно было бы быстрее. В целом довольна.",
    serviceId: "2",
    serviceName: "ТО автомобилей",
    createdAt: "2024-01-10T14:30:00Z",
  },
  {
    id: "3",
    clientName: "Алексей Козлов",
    rating: 5,
    comment: "Профессионалы своего дела. Все на высшем уровне!",
    serviceId: "1",
    serviceName: "Ремонт под ключ",
    createdAt: "2024-01-08T10:00:00Z",
  },
  {
    id: "4",
    clientName: "Елена Смирнова",
    rating: 3,
    comment: "Неплохо, но есть что улучшить. Цена завышена.",
    serviceId: "2",
    serviceName: "ТО автомобилей",
    createdAt: "2024-01-05T16:20:00Z",
  },
];

export function ReviewsManagement() {
  const [reviews] = useState<Review[]>(mockReviews);
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");

  const services = Array.from(new Set(reviews.map((r) => r.serviceId)));
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const filteredReviews = reviews.filter((review) => {
    if (ratingFilter !== "all" && review.rating !== parseInt(ratingFilter)) {
      return false;
    }
    if (serviceFilter !== "all" && review.serviceId !== serviceFilter) {
      return false;
    }
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 3.5) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Отзывы и рейтинги</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Средний рейтинг:{" "}
            <span className={`font-semibold ${getRatingColor(averageRating)}`}>
              {averageRating.toFixed(1)}
            </span>{" "}
            из {reviews.length} отзывов
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Фильтр по рейтингу" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все рейтинги</SelectItem>
              <SelectItem value="5">5 звезд</SelectItem>
              <SelectItem value="4">4 звезды</SelectItem>
              <SelectItem value="3">3 звезды</SelectItem>
              <SelectItem value="2">2 звезды</SelectItem>
              <SelectItem value="1">1 звезда</SelectItem>
            </SelectContent>
          </Select>
          <Select value={serviceFilter} onValueChange={setServiceFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Фильтр по услуге" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все услуги</SelectItem>
              {services.map((serviceId) => {
                const service = reviews.find((r) => r.serviceId === serviceId);
                return (
                  <SelectItem key={serviceId} value={serviceId}>
                    {service?.serviceName}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredReviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Нет отзывов с выбранными фильтрами</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-lg">{review.clientName}</CardTitle>
                    </div>
                    <CardDescription>{review.serviceName}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Stars value={review.rating} />
                    <Badge variant="outline" className="ml-2">
                      {review.rating}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">{review.comment}</p>
                <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Всего отзывов</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviews.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Средний рейтинг</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getRatingColor(averageRating)}`}>
              {averageRating.toFixed(1)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>5 звезд</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reviews.filter((r) => r.rating === 5).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Негативных</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reviews.filter((r) => r.rating <= 2).length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


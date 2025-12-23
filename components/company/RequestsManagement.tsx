"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Clock, CheckCircle2, User, Phone, Mail } from "lucide-react";
import { ClientRequest, RequestStatus } from "@/lib/types";
import { RequestResponseModal } from "./RequestResponseModal";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useLang } from "@/components/nav/LangSwitcher";
import { t } from "@/lib/translations";

export function RequestsManagement() {
  const { lang } = useLang();
  const tr = t(lang);
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ClientRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  interface ApiRequest {
    id: string;
    client: { name?: string; email: string; phone?: string };
    service: { name: string };
    serviceId: string;
    message: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  }

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = (await api.getRequests(
        statusFilter !== "all" ? { status: statusFilter } : undefined
      )) as ApiRequest[];
      // Transform API response
      const transformed = data.map((r) => ({
        id: r.id,
        clientName: r.client.name || r.client.email,
        clientEmail: r.client.email,
        clientPhone: r.client.phone || "",
        serviceId: r.serviceId,
        serviceName: r.service.name,
        message: r.message,
        status: r.status.toLowerCase() as RequestStatus,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }));
      setRequests(transformed);
    } catch (error) {
      const message = error instanceof Error ? error.message : tr.common.error;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (requestId: string, newStatus: RequestStatus) => {
    try {
      await api.updateRequest(requestId, { status: newStatus });
      toast.success(
        lang === "kaz"
          ? "Күй өзгертілді"
          : "Статус обновлен"
      );
      loadRequests();
    } catch (error) {
      const message = error instanceof Error ? error.message : tr.common.error;
      toast.error(message);
    }
  };

  const handleRespond = (request: ClientRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const filteredRequests = requests.filter(
    (r) => statusFilter === "all" || r.status === statusFilter
  );

  const getStatusBadge = (status: RequestStatus) => {
    const variants: Record<RequestStatus, { label: { ru: string; kaz: string }; variant: "default" | "secondary" | "outline" }> = {
      new: { label: { ru: "Новая", kaz: "Жаңа" }, variant: "default" },
      in_progress: { label: { ru: "В работе", kaz: "Жұмыс істеуде" }, variant: "secondary" },
      completed: { label: { ru: "Завершена", kaz: "Аяқталды" }, variant: "outline" },
    };
    const config = variants[status];
    return (
      <Badge
        variant={config.variant}
        className={status === "completed" ? "bg-green-600 text-white hover:bg-green-700 border-green-600" : ""}
      >
        {status === "new" && <Clock className="h-3 w-3 mr-1" />}
        {status === "in_progress" && <MessageSquare className="h-3 w-3 mr-1" />}
        {status === "completed" && <CheckCircle2 className="h-3 w-3 mr-1" />}
        {config.label[lang]}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === "kaz" ? "kk-KZ" : "ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <div className="text-center py-12">{tr.common.loading}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{tr.requests.title}</h2>
        <Select
          value={statusFilter}
          onValueChange={(value: RequestStatus | "all") => setStatusFilter(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={tr.requests.filterByStatus} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tr.common.all}</SelectItem>
            <SelectItem value="new">{tr.requests.new}</SelectItem>
            <SelectItem value="in_progress">{tr.requests.inProgress}</SelectItem>
            <SelectItem value="completed">{tr.requests.completed}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {lang === "kaz"
                ? "Таңдалған күйде өтініштер жоқ"
                : "Нет заявок с выбранным статусом"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{request.serviceName}</CardTitle>
                    <CardDescription className="flex items-center gap-4 flex-wrap mt-2">
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {request.clientName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {request.clientEmail}
                      </span>
                      {request.clientPhone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {request.clientPhone}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{request.message}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <span>
                    {lang === "kaz" ? "Құрылған:" : "Создана:"} {formatDate(request.createdAt)}
                  </span>
                  {request.updatedAt !== request.createdAt && (
                    <span>
                      {lang === "kaz" ? "Жаңартылған:" : "Обновлена:"} {formatDate(request.updatedAt)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Select
                    value={request.status}
                    onValueChange={(value: RequestStatus) => handleStatusChange(request.id, value)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">{tr.requests.new}</SelectItem>
                      <SelectItem value="in_progress">{tr.requests.inProgress}</SelectItem>
                      <SelectItem value="completed">{tr.requests.completed}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={() => handleRespond(request)}>
                    <MessageSquare className="h-4 w-4 mr-1" />
                    {tr.requests.respond}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <RequestResponseModal
        request={selectedRequest}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}

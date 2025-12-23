"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ClientRequest } from "@/lib/types";
import { User, Phone, Mail } from "lucide-react";

interface RequestResponseModalProps {
  request: ClientRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RequestResponseModal({
  request,
  open,
  onOpenChange,
}: RequestResponseModalProps) {
  const [response, setResponse] = useState("");

  useEffect(() => {
    if (open) {
      setResponse("");
    }
  }, [open]);

  const handleSubmit = () => {
    if (!response.trim() || !request) return;
    // Here you would send the response to the backend
    console.log("Sending response:", response, "to request:", request.id);
    // For now, just close the modal
    onOpenChange(false);
  };

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ответить на заявку</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Услуга</Label>
            <p className="text-sm font-medium">{request.serviceName}</p>
          </div>

          <div className="space-y-2">
            <Label>Клиент</Label>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{request.clientName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{request.clientEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{request.clientPhone}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Сообщение клиента</Label>
            <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
              {request.message}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="response">Ваш ответ</Label>
            <Textarea
              id="response"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Напишите ответ клиенту..."
              rows={5}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button onClick={handleSubmit} disabled={!response.trim()}>
              Отправить ответ
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}



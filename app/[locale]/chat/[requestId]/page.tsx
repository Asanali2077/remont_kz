"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { ArrowLeft, Send, Loader2, Phone, Mail, Paperclip } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MessageRecord, RequestRecord } from "@/lib/types";
import { toast } from "sonner";

export default function ChatPage() {
  const t = useTranslations("chat");
  const { requestId } = useParams<{ requestId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [request, setRequest] = useState<RequestRecord | null>(null);
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const { messages: msgs } = await api.getMessages({ requestId });
      setMessages([...msgs].reverse());
    } catch {/* silent */}
  }, [requestId]);

  useEffect(() => {
    void (async () => {
      try {
        const [req] = await Promise.all([api.getRequest(requestId), fetchMessages()]);
        setRequest(req);
        await api.markMessagesRead(requestId).catch(() => null);
      } catch {
        toast.error("Chat not found or no access");
        router.push("/my-requests");
      } finally {
        setLoading(false);
      }
    })();
  }, [requestId, router, fetchMessages]);

  /* SSE — real-time messages (replaces polling) */
  useEffect(() => {
    const token = typeof window !== "undefined"
      ? (() => { try { return JSON.parse(localStorage.getItem("session:user") ?? "{}").token ?? ""; } catch { return ""; } })()
      : "";

    const es = new EventSource(`/api/chat/${requestId}/stream?token=${token}`);

    es.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data) as { type: string; data?: unknown[] };
        if (payload.type === "messages" && Array.isArray(payload.data)) {
          setMessages((prev) => {
            const incoming = payload.data as typeof prev;
            const existingIds = new Set(prev.map((m) => m.id));
            const newMsgs = incoming.filter((m) => !existingIds.has(m.id));
            return newMsgs.length > 0 ? [...prev, ...newMsgs] : prev;
          });
        }
      } catch { /* parse error */ }
    };

    es.onerror = () => {
      es.close();
      // Fallback to polling on SSE failure
      const id = setInterval(() => void fetchMessages(), 5000);
      return () => clearInterval(id);
    };

    return () => es.close();
  }, [requestId, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || !request || !user || sending) return;
    const receiverId = user.id === request.clientId ? request.companyId : request.clientId;
    if (!receiverId) { toast.error("Cannot determine recipient"); return; }

    setSending(true);
    const text = input.trim();
    setInput("");
    try {
      await api.sendMessage({ requestId, receiverId, content: text });
      await fetchMessages();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send");
      setInput(text);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !request || !user) return;
    const receiverId = user.id === request.clientId ? request.companyId : request.clientId;
    if (!receiverId) { toast.error("Cannot determine recipient"); return; }

    setUploadingFile(true);
    try {
      const isImage = file.type.startsWith("image/");
      const { url } = await api.uploadMessageFile(file, isImage ? "image" : "audio");
      await api.sendMessage({
        requestId,
        receiverId,
        content: isImage ? "📎 Photo" : "📎 Audio",
        type: isImage ? "image" : "audio",
        ...(isImage ? { imageUrl: url } : { audioUrl: url }),
      });
      await fetchMessages();
    } catch {
      toast.error("Failed to send file");
    } finally {
      setUploadingFile(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const isClient = user?.id === request?.clientId;
  const otherParty = isClient ? request?.company : request?.client;
  const requestTitle = request?.service?.name ?? "Custom request";

  const otherInitial = (otherParty?.name ?? otherParty?.email ?? "?")[0].toUpperCase();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-56px)] bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-muted/30">

      {/* Header */}
      <div className="bg-card border-b border-border/50 shadow-sm">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 rounded-xl" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-sm font-bold text-primary shrink-0">
            {otherInitial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm leading-tight truncate">
              {otherParty?.name ?? otherParty?.email ?? "Chat"}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">{requestTitle}</p>
          </div>
          <div className="flex items-center gap-1">
            {otherParty?.phone && (
              <a href={`tel:${otherParty.phone}`}>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl"><Phone className="h-4 w-4" /></Button>
              </a>
            )}
            {otherParty?.email && (
              <a href={`mailto:${otherParty.email}`}>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl"><Mail className="h-4 w-4" /></Button>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-6 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mx-auto mb-3">
                <span className="text-2xl font-bold text-muted-foreground">{otherInitial}</span>
              </div>
              <p className="text-sm font-medium">{otherParty?.name ?? otherParty?.email}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("noChatsDesc")}</p>
            </div>
          )}

          {messages.map((msg) => {
            const isMe = msg.senderId === user?.id;
            return (
              <div key={msg.id} className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
                {!isMe && (
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-[11px] font-bold text-primary shrink-0 mb-0.5">
                    {otherInitial}
                  </div>
                )}
                <div className="max-w-[68%]">
                  <div className={`rounded-2xl px-4 py-2.5 ${
                    isMe
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-card border border-border/50 rounded-bl-md"
                  }`}>
                    {/* Image message */}
                    {msg.type === "image" && msg.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={msg.imageUrl} alt="Sent photo" className="max-w-full rounded-xl max-h-64 object-cover" />
                    ) : msg.type === "audio" && msg.audioUrl ? (
                      <audio controls src={msg.audioUrl} className="max-w-full" />
                    ) : (
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    )}
                  </div>
                  <div className={`flex items-center gap-1.5 mt-1 ${isMe ? "justify-end" : ""}`}>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    {/* Read indicator */}
                    {isMe && (
                      <div className={`w-2 h-2 rounded-full ${msg.read ? "bg-primary" : "bg-muted-foreground/40"}`} title={msg.read ? "Read" : "Sent"} />
                    )}
                    {/* Unread dot for received messages */}
                    {!isMe && !msg.read && (
                      <div className="w-2 h-2 rounded-full bg-primary" title="New" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input bar */}
      <div className="bg-card border-t border-border/50">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <div className="flex items-center gap-2 bg-muted/50 rounded-2xl border border-border/50 px-3 py-2">
            <Button
              variant="ghost" size="icon"
              className="shrink-0 h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground"
              onClick={() => fileRef.current?.click()}
              disabled={uploadingFile || sending}
              title="Attach file"
            >
              {uploadingFile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
            </Button>
            <input ref={fileRef} type="file" accept="image/*,audio/*" className="hidden" onChange={(e) => void handleFileUpload(e)} />

            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void sendMessage(); } }}
              placeholder={t("messagePlaceholder")}
              disabled={sending || uploadingFile}
              className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 px-0 text-sm"
            />
            <Button
              onClick={() => void sendMessage()}
              disabled={!input.trim() || sending}
              size="icon"
              className="shrink-0 h-8 w-8 rounded-xl"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

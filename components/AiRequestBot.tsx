"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, Loader2 } from "lucide-react";
import { api, type CreateRequestPayload } from "@/lib/api";
import { toast } from "sonner";
import type { ServiceCategory } from "@/lib/types";

interface ChatMessage {
  role: "user" | "assistant" | "error";
  content: string;
}

const WELCOME = "Hi! I'll help you create a service request. What do you need done?";

const CATEGORY_LABELS: Record<string, string> = {
  automobiles: "Automobiles",
  "real-estate": "Real Estate",
  other: "Other",
};

export function AiRequestBot({ onCreated }: { onCreated?: () => void }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", content: WELCOME }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [collectedData, setCollectedData] = useState<Partial<CreateRequestPayload>>({});
  const [preview, setPreview] = useState<CreateRequestPayload | null>(null);
  const [creating, setCreating] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* Auto-scroll to latest message */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  function resetChat() {
    setMessages([{ role: "assistant", content: WELCOME }]);
    setCollectedData({});
    setPreview(null);
    setInput("");
  }

  async function sendMessage() {
    if (!input.trim() || isLoading) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      /* Only pass role: "user" | "assistant" messages to the API */
      const apiMessages = newMessages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

      const result = await api.sendAiBotMessage(apiMessages, collectedData);
      setMessages((prev) => [...prev, { role: "assistant", content: result.message }]);

      if (result.done && result.data) {
        setPreview(result.data as CreateRequestPayload);
        setCollectedData(result.data as CreateRequestPayload);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setMessages((prev) => [...prev, { role: "error", content: msg }]);
    } finally {
      setIsLoading(false);
    }
  }

  async function createRequest() {
    if (!preview) return;
    setCreating(true);
    try {
      await api.createRequest({
        description: preview.description,
        category: preview.category as ServiceCategory,
        city: preview.city,
        budgetFrom: preview.budgetFrom,
        budgetTo: preview.budgetTo,
      });
      toast.success("Request created!");
      setOpen(false);
      resetChat();
      onCreated?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create request");
    } finally {
      setCreating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetChat(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Bot className="h-4 w-4" /> AI Assistant
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" /> AI Request Assistant
          </DialogTitle>
        </DialogHeader>

        {preview ? (
          /* Preview & confirm */
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-xl space-y-2 text-sm border">
              <p className="font-semibold text-base mb-3">Your request summary:</p>
              <div className="grid gap-2">
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-24 shrink-0">Description:</span>
                  <span>{preview.description}</span>
                </div>
                {preview.category && (
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-24 shrink-0">Category:</span>
                    <span>{CATEGORY_LABELS[preview.category] ?? preview.category}</span>
                  </div>
                )}
                {preview.city && (
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-24 shrink-0">City:</span>
                    <span>{preview.city}</span>
                  </div>
                )}
                {(preview.budgetFrom ?? preview.budgetTo) && (
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-24 shrink-0">Budget:</span>
                    <span>{preview.budgetFrom?.toLocaleString() ?? "?"} – {preview.budgetTo?.toLocaleString() ?? "?"} ₸</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPreview(null)} className="flex-1">Edit</Button>
              <Button onClick={() => void createRequest()} disabled={creating} className="flex-1">
                {creating ? "Creating..." : "Confirm & Submit"}
              </Button>
            </div>
          </div>
        ) : (
          /* Chat */
          <>
            <div className="flex flex-col gap-2.5 h-72 overflow-y-auto p-3 border rounded-xl bg-muted/10">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "error" ? (
                    <div className="max-w-[80%] rounded-xl px-3 py-2 text-sm bg-destructive/10 text-destructive border border-destructive/20">
                      ⚠ {m.content}
                    </div>
                  ) : (
                    <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}>
                      {m.content}
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-xl px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" /> Thinking…
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage();
                  }
                }}
                placeholder="Type your message…"
                disabled={isLoading}
                className="flex-1"
              />
              <Button onClick={() => void sendMessage()} disabled={isLoading || !input.trim()} size="icon">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

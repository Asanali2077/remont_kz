"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { MessageSquare, Loader2, ArrowRight, Circle } from "lucide-react";
import { Footer } from "@/components/Footer";
import { timeAgo } from "@/lib/utils";

interface ChatItem {
  requestId: string;
  status: string;
  service: { id: string; name: string } | null;
  otherParty: { id: string; name?: string | null; email: string } | null;
  lastMessage: { content: string; createdAt: string; senderId: string } | null;
  unreadCount: number;
}


export default function ChatInboxPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (!authLoading && !user) router.push("/"); }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      try {
        const data = await api.getChatInbox();
        setChats(data as ChatItem[]);
      } catch { toast.error("Failed to load chats"); }
      finally { setLoading(false); }
    })();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Messages</h1>
            {chats.length > 0 && <p className="text-xs text-muted-foreground">{chats.length} conversations</p>}
          </div>
        </div>

        {chats.length === 0 ? (
          <div className="bg-card border border-border/50 rounded-2xl py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mx-auto mb-4">
              <MessageSquare className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium">No conversations yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Conversations appear once a company accepts your request
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
            {chats.map((chat, i) => {
              const name = chat.otherParty?.name ?? chat.otherParty?.email ?? "Unknown";
              const title = chat.service?.name ?? "Custom request";
              const preview = chat.lastMessage?.content ?? "No messages yet";
              const time = chat.lastMessage?.createdAt ? timeAgo(chat.lastMessage.createdAt) : "";
              const hasUnread = chat.unreadCount > 0;
              const initial = name[0].toUpperCase();

              return (
                <Link
                  key={chat.requestId}
                  href={`/chat/${chat.requestId}`}
                  className={`flex items-center gap-4 px-5 py-4 hover:bg-muted/50 transition-colors ${i !== chats.length - 1 ? "border-b border-border/40" : ""}`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-sm font-bold text-primary">
                      {initial}
                    </div>
                    {hasUnread && (
                      <Circle className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 fill-primary text-primary" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className={`text-sm truncate ${hasUnread ? "font-semibold" : "font-medium"}`}>{name}</p>
                      <span className="text-[11px] text-muted-foreground shrink-0">{time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mb-0.5">{title}</p>
                    <p className={`text-xs truncate ${hasUnread ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                      {preview}
                    </p>
                  </div>

                  {/* Badge + arrow */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {hasUnread && (
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                        {chat.unreadCount > 9 ? "9+" : chat.unreadCount}
                      </span>
                    )}
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

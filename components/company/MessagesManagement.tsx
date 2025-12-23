"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Mail, Image as ImageIcon, Mic, Play, Pause } from "lucide-react";
import { Message, MessageType } from "@/lib/types";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useLang } from "@/components/nav/LangSwitcher";
import { t } from "@/lib/translations";
import Image from "next/image";
import { useAuth } from "@/components/auth/AuthProvider";

export function MessagesManagement() {
  const { lang } = useLang();
  const tr = t(lang);
  const { user } = useAuth();
  const [conversations, setConversations] = useState<
    Record<
      string,
      {
        clientName: string;
        clientEmail: string;
        clientId: string;
        messages: Message[];
        unreadCount: number;
        lastMessage: Message;
      }
    >
  >({});
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    loadMessages();
    // Refresh messages every 30 seconds
    const interval = setInterval(loadMessages, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await api.getMessages({ limit: 100 });
      const allMessages = (response.messages || []) as ApiMessage[];

      // Transform API response
      interface ApiMessage {
        id: string;
        requestId?: string;
        senderId: string;
        sender: { role: string; name?: string; email: string };
        receiver: { name?: string; email: string };
        content: string;
        type: string;
        imageUrl?: string;
        audioUrl?: string;
        createdAt: string;
        read: boolean;
      }
      const transformed: Message[] = allMessages.map((msg: ApiMessage) => ({
        id: msg.id,
        requestId: msg.requestId,
        clientName: msg.sender.role === "CLIENT" ? msg.sender.name || msg.sender.email : msg.receiver.name || msg.receiver.email,
        clientEmail: msg.sender.role === "CLIENT" ? msg.sender.email : msg.receiver.email,
        content: msg.content,
        type: msg.type.toLowerCase() as MessageType,
        imageUrl: msg.imageUrl,
        audioUrl: msg.audioUrl,
        isFromCompany: msg.senderId === user?.id,
        createdAt: msg.createdAt,
        read: msg.read,
      }));

      // Group by conversation
      const grouped: typeof conversations = {};
      transformed.forEach((msg) => {
        const key = msg.requestId || msg.clientEmail;
        if (!grouped[key]) {
          grouped[key] = {
            clientName: msg.clientName,
            clientEmail: msg.clientEmail,
            clientId: msg.isFromCompany ? "" : msg.clientEmail,
            messages: [],
            unreadCount: 0,
            lastMessage: msg,
          };
        }
        grouped[key].messages.push(msg);
        if (!msg.read && !msg.isFromCompany) {
          grouped[key].unreadCount++;
        }
        if (new Date(msg.createdAt) > new Date(grouped[key].lastMessage.createdAt)) {
          grouped[key].lastMessage = msg;
        }
      });

      setConversations(grouped);
      if (!selectedConversation && Object.keys(grouped).length > 0) {
        setSelectedConversation(Object.keys(grouped)[0]);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : tr.common.error;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const currentConversation = selectedConversation
    ? conversations[selectedConversation]?.messages || []
    : [];

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const conversation = conversations[selectedConversation];
    if (!conversation) return;

    try {
      await api.sendMessage({
        receiverId: conversation.clientId,
        content: newMessage,
        type: "text",
        requestId: selectedConversation.startsWith("req-") ? selectedConversation : undefined,
      });
      setNewMessage("");
      loadMessages();
    } catch (error) {
      const message = error instanceof Error ? error.message : tr.common.error;
      toast.error(message);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !selectedConversation) return;

    const file = files[0];
    if (file && file.type.startsWith("image/")) {
      try {
        const uploadResult = await api.uploadMessageFile(file, "image");
        const conversation = conversations[selectedConversation!];
        if (conversation) {
          await api.sendMessage({
            receiverId: conversation.clientId,
            content: lang === "kaz" ? "Сурет" : "Изображение",
            type: "image",
            imageUrl: uploadResult.url,
            requestId: selectedConversation!.startsWith("req-") ? selectedConversation! : undefined,
          });
          loadMessages();
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : tr.common.error;
        toast.error(message);
      }
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !selectedConversation) return;

    const file = files[0];
    if (file && file.type.startsWith("audio/")) {
      try {
        const uploadResult = await api.uploadMessageFile(file, "audio");
        const conversation = conversations[selectedConversation!];
        if (conversation) {
          await api.sendMessage({
            receiverId: conversation.clientId,
            content: lang === "kaz" ? "Дауыстық хабарлама" : "Голосовое сообщение",
            type: "audio",
            audioUrl: uploadResult.url,
            requestId: selectedConversation!.startsWith("req-") ? selectedConversation! : undefined,
          });
          loadMessages();
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : tr.common.error;
        toast.error(message);
      }
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    // In a real app, use MediaRecorder API
    setTimeout(() => {
      setIsRecording(false);
      toast.info(lang === "kaz" ? "Жазба аяқталды" : "Запись завершена");
    }, 2000);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  const handlePlayAudio = (messageId: string, audioUrl: string) => {
    if (playingAudio === messageId) {
      const audio = audioRefs.current[messageId];
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      setPlayingAudio(null);
    } else {
      if (playingAudio) {
        const prevAudio = audioRefs.current[playingAudio];
        if (prevAudio) {
          prevAudio.pause();
          prevAudio.currentTime = 0;
        }
      }
      const audio = new Audio(audioUrl);
      audioRefs.current[messageId] = audio;
      audio.play();
      setPlayingAudio(messageId);
      audio.onended = () => {
        setPlayingAudio(null);
      };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString(lang === "kaz" ? "kk-KZ" : "ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (days === 1) {
      return lang === "kaz" ? "Кеше" : "Вчера";
    } else if (days < 7) {
      return lang === "kaz" ? `${days} күн бұрын` : `${days} дн. назад`;
    } else {
      return date.toLocaleDateString(lang === "kaz" ? "kk-KZ" : "ru-RU", {
        day: "numeric",
        month: "short",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-12">{tr.common.loading}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">{tr.messages.title}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Conversations list */}
        <div className="lg:col-span-1 space-y-2">
          <div className="text-sm font-medium mb-2">{tr.messages.conversations}</div>
          {Object.entries(conversations).map(([key, conv]) => (
            <Card
              key={key}
              className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                selectedConversation === key ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedConversation(key)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <CardTitle className="text-sm font-semibold">{conv.clientName}</CardTitle>
                    <CardDescription className="text-xs flex items-center gap-1 mt-1">
                      <Mail className="h-3 w-3" />
                      {conv.clientEmail}
                    </CardDescription>
                  </div>
                  {conv.unreadCount > 0 && (
                    <Badge variant="default" className="ml-2">
                      {conv.unreadCount}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {conv.lastMessage.type === "image" && "📷"}
                  {conv.lastMessage.type === "audio" && "🎤"}
                  {conv.lastMessage.type === "text" && conv.lastMessage.content}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(conv.lastMessage.createdAt)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Messages */}
        <div className="lg:col-span-2">
          {selectedConversation ? (
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <CardTitle className="text-lg">
                  {conversations[selectedConversation]?.clientName}
                </CardTitle>
                <CardDescription>
                  {conversations[selectedConversation]?.clientEmail}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentConversation.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isFromCompany ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.isFromCompany
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {msg.type === "text" && (
                        <>
                          <p className="text-sm">{msg.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              msg.isFromCompany
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            {formatDate(msg.createdAt)}
                          </p>
                        </>
                      )}
                      {msg.type === "image" && msg.imageUrl && (
                        <>
                          <div className="relative w-full h-48 rounded-md overflow-hidden mb-2">
                            <Image
                              src={msg.imageUrl}
                              alt="Message image"
                              fill
                              className="object-cover"
                            />
                          </div>
                          <p
                            className={`text-xs ${
                              msg.isFromCompany
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            {formatDate(msg.createdAt)}
                          </p>
                        </>
                      )}
                      {msg.type === "audio" && msg.audioUrl && (
                        <>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePlayAudio(msg.id, msg.audioUrl!)}
                              className={msg.isFromCompany ? "text-primary-foreground" : ""}
                            >
                              {playingAudio === msg.id ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                            <span className="text-xs">
                              {lang === "kaz" ? "Дауыстық хабарлама" : "Голосовое сообщение"}
                            </span>
                          </div>
                          <p
                            className={`text-xs mt-1 ${
                              msg.isFromCompany
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            {formatDate(msg.createdAt)}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
              <div className="border-t p-4">
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={tr.messages.typeMessage}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    title={tr.messages.uploadImage}
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => audioInputRef.current?.click()}
                    title={tr.messages.uploadAudio}
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                    className={isRecording ? "bg-red-500 text-white" : ""}
                    title={tr.messages.recordAudio}
                  >
                    {isRecording ? <Pause className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="h-[600px] flex items-center justify-center">
              <CardContent className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {lang === "kaz"
                    ? "Хабарламаларды көру үшін диалогты таңдаңыз"
                    : "Выберите диалог для просмотра сообщений"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

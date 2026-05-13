import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateRequest } from "@/lib/middleware";
import { typingStore } from "@/app/api/chat/[requestId]/typing/route";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  const auth = await authenticateRequest(request);
  if ("error" in auth) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { requestId } = params;
  const userId = auth.user.userId;

  const req = await prisma.request.findFirst({
    where: {
      id: requestId,
      OR: [{ clientId: userId }, { companyId: userId }],
    },
  });

  if (!req) return new Response("Not found", { status: 404 });

  let lastCheckedAt = new Date();
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let closed = false;

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
        } catch { /* stream closed */ }
      };

      send({ type: "connected" });

      intervalId = setInterval(async () => {
        if (closed) return;
        try {
          const since = lastCheckedAt;
          lastCheckedAt = new Date();

          const messages = await prisma.message.findMany({
            where: {
              requestId,
              createdAt: { gt: since },
            },
            include: {
              sender: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: "asc" },
          });

          if (messages.length > 0) {
            send({ type: "messages", data: messages });

            await prisma.message.updateMany({
              where: { requestId, receiverId: userId, read: false },
              data: { read: true },
            });
          }

          // Typing indicator — broadcast who else is typing (excluding current user)
          const typingMap = typingStore.get(requestId);
          if (typingMap) {
            const now = Date.now();
            const typers: string[] = [];
            for (const [uid, expiresAt] of typingMap) {
              if (uid !== userId && expiresAt > now) {
                typers.push(uid);
              } else if (expiresAt <= now) {
                typingMap.delete(uid);
              }
            }
            send({ type: "typing", typers });
          }
        } catch { /* db error, skip tick */ }
      }, 3000);
    },
    cancel() {
      closed = true;
      if (intervalId) clearInterval(intervalId);
    },
  });

  request.signal.addEventListener("abort", () => {
    closed = true;
    if (intervalId) clearInterval(intervalId);
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

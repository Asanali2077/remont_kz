import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/middleware";
import { typingStore } from "@/lib/typing-store";

export async function POST(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  const auth = await authenticateRequest(request);
  if ("error" in auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { requestId } = params;
  const userId = auth.user.userId;

  if (!typingStore.has(requestId)) {
    typingStore.set(requestId, new Map());
  }
  typingStore.get(requestId)!.set(userId, Date.now() + 4000);

  return NextResponse.json({ ok: true });
}

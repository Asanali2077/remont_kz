import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/middleware";

// Module-level store: requestId → Map<userId, expiresAt>
// Typing state is ephemeral — cleared after 4 seconds of no update
export const typingStore = new Map<string, Map<string, number>>();

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

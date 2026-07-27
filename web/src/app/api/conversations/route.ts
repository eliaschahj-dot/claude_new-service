import { NextRequest, NextResponse } from "next/server";
import { upsertConversation, ChatTurn } from "@/lib/analytics";
import { auth } from "@/lib/auth";

// 상담 대화 저장(upsert) — 챗 화면이 교환이 끝날 때마다 전체 대화를 보낸다
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const visitorId = typeof body?.visitorId === "string" ? body.visitorId.slice(0, 64) : "";
  const messages: ChatTurn[] = Array.isArray(body?.messages)
    ? body.messages
        .filter((m: { role?: string; content?: string }) =>
          (m?.role === "user" || m?.role === "assistant") && typeof m?.content === "string")
        .slice(-80)
    : [];
  if (!visitorId || messages.length === 0) return NextResponse.json({ ok: false }, { status: 400 });

  const session = await auth().catch(() => null);
  const id = await upsertConversation({
    id: typeof body?.conversationId === "string" && /^[0-9a-f-]{36}$/.test(body.conversationId) ? body.conversationId : null,
    visitorId,
    userId: session?.user?.email ?? null,
    lang: typeof body?.lang === "string" ? body.lang.slice(0, 8) : null,
    messages,
  }).catch(() => null);
  return NextResponse.json({ id });
}

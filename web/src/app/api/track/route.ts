import { NextRequest, NextResponse } from "next/server";
import { recordVisit } from "@/lib/analytics";
import { auth } from "@/lib/auth";

// 방문 트래킹 — visitorId(클라이언트 생성 UUID) 기준 30분 세션 단위로 집계
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const visitorId = typeof body?.visitorId === "string" ? body.visitorId.slice(0, 64) : "";
  if (!visitorId) return NextResponse.json({ ok: false }, { status: 400 });
  const session = await auth().catch(() => null);
  await recordVisit({
    visitorId,
    userId: session?.user?.email ?? null,
    ua: req.headers.get("user-agent"),
    lang: typeof body?.lang === "string" ? body.lang.slice(0, 8) : null,
    heartbeat: body?.heartbeat === true,
  }).catch(() => null);
  return NextResponse.json({ ok: true });
}

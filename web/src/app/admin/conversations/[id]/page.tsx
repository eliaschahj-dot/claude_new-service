"use client";
// 관리자 상담 트랜스크립트 — 고객이 무엇을 묻고 어떻게 답했는지 전체 열람
import Link from "next/link";
import { use, useEffect, useState } from "react";
import type { ChatTurn, ConversationMeta } from "@/lib/analytics";
import { RiArrowLeftSLine } from "@remixicon/react";

type Conv = ConversationMeta & { messages: ChatTurn[] };

export default function AdminConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [conv, setConv] = useState<Conv | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/conversations/${id}`).then(async (r) => {
      if (r.status === 403) { setDenied(true); return; }
      if (r.ok) setConv(await r.json());
    }).catch(() => null);
  }, [id]);

  if (denied) return <main style={{ paddingTop: 40 }}><p className="card muted">관리자 전용 페이지입니다. <Link href="/login?next=/admin">로그인</Link></p></main>;
  if (!conv) return <main style={{ paddingTop: 40 }}><p className="card muted">불러오는 중…</p></main>;

  return (
    <>
      <header className="admin-header">
        <Link className="crumb" href="/admin"><RiArrowLeftSLine size={18} /> 대시보드</Link>
        <h1>상담 기록</h1>
        <span className="who">
          {conv.userId ?? `비회원 (${conv.visitorId?.slice(0, 8)})`} · {(conv.lang ?? "—").toUpperCase()} · {conv.msgCount}개 메시지 · {new Date(conv.updatedAt).toLocaleString("ko-KR")}
        </span>
      </header>
      <main>
        <div className="admin-card" style={{ maxWidth: 860 }}>
          <div className="transcript">
            {conv.messages.map((m, i) => (
              <div key={i} className={`tmsg ${m.role === "user" ? "u" : "a"}`}>{m.content}</div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

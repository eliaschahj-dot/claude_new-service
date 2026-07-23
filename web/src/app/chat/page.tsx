"use client";
// AI 챗봇 — 모든 대화(버튼 선택 포함)가 LLM(/api/chat)으로 흐른다.
// 버튼은 첫 턴의 목적 선택 UX일 뿐, 누르면 해당 문장을 사용자 발화로 보낸다.
// 질문-답변 문맥 유지·심층 인터뷰·요건 진단은 서버 시스템 프롬프트(lib/ai.ts)가 담당.
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Appbar, Tabbar } from "@/components/Chrome";
import { useI18n } from "@/lib/i18n";
import { VISAS, COMMON_DOCS, DB_UPDATED, L } from "@/lib/visa-db";

type Reply = { label: L; send: L };

const GREETING: L = {
  ko: "안녕하세요! 👋 K-Visa Assist AI 상담원입니다.\n비자 상담을 시작할게요. 한국에 오시는(계시는) 목적이 무엇인가요?\n아래에서 고르거나, 상황을 직접 입력해 주세요.",
  en: "Hello! 👋 I'm the K-Visa Assist AI consultant.\nLet's find your visa. What brings you to Korea?\nPick below, or just describe your situation.",
};

const START_REPLIES: Reply[] = [
  { label: { ko: "🎓 유학", en: "🎓 Study" }, send: { ko: "유학 비자를 알아보고 싶어요.", en: "I want to study in Korea — which visa do I need?" } },
  { label: { ko: "💼 취업 · 구직", en: "💼 Work" }, send: { ko: "한국에서 일하려고 하는데 어떤 비자가 필요한가요?", en: "I want to work in Korea — which visa do I need?" } },
  { label: { ko: "🔄 체류 연장", en: "🔄 Extend my stay" }, send: { ko: "지금 비자 체류기간을 연장하고 싶어요.", en: "I need to extend my current stay." } },
  { label: { ko: "💍 결혼 비자", en: "💍 Marriage visa" }, send: { ko: "한국인과 결혼해서 결혼 비자를 알아보고 있어요.", en: "I'm marrying a Korean citizen and looking into the marriage visa." } },
  { label: { ko: "🏠 영주권 (F-5)", en: "🏠 Permanent residency" }, send: { ko: "영주권(F-5)을 받고 싶어요.", en: "I want permanent residency (F-5)." } },
];

type Msg =
  | { kind: "bot" | "user"; text: L | string }
  | { kind: "reco"; code: string; appKey: string };

const ERR_MSG: L = {
  ko: "죄송해요, 지금 응답을 받지 못했어요. 잠시 후 다시 시도해 주세요. 급하시면 아래 버튼으로 담당자 상담을 연결해 드릴게요.",
  en: "Sorry, I couldn't get a response just now. Please try again in a moment, or use the buttons below to reach our team.",
};

export default function ChatPage() {
  const { ui, t, won, lang } = useI18n();
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [pendingReco, setPendingReco] = useState<[string, string] | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const render = (v: L | string) => (typeof v === "string" ? v : t(v));

  // 화면 메시지 → LLM 대화 이력 (API는 user 턴으로 시작해야 하므로 합성 첫 턴 삽입)
  function toTurns(list: Msg[]) {
    const turns: { role: "user" | "assistant"; content: string }[] = [
      { role: "user", content: "(The user opened the visa consultation chat.)" },
    ];
    for (const m of list) {
      if (m.kind === "reco") {
        turns.push({ role: "assistant", content: `[Recommended ${m.code} / ${m.appKey} via recommend_visa]` });
      } else {
        turns.push({ role: m.kind === "bot" ? "assistant" : "user", content: render(m.text) });
      }
    }
    return turns;
  }

  // 버튼 선택 = 해당 문장을 사용자 발화로 전송 (스크립트 분기 없음 — 문맥은 LLM이 유지)
  function pick(r: Reply) {
    setReplies([]);
    void sendMessage(t(r.send));
  }

  async function startApplication() {
    if (!pendingReco) return;
    // 신청(케이스 생성)은 로그인 필수 — 미로그인 시 구글 로그인으로 이동 후 복귀
    if (sessionStatus !== "authenticated") {
      router.push("/login?next=/chat");
      return;
    }
    const [visaCode, appKey] = pendingReco;
    const res = await fetch("/api/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visaCode, appKey, lang }),
    });
    if (res.status === 401) {
      router.push("/login?next=/chat");
      return;
    }
    const c = await res.json();
    localStorage.setItem("kva_case_id", c.id);
    router.push("/documents");
  }

  // 자유 입력 → Claude API (서버 라우트 /api/chat)
  function sendFree() {
    const v = text.trim();
    if (!v || loading) return;
    setText("");
    void sendMessage(v);
  }

  async function sendMessage(v: string) {
    if (loading) return;
    const withUser: Msg[] = [...msgs, { kind: "user", text: v }];
    setMsgs(withUser);
    setReplies([]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: toTurns(withUser), lang }),
      });
      if (!res.ok) throw new Error(`chat api ${res.status}`);
      const data: { reply: string; recommendation?: { visaCode: string; applicationKey: string } } = await res.json();
      setMsgs((m) => {
        const out = [...m];
        if (data.reply) out.push({ kind: "bot", text: data.reply });
        if (data.recommendation) {
          out.push({ kind: "reco", code: data.recommendation.visaCode, appKey: data.recommendation.applicationKey });
        }
        return out;
      });
      if (data.recommendation) {
        setPendingReco([data.recommendation.visaCode, data.recommendation.applicationKey]);
      }
    } catch {
      setMsgs((m) => [...m, { kind: "bot", text: ERR_MSG }]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setMsgs([{ kind: "bot", text: GREETING }]);
    setReplies(START_REPLIES);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, replies]);

  return (
    <>
      <Appbar titleKey="chatTitle" />
      <main className="chat-main">
        <p className="disclaimer">{ui("aiDisclaimer")}</p>
        {msgs.map((m, i) => {
          if (m.kind === "reco") {
            const visa = VISAS[m.code];
            const app = visa.applications[m.appKey];
            return (
              <div className="reco-card" key={i}>
                <span className="badge badge-blue">{ui("recoBadge")} · {t(app.label)}</span>
                <h3>{m.code} · {t(visa.name)}</h3>
                <p className="muted" style={{ marginBottom: 6 }}>{t(visa.summary)}</p>
                <p className="muted"><b>{ui("reqTitleKey")}</b></p>
                <ul>{app.requirements.map((r, j) => <li key={j}>{t(r)}</li>)}</ul>
                <div className="fee-box">
                  <div className="fee-row"><span>{ui("agencyFee")}</span><b>{won(app.agencyFee)}</b></div>
                  <div className="fee-row"><span>{ui("govFeeAtCost")}</span><b>{won(app.govFee)}</b></div>
                  <div className="fee-row total"><span>{ui("total")}</span><b>{won(app.agencyFee + app.govFee)}</b></div>
                  <div className="fee-row"><span>{ui("duration")}</span><b>{t(visa.processDays)}</b></div>
                </div>
                <p className="muted" style={{ fontSize: ".72rem", marginTop: 8 }}>
                  {ui("basis")} {DB_UPDATED} · {ui("basisNote")}
                </p>
              </div>
            );
          }
          return (
            <div className={m.kind === "user" ? "msg user" : "msg"} key={i}>
              {m.kind === "bot" && <span className="avatar">🤖</span>}
              <span className="bubble" style={{ whiteSpace: "pre-line" }}>{render(m.text)}</span>
            </div>
          );
        })}
        {pendingReco && (
          <div className="quick-replies">
            <button onClick={startApplication}>{ui("startBtn")}</button>
            <button onClick={() => {
              setPendingReco(null);
              void sendMessage(lang === "ko" ? "다른 비자 옵션도 검토해 주세요." : "Please look at other visa options for me.");
            }}>
              {ui("otherBtn")}
            </button>
          </div>
        )}
        {replies.length > 0 && !loading && (
          <div className="quick-replies">
            {replies.map((r, i) => <button key={i} onClick={() => pick(r)}>{t(r.label)}</button>)}
          </div>
        )}
        {loading && (
          <div className="msg">
            <span className="avatar">🤖</span>
            <span className="bubble typing">● ● ●</span>
          </div>
        )}
        <div ref={bottomRef} />
      </main>
      <div className="chat-input">
        <input value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendFree()}
          placeholder={ui("chatPlaceholder")} autoComplete="off" disabled={loading} />
        <button onClick={sendFree} aria-label="send" disabled={loading}>➤</button>
      </div>
      <Tabbar />
    </>
  );
}

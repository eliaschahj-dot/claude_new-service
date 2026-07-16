"use client";
// AI 챗봇 — 데모: 시나리오 분기 + 지식베이스 기반 추천·견적.
// 프로덕션에서는 LLM 슬롯 인테이크 + 룰엔진 판정 API로 대체 (docs/SERVICE_SPEC.md §4)
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Appbar, Tabbar } from "@/components/Chrome";
import { useI18n } from "@/lib/i18n";
import { VISAS, COMMON_DOCS, DB_UPDATED, L } from "@/lib/visa-db";

type Reply = { label: L; next?: string; href?: string };
type Step = { bot?: L; replies?: Reply[]; reco?: [string, string] };

const SCENARIO: Record<string, Step> = {
  start: {
    bot: { ko: "안녕하세요! 👋 K-Visa Assist AI 상담원입니다.\n비자 상담을 시작할게요. 한국에 오시는(계시는) 목적이 무엇인가요?",
           en: "Hello! 👋 I'm the K-Visa Assist AI consultant.\nLet's find your visa. What brings you to Korea?" },
    replies: [
      { label: { ko: "🎓 유학", en: "🎓 Study" }, next: "study" },
      { label: { ko: "💼 취업", en: "💼 Work" }, next: "work" },
      { label: { ko: "🔄 체류 연장", en: "🔄 Extend my stay" }, next: "extend" },
      { label: { ko: "💍 결혼/기타", en: "💍 Marriage / Other" }, next: "handoff" },
    ],
  },
  study: {
    bot: { ko: "유학을 준비 중이시군요! 어떤 과정으로 입학하시나요?",
           en: "Planning to study in Korea! Which program will you enroll in?" },
    replies: [
      { label: { ko: "대학교 학사/석사/박사", en: "University degree (BA/MA/PhD)" }, next: "studyD2" },
      { label: { ko: "어학연수", en: "Korean language course" }, next: "recoD4new" },
    ],
  },
  studyD2: {
    bot: { ko: "지금 한국에 계신가요, 해외에 계신가요?", en: "Are you currently in Korea or abroad?" },
    replies: [
      { label: { ko: "한국 (어학연수 D-4 중)", en: "In Korea (on D-4)" }, next: "recoD2change" },
      { label: { ko: "해외에서 신규 신청", en: "Abroad (new application)" }, next: "handoff" },
    ],
  },
  work: {
    bot: { ko: "취업 비자를 알아볼게요. 아래 중 어디에 해당하시나요?", en: "Let's look at work visas. Which describes you?" },
    replies: [
      { label: { ko: "취업 확정 (회사 있음)", en: "I have a job offer" }, next: "workDegree" },
      { label: { ko: "구직 활동 예정", en: "I'm looking for a job" }, next: "d10check" },
    ],
  },
  workDegree: {
    bot: { ko: "전문인력 취업은 보통 E-7(특정활동)에 해당합니다.\n다음 중 하나에 해당하시나요?\n· 석사 이상 학위\n· 학사 학위 + 관련 경력 1년\n· 관련 경력 5년 이상\n· 국내 대학 관련 전공 졸업",
           en: "Professional employment usually falls under E-7 (Specific Activities).\nDo any of these apply to you?\n· Master's degree or higher\n· Bachelor's + 1 year of related career\n· 5+ years of related career\n· Korean university graduate in a related major" },
    replies: [
      { label: { ko: "네, 해당합니다", en: "Yes, that's me" }, next: "e7where" },
      { label: { ko: "아니요 / 잘 모르겠어요", en: "No / Not sure" }, next: "handoff" },
    ],
  },
  e7where: {
    bot: { ko: "지금 한국에 체류 중이신가요? (예: D-2, D-10 소지)", en: "Are you currently staying in Korea? (e.g. on D-2 or D-10)" },
    replies: [
      { label: { ko: "네, 국내 체류 중", en: "Yes, I'm in Korea" }, next: "recoE7change" },
      { label: { ko: "해외에 있습니다", en: "I'm abroad" }, next: "recoE7new" },
    ],
  },
  d10check: {
    bot: { ko: "구직 비자(D-10)를 확인해 볼게요.\n학사 이상 학위(국내 전문학사 포함)를 갖고 계신가요?",
           en: "Let's check the D-10 job seeker visa.\nDo you have a Bachelor's degree or higher (Korean associate degree counts)?" },
    replies: [
      { label: { ko: "네", en: "Yes" }, next: "d10topik" },
      { label: { ko: "아니요", en: "No" }, next: "handoff" },
    ],
  },
  d10topik: {
    bot: { ko: "좋아요! 혹시 TOPIK 4급 이상 성적이나 사회통합프로그램(KIIP) 중간평가 합격이 있으신가요?\n(있으면 점수제 평가가 면제되어 절차가 간단해집니다 ✨)",
           en: "Great! Do you have TOPIK level 4+ or a KIIP mid-term pass?\n(Either one waives the points assessment and simplifies things ✨)" },
    replies: [
      { label: { ko: "네, 있어요", en: "Yes, I do" }, next: "recoD10" },
      { label: { ko: "없어요 (점수제 평가 필요)", en: "No (points assessment needed)" }, next: "recoD10" },
    ],
  },
  extend: {
    bot: { ko: "현재 어떤 비자를 갖고 계신가요?", en: "Which visa do you currently hold?" },
    replies: [
      { label: { ko: "D-2 (유학)", en: "D-2 (Study)" }, next: "recoD2ext" },
      { label: { ko: "D-4 (어학연수)", en: "D-4 (Language)" }, next: "recoD4ext" },
      { label: { ko: "E-7 (취업)", en: "E-7 (Work)" }, next: "recoE7ext" },
      { label: { ko: "기타", en: "Other" }, next: "handoff" },
    ],
  },
  recoD2change: { reco: ["D-2", "change"] },
  recoD2ext: { reco: ["D-2", "extension"] },
  recoD4new: { reco: ["D-4", "new"] },
  recoD4ext: { reco: ["D-4", "extension"] },
  recoD10: { reco: ["D-10", "change"] },
  recoE7change: { reco: ["E-7", "change"] },
  recoE7new: { reco: ["E-7", "new"] },
  recoE7ext: { reco: ["E-7", "extension"] },
  handoff: {
    bot: { ko: "이 사안은 담당 변호사·행정사가 직접 확인하는 것이 정확합니다.\n상담을 연결해 드릴게요 — 영업일 기준 24시간 이내 답변드립니다. 📩",
           en: "For this case, a direct review by our attorney & administrative agent is best.\nWe'll connect you — you'll hear back within 1 business day. 📩" },
    replies: [
      { label: { ko: "처음으로", en: "Start over" }, next: "start" },
      { label: { ko: "진행 상태 보기", en: "View my progress" }, href: "/status" },
    ],
  },
};

type Msg =
  | { kind: "bot" | "user"; text: L | string }
  | { kind: "reco"; code: string; appKey: string };

export default function ChatPage() {
  const { ui, t, won, lang } = useI18n();
  const router = useRouter();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [pendingReco, setPendingReco] = useState<[string, string] | null>(null);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const render = (v: L | string) => (typeof v === "string" ? v : t(v));

  function goTo(key: string) {
    const step = SCENARIO[key];
    if (!step) return;
    if (step.reco) {
      const [code, appKey] = step.reco;
      const n = VISAS[code].applications[appKey].documents.length + COMMON_DOCS.length;
      setMsgs((m) => [
        ...m,
        { kind: "reco", code, appKey },
        { kind: "bot", text: { ko: `신청을 진행하시겠어요? 필요 서류 ${n}종의 체크리스트를 만들어 드립니다.`,
                               en: `Ready to apply? I'll generate your checklist of ${n} documents.` } },
      ]);
      setPendingReco([code, appKey]);
      setReplies([]);
    } else {
      if (step.bot) setMsgs((m) => [...m, { kind: "bot", text: step.bot! }]);
      setPendingReco(null);
      setReplies(step.replies ?? []);
    }
  }

  function pick(r: Reply) {
    if (r.href) { router.push(r.href); return; }
    setMsgs((m) => [...m, { kind: "user", text: r.label }]);
    setReplies([]);
    setTimeout(() => goTo(r.next!), 300);
  }

  async function startApplication() {
    if (!pendingReco) return;
    const [visaCode, appKey] = pendingReco;
    const res = await fetch("/api/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visaCode, appKey, lang }),
    });
    const c = await res.json();
    localStorage.setItem("kva_case_id", c.id);
    router.push("/documents");
  }

  function sendFree() {
    const v = text.trim();
    if (!v) return;
    setText("");
    setMsgs((m) => [...m, { kind: "user", text: v }]);
    setTimeout(() => setMsgs((m) => [...m, { kind: "bot", text: ui("freeReply") }]), 300);
  }

  useEffect(() => { goTo("start"); }, []); // eslint-disable-line react-hooks/exhaustive-deps
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
            <button onClick={() => { setPendingReco(null); setMsgs((m) => [...m, { kind: "user", text: ui("otherBtn") }]); setTimeout(() => goTo("start"), 300); }}>
              {ui("otherBtn")}
            </button>
          </div>
        )}
        {replies.length > 0 && (
          <div className="quick-replies">
            {replies.map((r, i) => <button key={i} onClick={() => pick(r)}>{t(r.label)}</button>)}
          </div>
        )}
        <div ref={bottomRef} />
      </main>
      <div className="chat-input">
        <input value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendFree()}
          placeholder={ui("chatPlaceholder")} autoComplete="off" />
        <button onClick={sendFree} aria-label="send">➤</button>
      </div>
      <Tabbar />
    </>
  );
}

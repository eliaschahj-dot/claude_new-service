"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Appbar, Tabbar } from "@/components/Chrome";
import { useI18n } from "@/lib/i18n";
import { VISAS } from "@/lib/visa-db";
import type { L } from "@/lib/visa-db";
import type { Case } from "@/lib/store";
import { RiLock2Line, RiPassportLine, RiUserStarLine, RiCheckLine, RiSendPlaneFill } from "@remixicon/react";
import type { CaseMessage } from "@/lib/messages";

// 담당자 ↔ 신청인 메시지 스레드 (15초 폴링)
function MessageThread({ caseId }: { caseId: string }) {
  const { ui } = useI18n();
  const [msgs, setMsgs] = useState<CaseMessage[] | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch(`/api/cases/${caseId}/messages`)
        .then(async (r) => { if (alive && r.ok) setMsgs(await r.json()); })
        .catch(() => null);
    load();
    const iv = setInterval(load, 15_000);
    return () => { alive = false; clearInterval(iv); };
  }, [caseId]);

  async function send() {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      const r = await fetch(`/api/cases/${caseId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (r.ok) {
        const m: CaseMessage = await r.json();
        setMsgs((prev) => [...(prev ?? []), m]);
        setText("");
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="card">
      <p className="section-title" style={{ marginBottom: 12 }}>{ui("msgThreadTitle")}</p>
      <div className="transcript" style={{ maxHeight: 300 }}>
        {msgs?.length === 0 && <p className="muted" style={{ fontSize: ".8rem" }}>{ui("msgEmptyThread")}</p>}
        {msgs?.map((m) => (
          <div key={m.id} className={`tmsg ${m.sender === "customer" ? "u" : "a"}`}>
            <span style={{ display: "block", fontSize: ".68rem", opacity: .75, marginBottom: 2 }}>
              {m.sender === "customer" ? ui("msgMeLabel") : ui("msgAgentLabel")} · {new Date(m.createdAt).toLocaleString()}
            </span>
            {m.body}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={ui("msgPlaceholder")} disabled={sending}
          style={{ flex: 1, border: "1px solid var(--line)", borderRadius: 999, padding: "10px 16px", fontSize: ".85rem", outline: "none", background: "var(--bg)" }} />
        <button onClick={send} disabled={sending || !text.trim()} aria-label="send"
          style={{ border: "none", background: "var(--primary)", color: "#fff", width: 40, height: 40, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: sending || !text.trim() ? .5 : 1 }}>
          <RiSendPlaneFill size={16} />
        </button>
      </div>
    </div>
  );
}

// 타임라인 — 케이스의 stage(관리자 대시보드에서 변경)에 따라 진행 위치가 반영된다
const STEPS: { t: L; d: L }[] = [
  { t: { ko: "AI 상담 완료", en: "AI consultation done" }, d: { ko: "비자 유형 확정", en: "Visa type confirmed" } },
  { t: { ko: "서류 준비 및 검토", en: "Documents & review" }, d: { ko: "체크리스트 제출 진행 중", en: "Submitting your checklist" } },
  { t: { ko: "행정사 최종 검토 · 결제", en: "Final review & payment" }, d: { ko: "대행 수수료 결제 후 접수가 진행됩니다", en: "Filing proceeds after the service fee is paid" } },
  { t: { ko: "출입국 접수 (대행)", en: "Filed with immigration" }, d: { ko: "하이코리아 전자민원 또는 방문 접수", en: "Via HiKorea e-application or in person" } },
  { t: { ko: "심사 결과 통보", en: "Decision" }, d: { ko: "승인 / 보완 / 불허 결과 알림", en: "Approved / supplement / denied notification" } },
];

const STAGE_STEP: Record<string, number> = { consult: 0, docs: 1, review: 2, filed: 3, decided: 4 };

export default function StatusPage() {
  const { ui, t } = useI18n();
  const { status: authStatus } = useSession();
  const [kase, setKase] = useState<Case | null | undefined>(undefined); // undefined = loading

  useEffect(() => {
    const id = localStorage.getItem("kva_case_id");
    (async () => {
      if (id) {
        const r = await fetch(`/api/cases/${id}`);
        if (r.ok) { setKase(await r.json()); return; }
      }
      const list = await fetch("/api/cases");
      if (list.ok) {
        const cases: Case[] = await list.json();
        if (cases[0]) {
          localStorage.setItem("kva_case_id", cases[0].id);
          setKase(cases[0]);
          return;
        }
      }
      setKase(null);
    })().catch(() => setKase(null));
  }, []);

  // 비회원: 로그인 안내 페이지
  if (authStatus === "unauthenticated") {
    return (
      <>
        <Appbar titleKey="statusTitle" />
        <main>
          <div className="card login-gate">
            <span className="gate-ico"><RiLock2Line size={30} /></span>
            <b>{ui("guestStatusTitle")}</b>
            <p className="muted">{ui("guestGateSub")}</p>
            <Link className="btn btn-primary" href="/login?next=/status">{ui("loginCta")}</Link>
          </div>
        </main>
        <Tabbar />
      </>
    );
  }

  if (kase === undefined) {
    return (
      <>
        <Appbar titleKey="statusTitle" />
        <main><p className="card muted">…</p></main>
        <Tabbar />
      </>
    );
  }

  if (!kase) {
    return (
      <>
        <Appbar titleKey="statusTitle" />
        <main>
          <p className="card muted">{ui("noCase")}</p>
          <Link className="btn btn-primary" href="/chat">{ui("heroCta")}</Link>
        </main>
        <Tabbar />
      </>
    );
  }

  const visa = VISAS[kase.visaCode];
  const app = visa.applications[kase.appKey];

  return (
    <>
      <Appbar titleKey="statusTitle" />
      <main>
        <div className="card case-summary">
          <span className="dot"><RiPassportLine size={22} /></span>
          <span className="info">
            <b>{kase.visaCode} {t(visa.name)} — {t(app.label)}</b>
            <span className="muted">{ui("applyNo")}: {kase.id.slice(0, 8).toUpperCase()}</span>
          </span>
          <span className="badge badge-blue">{ui("inProgress")}</span>
        </div>

        <div className="card">
          <p className="section-title" style={{ marginBottom: 16 }}>{ui("stepsTitle")}</p>
          <ul className="timeline">
            {STEPS.map((s, i) => {
              const active = STAGE_STEP[kase.stage] ?? 1;
              const st = i < active ? "done" : i === active ? "now" : "";
              return (
                <li className={st} key={i}>
                  <span className="node">{st === "done" ? <RiCheckLine size={14} /> : i + 1}</span>
                  <span className="t-info"><b>{t(s.t)}</b><span>{t(s.d)}</span></span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="card agent-card">
          <span className="photo"><RiUserStarLine size={22} /></span>
          <span className="info">
            <b>{ui("agentName")}</b>
            <span>{ui("agentDesc")}</span>
          </span>
        </div>

        <MessageThread caseId={kase.id} />

        <Link className="btn btn-primary" href="/documents">{ui("supplement")}</Link>

        <p className="disclaimer">{ui("statusDisclaimer")}</p>
      </main>
      <Tabbar />
    </>
  );
}

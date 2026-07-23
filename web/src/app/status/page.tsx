"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Appbar, Tabbar } from "@/components/Chrome";
import { useI18n } from "@/lib/i18n";
import { VISAS } from "@/lib/visa-db";
import type { L } from "@/lib/visa-db";
import type { Case } from "@/lib/store";

// 데모 타임라인 — 실제로는 case_events 테이블에서 로드 (스텝 4~6 미구현)
const STEPS: { st: "done" | "now" | ""; t: L; d: L }[] = [
  { st: "done", t: { ko: "AI 상담 완료", en: "AI consultation done" }, d: { ko: "비자 유형 확정", en: "Visa type confirmed" } },
  { st: "now", t: { ko: "서류 준비 및 검토", en: "Documents & review" }, d: { ko: "체크리스트 제출 진행 중", en: "Submitting your checklist" } },
  { st: "", t: { ko: "행정사 최종 검토 · 결제", en: "Final review & payment" }, d: { ko: "대행 수수료 결제 후 접수가 진행됩니다", en: "Filing proceeds after the service fee is paid" } },
  { st: "", t: { ko: "출입국 접수 (대행)", en: "Filed with immigration" }, d: { ko: "하이코리아 전자민원 또는 방문 접수", en: "Via HiKorea e-application or in person" } },
  { st: "", t: { ko: "심사 결과 통보", en: "Decision" }, d: { ko: "승인 / 보완 / 불허 결과 알림", en: "Approved / supplement / denied notification" } },
];

export default function StatusPage() {
  const { ui, t } = useI18n();
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
          <span className="dot">🛂</span>
          <span className="info">
            <b>{kase.visaCode} {t(visa.name)} — {t(app.label)}</b>
            <span className="muted">{ui("applyNo")}: {kase.id.slice(0, 8).toUpperCase()}</span>
          </span>
          <span className="badge badge-blue">{ui("inProgress")}</span>
        </div>

        <div className="card">
          <p className="section-title" style={{ marginBottom: 16 }}>{ui("stepsTitle")}</p>
          <ul className="timeline">
            {STEPS.map((s, i) => (
              <li className={s.st} key={i}>
                <span className="node">{s.st === "done" ? "✓" : i + 1}</span>
                <span className="t-info"><b>{t(s.t)}</b><span>{t(s.d)}</span></span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card agent-card">
          <span className="photo">👤</span>
          <span className="info">
            <b>{ui("agentName")}</b>
            <span>{ui("agentDesc")}</span>
          </span>
          <button className="action" style={{ border: "1.5px solid var(--primary)", color: "var(--primary)", background: "none", borderRadius: 999, padding: "8px 14px", fontWeight: 700, fontSize: ".8rem" }}>
            {ui("msgBtn")}
          </button>
        </div>

        <Link className="btn btn-primary" href="/documents">{ui("supplement")}</Link>

        <p className="disclaimer">{ui("statusDisclaimer")}</p>
      </main>
      <Tabbar />
    </>
  );
}

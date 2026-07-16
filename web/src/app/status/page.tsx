"use client";
import Link from "next/link";
import { Appbar, Tabbar } from "@/components/Chrome";
import { useI18n } from "@/lib/i18n";
import type { L } from "@/lib/visa-db";

// 데모 타임라인 — 실제로는 case_events API에서 로드
const STEPS: { st: "done" | "now" | ""; t: L; d: L }[] = [
  { st: "done", t: { ko: "AI 상담 완료", en: "AI consultation done" }, d: { ko: "비자 유형 확정: E-7 · 7월 10일", en: "Visa type confirmed: E-7 · Jul 10" } },
  { st: "done", t: { ko: "신청 정보 입력", en: "Application info entered" }, d: { ko: "기본 정보·고용 정보 입력 완료 · 7월 11일", en: "Personal & employment info completed · Jul 11" } },
  { st: "now", t: { ko: "서류 준비 및 검토", en: "Documents & review" }, d: { ko: "3/5 서류 승인 · 학위증명서 보완 요청됨", en: "3/5 documents approved · degree certificate needs re-upload" } },
  { st: "", t: { ko: "행정사 최종 검토 · 결제", en: "Final review & payment" }, d: { ko: "대행 수수료 결제 후 접수가 진행됩니다", en: "Filing proceeds after the service fee is paid" } },
  { st: "", t: { ko: "출입국 접수 (대행)", en: "Filed with immigration" }, d: { ko: "하이코리아 전자민원 또는 방문 접수", en: "Via HiKorea e-application or in person" } },
  { st: "", t: { ko: "심사 결과 통보", en: "Decision" }, d: { ko: "승인 / 보완 / 불허 결과 알림", en: "Approved / supplement / denied notification" } },
];

export default function StatusPage() {
  const { ui, t } = useI18n();
  return (
    <>
      <Appbar titleKey="statusTitle" />
      <main>
        <div className="card case-summary">
          <span className="dot">🛂</span>
          <span className="info">
            <b>E-7</b>
            <span className="muted">{ui("applyNo")}: KVA-2026-0142</span>
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

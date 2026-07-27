"use client";
// 관리자 대시보드 (데스크톱) — 방문 통계 + 접수 케이스 + 상담 기록 모니터링
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { VISAS, COMMON_DOCS } from "@/lib/visa-db";
import { useI18n } from "@/lib/i18n";
import type { Case } from "@/lib/store";
import type { ConversationMeta, Overview } from "@/lib/analytics";
import {
  RiShieldUserLine, RiUserLine, RiTimerLine, RiEyeLine,
  RiChat3Line, RiFolder2Line, RiRefreshLine,
} from "@remixicon/react";

const STAGE_LABEL: Record<Case["stage"], { label: string; cls: string }> = {
  consult: { label: "상담", cls: "badge-gray" },
  docs: { label: "서류 수집", cls: "badge-blue" },
  review: { label: "검토 중", cls: "badge-amber" },
  filed: { label: "접수 완료", cls: "badge-green" },
  decided: { label: "결과 통보", cls: "badge-green" },
};

function fmtDur(sec: number): string {
  if (sec < 60) return `${sec}초`;
  return `${Math.floor(sec / 60)}분 ${sec % 60}초`;
}
const fmtDt = (s: string) => new Date(s).toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });

export default function AdminPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [cases, setCases] = useState<Case[] | null>(null);
  const [convs, setConvs] = useState<ConversationMeta[] | null>(null);
  const [stats, setStats] = useState<Overview | null>(null);
  const [denied, setDenied] = useState(false);

  async function load() {
    const [rc, rv, rs] = await Promise.all([
      fetch("/api/admin/cases"),
      fetch("/api/admin/conversations"),
      fetch("/api/admin/overview"),
    ]);
    if (rc.status === 403) { setDenied(true); return; }
    if (rc.ok) setCases(await rc.json());
    if (rv.ok) setConvs(await rv.json());
    if (rs.ok) setStats(await rs.json());
  }
  useEffect(() => { load().catch(() => null); }, []);

  if (denied) {
    return (
      <main style={{ maxWidth: 480, margin: "80px auto" }}>
        <div className="card login-gate">
          <span className="gate-ico"><RiShieldUserLine size={30} /></span>
          <b>관리자 전용 페이지입니다</b>
          <p className="muted">사무소 관리자 계정(ADMIN_EMAILS 등록)으로 로그인해야 접근할 수 있습니다.</p>
          <Link className="btn btn-primary" href="/login?next=/admin">Google로 로그인</Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <header className="admin-header">
        <Logo size={28} />
        <h1>K-Visa Assist 관리자</h1>
        <button className="action" onClick={() => load().catch(() => null)}
          style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 5 }}>
          <RiRefreshLine size={15} /> 새로고침
        </button>
      </header>
      <main>
        {/* 방문·상담 모니터링 */}
        <div className="stat-grid">
          <div className="stat-card"><span className="k"><RiUserLine size={14} /> 방문자 (24시간)</span><div className="v">{stats ? stats.visitors24h : "—"}</div></div>
          <div className="stat-card"><span className="k"><RiUserLine size={14} /> 방문자 (7일)</span><div className="v">{stats ? stats.visitors7d : "—"}</div></div>
          <div className="stat-card"><span className="k"><RiTimerLine size={14} /> 평균 체류 (24시간)</span><div className="v">{stats ? fmtDur(stats.avgDurationSec24h) : "—"}</div></div>
          <div className="stat-card"><span className="k"><RiEyeLine size={14} /> 페이지뷰 (24시간)</span><div className="v">{stats ? stats.pageviews24h : "—"}</div></div>
          <div className="stat-card"><span className="k"><RiChat3Line size={14} /> 상담 (24시간 / 7일)</span><div className="v">{stats ? stats.conversations24h : "—"} <small>/ {stats ? stats.conversations7d : "—"}</small></div></div>
        </div>

        {/* 접수 케이스 */}
        <section className="admin-section">
          <h2><RiFolder2Line size={17} /> 접수 케이스 {cases ? `(${cases.length})` : ""}</h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>접수번호</th><th>비자</th><th>신청 종류</th><th>신청인</th><th>서류</th><th>단계</th><th>생성</th><th>갱신</th></tr>
              </thead>
              <tbody>
                {!cases && <tr><td colSpan={8} className="muted">불러오는 중…</td></tr>}
                {cases?.length === 0 && <tr><td colSpan={8} className="muted">아직 접수된 케이스가 없습니다.</td></tr>}
                {cases?.map((c) => {
                  const visa = VISAS[c.visaCode];
                  const app = visa?.applications[c.appKey];
                  const docsTotal = app ? app.documents.length + COMMON_DOCS.length : 0;
                  const uploaded = Object.values(c.docStatus).filter((s) => s !== "none").length;
                  const st = STAGE_LABEL[c.stage] ?? STAGE_LABEL.docs;
                  return (
                    <tr key={c.id} onClick={() => router.push(`/admin/cases/${c.id}`)}>
                      <td className="mono">{c.id.slice(0, 8).toUpperCase()}</td>
                      <td><b>{c.visaCode}</b> {visa ? t(visa.name) : ""}</td>
                      <td>{app ? t(app.label) : c.appKey}</td>
                      <td>{c.userId ?? "—"}</td>
                      <td className="mono">{uploaded}/{docsTotal}</td>
                      <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                      <td className="mono">{fmtDt(c.createdAt)}</td>
                      <td className="mono">{fmtDt(c.updatedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* 상담 기록 — 무엇을 질문했는지 */}
        <section className="admin-section">
          <h2><RiChat3Line size={17} /> 상담 기록 {convs ? `(최근 ${convs.length}건)` : ""}</h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>시각</th><th>고객</th><th>언어</th><th>메시지</th><th>첫 질문</th></tr>
              </thead>
              <tbody>
                {!convs && <tr><td colSpan={5} className="muted">불러오는 중…</td></tr>}
                {convs?.length === 0 && <tr><td colSpan={5} className="muted">아직 저장된 상담이 없습니다. 이 기능 배포 이후의 새 상담부터 기록됩니다.</td></tr>}
                {convs?.map((v) => (
                  <tr key={v.id} onClick={() => router.push(`/admin/conversations/${v.id}`)}>
                    <td className="mono">{fmtDt(v.updatedAt)}</td>
                    <td>{v.userId ?? <span className="muted">비회원 ({v.visitorId?.slice(0, 8)})</span>}</td>
                    <td className="mono">{(v.lang ?? "—").toUpperCase()}</td>
                    <td className="mono">{v.msgCount}</td>
                    <td className="ellip">{v.firstQuestion || <span className="muted">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}

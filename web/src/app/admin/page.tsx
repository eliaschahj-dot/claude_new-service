"use client";
// 관리자 대시보드 — 접수 케이스 전체 목록 (사무소 내부용, ADMIN_EMAILS 화이트리스트)
import Link from "next/link";
import { useEffect, useState } from "react";
import { Appbar, Tabbar } from "@/components/Chrome";
import { VISAS } from "@/lib/visa-db";
import { COMMON_DOCS } from "@/lib/visa-db";
import { useI18n } from "@/lib/i18n";
import type { Case } from "@/lib/store";
import { RiShieldUserLine, RiArrowRightSLine } from "@remixicon/react";

const STAGE_LABEL: Record<Case["stage"], { label: string; cls: string }> = {
  consult: { label: "상담", cls: "badge-gray" },
  docs: { label: "서류 수집", cls: "badge-blue" },
  review: { label: "검토 중", cls: "badge-amber" },
  filed: { label: "접수 완료", cls: "badge-green" },
  decided: { label: "결과 통보", cls: "badge-green" },
};

export default function AdminPage() {
  const { t } = useI18n();
  const [cases, setCases] = useState<Case[] | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    fetch("/api/admin/cases").then(async (r) => {
      if (r.status === 403) { setDenied(true); return; }
      if (r.ok) setCases(await r.json());
    }).catch(() => null);
  }, []);

  if (denied) {
    return (
      <>
        <Appbar titleKey="myTitle" />
        <main>
          <div className="card login-gate">
            <span className="gate-ico"><RiShieldUserLine size={30} /></span>
            <b>관리자 전용 페이지입니다</b>
            <p className="muted">사무소 관리자 계정(ADMIN_EMAILS 등록)으로 로그인해야 접근할 수 있습니다.</p>
            <Link className="btn btn-primary" href="/login?next=/admin">Google로 로그인</Link>
          </div>
        </main>
        <Tabbar />
      </>
    );
  }

  return (
    <>
      <header className="appbar"><span className="logo">🗂 접수 케이스 관리</span></header>
      <main>
        {!cases && <p className="card muted">불러오는 중…</p>}
        {cases && cases.length === 0 && <p className="card muted">아직 접수된 케이스가 없습니다.</p>}
        {cases?.map((c) => {
          const visa = VISAS[c.visaCode];
          const app = visa?.applications[c.appKey];
          const docsTotal = app ? app.documents.length + COMMON_DOCS.length : 0;
          const uploaded = Object.values(c.docStatus).filter((s) => s !== "none").length;
          const st = STAGE_LABEL[c.stage] ?? STAGE_LABEL.docs;
          return (
            <Link key={c.id} href={`/admin/cases/${c.id}`} className="card" style={{ display: "block", textDecoration: "none", color: "inherit", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <b style={{ fontSize: ".92rem" }}>{c.visaCode} {visa ? t(visa.name) : ""}{app ? ` — ${t(app.label)}` : ""}</b>
                <span className={`badge ${st.cls}`} style={{ marginLeft: "auto" }}>{st.label}</span>
                <RiArrowRightSLine size={18} style={{ color: "var(--ink-soft)" }} />
              </div>
              <p className="muted" style={{ fontSize: ".8rem", marginTop: 6 }}>
                {c.userId ?? "(미로그인 생성)"} · 서류 {uploaded}/{docsTotal} · 접수번호 {c.id.slice(0, 8).toUpperCase()}
              </p>
              <p className="muted" style={{ fontSize: ".72rem", marginTop: 2 }}>
                생성 {new Date(c.createdAt).toLocaleString("ko-KR")} · 갱신 {new Date(c.updatedAt).toLocaleString("ko-KR")}
              </p>
            </Link>
          );
        })}
      </main>
      <Tabbar />
    </>
  );
}

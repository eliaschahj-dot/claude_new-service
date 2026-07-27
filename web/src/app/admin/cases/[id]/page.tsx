"use client";
// 관리자 케이스 상세 — 서류 검토(승인/반려), 진행 단계 변경, 업로드 파일 열람
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { Tabbar } from "@/components/Chrome";
import { VISAS, COMMON_DOCS, VisaDocument } from "@/lib/visa-db";
import { useI18n } from "@/lib/i18n";
import type { Case, DocStatus } from "@/lib/store";
import type { CaseFile } from "@/lib/files";
import { RiArrowLeftSLine, RiAttachment2, RiCheckLine, RiCloseLine } from "@remixicon/react";

interface DocRow extends VisaDocument { id: string; common: boolean }

const STAGES: { key: Case["stage"]; label: string }[] = [
  { key: "docs", label: "서류 수집" },
  { key: "review", label: "검토 중" },
  { key: "filed", label: "접수 완료" },
  { key: "decided", label: "결과 통보" },
];

const ST_BADGE: Record<DocStatus, { label: string; cls: string }> = {
  none: { label: "미제출", cls: "badge-gray" },
  uploaded: { label: "검토 대기", cls: "badge-amber" },
  approved: { label: "승인", cls: "badge-green" },
  rejected: { label: "반려", cls: "badge-red" },
};

export default function AdminCasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useI18n();
  const [kase, setKase] = useState<Case | null>(null);
  const [files, setFiles] = useState<Record<string, CaseFile>>({});
  const [denied, setDenied] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/cases/${id}`).then(async (r) => {
      if (r.status === 403) { setDenied(true); return; }
      if (!r.ok) return;
      const data: { case: Case; files: CaseFile[] } = await r.json();
      setKase(data.case);
      const byDoc: Record<string, CaseFile> = {};
      for (const f of data.files) if (!byDoc[f.docId]) byDoc[f.docId] = f;
      setFiles(byDoc);
    }).catch(() => null);
  }, [id]);

  async function patch(body: Record<string, string>, busyKey: string) {
    setBusy(busyKey);
    try {
      const r = await fetch(`/api/admin/cases/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (r.ok) setKase(await r.json());
      else alert(`변경 실패 (HTTP ${r.status})`);
    } finally {
      setBusy(null);
    }
  }

  if (denied) return <main><p className="card muted" style={{ marginTop: 20 }}>관리자 전용 페이지입니다. <Link href="/login?next=/admin">로그인</Link></p></main>;
  if (!kase) return <main><p className="card muted" style={{ marginTop: 20 }}>불러오는 중…</p></main>;

  const visa = VISAS[kase.visaCode];
  const app = visa?.applications[kase.appKey];
  const docs: DocRow[] = app ? [
    ...COMMON_DOCS.map((d, i) => ({ id: "c" + i, ...d, common: true })),
    ...app.documents.map((d, i) => ({ id: "d" + i, ...d, common: false })),
  ] : [];

  return (
    <>
      <header className="appbar">
        <Link className="back" href="/admin" aria-label="back"><RiArrowLeftSLine size={24} /></Link>
        <span className="title">케이스 검토</span>
      </header>
      <main>
        <div className="card">
          <b style={{ fontSize: ".95rem" }}>{kase.visaCode} {visa ? t(visa.name) : ""}{app ? ` — ${t(app.label)}` : ""}</b>
          <p className="muted" style={{ fontSize: ".8rem", marginTop: 6 }}>
            신청인: {kase.userId ?? "(미상)"}<br />
            접수번호: {kase.id.slice(0, 8).toUpperCase()} · 언어: {kase.lang.toUpperCase()}<br />
            생성: {new Date(kase.createdAt).toLocaleString("ko-KR")}
          </p>
        </div>

        <div className="card">
          <p className="section-title" style={{ marginBottom: 10 }}>진행 단계</p>
          <div className="quick-replies" style={{ marginTop: 0 }}>
            {STAGES.map((s) => (
              <button key={s.key} disabled={busy === "stage"}
                onClick={() => patch({ stage: s.key }, "stage")}
                style={kase.stage === s.key ? { background: "var(--primary)", color: "#fff", borderColor: "var(--primary)" } : undefined}>
                {s.label}
              </button>
            ))}
          </div>
          <p className="muted" style={{ fontSize: ".72rem", marginTop: 8 }}>단계를 바꾸면 신청인의 [상태] 화면 타임라인에 즉시 반영됩니다.</p>
        </div>

        <div className="card">
          <p className="section-title" style={{ marginBottom: 12 }}>서류 검토</p>
          {docs.map((d) => {
            const st = ST_BADGE[kase.docStatus[d.id] ?? "none"];
            const f = files[d.id];
            return (
              <div className="doc-item" key={d.id}>
                <span className="info" style={{ flex: 1 }}>
                  <b>{t(d.name)}</b>
                  <span className={`badge ${st.cls}`}>{st.label}</span><br />
                  {f ? (
                    <a href={`/api/admin/cases/${kase.id}/files/${f.id}`} target="_blank" rel="noreferrer"
                       style={{ fontSize: ".75rem", color: "var(--primary)", display: "inline-flex", alignItems: "center", gap: 3 }}>
                      <RiAttachment2 size={13} /> {f.filename} ({Math.max(1, Math.round(f.size / 1024))}KB)
                    </a>
                  ) : (
                    <span className="muted" style={{ fontSize: ".75rem" }}>업로드된 파일 없음</span>
                  )}
                </span>
                <span style={{ display: "flex", gap: 6 }}>
                  <button className="action" disabled={busy === d.id || !f}
                    onClick={() => patch({ docId: d.id, docStatus: "approved" }, d.id)}
                    style={{ color: "#166534", borderColor: "#166534" }}>
                    <RiCheckLine size={15} />
                  </button>
                  <button className="action" disabled={busy === d.id || !f}
                    onClick={() => patch({ docId: d.id, docStatus: "rejected" }, d.id)}
                    style={{ color: "#b91c1c", borderColor: "#b91c1c" }}>
                    <RiCloseLine size={15} />
                  </button>
                </span>
              </div>
            );
          })}
          <p className="muted" style={{ fontSize: ".72rem", marginTop: 10 }}>✓ 승인 / ✕ 반려(신청인 화면에 다시 업로드 요청으로 표시)</p>
        </div>
      </main>
      <Tabbar />
    </>
  );
}

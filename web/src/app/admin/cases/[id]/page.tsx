"use client";
// 관리자 케이스 상세 (데스크톱) — 신청인 정보·진행 단계 | 서류 검토 | 고객 상담 기록
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { VISAS, COMMON_DOCS, VisaDocument } from "@/lib/visa-db";
import { useI18n } from "@/lib/i18n";
import type { Case, DocStatus } from "@/lib/store";
import type { CaseFile } from "@/lib/files";
import type { ConversationMeta } from "@/lib/analytics";
import { RiArrowLeftSLine, RiAttachment2, RiCheckLine, RiCloseLine, RiChat3Line } from "@remixicon/react";

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
  const [convs, setConvs] = useState<ConversationMeta[]>([]);
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
      if (data.case.userId) {
        const rv = await fetch(`/api/admin/conversations?user=${encodeURIComponent(data.case.userId)}`);
        if (rv.ok) setConvs(await rv.json());
      }
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

  if (denied) return <main style={{ paddingTop: 40 }}><p className="card muted">관리자 전용 페이지입니다. <Link href="/login?next=/admin">로그인</Link></p></main>;
  if (!kase) return <main style={{ paddingTop: 40 }}><p className="card muted">불러오는 중…</p></main>;

  const visa = VISAS[kase.visaCode];
  const app = visa?.applications[kase.appKey];
  const docs: DocRow[] = app ? [
    ...COMMON_DOCS.map((d, i) => ({ id: "c" + i, ...d, common: true })),
    ...app.documents.map((d, i) => ({ id: "d" + i, ...d, common: false })),
  ] : [];

  return (
    <>
      <header className="admin-header">
        <Link className="crumb" href="/admin"><RiArrowLeftSLine size={18} /> 대시보드</Link>
        <h1>케이스 {kase.id.slice(0, 8).toUpperCase()}</h1>
      </header>
      <main>
        <div className="admin-cols">
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div className="admin-card">
              <h3>신청 정보</h3>
              <div className="admin-kv">
                <div><b>비자</b> {kase.visaCode} {visa ? t(visa.name) : ""}</div>
                <div><b>신청 종류</b> {app ? t(app.label) : kase.appKey}</div>
                <div><b>신청인</b> {kase.userId ?? "(미상)"}</div>
                <div><b>언어</b> {kase.lang.toUpperCase()}</div>
                <div><b>생성</b> {new Date(kase.createdAt).toLocaleString("ko-KR")}</div>
                <div><b>갱신</b> {new Date(kase.updatedAt).toLocaleString("ko-KR")}</div>
              </div>
            </div>

            <div className="admin-card">
              <h3>진행 단계</h3>
              <div className="quick-replies" style={{ marginTop: 0 }}>
                {STAGES.map((s) => (
                  <button key={s.key} disabled={busy === "stage"}
                    onClick={() => patch({ stage: s.key }, "stage")}
                    style={kase.stage === s.key ? { background: "var(--primary)", color: "#fff", borderColor: "var(--primary)" } : undefined}>
                    {s.label}
                  </button>
                ))}
              </div>
              <p className="muted" style={{ fontSize: ".74rem", marginTop: 10 }}>단계를 바꾸면 신청인의 [상태] 화면 타임라인에 즉시 반영됩니다.</p>
            </div>

            <div className="admin-card">
              <h3><RiChat3Line size={15} style={{ verticalAlign: "-2px" }} /> 이 고객의 상담 기록</h3>
              {convs.length === 0 && <p className="muted" style={{ fontSize: ".82rem" }}>저장된 상담이 없습니다.</p>}
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                {convs.map((v) => (
                  <li key={v.id}>
                    <Link href={`/admin/conversations/${v.id}`} style={{ fontSize: ".82rem", color: "var(--primary)", textDecoration: "none" }}>
                      {new Date(v.updatedAt).toLocaleString("ko-KR")} · {v.msgCount}개 메시지
                      {v.firstQuestion && <span className="muted"> — {v.firstQuestion.slice(0, 40)}…</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="admin-card">
            <h3>서류 검토</h3>
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
                         style={{ fontSize: ".78rem", color: "var(--primary)", display: "inline-flex", alignItems: "center", gap: 3 }}>
                        <RiAttachment2 size={13} /> {f.filename} ({Math.max(1, Math.round(f.size / 1024))}KB)
                      </a>
                    ) : (
                      <span className="muted" style={{ fontSize: ".78rem" }}>업로드된 파일 없음</span>
                    )}
                  </span>
                  <span style={{ display: "flex", gap: 6 }}>
                    <button className="action" disabled={busy === d.id || !f}
                      onClick={() => patch({ docId: d.id, docStatus: "approved" }, d.id)}
                      title="승인" style={{ color: "#166534", borderColor: "#166534" }}>
                      <RiCheckLine size={15} />
                    </button>
                    <button className="action" disabled={busy === d.id || !f}
                      onClick={() => patch({ docId: d.id, docStatus: "rejected" }, d.id)}
                      title="반려" style={{ color: "#b91c1c", borderColor: "#b91c1c" }}>
                      <RiCloseLine size={15} />
                    </button>
                  </span>
                </div>
              );
            })}
            <p className="muted" style={{ fontSize: ".74rem", marginTop: 12 }}>✓ 승인 / ✕ 반려 — 반려하면 신청인 화면에 &quot;다시 올려주세요&quot;로 표시됩니다.</p>
          </div>
        </div>
      </main>
    </>
  );
}

"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Appbar, Tabbar } from "@/components/Chrome";
import { useI18n } from "@/lib/i18n";
import { VISAS, COMMON_DOCS, VisaDocument } from "@/lib/visa-db";
import type { Case, DocStatus } from "@/lib/store";
import type { CaseFile } from "@/lib/files";
import {
  RiLock2Line, RiPassportLine, RiBuilding2Line, RiBankLine,
  RiGraduationCapLine, RiFileTextLine, RiAttachment2,
} from "@remixicon/react";

interface DocRow extends VisaDocument { id: string; common: boolean }

export default function DocumentsPage() {
  const { ui, t } = useI18n();
  const { status: authStatus } = useSession();
  const [kase, setKase] = useState<Case | null>(null);
  const [files, setFiles] = useState<Record<string, CaseFile>>({});
  const [busyDoc, setBusyDoc] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const pendingDoc = useRef<string | null>(null);

  async function loadFiles(caseId: string) {
    const r = await fetch(`/api/cases/${caseId}/files`);
    if (!r.ok) return;
    const list: CaseFile[] = await r.json();
    const byDoc: Record<string, CaseFile> = {};
    for (const f of list) if (!byDoc[f.docId]) byDoc[f.docId] = f; // 최신순 응답 → 첫 항목 유지
    setFiles(byDoc);
  }

  useEffect(() => {
    const id = localStorage.getItem("kva_case_id");
    (async () => {
      if (id) {
        const r = await fetch(`/api/cases/${id}`);
        if (r.ok) { setKase(await r.json()); await loadFiles(id); return; }
      }
      // localStorage에 없거나(다른 기기·로그인) 만료된 경우, 로그인 사용자의 최신 케이스로 대체
      const list = await fetch("/api/cases");
      if (list.ok) {
        const cases: Case[] = await list.json();
        if (cases[0]) {
          localStorage.setItem("kva_case_id", cases[0].id);
          setKase(cases[0]);
          await loadFiles(cases[0].id);
        }
      }
    })().catch(() => null);
  }, []);

  // 비회원: 로그인 안내 페이지 (서류는 계정에 귀속되므로)
  if (authStatus === "unauthenticated") {
    return (
      <>
        <Appbar titleKey="docsPageTitle" />
        <main>
          <div className="card login-gate">
            <span className="gate-ico"><RiLock2Line size={30} /></span>
            <b>{ui("guestDocsTitle")}</b>
            <p className="muted">{ui("guestGateSub")}</p>
            <Link className="btn btn-primary" href="/login?next=/documents">{ui("loginCta")}</Link>
          </div>
        </main>
        <Tabbar />
      </>
    );
  }

  if (!kase) {
    return (
      <>
        <Appbar titleKey="docsPageTitle" />
        <main>
          <p className="card muted">{authStatus === "loading" ? "…" : ui("noCase")}</p>
          <Link className="btn btn-primary" href="/chat">{ui("heroCta")}</Link>
        </main>
        <Tabbar />
      </>
    );
  }

  const visa = VISAS[kase.visaCode];
  const app = visa.applications[kase.appKey];
  const docs: DocRow[] = [
    ...COMMON_DOCS.map((d, i) => ({ id: "c" + i, ...d, common: true })),
    ...app.documents.map((d, i) => ({ id: "d" + i, ...d, common: false })),
  ];
  const done = docs.filter((d) => (kase.docStatus[d.id] ?? "none") !== "none").length;

  const stMeta = (s: DocStatus) => ({
    none: { label: ui("stNone"), cls: "badge-gray", action: ui("actUpload") },
    uploaded: { label: ui("stUploaded"), cls: "badge-amber", action: ui("actReupload") },
    approved: { label: ui("stApproved"), cls: "badge-green", action: ui("actView") },
    rejected: { label: ui("stNone"), cls: "badge-red", action: ui("actUpload") },
  }[s]);

  const icon = (d: DocRow) => d.common ? <RiPassportLine size={20} />
    : d.issuer.ko.includes("회사") ? <RiBuilding2Line size={20} /> : d.issuer.ko.includes("은행") ? <RiBankLine size={20} />
    : /학교|대학|연수/.test(d.issuer.ko) ? <RiGraduationCapLine size={20} /> : <RiFileTextLine size={20} />;

  function pickFile(docId: string) {
    pendingDoc.current = docId;
    fileRef.current?.click();
  }

  async function onFile() {
    const docId = pendingDoc.current;
    const file = fileRef.current?.files?.[0];
    if (!docId || !file) return;
    fileRef.current!.value = "";
    // Vercel 서버리스 요청 한도(~4.5MB) 안쪽 — 서버와 동일 기준
    if (file.size > 4 * 1024 * 1024) { alert(ui("upFailSize")); return; }

    setBusyDoc(docId);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("docId", docId);
      const res = await fetch(`/api/cases/${kase!.id}/files`, { method: "POST", body: form });
      if (res.ok) {
        const { file: meta, case: updated } = await res.json();
        setFiles((prev) => ({ ...prev, [docId]: meta }));
        if (updated) setKase(updated);
      } else if (res.status === 413) alert(ui("upFailSize"));
      else if (res.status === 415) alert(ui("upFailType"));
      else {
        const err = await res.json().catch(() => null);
        alert(ui("upFail") + (err?.error ? `\n(${err.error})` : ` (HTTP ${res.status})`));
      }
    } catch {
      alert(ui("upFail"));
    } finally {
      setBusyDoc(null);
    }
  }

  return (
    <>
      <Appbar titleKey="docsPageTitle" />
      <main>
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span className="badge badge-blue">{kase.visaCode} {t(visa.name)}</span>
            <b style={{ fontSize: ".95rem" }}>{t(app.label)} — {ui("checklist")}</b>
          </div>
          <div className="progress-wrap">
            <div className="progress-bar"><i style={{ width: `${Math.round((done / docs.length) * 100)}%` }} /></div>
            <span className="muted" style={{ whiteSpace: "nowrap" }}><b>{done}</b> / {docs.length} {ui("submitted")}</span>
          </div>
          <p className="muted" style={{ marginTop: 10 }}>{ui("docsAutoNote")}</p>
        </div>

        <div className="card">
          {docs.map((d) => {
            const st = stMeta(kase.docStatus[d.id] ?? "none");
            const f = files[d.id];
            return (
              <div className="doc-item" key={d.id}>
                <span className="ico">{icon(d)}</span>
                <span className="info">
                  <b>{t(d.name)}</b>
                  <span className={`badge ${st.cls}`}>{st.label}</span><br />
                  <span>{ui("issuer")}: {t(d.issuer)}</span>
                  {f && (
                    <>
                      <br />
                      <a href={`/api/cases/${kase.id}/files/${f.id}`} target="_blank" rel="noreferrer"
                         style={{ fontSize: ".75rem", color: "var(--primary)", wordBreak: "break-all", display: "inline-flex", alignItems: "center", gap: 3 }}>
                        <RiAttachment2 size={13} /> {f.filename} ({Math.max(1, Math.round(f.size / 1024))}KB)
                      </a>
                    </>
                  )}
                </span>
                <button className="action" disabled={busyDoc === d.id} onClick={() => pickFile(d.id)}>
                  {busyDoc === d.id ? ui("uploading") : st.action}
                </button>
              </div>
            );
          })}
        </div>

        <div className="btn-row">
          <Link className="btn btn-ghost" href="/chat">{ui("askDocs")}</Link>
          <Link className="btn btn-primary" href="/status">{ui("submitDone")}</Link>
        </div>

        <p className="disclaimer">{ui("docsDisclaimer")}</p>
        <input ref={fileRef} type="file" accept="image/*,.pdf" hidden onChange={onFile} />
      </main>
      <Tabbar />
    </>
  );
}

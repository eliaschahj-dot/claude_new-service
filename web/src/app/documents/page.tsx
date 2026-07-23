"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Appbar, Tabbar } from "@/components/Chrome";
import { useI18n } from "@/lib/i18n";
import { VISAS, COMMON_DOCS, VisaDocument } from "@/lib/visa-db";
import type { Case, DocStatus } from "@/lib/store";

interface DocRow extends VisaDocument { id: string; common: boolean }

export default function DocumentsPage() {
  const { ui, t } = useI18n();
  const [kase, setKase] = useState<Case | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const pendingDoc = useRef<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("kva_case_id");
    (async () => {
      if (id) {
        const r = await fetch(`/api/cases/${id}`);
        if (r.ok) { setKase(await r.json()); return; }
      }
      // localStorage에 없거나(다른 기기·로그인) 만료된 경우, 로그인 사용자의 최신 케이스로 대체
      const list = await fetch("/api/cases");
      if (list.ok) {
        const cases: Case[] = await list.json();
        if (cases[0]) {
          localStorage.setItem("kva_case_id", cases[0].id);
          setKase(cases[0]);
        }
      }
    })().catch(() => null);
  }, []);

  if (!kase) {
    return (
      <>
        <Appbar titleKey="docsPageTitle" />
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

  const icon = (d: DocRow) => d.common ? "🛂"
    : d.issuer.ko.includes("회사") ? "🏢" : d.issuer.ko.includes("은행") ? "🏦"
    : /학교|대학|연수/.test(d.issuer.ko) ? "🎓" : "📑";

  function pickFile(docId: string) {
    pendingDoc.current = docId;
    fileRef.current?.click();
  }

  async function onFile() {
    const docId = pendingDoc.current;
    if (!docId || !fileRef.current?.files?.length) return;
    fileRef.current.value = "";
    // 데모: 파일 자체는 전송하지 않고 상태만 갱신 — 실제로는 암호화 스토리지 업로드
    const res = await fetch(`/api/cases/${kase!.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ docId, status: "uploaded" }),
    });
    if (res.ok) setKase(await res.json());
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
            return (
              <div className="doc-item" key={d.id}>
                <span className="ico">{icon(d)}</span>
                <span className="info">
                  <b>{t(d.name)}</b>
                  <span className={`badge ${st.cls}`}>{st.label}</span><br />
                  <span>{ui("issuer")}: {t(d.issuer)}</span>
                </span>
                <button className="action" onClick={() => pickFile(d.id)}>{st.action}</button>
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

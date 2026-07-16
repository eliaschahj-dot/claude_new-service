"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Appbar, Tabbar } from "@/components/Chrome";
import { useI18n } from "@/lib/i18n";
import { VISAS } from "@/lib/visa-db";
import type { Case } from "@/lib/store";

export default function HomePage() {
  const { ui, t } = useI18n();
  const [ongoing, setOngoing] = useState<Case | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("kva_case_id");
    if (!id) return;
    fetch(`/api/cases/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setOngoing)
      .catch(() => null);
  }, []);

  return (
    <>
      <Appbar home />
      <main>
        <section className="hero">
          <h1 style={{ whiteSpace: "pre-line" }}>{ui("heroTitle")}</h1>
          <p>{ui("heroDesc")}</p>
          <Link className="btn" href="/chat">{ui("heroCta")}</Link>
        </section>

        <section>
          <p className="section-title">{ui("quickMenu")}</p>
          <div className="quick-grid" style={{ marginTop: 10 }}>
            <Link href="/visas"><span className="ico">🛂</span>{ui("qVisaInfo")}</Link>
            <Link href="/documents"><span className="ico">📄</span>{ui("qDocs")}</Link>
            <Link href="/status"><span className="ico">📍</span>{ui("qStatus")}</Link>
            <Link href="/status"><span className="ico">👤</span>{ui("qExpert")}</Link>
          </div>
        </section>

        <section>
          <p className="section-title">{ui("ongoing")}</p>
          {ongoing ? (
            <Link className="card case-summary" href="/documents" style={{ marginTop: 10 }}>
              <span className="dot">🛂</span>
              <span className="info">
                <b>{ongoing.visaCode} {t(VISAS[ongoing.visaCode].name)}</b>
                <span className="muted">{t(VISAS[ongoing.visaCode].applications[ongoing.appKey].label)}</span>
              </span>
              <span className="badge badge-blue">{ui("inProgress")}</span>
            </Link>
          ) : (
            <p className="card muted" style={{ marginTop: 10 }}>{ui("noCase")}</p>
          )}
        </section>

        <section>
          <p className="section-title">{ui("popular")}</p>
          {(["D-2", "E-7"] as const).map((code) => (
            <div className="card visa-card" style={{ marginTop: 10 }} key={code}>
              <div className="head">
                <span className="code">{code}</span>
                <b>{t(VISAS[code].name)}</b>
              </div>
              <p className="muted">{t(VISAS[code].summary)}</p>
            </div>
          ))}
          <Link className="btn btn-ghost" href="/visas" style={{ marginTop: 12 }}>{ui("viewAll")}</Link>
        </section>

        <p className="disclaimer">{ui("homeDisclaimer")}</p>
      </main>
      <Tabbar />
    </>
  );
}

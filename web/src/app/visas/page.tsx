"use client";
import Link from "next/link";
import { useState } from "react";
import { Appbar, Tabbar } from "@/components/Chrome";
import { useI18n } from "@/lib/i18n";
import { VISAS, DB_UPDATED } from "@/lib/visa-db";

const BADGE: Record<string, string> = { study: "badge-blue", work: "badge-green" };

export default function VisasPage() {
  const { ui, t, won } = useI18n();
  const [filter, setFilter] = useState<"all" | "study" | "work">("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const entries = Object.entries(VISAS).filter(([code, v]) => {
    if (filter !== "all" && v.catKey !== filter) return false;
    const q = query.trim().toLowerCase();
    if (q && !(code.toLowerCase().includes(q) || t(v.name).toLowerCase().includes(q) || v.nameEn.toLowerCase().includes(q))) return false;
    return true;
  });

  return (
    <>
      <Appbar titleKey="visasTitle" />
      <main>
        <div className="search">
          🔍 <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={ui("searchPh")} />
        </div>

        <div className="chips">
          {(["all", "study", "work"] as const).map((cat) => (
            <button key={cat} className={filter === cat ? "on" : ""} onClick={() => setFilter(cat)}>
              {ui(cat === "all" ? "catAll" : cat === "study" ? "catStudy" : "catWork")}
            </button>
          ))}
        </div>

        {entries.length === 0 && (
          <p className="muted" style={{ textAlign: "center", padding: 20 }}>{ui("noResult")}</p>
        )}

        {entries.map(([code, v]) => (
          <div className="card visa-card" key={code}>
            <div className="head">
              <span className="code">{code}</span>
              <b>{t(v.name)}</b>
              <span className={`badge ${BADGE[v.catKey]}`} style={{ marginLeft: "auto" }}>{t(v.category)}</span>
            </div>
            <p className="muted">{t(v.summary)}</p>
            <div className="meta">
              <span>⏱ {ui("processing")} {t(v.processDays)}</span>
              <span>🗓 {t(v.stay)}</span>
            </div>
            {open === code && (
              <div className="visa-detail">
                {Object.entries(v.applications).map(([key, app]) => (
                  <div className="app-block" key={key}>
                    <b>{t(app.label)}</b>
                    <div className="fee-box">
                      <div className="fee-row"><span>{ui("agencyFee")}</span><b>{won(app.agencyFee)}</b></div>
                      <div className="fee-row"><span>{ui("govFee")}</span><b>{won(app.govFee)}</b></div>
                    </div>
                    <p className="muted" style={{ margin: "6px 0 2px" }}><b>{ui("reqTitle")}</b></p>
                    <ul className="mini-list">{app.requirements.map((r, i) => <li key={i}>{t(r)}</li>)}</ul>
                    <p className="muted" style={{ margin: "6px 0 2px" }}><b>{ui("docsTitle")}</b></p>
                    <ul className="mini-list">{app.documents.map((d, i) => <li key={i}>{t(d.name)}</li>)}</ul>
                  </div>
                ))}
              </div>
            )}
            <button className="btn btn-ghost" style={{ padding: 9, fontSize: ".82rem" }}
              onClick={() => setOpen(open === code ? null : code)}>
              {open === code ? ui("detailClose") : ui("detailOpen")}
            </button>
          </div>
        ))}

        <Link className="btn btn-primary" href="/chat">{ui("askAi")}</Link>

        <p className="disclaimer">{ui("visasDisclaimer")} · {ui("updatedAt")} {DB_UPDATED}</p>
      </main>
      <Tabbar />
    </>
  );
}

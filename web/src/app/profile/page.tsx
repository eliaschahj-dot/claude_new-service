"use client";
import Link from "next/link";
import { Appbar, Tabbar } from "@/components/Chrome";
import { useI18n } from "@/lib/i18n";

export default function ProfilePage() {
  const { ui, lang, setLang } = useI18n();
  return (
    <>
      <Appbar titleKey="myTitle" />
      <main>
        <div className="card profile-head">
          <span className="avatar-lg">🧑</span>
          <span>
            <b style={{ fontSize: "1rem" }}>Nguyen Van A</b>
            <p className="muted">Vietnam · nguyenvana@email.com</p>
          </span>
          <span className="badge badge-blue" style={{ marginLeft: "auto" }}>E-7</span>
        </div>

        <div className="card">
          <ul className="menu-list">
            <li><Link href="/status">{ui("mMyCases")}</Link></li>
            <li><Link href="/documents">{ui("mMyDocs")}</Link></li>
            <li><a href="#">{ui("mPayments")}</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); setLang(lang === "ko" ? "en" : "ko"); }}>{ui("mLang")}</a></li>
            <li><a href="#">{ui("mNoti")}</a></li>
          </ul>
        </div>

        <div className="card">
          <ul className="menu-list">
            <li><a href="#">{ui("mPrivacy")}</a></li>
            <li><a href="#">{ui("mTerms")}</a></li>
            <li><a href="#">{ui("mOffice")}</a></li>
            <li><a href="#">{ui("mLogout")}</a></li>
          </ul>
        </div>

        <p className="disclaimer">{ui("myDisclaimer")}</p>
      </main>
      <Tabbar />
    </>
  );
}

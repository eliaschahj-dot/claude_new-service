"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Appbar, Tabbar } from "@/components/Chrome";
import { useI18n } from "@/lib/i18n";

export default function ProfilePage() {
  const { ui, lang, setLang } = useI18n();
  const { data: session, status } = useSession();
  const user = session?.user;

  return (
    <>
      <Appbar titleKey="myTitle" />
      <main>
        {status === "authenticated" && user ? (
          <div className="card profile-head">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="avatar-img" src={user.image} alt="" referrerPolicy="no-referrer" />
            ) : (
              <span className="avatar-lg">🧑</span>
            )}
            <span>
              <b style={{ fontSize: "1rem" }}>{user.name ?? user.email}</b>
              <p className="muted">{user.email}</p>
            </span>
            <span className="badge badge-green" style={{ marginLeft: "auto" }}>Google</span>
          </div>
        ) : (
          <div className="card profile-head">
            <span className="avatar-lg">🔐</span>
            <span>
              <b style={{ fontSize: "1rem" }}>{ui("guest")}</b>
              <p className="muted">{ui("loginDesc")}</p>
            </span>
          </div>
        )}

        {status !== "authenticated" && (
          <Link className="btn btn-primary" href="/login">{ui("loginCta")}</Link>
        )}

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
            {status === "authenticated" && (
              <li><a href="#" onClick={(e) => { e.preventDefault(); signOut({ redirectTo: "/" }); }}>{ui("logout")}</a></li>
            )}
          </ul>
        </div>

        <p className="disclaimer">{ui("myDisclaimer")}</p>
      </main>
      <Tabbar />
    </>
  );
}

"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Appbar, Tabbar } from "@/components/Chrome";
import { useI18n } from "@/lib/i18n";
import {
  RiUser3Line, RiLock2Line, RiLockLine,
  RiFolderOpenLine, RiFileList3Line, RiBankCardLine,
  RiGlobalLine, RiNotification3Line,
  RiShieldUserLine, RiFileTextLine, RiHomeOfficeLine, RiLogoutBoxRLine,
  RiDashboardLine,
} from "@remixicon/react";

export default function ProfilePage() {
  const { ui, lang, setLang } = useI18n();
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.user;
  const authed = status === "authenticated";
  const isAdmin = !!(session as { isAdmin?: boolean } | null)?.isAdmin;

  // 비회원이 계정 귀속 메뉴(신청 내역·서류·결제)를 누르면 로그인으로 유도
  function gate(e: React.MouseEvent, next: string) {
    if (!authed) {
      e.preventDefault();
      router.push(`/login?next=${encodeURIComponent(next)}`);
    }
  }

  const lock = !authed && <span className="lock"><RiLockLine size={14} /></span>;

  return (
    <>
      <Appbar titleKey="myTitle" />
      <main>
        {authed && user ? (
          <div className="card profile-head">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="avatar-img" src={user.image} alt="" referrerPolicy="no-referrer" />
            ) : (
              <span className="avatar-lg"><RiUser3Line size={26} /></span>
            )}
            <span>
              <b style={{ fontSize: "1rem" }}>{user.name ?? user.email}</b>
              <p className="muted">{user.email}</p>
            </span>
            <span className="badge badge-green" style={{ marginLeft: "auto" }}>Google</span>
          </div>
        ) : (
          <div className="card profile-head">
            <span className="avatar-lg"><RiLock2Line size={24} /></span>
            <span>
              <b style={{ fontSize: "1rem" }}>{ui("guest")}</b>
              <p className="muted">{ui("loginDesc")}</p>
            </span>
          </div>
        )}

        {!authed && (
          <Link className="btn btn-primary" href="/login">{ui("loginCta")}</Link>
        )}

        {isAdmin && (
          <div className="card">
            <ul className="menu-list">
              <li>
                <Link href="/admin">
                  <span className="mi"><RiDashboardLine size={18} /></span>관리자 대시보드 (사무소)
                </Link>
              </li>
            </ul>
          </div>
        )}

        <div className="card">
          <ul className="menu-list">
            <li>
              <Link href="/status" onClick={(e) => gate(e, "/status")}>
                <span className="mi"><RiFolderOpenLine size={18} /></span>{ui("mMyCases")}{lock}
              </Link>
            </li>
            <li>
              <Link href="/documents" onClick={(e) => gate(e, "/documents")}>
                <span className="mi"><RiFileList3Line size={18} /></span>{ui("mMyDocs")}{lock}
              </Link>
            </li>
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); if (!authed) router.push("/login?next=/profile"); }}>
                <span className="mi"><RiBankCardLine size={18} /></span>{ui("mPayments")}{lock}
              </a>
            </li>
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); setLang(lang === "ko" ? "en" : lang === "en" ? "zh" : "ko"); }}>
                <span className="mi"><RiGlobalLine size={18} /></span>{ui("mLang")}
              </a>
            </li>
            <li>
              <a href="#" onClick={(e) => e.preventDefault()}>
                <span className="mi"><RiNotification3Line size={18} /></span>{ui("mNoti")}
              </a>
            </li>
          </ul>
        </div>

        <div className="card">
          <ul className="menu-list">
            <li><Link href="/privacy"><span className="mi"><RiShieldUserLine size={18} /></span>{ui("mPrivacy")}</Link></li>
            <li><Link href="/terms"><span className="mi"><RiFileTextLine size={18} /></span>{ui("mTerms")}</Link></li>
            <li><a href="#" onClick={(e) => e.preventDefault()}><span className="mi"><RiHomeOfficeLine size={18} /></span>{ui("mOffice")}</a></li>
            {authed && (
              <li>
                <a href="#" onClick={(e) => { e.preventDefault(); signOut({ redirectTo: "/" }); }}>
                  <span className="mi"><RiLogoutBoxRLine size={18} /></span>{ui("logout")}
                </a>
              </li>
            )}
          </ul>
        </div>

        <p className="disclaimer">{ui("myDisclaimer")}</p>
      </main>
      <Tabbar />
    </>
  );
}

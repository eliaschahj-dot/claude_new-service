"use client";
// 공통 크롬: 앱바(언어 토글 포함) + 하단 탭바
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n, UIKey } from "@/lib/i18n";

export function Appbar({ titleKey, home = false }: { titleKey?: UIKey; home?: boolean }) {
  const { ui, lang, setLang } = useI18n();
  return (
    <header className="appbar">
      {home ? (
        <span className="logo">K-Visa Assist</span>
      ) : (
        <>
          <Link className="back" href="/">‹</Link>
          <span className="title">{titleKey ? ui(titleKey) : ""}</span>
        </>
      )}
      <button className="lang" onClick={() => setLang(lang === "ko" ? "en" : "ko")}>
        {ui("langLabel")} ▾
      </button>
    </header>
  );
}

const TABS: { href: string; ico: string; key: UIKey }[] = [
  { href: "/", ico: "🏠", key: "tabHome" },
  { href: "/chat", ico: "💬", key: "tabChat" },
  { href: "/documents", ico: "📄", key: "tabDocs" },
  { href: "/status", ico: "📍", key: "tabStatus" },
  { href: "/profile", ico: "👤", key: "tabMy" },
];

export function Tabbar() {
  const { ui } = useI18n();
  const path = usePathname();
  return (
    <nav className="tabbar">
      {TABS.map((tab) => (
        <Link key={tab.href} href={tab.href} className={path === tab.href ? "on" : ""}>
          <span className="ico">{tab.ico}</span>
          {ui(tab.key)}
        </Link>
      ))}
    </nav>
  );
}

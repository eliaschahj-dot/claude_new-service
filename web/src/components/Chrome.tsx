"use client";
// 공통 크롬: 앱바(언어 토글 포함) + 하단 탭바 — 아이콘은 Remix Icon(@remixicon/react)
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n, UIKey } from "@/lib/i18n";
import { Logo } from "./Logo";
import {
  RiArrowLeftSLine,
  RiGlobalLine,
  RiHome5Line, RiHome5Fill,
  RiChatSmile3Line, RiChatSmile3Fill,
  RiFileList3Line, RiFileList3Fill,
  RiTimeLine, RiTimeFill,
  RiUser3Line, RiUser3Fill,
} from "@remixicon/react";
import type { RemixiconComponentType } from "@remixicon/react";

export function Appbar({ titleKey, home = false }: { titleKey?: UIKey; home?: boolean }) {
  const { ui, lang, setLang } = useI18n();
  return (
    <header className="appbar">
      {home ? (
        <span className="logo"><Logo size={26} /> K-Visa Assist</span>
      ) : (
        <>
          <Link className="back" href="/" aria-label="home"><RiArrowLeftSLine size={24} /></Link>
          <span className="title">{titleKey ? ui(titleKey) : ""}</span>
        </>
      )}
      <button className="lang" onClick={() => setLang(lang === "ko" ? "en" : "ko")}>
        <RiGlobalLine size={15} /> {ui("langLabel")}
      </button>
    </header>
  );
}

const TABS: { href: string; ico: RemixiconComponentType; on: RemixiconComponentType; key: UIKey }[] = [
  { href: "/", ico: RiHome5Line, on: RiHome5Fill, key: "tabHome" },
  { href: "/chat", ico: RiChatSmile3Line, on: RiChatSmile3Fill, key: "tabChat" },
  { href: "/documents", ico: RiFileList3Line, on: RiFileList3Fill, key: "tabDocs" },
  { href: "/status", ico: RiTimeLine, on: RiTimeFill, key: "tabStatus" },
  { href: "/profile", ico: RiUser3Line, on: RiUser3Fill, key: "tabMy" },
];

export function Tabbar() {
  const { ui } = useI18n();
  const path = usePathname();
  return (
    <nav className="tabbar">
      {TABS.map((tab) => {
        const active = path === tab.href;
        const Icon = active ? tab.on : tab.ico;
        return (
          <Link key={tab.href} href={tab.href} className={active ? "on" : ""} aria-current={active ? "page" : undefined}>
            <span className="ico"><Icon size={22} /></span>
            {ui(tab.key)}
          </Link>
        );
      })}
    </nav>
  );
}

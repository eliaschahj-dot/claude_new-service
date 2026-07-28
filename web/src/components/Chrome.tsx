"use client";
// 공통 크롬: 앱바(언어 선택 포함) + 하단 탭바 — 아이콘은 Remix Icon(@remixicon/react)
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useI18n, UIKey, Lang } from "@/lib/i18n";
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

const LANGS: { code: Lang; label: string }[] = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
  { code: "zh", label: "中文" },
];

export function Appbar({ titleKey, home = false }: { titleKey?: UIKey; home?: boolean }) {
  const { ui, lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
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
      <span className="lang-wrap">
        <button className="lang" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          <RiGlobalLine size={15} /> {ui("langLabel")}
        </button>
        {open && (
          <span className="lang-menu">
            {LANGS.map((l) => (
              <button key={l.code} className={l.code === lang ? "on" : ""}
                onClick={() => { setLang(l.code); setOpen(false); }}>
                {l.label}
              </button>
            ))}
          </span>
        )}
      </span>
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

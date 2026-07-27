"use client";
// 레이아웃 프레임 — 일반 화면은 모바일 폰 프레임(430px), 관리자(/admin)는 데스크톱 와이드
import { usePathname } from "next/navigation";

export function Frame({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (path?.startsWith("/admin")) {
    return <div className="admin-shell">{children}</div>;
  }
  return <div className="phone">{children}</div>;
}

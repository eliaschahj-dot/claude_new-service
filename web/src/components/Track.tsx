"use client";
// 방문 트래킹 — 페이지 이동 시 페이지뷰 1회, 체류 시간은 30초 하트비트로 집계.
// 관리자 페이지는 집계에서 제외.
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getVisitorId } from "@/lib/visitor";

function send(heartbeat: boolean) {
  try {
    const body = JSON.stringify({ visitorId: getVisitorId(), heartbeat, lang: localStorage.getItem("kva_lang") || undefined });
    fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => null);
  } catch { /* 트래킹 실패는 무시 */ }
}

export function Track() {
  const path = usePathname();

  useEffect(() => {
    if (path?.startsWith("/admin")) return;
    send(false);
  }, [path]);

  useEffect(() => {
    if (path?.startsWith("/admin")) return;
    const iv = setInterval(() => {
      if (document.visibilityState === "visible") send(true);
    }, 30_000);
    return () => clearInterval(iv);
  }, [path]);

  return null;
}

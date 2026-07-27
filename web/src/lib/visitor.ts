"use client";
// 브라우저별 익명 방문자 ID — localStorage에 1회 생성해 유지
export function getVisitorId(): string {
  try {
    let v = localStorage.getItem("kva_visitor");
    if (!v) {
      v = crypto.randomUUID();
      localStorage.setItem("kva_visitor", v);
    }
    return v;
  } catch {
    return "anon";
  }
}

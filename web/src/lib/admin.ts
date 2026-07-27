// 관리자(사무소) 권한 — ADMIN_EMAILS 환경변수의 이메일 화이트리스트로 판별.
// 예: ADMIN_EMAILS=lawyer@office.com,staff@office.com
// 미설정 시 관리자는 없음(안전 기본값).
import { auth } from "./auth";

export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null): boolean {
  return !!email && adminEmails().includes(email.toLowerCase());
}

// 관리자 세션이면 세션을, 아니면 null을 반환 (API 라우트 가드용)
export async function requireAdmin() {
  const session = await auth();
  return isAdminEmail(session?.user?.email) ? session : null;
}

import { getCase, Case } from "./store";
import { auth } from "./auth";

// 케이스는 생성한 사용자만 조회·수정 가능 — 다른 로그인 사용자의 케이스는 404로 감춘다(존재 여부 노출 방지).
export async function loadOwnCase(
  id: string,
): Promise<{ error: 401 | 404; case?: never } | { error?: never; case: Case }> {
  const session = await auth();
  if (!session?.user?.email) return { error: 401 };
  const c = await getCase(id);
  if (!c || c.userId !== session.user.email) return { error: 404 };
  return { case: c };
}

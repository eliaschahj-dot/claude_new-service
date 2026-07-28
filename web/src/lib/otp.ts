// 이메일 인증코드(OTP) 로그인 — 구글 접속이 차단된 지역(중국 등)용 대체 로그인.
// 코드는 해시로만 저장, 10분 유효, 재발송 60초 제한, 검증 5회 제한.
import { createHash, randomInt } from "crypto";
import { hasDb, query } from "./db";

const TTL_MIN = 10;
const RESEND_SEC = 60;
const MAX_ATTEMPTS = 5;

const hash = (email: string, code: string) =>
  createHash("sha256").update(`${email}:${code}:${process.env.AUTH_SECRET ?? ""}`).digest("hex");

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 254;
}

// 코드 생성·저장. 재발송 제한에 걸리면 null 반환.
export async function createLoginCode(emailRaw: string): Promise<string | null> {
  if (!hasDb()) throw new Error("database required for OTP login");
  const email = emailRaw.toLowerCase().trim();
  const recent = await query<{ n: string }>(
    `SELECT COUNT(*) n FROM login_codes WHERE email = $1 AND created_at > now() - interval '${RESEND_SEC} seconds'`,
    [email],
  );
  if (Number(recent[0]?.n ?? 0) > 0) return null;

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await query(
    `INSERT INTO login_codes (email, code_hash, attempts, expires_at, created_at)
     VALUES ($1, $2, 0, now() + interval '${TTL_MIN} minutes', now())
     ON CONFLICT (email) DO UPDATE SET
       code_hash = EXCLUDED.code_hash, attempts = 0,
       expires_at = EXCLUDED.expires_at, created_at = now()`,
    [email, hash(email, code)],
  );
  return code;
}

export async function verifyLoginCode(emailRaw: string, code: string): Promise<boolean> {
  if (!hasDb()) return false;
  const email = emailRaw.toLowerCase().trim();
  const rows = await query<{ code_hash: string; attempts: number; expires_at: Date }>(
    `SELECT code_hash, attempts, expires_at FROM login_codes WHERE email = $1`,
    [email],
  );
  const r = rows[0];
  if (!r) return false;
  if (new Date(r.expires_at).getTime() < Date.now() || r.attempts >= MAX_ATTEMPTS) {
    await query(`DELETE FROM login_codes WHERE email = $1`, [email]);
    return false;
  }
  if (r.code_hash !== hash(email, code.trim())) {
    await query(`UPDATE login_codes SET attempts = attempts + 1 WHERE email = $1`, [email]);
    return false;
  }
  await query(`DELETE FROM login_codes WHERE email = $1`, [email]); // 일회용
  return true;
}

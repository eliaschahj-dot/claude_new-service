import { NextRequest, NextResponse } from "next/server";
import { createLoginCode, isValidEmail } from "@/lib/otp";
import { notifyCustomer } from "@/lib/mailer";

// 인증코드 발송 — 구글 로그인 불가 지역(중국 등)용
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.toLowerCase().trim() : "";
  if (!isValidEmail(email)) return NextResponse.json({ error: "invalid email" }, { status: 400 });

  try {
    const code = await createLoginCode(email);
    // 재발송 제한(60초)에 걸려도 성공처럼 응답 — 이메일 존재 여부·발송 주기 노출 방지
    if (code) {
      await notifyCustomer(
        email,
        "[K-Visa Assist] 로그인 인증코드 / Login code / 登录验证码",
        `<h2 style="margin:0 0 8px">인증코드 / Verification code / 验证码</h2>
         <p style="font-size:32px;font-weight:800;letter-spacing:6px;margin:16px 0">${code}</p>
         <p style="font-size:13px;color:#666">10분간 유효합니다. 본인이 요청하지 않았다면 이 메일을 무시하세요.<br/>
         Valid for 10 minutes. Ignore this email if you didn't request it.<br/>
         10分钟内有效。如非本人操作，请忽略此邮件。</p>`,
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[otp] send failed:", err);
    return NextResponse.json({ error: "send failed" }, { status: 503 });
  }
}

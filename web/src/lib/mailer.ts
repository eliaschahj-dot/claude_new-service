// 관리자 이메일 알림 — SMTP 환경변수 설정 시에만 발송(미설정이면 조용히 건너뜀).
// Gmail 사용 시: SMTP_USER=지메일주소, SMTP_PASS=앱 비밀번호(구글 계정 → 보안 → 2단계 인증 → 앱 비밀번호)
import nodemailer from "nodemailer";
import { adminEmails } from "./admin";

function transport() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: (process.env.SMTP_PORT || "465") === "465",
    auth: { user, pass },
  });
}

// 실패해도 요청 처리를 막지 않는다 — 알림은 부가 기능
export async function notifyAdmins(subject: string, html: string): Promise<void> {
  try {
    const t = transport();
    const to = adminEmails();
    if (!t || to.length === 0) return;
    await t.sendMail({
      from: process.env.MAIL_FROM || `"K-Visa Assist" <${process.env.SMTP_USER}>`,
      to: to.join(", "),
      subject,
      html,
    });
  } catch (err) {
    console.error("[mailer] notify failed:", err);
  }
}

export function caseCreatedMail(c: { id: string; visaCode: string; appKey: string; userId?: string }) {
  const no = c.id.slice(0, 8).toUpperCase();
  return {
    subject: `[K-Visa] 새 신청 케이스 — ${c.visaCode} (${no})`,
    html: `
      <h2 style="margin:0 0 12px">새 신청 케이스가 접수되었습니다</h2>
      <table style="border-collapse:collapse;font-size:14px">
        <tr><td style="padding:4px 12px 4px 0;color:#666">접수번호</td><td><b>${no}</b></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">비자</td><td>${c.visaCode} / ${c.appKey}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">신청인</td><td>${c.userId ?? "(미상)"}</td></tr>
      </table>
      <p style="margin-top:16px"><a href="https://visa-korean.com/admin/cases/${c.id}">관리자 대시보드에서 열기 →</a></p>`,
  };
}

export function fileUploadedMail(c: { id: string; visaCode: string; userId?: string }, f: { filename: string; size: number }) {
  const no = c.id.slice(0, 8).toUpperCase();
  return {
    subject: `[K-Visa] 서류 업로드 — ${c.visaCode} (${no})`,
    html: `
      <h2 style="margin:0 0 12px">신청인이 서류를 업로드했습니다</h2>
      <table style="border-collapse:collapse;font-size:14px">
        <tr><td style="padding:4px 12px 4px 0;color:#666">접수번호</td><td><b>${no}</b> (${c.visaCode})</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">신청인</td><td>${c.userId ?? "(미상)"}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">파일</td><td>${f.filename} (${Math.max(1, Math.round(f.size / 1024))}KB)</td></tr>
      </table>
      <p style="margin-top:16px"><a href="https://visa-korean.com/admin/cases/${c.id}">서류 검토하러 가기 →</a></p>`,
  };
}

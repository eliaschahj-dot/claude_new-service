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

// 고객 → 사무소 새 메시지 알림 (관리자에게)
export function customerMessageMail(c: { id: string; visaCode: string; userId?: string }, body: string) {
  const no = c.id.slice(0, 8).toUpperCase();
  return {
    subject: `[K-Visa] 고객 메시지 — ${c.visaCode} (${no})`,
    html: `
      <h2 style="margin:0 0 12px">고객이 메시지를 보냈습니다</h2>
      <p style="font-size:14px;color:#666;margin:0 0 4px">${c.userId ?? "(미상)"} · 케이스 ${no}</p>
      <blockquote style="margin:12px 0;padding:12px 16px;background:#f4f6fa;border-left:3px solid #1a56db;font-size:14px;white-space:pre-line">${body
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").slice(0, 1000)}</blockquote>
      <p><a href="https://visa-korean.com/admin/cases/${c.id}">대시보드에서 답장하기 →</a></p>`,
  };
}

// 사무소 → 고객 답장 알림 (고객 이메일로)
export async function notifyCustomer(email: string, subject: string, html: string): Promise<void> {
  try {
    const t = transport();
    if (!t || !email) return;
    await t.sendMail({
      from: process.env.MAIL_FROM || `"K-Visa Assist" <${process.env.SMTP_USER}>`,
      to: email,
      subject,
      html,
    });
  } catch (err) {
    console.error("[mailer] notifyCustomer failed:", err);
  }
}

export function adminReplyMail(c: { id: string; visaCode: string }, body: string) {
  const no = c.id.slice(0, 8).toUpperCase();
  return {
    subject: `[K-Visa Assist] 담당 변호사·행정사의 새 메시지 (${no})`,
    html: `
      <h2 style="margin:0 0 12px">담당자가 메시지를 보냈습니다 / New message from your attorney & agent</h2>
      <blockquote style="margin:12px 0;padding:12px 16px;background:#f4f6fa;border-left:3px solid #1a56db;font-size:14px;white-space:pre-line">${body
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").slice(0, 1000)}</blockquote>
      <p style="font-size:14px"><a href="https://visa-korean.com/status">진행 상태 화면에서 확인·답장하기 →</a></p>
      <p style="font-size:12px;color:#999">K-Visa Assist · ${c.visaCode} · Case ${no}</p>`,
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

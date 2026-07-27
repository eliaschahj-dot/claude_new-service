// 케이스 메시지 — 고객(신청인) ↔ 사무소(관리자) 양방향 스레드.
// PostgreSQL 전용(미연결 시 빈 목록/no-op) — 실서비스는 DATABASE_URL 필수.
import { randomUUID } from "crypto";
import { hasDb, query } from "./db";

export type MsgSender = "customer" | "admin";

export interface CaseMessage {
  id: string;
  caseId: string;
  sender: MsgSender;
  senderEmail: string | null;
  body: string;
  createdAt: string;
}

interface Row {
  id: string;
  case_id: string;
  sender: MsgSender;
  sender_email: string | null;
  body: string;
  created_at: Date;
}

const rowToMsg = (r: Row): CaseMessage => ({
  id: r.id,
  caseId: r.case_id,
  sender: r.sender,
  senderEmail: r.sender_email,
  body: r.body,
  createdAt: new Date(r.created_at).toISOString(),
});

export async function listMessages(caseId: string): Promise<CaseMessage[]> {
  if (!hasDb()) return [];
  const rows = await query<Row>(
    `SELECT * FROM case_messages WHERE case_id = $1 ORDER BY created_at ASC LIMIT 500`,
    [caseId],
  );
  return rows.map(rowToMsg);
}

export async function addMessage(input: {
  caseId: string;
  sender: MsgSender;
  senderEmail?: string | null;
  body: string;
}): Promise<CaseMessage | null> {
  if (!hasDb()) return null;
  const body = input.body.trim().slice(0, 4000);
  if (!body) return null;
  const rows = await query<Row>(
    `INSERT INTO case_messages (id, case_id, sender, sender_email, body)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [randomUUID(), input.caseId, input.sender, input.senderEmail ?? null, body],
  );
  return rows[0] ? rowToMsg(rows[0]) : null;
}

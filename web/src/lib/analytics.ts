// 방문 트래킹 + 상담 대화 저장 — PostgreSQL 전용(모니터링은 실서비스 기능).
// DATABASE_URL 미설정(로컬 파일 모드)에서는 조용히 no-op.
import { randomUUID } from "crypto";
import { hasDb, query } from "./db";

// 같은 방문자의 마지막 활동이 30분 이내면 같은 방문(세션)으로 본다
const SESSION_GAP_MIN = 30;

export interface ConversationMeta {
  id: string;
  visitorId: string | null;
  userId: string | null;
  lang: string | null;
  msgCount: number;
  firstQuestion: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export async function recordVisit(input: {
  visitorId: string;
  userId?: string | null;
  ua?: string | null;
  lang?: string | null;
  heartbeat?: boolean;
}): Promise<void> {
  if (!hasDb()) return;
  const rows = await query<{ id: string }>(
    `SELECT id FROM visits
      WHERE visitor_id = $1 AND last_seen > now() - interval '${SESSION_GAP_MIN} minutes'
      ORDER BY last_seen DESC LIMIT 1`,
    [input.visitorId],
  );
  if (rows[0]) {
    await query(
      `UPDATE visits SET last_seen = now(),
              pageviews = pageviews + $2,
              user_id = COALESCE($3, user_id)
        WHERE id = $1`,
      [rows[0].id, input.heartbeat ? 0 : 1, input.userId ?? null],
    );
    return;
  }
  await query(
    `INSERT INTO visits (id, visitor_id, user_id, ua, lang) VALUES ($1, $2, $3, $4, $5)`,
    [randomUUID(), input.visitorId, input.userId ?? null, (input.ua ?? "").slice(0, 300), input.lang ?? null],
  );
}

// 대화 upsert — 클라이언트가 전체 대화를 보내면 통째로 교체(최신 상태 유지)
export async function upsertConversation(input: {
  id?: string | null;
  visitorId: string;
  userId?: string | null;
  lang?: string | null;
  messages: ChatTurn[];
}): Promise<string | null> {
  if (!hasDb()) return null;
  const msgs = input.messages
    .slice(-80)
    .map((m) => ({ role: m.role, content: String(m.content).slice(0, 4000) }));
  const id = input.id || randomUUID();
  await query(
    `INSERT INTO conversations (id, visitor_id, user_id, lang, messages, msg_count)
     VALUES ($1, $2, $3, $4, $5::jsonb, $6)
     ON CONFLICT (id) DO UPDATE SET
       messages = EXCLUDED.messages,
       msg_count = EXCLUDED.msg_count,
       user_id = COALESCE(EXCLUDED.user_id, conversations.user_id),
       lang = COALESCE(EXCLUDED.lang, conversations.lang),
       updated_at = now()`,
    [id, input.visitorId, input.userId ?? null, input.lang ?? null, JSON.stringify(msgs), msgs.length],
  );
  return id;
}

interface ConvRow {
  id: string;
  visitor_id: string | null;
  user_id: string | null;
  lang: string | null;
  msg_count: number;
  messages: ChatTurn[];
  created_at: Date;
  updated_at: Date;
}

function firstQuestion(messages: ChatTurn[]): string {
  const q = messages.find((m) => m.role === "user");
  return q ? q.content.slice(0, 120) : "";
}

export async function listConversations(opts: { userId?: string; limit?: number } = {}): Promise<ConversationMeta[]> {
  if (!hasDb()) return [];
  const limit = Math.min(opts.limit ?? 50, 200);
  const rows = opts.userId
    ? await query<ConvRow>(
        `SELECT * FROM conversations WHERE user_id = $1 ORDER BY updated_at DESC LIMIT ${limit}`,
        [opts.userId],
      )
    : await query<ConvRow>(`SELECT * FROM conversations ORDER BY updated_at DESC LIMIT ${limit}`);
  return rows.map((r) => ({
    id: r.id,
    visitorId: r.visitor_id,
    userId: r.user_id,
    lang: r.lang,
    msgCount: r.msg_count,
    firstQuestion: firstQuestion(r.messages ?? []),
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
  }));
}

export async function getConversation(id: string): Promise<(ConversationMeta & { messages: ChatTurn[] }) | null> {
  if (!hasDb()) return null;
  const rows = await query<ConvRow>(`SELECT * FROM conversations WHERE id = $1`, [id]);
  if (!rows[0]) return null;
  const r = rows[0];
  return {
    id: r.id,
    visitorId: r.visitor_id,
    userId: r.user_id,
    lang: r.lang,
    msgCount: r.msg_count,
    firstQuestion: firstQuestion(r.messages ?? []),
    messages: r.messages ?? [],
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
  };
}

export interface Overview {
  visitors24h: number;
  visitors7d: number;
  avgDurationSec24h: number;
  pageviews24h: number;
  conversations24h: number;
  conversations7d: number;
}

export async function overviewStats(): Promise<Overview> {
  if (!hasDb()) {
    return { visitors24h: 0, visitors7d: 0, avgDurationSec24h: 0, pageviews24h: 0, conversations24h: 0, conversations7d: 0 };
  }
  const [v24, v7, dur, pv, c24, c7] = await Promise.all([
    query<{ n: string }>(`SELECT COUNT(DISTINCT visitor_id) n FROM visits WHERE last_seen > now() - interval '24 hours'`),
    query<{ n: string }>(`SELECT COUNT(DISTINCT visitor_id) n FROM visits WHERE last_seen > now() - interval '7 days'`),
    query<{ n: string | null }>(
      `SELECT COALESCE(AVG(EXTRACT(EPOCH FROM last_seen - first_seen)), 0) n
         FROM visits WHERE last_seen > now() - interval '24 hours'`,
    ),
    query<{ n: string }>(`SELECT COALESCE(SUM(pageviews), 0) n FROM visits WHERE last_seen > now() - interval '24 hours'`),
    query<{ n: string }>(`SELECT COUNT(*) n FROM conversations WHERE updated_at > now() - interval '24 hours'`),
    query<{ n: string }>(`SELECT COUNT(*) n FROM conversations WHERE updated_at > now() - interval '7 days'`),
  ]);
  return {
    visitors24h: Number(v24[0]?.n ?? 0),
    visitors7d: Number(v7[0]?.n ?? 0),
    avgDurationSec24h: Math.round(Number(dur[0]?.n ?? 0)),
    pageviews24h: Number(pv[0]?.n ?? 0),
    conversations24h: Number(c24[0]?.n ?? 0),
    conversations7d: Number(c7[0]?.n ?? 0),
  };
}

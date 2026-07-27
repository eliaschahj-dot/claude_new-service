// 케이스 저장소 — DATABASE_URL 설정 시 PostgreSQL, 미설정 시 개발용 파일 스토어.
// 인터페이스는 동일하므로 호출부(API 라우트)는 저장 방식을 몰라도 된다.
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { hasDb, query } from "./db";

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");

export type DocStatus = "none" | "uploaded" | "approved" | "rejected";

export interface Case {
  id: string;
  visaCode: string;
  appKey: string;
  stage: "consult" | "docs" | "review" | "filed" | "decided";
  lang: string;
  userId?: string; // 로그인 사용자(email) 귀속
  docStatus: Record<string, DocStatus>;
  createdAt: string;
  updatedAt: string;
}

// ---------- PostgreSQL 경로 ----------

interface CaseRow {
  id: string;
  visa_code: string;
  app_key: string;
  stage: string;
  lang: string;
  user_id: string | null;
  doc_status: Record<string, DocStatus>;
  created_at: Date;
  updated_at: Date;
}

function rowToCase(r: CaseRow): Case {
  return {
    id: r.id,
    visaCode: r.visa_code,
    appKey: r.app_key,
    stage: r.stage as Case["stage"],
    lang: r.lang,
    userId: r.user_id ?? undefined,
    docStatus: r.doc_status ?? {},
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
  };
}

// ---------- 파일 스토어 경로 (로컬 개발 폴백) ----------

interface DbShape {
  cases: Case[];
}

async function readFileDb(): Promise<DbShape> {
  try {
    return JSON.parse(await fs.readFile(DB_FILE, "utf8"));
  } catch {
    return { cases: [] };
  }
}

async function writeFileDb(db: DbShape): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));
}

// ---------- 공개 인터페이스 ----------

export async function createCase(input: {
  visaCode: string;
  appKey: string;
  lang?: string;
  userId?: string;
}): Promise<Case> {
  const now = new Date().toISOString();
  const c: Case = {
    id: randomUUID(),
    visaCode: input.visaCode,
    appKey: input.appKey,
    stage: "docs",
    lang: input.lang ?? "en",
    userId: input.userId,
    docStatus: {},
    createdAt: now,
    updatedAt: now,
  };

  if (hasDb()) {
    await query(
      `INSERT INTO cases (id, visa_code, app_key, stage, lang, user_id, doc_status)
       VALUES ($1, $2, $3, $4, $5, $6, '{}'::jsonb)`,
      [c.id, c.visaCode, c.appKey, c.stage, c.lang, c.userId ?? null],
    );
    return c;
  }

  const db = await readFileDb();
  db.cases.push(c);
  await writeFileDb(db);
  return c;
}

export async function getCase(id: string): Promise<Case | undefined> {
  if (hasDb()) {
    const rows = await query<CaseRow>(`SELECT * FROM cases WHERE id = $1`, [id]);
    return rows[0] ? rowToCase(rows[0]) : undefined;
  }
  const db = await readFileDb();
  return db.cases.find((c) => c.id === id);
}

export async function listCasesByUser(userId: string): Promise<Case[]> {
  if (hasDb()) {
    const rows = await query<CaseRow>(
      `SELECT * FROM cases WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId],
    );
    return rows.map(rowToCase);
  }
  const db = await readFileDb();
  return db.cases
    .filter((c) => c.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// 관리자용 — 전체 케이스 최신순
export async function listAllCases(): Promise<Case[]> {
  if (hasDb()) {
    const rows = await query<CaseRow>(`SELECT * FROM cases ORDER BY created_at DESC`);
    return rows.map(rowToCase);
  }
  const db = await readFileDb();
  return [...db.cases].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function updateStage(id: string, stage: Case["stage"]): Promise<Case | undefined> {
  if (hasDb()) {
    const rows = await query<CaseRow>(
      `UPDATE cases SET stage = $2, updated_at = now() WHERE id = $1 RETURNING *`,
      [id, stage],
    );
    return rows[0] ? rowToCase(rows[0]) : undefined;
  }
  const db = await readFileDb();
  const c = db.cases.find((x) => x.id === id);
  if (!c) return undefined;
  c.stage = stage;
  c.updatedAt = new Date().toISOString();
  await writeFileDb(db);
  return c;
}

export async function updateDocStatus(
  id: string,
  docId: string,
  status: DocStatus,
): Promise<Case | undefined> {
  if (hasDb()) {
    const rows = await query<CaseRow>(
      `UPDATE cases
         SET doc_status = jsonb_set(doc_status, ARRAY[$2], to_jsonb($3::text)),
             updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [id, docId, status],
    );
    return rows[0] ? rowToCase(rows[0]) : undefined;
  }

  const db = await readFileDb();
  const c = db.cases.find((x) => x.id === id);
  if (!c) return undefined;
  c.docStatus[docId] = status;
  c.updatedAt = new Date().toISOString();
  await writeFileDb(db);
  return c;
}

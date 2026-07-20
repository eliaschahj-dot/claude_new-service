// 케이스 저장소 — MVP 개발용 파일 기반 JSON 스토어.
// 프로덕션에서는 PostgreSQL(SERVICE_SPEC §6 데이터 모델)로 교체.
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");

export type DocStatus = "none" | "uploaded" | "approved" | "rejected";

export interface Case {
  id: string;
  visaCode: string;
  appKey: string;
  stage: "consult" | "docs" | "review" | "filed" | "decided";
  lang: string;
  userId?: string; // 로그인 사용자(email) 귀속 — 비로그인 데모 케이스는 없음
  docStatus: Record<string, DocStatus>;
  createdAt: string;
  updatedAt: string;
}

interface DbShape {
  cases: Case[];
}

async function readDb(): Promise<DbShape> {
  try {
    return JSON.parse(await fs.readFile(DB_FILE, "utf8"));
  } catch {
    return { cases: [] };
  }
}

async function writeDb(db: DbShape): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));
}

export async function createCase(input: { visaCode: string; appKey: string; lang?: string; userId?: string }): Promise<Case> {
  const db = await readDb();
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
  db.cases.push(c);
  await writeDb(db);
  return c;
}

export async function getCase(id: string): Promise<Case | undefined> {
  const db = await readDb();
  return db.cases.find((c) => c.id === id);
}

export async function updateDocStatus(id: string, docId: string, status: DocStatus): Promise<Case | undefined> {
  const db = await readDb();
  const c = db.cases.find((x) => x.id === id);
  if (!c) return undefined;
  c.docStatus[docId] = status;
  c.updatedAt = new Date().toISOString();
  await writeDb(db);
  return c;
}

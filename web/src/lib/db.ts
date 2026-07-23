// PostgreSQL 연결 — DATABASE_URL(또는 POSTGRES_URL) 설정 시에만 사용.
// Neon/Supabase/Vercel Postgres 등 어떤 Postgres든 URL만 넣으면 동작한다.
import { Pool } from "pg";

let pool: Pool | null = null;
let schemaReady: Promise<void> | null = null;

export function dbUrl(): string | undefined {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL;
}

export function hasDb(): boolean {
  return Boolean(dbUrl());
}

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: dbUrl(),
      max: 5,
      // Neon/Supabase 등 관리형 Postgres는 TLS 필수 (로컬 개발 DB는 sslmode=disable로 URL에서 제어)
      ssl: dbUrl()!.includes("sslmode=disable") ? undefined : { rejectUnauthorized: false },
    });
  }
  return pool;
}

async function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = getPool()
      .query(
        `CREATE TABLE IF NOT EXISTS cases (
           id         uuid PRIMARY KEY,
           visa_code  text NOT NULL,
           app_key    text NOT NULL,
           stage      text NOT NULL DEFAULT 'docs',
           lang       text NOT NULL DEFAULT 'en',
           user_id    text,
           doc_status jsonb NOT NULL DEFAULT '{}'::jsonb,
           created_at timestamptz NOT NULL DEFAULT now(),
           updated_at timestamptz NOT NULL DEFAULT now()
         );
         CREATE INDEX IF NOT EXISTS cases_user_id_idx ON cases (user_id);
         CREATE TABLE IF NOT EXISTS case_files (
           id          uuid PRIMARY KEY,
           case_id     uuid NOT NULL REFERENCES cases (id) ON DELETE CASCADE,
           doc_id      text NOT NULL,
           filename    text NOT NULL,
           mime        text NOT NULL,
           size_bytes  integer NOT NULL,
           data        bytea NOT NULL,
           uploaded_at timestamptz NOT NULL DEFAULT now()
         );
         CREATE INDEX IF NOT EXISTS case_files_case_id_idx ON case_files (case_id);`,
      )
      .then(() => undefined)
      .catch((err) => {
        schemaReady = null; // 실패 시 다음 요청에서 재시도
        throw err;
      });
  }
  return schemaReady;
}

export async function query<R = Record<string, unknown>>(
  text: string,
  params?: unknown[],
): Promise<R[]> {
  await ensureSchema();
  const res = await getPool().query(text, params);
  return res.rows as R[];
}

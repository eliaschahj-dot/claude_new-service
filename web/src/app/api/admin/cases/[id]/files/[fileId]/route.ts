import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getFile } from "@/lib/files";

type Params = { params: Promise<{ id: string; fileId: string }> };

// 관리자 서류 열람 — 소유자 검사 대신 관리자 권한으로 접근
export async function GET(_req: NextRequest, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id, fileId } = await params;
  const found = await getFile(id, fileId);
  if (!found) return NextResponse.json({ error: "not found" }, { status: 404 });
  return new NextResponse(new Uint8Array(found.data), {
    headers: {
      "Content-Type": found.meta.mime,
      "Content-Length": String(found.meta.size),
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(found.meta.filename)}`,
      "Cache-Control": "private, no-store",
    },
  });
}

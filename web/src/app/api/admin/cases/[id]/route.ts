import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getCase, updateDocStatus, updateStage, DocStatus, Case } from "@/lib/store";
import { listFiles } from "@/lib/files";

type Params = { params: Promise<{ id: string }> };

const VALID_STATUS: DocStatus[] = ["none", "uploaded", "approved", "rejected"];
const VALID_STAGE: Case["stage"][] = ["consult", "docs", "review", "filed", "decided"];

export async function GET(_req: NextRequest, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id } = await params;
  const c = await getCase(id);
  if (!c) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ case: c, files: await listFiles(id) });
}

// 서류 상태(승인/반려) 또는 진행 단계 변경
export async function PATCH(req: NextRequest, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id } = await params;
  const body = await req.json().catch(() => null);

  if (body?.docId && VALID_STATUS.includes(body?.docStatus)) {
    const c = await updateDocStatus(id, body.docId, body.docStatus);
    if (!c) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(c);
  }
  if (VALID_STAGE.includes(body?.stage)) {
    const c = await updateStage(id, body.stage);
    if (!c) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(c);
  }
  return NextResponse.json({ error: "docId+docStatus or stage required" }, { status: 400 });
}

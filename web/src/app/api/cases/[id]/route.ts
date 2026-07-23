import { NextRequest, NextResponse } from "next/server";
import { getCase, updateDocStatus, DocStatus } from "@/lib/store";
import { auth } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

// 케이스는 생성한 사용자만 조회·수정 가능 — 다른 로그인 사용자의 케이스는 404로 감춘다(존재 여부 노출 방지).
async function loadOwnCase(id: string) {
  const session = await auth();
  if (!session?.user?.email) return { error: 401 as const };
  const c = await getCase(id);
  if (!c || c.userId !== session.user.email) return { error: 404 as const };
  return { case: c };
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const result = await loadOwnCase(id);
  if (result.error) return NextResponse.json({ error: "not found" }, { status: result.error });
  return NextResponse.json(result.case);
}

const VALID_STATUS: DocStatus[] = ["none", "uploaded", "approved", "rejected"];

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const result = await loadOwnCase(id);
  if (result.error) return NextResponse.json({ error: "not found" }, { status: result.error });

  const body = await req.json().catch(() => null);
  if (!body?.docId || !VALID_STATUS.includes(body?.status)) {
    return NextResponse.json({ error: "docId and valid status are required" }, { status: 400 });
  }
  const c = await updateDocStatus(id, body.docId, body.status);
  if (!c) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(c);
}

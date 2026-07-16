import { NextRequest, NextResponse } from "next/server";
import { getCase, updateDocStatus, DocStatus } from "@/lib/store";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const c = await getCase(id);
  if (!c) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(c);
}

const VALID_STATUS: DocStatus[] = ["none", "uploaded", "approved", "rejected"];

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body?.docId || !VALID_STATUS.includes(body?.status)) {
    return NextResponse.json({ error: "docId and valid status are required" }, { status: 400 });
  }
  const c = await updateDocStatus(id, body.docId, body.status);
  if (!c) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(c);
}

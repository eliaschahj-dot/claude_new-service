import { NextRequest, NextResponse } from "next/server";
import { loadOwnCase } from "@/lib/own-case";
import { getFile } from "@/lib/files";

type Params = { params: Promise<{ id: string; fileId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id, fileId } = await params;
  const result = await loadOwnCase(id);
  if (result.error) return NextResponse.json({ error: "not found" }, { status: result.error });

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

import { NextRequest, NextResponse } from "next/server";
import { loadOwnCase } from "@/lib/own-case";
import { updateDocStatus } from "@/lib/store";
import { saveFile, listFiles, MAX_FILE_BYTES, isAllowedType } from "@/lib/files";
import { notifyAdmins, fileUploadedMail } from "@/lib/mailer";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const result = await loadOwnCase(id);
  if (result.error) return NextResponse.json({ error: "not found" }, { status: result.error });
  return NextResponse.json(await listFiles(id));
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const result = await loadOwnCase(id);
  if (result.error) return NextResponse.json({ error: "not found" }, { status: result.error });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const docId = form?.get("docId");
  if (!(file instanceof File) || typeof docId !== "string" || !docId) {
    return NextResponse.json({ error: "file and docId are required" }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: `file too large (max ${MAX_FILE_BYTES / 1024 / 1024}MB)` },
      { status: 413 },
    );
  }
  if (!isAllowedType(file.type, file.name)) {
    return NextResponse.json(
      { error: "only PDF or image files (jpg, png, webp, heic) are accepted" },
      { status: 415 },
    );
  }

  const data = Buffer.from(await file.arrayBuffer());
  const meta = await saveFile({
    caseId: id,
    docId,
    filename: file.name,
    mime: file.type,
    data,
  });
  const updated = await updateDocStatus(id, docId, "uploaded");
  const c = result.case;
  const mail = fileUploadedMail({ id, visaCode: c.visaCode, userId: c.userId }, { filename: meta.filename, size: meta.size });
  await notifyAdmins(mail.subject, mail.html);
  return NextResponse.json({ file: meta, case: updated });
}

import { NextRequest, NextResponse } from "next/server";
import { loadOwnCase } from "@/lib/own-case";
import { listMessages, addMessage } from "@/lib/messages";
import { notifyAdmins, customerMessageMail } from "@/lib/mailer";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const result = await loadOwnCase(id);
  if (result.error) return NextResponse.json({ error: "not found" }, { status: result.error });
  return NextResponse.json(await listMessages(id));
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const result = await loadOwnCase(id);
  if (result.error) return NextResponse.json({ error: "not found" }, { status: result.error });

  const body = await req.json().catch(() => null);
  if (typeof body?.body !== "string" || !body.body.trim()) {
    return NextResponse.json({ error: "body is required" }, { status: 400 });
  }
  const msg = await addMessage({
    caseId: id,
    sender: "customer",
    senderEmail: result.case.userId,
    body: body.body,
  });
  if (!msg) return NextResponse.json({ error: "messaging unavailable" }, { status: 503 });

  const mail = customerMessageMail(
    { id, visaCode: result.case.visaCode, userId: result.case.userId },
    msg.body,
  );
  await notifyAdmins(mail.subject, mail.html);
  return NextResponse.json(msg, { status: 201 });
}

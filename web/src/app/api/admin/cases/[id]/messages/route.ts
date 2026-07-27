import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getCase } from "@/lib/store";
import { listMessages, addMessage } from "@/lib/messages";
import { notifyCustomer, adminReplyMail } from "@/lib/mailer";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id } = await params;
  return NextResponse.json(await listMessages(id));
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id } = await params;
  const c = await getCase(id);
  if (!c) return NextResponse.json({ error: "not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  if (typeof body?.body !== "string" || !body.body.trim()) {
    return NextResponse.json({ error: "body is required" }, { status: 400 });
  }
  const msg = await addMessage({
    caseId: id,
    sender: "admin",
    senderEmail: session.user?.email ?? null,
    body: body.body,
  });
  if (!msg) return NextResponse.json({ error: "messaging unavailable" }, { status: 503 });

  // 고객에게 이메일로도 알림 (사이트에 안 들어와 있어도 확인 가능)
  if (c.userId) {
    const mail = adminReplyMail({ id, visaCode: c.visaCode }, msg.body);
    await notifyCustomer(c.userId, mail.subject, mail.html);
  }
  return NextResponse.json(msg, { status: 201 });
}

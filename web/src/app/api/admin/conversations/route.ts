import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { listConversations } from "@/lib/analytics";

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const userId = req.nextUrl.searchParams.get("user") ?? undefined;
  return NextResponse.json(await listConversations({ userId, limit: 100 }));
}

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { overviewStats } from "@/lib/analytics";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  return NextResponse.json(await overviewStats());
}

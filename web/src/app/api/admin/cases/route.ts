import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { listAllCases } from "@/lib/store";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  return NextResponse.json(await listAllCases());
}

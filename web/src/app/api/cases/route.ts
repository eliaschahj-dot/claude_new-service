import { NextRequest, NextResponse } from "next/server";
import { createCase } from "@/lib/store";
import { VISAS } from "@/lib/visa-db";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.visaCode || !body?.appKey) {
    return NextResponse.json({ error: "visaCode and appKey are required" }, { status: 400 });
  }
  const visa = VISAS[body.visaCode];
  if (!visa || !visa.applications[body.appKey]) {
    return NextResponse.json({ error: "unknown visa or application type" }, { status: 400 });
  }
  const c = await createCase({ visaCode: body.visaCode, appKey: body.appKey, lang: body.lang });
  return NextResponse.json(c, { status: 201 });
}

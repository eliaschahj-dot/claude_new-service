import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { CHAT_MODEL, SYSTEM_PROMPT, RECOMMEND_VISA_TOOL } from "@/lib/ai";
import { VISAS } from "@/lib/visa-db";

export const maxDuration = 60;

const client = new Anthropic();

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface ChatReply {
  reply: string;
  recommendation?: { visaCode: string; applicationKey: string; reason: string };
}

const MAX_TURNS = 40;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const turns: ChatTurn[] = body?.messages;
  if (!Array.isArray(turns) || turns.length === 0 || turns.length > MAX_TURNS) {
    return NextResponse.json({ error: "messages array required" }, { status: 400 });
  }

  const messages: Anthropic.MessageParam[] = turns.map((t) => ({
    role: t.role === "assistant" ? "assistant" : "user",
    content: String(t.content).slice(0, 4000),
  }));

  try {
    const response = await client.messages.create({
      model: CHAT_MODEL,
      max_tokens: 8192,
      thinking: { type: "adaptive" },
      output_config: { effort: "medium" },
      // 지식베이스가 담긴 시스템 프롬프트는 고정 프리픽스 — 캐시로 재사용
      system: [
        { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
      ],
      tools: [RECOMMEND_VISA_TOOL],
      messages,
    });

    if (response.stop_reason === "refusal") {
      return NextResponse.json<ChatReply>({
        reply:
          "I can't help with that request. For anything sensitive, our attorney can review it directly — would you like me to connect you?",
      });
    }

    let reply = "";
    let recommendation: ChatReply["recommendation"];

    for (const block of response.content) {
      if (block.type === "text") {
        reply += block.text;
      } else if (block.type === "tool_use" && block.name === "recommend_visa") {
        const input = block.input as { visaCode: string; applicationKey: string; reason: string };
        // 지식베이스에 실재하는 조합만 카드로 렌더 (환각 방어)
        if (VISAS[input.visaCode]?.applications[input.applicationKey]) {
          recommendation = input;
        }
      }
    }

    return NextResponse.json<ChatReply>({ reply: reply.trim(), recommendation });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "busy", retryable: true }, { status: 503 });
    }
    if (err instanceof Anthropic.AuthenticationError) {
      console.error("Anthropic auth failed — check ANTHROPIC_API_KEY");
      return NextResponse.json({ error: "config" }, { status: 500 });
    }
    if (err instanceof Anthropic.APIConnectionError) {
      return NextResponse.json({ error: "network", retryable: true }, { status: 503 });
    }
    if (err instanceof Anthropic.APIError) {
      console.error("Anthropic API error", err.status, err.message);
      return NextResponse.json({ error: "upstream" }, { status: 502 });
    }
    throw err;
  }
}

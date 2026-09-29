import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/chat-prompt";
import { profile } from "@/lib/data";

export const runtime = "nodejs";
export const maxDuration = 30;

const MODEL = "claude-opus-5";
const MAX_HISTORY = 12; // messages sent to the model (6 exchanges)
const MAX_USER_CHARS = 600;
const MAX_ASSISTANT_CHARS = 3000;

// Best-effort abuse limits. Serverless instances don't share memory, so these slow a single
// abuser rather than guarantee a global cap — set a monthly spend limit in the Anthropic Console too.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 20;
const DAILY_CAP = Number(process.env.CHAT_DAILY_LIMIT || 400);
const hits = new Map<string, number[]>();
let day = "";
let dayCount = 0;

function limited(ip: string): string | null {
  const now = Date.now();
  const today = new Date(now).toISOString().slice(0, 10);
  if (today !== day) {
    day = today;
    dayCount = 0;
  }
  if (dayCount >= DAILY_CAP) return "The assistant has answered a lot of questions today. Please email me instead.";
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) return "You're asking faster than I can keep up. Please try again in a few minutes.";
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  dayCount++;
  return null;
}

type Parsed = { messages: Anthropic.Beta.BetaMessageParam[] } | { error: string };

function parseHistory(body: unknown): Parsed {
  const invalid = { error: "Invalid request." };
  const raw = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(raw) || raw.length === 0) return invalid;
  const messages = raw.slice(-MAX_HISTORY);
  const out: Anthropic.Beta.BetaMessageParam[] = [];
  for (const m of messages) {
    const role = (m as { role?: unknown }).role;
    const content = (m as { content?: unknown }).content;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return invalid;
    const text = content.trim();
    if (!text) return invalid;
    if (role === "user" && text.length > MAX_USER_CHARS) return { error: `Please keep questions under ${MAX_USER_CHARS} characters.` };
    out.push({ role, content: text.slice(0, MAX_ASSISTANT_CHARS) });
  }
  // Must start and end with the visitor, and alternate in between.
  while (out.length && out[0].role !== "user") out.shift();
  if (!out.length || out[out.length - 1].role !== "user") return invalid;
  for (let i = 1; i < out.length; i++) if (out[i].role === out[i - 1].role) return invalid;
  return { messages: out };
}

const fallbackNote = (text: string) => `\n\n_${text}_`;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: `The assistant is offline right now. Email ${profile.email} instead.` }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = parseHistory(body);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const { messages } = parsed;

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limit = limited(ip);
  if (limit) return NextResponse.json({ error: limit }, { status: 429 });

  const client = new Anthropic({ maxRetries: 1, timeout: 25_000 });
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (text: string) => controller.enqueue(encoder.encode(text));
      let wrote = false;
      try {
        const response = client.beta.messages.stream(
          {
            model: MODEL,
            // Short answers by design; the headroom covers adaptive thinking at low effort.
            max_tokens: 2048,
            output_config: { effort: "low" },
            // If a safety classifier declines, the API retries on Anthropic's recommended fallback model.
            betas: ["server-side-fallback-2026-07-01"],
            fallbacks: "default",
            system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
            messages,
          },
          { signal: req.signal },
        );

        for await (const event of response) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            send(event.delta.text);
            wrote = true;
          }
        }

        const final = await response.finalMessage();
        if (final.stop_reason === "refusal") {
          send(fallbackNote(`I can't help with that one. Ask me about ${profile.firstName}'s work, or use the quote form.`));
        } else if (final.stop_reason === "max_tokens") {
          send(wrote ? " …" : fallbackNote("That answer ran long. Try a narrower question."));
        } else if (!wrote) {
          send(`Sorry, I don't have an answer for that. You can email ${profile.email}.`);
        }
      } catch (err) {
        if (req.signal.aborted) return controller.close();
        let message = "Sorry, I hit a snag. Please try again in a moment.";
        if (err instanceof Anthropic.RateLimitError) message = "I'm getting a lot of questions right now. Please try again in a minute.";
        else if (err instanceof Anthropic.AuthenticationError) message = `The assistant is offline right now. Email ${profile.email} instead.`;
        else if (err instanceof Anthropic.APIError) console.error("[chat] API error", err.status, err.message);
        else console.error("[chat] unexpected error", err);
        send(wrote ? fallbackNote(message) : message);
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}

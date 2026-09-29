import { NextResponse } from "next/server";
import { profile, whatsappLink } from "@/lib/data";
import { validateQuote, type QuoteInput } from "@/lib/quote";

export const runtime = "nodejs";

// Best-effort limit per IP. Serverless instances don't share memory, so this
// slows down a single abuser rather than guaranteeing a global cap.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 3;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

const escape = (v: string) =>
  v.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function emailHtml(q: QuoteInput, ip: string) {
  const row = (label: string, value: string) =>
    `<tr><td style="padding:8px 12px;color:#6b7280;font:13px system-ui;white-space:nowrap;vertical-align:top">${label}</td><td style="padding:8px 12px;color:#111827;font:14px system-ui">${value}</td></tr>`;
  return `<!doctype html><html><body style="margin:0;padding:24px;background:#f4f5f8">
  <table role="presentation" style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;border-collapse:separate;overflow:hidden">
    <tr><td colspan="2" style="padding:20px 24px;background:#05060a;color:#eef0f6;font:600 18px system-ui">New quote request — ${escape(q.projectType)}</td></tr>
    ${row("Name", escape(q.name))}
    ${row("Email", `<a href="mailto:${escape(q.email)}">${escape(q.email)}</a>`)}
    ${q.company ? row("Company", escape(q.company)) : ""}
    ${row("Project", escape(q.projectType))}
    ${row("Budget", escape(q.budget))}
    ${row("Timeline", escape(q.timeline))}
    <tr><td colspan="2" style="padding:16px 24px;color:#111827;font:14px/1.6 system-ui;white-space:pre-wrap;border-top:1px solid #e5e7eb">${escape(q.message)}</td></tr>
    <tr><td colspan="2" style="padding:12px 24px;color:#9ca3af;font:12px system-ui;border-top:1px solid #e5e7eb">Sent from your portfolio's quote form · IP ${escape(ip)} · Reply to this email to answer ${escape(q.name)} directly.</td></tr>
  </table></body></html>`;
}

function emailText(q: QuoteInput) {
  return [
    `New quote request — ${q.projectType}`,
    "",
    `Name: ${q.name}`,
    `Email: ${q.email}`,
    q.company ? `Company: ${q.company}` : null,
    `Budget: ${q.budget}`,
    `Timeline: ${q.timeline}`,
    "",
    q.message,
  ]
    .filter((l) => l !== null)
    .join("\n");
}

// Confirmation sent to the visitor. Resend only delivers to other people from a verified
// domain, so this runs only once QUOTE_FROM_EMAIL is set to an address on that domain.
function autoReplyHtml(q: QuoteInput) {
  return `<!doctype html><html><body style="margin:0;padding:24px;background:#f4f5f8;font:15px/1.6 system-ui;color:#111827">
  <table role="presentation" style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;border-collapse:separate">
    <tr><td style="padding:28px 28px 8px">
      <p style="margin:0 0 16px">Hi ${escape(q.name.split(" ")[0])},</p>
      <p style="margin:0 0 16px">Thanks for your quote request for <strong>${escape(q.projectType.toLowerCase())}</strong>. I read every request myself and will reply with questions or a quote.</p>
      <p style="margin:0 0 16px">If it&#39;s urgent, message me on <a href="${whatsappLink}" style="color:#6d5dfc">WhatsApp</a>.</p>
      <p style="margin:0 0 24px">— ${escape(profile.name)}<br><span style="color:#6b7280">${escape(profile.role)}</span></p>
    </td></tr>
    <tr><td style="padding:16px 28px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:13px">
      Your message: “${escape(q.message.length > 280 ? q.message.slice(0, 280) + "…" : q.message)}”
    </td></tr>
  </table></body></html>`;
}

async function sendAutoReply(apiKey: string, q: QuoteInput) {
  const from = process.env.QUOTE_FROM_EMAIL;
  if (!from || from.includes("resend.dev")) return;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [q.email],
      reply_to: process.env.QUOTE_TO_EMAIL || profile.email,
      subject: `Got your request, ${q.name.split(" ")[0]} — ${profile.name}`,
      html: autoReplyHtml(q),
      text: `Hi ${q.name.split(" ")[0]},

Thanks for your quote request (${q.projectType}). I read every request myself and will reply with questions or a quote.

Urgent? WhatsApp: ${whatsappLink}

— ${profile.name}`,
    }),
  }).catch(() => null);
  // A failed confirmation must never fail the visitor's request — you already have their message.
  if (res && !res.ok) console.error("[quote] auto-reply failed", res.status, await res.text().catch(() => ""));
}

export async function POST(req: Request) {
  let body: Partial<QuoteInput>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const result = validateQuote(body);
  if (!result.ok) return NextResponse.json({ error: "Please fix the highlighted fields.", fields: result.errors }, { status: 422 });
  const quote = result.data;

  // Bots fill every field, including the hidden one. Pretend it worked.
  if (quote.website) return NextResponse.json({ ok: true });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests — please try again in a few minutes, or email me directly." }, { status: 429 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[quote] RESEND_API_KEY is not set — cannot send quote email");
    return NextResponse.json({ error: `The form isn't configured yet. Please email ${profile.email} instead.` }, { status: 503 });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.QUOTE_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
      to: [process.env.QUOTE_TO_EMAIL || profile.email],
      reply_to: quote.email,
      subject: `Quote request: ${quote.projectType} — ${quote.name}`,
      html: emailHtml(quote, ip),
      text: emailText(quote),
    }),
  }).catch((err: unknown) => {
    console.error("[quote] Resend request failed", err);
    return null;
  });

  if (!res || !res.ok) {
    if (res) console.error("[quote] Resend error", res.status, await res.text().catch(() => ""));
    return NextResponse.json({ error: `Couldn't send right now. Please email ${profile.email} instead.` }, { status: 502 });
  }

  await sendAutoReply(apiKey, quote);
  return NextResponse.json({ ok: true });
}

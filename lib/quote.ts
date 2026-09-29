// Shared between the quote form (client) and /api/quote (server).

export const projectTypes = [
  "Landing page",
  "Business / portfolio website",
  "E-commerce store",
  "Web app / SaaS",
  "3D / interactive website",
  "Payments or subscriptions",
  "Something else",
] as const;

export const budgets = ["Under ₹25k", "₹25k – ₹75k", "₹75k – ₹2L", "₹2L+", "Not sure yet"] as const;

export const timelines = ["ASAP", "Within a month", "1–3 months", "Flexible"] as const;

export type QuoteInput = {
  name: string;
  email: string;
  company?: string;
  projectType: string;
  budget: string;
  timeline: string;
  message: string;
  website?: string; // honeypot — real visitors never see or fill it
};

export const LIMITS = { name: 80, email: 120, company: 100, message: 3000, minMessage: 20 };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateQuote(input: Partial<QuoteInput>): { ok: true; data: QuoteInput } | { ok: false; errors: Record<string, string> } {
  const s = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const data: QuoteInput = {
    name: s(input.name),
    email: s(input.email),
    company: s(input.company),
    projectType: s(input.projectType),
    budget: s(input.budget),
    timeline: s(input.timeline),
    message: s(input.message),
    website: s(input.website),
  };
  const errors: Record<string, string> = {};
  if (data.name.length < 2 || data.name.length > LIMITS.name) errors.name = "Please enter your name.";
  if (!EMAIL_RE.test(data.email) || data.email.length > LIMITS.email) errors.email = "Please enter a valid email.";
  if ((data.company ?? "").length > LIMITS.company) errors.company = "That's a bit long.";
  if (!(projectTypes as readonly string[]).includes(data.projectType)) errors.projectType = "Pick a project type.";
  if (!(budgets as readonly string[]).includes(data.budget)) errors.budget = "Pick a budget range.";
  if (!(timelines as readonly string[]).includes(data.timeline)) errors.timeline = "Pick a timeline.";
  if (data.message.length < LIMITS.minMessage) errors.message = `Tell me a little more (at least ${LIMITS.minMessage} characters).`;
  if (data.message.length > LIMITS.message) errors.message = `Please keep it under ${LIMITS.message} characters.`;
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data };
}

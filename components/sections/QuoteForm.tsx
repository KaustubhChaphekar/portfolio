"use client";

import { track } from "@vercel/analytics";
import { AnimatePresence, motion } from "motion/react";
import { useState, type FormEvent } from "react";
import { profile, whatsappLink } from "@/lib/data";
import { budgets, LIMITS, projectTypes, timelines, validateQuote, type QuoteInput } from "@/lib/quote";
import { blip } from "@/lib/sound";
import { ArrowIcon, WhatsAppIcon } from "../ui";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent"; name: string; email: string } | { kind: "error"; message: string };

const empty: QuoteInput = { name: "", email: "", company: "", projectType: "", budget: "", timeline: "", message: "", website: "" };

const inputCls =
  "w-full rounded-xl border border-line bg-bg/70 px-4 py-3 text-[15px] text-ink placeholder:text-faint outline-none transition focus:border-cyan/60 focus:ring-2 focus:ring-cyan/15 aria-[invalid=true]:border-pink/60";

function Field({ label, error, htmlFor, optional, children }: { label: string; error?: string; htmlFor: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 flex items-baseline justify-between text-[13px] font-medium text-ink/85">
        {label}
        {optional && <span className="font-normal text-faint">optional</span>}
      </label>
      {children}
      {error && (
        <p id={`${htmlFor}-error`} className="mt-1.5 text-xs text-pink">
          {error}
        </p>
      )}
    </div>
  );
}

function Choices({
  name,
  legend,
  options,
  value,
  onChange,
  error,
}: {
  name: keyof QuoteInput;
  legend: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-[13px] font-medium text-ink/85">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label key={o} className="cursor-pointer">
            <input type="radio" name={name} value={o} checked={value === o} onChange={() => onChange(o)} className="peer sr-only" />
            <span className="inline-flex rounded-full border border-line bg-bg/60 px-3.5 py-2 text-[13px] text-muted transition peer-checked:border-cyan/60 peer-checked:bg-cyan/10 peer-checked:text-ink peer-focus-visible:ring-2 peer-focus-visible:ring-cyan/40 hover:border-line-strong hover:text-ink">
              {o}
            </span>
          </label>
        ))}
      </div>
      {error && <p className="mt-1.5 text-xs text-pink">{error}</p>}
    </fieldset>
  );
}

export default function QuoteForm() {
  const [form, setForm] = useState<QuoteInput>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const set = <K extends keyof QuoteInput>(key: K, value: QuoteInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key])
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const check = validateQuote(form);
    if (!check.ok) {
      setErrors(check.errors);
      setStatus({ kind: "idle" });
      return;
    }
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.fields) setErrors(data.fields);
        setStatus({ kind: "error", message: data.error ?? "Something went wrong. Please try again." });
        return;
      }
      track("quote_submitted", { projectType: form.projectType, budget: form.budget });
      blip(880, 0.18);
      setStatus({ kind: "sent", name: form.name.split(" ")[0], email: form.email });
      setForm(empty);
    } catch {
      setStatus({ kind: "error", message: "Network error — check your connection and try again." });
    }
  }

  if (status.kind === "sent") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-mint/30 bg-mint/[0.04] p-10 text-center"
        role="status"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-mint/40 bg-mint/10 text-2xl text-mint">✓</div>
        <h3 className="mt-6 font-display text-2xl font-semibold">Thanks, {status.name} — request received.</h3>
        <p className="mt-3 max-w-sm text-muted">
          I&apos;ll read it properly and reply to <span className="text-ink">{status.email}</span> with questions or a quote.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("whatsapp_click", { from: "quote_success" })}
            className="inline-flex items-center gap-2 rounded-full bg-mint/15 px-5 py-2.5 text-sm font-medium text-mint transition hover:bg-mint/25"
          >
            <WhatsAppIcon className="h-4 w-4" /> Follow up on WhatsApp
          </a>
          {profile.bookingUrl && (
            <a href={profile.bookingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-full border border-line-strong px-5 py-2.5 text-sm transition hover:border-ink/40">
              Book a call
            </a>
          )}
        </div>
        <button type="button" onClick={() => setStatus({ kind: "idle" })} className="mt-6 text-sm text-cyan underline-offset-4 hover:underline">
          Send another request
        </button>
      </motion.div>
    );
  }

  const sending = status.kind === "sending";

  return (
    <form onSubmit={onSubmit} noValidate className="glass relative space-y-6 rounded-3xl p-6 sm:p-8" aria-describedby="quote-note">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" htmlFor="q-name" error={errors.name}>
          <input
            id="q-name"
            className={inputCls}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            autoComplete="name"
            maxLength={LIMITS.name}
            placeholder="Priya Sharma"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "q-name-error" : undefined}
          />
        </Field>
        <Field label="Email" htmlFor="q-email" error={errors.email}>
          <input
            id="q-email"
            type="email"
            className={inputCls}
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            autoComplete="email"
            maxLength={LIMITS.email}
            placeholder="you@company.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "q-email-error" : undefined}
          />
        </Field>
      </div>

      <Field label="Company / brand" htmlFor="q-company" optional error={errors.company}>
        <input
          id="q-company"
          className={inputCls}
          value={form.company}
          onChange={(e) => set("company", e.target.value)}
          autoComplete="organization"
          maxLength={LIMITS.company}
          placeholder="Acme Studio"
        />
      </Field>

      <Choices name="projectType" legend="What do you need?" options={projectTypes} value={form.projectType} onChange={(v) => set("projectType", v)} error={errors.projectType} />
      <div className="grid gap-6 md:grid-cols-2">
        <Choices name="budget" legend="Budget" options={budgets} value={form.budget} onChange={(v) => set("budget", v)} error={errors.budget} />
        <Choices name="timeline" legend="Timeline" options={timelines} value={form.timeline} onChange={(v) => set("timeline", v)} error={errors.timeline} />
      </div>

      <Field label="Tell me about the project" htmlFor="q-message" error={errors.message}>
        <textarea
          id="q-message"
          rows={5}
          className={`${inputCls} resize-y`}
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          maxLength={LIMITS.message}
          placeholder="What are you building, who is it for, and are there any sites you like?"
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "q-message-error" : undefined}
        />
        <p className="mt-1 text-right font-mono text-[10px] text-faint">
          {form.message.length}/{LIMITS.message}
        </p>
      </Field>

      {/* Honeypot: hidden from people, irresistible to bots. */}
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden>
        <label htmlFor="q-website">Website</label>
        <input id="q-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set("website", e.target.value)} />
      </div>

      <AnimatePresence>
        {status.kind === "error" && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="alert" className="rounded-xl border border-pink/30 bg-pink/10 px-4 py-3 text-sm text-pink">
            {status.message}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="flex flex-col-reverse items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p id="quote-note" className="text-xs text-faint">
          Your details are only used to reply to you.
        </p>
        <button
          type="submit"
          disabled={sending}
          className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bg transition hover:bg-cyan disabled:cursor-wait disabled:opacity-70"
        >
          {sending ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-bg/30 border-t-bg" /> Sending…
            </>
          ) : (
            <>
              Request a quote
              <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

"use client";

import { track } from "@vercel/analytics";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { experience, profile, whatsappLink } from "@/lib/data";
import { blip } from "@/lib/sound";
import RichText from "./RichText";

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTED_QUESTIONS = [
  `What did ${profile.firstName} build at ${experience.company}?`,
  "How does the AI Social Agent work?",
  `Which payment systems has ${profile.firstName} worked with?`,
  `Can ${profile.firstName} build a website for my business?`,
];

const GREETING = `Hi! I'm ${profile.firstName}'s AI assistant. Ask me about ${profile.firstName}'s experience, projects or skills, or whether ${profile.firstName} can build something for you.`;

function Sparkle({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2.5c.4 3.9 1.6 5.9 5.9 6.6-4.3.7-5.5 2.7-5.9 6.6-.4-3.9-1.6-5.9-5.9-6.6 4.3-.7 5.5-2.7 5.9-6.6Z" />
      <path d="M18.5 14c.2 2 .8 3 3 3.4-2.2.4-2.8 1.4-3 3.4-.2-2-.8-3-3-3.4 2.2-.4 2.8-1.4 3-3.4Z" opacity=".7" />
    </svg>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      track("chat_opened");
    }
  }, [open]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => () => abortRef.current?.abort(), []);

  async function ask(question: string) {
    const text = question.trim();
    if (!text || busy) return;
    setError(null);
    setInput("");
    blip(720);
    const history: Message[] = [...messages, { role: "user", content: text }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setBusy(true);
    track("chat_message");

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        setMessages([...history, { role: "assistant", content: answer }]);
      }
      if (!answer.trim()) throw new Error("No answer came back. Please try again.");
    } catch (err) {
      if (controller.signal.aborted) return;
      setMessages(history);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(input);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      ask(input);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.9 }}
            transition={{ delay: 0.2 }}
            onClick={() => setOpen(true)}
            className="group fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full border border-violet/40 bg-bg/85 p-3.5 text-ink shadow-[0_8px_40px_-8px_rgb(155_140_255/0.6)] backdrop-blur-xl transition hover:border-cyan/60 sm:bottom-6 sm:right-6 sm:px-4 sm:py-3"
            aria-label="Ask my AI assistant"
          >
            <span className="relative flex">
              <Sparkle className="h-5 w-5 text-cyan transition-transform duration-500 group-hover:rotate-90" />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-pulse rounded-full bg-mint" />
            </span>
            <span className="hidden text-sm font-medium sm:inline">Ask my AI</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="false"
            aria-label={`Chat with ${profile.firstName}'s AI assistant`}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.45 }}
            data-lenis-prevent
            className="fixed inset-x-2 bottom-2 top-20 z-50 flex flex-col overflow-hidden rounded-3xl border border-line-strong bg-surface/95 shadow-2xl shadow-black/60 backdrop-blur-2xl sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[600px] sm:max-h-[calc(100vh-7rem)] sm:w-[400px]"
          >
            <header className="flex items-center gap-3 border-b border-line px-5 py-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan/25 to-violet/25 text-cyan">
                <Sparkle className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-[15px] font-semibold">Ask {profile.firstName}&apos;s AI</p>
                <p className="truncate text-[11px] text-muted">Answers come from this site. They can be imperfect.</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-white/5 hover:text-ink"
                aria-label="Close chat"
              >
                <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </header>

            <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-5 text-[14px] leading-relaxed" aria-live="polite">
              <div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-white/[0.04] px-4 py-3 text-ink/90">{GREETING}</div>

              {messages.length === 0 && (
                <div className="flex flex-col items-start gap-2 pt-1">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => ask(q)}
                      className="rounded-full border border-line px-3.5 py-1.5 text-left text-[13px] text-ink/85 transition hover:border-cyan/50 hover:text-ink"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {messages.map((m, i) =>
                m.role === "user" ? (
                  <div key={i} className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-tr-sm bg-cyan/15 px-4 py-3 text-ink">
                    {m.content}
                  </div>
                ) : (
                  <div key={i} className="max-w-[92%] rounded-2xl rounded-tl-sm bg-white/[0.04] px-4 py-3 text-ink/90">
                    {m.content ? (
                      <RichText text={m.content} />
                    ) : (
                      <span className="flex gap-1 py-1" aria-label="Thinking">
                        {[0, 1, 2].map((d) => (
                          <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted" style={{ animationDelay: `${d * 120}ms` }} />
                        ))}
                      </span>
                    )}
                  </div>
                ),
              )}

              {error && (
                <p role="alert" className="rounded-xl border border-pink/30 bg-pink/10 px-4 py-3 text-[13px] text-pink">
                  {error}
                </p>
              )}
            </div>

            <form onSubmit={onSubmit} className="border-t border-line p-3">
              <div className="flex items-end gap-2 rounded-2xl border border-line bg-bg/70 p-1.5 focus-within:border-cyan/50">
                <label htmlFor="chat-input" className="sr-only">
                  Your question
                </label>
                <textarea
                  id="chat-input"
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  maxLength={600}
                  placeholder="Ask a question…"
                  className="max-h-32 min-h-[40px] flex-1 resize-none bg-transparent px-3 py-2.5 text-[14px] text-ink outline-none placeholder:text-faint"
                />
                <button
                  type="submit"
                  disabled={busy || !input.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink text-bg transition hover:bg-cyan disabled:opacity-40"
                  aria-label="Send"
                >
                  <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
                    <path d="M8 13V3m0 0L4 7m4-4 4 4" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              <p className="mt-2 px-1 text-center text-[11px] text-faint">
                Prefer a human?{" "}
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="text-muted underline-offset-2 hover:text-ink hover:underline">
                  WhatsApp
                </a>{" "}
                ·{" "}
                <Link href="/#quote" onClick={() => setOpen(false)} className="text-muted underline-offset-2 hover:text-ink hover:underline">
                  Get a quote
                </Link>
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

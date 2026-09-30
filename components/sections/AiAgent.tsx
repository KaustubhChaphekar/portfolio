"use client";

import { AnimatePresence, motion, useInView } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { aiAgent, profile } from "@/lib/data";
import { useReducedMotion } from "@/lib/hooks";
import { blip } from "@/lib/sound";
import { RobotStage } from "../three/Backdrops";
import type { RobotExpression } from "../three/RobotScene";
import { ArrowIcon, Reveal, SectionHeading } from "../ui";

const STAGE_MS = 2800;
const DONE_MS = 4200;
const stages = aiAgent.stages;
const DONE = stages.length; // index past the last stage = "Published"

// What the robot does each time it's clicked or tapped, in order.
const REACTIONS: { animation: string; expression: RobotExpression; line: string; ms: number; tone: number }[] = [
  { animation: "Wave", expression: null, line: "Hi! I'm the agent. I post so Kaustubh doesn't have to.", ms: 2800, tone: 880 },
  { animation: "Jump", expression: "Surprised", line: "Whoa! You found my secret button.", ms: 2400, tone: 990 },
  { animation: "ThumbsUp", expression: null, line: "Script, voice, render, upload. All before breakfast.", ms: 2800, tone: 740 },
  { animation: "Dance", expression: null, line: "Another Short is live. Victory dance!", ms: 3600, tone: 1175 },
  { animation: "Punch", expression: "Angry", line: "Pow! That's what I do to failed uploads.", ms: 2400, tone: 520 },
];

export default function AiAgent() {
  const stageRef = useRef<HTMLDivElement>(null);
  const inView = useInView(stageRef, { margin: "-20% 0px" });
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const [hold, setHold] = useState(0); // extra ms to stay on a step the visitor picked
  const [reaction, setReaction] = useState<{ index: number; key: number } | null>(null);
  const taps = useRef(0);

  // Walk through the pipeline while the stage is on screen; a manual pick pauses it for a while.
  useEffect(() => {
    if (!inView || reduced) return;
    const id = setTimeout(() => {
      setHold(0);
      setStep((s) => (s >= DONE ? 0 : s + 1));
    }, hold + (step === DONE ? DONE_MS : STAGE_MS));
    return () => clearTimeout(id);
  }, [step, inView, reduced, hold]);

  const pick = (i: number) => {
    setStep(i);
    setHold(6000);
  };

  // Each tap plays the next reaction; the bubble clears once it has had time to be read.
  const poke = () => {
    const index = taps.current % REACTIONS.length;
    taps.current += 1;
    blip(REACTIONS[index].tone, 0.14);
    setReaction({ index, key: taps.current });
  };

  useEffect(() => {
    if (!reaction) return;
    const id = setTimeout(() => setReaction(null), REACTIONS[reaction.index].ms);
    return () => clearTimeout(id);
  }, [reaction]);

  const active = reaction ? REACTIONS[reaction.index] : null;
  const animation = active ? active.animation : step === DONE ? "Dance" : stages[step].animation;
  const current = step === DONE ? null : stages[step];

  return (
    <section id="ai-agent" className="cv-section relative scroll-mt-20 py-28 md:py-40">
      <div className="section">
        <SectionHeading
          index="03"
          eyebrow="Featured project · just shipped"
          title={
            <>
              {aiAgent.name}: <span className="gradient-text">a YouTube channel that runs itself.</span>
            </>
          }
        >
          {aiAgent.headline}
        </SectionHeading>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* 3D stage */}
          <Reveal className="lg:col-span-7">
            <div ref={stageRef} className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-b from-surface-2/80 to-bg/80">
              <div className="grid-bg absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" aria-hidden />
              {/* The whole stage is the tap target — easier than hitting the robot itself on a phone. */}
              <button
                type="button"
                onClick={poke}
                aria-label="Poke the robot"
                className="relative block h-[380px] w-full cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cyan sm:h-[460px] lg:h-[540px]"
              >
                <RobotStage
                  animation={animation}
                  playKey={reaction?.key ?? 0}
                  expression={active?.expression ?? null}
                  activeStage={Math.min(step, stages.length - 1)}
                  stageCount={stages.length}
                />
              </button>

              {/* HUD */}
              <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4 sm:p-5">
                <div className="rounded-2xl border border-line bg-bg/70 px-3.5 py-2.5 backdrop-blur-xl">
                  <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                    <span className={`h-1.5 w-1.5 rounded-full ${step === DONE ? "bg-mint" : "animate-pulse bg-cyan"}`} />
                    {step === DONE ? "Run complete" : `Step ${step + 1} / ${stages.length}`}
                  </p>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={step}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.25 }}
                      className="mt-1 font-display text-lg font-semibold"
                    >
                      {current ? (
                        <>
                          {current.label} <span className="text-muted">· {current.tool}</span>
                        </>
                      ) : (
                        <span className="text-mint">Published to YouTube ✓</span>
                      )}
                    </motion.p>
                  </AnimatePresence>
                </div>
                <AnimatePresence mode="popLayout">
                  {active && reaction && (
                    <motion.p
                      key={reaction.key}
                      role="status"
                      initial={{ opacity: 0, scale: 0.85, y: 6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: "spring", bounce: 0.35, duration: 0.4 }}
                      className="ml-3 max-w-[48%] origin-bottom-left rounded-2xl rounded-bl-sm border border-violet/40 bg-bg/80 px-3.5 py-2.5 text-[13px] leading-snug shadow-lg shadow-violet/20 backdrop-blur-xl sm:max-w-[260px] sm:text-sm"
                    >
                      {active.line}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Stepper */}
              <div className="relative border-t border-line bg-bg/60 p-3 backdrop-blur-xl sm:p-4">
                <ol className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {stages.map((s, i) => {
                    const state = step === DONE || i < step ? "done" : i === step ? "active" : "todo";
                    return (
                      <li key={s.key}>
                        <button
                          type="button"
                          onClick={() => pick(i)}
                          aria-current={state === "active" ? "step" : undefined}
                          className={`relative w-full overflow-hidden rounded-xl border px-3 py-2 text-left transition-colors ${
                            state === "active" ? "border-cyan/50 bg-cyan/10" : "border-line hover:border-line-strong"
                          }`}
                        >
                          <span className={`block font-mono text-[10px] ${state === "todo" ? "text-faint" : "text-cyan"}`}>
                            {state === "done" ? "✓" : `0${i + 1}`}
                          </span>
                          <span className={`block text-[13px] font-medium ${state === "todo" ? "text-muted" : "text-ink"}`}>{s.label}</span>
                          {state === "active" && !reduced && (
                            <motion.span
                              key={`${step}-${hold}`}
                              className="absolute bottom-0 left-0 h-0.5 bg-cyan"
                              initial={{ width: "0%" }}
                              animate={{ width: "100%" }}
                              transition={{ duration: (hold + STAGE_MS) / 1000, ease: "linear" }}
                            />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ol>
                <p className="mt-3 min-h-[2.5rem] text-[13px] leading-relaxed text-muted" aria-live="polite">
                  {current ? current.detail : "Then it adds the video to a playlist, posts a first comment, and emails + push-notifies me. Tomorrow, it does it again."}
                </p>
              </div>
            </div>
            <p className="mt-3 text-center font-mono text-[11px] text-faint">Tap the robot for its {REACTIONS.length} moves · pick a step to jump</p>
          </Reveal>

          {/* Story */}
          <Reveal className="lg:col-span-5" delay={0.1}>
            <div className="glass flex h-full flex-col rounded-3xl p-7 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="chip">{aiAgent.kind}</span>
                <span className="chip">{aiAgent.year}</span>
                <span className="chip border-mint/30 text-mint">{aiAgent.status}</span>
              </div>
              <p className="mt-6 leading-relaxed text-ink/80">{aiAgent.body}</p>

              <dl className="mt-8 grid grid-cols-2 gap-3">
                {aiAgent.metrics.map((m) => (
                  <div key={m.label} className="flex flex-col rounded-2xl border border-line bg-white/[0.02] p-4">
                    <dt className="order-2 mt-1 text-xs leading-snug text-muted">{m.label}</dt>
                    <dd className="order-1 font-display text-3xl font-semibold tracking-tight">{m.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-8 flex flex-wrap gap-1.5">
                {aiAgent.stack.map((t) => (
                  <span key={t} className="chip">
                    {t}
                  </span>
                ))}
              </div>

              <div className="mt-auto flex flex-wrap gap-3 pt-8">
                <Link
                  href="/work/ai-social-agent"
                  className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-bg transition hover:bg-cyan"
                >
                  Read the case study
                  <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                <a
                  href={`mailto:${profile.email}?subject=${encodeURIComponent("AI Social Agent — demo request")}`}
                  className="inline-flex items-center gap-2 rounded-full border border-line-strong px-5 py-2.5 text-sm transition hover:border-ink/40"
                >
                  Request a live demo
                </a>
                <a href="#quote" className="inline-flex items-center gap-2 px-2 py-2.5 text-sm text-muted transition hover:text-ink">
                  Build one for me →
                </a>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {aiAgent.highlights.map((h, i) => (
            <Reveal key={h.title} delay={(i % 3) * 0.08}>
              <article className="h-full rounded-3xl border border-line bg-bg/60 p-7 backdrop-blur-xl transition-colors hover:border-line-strong">
                <h3 className="font-display text-lg font-semibold tracking-tight">{h.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{h.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

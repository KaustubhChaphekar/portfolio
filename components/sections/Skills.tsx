"use client";

import { useState } from "react";
import { skills } from "@/lib/data";
import { SkillsStage } from "../three/Backdrops";
import { Reveal, SectionHeading } from "../ui";

export default function Skills() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section id="skills" className="cv-section relative scroll-mt-20 py-28 md:py-40">
      <div className="section">
        <SectionHeading index="05" eyebrow="Toolbox" title="The stack I ship with, every day.">
          Hover a category to light it up in the sphere, or drag the sphere to spin it.
        </SectionHeading>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
          <Reveal className="order-2 lg:order-1 lg:col-span-5">
            <ul className="flex flex-col gap-3">
              {skills.map((g) => (
                <li key={g.name}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(g.name)}
                    onMouseLeave={() => setActive(null)}
                    onFocus={() => setActive(g.name)}
                    onBlur={() => setActive(null)}
                    onClick={() => setActive((a) => (a === g.name ? null : g.name))}
                    aria-pressed={active === g.name}
                    className={`w-full rounded-2xl border px-5 py-4 text-left transition-colors ${
                      active === g.name ? "border-line-strong bg-white/[0.04]" : "border-line bg-bg/60 backdrop-blur-xl hover:border-line-strong"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full" style={{ background: g.color, boxShadow: `0 0 12px ${g.color}` }} />
                      <span className="font-display text-base font-semibold">{g.name}</span>
                      <span className="ml-auto font-mono text-[11px] text-faint">{g.items.length}</span>
                    </span>
                    <span className="mt-2 block text-sm leading-relaxed text-muted">{g.items.join(" · ")}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="order-1 lg:sticky lg:top-24 lg:order-2 lg:col-span-7">
            <div className="relative mx-auto aspect-square w-full max-w-[640px]">
              <div className="absolute inset-[12%] rounded-full bg-[radial-gradient(circle,rgb(155_140_255/0.16),transparent_65%)]" aria-hidden />
              <SkillsStage groups={skills} activeGroup={active} />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

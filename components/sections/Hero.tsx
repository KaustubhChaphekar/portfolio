"use client";

import type { CSSProperties } from "react";
import { profile } from "@/lib/data";
import { useLocalTime } from "@/lib/hooks";
import { Avatar } from "../Portrait";
import { ArrowIcon, DownloadIcon } from "../ui";

// The hero animates with CSS keyframes (see globals.css), not JS, so the text paints
// in the first frame — before hydration — which keeps Largest Contentful Paint fast.
const delay = (s: number): CSSProperties => ({ animationDelay: `${s}s` });

function SplitName({ text, start }: { text: string; start: number }) {
  return (
    <span className="block overflow-hidden pb-[0.08em]" aria-hidden>
      {text.split("").map((ch, i) => (
        <span key={i} className="hero-rise" style={delay(start + i * 0.035)}>
          {ch}
        </span>
      ))}
    </span>
  );
}

export default function Hero() {
  const time = useLocalTime(profile.timeZone);

  return (
    <section id="top" className="relative flex min-h-[100svh] flex-col">
      <div className="section flex flex-1 flex-col justify-end pb-28 pt-40 md:justify-center md:pb-16">
        <a
          href="#ai-agent"
          style={delay(0.1)}
          className="hero-fade group mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-line bg-surface/60 py-1 pl-1 pr-3 text-[12px] text-ink/85 backdrop-blur-xl transition hover:border-cyan/40"
        >
          <span className="rounded-full bg-cyan/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-cyan">New</span>
          Just shipped: an AI agent that publishes a YouTube Short every day
          <ArrowIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>

        <div className="hero-fade flex items-center gap-3" style={delay(0.15)}>
          <Avatar size={36} />
          <p className="eyebrow">{profile.role}</p>
        </div>

        <h1 className="mt-5 font-display text-[clamp(3.2rem,11vw,9.5rem)] font-semibold leading-[0.88] tracking-[-0.045em]">
          <span className="sr-only">{profile.name}</span>
          <SplitName text={profile.firstName} start={0.1} />
          <span className="block overflow-hidden pb-[0.08em]" aria-hidden>
            <span className="hero-rise gradient-text" style={delay(0.35)}>
              {profile.lastName}
            </span>
          </span>
        </h1>

        <p className="hero-soft mt-7 max-w-xl text-base leading-relaxed text-ink/75 sm:text-lg" style={delay(0.3)}>
          {profile.tagline}
        </p>

        <div className="hero-fade mt-9 flex flex-wrap items-center gap-3" style={delay(0.45)}>
          <a
            href="#projects"
            className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-bg transition hover:bg-cyan"
          >
            See my work
            <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
          <a
            href={profile.resume}
            download
            className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface/40 px-6 py-3 text-sm font-medium backdrop-blur transition hover:border-ink/40"
          >
            <DownloadIcon /> Download CV
          </a>
        </div>
      </div>

      <div
        className="hero-fade section flex items-end justify-center pb-8 font-mono text-[11px] uppercase tracking-[0.18em] text-muted sm:justify-between"
        style={delay(0.8)}
      >
        <div className="hidden flex-col gap-1 sm:flex">
          <span>{profile.location}</span>
          <span className="text-faint">
            {profile.coords.lat.toFixed(2)}° N · {profile.coords.lon.toFixed(2)}° E
          </span>
        </div>
        <a href="#about" className="flex flex-col items-center gap-3 text-muted transition hover:text-ink" aria-label="Scroll to about">
          <span>Scroll</span>
          <span className="relative block h-10 w-px overflow-hidden bg-line">
            <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_1.8s_ease-in-out_infinite] bg-cyan" />
          </span>
        </a>
        <div className="hidden flex-col items-end gap-1 sm:flex">
          <span className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-mint" />
            </span>
            Open to opportunities
          </span>
          <span className="text-faint">IST {time ?? "--:--"}</span>
        </div>
      </div>
    </section>
  );
}

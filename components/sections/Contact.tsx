"use client";

import { track } from "@vercel/analytics";
import { useState } from "react";
import { profile, whatsappLink } from "@/lib/data";
import { useLocalTime } from "@/lib/hooks";
import { GlobeStage } from "../three/Backdrops";
import { ArrowIcon, CalendarIcon, DownloadIcon, GitHubIcon, LinkedInIcon, MailIcon, Reveal, WhatsAppIcon } from "../ui";
import QuoteForm from "./QuoteForm";

export default function Contact() {
  const time = useLocalTime(profile.timeZone);
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  const links = [
    { href: profile.linkedin, label: "LinkedIn", sub: "kaustubh-chaphekar", icon: <LinkedInIcon /> },
    { href: profile.github, label: "GitHub", sub: "@KaustubhChaphekar", icon: <GitHubIcon /> },
  ];

  return (
    <section id="contact" className="cv-section relative scroll-mt-20 py-28 md:py-40">
      <div className="section">
        <Reveal className="max-w-4xl">
          <p className="eyebrow">
            <span className="text-cyan">09</span> Contact
          </p>
          <h2 className="mt-4 font-display text-[clamp(2.6rem,7vw,6rem)] font-semibold leading-[0.95] tracking-[-0.035em] text-balance">
            Have a project in mind? <span className="gradient-text">Let&apos;s build it.</span>
          </h2>
          <p className="mt-5 max-w-2xl text-lg text-muted">
            Hiring for a full-stack or lead role, or need a website built? Send a quote request, or email me directly.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-7" delay={0.05}>
            <div id="quote" className="scroll-mt-24">
              <QuoteForm />
            </div>
          </Reveal>

          <Reveal className="flex flex-col gap-6 lg:col-span-5" delay={0.12}>
            <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-b from-surface-2/70 to-bg/70">
              <div className="aspect-square max-h-[420px] w-full">
                <GlobeStage markers={[{ lat: profile.coords.lat, lon: profile.coords.lon, color: "#5ee7ff" }]} label={`A dotted 3D globe with a marker on ${profile.location}`} />
              </div>
              <div className="pointer-events-none absolute left-5 top-5 rounded-2xl border border-line bg-bg/70 px-3.5 py-2.5 backdrop-blur-xl">
                <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan" /> Local time
                </p>
                <p className="mt-1 font-display text-lg font-semibold tabular-nums">
                  {time ?? "--:--"} <span className="text-sm font-normal text-muted">IST · UTC+5:30</span>
                </p>
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-line bg-bg/70 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted backdrop-blur-xl">
                <span>Based in {profile.location}</span>
                <span className="flex items-center gap-2 text-mint">
                  <span className="h-1.5 w-1.5 rounded-full bg-mint" /> Remote-friendly
                </span>
              </div>
            </div>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("whatsapp_click", { from: "contact" })}
              className="group flex items-center gap-4 rounded-2xl border border-mint/30 bg-mint/[0.06] p-5 transition hover:border-mint/60 hover:bg-mint/10"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint/15 text-mint">
                <WhatsAppIcon className="h-6 w-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs text-muted">Fastest reply</span>
                <span className="block font-medium">Chat on WhatsApp</span>
              </span>
              <ArrowIcon className="h-4 w-4 text-mint transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>

            {profile.bookingUrl && (
              <a
                href={profile.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("booking_click")}
                className="group glass flex items-center gap-4 rounded-2xl p-5 transition hover:border-line-strong"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-line text-violet">
                  <CalendarIcon />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs text-muted">15 minutes, no obligation</span>
                  <span className="block font-medium">Book an intro call</span>
                </span>
                <ArrowIcon className="h-4 w-4 text-faint transition group-hover:text-violet" />
              </a>
            )}

            <button
              type="button"
              onClick={copyEmail}
              className="group glass flex items-center gap-4 rounded-2xl p-5 text-left transition hover:border-line-strong"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-line text-cyan">
                <MailIcon />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs text-muted">{copied ? "Copied to clipboard" : "Email · click to copy"}</span>
                <span className="block truncate font-medium">{profile.email}</span>
              </span>
              <span className="font-mono text-[11px] text-faint group-hover:text-cyan">{copied ? "✓" : "copy"}</span>
            </button>

            <div className="grid grid-cols-2 gap-4">
              {links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group glass flex flex-col gap-4 rounded-2xl p-5 transition hover:border-line-strong"
                >
                  <span className="flex items-center justify-between text-muted group-hover:text-ink">
                    {l.icon}
                    <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                  <span>
                    <span className="block font-medium">{l.label}</span>
                    <span className="block truncate text-xs text-muted">{l.sub}</span>
                  </span>
                </a>
              ))}
            </div>

            <a
              href={profile.resume}
              download
              onClick={() => track("resume_download", { from: "contact" })}
              className="group flex items-center justify-between rounded-2xl border border-dashed border-line-strong px-5 py-4 text-sm transition hover:border-cyan/60"
            >
              <span className="flex items-center gap-3">
                <DownloadIcon className="h-5 w-5 text-cyan" /> Download my resume (PDF)
              </span>
              <ArrowIcon className="h-4 w-4 text-faint transition group-hover:text-cyan" />
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

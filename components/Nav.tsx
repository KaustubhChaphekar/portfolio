"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav, profile } from "@/lib/data";
import SoundToggle from "./SoundToggle";
import { DownloadIcon } from "./ui";

function Logo({ home }: { home: boolean }) {
  return (
    <Link href={home ? "#top" : "/"} className="group flex items-center gap-2.5" aria-label={home ? "Kaustubh.dev, back to top" : "Kaustubh.dev, home"}>
      <svg viewBox="0 0 64 64" className="h-8 w-8 transition-transform duration-500 group-hover:rotate-[60deg]" aria-hidden>
        <defs>
          <linearGradient id="nav-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#5ee7ff" />
            <stop offset=".5" stopColor="#9b8cff" />
            <stop offset="1" stopColor="#ff6fae" />
          </linearGradient>
        </defs>
        <path d="M32 6 54.5 19v26L32 58 9.5 45V19Z" fill="none" stroke="url(#nav-g)" strokeWidth="3.5" />
        <circle cx="32" cy="32" r="6" fill="url(#nav-g)" />
      </svg>
      <span className="font-display text-[15px] font-semibold tracking-tight">
        Kaustubh<span className="text-muted">.dev</span>
      </span>
    </Link>
  );
}

export default function Nav() {
  const home = usePathname() === "/";
  // Section links are page anchors on the home page and full links everywhere else.
  const to = (hash: string) => (home ? hash : `/${hash}`);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!home) return;
    const sections = nav.map((n) => document.querySelector(n.href)).filter(Boolean) as Element[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(`#${e.target.id}`);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [home]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between px-4 transition-all duration-500 sm:px-6 lg:px-10 ${
          scrolled ? "py-3" : "py-5"
        }`}
      >
        <div
          className={`absolute inset-0 -z-10 border-b transition-all duration-500 ${
            scrolled ? "border-line bg-bg/85 backdrop-blur-xl" : "border-transparent"
          }`}
        />
        <Logo home={home} />

        <nav aria-label="Primary" className="hidden items-center gap-1 rounded-full border border-line bg-surface/50 p-1 backdrop-blur-xl lg:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={to(item.href)}
              className={`relative rounded-full px-4 py-1.5 text-[13px] transition-colors ${
                home && active === item.href ? "text-ink" : "text-muted hover:text-ink"
              }`}
            >
              {home && active === item.href && (
                <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-white/[0.07]" transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} />
              )}
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <SoundToggle />
          <a
            href={profile.resume}
            download
            className="hidden items-center gap-2 rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-bg transition hover:bg-cyan sm:inline-flex"
          >
            <DownloadIcon /> Resume
          </a>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface/60 backdrop-blur lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <span className={`absolute h-px w-4 bg-ink transition-transform duration-300 ${open ? "rotate-45" : "-translate-y-1"}`} />
            <span className={`absolute h-px w-4 bg-ink transition-transform duration-300 ${open ? "-rotate-45" : "translate-y-1"}`} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 top-0 -z-20 flex flex-col justify-center bg-bg/95 px-6 backdrop-blur-2xl lg:hidden"
          >
            <nav aria-label="Mobile" className="flex flex-col gap-2">
              {nav.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={to(item.href)}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * i }}
                  className="flex items-baseline gap-4 border-b border-line py-3 font-display text-4xl font-semibold tracking-tight"
                >
                  <span className="font-mono text-xs text-cyan">0{i + 1}</span>
                  {item.label}
                </motion.a>
              ))}
            </nav>
            <a href={profile.resume} download className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-bg">
              <DownloadIcon /> Download resume
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

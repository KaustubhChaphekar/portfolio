import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon } from "@/components/ui";
import { caseStudies } from "@/lib/case-studies";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="relative flex min-h-[100svh] items-center overflow-x-clip pt-24">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="grid-bg absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
        <div className="absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet/15 blur-[120px]" />
      </div>
      <div className="section py-20 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-cyan">Error 404</p>
        <h1 className="mt-4 font-display text-[clamp(4rem,16vw,11rem)] font-semibold leading-none tracking-[-0.05em]">
          <span className="gradient-text">Lost</span> in space.
        </h1>
        <p className="mx-auto mt-6 max-w-md text-lg text-muted">This page doesn&apos;t exist, or it moved. Here are some places worth visiting instead.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/" className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-bg transition hover:bg-cyan">
            Back to home
            <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <Link href="/#quote" className="inline-flex items-center rounded-full border border-line-strong px-6 py-3 text-sm transition hover:border-ink/40">
            Get a quote
          </Link>
        </div>
        <nav aria-label="Case studies" className="mx-auto mt-14 grid max-w-3xl gap-3 sm:grid-cols-3">
          {caseStudies.map((c) => (
            <Link
              key={c.slug}
              href={`/work/${c.slug}`}
              className="rounded-2xl border border-line bg-surface/60 p-5 text-left transition hover:border-line-strong"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">Case study</span>
              <span className="mt-1 block font-display text-lg font-semibold">{c.title}</span>
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}

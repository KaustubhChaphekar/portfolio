import Image from "next/image";
import Link from "next/link";
import { projects } from "@/lib/data";
import { ArrowIcon, Reveal, SectionHeading, TiltCard } from "../ui";
import ProjectArt from "./ProjectArt";

export default function Projects() {
  return (
    <section id="projects" className="cv-section relative scroll-mt-20 py-28 md:py-40">
      <div className="section">
        <SectionHeading index="04" eyebrow="Selected work" title="Systems I've designed, built and run in production.">
          Case studies from Wallxy&apos;s platform and my own projects. Wallxy&apos;s code is private, so these cover the architecture
          and the problems each system solved.
        </SectionHeading>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => {
            const inner = (
              <TiltCard className="h-full rounded-3xl">
                <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface/70 backdrop-blur-xl transition-colors group-hover:border-line-strong">
                  <div className={`relative overflow-hidden border-b border-line bg-bg ${p.wide ? "aspect-[16/9] md:aspect-[21/9]" : "aspect-[16/9]"}`}>
                    {p.image ? (
                      <Image
                        src={p.image.src}
                        alt={p.image.alt}
                        fill
                        sizes="(min-width: 1024px) 800px, 100vw"
                        className="object-cover object-left-top transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <ProjectArt art={p.art} />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6 sm:p-7">
                    <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                      {p.kind}
                      {p.year && <span className="text-faint"> · {p.year}</span>}
                    </p>
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">{p.title}</h3>
                      {p.href && (
                        <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line transition group-hover:border-cyan group-hover:bg-cyan group-hover:text-bg">
                          <ArrowIcon />
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-muted">{p.blurb}</p>
                    <div className="mt-auto flex flex-wrap gap-1.5 pt-6">
                      {p.tags.map((t) => (
                        <span key={t} className="chip">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              </TiltCard>
            );
            return (
              <Reveal key={p.slug} delay={(i % 3) * 0.08} className={p.wide ? "md:col-span-2" : ""}>
                {p.href ? (
                  <Link href={p.href} className="block h-full rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan">
                    {inner}
                  </Link>
                ) : (
                  inner
                )}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

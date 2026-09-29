import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProjectArt from "@/components/sections/ProjectArt";
import { ArrowIcon, DownloadIcon } from "@/components/ui";
import FlowDiagram from "@/components/work/FlowDiagram";
import { caseStudies, getCaseStudy } from "@/lib/case-studies";
import { profile, whatsappLink } from "@/lib/data";
import { siteUrl } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const study = getCaseStudy((await params).slug);
  if (!study) return {};
  const title = `${study.title}: case study`;
  return {
    title,
    description: study.subtitle,
    alternates: { canonical: `/work/${study.slug}` },
    openGraph: { type: "article", url: `/work/${study.slug}`, title, description: study.subtitle },
    twitter: { card: "summary_large_image", title, description: study.subtitle },
  };
}

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default async function CaseStudyPage({ params }: Props) {
  const study = getCaseStudy((await params).slug);
  if (!study) notFound();

  const index = caseStudies.findIndex((c) => c.slug === study.slug);
  const next = caseStudies[(index + 1) % caseStudies.length];
  const toc = [
    { id: "problem", title: "The problem" },
    { id: "architecture", title: "Architecture" },
    ...study.sections.map((s) => ({ id: slugify(s.title), title: s.title })),
    { id: "decisions", title: "Key decisions" },
    ...(study.next?.length ? [{ id: "next", title: "What's next" }] : []),
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${study.title}: case study`,
    description: study.subtitle,
    url: `${siteUrl}/work/${study.slug}`,
    author: { "@type": "Person", name: profile.name, url: siteUrl },
    about: study.stack,
  };

  return (
    <main className="relative overflow-x-clip pb-24 pt-28 md:pt-36">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[900px]" aria-hidden>
        <div className="grid-bg absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
        <div className="absolute -left-40 top-10 h-[480px] w-[480px] rounded-full bg-violet/15 blur-[120px]" />
        <div className="absolute right-0 top-40 h-[380px] w-[380px] rounded-full bg-cyan/10 blur-[120px]" />
      </div>

      <div className="section">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          <Link href="/#projects" className="transition hover:text-ink">
            Work
          </Link>
          <span className="text-faint">/</span>
          <span className="text-ink/80">{study.title}</span>
        </nav>

        <header className="mt-8 max-w-4xl">
          <p className="eyebrow">
            {study.kind} · {study.period}
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.6rem,7vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.035em]">
            {study.title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-ink/75 sm:text-xl">{study.subtitle}</p>
        </header>

        <dl className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-3">
          {[
            ["Role", study.role],
            ["Timeline", study.period],
            ["Status", study.status],
          ].map(([k, v]) => (
            <div key={k} className="bg-bg/90 p-5">
              <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">{k}</dt>
              <dd className="mt-1.5 text-sm font-medium">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-3xl border border-line bg-bg sm:aspect-[21/9]">
          <ProjectArt art={study.art} />
        </div>

        <div className="mt-6 flex flex-wrap gap-1.5">
          {study.stack.map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
          <aside className="hidden lg:block">
            <nav aria-label="On this page" className="sticky top-28">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">On this page</p>
              <ol className="mt-4 space-y-2.5 border-l border-line text-sm">
                {toc.map((t) => (
                  <li key={t.id}>
                    <a href={`#${t.id}`} className="-ml-px block border-l border-transparent pl-4 text-muted transition hover:border-cyan hover:text-ink">
                      {t.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <article className="min-w-0 max-w-3xl">
            <p className="text-lg leading-relaxed text-ink/85">{study.summary}</p>

            <dl className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {study.facts.map((f) => (
                <div key={f.label} className="flex flex-col rounded-2xl border border-line bg-surface/60 p-4">
                  <dt className="order-2 mt-1 text-xs leading-snug text-muted">{f.label}</dt>
                  <dd className="order-1 font-display text-3xl font-semibold tracking-tight">{f.value}</dd>
                </div>
              ))}
            </dl>

            <section id="problem" className="scroll-mt-28 pt-16">
              <h2 className="font-display text-3xl font-semibold tracking-tight">The problem</h2>
              {study.problem.map((p) => (
                <p key={p} className="mt-4 leading-relaxed text-muted">
                  {p}
                </p>
              ))}
            </section>

            <section id="architecture" className="scroll-mt-28 pt-16">
              <h2 className="font-display text-3xl font-semibold tracking-tight">Architecture</h2>
              <p className="mt-4 leading-relaxed text-muted">{study.architecture.intro}</p>
              <div className="mt-8">
                <FlowDiagram lanes={study.architecture.lanes} />
              </div>
            </section>

            {study.sections.map((s) => (
              <section key={s.title} id={slugify(s.title)} className="scroll-mt-28 pt-16">
                <h2 className="font-display text-3xl font-semibold tracking-tight">{s.title}</h2>
                {s.paragraphs?.map((p) => (
                  <p key={p} className="mt-4 leading-relaxed text-muted">
                    {p}
                  </p>
                ))}
                {s.bullets && (
                  <ul className="mt-5 space-y-3">
                    {s.bullets.map((b) => (
                      <li key={b} className="flex gap-3 leading-relaxed text-muted">
                        <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan" aria-hidden />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            <section id="decisions" className="scroll-mt-28 pt-16">
              <h2 className="font-display text-3xl font-semibold tracking-tight">Key decisions</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {study.decisions.map((d, i) => (
                  <div key={d.title} className="rounded-2xl border border-line bg-surface/60 p-5">
                    <span className="font-mono text-xs text-cyan">0{i + 1}</span>
                    <h3 className="mt-2 font-display text-lg font-semibold">{d.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{d.body}</p>
                  </div>
                ))}
              </div>
            </section>

            {study.next?.length ? (
              <section id="next" className="scroll-mt-28 pt-16">
                <h2 className="font-display text-3xl font-semibold tracking-tight">What&apos;s next</h2>
                <ul className="mt-5 space-y-3">
                  {study.next.map((n) => (
                    <li key={n} className="flex gap-3 leading-relaxed text-muted">
                      <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet" aria-hidden />
                      <span>{n}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <div className="mt-20 rounded-3xl border border-line bg-gradient-to-br from-violet/10 via-surface/60 to-cyan/10 p-7 sm:p-10">
              <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Want something like this built, or someone who builds it?</h2>
              <p className="mt-3 text-muted">
                Tell me about your project, or grab my résumé if you&apos;re hiring.
                {study.kind.startsWith("Wallxy") && " The code is private; I'm happy to walk through it in an interview."}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/#quote" className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-bg transition hover:bg-cyan">
                  Get a quote
                  <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-mint/40 px-5 py-2.5 text-sm text-mint transition hover:bg-mint/10">
                  WhatsApp
                </a>
                <a href={profile.resume} download className="inline-flex items-center gap-2 rounded-full border border-line-strong px-5 py-2.5 text-sm transition hover:border-ink/40">
                  <DownloadIcon /> Résumé
                </a>
              </div>
            </div>

            <Link
              href={`/work/${next.slug}`}
              className="group mt-6 flex items-center justify-between gap-6 rounded-3xl border border-line p-6 transition hover:border-line-strong sm:p-8"
            >
              <span>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">Next case study</span>
                <span className="mt-1 block font-display text-2xl font-semibold tracking-tight">{next.title}</span>
              </span>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line transition group-hover:border-cyan group-hover:bg-cyan group-hover:text-bg">
                <ArrowIcon />
              </span>
            </Link>
          </article>
        </div>
      </div>
    </main>
  );
}

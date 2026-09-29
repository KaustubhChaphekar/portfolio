import { pillars, profile, stats } from "@/lib/data";
import { CountUp, Reveal, SectionHeading } from "../ui";

export default function About() {
  return (
    <section id="about" className="cv-section relative scroll-mt-20 py-28 md:py-40">
      <div className="section">
        <SectionHeading
          index="01"
          eyebrow="About"
          title={
            <>
              I own products <span className="text-muted">from the first commit</span> to the production dashboard.
            </>
          }
        >
          {profile.summary}
        </SectionHeading>

        <Reveal>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col bg-bg/85 p-6 backdrop-blur-xl sm:p-8">
                <dt className="order-2 mt-2 text-sm text-muted">{s.label}</dt>
                <dd className="order-1 font-display text-5xl font-semibold tracking-tight sm:text-6xl">
                  <CountUp value={s.value} suffix={s.suffix} />
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {pillars.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08}>
              <article className="glass h-full rounded-3xl p-7 transition-colors hover:border-line-strong">
                <span className="font-mono text-xs text-cyan">0{i + 1}</span>
                <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{p.body}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <span key={t} className="chip">
                      {t}
                    </span>
                  ))}
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-6">
          <p className="rounded-3xl border border-dashed border-line px-7 py-5 text-sm text-muted">
            <span className="text-ink">Deep expertise:</span> {profile.focus}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

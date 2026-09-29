import { experience } from "@/lib/data";
import { Reveal, SectionHeading } from "../ui";

export default function Experience() {
  return (
    <section id="experience" className="cv-section relative scroll-mt-20 py-28 md:py-40">
      <div className="section">
        <SectionHeading
          index="02"
          eyebrow="Experience"
          title={
            <>
              Tech Lead at <span className="gradient-text">{experience.company}</span>
            </>
          }
        >
          {experience.intro}
        </SectionHeading>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
          <Reveal className="lg:col-span-4">
            <aside className="glass rounded-3xl p-7 lg:sticky lg:top-28">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">{experience.period}</p>
              <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight">{experience.role}</h3>
              <p className="mt-1 text-sm text-muted">
                {experience.company} · {experience.location}
              </p>

              <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.18em] text-faint">Modules shipped</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {experience.modules.map((m) => (
                  <span key={m} className="rounded-xl border border-line bg-white/[0.02] px-3 py-2 text-[13px]">
                    {m}
                  </span>
                ))}
              </div>

              <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.18em] text-faint">Stack</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {experience.stack.map((t) => (
                  <span key={t} className="chip">
                    {t}
                  </span>
                ))}
              </div>
            </aside>
          </Reveal>

          <ol className="relative lg:col-span-8">
            <span className="absolute bottom-2 left-[15px] top-2 w-px bg-gradient-to-b from-cyan/60 via-violet/40 to-transparent" aria-hidden />
            {experience.highlights.map((h, i) => (
              <Reveal as="li" key={h.title} delay={Math.min(i * 0.03, 0.15)} className="group relative flex gap-6 pb-10 last:pb-0">
                  <span className="relative z-10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line-strong bg-bg font-mono text-[11px] text-muted transition-colors group-hover:border-cyan group-hover:text-cyan">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h4 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">{h.title}</h4>
                    <p className="mt-2 max-w-2xl leading-relaxed text-muted">{h.body}</p>
                  </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

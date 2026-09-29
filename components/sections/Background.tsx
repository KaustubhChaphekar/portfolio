import { education, languages } from "@/lib/data";
import { Reveal, SectionHeading } from "../ui";

export default function Background() {
  return (
    <section id="background" className="cv-section relative scroll-mt-20 py-28 md:py-40">
      <div className="section">
        <SectionHeading index="06" eyebrow="Background" title="Computer science, twice over." />

        <div className="grid gap-6 lg:grid-cols-3">
          {education.map((e, i) => (
            <Reveal key={e.degree} delay={i * 0.08}>
              <article className="glass relative h-full overflow-hidden rounded-3xl p-7 sm:p-8">
                <span className="absolute -right-4 -top-6 font-display text-[7rem] font-bold leading-none text-white/[0.03]" aria-hidden>
                  {i === 0 ? "M" : "B"}
                </span>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">{e.period}</p>
                <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight">{e.degree}</h3>
                <p className="mt-2 text-sm text-muted">{e.school}</p>
                <p className="mt-6 inline-flex rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 font-mono text-xs text-cyan">{e.score}</p>
              </article>
            </Reveal>
          ))}

          <Reveal delay={0.16}>
            <article className="glass flex h-full flex-col gap-8 rounded-3xl p-7 sm:p-8">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Languages</p>
                <ul className="mt-4 space-y-3">
                  {languages.map((l) => (
                    <li key={l.name}>
                      <p className="font-display text-lg font-semibold">{l.name}</p>
                      <p className="text-sm text-muted">{l.level}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <a href="#life" className="mt-auto text-sm text-muted transition hover:text-ink">
                Travel, music & photos →
              </a>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

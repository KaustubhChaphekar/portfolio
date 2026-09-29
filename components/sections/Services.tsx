import { processSteps, services } from "@/lib/data";
import { ArrowIcon, Reveal, SectionHeading } from "../ui";

const icons = [
  // browser
  <path key="a" d="M3 6.5A2.5 2.5 0 0 1 5.5 4h13A2.5 2.5 0 0 1 21 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5v-11ZM3 9h18M6.5 6.5h.01M9 6.5h.01" />,
  // app grid
  <path key="b" d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z" />,
  // card
  <path key="c" d="M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 16.5v-9ZM3 10h18M7 15h4" />,
  // cube
  <path key="d" d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Zm0 0v18m8-13.5-8 4.5-8-4.5" />,
  // spark
  <path key="e" d="M12 3v4m0 10v4M3 12h4m10 0h4M6 6l2.5 2.5m7 7L18 18M6 18l2.5-2.5m7-7L18 6" />,
  // gauge
  <path key="f" d="M4 15a8 8 0 1 1 16 0M12 15l4-5M8 19h8" />,
];

export default function Services() {
  return (
    <section id="services" className="cv-section relative scroll-mt-20 py-28 md:py-40">
      <div className="section">
        <SectionHeading index="08" eyebrow="Work with me" title="Need a website or web app? I build it and ship it.">
          I take on freelance projects alongside my work, from a landing page that loads fast to a full SaaS with payments. You deal
          with one person the whole way: design, build, deploy and support.
        </SectionHeading>

        <Reveal>
        <div className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
              <article key={s.title} className="group h-full bg-bg/90 p-7 backdrop-blur-xl transition-colors hover:bg-surface sm:p-8">
                <svg
                  viewBox="0 0 24 24"
                  className="h-7 w-7 text-cyan transition-transform duration-500 group-hover:scale-110"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  {icons[i % icons.length]}
                </svg>
                <h3 className="mt-6 font-display text-xl font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {s.tags.map((t) => (
                    <span key={t} className="chip">
                      {t}
                    </span>
                  ))}
                </div>
              </article>
          ))}
        </div>
        </Reveal>

        <Reveal className="mt-6">
          <div className="glass grid gap-8 rounded-3xl p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {processSteps.map((step, i) => (
                <li key={step.title}>
                  <span className="font-mono text-xs text-cyan">Step {i + 1}</span>
                  <h4 className="mt-2 font-display text-lg font-semibold">{step.title}</h4>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{step.body}</p>
                </li>
              ))}
            </ol>
            <a
              href="#quote"
              className="group inline-flex w-fit items-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-cyan via-violet to-pink px-6 py-3.5 text-sm font-semibold text-bg transition hover:brightness-110"
            >
              Get a free quote
              <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

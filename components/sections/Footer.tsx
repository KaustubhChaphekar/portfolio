import { caseStudies } from "@/lib/case-studies";
import { musicArtist, nav, profile, whatsappLink } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="relative border-t border-line bg-bg/80 backdrop-blur-xl">
      <div className="section py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{profile.name}</p>
            <p className="mt-2 text-muted">
              {profile.role} · {profile.location}
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <a href={`mailto:${profile.email}`} className="text-muted transition hover:text-ink">
                Email
              </a>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="text-muted transition hover:text-ink">
                WhatsApp
              </a>
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted transition hover:text-ink">
                LinkedIn
              </a>
              <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-muted transition hover:text-ink">
                GitHub
              </a>
            </div>
          </div>
          <nav aria-label="Footer" className="grid content-start gap-2 text-sm text-muted">
            <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.18em] text-faint">Site</p>
            {nav.map((n) => (
              <a key={n.href} href={`/${n.href}`} className="w-fit transition hover:text-ink">
                {n.label}
              </a>
            ))}
          </nav>
          <nav aria-label="Case studies" className="grid content-start gap-2 text-sm text-muted">
            <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.18em] text-faint">Case studies</p>
            {caseStudies.map((c) => (
              <a key={c.slug} href={`/work/${c.slug}`} className="w-fit transition hover:text-ink">
                {c.title}
              </a>
            ))}
          </nav>
        </div>
        <div className="mt-12 border-t border-line pt-6 text-xs text-faint">
          <p>
            © {new Date().getFullYear()} {profile.name}. Built with Next.js, React Three Fiber and three.js.
          </p>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-faint">
          Robot by{" "}
          <a href="https://quaternius.com" target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:text-muted hover:underline">
            Quaternius
          </a>{" "}
          (CC0) · HDRI from{" "}
          <a href="https://polyhaven.com" target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:text-muted hover:underline">
            Poly Haven
          </a>{" "}
          (CC0) · Music by {musicArtist}
        </p>
      </div>
    </footer>
  );
}

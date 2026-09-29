const items = [
  "Next.js", "React", "TypeScript", "Node.js", "MongoDB", "Redis", "GCP Pub/Sub", "Cloud Run", "Docker",
  "Razorpay", "three.js", "Tailwind", "Playwright", "Vercel", "Sentry", "PostHog", "AI agents",
];

export default function Marquee() {
  const row = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-line bg-bg/60 py-5 backdrop-blur-xl" aria-hidden>
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-10 font-display text-2xl font-semibold tracking-tight text-ink/40 sm:text-3xl">
            {t}
            <span className="h-1.5 w-1.5 rounded-full bg-cyan/60" />
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-bg to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-bg to-transparent" />
    </div>
  );
}

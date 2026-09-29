import type { Project } from "@/lib/data";

// Hand-built thumbnails for each project card — no screenshots needed.

function AgentArt() {
  const words = ["Stoics", "never", "waste", "a", "morning."];
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-6 bg-[radial-gradient(circle_at_30%_20%,rgb(94_231_255/0.18),transparent_55%),radial-gradient(circle_at_80%_80%,rgb(255_111_174/0.16),transparent_55%)] px-6">
      <div className="relative aspect-[9/16] h-[82%] overflow-hidden rounded-[18px] border border-white/15 bg-gradient-to-b from-[#1b2340] via-[#241a45] to-[#0b0d14] shadow-2xl shadow-violet/20 transition-transform duration-500 group-hover:-rotate-2 group-hover:scale-[1.03]">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-white/10">
          <div className="h-full w-2/3 bg-cyan" />
        </div>
        <div className="absolute inset-x-2 top-[42%] flex flex-wrap justify-center gap-x-1 text-center font-display text-[13px] font-bold leading-tight text-white">
          {words.map((w, i) => (
            <span key={i} className={i === 2 ? "text-[#ffe26b]" : ""}>
              {w}
            </span>
          ))}
        </div>
        <div className="absolute bottom-3 left-2 right-2 flex items-center gap-1.5">
          <span className="h-4 w-4 rounded-full bg-gradient-to-br from-cyan to-violet" />
          <span className="h-1.5 flex-1 rounded bg-white/20" />
        </div>
      </div>
      <ol className="hidden flex-col gap-1.5 sm:flex">
        {["Script", "Voice", "Footage", "Render", "Upload", "Save"].map((s, i) => (
          <li key={s} className="flex items-center gap-2 font-mono text-[11px] text-ink/70">
            <span className={`h-1.5 w-1.5 rounded-full ${i < 4 ? "bg-cyan" : "bg-white/20"}`} />
            {s}
            {i === 3 && <span className="ml-1 text-cyan">●</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}

function BillingArt() {
  const states = [
    { label: "trial", cls: "border-cyan/50 text-cyan" },
    { label: "active", cls: "border-mint/50 text-mint" },
    { label: "expired", cls: "border-pink/50 text-pink" },
  ];
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[radial-gradient(circle_at_50%_0%,rgb(125_255_179/0.14),transparent_60%)]">
      <div className="flex items-center gap-2">
        {states.map((s, i) => (
          <div key={s.label} className="flex items-center gap-2">
            <span className={`rounded-full border bg-bg/70 px-3 py-1 font-mono text-[11px] ${s.cls}`}>{s.label}</span>
            {i < states.length - 1 && (
              <svg width="22" height="8" viewBox="0 0 22 8" aria-hidden>
                <path d="M0 4h20m-3-3 3 3-3 3" stroke="currentColor" className="text-faint" fill="none" />
              </svg>
            )}
          </div>
        ))}
      </div>
      <div className="w-[70%] max-w-[260px] rounded-xl border border-line bg-bg/70 p-3 font-mono text-[10px] text-muted transition-transform duration-500 group-hover:-translate-y-1">
        <div className="flex justify-between"><span>Plan upgrade</span><span className="text-ink">monthly</span></div>
        <div className="flex justify-between"><span>Proration</span><span className="text-mint">applied</span></div>
        <div className="flex justify-between"><span>Add-on · seats</span><span className="text-ink">+2</span></div>
        <div className="mt-2 flex justify-between border-t border-line pt-2"><span>₹1 mandate</span><span className="text-cyan">verified ✓</span></div>
      </div>
    </div>
  );
}

function WorkersArt() {
  const workers = ["campaign", "pdf→dwg", "expiry", "email", "billing"];
  return (
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgb(155_140_255/0.2),transparent_55%)]">
      <svg viewBox="0 0 320 180" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden>
        {workers.map((_, i) => {
          const y = 22 + i * 34;
          return (
            <path
              key={i}
              d={`M92 90 C 150 90, 150 ${y}, 196 ${y}`}
              fill="none"
              stroke="url(#wg)"
              strokeWidth="1.2"
              strokeDasharray="4 8"
              className="animate-dash"
            />
          );
        })}
        <defs>
          <linearGradient id="wg" x1="0" x2="1">
            <stop offset="0" stopColor="#9b8cff" />
            <stop offset="1" stopColor="#5ee7ff" />
          </linearGradient>
        </defs>
        <rect x="18" y="70" width="74" height="40" rx="10" fill="#0b0d14" stroke="#9b8cff" strokeOpacity=".6" />
        <text x="55" y="88" textAnchor="middle" fill="#eef0f6" fontSize="10" fontFamily="monospace">Pub/Sub</text>
        <text x="55" y="101" textAnchor="middle" fill="#8b91a5" fontSize="8" fontFamily="monospace">topic</text>
        {workers.map((w, i) => (
          <g key={w} transform={`translate(196 ${10 + i * 34})`}>
            <rect width="104" height="24" rx="7" fill="#0b0d14" stroke="#5ee7ff" strokeOpacity=".35" />
            <circle cx="12" cy="12" r="3" fill="#7dffb3" />
            <text x="22" y="15.5" fill="#eef0f6" fontSize="9" fontFamily="monospace">{w}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function ExploreArt() {
  const tiles = [
    "from-cyan/40 to-violet/20 row-span-2",
    "from-pink/40 to-violet/10",
    "from-[#ffe26b]/30 to-pink/10 row-span-2",
    "from-violet/40 to-cyan/10",
    "from-mint/30 to-cyan/10",
    "from-pink/30 to-[#ffb86b]/20",
  ];
  return (
    <div className="absolute inset-0 flex flex-col gap-3 bg-[radial-gradient(circle_at_80%_10%,rgb(255_111_174/0.14),transparent_55%)] p-6">
      <div className="flex items-center gap-2 rounded-full border border-line bg-bg/70 px-3 py-1.5 font-mono text-[10px] text-muted">
        <svg width="10" height="10" viewBox="0 0 16 16" aria-hidden>
          <circle cx="7" cy="7" r="5" stroke="currentColor" fill="none" strokeWidth="1.6" />
          <path d="m11 11 3.5 3.5" stroke="currentColor" strokeWidth="1.6" />
        </svg>
        modern living room
        <span className="ml-auto rounded-full bg-pink/15 px-2 text-pink">trending</span>
      </div>
      <div className="grid flex-1 auto-rows-fr grid-cols-4 gap-2">
        {tiles.map((t, i) => (
          <div
            key={i}
            className={`rounded-lg bg-gradient-to-br ${t} border border-white/5 transition-transform duration-500 group-hover:scale-[1.03]`}
            style={{ transitionDelay: `${i * 30}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

function FinanceArt() {
  const points = [62, 58, 66, 54, 60, 48, 52, 40, 46, 34, 38, 26, 30, 22];
  const d = points.map((y, i) => `${i === 0 ? "M" : "L"}${10 + i * 22} ${y + 50}`).join(" ");
  return (
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgb(94_231_255/0.16),transparent_55%)]">
      <svg viewBox="0 0 320 180" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden>
        <defs>
          <linearGradient id="fa" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5ee7ff" stopOpacity=".35" />
            <stop offset="1" stopColor="#5ee7ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1="10" x2="310" y1={40 + i * 36} y2={40 + i * 36} stroke="#ffffff" strokeOpacity=".05" />
        ))}
        <path d={`${d} L 296 160 L 10 160 Z`} fill="url(#fa)" />
        <path d={d} fill="none" stroke="#5ee7ff" strokeWidth="2" strokeLinejoin="round" />
        <circle cx={10 + 13 * 22} cy={points[13] + 50} r="4" fill="#5ee7ff" />
        <circle cx={10 + 13 * 22} cy={points[13] + 50} r="9" fill="#5ee7ff" opacity=".25" className="animate-ping origin-center [transform-box:fill-box]" />
        <g fontFamily="monospace" fontSize="9">
          <rect x="16" y="14" width="96" height="22" rx="6" fill="#0b0d14" stroke="#ffffff" strokeOpacity=".1" />
          <text x="24" y="28.5" fill="#7dffb3">▲ balance</text>
          <rect x="200" y="14" width="104" height="22" rx="6" fill="#0b0d14" stroke="#ffffff" strokeOpacity=".1" />
          <text x="208" y="28.5" fill="#8b91a5">● live updates</text>
        </g>
      </svg>
    </div>
  );
}

export default function ProjectArt({ art }: { art: Project["art"] }) {
  switch (art) {
    case "agent":
      return <AgentArt />;
    case "billing":
      return <BillingArt />;
    case "workers":
      return <WorkersArt />;
    case "explore":
      return <ExploreArt />;
    case "finance":
      return <FinanceArt />;
  }
}

import type { FlowLane } from "@/lib/case-studies";

const LANE_COLORS = ["#5ee7ff", "#9b8cff", "#ff6fae", "#7dffb3"];

// Lanes left→right on wide screens, top→bottom on phones; nodes flow inside each lane.
export default function FlowDiagram({ lanes }: { lanes: FlowLane[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[repeat(var(--lanes),minmax(0,1fr))]" style={{ ["--lanes" as string]: lanes.length }}>
      {lanes.map((lane, li) => {
        const color = LANE_COLORS[li % LANE_COLORS.length];
        return (
          <div key={lane.title} className="relative">
            <div className="h-full rounded-2xl border border-line bg-bg/60 p-4">
              <p className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
                {lane.title}
              </p>
              <ol className="flex flex-col">
                {lane.nodes.map((node, ni) => (
                  <li key={node.label} className="flex flex-col items-stretch">
                    <div className="rounded-xl border border-line-strong bg-surface-2/80 px-3.5 py-2.5">
                      <p className="text-sm font-semibold">{node.label}</p>
                      {node.detail && <p className="mt-0.5 text-xs leading-snug text-muted">{node.detail}</p>}
                    </div>
                    {ni < lane.nodes.length - 1 && (
                      <svg viewBox="0 0 12 18" className="mx-auto h-4 w-3" aria-hidden>
                        <path d="M6 0v14m-4-4 4 4 4-4" fill="none" stroke={color} strokeOpacity=".7" strokeWidth="1.4" />
                      </svg>
                    )}
                  </li>
                ))}
              </ol>
            </div>
            {li < lanes.length - 1 && (
              <span
                className="absolute -bottom-4 left-1/2 z-10 flex h-4 w-4 -translate-x-1/2 items-center justify-center text-faint lg:-right-4 lg:bottom-auto lg:left-auto lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-0"
                aria-hidden
              >
                <svg viewBox="0 0 16 16" className="h-4 w-4 rotate-90 lg:rotate-0">
                  <path d="M3 8h9m-3-3 3 3-3 3" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

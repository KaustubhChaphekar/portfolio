"use client";

import { setEffects, usePrefs } from "@/lib/prefs";

// Lets visitors switch the live 3D scenes off (battery, motion) or force them on.
export default function EffectsToggle() {
  const { quality, effects } = usePrefs();
  // Before the device check runs, reflect the visitor's own choice.
  const on = quality === "pending" ? effects !== "off" : quality === "full";
  return (
    <button
      type="button"
      onClick={() => setEffects(on ? "off" : "on")}
      aria-pressed={on}
      className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs text-muted transition hover:border-line-strong hover:text-ink"
    >
      <span className={`relative inline-flex h-3.5 w-6 rounded-full transition-colors ${on ? "bg-cyan/70" : "bg-white/15"}`}>
        <span className={`absolute top-0.5 h-2.5 w-2.5 rounded-full bg-bg transition-all ${on ? "left-3" : "left-0.5"}`} />
      </span>
      3D effects {on ? "on" : "off"}
    </button>
  );
}

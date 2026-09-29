"use client";

import { useEffect, useState } from "react";
import { musicArtist } from "@/lib/data";
import { usePrefs } from "@/lib/prefs";
import { onTrackChange, startSound, stopSound } from "@/lib/sound";

export default function SoundToggle({ className = "" }: { className?: string }) {
  const { sound } = usePrefs();
  const [title, setTitle] = useState<string | null>(null);

  useEffect(() => onTrackChange(setTitle), []);

  const label = sound ? `Sound on${title ? `: ${title} by ${musicArtist}` : ""}. Click to mute.` : "Turn on ambient music";

  return (
    <button
      type="button"
      onClick={() => (sound ? stopSound() : startSound())}
      aria-pressed={sound}
      aria-label={label}
      title={label}
      className={`group flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface/60 backdrop-blur transition hover:border-line-strong ${className}`}
    >
      <span className="flex h-4 items-end gap-[3px]" aria-hidden>
        {[0.55, 1, 0.7, 0.4].map((h, i) => (
          <span
            key={i}
            className={`w-[3px] origin-bottom rounded-full ${sound ? "bg-cyan" : "bg-muted group-hover:bg-ink"}`}
            style={{
              height: sound ? `${h * 100}%` : "3px",
              animation: sound ? `eq 0.9s ease-in-out ${i * 0.15}s infinite alternate` : "none",
              transition: "height .3s ease",
            }}
          />
        ))}
      </span>
    </button>
  );
}

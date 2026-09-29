"use client";

import { useEffect, useState } from "react";
import { music, musicArtist, photos, places, type Place } from "@/lib/data";
import { usePrefs } from "@/lib/prefs";
import { blip, onTrackChange, startSound, stopSound } from "@/lib/sound";
import { GlobeStage } from "../three/Backdrops";
import { Reveal, SectionHeading } from "../ui";
import Gallery from "./Gallery";

const KIND: Record<Place["kind"], { label: string; color: string }> = {
  home: { label: "Home", color: "#5ee7ff" },
  studied: { label: "Studied", color: "#9b8cff" },
  visited: { label: "Visited", color: "#ff6fae" },
};

function MusicCard() {
  const { sound } = usePrefs();
  const [title, setTitle] = useState<string | null>(null);
  useEffect(() => onTrackChange(setTitle), []);

  return (
    <div className="glass relative overflow-hidden rounded-3xl p-6">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet/20 blur-3xl" aria-hidden />
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">Feeling the music</p>
      <div className="mt-4 flex items-center gap-4">
        <button
          type="button"
          onClick={() => (sound ? stopSound() : startSound())}
          aria-pressed={sound}
          aria-label={sound ? "Pause the ambient music" : "Play ambient music while you browse"}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-ink text-bg transition hover:bg-cyan"
        >
          {sound ? (
            <svg viewBox="0 0 16 16" className="h-5 w-5" fill="currentColor" aria-hidden>
              <rect x="3.5" y="3" width="3" height="10" rx="1" />
              <rect x="9.5" y="3" width="3" height="10" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" className="ml-0.5 h-5 w-5" fill="currentColor" aria-hidden>
              <path d="M4.5 2.8v10.4a.6.6 0 0 0 .9.5l8.2-5.2a.6.6 0 0 0 0-1L5.4 2.3a.6.6 0 0 0-.9.5Z" />
            </svg>
          )}
        </button>
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-semibold">{sound ? (title ?? music[0].title) : "Play something while you browse"}</p>
          <p className="truncate text-xs text-muted">{sound ? musicArtist : `${music.length} calm ambient tracks · off by default`}</p>
        </div>
        {sound && (
          <span className="ml-auto flex h-6 items-end gap-[3px]" aria-hidden>
            {[0.5, 1, 0.7, 0.4, 0.85].map((h, i) => (
              <span
                key={i}
                className="w-[3px] origin-bottom rounded-full bg-cyan"
                style={{ height: `${h * 100}%`, animation: `eq 0.9s ease-in-out ${i * 0.12}s infinite alternate` }}
              />
            ))}
          </span>
        )}
      </div>
    </div>
  );
}

export default function OffScreen() {
  const [active, setActive] = useState(0);
  const place = places[active];
  const trips = places.filter((p) => p.kind === "visited").length;

  const pick = (i: number) => {
    setActive(i);
    blip(560 + i * 60);
  };

  return (
    <section id="life" className="cv-section relative scroll-mt-20 py-28 md:py-40">
      <div className="section">
        <SectionHeading index="07" eyebrow="Off-screen" title="Exploring distant lands, feeling the music, capturing moments.">
          Life outside the editor. Pick a place to fly the globe there, or put some music on while you look around.
        </SectionHeading>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-b from-surface-2/70 to-bg/70">
              <div className="aspect-square max-h-[560px] w-full sm:aspect-[4/3]">
                <GlobeStage
                  markers={places.map((p) => ({ lat: p.lat, lon: p.lon, color: KIND[p.kind].color }))}
                  activeIndex={active}
                  draggable
                  label="A 3D globe with pins on places I've lived, studied and travelled to"
                />
              </div>
              <div className="pointer-events-none absolute left-4 top-4 max-w-[75%] rounded-2xl border border-line bg-bg/75 px-4 py-3 backdrop-blur-xl sm:left-5 sm:top-5">
                <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: KIND[place.kind].color }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: KIND[place.kind].color }} />
                  {KIND[place.kind].label}
                  {place.year && <span className="text-faint">· {place.year}</span>}
                </p>
                <p className="mt-1 font-display text-xl font-semibold">
                  {place.name}
                  <span className="text-sm font-normal text-muted">, {place.country}</span>
                </p>
                {place.note && <p className="mt-0.5 text-sm text-muted">{place.note}</p>}
              </div>
              <p className="pointer-events-none absolute bottom-4 right-5 hidden font-mono text-[10px] text-faint md:block">drag to spin</p>
            </div>
          </Reveal>

          <Reveal className="flex flex-col gap-6 lg:col-span-5" delay={0.1}>
            <div className="glass rounded-3xl p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                On the map {trips > 0 && <span className="text-faint">· {trips} trips and counting</span>}
              </p>
              <ul className="mt-4 flex flex-col gap-2">
                {places.map((p, i) => (
                  <li key={`${p.name}-${i}`}>
                    <button
                      type="button"
                      onClick={() => pick(i)}
                      aria-pressed={i === active}
                      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                        i === active ? "border-line-strong bg-white/[0.05]" : "border-line hover:border-line-strong"
                      }`}
                    >
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: KIND[p.kind].color, boxShadow: `0 0 10px ${KIND[p.kind].color}` }} />
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium">{p.name}</span>
                        <span className="block truncate text-xs text-muted">{p.note ?? p.country}</span>
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-faint">{KIND[p.kind].label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <MusicCard />
          </Reveal>
        </div>

        {photos.length > 0 && (
          <Reveal className="mt-12">
            <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">Capturing moments</p>
            <Gallery photos={photos} />
          </Reveal>
        )}
      </div>
    </section>
  );
}

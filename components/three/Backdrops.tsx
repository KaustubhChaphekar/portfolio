"use client";

import Image, { getImageProps } from "next/image";
import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { ensureQuality, usePrefs } from "@/lib/prefs";
import { GlobeScene, HeroScene, RobotScene, SkillsScene } from "./index";

// Each 3D scene has a still-image twin (public/fallback/, made by `npm run capture:fallbacks`).
// Devices without a GPU, low-memory phones, data-saver and reduced-motion visitors get the
// stills, and never download three.js at all.

// Scenes further down the page only trigger the device check when they get close,
// so a first visit never pays for it before it's needed.
function NearStage({ children, onNear }: { children: ReactNode; onNear: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        onNear();
        io.disconnect();
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [onNear]);
  return (
    <div ref={ref} className="h-full w-full">
      {children}
    </div>
  );
}

function HeroStill({ hidden = false }: { hidden?: boolean }) {
  const common = { alt: "", sizes: "100vw", quality: 70 };
  const {
    props: { srcSet: wide },
  } = getImageProps({ ...common, src: "/fallback/hero-wide.jpg", width: 1440, height: 900 });
  const {
    props: { srcSet: narrow, ...rest },
  } = getImageProps({ ...common, src: "/fallback/hero-narrow.jpg", width: 780, height: 1688 });
  return (
    <div
      className={`pointer-events-none absolute inset-x-0 top-0 -z-10 h-[100svh] overflow-hidden transition-opacity duration-1000 ${hidden ? "opacity-0" : "opacity-100"}`}
      aria-hidden
    >
      <picture>
        <source media="(min-width: 900px)" srcSet={wide} />
        <source media="(max-width: 899px)" srcSet={narrow} />
        {/* eslint-disable-next-line jsx-a11y/alt-text -- decorative; alt="" comes from getImageProps */}
        <img {...rest} className="hero-drift h-full w-full object-cover" fetchPriority="high" />
      </picture>
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg" />
    </div>
  );
}

// Everyone sees the still first (it's in the server HTML, so it paints immediately).
// On larger screens, capable devices then boot the live scene once the browser is idle
// and crossfade to it. Phones keep the (gently drifting) still unless 3D is switched on,
// which keeps their first load light; the other scenes still go live as you scroll.
export function HeroBackdrop() {
  const { quality, effects } = usePrefs();

  // Only screens that will run the live hero need the device check up front.
  useEffect(() => {
    if (effects === "on" || window.matchMedia("(min-width: 900px)").matches) ensureQuality();
  }, [effects]);
  const [boot, setBoot] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (quality !== "full") return;
    if (effects !== "on" && !window.matchMedia("(min-width: 900px)").matches) return;
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setBoot(true), { timeout: 2500 });
      return () => w.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(() => setBoot(true), 1200);
    return () => window.clearTimeout(id);
  }, [quality, effects]);

  const live = quality === "full" && boot;
  return (
    <>
      <HeroStill hidden={live && ready} />
      {live && <HeroScene visible={ready} onReady={() => setReady(true)} />}
    </>
  );
}

function Still({ src, sizes }: { src: string; sizes: string }) {
  return (
    <div className="relative h-full w-full">
      <Image src={src} alt="" fill sizes={sizes} className="object-contain" />
    </div>
  );
}

// While the check is pending (or on weak devices) each stage shows its still image.
export function RobotStage(props: ComponentProps<typeof RobotScene>) {
  const { quality } = usePrefs();
  return (
    <NearStage onNear={ensureQuality}>
      {quality === "full" ? <RobotScene {...props} /> : <Still src="/fallback/robot.png" sizes="(min-width: 1024px) 690px, 100vw" />}
    </NearStage>
  );
}

export function SkillsStage(props: ComponentProps<typeof SkillsScene>) {
  const { quality } = usePrefs();
  return (
    <NearStage onNear={ensureQuality}>
      {quality === "full" ? <SkillsScene {...props} /> : <Still src="/fallback/skills.png" sizes="(min-width: 1024px) 640px, 100vw" />}
    </NearStage>
  );
}

export function GlobeStage(props: ComponentProps<typeof GlobeScene>) {
  const { quality } = usePrefs();
  return (
    <NearStage onNear={ensureQuality}>
      {quality === "full" ? <GlobeScene {...props} /> : <Still src="/fallback/globe.png" sizes="(min-width: 1024px) 485px, 100vw" />}
    </NearStage>
  );
}

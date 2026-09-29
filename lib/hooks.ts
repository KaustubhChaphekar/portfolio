"use client";

import { useEffect, useState } from "react";

// clientOnly: the component never renders on the server, so read the real value up front
// instead of starting at false (avoids building a scene twice).
export function useMediaQuery(query: string, clientOnly = false) {
  const [matches, setMatches] = useState(() => clientOnly && typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return matches;
}

export const useReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");

// Pointer position in normalized device coordinates (-1..1), shared by every scene.
// The hero canvas sits behind the page with pointer-events off, so R3F can't track it itself.
export const pointer = { x: 0, y: 0 };

let tracking = false;
export function trackPointer() {
  if (tracking || typeof window === "undefined") return;
  tracking = true;
  window.addEventListener(
    "pointermove",
    (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    },
    { passive: true },
  );
}

export function useLocalTime(timeZone: string) {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-IN", { timeZone, hour: "2-digit", minute: "2-digit", hour12: false });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, [timeZone]);
  return time;
}

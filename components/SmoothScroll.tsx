"use client";

import { ReactLenis } from "lenis/react";
import { useEffect, type ReactNode } from "react";
import { useReducedMotion } from "@/lib/hooks";

// Sections use content-visibility (see .cv-section). Before the first in-page jump — or when
// the page opens on a #hash — render them all so scroll targets are measured exactly.
function useRenderAllBeforeJumps() {
  useEffect(() => {
    const root = document.documentElement;
    const renderAll = () => root.classList.add("cv-off");
    if (window.location.hash) renderAll();
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.("a[href*='#']");
      if (link) renderAll();
    };
    window.addEventListener("click", onClick, { capture: true });
    return () => window.removeEventListener("click", onClick, { capture: true });
  }, []);
}

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  useRenderAllBeforeJumps();
  if (reduced) return <>{children}</>;
  return (
    <ReactLenis root options={{ lerp: 0.1, smoothWheel: true, anchors: true }}>
      {children}
    </ReactLenis>
  );
}

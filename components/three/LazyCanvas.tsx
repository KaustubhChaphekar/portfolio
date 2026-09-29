"use client";

import { Canvas, type CanvasProps } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";

type Props = CanvasProps & { wrapperClassName?: string; label: string };

// Mounts the WebGL canvas only once it scrolls near the viewport, and stops
// rendering while it is off-screen, so several scenes can share one page.
export default function LazyCanvas({ wrapperClassName, label, children, ...canvasProps }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting) setMounted(true);
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={wrapperClassName} role="img" aria-label={label}>
      {mounted && (
        <Canvas
          frameloop={visible ? "always" : "never"}
          dpr={[1, 1.75]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          fallback={<div className="h-full w-full" />}
          {...canvasProps}
        >
          {children}
        </Canvas>
      )}
    </div>
  );
}

"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";

// Drag-to-rotate for a canvas that works with a mouse and with touch. On touch screens the
// canvas uses touch-action: pan-y, so vertical swipes keep scrolling the page and horizontal
// swipes rotate the scene.
export function useCanvasDrag(enabled: boolean, onMove: (dx: number, dy: number, mouse: boolean) => void) {
  const gl = useThree((s) => s.gl);
  const state = useRef({ active: false, id: -1, x: 0, y: 0, mouse: false });
  const handler = useRef(onMove);

  useEffect(() => {
    handler.current = onMove;
  });

  useEffect(() => {
    if (!enabled) return;
    const el = gl.domElement;
    const previousTouchAction = el.style.touchAction;
    el.style.touchAction = "pan-y";

    const down = (e: PointerEvent) => {
      if (e.button > 0) return;
      const mouse = e.pointerType === "mouse";
      Object.assign(state.current, { active: true, id: e.pointerId, x: e.clientX, y: e.clientY, mouse });
      if (mouse) document.body.style.cursor = "grabbing";
    };
    const move = (e: PointerEvent) => {
      const s = state.current;
      if (!s.active || e.pointerId !== s.id) return;
      const dx = e.clientX - s.x;
      const dy = e.clientY - s.y;
      s.x = e.clientX;
      s.y = e.clientY;
      handler.current(dx, dy, s.mouse);
    };
    // pointercancel fires when the browser takes over a vertical swipe to scroll.
    const up = (e: PointerEvent) => {
      if (e.pointerId !== state.current.id) return;
      state.current.active = false;
      document.body.style.cursor = "";
    };

    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      el.style.touchAction = previousTouchAction;
    };
  }, [enabled, gl]);

  return state;
}

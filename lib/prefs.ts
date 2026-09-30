"use client";

import { useSyncExternalStore } from "react";

// Visitor preferences shared by every component: 3D effects mode and sound.
// Quality stays "pending" until a page that actually has 3D asks for it (ensureQuality),
// so pages without scenes never pay for the GPU check.

export type Quality = "pending" | "full" | "static";
export type EffectsPref = "auto" | "on" | "off";

type State = { quality: Quality; effects: EffectsPref; sound: boolean };

let state: State = { quality: "pending", effects: "auto", sound: false };
const listeners = new Set<() => void>();
const serverState: State = state;

function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function read(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Private mode or blocked storage — the preference just won't persist.
  }
}

// Weak or GPU-less devices get still images instead of live WebGL.
function cheapChecksSayStatic() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return true;
  if (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) return true;
  if (nav.hardwareConcurrency && nav.hardwareConcurrency <= 2) return true;
  return false;
}

// Creates a throwaway WebGL context and reports whether it's a real GPU. Its source also runs
// in a Web Worker (via OffscreenCanvas) so the check never blocks the page — so it must only
// use its argument and browser globals. failIfMajorPerformanceCaveat makes software renderers
// refuse quickly.
function probe(canvas: HTMLCanvasElement | OffscreenCanvas): Quality {
  try {
    const gl = canvas.getContext("webgl", { failIfMajorPerformanceCaveat: true }) as WebGLRenderingContext | null;
    if (!gl) return "static";
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return /swiftshader|llvmpipe|software|basic render/i.test(renderer) ? "static" : "full";
  } catch {
    return "static";
  }
}

function probeInWorker(): Promise<Quality | null> {
  if (typeof Worker === "undefined" || typeof OffscreenCanvas === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    let url = "";
    let worker: Worker | null = null;
    const finish = (result: Quality | null) => {
      window.clearTimeout(timer);
      worker?.terminate();
      if (url) URL.revokeObjectURL(url);
      resolve(result);
    };
    const timer = window.setTimeout(() => finish(null), 4000);
    try {
      url = URL.createObjectURL(
        new Blob([`self.onmessage = () => self.postMessage((${probe.toString()})(new OffscreenCanvas(1, 1)));`], {
          type: "text/javascript",
        }),
      );
      worker = new Worker(url);
      worker.onmessage = (e) => finish(e.data === "full" || e.data === "static" ? e.data : null);
      worker.onerror = () => finish(null);
      worker.postMessage(0);
    } catch {
      finish(null);
    }
  });
}

async function detectQuality(): Promise<Quality> {
  if (cheapChecksSayStatic()) return "static";
  return (await probeInWorker()) ?? probe(document.createElement("canvas"));
}

let initialised = false;
export function initPrefs() {
  if (initialised || typeof window === "undefined") return;
  initialised = true;
  // ?effects=on|off|auto overrides and remembers the choice (handy for testing and sharing).
  const param = new URLSearchParams(window.location.search).get("effects");
  if (param === "on" || param === "off" || param === "auto") write("effects", param);
  const stored = read("effects");
  const effects: EffectsPref = stored === "on" || stored === "off" ? stored : "auto";
  set({
    effects,
    sound: read("sound") === "on",
    quality: effects === "on" ? "full" : effects === "off" ? "static" : "pending",
  });
}

let probing = false;
// Called by components that render 3D. Runs the device check once, when the browser is idle.
export function ensureQuality() {
  if (state.quality !== "pending" || probing || typeof window === "undefined") return;
  probing = true;
  const run = () => {
    detectQuality().then((quality) => {
      // A visitor may have forced a mode meanwhile (?effects=on/off); don't override it.
      if (state.quality === "pending") set({ quality });
    });
  };
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
  if (w.requestIdleCallback) w.requestIdleCallback(run, { timeout: 1500 });
  else window.setTimeout(run, 300);
}

// Called when a live scene can't hold its frame rate.
export function degradeToStatic() {
  if (state.effects !== "on") set({ quality: "static" });
}

export function setSoundPref(sound: boolean) {
  write("sound", sound ? "on" : "off");
  set({ sound });
}

export const getPrefs = () => state;

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function usePrefs() {
  return useSyncExternalStore(subscribe, () => state, () => serverState);
}

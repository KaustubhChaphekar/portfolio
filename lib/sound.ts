"use client";

import { music } from "./data";
import { setSoundPref } from "./prefs";

// Ambient music + tiny UI blips. Nothing downloads until the visitor turns sound on.

const VOLUME = 0.32;
let audio: HTMLAudioElement | null = null;
let track = 0;
let fadeTimer: ReturnType<typeof setInterval> | null = null;
let ctx: AudioContext | null = null;
let enabled = false;
const trackListeners = new Set<(title: string | null) => void>();

function notify() {
  const title = enabled ? music[track].title : null;
  trackListeners.forEach((l) => l(title));
}

function fadeTo(target: number, ms: number, done?: () => void) {
  if (!audio) return;
  if (fadeTimer) clearInterval(fadeTimer);
  const a = audio;
  const start = a.volume;
  const steps = Math.max(1, Math.round(ms / 40));
  let i = 0;
  fadeTimer = setInterval(() => {
    i++;
    a.volume = Math.min(1, Math.max(0, start + (target - start) * (i / steps)));
    if (i >= steps) {
      if (fadeTimer) clearInterval(fadeTimer);
      fadeTimer = null;
      done?.();
    }
  }, 40);
}

function ensureAudio() {
  if (audio) return audio;
  audio = new Audio();
  audio.preload = "none";
  audio.volume = 0;
  audio.addEventListener("ended", () => {
    track = (track + 1) % music.length;
    if (audio) {
      audio.src = music[track].src;
      audio.play().catch(() => {});
    }
    notify();
  });
  audio.src = music[track].src;
  document.addEventListener("visibilitychange", () => {
    if (!audio || !enabled) return;
    if (document.hidden) audio.pause();
    else audio.play().catch(() => {});
  });
  return audio;
}

export async function startSound() {
  enabled = true;
  setSoundPref(true);
  const a = ensureAudio();
  try {
    await a.play();
    fadeTo(VOLUME, 1200);
  } catch {
    // Autoplay blocked until the next user gesture — try again then.
    const retry = () => {
      if (enabled) a.play().then(() => fadeTo(VOLUME, 1200)).catch(() => {});
    };
    window.addEventListener("pointerdown", retry, { once: true });
    window.addEventListener("keydown", retry, { once: true });
  }
  notify();
}

export function stopSound() {
  enabled = false;
  setSoundPref(false);
  if (audio) {
    const a = audio;
    fadeTo(0, 500, () => a.pause());
  }
  notify();
}

export function onTrackChange(listener: (title: string | null) => void) {
  trackListeners.add(listener);
  return () => {
    trackListeners.delete(listener);
  };
}

// A short, soft sine "tick" for interactions — only while sound is on.
export function blip(freq = 660, duration = 0.09) {
  if (!enabled) return;
  try {
    ctx ??= new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.06, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  } catch {
    // Web Audio unavailable — silence is fine.
  }
}

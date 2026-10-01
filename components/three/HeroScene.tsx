"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { Bloom, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { pointer, trackPointer, useMediaQuery, useReducedMotion } from "@/lib/hooks";
import { degradeToStatic } from "@/lib/prefs";
import { pointsFragment, pointsVertex } from "./glsl";
import ParticlePortrait from "./ParticlePortrait";

const scrollProgress = () => (typeof window === "undefined" ? 0 : window.scrollY / window.innerHeight);
const smooth = (e0: number, e1: number, x: number) => THREE.MathUtils.smoothstep(x, e0, e1);

// Seeded PRNG (mulberry32) so the galaxy is identical on every visit and render stays pure.
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Place = (i: number, out: THREE.Vector3, color: THREE.Color, rand: () => number) => void;

function makePoints(count: number, seed: number, place: Place) {
  const rand = seeded(seed);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const v = new THREE.Vector3();
  const c = new THREE.Color();
  for (let i = 0; i < count; i++) {
    place(i, v, c, rand);
    v.toArray(positions, i * 3);
    c.toArray(colors, i * 3);
    scales[i] = 0.3 + rand() * 0.9;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
  geo.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
  return geo;
}

function pointsMaterial(size: number) {
  return new THREE.ShaderMaterial({
    vertexShader: pointsVertex,
    fragmentShader: pointsFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: size },
      uPixelRatio: { value: 1 },
      uOpacity: { value: 1 },
    },
  });
}

// A spiral disc of particles turned toward the camera, forming a halo behind the portrait.
function Galaxy({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const gl = useThree((s) => s.gl);
  const geometry = useMemo(() => {
    const inner = new THREE.Color("#5ee7ff");
    const mid = new THREE.Color("#9b8cff");
    const outer = new THREE.Color("#ff6fae");
    const arms = 3;
    return makePoints(count, 7, (i, v, c, rand) => {
      const radius = 3.0 + Math.pow(rand(), 1.6) * 5.0;
      const arm = ((i % arms) / arms) * Math.PI * 2;
      const spin = radius * 0.55;
      const spread = 0.35 * (radius - 1.6);
      const jitter = () => Math.pow(rand(), 3) * (rand() < 0.5 ? 1 : -1) * spread;
      const rx = jitter();
      const ry = jitter() * 0.35;
      const rz = jitter();
      v.set(Math.cos(arm + spin) * radius + rx, ry, Math.sin(arm + spin) * radius + rz);
      const k = (radius - 3.0) / 5.0;
      c.copy(inner).lerp(mid, Math.min(1, k * 2)).lerp(outer, Math.max(0, k * 2 - 1));
    });
  }, [count]);
  const material = useMemo(() => pointsMaterial(46), []);

  useFrame((state, delta) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uPixelRatio.value = gl.getPixelRatio();
    material.uniforms.uOpacity.value = 0.75 * (1 - 0.65 * smooth(0.5, 1.6, scrollProgress()));
    if (ref.current) ref.current.rotation.y += delta * 0.03;
  });

  return <points ref={ref} geometry={geometry} material={material} position={[0, 0.2, -3.4]} rotation={[1.25, 0, 0.2]} />;
}

function Stars({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const gl = useThree((s) => s.gl);
  const geometry = useMemo(() => {
    const white = new THREE.Color("#cfd6ff");
    const tint = new THREE.Color("#9b8cff");
    return makePoints(count, 42, (_, v, c, rand) => {
      // Uniform direction on a sphere, then a random distance.
      const u = rand() * 2 - 1;
      const phi = rand() * Math.PI * 2;
      const r = Math.sqrt(1 - u * u);
      v.set(r * Math.cos(phi), u, r * Math.sin(phi)).multiplyScalar(12 + rand() * 28);
      c.copy(white).lerp(tint, rand() * 0.6);
    });
  }, [count]);
  const material = useMemo(() => pointsMaterial(60), []);

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uPixelRatio.value = gl.getPixelRatio();
    // Scroll parallax — the whole sky turns slowly as you move down the page.
    if (ref.current) {
      ref.current.rotation.y = scrollProgress() * 0.12 + state.clock.elapsedTime * 0.004;
      ref.current.rotation.x = scrollProgress() * 0.05;
    }
  });

  return <points ref={ref} geometry={geometry} material={material} />;
}

function Rig({ wide, reduced, onPortraitLoaded }: { wide: boolean; reduced: boolean; onPortraitLoaded: () => void }) {
  const hero = useRef<THREE.Group>(null);
  const { camera, invalidate } = useThree();

  // In "demand" mode (scrolled past the hero) scrolling still redraws the sky.
  useEffect(() => {
    const onScroll = () => invalidate();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [invalidate]);

  useFrame((_, delta) => {
    const p = scrollProgress();
    const k = smooth(0, 1.2, p);
    camera.position.x = THREE.MathUtils.damp(camera.position.x, pointer.x * 0.5, 2.5, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, pointer.y * 0.35, 2.5, delta);
    camera.lookAt(0, 0, 0);
    if (hero.current) {
      const baseX = wide ? 2.6 : 0;
      const baseY = wide ? -0.2 : 1.02;
      hero.current.position.x = baseX + k * (wide ? 1.2 : 0);
      hero.current.position.y = baseY + k * 2.2;
      hero.current.scale.setScalar((wide ? 0.8 : 0.55) * (1 - 0.3 * k));
    }
  });

  return (
    <group ref={hero}>
      <ParticlePortrait count={wide ? 22000 : 11000} reduced={reduced} dim={wide ? 1 : 0.8} scroll={scrollProgress} onLoaded={onPortraitLoaded} />
      <Galaxy count={wide ? 5000 : 2200} />
    </group>
  );
}

// Reports the first rendered frames, so the page can crossfade from the still image.
function ReadySignal({ enabled, onReady }: { enabled: boolean; onReady?: () => void }) {
  const frames = useRef(0);
  const done = useRef(false);
  useFrame(() => {
    if (!enabled || done.current || ++frames.current < 3) return;
    done.current = true;
    onReady?.();
  });
  return null;
}

// Switches the site to still images only when this device truly can't keep up: under 20 fps
// for two 4-second windows in a row. Hitches (a tab switch, a long scroll pause) are skipped,
// and nothing is measured while the hero is off screen or during the first seconds of shader setup.
function SlowDeviceWatchdog({ enabled }: { enabled: boolean }) {
  const s = useRef({ time: 0, frames: 0, warmup: 3, strikes: 0, done: false });
  useFrame((_, delta) => {
    const w = s.current;
    if (!enabled || w.done || delta > 0.25) return;
    if (w.warmup > 0) {
      w.warmup -= delta;
      return;
    }
    w.time += delta;
    w.frames += 1;
    if (w.time < 4) return;
    const fps = w.frames / w.time;
    w.time = 0;
    w.frames = 0;
    w.strikes = fps < 20 ? w.strikes + 1 : 0;
    if (w.strikes >= 2) {
      w.done = true;
      degradeToStatic();
    }
  });
  return null;
}

export default function HeroScene({ visible = true, onReady }: { visible?: boolean; onReady?: () => void }) {
  const wide = useMediaQuery("(min-width: 900px)", true);
  const reduced = useReducedMotion();
  const [active, setActive] = useState(true);
  // Never render above the screen's own density (a 1× monitor at 1.5× costs 2.25× the pixels).
  const [maxDpr] = useState(() => Math.min(1.5, window.devicePixelRatio || 1));
  const [dpr, setDpr] = useState(maxDpr);
  const [portraitLoaded, setPortraitLoaded] = useState(false);

  useEffect(() => {
    trackPointer();
    const onScroll = () => setActive(scrollProgress() < 1.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`pointer-events-none fixed inset-0 -z-10 transition-opacity duration-1000 ${visible ? "opacity-100" : "opacity-0"}`}
      aria-hidden
    >
      <Canvas
        frameloop={active && !reduced ? "always" : "demand"}
        dpr={dpr}
        camera={{ position: [0, 0, 7.5], fov: 42, near: 0.1, far: 100 }}
        gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
        fallback={<div className="h-full w-full bg-[radial-gradient(circle_at_70%_40%,#2a1f5c,transparent_60%)]" />}
      >
        <color attach="background" args={["#05060a"]} />
        <ReadySignal enabled={portraitLoaded} onReady={onReady} />
        {/* Resolution follows the frame rate in small steps between 0.75× and the screen's own
            density. If it keeps flip-flopping it settles at 1× and keeps animating; it never
            switches to still images (that's SlowDeviceWatchdog's job, for truly slow devices). */}
        <PerformanceMonitor
          flipflops={6}
          onChange={({ factor }) => setDpr(Math.round((0.75 + (maxDpr - 0.75) * factor) * 4) / 4)}
          onFallback={() => setDpr(Math.min(1, maxDpr))}
        />
        <SlowDeviceWatchdog enabled={active && !reduced} />
        <Stars count={wide ? 1400 : 700} />
        <Rig wide={wide} reduced={reduced} onPortraitLoaded={() => setPortraitLoaded(true)} />
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur intensity={1.05} luminanceThreshold={0.22} luminanceSmoothing={0.35} radius={0.78} />
          <Noise opacity={0.028} />
          <Vignette offset={0.22} darkness={0.78} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

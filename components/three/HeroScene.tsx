"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { Bloom, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { pointer, trackPointer, useMediaQuery, useReducedMotion } from "@/lib/hooks";
import { degradeToStatic } from "@/lib/prefs";
import { pointsFragment, pointsVertex, simplexNoise } from "./glsl";

const scrollProgress = () => (typeof window === "undefined" ? 0 : window.scrollY / window.innerHeight);
const smooth = (e0: number, e1: number, x: number) => THREE.MathUtils.smoothstep(x, e0, e1);

const coreVertex = /* glsl */ `
uniform float uTime;
uniform float uAmp;
uniform float uFreq;
varying vec3 vNormal;
varying vec3 vViewPos;
varying float vNoise;
${simplexNoise}

float displace(vec3 p) {
  return snoise(p * uFreq + vec3(0.0, 0.0, uTime * 0.35)) * uAmp
       + snoise(p * uFreq * 2.4 - vec3(uTime * 0.22)) * uAmp * 0.3;
}

vec3 orthogonal(vec3 v) {
  return normalize(abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0) : vec3(0.0, -v.z, v.y));
}

void main() {
  float r = length(position);
  vec3 n = normalize(position);
  vec3 t = orthogonal(n);
  vec3 b = normalize(cross(n, t));
  float eps = 0.015;
  vec3 pT = normalize(position + t * eps) * r;
  vec3 pB = normalize(position + b * eps) * r;

  float d = displace(position);
  vec3 p0 = position + n * d;
  vec3 p1 = pT + normalize(pT) * displace(pT);
  vec3 p2 = pB + normalize(pB) * displace(pB);
  vec3 displacedNormal = normalize(cross(p1 - p0, p2 - p0));

  vNoise = d / max(uAmp, 0.0001);
  vNormal = normalize(normalMatrix * displacedNormal);
  vec4 mv = modelViewMatrix * vec4(p0, 1.0);
  vViewPos = mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;

const coreFragment = /* glsl */ `
uniform float uTime;
uniform float uOpacity;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
varying vec3 vNormal;
varying vec3 vViewPos;
varying float vNoise;

void main() {
  vec3 n = normalize(vNormal);
  vec3 v = normalize(-vViewPos);
  float fres = pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 2.4);
  float bands = 0.5 + 0.5 * sin(vNoise * 5.0 + uTime * 0.5);

  vec3 base = mix(uColorA, uColorB, smoothstep(-0.7, 0.9, vNoise));
  base = mix(base, uColorC, bands * 0.28);

  vec3 lightDir = normalize(vec3(-0.5, 0.8, 0.6));
  float diff = clamp(dot(n, lightDir), 0.0, 1.0);
  vec3 h = normalize(lightDir + v);
  float spec = pow(max(dot(n, h), 0.0), 60.0);

  vec3 rim = mix(uColorB, uColorC, 0.5 + 0.5 * n.y);
  vec3 col = base * (0.08 + 0.55 * diff) + rim * fres * 1.6 + spec * 0.7;
  gl_FragColor = vec4(col, uOpacity);
  #include <colorspace_fragment>
}
`;

function Core({ detail, reduced }: { detail: number; reduced: boolean }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: coreVertex,
        fragmentShader: coreFragment,
        transparent: true,
        uniforms: {
          uTime: { value: 0 },
          uAmp: { value: 0.32 },
          uFreq: { value: 0.75 },
          uOpacity: { value: 1 },
          uColorA: { value: new THREE.Color("#2b1c8f") },
          uColorB: { value: new THREE.Color("#18b6e0") },
          uColorC: { value: new THREE.Color("#ff5fa2") },
        },
      }),
    [],
  );
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const u = material.uniforms;
    u.uTime.value += delta * (reduced ? 0.15 : 1);
    // Pointer energy: the blob gets a little livelier when the cursor moves toward it.
    const target = 0.3 + Math.hypot(pointer.x, pointer.y) * 0.1;
    u.uAmp.value = THREE.MathUtils.damp(u.uAmp.value, target, 2, delta);
    u.uOpacity.value = 1 - smooth(0.7, 1.5, scrollProgress());
    if (mesh.current) {
      mesh.current.rotation.y += delta * 0.08;
      mesh.current.visible = u.uOpacity.value > 0.01;
    }
  });

  return (
    <mesh ref={mesh} material={material}>
      <icosahedronGeometry args={[1.35, detail]} />
    </mesh>
  );
}

function Orbits() {
  const group = useRef<THREE.Group>(null);
  const sats = useRef<THREE.Mesh[]>([]);
  const rings = useMemo(
    () => [
      { r: 2.05, tilt: [1.2, 0.2, 0], speed: 0.5, color: "#5ee7ff" },
      { r: 2.55, tilt: [1.75, -0.5, 0.3], speed: -0.34, color: "#9b8cff" },
      { r: 3.05, tilt: [1.35, 0.7, -0.2], speed: 0.22, color: "#ff6fae" },
    ],
    [],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const fade = 1 - smooth(0.6, 1.4, scrollProgress());
    rings.forEach((ring, i) => {
      const s = sats.current[i];
      if (!s) return;
      const a = t * ring.speed + i * 2.1;
      s.position.set(Math.cos(a) * ring.r, Math.sin(a) * ring.r, 0);
    });
    group.current?.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.Material & { opacity: number; userData: { base?: number } };
      if (m && "opacity" in m) m.opacity = (m.userData.base ?? 1) * fade;
    });
  });

  return (
    <group ref={group}>
      {rings.map((ring, i) => (
        <group key={i} rotation={ring.tilt as [number, number, number]}>
          <mesh>
            <torusGeometry args={[ring.r, 0.004, 8, 256]} />
            <meshBasicMaterial color={ring.color} transparent opacity={0.35} userData={{ base: 0.35 }} depthWrite={false} />
          </mesh>
          <mesh ref={(m) => { if (m) sats.current[i] = m; }}>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshBasicMaterial color={new THREE.Color(ring.color).multiplyScalar(3)} toneMapped={false} transparent userData={{ base: 1 }} />
          </mesh>
        </group>
      ))}
      <mesh rotation={[0.4, 0.3, 0]}>
        <icosahedronGeometry args={[1.85, 1]} />
        <meshBasicMaterial color="#9b8cff" wireframe transparent opacity={0.08} userData={{ base: 0.08 }} depthWrite={false} />
      </mesh>
    </group>
  );
}

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

// A flattened spiral disc of particles swirling around the core.
function Galaxy({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const gl = useThree((s) => s.gl);
  const geometry = useMemo(() => {
    const inner = new THREE.Color("#5ee7ff");
    const mid = new THREE.Color("#9b8cff");
    const outer = new THREE.Color("#ff6fae");
    const arms = 3;
    return makePoints(count, 7, (i, v, c, rand) => {
      const radius = 2.2 + Math.pow(rand(), 1.6) * 5.5;
      const arm = ((i % arms) / arms) * Math.PI * 2;
      const spin = radius * 0.55;
      const spread = 0.35 * (radius - 1.6);
      const jitter = () => Math.pow(rand(), 3) * (rand() < 0.5 ? 1 : -1) * spread;
      const rx = jitter();
      const ry = jitter() * 0.35;
      const rz = jitter();
      v.set(Math.cos(arm + spin) * radius + rx, ry, Math.sin(arm + spin) * radius + rz);
      const k = (radius - 2.2) / 5.5;
      c.copy(inner).lerp(mid, Math.min(1, k * 2)).lerp(outer, Math.max(0, k * 2 - 1));
    });
  }, [count]);
  const material = useMemo(() => pointsMaterial(46), []);

  useFrame((state, delta) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uPixelRatio.value = gl.getPixelRatio();
    material.uniforms.uOpacity.value = 1 - 0.65 * smooth(0.5, 1.6, scrollProgress());
    if (ref.current) ref.current.rotation.y += delta * 0.03;
  });

  return <points ref={ref} geometry={geometry} material={material} rotation={[0.42, 0, 0.18]} />;
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

function Rig({ wide, reduced }: { wide: boolean; reduced: boolean }) {
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
      const baseY = wide ? 0.05 : 1.85;
      hero.current.position.x = baseX + k * (wide ? 1.2 : 0);
      hero.current.position.y = baseY + k * 2.2;
      hero.current.scale.setScalar((wide ? 0.92 : 0.52) * (1 - 0.3 * k));
    }
  });

  return (
    <group ref={hero}>
      <Core detail={wide ? 56 : 32} reduced={reduced} />
      <Orbits />
      <Galaxy count={wide ? 7000 : 3000} />
    </group>
  );
}

// Reports the first rendered frames, so the page can crossfade from the still image.
function ReadySignal({ onReady }: { onReady?: () => void }) {
  const frames = useRef(0);
  const done = useRef(false);
  useFrame(() => {
    if (done.current || ++frames.current < 3) return;
    done.current = true;
    onReady?.();
  });
  return null;
}

export default function HeroScene({ visible = true, onReady }: { visible?: boolean; onReady?: () => void }) {
  const wide = useMediaQuery("(min-width: 900px)", true);
  const reduced = useReducedMotion();
  const [active, setActive] = useState(true);
  const [dpr, setDpr] = useState(1.5);

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
        <ReadySignal onReady={onReady} />
        <PerformanceMonitor
          flipflops={3}
          onDecline={() => setDpr(1)}
          onIncline={() => setDpr(Math.min(2, window.devicePixelRatio))}
          onFallback={degradeToStatic}
        />
        <Stars count={wide ? 1400 : 700} />
        <Rig wide={wide} reduced={reduced} />
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur intensity={1.05} luminanceThreshold={0.22} luminanceSmoothing={0.35} radius={0.78} />
          <Noise opacity={0.028} />
          <Vignette offset={0.22} darkness={0.78} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

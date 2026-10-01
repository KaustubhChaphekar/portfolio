"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { pointer } from "@/lib/hooks";

// The hero's centrepiece: thousands of particles that form Kaustubh's portrait (head and
// shoulders), sampled from public/hero/portrait.png — made by scripts/make-portrait.mjs:
// red = brightness, green = subject mask, blue = depth.
// Scrolling breaks the face into a spiral galaxy; scrolling back re-forms it. Particles are
// pushed away by the cursor, and a light sweep runs down the face once when it appears.

const MAP = "/hero/portrait.png";
const FIGURE_HEIGHT = 4.4;

const vertex = /* glsl */ `
uniform float uTime;
uniform float uProgress;
uniform float uWave;
uniform float uSize;
uniform float uPixelRatio;
uniform float uOpacity;
uniform vec3 uPointer;
uniform float uPush;
attribute float aBright;
attribute float aMask;
attribute float aRim;
attribute float aRandom;
attribute vec3 aScatter;
varying vec3 vColor;
varying float vAlpha;

const vec3 INDIGO = vec3(0.32, 0.27, 0.72);
const vec3 CYAN = vec3(0.369, 0.906, 1.0);
const vec3 BLUSH = vec3(1.0, 0.8, 0.92);
const vec3 RIM = vec3(0.55, 0.95, 1.0);
uniform float uBottom;

void main() {
  vec3 p = position;

  // A slow drift so the face never looks frozen.
  p += 0.012 * vec3(sin(uTime * 1.3 + aRandom * 40.0), cos(uTime * 1.1 + aRandom * 33.0), sin(uTime * 0.9 + aRandom * 21.0));

  // The cursor pushes particles aside like sand.
  vec2 away = p.xy - uPointer.xy;
  float push = uPush * smoothstep(0.85, 0.0, length(away));
  p.xy += normalize(away + 1e-4) * push * 0.42;
  p.z += push * 0.35;

  // A band of light that sweeps down the face once.
  float band = exp(-pow((p.y - uWave) * 3.2, 2.0));
  p.z += band * 0.22 * aRandom;

  // Scroll: each particle flies out to its place in the galaxy, a little staggered, with a swirl.
  float t = clamp(uProgress * 1.4 - aRandom * 0.4, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t);
  vec3 q = mix(p, aScatter, t);
  float ang = t * (1.2 + aRandom);
  float c = cos(ang), s = sin(ang);
  q.xy = vec2(c * q.x - s * q.y, s * q.x + c * q.y);

  vec4 mv = modelViewMatrix * vec4(q, 1.0);
  gl_Position = projectionMatrix * mv;
  float twinkle = 0.78 + 0.22 * sin(uTime * 2.0 + aRandom * 60.0);
  gl_PointSize = uSize * (0.45 + aBright * 0.85) * (1.0 + band * 0.9) * uPixelRatio / -mv.z;

  // Dark areas (hair, beard, jacket) glow indigo, lit skin cyan, highlights blush; the outline
  // gets a cyan rim light so the silhouette reads against the night sky.
  vec3 col = mix(INDIGO, CYAN, smoothstep(0.16, 0.55, aBright));
  col = mix(col, BLUSH, smoothstep(0.72, 1.0, aBright) * 0.7);
  col = mix(col, RIM, aRim * 0.8);
  col = mix(col, vec3(1.0), band * 0.35);
  vColor = col;
  // The body fades out toward the bottom instead of ending in a hard line.
  float fade = smoothstep(uBottom, uBottom + 1.3, position.y);
  vAlpha = uOpacity * aMask * (0.32 + aBright * 0.68 + aRim * 0.5) * 0.9 * twinkle * mix(fade, 1.0, t) * (1.0 - t * 0.3);
}
`;

const fragment = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(vColor, a * a * vAlpha);
  #include <colorspace_fragment>
}
`;

// Seeded so the portrait is the same on every visit.
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

function buildGeometry(img: HTMLImageElement, target: number) {
  const W = img.width;
  const H = img.height;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, W, H).data;

  // How many particles each pixel deserves: lit skin dense, the dark jacket a bit sparser.
  const weight = new Float32Array(W * H);
  let total = 0;
  for (let i = 0; i < W * H; i++) {
    const b = data[i * 4] / 255;
    const m = data[i * 4 + 1] / 255;
    if (m < 0.04) continue;
    weight[i] = Math.pow(m, 1.5) * (0.3 + 0.7 * Math.pow(b, 1.2));
    total += weight[i];
  }
  const maskAt = (x: number, y: number) => data[(Math.min(H - 1, Math.max(0, y)) * W + Math.min(W - 1, Math.max(0, x))) * 4 + 1] / 255;
  const density = target / total;

  const rand = seeded(1254);
  const figureW = (FIGURE_HEIGHT * W) / H;
  const pos: number[] = [];
  const bright: number[] = [];
  const mask: number[] = [];
  const rims: number[] = [];
  const random: number[] = [];
  const scatter: number[] = [];

  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (!weight[i]) continue;
      const expected = weight[i] * density;
      let n = Math.floor(expected);
      if (rand() < expected - n) n++;
      const b = data[i * 4] / 255;
      const m = data[i * 4 + 1] / 255;
      const depth = data[i * 4 + 2] / 255;
      const rim = Math.min(1, Math.abs(maskAt(x + 2, y) - maskAt(x - 2, y)) + Math.abs(maskAt(x, y + 2) - maskAt(x, y - 2)));
      for (let k = 0; k < n; k++) {
        const u = (x + rand()) / W - 0.5;
        const v = (y + rand()) / H - 0.5;
        // Rounded body from the depth map, plus a little relief from brightness.
        pos.push(u * figureW, -v * FIGURE_HEIGHT, Math.sqrt(depth) * 0.9 + (b - 0.5) * 0.18);
        bright.push(b);
        mask.push(m);
        rims.push(rim);
        const r = rand();
        random.push(r);
        // Its place in the galaxy: a three-armed spiral facing the camera, around the figure.
        const radius = 2.6 + Math.pow(rand(), 1.4) * 5.0;
        const arm = Math.floor(rand() * 3) * ((Math.PI * 2) / 3) + radius * 0.55;
        const spread = 0.3 * (radius - 1.8);
        const jitter = () => Math.pow(rand(), 3) * (rand() < 0.5 ? 1 : -1) * spread;
        scatter.push(Math.cos(arm) * radius + jitter(), Math.sin(arm) * radius * 0.85 + jitter(), jitter() * 0.4 - 1.2);
      }
    }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("aBright", new THREE.Float32BufferAttribute(bright, 1));
  geo.setAttribute("aMask", new THREE.Float32BufferAttribute(mask, 1));
  geo.setAttribute("aRim", new THREE.Float32BufferAttribute(rims, 1));
  geo.setAttribute("aRandom", new THREE.Float32BufferAttribute(random, 1));
  geo.setAttribute("aScatter", new THREE.Float32BufferAttribute(scatter, 3));
  return geo;
}

type Props = {
  count: number;
  reduced: boolean;
  dim?: number; // 0–1 brightness multiplier
  scroll: () => number; // 0 at the top of the page, 1 after one screen
  onLoaded?: () => void;
};

export default function ParticlePortrait({ count, reduced, dim = 1, scroll, onLoaded }: Props) {
  const points = useRef<THREE.Points>(null);
  const group = useRef<THREE.Group>(null);
  const { camera, gl } = useThree();
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const loaded = useRef(onLoaded);

  useEffect(() => {
    loaded.current = onLoaded;
  });

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      setGeometry(buildGeometry(img, count));
      loaded.current?.();
    };
    img.src = MAP;
    return () => {
      cancelled = true;
    };
  }, [count]);

  useEffect(() => () => geometry?.dispose(), [geometry]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uProgress: { value: 0 },
          uWave: { value: 3 },
          uSize: { value: 25 },
          uPixelRatio: { value: 1 },
          uOpacity: { value: 1 },
          uPointer: { value: new THREE.Vector3(99, 99, 0) },
          uPush: { value: 0 },
          uBottom: { value: -FIGURE_HEIGHT / 2 },
        },
      }),
    [],
  );

  const ray = useMemo(() => new THREE.Raycaster(), []);
  const plane = useMemo(() => new THREE.Plane(), []);
  const hit = useMemo(() => new THREE.Vector3(), []);
  const normal = useMemo(() => new THREE.Vector3(), []);
  const quat = useMemo(() => new THREE.Quaternion(), []);
  const ndc = useMemo(() => new THREE.Vector2(), []);
  const last = useRef({ x: 0, y: 0, energy: 0, waveStart: -1 });

  useFrame((state, delta) => {
    const u = material.uniforms;
    const t = state.clock.elapsedTime;
    u.uTime.value = reduced ? 0 : t;
    u.uPixelRatio.value = gl.getPixelRatio();

    const p = scroll();
    u.uProgress.value = THREE.MathUtils.smoothstep(p, 0.04, 0.85);
    u.uOpacity.value = dim * (1 - 0.5 * THREE.MathUtils.smoothstep(p, 0.9, 1.7));

    // One sweep of light down the face, shortly after it first appears.
    const l = last.current;
    if (geometry && l.waveStart < 0) l.waveStart = t + 0.4;
    u.uWave.value = reduced || l.waveStart < 0 ? 9 : 2.4 - Math.max(0, t - l.waveStart) * 2.2;

    // Cursor → the portrait's local plane; energy rises while the cursor moves, then fades.
    const moved = Math.hypot(pointer.x - l.x, pointer.y - l.y);
    l.x = pointer.x;
    l.y = pointer.y;
    l.energy = Math.min(1, l.energy * Math.exp(-delta * 1.4) + moved * 6);
    u.uPush.value = reduced ? 0 : l.energy * (1 - u.uProgress.value);
    if (points.current && l.energy > 0.01) {
      points.current.getWorldPosition(hit);
      normal.set(0, 0, 1).applyQuaternion(points.current.getWorldQuaternion(quat));
      plane.setFromNormalAndCoplanarPoint(normal, hit);
      ray.setFromCamera(ndc.set(pointer.x, pointer.y), camera);
      if (ray.ray.intersectPlane(plane, hit)) {
        points.current.worldToLocal(hit);
        u.uPointer.value.copy(hit);
      }
    }

    // The face turns a little toward the cursor, so its depth shows.
    if (group.current) {
      const idle = reduced ? 0 : Math.sin(t * 0.3) * 0.08;
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, pointer.x * 0.38 + idle, 2.5, delta);
      group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -pointer.y * 0.16, 2.5, delta);
    }
  });

  return (
    <group ref={group}>
      {geometry && <points ref={points} geometry={geometry} material={material} frustumCulled={false} />}
    </group>
  );
}

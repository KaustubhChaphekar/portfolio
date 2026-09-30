"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { pointer } from "@/lib/hooks";
import LazyCanvas from "./LazyCanvas";
import { useCanvasDrag } from "./useCanvasDrag";

const R = 1.6;
const MASK = "/textures/earth-specular.jpg"; // equirectangular: land is black, ocean white

export type GlobeMarker = { lat: number; lon: number; color: string };

export function latLonToVec3(lat: number, lon: number, radius: number) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

// Rotation that brings (lat, lon) to face the camera with north up; small offsets
// put the point just above and right of centre.
function facing(lat: number, lon: number) {
  return {
    x: THREE.MathUtils.degToRad(lat) - 0.12,
    y: -Math.PI / 2 - THREE.MathUtils.degToRad(lon) + 0.22,
  };
}

// Samples the land mask at evenly spaced sphere points and keeps the ones on land.
const dotCache = new Map<number, Float32Array>();
function useLandDots(samples: number) {
  const [positions, setPositions] = useState<Float32Array | null>(() => dotCache.get(samples) ?? null);
  useEffect(() => {
    if (dotCache.has(samples)) return;
    let cancelled = false;
    const img = new Image();
    img.src = MASK;
    img.onload = () => {
      if (cancelled) return;
      const w = 720;
      const h = 360;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, w, h);
      const data = ctx.getImageData(0, 0, w, h).data;
      const out: number[] = [];
      const golden = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < samples; i++) {
        const y = 1 - (i / (samples - 1)) * 2;
        const r = Math.sqrt(1 - y * y);
        const theta = golden * i;
        const x = Math.cos(theta) * r;
        const z = Math.sin(theta) * r;
        const lat = THREE.MathUtils.radToDeg(Math.asin(y));
        // Invert latLonToVec3 to find where this point lands on the map.
        let lon = THREE.MathUtils.radToDeg(Math.atan2(z, -x)) - 180;
        if (lon < -180) lon += 360;
        const px = Math.min(w - 1, Math.floor(((lon + 180) / 360) * w));
        const py = Math.min(h - 1, Math.floor(((90 - lat) / 180) * h));
        if (data[(py * w + px) * 4] < 110) out.push(x * R, y * R, z * R);
      }
      const result = new Float32Array(out);
      dotCache.set(samples, result);
      setPositions(result);
    };
    return () => {
      cancelled = true;
    };
  }, [samples]);
  return positions;
}

const dotVertex = /* glsl */ `
uniform float uPixelRatio;
uniform vec3 uFocus;
varying float vHeat;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  vHeat = smoothstep(0.55, 0.0, distance(normalize(position), uFocus));
  gl_PointSize = (7.0 + vHeat * 5.0) * uPixelRatio * (1.0 / -mv.z);
}
`;

const dotFragment = /* glsl */ `
uniform vec3 uBase;
uniform vec3 uHot;
varying float vHeat;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  vec3 col = mix(uBase, uHot, vHeat);
  gl_FragColor = vec4(col, 0.55 + vHeat * 0.45);
  #include <colorspace_fragment>
}
`;

const atmosphereVertex = /* glsl */ `
varying vec3 vNormal;
varying vec3 vView;
void main() {
  vNormal = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`;

const atmosphereFragment = /* glsl */ `
uniform vec3 uColor;
varying vec3 vNormal;
varying vec3 vView;
void main() {
  float rim = pow(1.0 - abs(dot(vNormal, vView)), 3.0);
  gl_FragColor = vec4(uColor, rim * 0.55);
  #include <colorspace_fragment>
}
`;

function Marker({ lat, lon, color, active }: GlobeMarker & { active: boolean }) {
  const pulse = useRef<THREE.Mesh>(null);
  const group = useRef<THREE.Group>(null);
  const { position, quaternion } = useMemo(() => {
    const p = latLonToVec3(lat, lon, R);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), p.clone().normalize());
    return { position: p, quaternion: q };
  }, [lat, lon]);

  useFrame((state, delta) => {
    if (group.current) group.current.scale.setScalar(THREE.MathUtils.damp(group.current.scale.x, active ? 1 : 0.6, 6, delta));
    if (!pulse.current) return;
    const t = (state.clock.elapsedTime % 2) / 2;
    pulse.current.scale.setScalar(1 + t * 3);
    (pulse.current.material as THREE.MeshBasicMaterial).opacity = active ? (1 - t) * 0.9 : 0;
  });

  return (
    <group ref={group} position={position} quaternion={quaternion}>
      <mesh>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh ref={pulse} position={[0, 0, 0.005]}>
        <ringGeometry args={[0.05, 0.065, 48]} />
        <meshBasicMaterial color={color} transparent depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, active ? 0.22 : 0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.006, 0.006, active ? 0.44 : 0.2, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

type GlobeProps = { markers: GlobeMarker[]; activeIndex: number; draggable: boolean };

function Globe({ markers, activeIndex, draggable }: GlobeProps) {
  const group = useRef<THREE.Group>(null);
  const positions = useLandDots(26000);
  const focusMarker = markers[activeIndex] ?? markers[0];
  const target = facing(focusMarker.lat, focusMarker.lon);
  const drag = useRef({ yaw: 0, pitch: 0 });
  // Mouse drags spin and tilt; sideways swipes on touch spin (vertical swipes still scroll the page).
  const dragState = useCanvasDrag(draggable, (dx, dy, mouse) => {
    drag.current.yaw += dx * 0.008;
    if (mouse) drag.current.pitch += dy * 0.006;
  });
  // Initial orientation only; later focus changes animate in useFrame instead of snapping.
  const [initialRotation] = useState<[number, number, number]>(() => [target.x, target.y, 0]);

  const dotMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: dotVertex,
        fragmentShader: dotFragment,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uPixelRatio: { value: 1 },
          uFocus: { value: new THREE.Vector3(0, 0, 1) },
          uBase: { value: new THREE.Color("#4a5270") },
          uHot: { value: new THREE.Color("#5ee7ff") },
        },
      }),
    [],
  );
  const atmosphere = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: atmosphereVertex,
        fragmentShader: atmosphereFragment,
        transparent: true,
        depthWrite: false,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        uniforms: { uColor: { value: new THREE.Color("#7f6dff") } },
      }),
    [],
  );

  // A new focus resets any drag offset so the globe flies to the chosen place.
  useEffect(() => {
    drag.current.yaw = 0;
    drag.current.pitch = 0;
    dotMaterial.uniforms.uFocus.value.copy(latLonToVec3(focusMarker.lat, focusMarker.lon, 1).normalize());
    (dotMaterial.uniforms.uHot.value as THREE.Color).set(focusMarker.color);
  }, [focusMarker.lat, focusMarker.lon, focusMarker.color, dotMaterial]);

  useFrame((state, delta) => {
    dotMaterial.uniforms.uPixelRatio.value = state.gl.getPixelRatio();
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const d = drag.current;
    const active = dragState.current.active;
    // Take the short way round when the target longitude wraps.
    let ty = target.y + d.yaw + (active ? 0 : Math.sin(t * 0.25) * 0.25 + pointer.x * 0.2);
    while (ty - g.rotation.y > Math.PI) ty -= Math.PI * 2;
    while (ty - g.rotation.y < -Math.PI) ty += Math.PI * 2;
    const tx = THREE.MathUtils.clamp(target.x + d.pitch - (active ? 0 : pointer.y * 0.1), -1.2, 1.2);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, tx, active ? 12 : 2.2, delta);
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, ty, active ? 12 : 2.2, delta);
  });

  const geometry = useMemo(() => {
    if (!positions) return null;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  return (
    <group ref={group} rotation={initialRotation}>
      <mesh>
        <sphereGeometry args={[R * 0.985, 64, 64]} />
        <meshBasicMaterial color="#07090f" />
      </mesh>
      {geometry && <points geometry={geometry} material={dotMaterial} />}
      <mesh material={atmosphere} scale={1.1} raycast={() => null}>
        <sphereGeometry args={[R, 64, 64]} />
      </mesh>
      {markers.map((m, i) => (
        <Marker key={`${m.lat},${m.lon}`} {...m} active={i === activeIndex} />
      ))}
    </group>
  );
}

export default function GlobeScene({
  markers,
  activeIndex = 0,
  draggable = false,
  label,
}: {
  markers: GlobeMarker[];
  activeIndex?: number;
  draggable?: boolean;
  label: string;
}) {
  return (
    <LazyCanvas label={label} wrapperClassName={`h-full w-full ${draggable ? "md:cursor-grab" : ""}`} camera={{ position: [0, 0, 6.4], fov: 40 }}>
      <Globe markers={markers} activeIndex={activeIndex} draggable={draggable} />
    </LazyCanvas>
  );
}

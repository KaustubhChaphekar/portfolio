"use client";

import { Billboard, Text } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Suspense, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { SkillGroup } from "@/lib/data";
import { useMediaQuery } from "@/lib/hooks";
import LazyCanvas from "./LazyCanvas";
import { useCanvasDrag } from "./useCanvasDrag";

const FONT = "/fonts/space-grotesk-500.woff";
const RADIUS = 2.75;

type TroikaText = THREE.Mesh & { fillOpacity: number; color: THREE.ColorRepresentation };

const tmp = new THREE.Vector3();
const camDir = new THREE.Vector3();

function Word({
  label,
  position,
  color,
  dimmed,
}: {
  label: string;
  position: THREE.Vector3;
  color: string;
  dimmed: boolean;
}) {
  const text = useRef<TroikaText>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ camera }, delta) => {
    const t = text.current;
    if (!t) return;
    // Words on the far side of the sphere fade out, which sells the depth.
    t.getWorldPosition(tmp).normalize();
    camDir.copy(camera.position).normalize();
    const facing = (tmp.dot(camDir) + 1) / 2;
    const target = dimmed ? 0.12 : 0.18 + facing * 0.82;
    t.fillOpacity = THREE.MathUtils.damp(t.fillOpacity ?? 1, hovered ? 1 : target, 8, delta);
    const s = hovered ? 1.4 : 1;
    t.scale.setScalar(THREE.MathUtils.damp(t.scale.x, s, 10, delta));
  });

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = "pointer";
  };
  const out = () => {
    setHovered(false);
    document.body.style.cursor = "";
  };

  return (
    <Billboard position={position}>
      <Text
        ref={text}
        font={FONT}
        fontSize={0.2}
        letterSpacing={-0.01}
        color={hovered ? "#ffffff" : color}
        anchorX="center"
        anchorY="middle"
        onPointerOver={over}
        onPointerOut={out}
      >
        {label}
      </Text>
    </Billboard>
  );
}

function Cloud({ groups, activeGroup }: { groups: SkillGroup[]; activeGroup: string | null }) {
  const words = useMemo(() => {
    const flat = groups.flatMap((g) => g.items.map((item) => ({ item, group: g.name, color: g.color })));
    // Fibonacci sphere — evenly spaced points, with categories interleaved.
    const golden = Math.PI * (3 - Math.sqrt(5));
    const order = flat.map((_, i) => i).sort((a, b) => ((a * 7) % flat.length) - ((b * 7) % flat.length));
    return order.map((idx, i) => {
      const y = 1 - (i / (flat.length - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = golden * i;
      return { ...flat[idx], position: new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).multiplyScalar(RADIUS) };
    });
  }, [groups]);

  return (
    <group>
      {words.map((w) => (
        <Word key={w.item} label={w.item} position={w.position} color={w.color} dimmed={activeGroup !== null && activeGroup !== w.group} />
      ))}
    </group>
  );
}

function Nucleus() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * 0.15;
    ref.current.rotation.y += delta * 0.2;
  });
  return (
    <group ref={ref}>
      <mesh>
        <icosahedronGeometry args={[0.7, 1]} />
        <meshBasicMaterial color="#9b8cff" wireframe transparent opacity={0.35} />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[0.42, 0]} />
        <meshBasicMaterial color="#5ee7ff" transparent opacity={0.18} />
      </mesh>
      <mesh rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[RADIUS * 1.02, 0.004, 8, 200]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.06} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 3]}>
        <torusGeometry args={[RADIUS * 1.02, 0.004, 8, 200]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.05} />
      </mesh>
    </group>
  );
}

// Spins slowly on its own; drag with a mouse or swipe sideways on touch to spin it faster.
function Spin({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const motion = useRef({ velocity: 0, pitch: 0 });
  const drag = useCanvasDrag(true, (dx, dy, mouse) => {
    if (ref.current) ref.current.rotation.y += dx * 0.008;
    motion.current.velocity = dx * 0.008;
    if (mouse) motion.current.pitch = THREE.MathUtils.clamp(motion.current.pitch + dy * 0.006, -0.8, 0.8);
  });

  useFrame((_, delta) => {
    const g = ref.current;
    if (!g) return;
    const m = motion.current;
    if (!drag.current.active) {
      g.rotation.y += delta * 0.12 + m.velocity;
      m.velocity *= Math.pow(0.02, delta); // inertia fades out
    }
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, m.pitch, 6, delta);
  });
  return <group ref={ref}>{children}</group>;
}

export default function SkillsScene({ groups, activeGroup }: { groups: SkillGroup[]; activeGroup: string | null }) {
  const finePointer = useMediaQuery("(pointer: fine)", true);
  return (
    <LazyCanvas
      label="An interactive 3D sphere of skills — drag or swipe sideways to rotate"
      wrapperClassName={`h-full w-full ${finePointer ? "cursor-grab active:cursor-grabbing" : ""}`}
      camera={{ position: [0, 0, 8.6], fov: 45 }}
    >
      <Suspense fallback={null}>
        <Spin>
          <Cloud groups={groups} activeGroup={activeGroup} />
          <Nucleus />
        </Spin>
      </Suspense>
    </LazyCanvas>
  );
}

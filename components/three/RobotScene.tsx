"use client";

import { ContactShadows, Environment, useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Suspense, useCallback, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { pointer, trackPointer } from "@/lib/hooks";
import LazyCanvas from "./LazyCanvas";

const MODEL = "/models/robot.glb";
// Clips that play once and then settle back into Idle.
const ONE_SHOTS = new Set(["Jump", "ThumbsUp", "Wave", "Punch", "No"]);

type RobotProps = { animation: string; onClick?: () => void };

function Robot({ animation, onClick }: RobotProps) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(MODEL);
  const { actions, mixer } = useAnimations(animations, group);
  const current = useRef<THREE.AnimationAction | null>(null);

  useEffect(() => {
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (mat.name === "Main") {
        mat.color.set("#8f7dff");
        mat.metalness = 0.35;
        mat.roughness = 0.32;
      } else if (mat.name === "Grey") {
        mat.color.set("#d7dcea");
        mat.metalness = 0.55;
        mat.roughness = 0.28;
      } else if (mat.name === "Black") {
        mat.color.set("#0b0d14");
        mat.roughness = 0.35;
      }
    });
  }, [scene]);

  const play = useCallback(
    (name: string) => {
      const next = actions[name];
      if (!next) return;
      const once = ONE_SHOTS.has(name);
      next.reset();
      next.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, Infinity);
      next.clampWhenFinished = true;
      if (current.current && current.current !== next) current.current.fadeOut(0.35);
      next.fadeIn(0.35).play();
      current.current = next;
    },
    [actions],
  );

  useEffect(() => play(animation), [animation, play]);

  useEffect(() => {
    const onFinished = (e: { action: THREE.AnimationAction }) => {
      if (e.action === current.current) play("Idle");
    };
    mixer.addEventListener("finished", onFinished);
    return () => mixer.removeEventListener("finished", onFinished);
  }, [mixer, play]);

  // The robot turns a little toward the cursor.
  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, pointer.x * 0.45, 3, delta);
  });

  return (
    <group
      ref={group}
      dispose={null}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "")}
    >
      <primitive object={scene} scale={0.42} />
    </group>
  );
}

const STAGE_COLORS = ["#5ee7ff", "#7dffb3", "#ffe26b", "#ffb86b", "#ff6fae", "#9b8cff"];

// Six nodes circling the robot — one per pipeline stage. The active one glows.
function StageRing({ active, count }: { active: number; count: number }) {
  const ring = useRef<THREE.Group>(null);
  const nodes = useRef<THREE.Mesh[]>([]);

  useFrame((state, delta) => {
    if (ring.current) ring.current.rotation.y += delta * 0.25;
    nodes.current.forEach((node, i) => {
      if (!node) return;
      const on = i === active;
      const s = on ? 1.6 + Math.sin(state.clock.elapsedTime * 6) * 0.15 : 0.8;
      node.scale.setScalar(THREE.MathUtils.damp(node.scale.x, s, 6, delta));
      const mat = node.material as THREE.MeshBasicMaterial;
      mat.opacity = THREE.MathUtils.damp(mat.opacity, on || i < active ? 1 : 0.35, 6, delta);
    });
  });

  return (
    <group ref={ring} position={[0, 0.9, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.55, 0.006, 8, 160]} />
        <meshBasicMaterial color="#9b8cff" transparent opacity={0.4} />
      </mesh>
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2;
        return (
          <mesh
            key={i}
            ref={(m) => {
              if (m) nodes.current[i] = m;
            }}
            position={[Math.cos(a) * 1.55, 0, Math.sin(a) * 1.55]}
          >
            <octahedronGeometry args={[0.07, 0]} />
            <meshBasicMaterial color={STAGE_COLORS[i % STAGE_COLORS.length]} transparent opacity={0.35} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
}

function Platform({ pulseKey }: { pulseKey: number }) {
  const glow = useRef<THREE.Mesh>(null);
  const pulse = useRef<THREE.Mesh>(null);
  const started = useRef(0);
  const glowMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uColor: { value: new THREE.Color("#5ee7ff") }, uTime: { value: 0 } },
        vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor; uniform float uTime; varying vec2 vUv;
          void main(){
            float d = length(vUv - 0.5) * 2.0;
            float ring = smoothstep(0.08, 0.0, abs(d - 0.82)) * (0.75 + 0.25 * sin(uTime * 2.0));
            float fill = smoothstep(1.0, 0.0, d) * 0.18;
            float grid = step(0.94, fract(d * 9.0)) * smoothstep(0.85, 0.2, d) * 0.12;
            gl_FragColor = vec4(uColor, ring + fill + grid);
            #include <colorspace_fragment>
          }`,
      }),
    [],
  );

  useEffect(() => {
    started.current = performance.now();
  }, [pulseKey]);

  useFrame((state) => {
    glowMaterial.uniforms.uTime.value = state.clock.elapsedTime;
    if (pulse.current) {
      const t = Math.min(1, (performance.now() - started.current) / 900);
      pulse.current.scale.setScalar(1 + t * 1.2);
      (pulse.current.material as THREE.MeshBasicMaterial).opacity = (1 - t) * 0.8;
    }
  });

  return (
    <group>
      <mesh position={[0, -0.04, 0]}>
        <cylinderGeometry args={[1.7, 1.8, 0.08, 96]} />
        <meshStandardMaterial color="#0d1018" metalness={0.8} roughness={0.35} />
      </mesh>
      <mesh ref={glow} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} material={glowMaterial}>
        <planeGeometry args={[3.6, 3.6]} />
      </mesh>
      <mesh ref={pulse} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[1.35, 1.4, 96]} />
        <meshBasicMaterial color="#9b8cff" transparent opacity={0} toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  );
}

type SceneProps = { animation: string; activeStage: number; stageCount: number; onRobotClick?: () => void };

export default function RobotScene({ animation, activeStage, stageCount, onRobotClick }: SceneProps) {
  useEffect(() => trackPointer(), []);
  return (
    <LazyCanvas
      label="A 3D robot acting out the AI Social Agent's current pipeline step"
      wrapperClassName="h-full w-full"
      camera={{ position: [0, 1.7, 6.2], fov: 34 }}
      onCreated={({ camera }) => camera.lookAt(0, 1.05, 0)}
    >
      <Suspense fallback={null}>
        <Environment files="/hdr/studio.hdr" environmentIntensity={0.7} />
        <ambientLight intensity={0.15} />
        <directionalLight position={[3, 5, 4]} intensity={1.6} />
        <pointLight position={[-3, 2.5, -2]} intensity={18} color="#5ee7ff" />
        <pointLight position={[3, 1.5, -2.5]} intensity={14} color="#ff6fae" />
        <Robot animation={animation} onClick={onRobotClick} />
        <StageRing active={activeStage} count={stageCount} />
        <Platform pulseKey={activeStage} />
        <ContactShadows position={[0, 0.011, 0]} opacity={0.6} scale={5} blur={2.4} far={3} />
      </Suspense>
    </LazyCanvas>
  );
}

useGLTF.preload(MODEL);

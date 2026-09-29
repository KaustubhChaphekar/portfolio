"use client";

import dynamic from "next/dynamic";

function SceneLoader() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-cyan" />
    </div>
  );
}

// WebGL scenes are client-only; each loads as its own chunk.
export const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });
export const RobotScene = dynamic(() => import("./RobotScene"), { ssr: false, loading: SceneLoader });
export const SkillsScene = dynamic(() => import("./SkillsScene"), { ssr: false, loading: SceneLoader });
export const GlobeScene = dynamic(() => import("./GlobeScene"), { ssr: false, loading: SceneLoader });

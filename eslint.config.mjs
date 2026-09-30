import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "legacy-static-site/**"]),
  // React Three Fiber mutates three.js objects (materials, uniforms, meshes) inside useFrame
  // by design — that's how per-frame animation avoids re-rendering React.
  {
    files: ["components/three/**/*.{ts,tsx}"],
    rules: { "react-hooks/immutability": "off" },
  },
]);

export default eslintConfig;

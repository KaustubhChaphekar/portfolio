// Round, soft points with a per-point twinkle. Used by the hero galaxy and starfield.
export const pointsVertex = /* glsl */ `
uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
attribute float aScale;
attribute vec3 aColor;
varying vec3 vColor;
varying float vAlpha;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  float twinkle = 0.65 + 0.35 * sin(uTime * 1.3 + aScale * 57.0);
  gl_PointSize = uSize * aScale * uPixelRatio * (1.0 / -mv.z);
  vColor = aColor;
  vAlpha = twinkle;
}
`;

export const pointsFragment = /* glsl */ `
uniform float uOpacity;
varying vec3 vColor;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  a *= a;
  gl_FragColor = vec4(vColor, a * vAlpha * uOpacity);
  #include <colorspace_fragment>
}
`;

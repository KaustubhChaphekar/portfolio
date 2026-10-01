// Builds public/hero/portrait.png — the map the hero's particle portrait is sampled from.
// Re-run after changing your photo:  node scripts/make-portrait.mjs
//
// Input: assets/me/kaustubh-cutout.png — the photo with the background removed (transparent).
//   Made locally with @imgly/background-removal-node; any "remove background" PNG works.
//
// Output channels:
//   Red   = brightness, with local contrast so eyes, glasses, beard and jacket folds read
//   Green = subject mask (from the cutout's alpha)
//   Blue  = depth (a softened mask: thick in the middle of the body, thin at the edges)
import sharp from "sharp";

const SRC = "assets/me/kaustubh-cutout.png";
const OUT = "public/hero/portrait.png";
const CROP = { left: 60, top: 150, width: 1134, height: 1104 }; // the whole figure, minus empty space above
const W = 200;
const H = Math.round((W * CROP.height) / CROP.width);

const src = sharp(SRC).extract(CROP);
const alpha = await src.clone().extractChannel(3).resize(W, H).raw().toBuffer();

// Brightness over black, so the removed background can't leak into the contrast stretch.
const lum = await sharp(await src.clone().flatten({ background: "#000000" }).png().toBuffer())
  .grayscale()
  .resize(W, H)
  .clahe({ width: 24, height: 24, maxSlope: 3 })
  .normalise()
  .extractChannel(0)
  .raw()
  .toBuffer();

const depth = await sharp(alpha, { raw: { width: W, height: H, channels: 1 } })
  .blur(9)
  .normalise()
  .extractChannel(0)
  .raw()
  .toBuffer();

const rgb = Buffer.alloc(W * H * 3);
for (let i = 0; i < W * H; i++) {
  rgb[i * 3] = alpha[i] > 8 ? lum[i] : 0;
  rgb[i * 3 + 1] = alpha[i];
  rgb[i * 3 + 2] = depth[i];
}
await sharp(rgb, { raw: { width: W, height: H, channels: 3 } }).png({ compressionLevel: 9 }).toFile(OUT);
console.log(`wrote ${OUT} (${W}×${H})`);

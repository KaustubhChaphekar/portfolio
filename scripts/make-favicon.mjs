// Builds app/favicon.ico (16, 32, 48 and 96 px) from app/icon.svg.
// Google needs a favicon whose size is a multiple of 48 px, and many crawlers and apps only
// ever request /favicon.ico. Re-run after changing the logo:  node scripts/make-favicon.mjs
import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const SIZES = [16, 32, 48, 96];
const svg = await readFile("app/icon.svg");
const images = await Promise.all(SIZES.map((s) => sharp(svg, { density: 384 }).resize(s, s).png().toBuffer()));

// ICO = 6-byte header + a 16-byte directory entry per image + the PNG data.
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(images.length, 4);

let offset = 6 + 16 * images.length;
const entries = images.map((png, i) => {
  const e = Buffer.alloc(16);
  const size = SIZES[i];
  e.writeUInt8(size >= 256 ? 0 : size, 0); // width
  e.writeUInt8(size >= 256 ? 0 : size, 1); // height
  e.writeUInt8(0, 2); // palette colours
  e.writeUInt8(0, 3); // reserved
  e.writeUInt16LE(1, 4); // colour planes
  e.writeUInt16LE(32, 6); // bits per pixel
  e.writeUInt32LE(png.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += png.length;
  return e;
});

await writeFile("app/favicon.ico", Buffer.concat([header, ...entries, ...images]));
console.log(`wrote app/favicon.ico (${SIZES.join(", ")} px)`);

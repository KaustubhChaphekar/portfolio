import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { profile } from "./data";

// The portrait as a data URL for Open Graph images (rendered at build time).
export async function ogPhoto() {
  const file = await readFile(join(process.cwd(), "public", profile.photo));
  return `data:image/jpeg;base64,${file.toString("base64")}`;
}

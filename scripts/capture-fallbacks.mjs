// Captures still images of every 3D scene into public/fallback/ — the versions shown to
// visitors whose devices can't (or shouldn't) run WebGL.
//
//   npm run build && npm start            # in one terminal
//   npm run capture:fallbacks [url]       # in another (default url: http://localhost:3000)
//
// Needs a local Chrome or Edge. Set CHROME_PATH if it isn't found automatically.

import { existsSync, mkdirSync } from "node:fs";
import { chromium } from "playwright-core";

const BASE = process.argv[2] ?? "http://localhost:3000";
const OUT = "public/fallback";
mkdirSync(OUT, { recursive: true });

const candidates = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);
const executablePath = candidates.find((p) => existsSync(p));
if (!executablePath) throw new Error("No Chrome/Edge found — set CHROME_PATH.");

const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});

// Hide all page content so only the WebGL canvas is left in the shot.
const onlyHero = `header, main, footer, button[aria-label="Ask my AI assistant"] { visibility: hidden !important; }`;
const onlyScene = (scope) => `
  html, body { background: transparent !important; }
  * { visibility: hidden !important; }
  ${scope} [role="img"], ${scope} [role="img"] * { visibility: visible !important; }`;

async function page(viewport, deviceScaleFactor) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor });
  const p = await ctx.newPage();
  // ?effects=on forces the live scenes even though headless Chrome renders in software.
  await p.goto(`${BASE}/?effects=on`, { waitUntil: "networkidle" });
  return { ctx, p };
}

async function hero(name, viewport, dpr) {
  const { ctx, p } = await page(viewport, dpr);
  await p.waitForTimeout(5000);
  await p.addStyleTag({ content: onlyHero });
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${OUT}/${name}`, type: "jpeg", quality: 82 });
  await ctx.close();
  console.log("✓", name);
}

async function scene(name, scope, prepare) {
  const { ctx, p } = await page({ width: 1440, height: 900 }, 2);
  const el = p.locator(`${scope} [role="img"]`).first();
  await el.evaluate((n) => window.scrollTo({ top: n.getBoundingClientRect().top + window.scrollY - 120, behavior: "instant" }));
  await p.waitForTimeout(9000);
  if (prepare) await prepare(p);
  await p.addStyleTag({ content: onlyScene(scope) });
  await p.waitForTimeout(300);
  await el.screenshot({ path: `${OUT}/${name}`, omitBackground: true });
  await ctx.close();
  console.log("✓", name);
}

await hero("hero-wide.jpg", { width: 1440, height: 900 }, 1);
await hero("hero-narrow.jpg", { width: 390, height: 844 }, 2);
await scene("robot.png", "#ai-agent", async (p) => {
  await p.getByRole("button", { name: /Script/ }).first().click(); // Idle pose
  await p.waitForTimeout(1500);
});
await scene("skills.png", "#skills");
await scene("globe.png", "#contact");

await browser.close();

#!/usr/bin/env node
/**
 * App Store screenshots (6.9" iPhone, 1320 × 2868) from the production build.
 * Run `npm run build` first. Output: store/screenshots/iphone-6.9/*.png
 *
 *   node scripts/ios-screenshots.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { preview } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(root, "store", "screenshots", "iphone-6.9");
fs.mkdirSync(OUT, { recursive: true });
process.env.PLAYWRIGHT_BROWSERS_PATH = "0";
const { chromium } = await import("playwright-core");

const server = await preview({ root, preview: { port: 4185, strictPort: true, open: false }, logLevel: "silent" });
const BASE = "http://localhost:4185/";
const t = new Date().toISOString();
const PROFILE = {
  name: "Ananya",
  email: "ananya@example.com",
  emailVerified: true,
  categories: ["thyroid", "sugar", "bp", "inflammation"],
  createdAt: t,
  updatedAt: t,
  version: 1,
  prefs: { region: "telugu", diet: "vegetarian", approach: "both", audience: "women", age: "35-39" },
};

let browser;
try {
  browser = await chromium.launch({ headless: true });
} catch {
  browser = await chromium.launch({ channel: "msedge", headless: true });
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function page(profile, at) {
  const ctx = await browser.newContext({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  await ctx.addInitScript((p) => {
    if (sessionStorage.getItem("seeded")) return;
    sessionStorage.setItem("seeded", "1");
    localStorage.clear();
    if (p) localStorage.setItem("vidura.profile", JSON.stringify(p));
  }, profile);
  const pg = await ctx.newPage();
  await pg.goto(`${BASE}?at=${at}`);
  await wait(5000);
  return { ctx, pg };
}
const snap = async (pg, name) => {
  await pg.screenshot({ path: path.join(OUT, `${name}.png`) });
  console.log(`✔ ${name}.png`);
};

try {
  // 1 · Now: the next step for this moment of the day
  let { ctx, pg } = await page(PROFILE, "07:40");
  await snap(pg, "01-now");
  await ctx.close();

  // 2 · Guided breathing with voice countdown
  ({ ctx, pg } = await page(PROFILE, "11:30"));
  await pg.locator(".now-actions").getByRole("button", { name: "Start" }).click();
  await wait(3200);
  await snap(pg, "02-guided-breathing");
  await ctx.close();

  // 3 · Thyroid guide: your numbers
  ({ ctx, pg } = await page(PROFILE, "10:30"));
  await pg.getByRole("button", { name: "Tips", exact: true }).click();
  await wait(900);
  await pg.locator(".guide-link", { hasText: "Thyroid problems" }).first().click();
  await wait(1200);
  await pg.evaluate(() => {
    const el = document.getElementById("c-numbers");
    if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 24);
  });
  await wait(600);
  await snap(pg, "03-your-numbers");
  // 4 · The guide's opening: the evidence, plainly
  await pg.evaluate(() => window.scrollTo(0, 0));
  await wait(600);
  await snap(pg, "04-evidence-guide");
  await ctx.close();

  // 5 · Pick what matters to you
  ({ ctx, pg } = await page({ ...PROFILE, categories: [] }, "18:30"));
  await snap(pg, "05-focus-areas");
  await ctx.close();
} finally {
  await browser.close();
  await new Promise((r) => server.httpServer.close(r));
}
console.log(`\nScreenshots → ${path.relative(root, OUT)}`);

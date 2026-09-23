#!/usr/bin/env node
/**
 * Image pipeline for Vidura Life — Nano Banana Pro (Gemini 3 Pro Image).
 *
 * Every slot (category tiles 1:1, phase heroes 16:9, phase×activity cards 4:5) and
 * its prompt comes from src/data/content.ts, with the shared style block appended.
 *
 *   node scripts/generate-images.mjs --list        # write docs/IMAGE_PROMPTS.md, no API calls
 *   node scripts/generate-images.mjs --dry         # show what would be generated + cost estimate
 *   node scripts/generate-images.mjs               # generate missing images
 *   node scripts/generate-images.mjs --only=night  # only paths containing "night"
 *   node scripts/generate-images.mjs --force       # regenerate even if the file exists
 *
 * Env (.env.local is loaded automatically):
 *   GEMINI_API_KEY      required for generation
 *   NANO_BANANA_MODEL   default: auto-detect gemini-3-pro-image(-preview)
 *   IMAGE_SIZE          1K | 2K | 4K (default 2K — same price as 1K)
 *   CONCURRENCY         parallel requests (default 2)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { ACTIVITIES, CATEGORIES, PHASES, STYLE_BLOCK, buildImagePrompt } from "../src/data/content.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = new Set(process.argv.slice(2));
const flag = (name) => [...args].find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const LIST = args.has("--list");
const DRY = args.has("--dry");
const FORCE = args.has("--force");
const ONLY = flag("only");

try {
  process.loadEnvFile(path.join(root, ".env.local"));
} catch {
  /* optional */
}

const API = "https://generativelanguage.googleapis.com/v1beta";
const KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
const SIZE = (process.env.IMAGE_SIZE || "2K").toUpperCase();
const CONCURRENCY = Math.max(1, Number(process.env.CONCURRENCY || 2));
const PRICE = SIZE === "4K" ? 0.24 : 0.134; // USD per output image (Gemini 3 Pro Image list price)

/** Output sizes per ratio: [main width, main height]; a half-size "-sm" variant is written too. */
const OUT = { "1:1": [1024, 1024], "4:5": [1080, 1350], "16:9": [1920, 1080] };

// ── Collect every slot ──────────────────────────────────────────────────────
const slots = [
  ...CATEGORIES.map((c) => ({ group: "Category tiles (1:1)", label: c.label, slot: c.image })),
  ...PHASES.map((p) => ({ group: "Phase heroes (16:9)", label: `${p.label} hero`, slot: p.hero })),
  ...ACTIVITIES.map((a) => ({ group: "Phase × activity cards (4:5)", label: `${PHASES.find((p) => p.id === a.phase).label} · ${a.title}`, slot: a.image })),
].filter((s) => !ONLY || s.slot.src.includes(ONLY));

const dest = (src) => path.join(root, "public", src);
const exists = (src) => fs.existsSync(dest(src));

// ── --list: the prompt document ─────────────────────────────────────────────
function writePromptDoc() {
  const lines = [
    "# Nano Banana Pro — image prompts",
    "",
    "Generated from `src/data/content.ts` by `npm run images:prompts`. Every prompt is the scene",
    "description + a composition hint for its aspect ratio + the shared style block:",
    "",
    `> ${STYLE_BLOCK}`,
    "",
    "`{phase}` is filled with the slot's tone (e.g. *dawn — soft peach and lilac*). Files land in",
    "`public/assets/{phase|focus}/{slug}.webp` (+ `-sm.webp`), lazy-loaded with a blurred placeholder.",
    "",
    `Total: **${slots.length} images** (≈ $${(slots.length * PRICE).toFixed(2)} at ${SIZE}).`,
    "",
  ];
  let group = "";
  for (const s of slots) {
    if (s.group !== group) {
      group = s.group;
      lines.push(`## ${group}`, "");
    }
    lines.push(`### ${s.label}`, "", `\`${s.slot.src}\` · ${s.slot.ratio} · tone: ${s.slot.tone}`, "", "```text", buildImagePrompt(s.slot), "```", "");
  }
  const file = path.join(root, "docs", "IMAGE_PROMPTS.md");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, lines.join("\n"), "utf8");
  console.log(`✔ ${slots.length} prompts → ${path.relative(root, file)}`);
}

if (LIST) {
  writePromptDoc();
  process.exit(0);
}

const todo = slots.filter((s) => FORCE || !exists(s.slot.src));
console.log(`${todo.length} of ${slots.length} images to generate at ${SIZE} · est. $${(todo.length * PRICE).toFixed(2)}`);
if (DRY || !todo.length) {
  todo.forEach((s) => console.log(`  - ${s.slot.src}`));
  process.exit(0);
}
if (!KEY) {
  console.error("✖ GEMINI_API_KEY is missing. Add it to .env.local (see .env.example).");
  process.exit(1);
}

// ── API helpers ─────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(pathname, init = {}) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`${API}${pathname}`, {
      ...init,
      headers: { "x-goog-api-key": KEY, "content-type": "application/json", ...(init.headers || {}) },
    });
    if (res.ok) return res.json();
    const text = await res.text();
    const retryable = res.status === 429 || res.status >= 500;
    if (!retryable || attempt >= 5) {
      const err = new Error(`HTTP ${res.status}: ${text.slice(0, 400)}`);
      err.status = res.status;
      throw err;
    }
    const after = Number(res.headers.get("retry-after")) || 0;
    const wait = Math.max(after * 1000, 2000 * 2 ** attempt) + Math.random() * 500;
    console.log(`  … ${res.status}, retrying in ${(wait / 1000).toFixed(1)}s`);
    await sleep(wait);
  }
}

async function pickModel() {
  const want = process.env.NANO_BANANA_MODEL;
  if (want) return want.replace(/^models\//, "");
  const names = [];
  let token = "";
  do {
    const page = await api(`/models?pageSize=200${token ? `&pageToken=${token}` : ""}`);
    names.push(...(page.models || []).map((m) => m.name.replace(/^models\//, "")));
    token = page.nextPageToken || "";
  } while (token);
  const preferred = ["gemini-3-pro-image", "gemini-3-pro-image-preview"]; // Nano Banana Pro: GA first
  const hit = preferred.find((p) => names.includes(p)) || names.find((n) => /pro-image/.test(n));
  if (!hit) throw new Error(`No Nano Banana Pro model available to this key. Image models seen: ${names.filter((n) => /image/.test(n)).join(", ") || "none"}`);
  return hit;
}

async function generate(model, slot) {
  const prompt = buildImagePrompt(slot);
  const body = (modalities) => ({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { responseModalities: modalities, imageConfig: { aspectRatio: slot.ratio, imageSize: SIZE } },
  });
  let json;
  try {
    json = await api(`/models/${model}:generateContent`, { method: "POST", body: JSON.stringify(body(["IMAGE"])) });
  } catch (e) {
    if (e.status !== 400) throw e;
    json = await api(`/models/${model}:generateContent`, { method: "POST", body: JSON.stringify(body(["TEXT", "IMAGE"])) });
  }
  const parts = json.candidates?.[0]?.content?.parts || [];
  const img = parts.filter((p) => (p.inlineData || p.inline_data) && !p.thought).pop();
  const data = img?.inlineData?.data || img?.inline_data?.data;
  if (!data) {
    const why = json.promptFeedback?.blockReason || json.candidates?.[0]?.finishReason || "no image returned";
    throw new Error(`No image (${why})`);
  }
  return Buffer.from(data, "base64");
}

async function save(slot, buf) {
  const raw = path.join(root, "assets-src", slot.src.replace(/\.webp$/, ".png"));
  fs.mkdirSync(path.dirname(raw), { recursive: true });
  fs.writeFileSync(raw, buf);
  const [w, h] = OUT[slot.ratio];
  const out = dest(slot.src);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const base = sharp(buf).rotate();
  await base.clone().resize(w, h, { fit: "cover", position: "attention" }).webp({ quality: 80, effort: 5 }).toFile(out);
  await base
    .clone()
    .resize(Math.round(w / 2), Math.round(h / 2), { fit: "cover", position: "attention" })
    .webp({ quality: 74, effort: 5 })
    .toFile(out.replace(/\.webp$/, "-sm.webp"));
}

// ── Run ─────────────────────────────────────────────────────────────────────
const model = await pickModel();
console.log(`Model: ${model} · concurrency ${CONCURRENCY}`);
const queue = [...todo];
const failed = [];
let done = 0;
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const s = queue.shift();
      const t0 = Date.now();
      try {
        const buf = await generate(model, s.slot);
        await save(s.slot, buf);
        done++;
        console.log(`✔ [${done + failed.length}/${todo.length}] ${s.slot.src} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
      } catch (e) {
        failed.push({ src: s.slot.src, error: String(e.message || e) });
        console.log(`✖ [${done + failed.length}/${todo.length}] ${s.slot.src} — ${e.message}`);
        if (e.status === 401 || e.status === 403) queue.length = 0; // bad key: stop early
      }
    }
  }),
);

console.log(`\n${done} generated, ${failed.length} failed.`);
if (failed.length) fs.writeFileSync(path.join(root, "assets-src", "failed.json"), JSON.stringify(failed, null, 2));
await import("./build-lqip.mjs");
process.exit(failed.length ? 1 : 0);

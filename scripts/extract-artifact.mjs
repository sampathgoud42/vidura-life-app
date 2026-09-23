#!/usr/bin/env node
/**
 * One-off (re-runnable) extraction of the wellness data from the original
 * "Wellness app" Claude artifact (reference/wellness-app.original.jsx).
 *
 * - Evaluates only the plain data constants of the artifact in a sandbox
 *   (no JSX / UI code is executed).
 * - Writes a full raw dump to reference/artifact-data.json for traceability.
 * - Injects the regional 7-day meal plans + protein data into
 *   src/data/content.ts between the `<generated:meals>` markers, so that all
 *   app content stays in ONE typed data file.
 * - Strips explicit physiological / medical claims from meal descriptions
 *   (e.g. "— nature's statin"), keeping the food itself. Every change is
 *   printed so it can be reviewed.
 *
 * Usage: node scripts/extract-artifact.mjs [--dry]
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(root, "reference", "wellness-app.original.jsx");
const OUT_JSON = path.join(root, "reference", "artifact-data.json");
const CONTENT = path.join(root, "src", "data", "content.ts");
const DRY = process.argv.includes("--dry");

const lines = fs.readFileSync(SRC, "utf8").split(/\r?\n/);
const find = (re, from = 0) => {
  const i = lines.findIndex((l, idx) => idx >= from && re.test(l));
  if (i < 0) throw new Error(`Pattern not found in artifact: ${re}`);
  return i;
};
const slice = (startRe, endRe) => {
  const s = find(startRe);
  const e = find(endRe, s + 1);
  return lines.slice(s, e).join("\n");
};

// Only data declarations — the palette through protein data, plus two later data blocks.
const code = [
  slice(/^const C = \{/, /^\/\/ ── HELPERS/),
  slice(/^const T_SECRETS = \[/, /^\/\/ ── DISCLAIMER/),
  slice(/^const AFFIRMATIONS = \[/, /^\/\/ ── SPLASH/),
  `;({ C, GOALS_MALE, GOALS_FEMALE, AGE_NOTES, MORNING_BASE, MORNING_GENDER, EXERCISE_PLAN,
      GOAL_DATA, BASE_MEALS, DAYS, REGIONS, REGION_MEALS, PROTEIN_SNACKS, AIR_FRY_DINNERS,
      AIR_FRY_LUNCHES, PROTEIN_EST, PROTEIN_BREAKDOWN, T_SECRETS, AFFIRMATIONS })`,
].join("\n\n");

const data = vm.runInNewContext(code, Object.create(null), { timeout: 2000 });
fs.writeFileSync(OUT_JSON, JSON.stringify(data, null, 2) + "\n", "utf8");

// ── Claim cleanup ─────────────────────────────────────────────────────────────
const CLAIM =
  /statin|anti-?inflam|anti-?LDL|\bLDL\b|\bHDL\b|enzyme|papain|bromelain|polyphenol|metabolism|insulin|heart-healthy|gut-friendly|omega-3|probiotic|zinc|\bGI\b|glyc|detox|immun|hormon/i;
const changes = [];
function clean(text) {
  let out = text;
  // "food — claim, keep. claim" → "food — keep": drop only the claim fragments of a suffix
  const parts = out.split(" — ");
  if (parts.length > 1) {
    const kept = [parts[0]];
    for (const p of parts.slice(1)) {
      const frags = p
        .split(/\.\s+|,\s+/)
        .map((f) => f.trim())
        .filter((f) => f && !CLAIM.test(f));
      if (frags.length)
        kept.push(frags.map((f, i) => (i ? f.charAt(0).toLowerCase() + f.slice(1) : f)).join(", "));
    }
    out = kept.join(" — ");
  }
  // "(heart-healthy)" / "(GI 22)" parentheticals
  out = out.replace(/\s*\(([^)]*)\)/g, (m, inner) => (CLAIM.test(inner) ? "" : m));
  out = out.replace(/\s{2,}/g, " ").trim();
  if (out !== text) changes.push([text, out]);
  return out;
}

// ── Transform ─────────────────────────────────────────────────────────────────
const REGION_IDS = {
  "North Indian": "north-indian",
  Telugu: "telugu",
  Tamil: "tamil",
  Kerala: "kerala",
  Bangalore: "bangalore",
};
const DIET_IDS = { Vegetarian: "vegetarian", "Non-Vegetarian": "non-vegetarian", Vegan: "vegan" };
const SLOT_KEYS = { em: "early", br: "breakfast", mm: "midMorning", lu: "lunch", es: "snack", di: "dinner" };

// Emoji 13+ (and flags) render as empty boxes on Windows 10 and older Android — use
// long-supported equivalents instead.
const EMOJI_MAP = { "🫀": "❤️", "🫘": "🥣", "🫙": "🥛", "🫐": "🍇", "🫚": "🌿", "🫒": "🥗", "🪷": "🌸", "🫁": "🌬️" };
const safeEmoji = (s) => s.replace(/🫀|🫘|🫙|🫐|🫚|🫒|🪷|🫁/gu, (e) => EMOJI_MAP[e]);

const splitTheme = (theme) => {
  const m = theme.match(/^(.*?)\s*(\p{Extended_Pictographic}[️‍\p{Extended_Pictographic}]*)?\s*$/u);
  return { name: (m?.[1] ?? theme).trim(), emoji: safeEmoji(m?.[2] ?? "") };
};
const meal = (x) => ({ title: safeEmoji(x.t.trim()), detail: safeEmoji(clean(x.d.trim())) });
const day = (d) => {
  const { name, emoji } = splitTheme(d.theme);
  const out = { theme: name, emoji };
  for (const [k, v] of Object.entries(SLOT_KEYS)) out[v] = meal(d[k]);
  return out;
};
const dietMap = (byDiet) =>
  Object.fromEntries(Object.entries(DIET_IDS).map(([src, id]) => [id, byDiet[src].map(day)]));

const plans = { "pan-indian": dietMap(data.BASE_MEALS) };
for (const [src, id] of Object.entries(REGION_IDS)) plans[id] = dietMap(data.REGION_MEALS[src]);

// sanity: 6 regions × 3 diets × 7 days × 6 slots
let count = 0;
for (const r of Object.values(plans))
  for (const d of Object.values(r)) {
    if (d.length !== 7) throw new Error("Expected 7 days per diet");
    count += d.length;
  }

const q = (s) => JSON.stringify(s);
const emitMeal = (m) => `{ title: ${q(m.title)}, detail: ${q(m.detail)} }`;
const emitDay = (d, pad) =>
  `${pad}{\n${pad}  theme: ${q(d.theme)}, emoji: ${q(d.emoji)},\n` +
  Object.values(SLOT_KEYS)
    .map((k) => `${pad}  ${k}: ${emitMeal(d[k])},`)
    .join("\n") +
  `\n${pad}},`;
const emitSimpleList = (name, list) =>
  `export const ${name}: readonly Meal[] = [\n` +
  list.map((x) => `  ${emitMeal({ title: x.t, detail: clean(x.d) })},`).join("\n") +
  `\n];`;

const ts = [
  `// Extracted from the original "Wellness app" artifact by scripts/extract-artifact.mjs.`,
  `// ${count} day plans · 6 regions × 3 diets × 7 days × 6 meal slots. Re-run the script to refresh.`,
  `export const MEAL_PLANS: Record<RegionId, Record<DietId, readonly DayPlan[]>> = {`,
  ...Object.entries(plans).map(
    ([rid, byDiet]) =>
      `  ${q(rid)}: {\n` +
      Object.entries(byDiet)
        .map(([did, days]) => `    ${q(did)}: [\n${days.map((d) => emitDay(d, "      ")).join("\n")}\n    ],`)
        .join("\n") +
      `\n  },`,
  ),
  `};`,
  ``,
  `/** Evening protein snacks (all diets) — the artifact swaps these into every day's snack slot. */`,
  emitSimpleList("PROTEIN_SNACKS", data.PROTEIN_SNACKS),
  ``,
  `/** Non-vegetarian air-fry dinners — used every day. */`,
  emitSimpleList("AIR_FRY_DINNERS", data.AIR_FRY_DINNERS),
  ``,
  `/** Non-vegetarian air-fry lunches — used on alternate days (Tue, Thu, Sat). */`,
  emitSimpleList("AIR_FRY_LUNCHES", data.AIR_FRY_LUNCHES),
  ``,
  `/** Approximate daily protein (g) per diet, Monday → Sunday. */`,
  `export const PROTEIN_ESTIMATE: Record<DietId, readonly number[]> = {`,
  ...Object.entries(DIET_IDS).map(([src, id]) => `  ${q(id)}: ${q(data.PROTEIN_EST[src])},`),
  `};`,
].join("\n");

if (DRY) {
  console.log(ts.slice(0, 1500) + "\n…");
} else {
  const content = fs.readFileSync(CONTENT, "utf8");
  const START = "// <generated:meals>";
  const END = "// </generated:meals>";
  const a = content.indexOf(START);
  const b = content.indexOf(END);
  if (a < 0 || b < 0) throw new Error(`Markers ${START} / ${END} not found in ${CONTENT}`);
  const next = content.slice(0, a + START.length) + "\n" + ts + "\n" + content.slice(b);
  fs.writeFileSync(CONTENT, next, "utf8");
  console.log(`✔ Injected ${count} day plans into src/data/content.ts`);
}

console.log(`✔ Raw artifact data → ${path.relative(root, OUT_JSON)}`);
console.log(`\nClaim cleanup (${changes.length} descriptions):`);
const seen = new Set();
for (const [a, b] of changes) {
  const key = a + "→" + b;
  if (seen.has(key)) continue;
  seen.add(key);
  console.log(`  - ${a}\n    → ${b}`);
}

#!/usr/bin/env node
/**
 * Automated QA pass in a real browser: the Chrome headless shell that
 * `npm run qa:setup` installs inside this project (node_modules/playwright-core/.local-browsers).
 * Builds nothing: run `npm run build` first. Screenshots → qa/screens, report → qa/report.json.
 *
 *   node scripts/qa.mjs            # all scenarios
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { preview } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SHOTS = path.join(root, "qa", "screens");
fs.mkdirSync(SHOTS, { recursive: true });

// Browsers live inside the project (must be set before playwright-core loads its registry).
process.env.PLAYWRIGHT_BROWSERS_PATH = "0";
const { chromium } = await import("playwright-core");

// During QA the wellness API writes to a throwaway database, never the real one.
const QA_DB = path.join(root, "qa", "wellness-qa.db");
for (const ext of ["", "-wal", "-shm"]) fs.rmSync(QA_DB + ext, { force: true });
process.env.WELLNESS_DB = QA_DB;

const server = await preview({ root, preview: { port: 4179, strictPort: true, open: false }, logLevel: "silent" });
const BASE = "http://localhost:4179/";
let browser;
try {
  browser = await chromium.launch({ headless: true });
} catch (e) {
  console.error("✖ QA browser missing: run `npm run qa:setup` once (it installs inside this project).");
  await new Promise((r) => server.httpServer.close(r));
  throw e;
}

const results = [];
const errors = [];
const pass = (name, ok, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "✔" : "✖"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const PROFILE = {
  name: "Priya",
  email: "priya@example.com",
  categories: ["cholesterol", "sugar"],
  createdAt: "2026-09-20T08:00:00.000Z",
  updatedAt: "2026-09-20T08:00:00.000Z",
  version: 1,
  prefs: { region: "telugu", diet: "vegetarian", approach: "both", audience: "everyone" },
};

const mobile = { viewport: { width: 380, height: 820 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function newPage(opts = {}, init) {
  const ctx = await browser.newContext({ ...mobile, ...opts });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && !/Failed to load resource/.test(m.text()) && errors.push(`console: ${m.text()}`));
  if (init) await page.addInitScript(init.fn, init.arg);
  return { ctx, page };
}
const seed = { fn: (p) => localStorage.setItem("vidura.profile", JSON.stringify(p)), arg: PROFILE };
const shot = (page, name, fullPage = false) => page.screenshot({ path: path.join(SHOTS, `${name}.png`), fullPage });
// Compare against the configured viewport: mobile emulation silently widens the layout
// viewport when content overflows, so innerWidth alone can't catch horizontal scroll.
const overflow = async (page) => (await page.evaluate(() => document.documentElement.scrollWidth)) - page.viewportSize().width;
const phase = (page) => page.evaluate(() => document.documentElement.dataset.phase);
const { DatabaseSync } = await import("node:sqlite");
const dbRows = () => {
  try {
    const db = new DatabaseSync(QA_DB);
    const rows = db.prepare("SELECT email, name, saves FROM contacts ORDER BY id").all();
    db.close();
    return rows;
  } catch {
    return [];
  }
};
const localKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

try {
  // ── A · First run: onboarding → focus → kitchen → Now → Tips → Insights → Settings
  {
    const { ctx, page } = await newPage();
    await page.goto(`${BASE}?at=08:10`);
    await wait(2600);
    await shot(page, "A01-name");
    pass("Onboarding asks for a name", await page.getByRole("heading", { name: "How should I call you?" }).isVisible());

    await page.getByRole("button", { name: "Continue" }).click();
    await wait(600);
    await shot(page, "A02-name-empty");
    pass("Empty name shows a gentle hint", (await page.locator("#name-hint").innerText()).includes("call you"));

    await page.locator("#name-input").fill("   ");
    await page.keyboard.press("Enter");
    await wait(300);
    pass("Whitespace-only name is rejected", (await page.locator("#name-hint").innerText()).includes("call you"));

    await page.locator("#name-input").fill("A".repeat(31));
    await page.keyboard.press("Enter");
    await wait(300);
    pass("31-character name is rejected", (await page.locator("#name-hint").innerText()).includes("30"));

    await page.locator("#name-input").fill("  Priya  ");
    await page.keyboard.press("Enter");
    await wait(1400);
    await shot(page, "A03-email");
    pass("Name morphs into the greeting", (await page.locator(".onb-hi").innerText()).replace(/\s+/g, " ").includes("Hi, Priya"));

    await page.locator("#email-input").pressSequentially("priya@", { delay: 30 });
    await wait(700);
    await shot(page, "A04-email-invalid");
    pass("Live validation flags an incomplete email (debounced)", (await page.locator("#email-hint").innerText()).includes("name@example.com"));

    for (const bad of ["priya@example", "priya@example.c", "pri ya@example.com", "@example.com"]) {
      await page.locator("#email-input").fill(bad);
      await wait(420);
      const invalid = (await page.locator("#email-input").getAttribute("aria-invalid")) === "true";
      pass(`Email "${bad}" is invalid`, invalid);
    }
    await page.locator("#email-input").fill("priya@example.com");
    await wait(900);
    await shot(page, "A05-email-valid");
    pass("Valid email draws the checkmark", (await page.locator(".input-line").getAttribute("data-state")) === "valid");

    await page.keyboard.press("Enter");
    await wait(2000);
    await shot(page, "A06-welcome");
    pass("Welcome reveal uses the name", (await page.locator(".welcome-title").innerText()).includes("Welcome to Vidura Life, Priya"));
    await wait(400);
    pass("Email saved to the wellness DB as soon as it's entered", dbRows().some((r) => r.email === "priya@example.com" && r.name === "Priya"), JSON.stringify(dbRows()));
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("vidura.profile")));
    pass(
      "Profile stored under vidura.profile with the expected shape",
      stored.name === "Priya" && stored.email === "priya@example.com" && Array.isArray(stored.categories) && stored.version === 1 && !!stored.createdAt && !!stored.updatedAt,
    );

    await wait(3600);
    await shot(page, "A07-focus");
    pass("Focus screen shows 7 category tiles", (await page.locator(".tile").count()) === 7);
    pass("Focus screen fits 380px (no horizontal scroll)", (await overflow(page)) <= 0);
    const vfit = await page.evaluate(() => {
      const foot = document.querySelector(".focus-footer").getBoundingClientRect();
      const last = Math.max(...[...document.querySelectorAll(".tile")].map((t) => t.getBoundingClientRect().bottom));
      return { last: Math.round(last), foot: Math.round(foot.top), scroll: document.documentElement.scrollHeight - innerHeight };
    });
    pass("All 7 tiles visible above the action bar at 380×820", vfit.last <= vfit.foot && vfit.scroll <= 4, JSON.stringify(vfit));

    await page.getByRole("button", { name: "Continue" }).click();
    await wait(400);
    pass("Continuing with no focus shows a hint", (await page.locator("#focus-hint").innerText()).includes("at least one"));

    await page.locator(".tile", { hasText: "Cholesterol" }).click({ force: true });
    await page.locator(".tile", { hasText: "Blood Sugar" }).click({ force: true });
    await wait(700);
    await shot(page, "A08-focus-selected");
    pass("Selected tiles are pressed", (await page.locator('.tile[aria-pressed="true"]').count()) === 2);
    pass("Counter pill shows 2", (await page.locator(".counter-num").innerText()).trim() === "2");

    await page.getByRole("button", { name: "Continue" }).click();
    await wait(1100);
    await shot(page, "A09-kitchen");
    await page.getByRole("radio", { name: /Telugu/ }).click();
    await wait(400);
    await shot(page, "A10-kitchen-telugu");
    await page.getByRole("button", { name: /Looks good/ }).click();
    await wait(1800);
    await shot(page, "A11-now");
    await shot(page, "A11-now-full", true);
    pass("Now card is visible", await page.locator(".now-card").first().isVisible());
    pass("Now screen fits 380px", (await overflow(page)) <= 0);
    pass("Footer credit on the main screens", (await page.locator(".site-credit").innerText()).includes("Designed by Sampath · © 2026"));
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("vidura.profile")));
    pass("Categories + prefs persisted", saved.categories.join() === "cholesterol,sugar" && saved.prefs?.region === "telugu");

    const title = await page.locator("#now-title").innerText();
    await page.locator(".now-actions").getByRole("button", { name: "Done" }).click();
    await wait(700);
    await shot(page, "A12-done");
    const log = await page.evaluate(() => JSON.parse(localStorage.getItem("vidura.log")));
    pass("Done logs a completion", log?.entries?.length === 1, `logged "${title}"`);
    await wait(1200);
    pass("Now card advances to the next activity", (await page.locator("#now-title").innerText()) !== title);

    await page.locator(".now-actions").getByRole("button", { name: "Start" }).click();
    await wait(1600);
    await shot(page, "A13-guided");
    pass("Guided mode opens with a timer", await page.locator(".guided-time").isVisible());
    await page.keyboard.press("Escape");
    await wait(700);
    pass("Esc closes guided mode", (await page.locator(".guided").count()) === 0);

    await page.getByRole("button", { name: "Tips", exact: true }).click();
    await wait(900);
    await shot(page, "A14-tips");
    const first = await page.locator(".tip-top .tip-title").innerText();
    const card = await page.locator(".tip-top").boundingBox();
    await page.mouse.move(card.x + card.width / 2, card.y + card.height / 2);
    await page.mouse.down();
    await page.mouse.move(card.x - 60, card.y + card.height / 2, { steps: 12 });
    await page.mouse.up();
    await wait(1100);
    await shot(page, "A15-tips-swiped");
    pass("Dragging the top card dismisses it", (await page.locator(".tip-top .tip-title").innerText()) !== first);
    const second = await page.locator(".tip-top .tip-title").innerText();
    await page.mouse.move(card.x + card.width / 2, card.y + card.height / 2);
    await page.mouse.down();
    await page.mouse.move(card.x + card.width / 2 + 40, card.y + card.height / 2, { steps: 6 });
    await page.mouse.up();
    await wait(900);
    pass("A short drag springs back", (await page.locator(".tip-top .tip-title").innerText()) === second);
    pass("Tips carry a not-medical-advice footnote", (await page.locator(".tips-screen .footnote").innerText()).includes("not medical advice"));

    await page.getByRole("button", { name: "Insights", exact: true }).click();
    await wait(1400);
    await shot(page, "A16-insights");
    pass("Insights show a 1-day streak", (await page.locator(".insight-big").innerText()).startsWith("1"));

    await page.getByRole("button", { name: "Settings", exact: true }).click();
    await wait(900);
    await shot(page, "A17-settings");
    pass("Settings sheet has the privacy note", (await page.locator(".privacy-note").innerText()).includes("stays on this device"));
    await page.locator("#s-email").fill("priya.s@example.com");
    await wait(1400);
    const rows = dbRows();
    pass("Changing the email updates the same DB record", rows.length === 1 && rows[0].email === "priya.s@example.com" && rows[0].saves >= 2, JSON.stringify(rows));
    await page.keyboard.press("Escape");
    await wait(600);

    await page.getByRole("button", { name: "Now", exact: true }).click();
    await wait(900);
    const dial = page.locator(".dial-svg");
    await dial.scrollIntoViewIfNeeded();
    await wait(300);
    const b = await dial.boundingBox();
    const cx = b.x + b.width / 2;
    const cy = b.y + b.height / 2;
    const r = (b.width / 2) * (122 / 160);
    await page.mouse.move(cx, cy - r);
    await page.mouse.down();
    for (const deg of [30, 60, 90, 120, 150, 175]) {
      const a = (deg * Math.PI) / 180;
      await page.mouse.move(cx + r * Math.sin(a), cy - r * Math.cos(a), { steps: 4 });
      await wait(60);
    }
    await page.mouse.up();
    await wait(900);
    await shot(page, "A18-dial-night");
    pass("Scrubbing the dial to ~11:40 PM turns the sky to night", (await phase(page)) === "night");
    await page.getByRole("button", { name: /Back to now/ }).first().click();
    await wait(2400);
    pass("Back to now restores the real phase", (await phase(page)) === "morning");

    const slider = page.getByRole("slider", { name: "Preview your day" });
    await slider.focus();
    await page.keyboard.press("PageDown");
    await wait(300);
    pass("Dial is keyboard operable", (await slider.getAttribute("aria-valuetext")).length > 10, await slider.getAttribute("aria-valuetext"));
    await page.keyboard.press("Escape");

    await ctx.close();
  }

  // ── B · Returning user, every phase
  for (const [at, expected] of [
    ["05:40", "dawn"],
    ["08:00", "morning"],
    ["12:45", "midday"],
    ["15:30", "afternoon"],
    ["18:40", "evening"],
    ["22:15", "night"],
  ]) {
    const { ctx, page } = await newPage({}, seed);
    await page.goto(`${BASE}?at=${at}`);
    await wait(1200);
    if (expected === "evening") await shot(page, "B00-welcome-back");
    if (expected === "evening") pass("Returning user sees Welcome back", (await page.locator(".welcome-title").innerText()).includes("Welcome back, Priya"));
    await wait(3200);
    pass(`${at} → ${expected} phase`, (await phase(page)) === expected);
    await shot(page, `B-${expected}`);
    pass(`${expected}: fits 380px`, (await overflow(page)) <= 0);
    await ctx.close();
  }

  // ── C · Storage blocked
  {
    const { ctx, page } = await newPage(
      {},
      {
        fn: () => {
          Object.defineProperty(window, "localStorage", {
            get() {
              throw new DOMException("The operation is insecure.", "SecurityError");
            },
          });
        },
      },
    );
    await page.goto(`${BASE}?at=10:00`);
    await wait(2200);
    await page.locator("#name-input").fill("Arjun");
    await page.keyboard.press("Enter");
    await wait(1300);
    await page.locator("#email-input").fill("arjun@example.in");
    await wait(500);
    await page.keyboard.press("Enter");
    await wait(5200);
    await page.locator(".tile", { hasText: "Gut Health" }).click({ force: true });
    await page.getByRole("button", { name: "Continue" }).click();
    await wait(1000);
    await page.getByRole("button", { name: "Skip for now" }).click();
    await wait(1500);
    pass("Storage blocked: full flow still works", await page.locator(".now-card").first().isVisible());
    await page.getByRole("button", { name: "Settings", exact: true }).click();
    await wait(900);
    await shot(page, "C-storage-blocked");
    pass("Storage blocked: settings explain it", await page.locator(".storage-note").isVisible());
    await ctx.close();
  }

  // ── D · Reduced motion
  {
    const { ctx, page } = await newPage({ reducedMotion: "reduce" });
    await page.goto(`${BASE}?at=19:10`);
    await wait(400);
    await shot(page, "D-reduced-motion");
    pass("Reduced motion: question appears instantly", (await page.locator("#name-q [aria-hidden] .invisible").innerText()) === "");
    await ctx.close();
  }

  // ── E · Phase boundaries with a controlled clock
  for (const [start, before, after] of [
    [new Date(2026, 8, 23, 4, 59, 20), "night", "dawn"],
    [new Date(2026, 8, 23, 6, 59, 20), "dawn", "morning"],
    [new Date(2026, 8, 23, 19, 59, 20), "evening", "night"],
    [new Date(2026, 8, 23, 23, 59, 20), "night", "night"],
  ]) {
    const { ctx, page } = await newPage({}, seed);
    await page.clock.install({ time: start });
    await page.goto(BASE);
    await page.clock.runFor(5000);
    const p1 = await phase(page);
    await page.clock.runFor(40_000);
    const p2 = await phase(page);
    const label = `${String(start.getHours()).padStart(2, "0")}:59 → next minute`;
    pass(`Boundary ${label}: ${before} → ${after}`, p1 === before && p2 === after, `${p1} → ${p2}`);
    if (start.getHours() === 23) {
      const day = await page.evaluate(() => document.querySelector(".greeting-sub time")?.textContent ?? "");
      pass("Midnight rolls the date forward", /24/.test(day), day);
    }
    await ctx.close();
  }

  // ── F · Visibility change recompute
  {
    const { ctx, page } = await newPage({}, seed);
    await page.clock.install({ time: new Date(2026, 8, 23, 16, 59, 50) });
    await page.goto(BASE);
    await page.clock.runFor(4000);
    await page.clock.setSystemTime(new Date(2026, 8, 23, 18, 5, 0)); // tab slept past a boundary
    await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
    await page.clock.runFor(200);
    pass("visibilitychange recomputes the phase", (await phase(page)) === "evening");
    await ctx.close();
  }

  // ── G · Desktop layout
  {
    const { ctx, page } = await newPage({ viewport: { width: 1280, height: 860 }, isMobile: false, hasTouch: false, deviceScaleFactor: 1 }, seed);
    await page.goto(`${BASE}?at=13:05`);
    await wait(5600);
    await shot(page, "G-desktop-now");
    pass("Desktop fits without horizontal scroll", (await overflow(page)) <= 0);
    await ctx.close();
  }
  // ── G2 · Desktop focus screen: seven tiles, all visible
  for (const [w, h] of [
    [1280, 800],
    [1440, 900],
  ]) {
    const empty = { ...PROFILE, categories: [] };
    const { ctx, page } = await newPage(
      { viewport: { width: w, height: h }, isMobile: false, hasTouch: false, deviceScaleFactor: 1 },
      { fn: (p) => localStorage.setItem("vidura.profile", JSON.stringify(p)), arg: empty },
    );
    await page.goto(`${BASE}?at=10:30`);
    await wait(6200);
    await shot(page, `G2-focus-${w}`);
    const fit = await page.evaluate(() => {
      const foot = document.querySelector(".focus-footer")?.getBoundingClientRect();
      const tiles = [...document.querySelectorAll(".tile")].map((t) => t.getBoundingClientRect());
      return { n: tiles.length, last: Math.round(Math.max(...tiles.map((r) => r.bottom))), foot: Math.round(foot?.top ?? 0), scroll: document.documentElement.scrollHeight - innerHeight, size: Math.round(tiles[0]?.width ?? 0) };
    });
    pass(`Desktop ${w}×${h}: 7 tiles visible without scrolling`, fit.n === 7 && fit.last <= fit.foot && fit.scroll <= 4, JSON.stringify(fit));
    await ctx.close();
  }

  // ── H · Change a meal + balance suggestions (Telugu vegetarian, lunchtime)
  {
    const { ctx, page } = await newPage({}, seed);
    await page.goto(`${BASE}?at=12:50`);
    await wait(5200);
    const plate = page.locator(".plate-card");
    await plate.scrollIntoViewIfNeeded();
    await wait(400);
    await shot(page, "H01-plate");
    pass("Today's plate shows a protein total", /≈ \d+ g/.test(await page.locator(".protein-meter-num").innerText()));
    pass("Every meal on the plate shows its protein", (await page.locator(".plate-row .protein-chip").count()) >= 5);
    pass("The lunchtime Now card shows protein", (await page.locator(".now-card .protein-chip").count()) === 1);
    const before = await page.locator(".protein-meter-num").innerText();
    await page.getByRole("button", { name: /^Change lunch/ }).click();
    await wait(900);
    await shot(page, "H02-swap-sheet");
    const options = page.locator(".swap-option");
    pass("Change opens alternatives for lunch", (await options.count()) >= 4, `${await options.count()} shown`);
    const texts = (await options.allInnerTexts()).join(" ");
    pass("A vegetarian never sees meat, fish or eggs", !/\b(chicken|fish|egg|eggs|mutton|prawn|meen|kodi|kozhi|royyala)\b/i.test(texts));
    pass("Options show protein", (await page.locator(".swap-option .protein-chip").count()) >= 4);
    // Pick the lightest option on protein, so the plate needs balancing afterwards.
    const grams = await options.evaluateAll((els) => els.map((el) => Number(el.querySelector(".protein-chip")?.textContent?.match(/\d+/)?.[0] ?? 99)));
    const lightest = grams.indexOf(Math.min(...grams));
    const pickTitle = await options.nth(lightest).locator(".swap-option-title").innerText();
    await options.nth(lightest).click();
    await wait(900);
    await shot(page, "H03-swapped");
    const lunchRow = page.locator(".plate-row", { hasText: "Lunch" });
    pass("The swapped meal is on today's plate", (await lunchRow.innerText()).includes(pickTitle) && (await lunchRow.locator(".plate-badge").count()) === 1, pickTitle);
    const day = await page.evaluate(() => JSON.parse(localStorage.getItem("vidura.day")));
    pass("Today's swap is saved under vidura.day", !!day?.swaps?.lunch && typeof day.date === "string");
    console.log(`  protein ${before} → ${await page.locator(".protein-meter-num").innerText()}`);
    console.log(`  suggestions: ${(await page.locator(".balance-item").allInnerTexts()).map((t) => t.split("\n")[0]).join(" | ") || "none (plate balanced)"}`);
    pass("Plate fits 380px", (await overflow(page)) <= 0);
    await page.getByRole("button", { name: /^Change lunch/ }).click();
    await wait(800);
    await page.getByRole("button", { name: /Back to the plan/ }).click();
    await wait(800);
    pass("Back to the plan restores the planned lunch", (await page.locator(".plate-row", { hasText: "Lunch" }).locator(".plate-badge").count()) === 0);
    await ctx.close();
  }

  // ── H2 · A light day: balance suggestions, add and dismiss
  {
    const { ctx, page } = await newPage({}, seed);
    await page.addInitScript((key) => {
      localStorage.setItem(
        "vidura.day",
        JSON.stringify({
          version: 1,
          date: key,
          swaps: {
            lunch: { title: "Curd Rice", detail: "Thayir sadam with mustard and curry leaves", protein: 3 },
            dinner: { title: "Lauki Soup + Roti", detail: "Bottle gourd soup + 1 roti", protein: 4 },
          },
          extras: [],
          lighter: {},
          dismissed: [],
        }),
      );
    }, localKey(new Date()));
    await page.goto(`${BASE}?at=11:30`);
    await wait(5200);
    await page.locator(".plate-card").scrollIntoViewIfNeeded();
    await wait(400);
    const sugg = page.locator(".balance-item");
    const texts = await page.locator(".balance-item .balance-text strong").allInnerTexts();
    pass("A light day gets balance suggestions", (await sugg.count()) >= 1, texts.join(" | "));
    pass("…led by a protein add-on for the diet", /chana|sprouts|peanuts|dal|paneer|curd|milk|tofu/i.test(texts[0] ?? ""), texts[0]);
    await shot(page, "H05-light-day");
    await page.locator(".balance-item .btn-primary").first().click();
    await wait(700);
    pass("A suggestion can be added to today", (await page.locator(".plate-added").count()) >= 1);
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("vidura.day")));
    pass("The addition is saved for today", saved?.extras?.length >= 1);
    const firstTitle = await page.locator(".balance-item .balance-text strong").first().innerText();
    await page.locator(".balance-dismiss").first().click();
    await wait(700);
    const after = await page.locator(".balance-item .balance-text strong").allInnerTexts();
    const dismissed = await page.evaluate(() => JSON.parse(localStorage.getItem("vidura.day"))?.dismissed ?? []);
    pass("A suggestion can be dismissed for today", !after.includes(firstTitle) && dismissed.length === 1, `${firstTitle} → [${after.join(" | ")}]`);
    await shot(page, "H06-balanced");
    pass("Light day fits 380px", (await overflow(page)) <= 0);
    await ctx.close();
  }

  // ── I · Tips views + fertility guide (men, non-vegetarian)
  {
    const men = { ...PROFILE, categories: ["cholesterol", "fertility"], prefs: { region: "tamil", diet: "non-vegetarian", approach: "both", audience: "men" } };
    const { ctx, page } = await newPage({}, { fn: (p) => localStorage.setItem("vidura.profile", JSON.stringify(p)), arg: men });
    await page.goto(`${BASE}?at=10:00`);
    await wait(5200);
    await page.getByRole("button", { name: "Tips", exact: true }).click();
    await wait(900);
    await page.getByRole("tab", { name: "Tricks" }).click();
    await wait(700);
    await shot(page, "I01-tricks", true);
    const tricks = (await page.locator(".trick").allInnerTexts()).join(" ");
    pass("Tricks show for the chosen focus areas", (await page.locator(".trick").count()) >= 8);
    pass("Men's notes: men's tricks in, women's out", /Ashwagandha/.test(tricks) && !/Shatavari/.test(tricks));
    await page.getByRole("tab", { name: "Routines" }).click();
    await wait(700);
    await shot(page, "I02-routines", true);
    pass("Routines: daily ritual + one card per focus", (await page.locator(".routine-card").count()) === 3);
    await page.getByRole("tab", { name: "Foods" }).click();
    await wait(900);
    await page.locator(".food-guide").last().scrollIntoViewIfNeeded();
    await wait(1400);
    await shot(page, "I03-foods", true);
    pass("Foods: enjoy + go easy on, per focus", (await page.locator(".food-guide").count()) === 2 && (await page.locator(".food-col").count()) === 4);
    pass("Food art loads", (await page.locator(".food-guide .smart-img[data-loaded]").count()) >= 2);
    pass("Protein per serving on foods", (await page.locator(".food-guide .protein-chip").count()) >= 4);
    await page.locator(".guide-link").first().click();
    await wait(1200);
    await shot(page, "I04-guide");
    pass("Fertility guide opens for men", (await page.getByRole("radio", { name: /For men/ }).getAttribute("aria-checked")) === "true");
    const guide = await page.locator(".guide-screen").innerText();
    pass("Guide covers sperm health, timing, myths, supplements", /Sperm health/.test(guide) && /best time to try/i.test(guide) && /Myth/.test(guide) && /Over-the-counter supplements/.test(guide));
    pass("Supplements carry honest verdicts", /Avoid/.test(guide) && /Limited evidence/.test(guide) && /MOXI/.test(guide));
    pass("Boy-or-girl myth answered, PCPNDT noted", /choose a boy or a girl/i.test(guide) && /PCPNDT/.test(guide));
    const start = new Date(Date.now() - 9 * 864e5);
    await page.locator('.cycle-tool input[type="date"]').fill(localKey(start));
    await wait(900);
    await shot(page, "I05-cycle");
    pass("Cycle tool estimates the fertile window", (await page.locator(".cycle-ring").count()) === 1 && /Fertile window/.test(await page.locator(".cycle-dl").innerText()));
    await page.locator(".remember input").check();
    await wait(300);
    pass("Cycle dates saved only after opting in", !!(await page.evaluate(() => localStorage.getItem("vidura.cycle"))));
    await page.locator(".remember input").uncheck();
    await wait(300);
    pass("Switching it off forgets them", (await page.evaluate(() => localStorage.getItem("vidura.cycle"))) === null);
    await page.getByRole("radio", { name: /For women/ }).click();
    await wait(600);
    pass("Women's view: egg health + folic acid", /Egg health/.test(await page.locator(".guide-screen").innerText()) && /Folic acid/.test(await page.locator(".supp-list").innerText()));
    await shot(page, "I06-guide-women", true);
    pass("Guide fits 380px", (await overflow(page)) <= 0);
    await page.locator(".guide-back").first().click();
    await wait(800);
    pass("Back returns to Tips", (await page.locator(".tips-screen").count()) === 1);
    await ctx.close();
  }

  // ── J · Clear my data removes everything, including today's plate and cycle
  {
    const { ctx, page } = await newPage({}, seed);
    await page.goto(`${BASE}?at=16:10`);
    await wait(5000);
    await page.evaluate((key) => {
      localStorage.setItem("vidura.day", JSON.stringify({ version: 1, date: key, swaps: {}, extras: [], lighter: {}, dismissed: [] }));
      localStorage.setItem("vidura.cycle", JSON.stringify({ lastStart: key, cycleLength: 28, periodLength: 5 }));
    }, localKey(new Date()));
    await page.getByRole("button", { name: "Settings", exact: true }).click();
    await wait(800);
    await page.getByRole("button", { name: "Clear my data" }).click();
    await wait(400);
    await page.getByRole("button", { name: "Yes, clear it" }).click();
    await wait(1200);
    const left = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith("vidura.")));
    pass("Clear my data removes every vidura.* key", left.length === 0, left.join(","));
    await ctx.close();
  }

  // ── K · Desktop: fertility guide + Now with plate
  {
    const fert = { ...PROFILE, categories: ["fertility", "gut"], prefs: { region: "kerala", diet: "vegan", approach: "modern", audience: "women" } };
    const { ctx, page } = await newPage(
      { viewport: { width: 1280, height: 860 }, isMobile: false, hasTouch: false, deviceScaleFactor: 1 },
      { fn: (p) => localStorage.setItem("vidura.profile", JSON.stringify(p)), arg: fert },
    );
    await page.goto(`${BASE}?at=19:00`);
    await wait(5600);
    await shot(page, "K01-desktop-now", true);
    await page.locator(".guide-link").first().click();
    await wait(1600);
    await shot(page, "K02-desktop-guide", true);
    pass("Desktop guide fits", (await overflow(page)) <= 0);
    await ctx.close();
  }
  // ── M · Blood pressure focus
  {
    const bp = { ...PROFILE, categories: ["bp"], prefs: { region: "north-indian", diet: "vegetarian", approach: "both", audience: "women" } };
    const { ctx, page } = await newPage({}, { fn: (p) => localStorage.setItem("vidura.profile", JSON.stringify(p)), arg: bp });
    await page.goto(`${BASE}?at=07:40`);
    await wait(5200);
    const nowTexts = [await page.locator("#now-title").innerText(), ...(await page.locator(".also-title").allInnerTexts())].join(" | ");
    pass("BP focus: the home BP check is offered in the morning", /Check your blood pressure/.test(nowTexts), nowTexts);
    await page.getByRole("button", { name: "Tips", exact: true }).click();
    await wait(900);
    await page.getByRole("button", { name: /Blood Pressure/ }).first().click();
    await wait(700);
    pass("BP tips in the deck", /Blood Pressure/.test(await page.locator(".tip-top .tip-cat").innerText()), await page.locator(".tip-top .tip-title").innerText());
    await page.getByRole("button", { name: "All", exact: true }).click();
    await wait(400);
    await page.getByRole("tab", { name: "Tricks" }).click();
    await wait(600);
    const tricks = (await page.locator(".trick-title").allInnerTexts()).join(" | ");
    pass("BP tricks for the approach", /Hibiscus tea/.test(tricks) && /Tender coconut water/.test(tricks), tricks);
    await page.getByRole("tab", { name: "Routines" }).click();
    await wait(600);
    pass("BP routine: morning readings + wall sits", /blood-pressure readings/.test(await page.locator(".routine-card").last().innerText()) && /Wall sits/.test(await page.locator(".routine-card").last().innerText()));
    await page.getByRole("tab", { name: "Foods" }).click();
    await wait(900);
    const foods = await page.locator(".food-guide").innerText();
    pass("BP foods: enjoy potassium-rich plants, go easy on salt", /Leafy greens/.test(foods) && /Pickles and papad/.test(foods) && /Rock salt/.test(foods));
    await shot(page, "M01-bp-foods", true);
    await page.getByRole("button", { name: "Now", exact: true }).click();
    await wait(900);
    await page.getByRole("button", { name: /^Change dinner/ }).click();
    await wait(900);
    const firstFits = await page.locator(".swap-option").first().innerText();
    pass("Swap options rank BP-friendly dishes first", /BP/.test(firstFits), firstFits.split("\n")[0]);
    await page.keyboard.press("Escape");
    pass("BP screens fit 380px", (await overflow(page)) <= 0);
    await ctx.close();
  }

  // ── L · Extras: book summaries for everyone
  {
    const { ctx, page } = await newPage({}, seed);
    await page.goto(`${BASE}?at=20:30`);
    await wait(5000);
    await page.getByRole("button", { name: "Extras", exact: true }).click();
    await wait(1000);
    await shot(page, "L01-extras", true);
    pass("Extras lists all nine books", (await page.locator(".book-card").count()) === 9);
    pass("Extras fits 380px", (await overflow(page)) <= 0);
    await page.locator(".book-card", { hasText: "Ikigai" }).click();
    await wait(900);
    await shot(page, "L02-book-japanese");
    pass("The Japanese ideas entry covers all four", (await page.locator(".book-part").count()) === 4);
    pass("Each summary has key ideas and something to try", (await page.locator(".book-ideas li").count()) >= 3 && (await page.locator(".book-try li").count()) >= 2);
    await page.keyboard.press("Escape");
    await wait(700);
    await page.getByRole("button", { name: "Relationships", exact: true }).click();
    await wait(600);
    pass("Theme filter narrows the list", (await page.locator(".book-card").count()) === 1);
    await page.locator(".book-card").first().click();
    await wait(900);
    pass("Love Languages carries its evidence note", /proven science/.test(await page.locator(".book-note").innerText()));
    await page.keyboard.press("Escape");
    await ctx.close();
  }
} finally {
  await browser.close();
  await new Promise((r) => server.httpServer.close(r));
}

pass("No runtime errors in the console", errors.length === 0, errors.slice(0, 5).join(" | "));
fs.writeFileSync(path.join(root, "qa", "report.json"), JSON.stringify({ at: new Date().toISOString(), results, errors }, null, 2));
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed. Screenshots: qa/screens`);
process.exit(failed ? 1 : 0);

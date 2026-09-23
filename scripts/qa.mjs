#!/usr/bin/env node
/**
 * Automated QA pass in a real browser (installed Edge or Chrome via playwright-core).
 * Builds nothing: run `npm run build` first. Screenshots → qa/screens, report → qa/report.json.
 *
 *   node scripts/qa.mjs            # all scenarios
 *   QA_BROWSER="C:\\path\\to\\chrome.exe" node scripts/qa.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { preview } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SHOTS = path.join(root, "qa", "screens");
fs.mkdirSync(SHOTS, { recursive: true });

const CANDIDATES = [
  process.env.QA_BROWSER,
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
].filter(Boolean);
const executablePath = CANDIDATES.find((p) => fs.existsSync(p));
if (!executablePath) throw new Error("No Chromium-based browser found; set QA_BROWSER.");

const server = await preview({ root, preview: { port: 4179, strictPort: true, open: false }, logLevel: "silent" });
const BASE = "http://localhost:4179/";
const browser = await chromium.launch({ executablePath, headless: true });

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
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("vidura.profile")));
    pass(
      "Profile stored under vidura.profile with the expected shape",
      stored.name === "Priya" && stored.email === "priya@example.com" && Array.isArray(stored.categories) && stored.version === 1 && !!stored.createdAt && !!stored.updatedAt,
    );

    await wait(3600);
    await shot(page, "A07-focus");
    pass("Focus screen shows 6 category tiles", (await page.locator(".tile").count()) === 6);
    pass("Focus screen fits 380px (no horizontal scroll)", (await overflow(page)) <= 0);

    await page.getByRole("button", { name: "Continue" }).click();
    await wait(400);
    pass("Continuing with no focus shows a hint", (await page.locator("#focus-hint").innerText()).includes("at least one"));

    await page.locator(".tile", { hasText: "Cholesterol" }).click();
    await page.locator(".tile", { hasText: "Blood Sugar" }).click();
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
    pass("Settings sheet has the privacy note", (await page.locator(".privacy-note").innerText()).includes("stay on this device"));
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
    await page.locator(".tile", { hasText: "Gut Health" }).click();
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
} finally {
  await browser.close();
  await new Promise((r) => server.httpServer.close(r));
}

pass("No runtime errors in the console", errors.length === 0, errors.slice(0, 5).join(" | "));
fs.writeFileSync(path.join(root, "qa", "report.json"), JSON.stringify({ at: new Date().toISOString(), results, errors }, null, 2));
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed. Screenshots: qa/screens`);
process.exit(failed ? 1 : 0);

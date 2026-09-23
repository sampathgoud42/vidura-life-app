#!/usr/bin/env node
/**
 * Installs the QA browser (Chrome headless shell) INSIDE this project, under
 * node_modules/playwright-core/.local-browsers, so QA never depends on anything
 * outside the project folder.
 *
 *   npm run qa:setup
 */
import { spawnSync } from "node:child_process";

const r = spawnSync("npx", ["playwright-core", "install", "--only-shell", "chromium"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: "0" },
});
process.exit(r.status ?? 1);

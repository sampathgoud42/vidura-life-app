import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type Plugin } from "vite";
import { DEFAULT_ORIGINS, createWellnessHandler, resolveDbFile } from "./server/wellness-db.mjs";
import { PHASES } from "./src/data/content";
import { THEMES, themeCss } from "./src/lib/palette";

/**
 * Inlines the phase palettes (generated from src/lib/palette.ts) and the
 * phase boundaries into index.html, so the correct sky and colour tokens are
 * there on first paint — no flash, one source of truth.
 */
function phaseTokens(): Plugin {
  return {
    name: "vidura-phase-tokens",
    transformIndexHtml(html) {
      const phases = JSON.stringify(PHASES.map((p) => [p.id, p.start, p.end, p.theme === "dark" ? "dark" : "light"]));
      const bases = JSON.stringify(Object.fromEntries(Object.entries(THEMES).map(([id, t]) => [id, t.base])));
      return html
        .replace("<!--phase-tokens-->", `<style id="phase-tokens">${themeCss()}</style>`)
        .replace("/*__PHASE_BOOT__*/", `var PHASES = ${phases}; var BASES = ${bases};`);
    },
  };
}

/**
 * Mounts the wellness contact API (server/wellness-db.mjs) on the dev and
 * preview servers, so the email a person enters is saved to the SQLite
 * wellness database while running locally. The hosted build calls a separate
 * server instead (VITE_WELLNESS_API), and simply skips it when none is set.
 */
function wellnessApi(env: Record<string, string>): Plugin {
  const handler = createWellnessHandler({ dbFile: resolveDbFile(process.cwd(), env), allowedOrigins: DEFAULT_ORIGINS });
  return {
    name: "vidura-wellness-api",
    configureServer: (server) => void server.middlewares.use("/api/wellness", handler),
    configurePreviewServer: (server) => void server.middlewares.use("/api/wellness", handler),
  };
}

export default defineConfig(({ mode }) => ({
  base: "./",
  plugins: [react(), tailwindcss(), phaseTokens(), wellnessApi({ ...loadEnv(mode, process.cwd(), ""), ...process.env } as Record<string, string>)],
  build: {
    assetsDir: "static",
    target: "es2020",
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // Long-lived vendor chunks: app updates don't invalidate React / Motion caches.
        manualChunks: { react: ["react", "react-dom"], motion: ["framer-motion"] },
      },
    },
  },
  server: { host: true },
  preview: { host: true },
}));

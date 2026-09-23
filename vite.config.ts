import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
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

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss(), phaseTokens()],
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
});

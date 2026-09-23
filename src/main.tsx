import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { LightBurstProvider } from "./components/LightBurst";
import { ToastProvider } from "./components/Toast";
import "./index.css";
import { initClockOverride } from "./lib/time";
import { AppProvider } from "./state/AppState";

initClockOverride(window.location.search);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProvider>
      <ToastProvider>
        <LightBurstProvider>
          <App />
        </LightBurstProvider>
      </ToastProvider>
    </AppProvider>
  </StrictMode>,
);

// Installable, offline-capable PWA (production builds only).
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      /* e.g. sandboxed previews — the app works without it */
    });
  });
}

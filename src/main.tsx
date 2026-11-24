import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { LightBurstProvider } from "./components/LightBurst";
import { ToastProvider } from "./components/Toast";
import "./index.css";
import { readLinkFromUrl } from "./lib/emailLink";
import { initNative, isNative } from "./lib/native";
import { initClockOverride } from "./lib/time";
import { AppProvider } from "./state/AppState";

initClockOverride(window.location.search);
initNative(readLinkFromUrl);

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

// Installable, offline-capable PWA (production web builds only; the iOS app bundles its files).
if (import.meta.env.PROD && !isNative && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      /* e.g. sandboxed previews — the app works without it */
    });
  });
}

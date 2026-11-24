import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Native iOS shell (Capacitor). The web build in dist/ is bundled into the app,
 * so it works offline; the native layer adds reminders, haptics and keep-awake.
 *
 * appId must match the App ID registered in the Apple Developer account and the
 * bundle ID in App Store Connect (see docs/IOS.md).
 */
const config: CapacitorConfig = {
  appId: "com.viduralife.app",
  appName: "Vidura Life",
  webDir: "dist",
  ios: {
    contentInset: "never",
    // The app draws its own backgrounds edge to edge.
    backgroundColor: "#f6efe4",
    limitsNavigationsToAppBoundDomains: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 600,
      launchAutoHide: true,
      backgroundColor: "#f6efe4",
      showSpinner: false,
    },
    LocalNotifications: {
      iconColor: "#8a4a0f",
    },
  },
};

export default config;

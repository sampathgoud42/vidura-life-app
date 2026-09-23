import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState } from "react";
import { BreathingOrb } from "../components/BreathingOrb";
import { useLightBurst } from "../components/LightBurst";
import { StreakRing } from "../components/Rings";
import { Settings } from "../components/Icons";
import { TabBar, type TabId } from "../components/TabBar";
import { useToast } from "../components/Toast";
import { withViewTransition } from "../lib/device";
import { currentStreak, lastSevenDays } from "../lib/insights";
import type { Resolved } from "../lib/plan";
import { formatMinutes } from "../lib/time";
import { useApp } from "../state/AppState";
import { ExtrasScreen } from "./ExtrasScreen";
import { FertilityGuide } from "./FertilityGuide";
import { GuidedMode } from "./GuidedMode";
import { InsightsScreen } from "./InsightsScreen";
import { NowScreen } from "./NowScreen";
import { SettingsSheet } from "./SettingsSheet";
import { TipsScreen } from "./TipsScreen";

export function MainShell() {
  const { profile, now, log, previewMinutes, setPreviewMinutes, complete, undo } = useApp();
  const [tab, setTab] = useState<TabId>("now");
  const [settings, setSettings] = useState(false);
  const [guided, setGuided] = useState<Resolved | null>(null);
  const [guide, setGuide] = useState(false);
  const burst = useLightBurst();
  const toast = useToast();
  const days = lastSevenDays(log, now);
  const streak = currentStreak(log, now);

  const closeSettings = useCallback(() => setSettings(false), []);
  const closeGuided = useCallback(() => setGuided(null), []);

  const openGuide = (open: boolean) => {
    withViewTransition(() => setGuide(open));
    window.scrollTo({ top: 0 });
  };

  const changeTab = (t: TabId) => {
    withViewTransition(() => {
      setTab(t);
      setGuide(false);
      setPreviewMinutes(null);
    });
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      <main id="app-main" className="screen main-screen">
        <header className="topbar">
          <BreathingOrb layoutId="orb" size={44} />
          <div className="topbar-right">
            <button type="button" className="streak-btn" onClick={() => changeTab("insights")} aria-label={`${streak}-day streak. Open insights.`}>
              <StreakRing days={days} streak={streak} size={46} stroke={4} />
            </button>
            <button type="button" className="icon-btn glass" onClick={() => setSettings(true)} aria-label="Settings" aria-haspopup="dialog">
              <Settings />
            </button>
          </div>
        </header>

        <div className="tab-view">
          {guide ? (
            <FertilityGuide onBack={() => openGuide(false)} />
          ) : (
            <>
              {tab === "now" && <NowScreen onStart={setGuided} onOpenGuide={() => openGuide(true)} />}
              {tab === "tips" && <TipsScreen onOpenGuide={() => openGuide(true)} />}
              {tab === "insights" && <InsightsScreen />}
              {tab === "extras" && <ExtrasScreen />}
            </>
          )}
        </div>
      </main>

      <TabBar tab={tab} onChange={changeTab} />

      <AnimatePresence>
        {previewMinutes !== null && (
          <motion.button
            type="button"
            className="preview-pill glass-strong"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            onClick={() => setPreviewMinutes(null)}
          >
            Previewing {formatMinutes(previewMinutes)} · <strong>Back to now</strong>
          </motion.button>
        )}
      </AnimatePresence>

      <SettingsSheet open={settings} onClose={closeSettings} />

      <AnimatePresence>
        {guided && (
          <GuidedMode
            key={guided.activity.id}
            item={guided}
            onClose={closeGuided}
            onComplete={(origin) => {
              const g = guided;
              const entry = complete(g.activity.id, g.activity.categories.length ? g.matched : profile?.categories ?? [], g.phase);
              setGuided(null);
              if (origin) window.setTimeout(() => burst({ ...origin, mode: "rise" }), 60);
              toast(`Logged "${g.headline}". Beautifully done.`, { label: "Undo", onClick: () => undo(entry.id) });
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

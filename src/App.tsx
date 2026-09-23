import { AnimatePresence, LayoutGroup, MotionConfig, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { LivingBackground } from "./components/LivingBackground";
import { greetingFor } from "./lib/time";
import { useApp } from "./state/AppState";
import { FocusScreen } from "./screens/FocusScreen";
import { KitchenScreen } from "./screens/KitchenScreen";
import { MainShell } from "./screens/MainShell";
import { Onboarding, WelcomeReveal } from "./screens/Onboarding";

type Stage = "onboarding" | "welcomeBack" | "focus" | "kitchen" | "main";

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0, transition: { duration: 0.35 } },
};

export default function App() {
  const { profile, nowMinutes } = useApp();
  const [stage, setStage] = useState<Stage>(() => (profile ? "welcomeBack" : "onboarding"));

  // "Clear my data" (or another tab clearing it) sends you back to the start.
  useEffect(() => {
    if (!profile && stage !== "onboarding") setStage("onboarding");
  }, [profile, stage]);

  return (
    <MotionConfig reducedMotion="user">
      <LivingBackground />
      <LayoutGroup>
        <AnimatePresence mode="popLayout" initial={false}>
          {stage === "onboarding" && (
            <motion.div key="onboarding" className="stage" {...fade}>
              <Onboarding onDone={() => setStage("focus")} />
            </motion.div>
          )}
          {stage === "welcomeBack" && profile && (
            <motion.div key="welcomeBack" className="stage" {...fade}>
              <main id="app-main" className="screen onboarding">
                <WelcomeReveal returning name={profile.name} greeting={greetingFor(nowMinutes)} onDone={() => setStage(profile.categories.length ? "main" : "focus")} />
              </main>
            </motion.div>
          )}
          {stage === "focus" && (
            <motion.div key="focus" className="stage" {...fade}>
              <FocusScreen onDone={() => setStage(profile?.prefs ? "main" : "kitchen")} />
            </motion.div>
          )}
          {stage === "kitchen" && (
            <motion.div key="kitchen" className="stage" {...fade}>
              <KitchenScreen onDone={() => setStage("main")} />
            </motion.div>
          )}
          {stage === "main" && (
            <motion.div key="main" className="stage" {...fade}>
              <MainShell />
            </motion.div>
          )}
        </AnimatePresence>
      </LayoutGroup>
    </MotionConfig>
  );
}

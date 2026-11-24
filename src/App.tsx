import { AnimatePresence, LayoutGroup, MotionConfig, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { LivingBackground } from "./components/LivingBackground";
import { useToast } from "./components/Toast";
import { cancelDeleteRequest, deleteAccount, deleteRequested } from "./lib/account";
import { EMAIL_LINK_ENABLED, readLinkFromUrl } from "./lib/emailLink";
import type { Profile } from "./lib/storage";
import { greetingFor } from "./lib/time";
import { useApp } from "./state/AppState";
import { FocusScreen } from "./screens/FocusScreen";
import { KitchenScreen } from "./screens/KitchenScreen";
import { MainShell } from "./screens/MainShell";
import { Onboarding, VerifyLink, WelcomeReveal } from "./screens/Onboarding";

/**
 * onboarding  new person (or a confirmed email from another device that still needs a name)
 * reverify    an existing profile whose email hasn't been confirmed yet; keeps all saved data
 * verifyLink  opened from the emailed sign-in link
 * welcomeNew  first welcome after a link-confirmed sign-up
 */
type Stage = "onboarding" | "reverify" | "verifyLink" | "welcomeNew" | "welcomeBack" | "focus" | "kitchen" | "main";

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0, transition: { duration: 0.35 } },
};

const needsEmailCheck = (p: Profile | null) => EMAIL_LINK_ENABLED && !!p && !p.emailVerified;

export default function App() {
  const { profile, nowMinutes, createProfile, updateProfile, clearData } = useApp();
  const toast = useToast();
  const [linkCode] = useState(readLinkFromUrl);
  const [verifiedEmail, setVerifiedEmail] = useState<string | undefined>();
  const [stage, setStage] = useState<Stage>(() =>
    linkCode ? "verifyLink" : !profile ? "onboarding" : needsEmailCheck(profile) ? "reverify" : "welcomeBack",
  );

  // "Clear my data" (or another tab clearing it) sends you back to the start.
  useEffect(() => {
    if (!profile && stage !== "onboarding" && stage !== "verifyLink") setStage("onboarding");
  }, [profile, stage]);

  const afterWelcome = () => setStage(profile?.categories.length ? "main" : "focus");

  return (
    <MotionConfig reducedMotion="user">
      <LivingBackground />
      <LayoutGroup>
        <AnimatePresence mode="popLayout" initial={false}>
          {stage === "onboarding" && (
            <motion.div key="onboarding" className="stage" {...fade}>
              <Onboarding verifiedEmail={verifiedEmail} onDone={() => setStage("focus")} />
            </motion.div>
          )}
          {stage === "reverify" && profile && (
            <motion.div key="reverify" className="stage" {...fade}>
              <Onboarding returning initialName={profile.name} initialEmail={profile.email} onDone={() => setStage("welcomeBack")} />
            </motion.div>
          )}
          {stage === "verifyLink" && linkCode && (
            <motion.div key="verifyLink" className="stage" {...fade}>
              <VerifyLink
                code={linkCode}
                onRestart={() => setStage(profile ? "reverify" : "onboarding")}
                onVerified={async ({ email, name }) => {
                  if (deleteRequested()) {
                    // The confirmation link for "Delete my account": finish the deletion now.
                    cancelDeleteRequest();
                    const r = await deleteAccount();
                    clearData();
                    toast(r === "deleted" ? "Your account has been deleted" : "Couldn't finish deleting. Please try again from Settings.");
                    setStage("onboarding");
                    return;
                  }
                  if (profile) {
                    updateProfile({ email, emailVerified: true, ...(name ? { name } : {}) });
                    setStage("welcomeBack");
                  } else if (name) {
                    createProfile(name, email, true);
                    setStage("welcomeNew");
                  } else {
                    // Confirmed on a device that has never seen this person: just ask their name.
                    setVerifiedEmail(email);
                    setStage("onboarding");
                  }
                }}
              />
            </motion.div>
          )}
          {stage === "welcomeNew" && profile && (
            <motion.div key="welcomeNew" className="stage" {...fade}>
              <main id="app-main" className="screen onboarding">
                <WelcomeReveal name={profile.name} onDone={() => setStage("focus")} />
              </main>
            </motion.div>
          )}
          {stage === "welcomeBack" && profile && (
            <motion.div key="welcomeBack" className="stage" {...fade}>
              <main id="app-main" className="screen onboarding">
                <WelcomeReveal returning name={profile.name} greeting={greetingFor(nowMinutes)} onDone={afterWelcome} />
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

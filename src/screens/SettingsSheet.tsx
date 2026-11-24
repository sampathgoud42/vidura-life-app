import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BottomSheet } from "../components/BottomSheet";
import { Chip, MagneticButton } from "../components/Controls";
import { Lock } from "../components/Icons";
import { useToast } from "../components/Toast";
import { APP, CATEGORIES, DEFAULT_PREFS, PHASES, type CategoryId } from "../data/content";
import { deleteAccount, requestDeleteByEmail } from "../lib/account";
import { isNative, remindersOn, setReminders, type ReminderSlot } from "../lib/native";
import { saveContact } from "../lib/remote";
import type { Prefs } from "../lib/storage";
import { EMAIL_HINTS, NAME_HINTS, validateEmail, validateName } from "../lib/validation";
import { useApp } from "../state/AppState";
import { PrefsFields } from "./KitchenScreen";

export const PRIVACY_URL = "https://vidura-life-app.web.app/privacy.html";

/** One gentle reminder a few minutes into each part of the day. */
const REMINDER_SLOTS: ReminderSlot[] = PHASES.map((p) => ({
  at: p.start + 5,
  title: `${p.label} · Vidura Life`,
  body: `${p.mood} Your next small step is ready.`,
}));

type DeleteStep = "idle" | "confirm" | "working" | "emailed" | "failed";

export function SettingsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { profile, updateProfile, clearData, storageOk } = useApp();
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nameHint, setNameHint] = useState("");
  const [emailHint, setEmailHint] = useState("");
  const [catHint, setCatHint] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [deleteStep, setDeleteStep] = useState<DeleteStep>("idle");
  const [reminders, setRemindersState] = useState(remindersOn);

  useEffect(() => {
    if (!open || !profile) return;
    setName(profile.name);
    setEmail(profile.email);
    setNameHint("");
    setEmailHint("");
    setCatHint("");
    setConfirming(false);
    setDeleteStep("idle");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Live email validation, debounced 300 ms, saved as soon as it's valid.
  useEffect(() => {
    if (!open || !profile) return;
    const t = window.setTimeout(() => {
      const r = validateEmail(email);
      if (!r.ok) {
        setEmailHint(email.trim() ? EMAIL_HINTS.format : EMAIL_HINTS.empty);
        return;
      }
      setEmailHint("");
      if (r.value !== profile.email) {
        updateProfile({ email: r.value });
        void saveContact({ name: profile.name, email: r.value, previousEmail: profile.email });
        toast("Email updated");
      }
    }, 300);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, open]);

  if (!profile) return null;

  const commitName = () => {
    const r = validateName(name);
    if (!r.ok) {
      setNameHint(NAME_HINTS[r.reason]);
      return;
    }
    setNameHint("");
    setName(r.value);
    if (r.value !== profile.name) {
      updateProfile({ name: r.value });
      void saveContact({ name: r.value, email: profile.email });
      toast("Name updated");
    }
  };

  const toggleCat = (id: CategoryId) => {
    const has = profile.categories.includes(id);
    if (has && profile.categories.length === 1) {
      setCatHint("Keep at least one focus.");
      return;
    }
    setCatHint("");
    const next = has ? profile.categories.filter((c) => c !== id) : [...profile.categories, id];
    updateProfile({ categories: CATEGORIES.map((c) => c.id).filter((c) => next.includes(c)) });
  };

  const prefs: Prefs = profile.prefs ?? { ...DEFAULT_PREFS };

  return (
    <BottomSheet open={open} onClose={onClose} title="Settings">
      <section className="settings-section" aria-labelledby="s-you">
        <h3 id="s-you" className="section-title">
          About you
        </h3>
        <label className="field-label" htmlFor="s-name">
          Name
        </label>
        <input
          id="s-name"
          className="text-input"
          value={name}
          data-autofocus
          autoComplete="given-name"
          onChange={(e) => {
            setName(e.target.value);
            if (nameHint) setNameHint("");
          }}
          onBlur={commitName}
          onKeyDown={(e) => e.key === "Enter" && commitName()}
          aria-invalid={!!nameHint}
          aria-describedby="s-name-hint"
        />
        <p id="s-name-hint" className="field-hint" role="status" aria-live="polite">
          {nameHint}
        </p>
        <label className="field-label" htmlFor="s-email">
          Email
        </label>
        <input
          id="s-email"
          className="text-input"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!emailHint}
          aria-describedby="s-email-hint"
        />
        <p id="s-email-hint" className="field-hint" role="status" aria-live="polite">
          {emailHint}
        </p>
      </section>

      <section className="settings-section" aria-labelledby="s-focus">
        <h3 id="s-focus" className="section-title">
          Focus
        </h3>
        <div className="chip-wrap" role="group" aria-labelledby="s-focus">
          {CATEGORIES.map((c) => (
            <Chip key={c.id} selected={profile.categories.includes(c.id)} onClick={() => toggleCat(c.id)}>
              <span aria-hidden="true">{c.emoji}</span> {c.label}
            </Chip>
          ))}
        </div>
        <p className="field-hint" role="status" aria-live="polite">
          {catHint}
        </p>
      </section>

      <section className="settings-section" aria-labelledby="s-kitchen">
        <h3 id="s-kitchen" className="section-title">
          Kitchen &amp; approach
        </h3>
        <PrefsFields prefs={prefs} onChange={(p) => updateProfile({ prefs: p })} compact />
      </section>

      {isNative && (
        <section className="settings-section" aria-labelledby="s-reminders">
          <h3 id="s-reminders" className="section-title">
            Reminders
          </h3>
          <p className="privacy-note reminder-note">A gentle nudge at the start of each part of the day: dawn, morning, midday, afternoon, evening and night.</p>
          <MagneticButton
            variant={reminders ? "soft" : "ghost"}
            aria-pressed={reminders}
            onClick={async () => {
              const on = await setReminders(!reminders, REMINDER_SLOTS);
              setRemindersState(on);
              toast(on ? "Daily reminders on" : !reminders ? "Allow notifications for Vidura Life in iPhone Settings" : "Daily reminders off");
            }}
          >
            {reminders ? "Daily reminders: on" : "Turn on daily reminders"}
          </MagneticButton>
        </section>
      )}

      <section className="settings-section" aria-labelledby="s-data">
        <h3 id="s-data" className="section-title">
          Your data
        </h3>
        <p className="privacy-note">
          <Lock size={16} /> {APP.privacyNote} Focus areas, meals, history and cycle details are never sent anywhere.
        </p>
        {!storageOk && <p className="storage-note">This browser is blocking storage, so changes last until you close this tab.</p>}
        <AnimatePresence mode="wait" initial={false}>
          {confirming ? (
            <motion.div key="confirm" className="confirm-row" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <p>This removes your profile and history from this device.</p>
              <div className="confirm-actions">
                <MagneticButton variant="soft" onClick={() => setConfirming(false)}>
                  Keep my data
                </MagneticButton>
                <MagneticButton
                  variant="danger"
                  onClick={() => {
                    onClose();
                    clearData();
                  }}
                >
                  Yes, clear it
                </MagneticButton>
              </div>
            </motion.div>
          ) : (
            <motion.div key="ask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <MagneticButton variant="ghost" className="clear-btn" onClick={() => setConfirming(true)}>
                Clear my data
              </MagneticButton>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="delete-account" aria-live="polite">
          {deleteStep === "idle" && (
            <MagneticButton variant="ghost" className="clear-btn delete-btn" onClick={() => setDeleteStep("confirm")}>
              Delete my account
            </MagneticButton>
          )}
          {(deleteStep === "confirm" || deleteStep === "working") && (
            <div className="confirm-row">
              <p>
                This permanently deletes your Vidura Life account: your email sign-in, the name and email saved for you, and everything on this device. It can't
                be undone.
              </p>
              <div className="confirm-actions">
                <MagneticButton variant="soft" onClick={() => setDeleteStep("idle")} disabled={deleteStep === "working"}>
                  Keep my account
                </MagneticButton>
                <MagneticButton
                  variant="danger"
                  disabled={deleteStep === "working"}
                  onClick={async () => {
                    setDeleteStep("working");
                    const r = await deleteAccount();
                    if (r === "deleted") {
                      onClose();
                      clearData();
                      toast("Your account has been deleted");
                    } else if (r === "needs-email") {
                      setDeleteStep((await requestDeleteByEmail(profile.name, profile.email)) ? "emailed" : "failed");
                    } else setDeleteStep("failed");
                  }}
                >
                  {deleteStep === "working" ? "Deleting…" : "Delete my account"}
                </MagneticButton>
              </div>
            </div>
          )}
          {deleteStep === "emailed" && (
            <p className="confirm-row">
              To make sure it's you, I've emailed a link to {profile.email}. Open it on this device and your account will be deleted straight away.
            </p>
          )}
          {deleteStep === "failed" && (
            <p className="confirm-row">
              I couldn't reach the server, so nothing was deleted. Check your connection and try again.{" "}
              <button type="button" className="link-btn" onClick={() => setDeleteStep("confirm")}>
                Try again
              </button>
            </p>
          )}
        </div>
        <p className="privacy-note policy-link">
          <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer">
            Privacy policy
          </a>
        </p>
      </section>
    </BottomSheet>
  );
}

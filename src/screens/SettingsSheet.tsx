import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BottomSheet } from "../components/BottomSheet";
import { Chip, MagneticButton } from "../components/Controls";
import { Lock } from "../components/Icons";
import { useToast } from "../components/Toast";
import { APP, CATEGORIES, DEFAULT_PREFS, type CategoryId } from "../data/content";
import type { Prefs } from "../lib/storage";
import { EMAIL_HINTS, NAME_HINTS, validateEmail, validateName } from "../lib/validation";
import { useApp } from "../state/AppState";
import { PrefsFields } from "./KitchenScreen";

export function SettingsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { profile, updateProfile, clearData, storageOk } = useApp();
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nameHint, setNameHint] = useState("");
  const [emailHint, setEmailHint] = useState("");
  const [catHint, setCatHint] = useState("");
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!open || !profile) return;
    setName(profile.name);
    setEmail(profile.email);
    setNameHint("");
    setEmailHint("");
    setCatHint("");
    setConfirming(false);
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

      <section className="settings-section" aria-labelledby="s-data">
        <h3 id="s-data" className="section-title">
          Your data
        </h3>
        <p className="privacy-note">
          <Lock size={16} /> {APP.privacyNote} Nothing is sent anywhere.
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
      </section>
    </BottomSheet>
  );
}

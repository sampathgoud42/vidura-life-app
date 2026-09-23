import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { BreathingOrb } from "../components/BreathingOrb";
import { ChoiceGroup, GlassCard, MagneticButton } from "../components/Controls";
import { ArrowRight } from "../components/Icons";
import { Display } from "../components/Typography";
import { APPROACHES, AUDIENCES, DEFAULT_PREFS, DIETS, REGIONS, WEEKDAYS } from "../data/content";
import { dayPlan } from "../lib/plan";
import type { Prefs } from "../lib/storage";
import { weekdayIndex } from "../lib/time";
import { useApp } from "../state/AppState";

export function PrefsFields({ prefs, onChange, compact = false }: { prefs: Prefs; onChange: (p: Prefs) => void; compact?: boolean }) {
  return (
    <div className="prefs-fields">
      <div className="field">
        <p className="field-label" aria-hidden="true">
          Your kitchen
        </p>
        <ChoiceGroup label="Your kitchen" options={REGIONS} value={prefs.region} onChange={(region) => onChange({ ...prefs, region })} compact={compact} className="cols-2" />
      </div>
      <div className="field">
        <p className="field-label" aria-hidden="true">
          Your plate
        </p>
        <ChoiceGroup label="Your plate" options={DIETS} value={prefs.diet} onChange={(diet) => onChange({ ...prefs, diet })} compact={compact} />
      </div>
      <div className="field">
        <p className="field-label" aria-hidden="true">
          Your approach
        </p>
        <ChoiceGroup label="Your approach" options={APPROACHES} value={prefs.approach} onChange={(approach) => onChange({ ...prefs, approach })} compact={compact} />
      </div>
      <div className="field">
        <p className="field-label" aria-hidden="true">
          Health notes
        </p>
        <ChoiceGroup label="Health notes" options={AUDIENCES} value={prefs.audience} onChange={(audience) => onChange({ ...prefs, audience })} compact={compact} />
      </div>
    </div>
  );
}

export function KitchenScreen({ onDone }: { onDone: () => void }) {
  const { profile, updateProfile, now } = useApp();
  const [prefs, setPrefs] = useState<Prefs>(profile?.prefs ?? { ...DEFAULT_PREFS });
  const weekday = weekdayIndex(now);
  const today = useMemo(() => dayPlan(prefs, weekday), [prefs, weekday]);

  return (
    <main className="screen kitchen" id="app-main">
      <header className="screen-head">
        <div className="head-row">
          <BreathingOrb layoutId="orb" size={52} />
          <p className="eyebrow">Optional</p>
        </div>
        <Display as="h1" className="t-title">
          Make it yours
        </Display>
        <p className="lede">So your meal ideas match your kitchen. You can change this any time in Settings.</p>
      </header>

      <div className="kitchen-grid">
        <PrefsFields prefs={prefs} onChange={setPrefs} />

        <GlassCard className="plate-preview" aria-live="polite">
          <p className="eyebrow">
            {WEEKDAYS[weekday]} · {today.theme} {today.emoji}
          </p>
          <motion.ul key={`${prefs.region}-${prefs.diet}`} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <li>
              <span>Breakfast</span> {today.breakfast.title}
            </li>
            <li>
              <span>Lunch</span> {today.lunch.title}
            </li>
            <li>
              <span>Dinner</span> {today.dinner.title}
            </li>
          </motion.ul>
        </GlassCard>
      </div>

      <footer className="kitchen-footer">
        <button type="button" className="link-btn" onClick={onDone}>
          Skip for now
        </button>
        <MagneticButton
          variant="primary"
          size="lg"
          onClick={() => {
            updateProfile({ prefs });
            onDone();
          }}
        >
          Looks good <ArrowRight size={18} />
        </MagneticButton>
      </footer>
    </main>
  );
}

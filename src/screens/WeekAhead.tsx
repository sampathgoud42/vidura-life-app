import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useId, useMemo, useState } from "react";
import { Segmented } from "../components/Controls";
import { MEAL_SLOTS } from "../data/content";
import { PROTEIN_TARGET } from "../lib/balance";
import { dayPlan } from "../lib/plan";
import type { Prefs } from "../lib/storage";
import { addDays, formatMinutes, localDateKey, weekdayIndex } from "../lib/time";
import { ProteinChip } from "./MealSwapSheet";

const fmt = (opts: Intl.DateTimeFormatOptions) => {
  try {
    return new Intl.DateTimeFormat(undefined, opts);
  } catch {
    return new Intl.DateTimeFormat("en-IN", opts);
  }
};
const weekdayShort = fmt({ weekday: "short" });
const dayNumber = fmt({ day: "numeric" });
const dayLong = fmt({ weekday: "long", day: "numeric", month: "short" });

const slotMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
};

/**
 * The next six days of the plan, one day at a time. Read-only: meals can be
 * changed on the day itself, from Today's plate.
 */
export function WeekAhead({ prefs, today }: { prefs: Prefs; today: Date }) {
  const reduced = useReducedMotion();
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const todayKey = localDateKey(today);
  const days = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const date = addDays(today, i + 1);
        const plan = dayPlan(prefs, weekdayIndex(date));
        return {
          id: localDateKey(date),
          date,
          label: weekdayShort.format(date),
          sub: dayNumber.format(date),
          plan,
          protein: MEAL_SLOTS.reduce((sum, s) => sum + plan[s.id].protein, 0),
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [todayKey, prefs.region, prefs.diet],
  );
  const [picked, setPicked] = useState(days[0].id);
  const day = days.find((d) => d.id === picked) ?? days[0];
  const target = PROTEIN_TARGET[prefs.audience];

  return (
    <div className="week-ahead">
      <button type="button" className="week-toggle" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((o) => !o)}>
        <span>
          <span className="week-toggle-title">Next 6 days</span>
          <span className="week-toggle-sub">See the meal plan day by day</span>
        </span>
        <span className={`week-chevron ${open ? "is-open" : ""}`} aria-hidden="true" />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            key="week"
            className="week-body"
            initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, height: "auto" }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <Segmented
              label="Choose a day"
              options={days.map((d) => ({ id: d.id, label: d.label, sub: d.sub }))}
              value={day.id}
              onChange={setPicked}
              mode="tabs"
              idPrefix="week"
              className="week-days"
            />
            <div id="week-panel" role="tabpanel" aria-labelledby={`week-tab-${day.id}`} className="week-panel">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={day.id}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, x: -12 }}
                  transition={{ duration: 0.22 }}
                >
                  <div className="week-head">
                    <p className="week-date">
                      {dayLong.format(day.date)}
                      <span>
                        {day.plan.theme} {day.plan.emoji}
                      </span>
                    </p>
                    <span className={`protein-chip week-total ${day.protein >= target ? "is-met" : ""}`}>≈ {day.protein} g protein · guide ~{target} g</span>
                  </div>
                  <ul className="plate-rows week-rows">
                    {MEAL_SLOTS.map((s) => {
                      const meal = day.plan[s.id];
                      return (
                        <li key={s.id} className="plate-row is-preview">
                          <span className="plate-slot">
                            <span aria-hidden="true">{s.emoji}</span>
                            <span>
                              {s.label}
                              <span className="plate-time">{formatMinutes(slotMinutes(s.time))}</span>
                            </span>
                          </span>
                          <span className="plate-meal">
                            <span className="plate-meal-title">
                              <strong>{meal.title}</strong>
                            </span>
                            <span className="plate-meal-detail">{meal.detail}</span>
                            <ProteinChip grams={meal.protein} />
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                  <p className="week-note">You can change any of these on the day, from Today's plate.</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

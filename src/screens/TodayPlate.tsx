import { AnimatePresence, motion } from "framer-motion";
import { Close } from "../components/Icons";
import { useToast } from "../components/Toast";
import { MEAL_SLOTS, WEEKDAYS, type MealSlot } from "../data/content";
import { SLOT_END, balanceSuggestions, plateTotals, type Suggestion } from "../lib/balance";
import { haptics } from "../lib/device";
import { dayPlan, todayPlan } from "../lib/plan";
import { formatMinutes } from "../lib/time";
import { useApp } from "../state/AppState";
import { ProteinChip } from "./MealSwapSheet";
import { WeekAhead } from "./WeekAhead";

const slotMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
};

export function ProteinMeter({ total, target }: { total: number; target: number }) {
  const pct = Math.max(4, Math.min(100, (total / target) * 100));
  return (
    <div className="protein-meter" role="img" aria-label={`About ${total} grams of protein on today's plate. A common guide is about ${target} grams a day.`}>
      <span className="protein-meter-num">≈ {total} g</span>
      <span className="protein-meter-label">protein · guide ~{target} g</span>
      <span className="protein-meter-bar" aria-hidden="true">
        <span style={{ width: `${pct}%` }} className={total >= target ? "is-met" : ""} />
      </span>
    </div>
  );
}

/**
 * Today's plate: every meal with its approximate protein, a Change button, what
 * was added for balance, and up to three "balance your day" suggestions.
 */
export function TodayPlate({ weekday, onChange }: { weekday: number; onChange: (slot: MealSlot) => void }) {
  const { profile, prefs, day, now, nowMinutes, doneToday, addExtra, removeExtra, setLighter, dismissSuggestion } = useApp();
  const toast = useToast();
  const categories = profile?.categories ?? [];
  const base = dayPlan(prefs, weekday);
  const plan = todayPlan(prefs, weekday, day.swaps);
  const totals = plateTotals(plan, base, day.extras, prefs.audience);
  const suggestions = balanceSuggestions({ plan, base, day, diet: prefs.diet, audience: prefs.audience, categories, minutes: nowMinutes, doneToday });
  const moves = day.extras.filter((e) => e.kind === "move");

  const apply = (s: Suggestion) => {
    const a = s.action;
    if (!a) return;
    haptics.success();
    if (a.extra) addExtra(a.extra);
    if (a.lighter) setLighter(a.lighter.slot, a.lighter.hint);
    const removed = a.removeExtra ? day.extras.find((e) => e.id === a.removeExtra) : undefined;
    if (removed) removeExtra(removed.id);
    toast(removed ? `Removed ${removed.title.toLowerCase()}` : a.lighter ? `Noted: ${a.lighter.hint.toLowerCase()}` : `Added: ${a.extra?.title}`, {
      label: "Undo",
      onClick: () => {
        if (a.extra) removeExtra(a.extra.id);
        if (a.lighter) setLighter(a.lighter.slot, null);
        if (removed) addExtra(removed);
      },
    });
  };

  return (
    <section className="plate-card glass" aria-labelledby="plate-h">
      <div className="plate-head">
        <div>
          <h2 id="plate-h" className="section-title">
            Today's plate
          </h2>
          <p className="plate-sub">
            {WEEKDAYS[weekday]} · {plan.theme} {plan.emoji}
          </p>
        </div>
        <ProteinMeter total={totals.protein} target={totals.target} />
      </div>

      <ul className="plate-rows">
        {MEAL_SLOTS.map((s) => {
          const meal = plan[s.id];
          const swapped = !!day.swaps[s.id];
          const added = day.extras.filter((e) => e.slot === s.id && e.kind === "food");
          const lighter = day.lighter[s.id];
          return (
            <li key={s.id} className={`plate-row ${SLOT_END[s.id] <= nowMinutes ? "is-past" : ""}`}>
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
                  {swapped && <span className="plate-badge">Changed</span>}
                </span>
                <span className="plate-meal-detail">{meal.detail}</span>
                <ProteinChip grams={meal.protein} />
                <AnimatePresence initial={false}>
                  {lighter && (
                    <motion.span key="lighter" className="plate-added" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                      <span>🍃 Lighter today: {lighter}</span>
                      <button type="button" className="plate-remove" onClick={() => setLighter(s.id, null)} aria-label={`Undo lighter ${s.label.toLowerCase()}`}>
                        <Close size={14} />
                      </button>
                    </motion.span>
                  )}
                  {added.map((e) => (
                    <motion.span key={e.id} className="plate-added" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                      <span>
                        + {e.title}, {e.detail}
                        {e.protein ? ` · ≈ ${e.protein} g` : ""}
                      </span>
                      <button type="button" className="plate-remove" onClick={() => removeExtra(e.id)} aria-label={`Remove ${e.title}`}>
                        <Close size={14} />
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>
              </span>
              <button type="button" className="plate-change chip" onClick={() => onChange(s.id)} aria-label={`Change ${s.label.toLowerCase()}: ${meal.title}`}>
                Change
              </button>
            </li>
          );
        })}
      </ul>

      {moves.length > 0 && (
        <ul className="plate-moves" aria-label="Movement added today">
          {moves.map((e) => (
            <li key={e.id} className="plate-added">
              <span>
                🚶 {e.title} · {e.detail}
              </span>
              <button type="button" className="plate-remove" onClick={() => removeExtra(e.id)} aria-label={`Remove ${e.title}`}>
                <Close size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {suggestions.length > 0 && (
        <div className="balance" role="region" aria-labelledby="balance-h">
          <h3 id="balance-h" className="section-title">
            Balance your day
          </h3>
          <ul className="balance-list">
            <AnimatePresence initial={false}>
              {suggestions.map((sg) => (
                <motion.li
                  key={sg.id}
                  layout
                  className={`balance-item balance-${sg.kind}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                >
                  <span className="balance-icon" aria-hidden="true">
                    {sg.icon}
                  </span>
                  <span className="balance-text">
                    <strong>{sg.title}</strong>
                    <span>{sg.body}</span>
                  </span>
                  <span className="balance-actions">
                    {sg.action && (
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => apply(sg)}>
                        {sg.action.label}
                      </button>
                    )}
                    <button type="button" className="icon-btn balance-dismiss" onClick={() => dismissSuggestion(sg.id)} aria-label={`Not today: ${sg.title}`}>
                      <Close size={16} />
                    </button>
                  </span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      )}

      <WeekAhead prefs={prefs} today={now} />

      <p className="plate-note">Protein is a rough estimate for typical home portions (meat and fish weights raw). The guide is about 0.8 g per kg of body weight a day.</p>
    </section>
  );
}

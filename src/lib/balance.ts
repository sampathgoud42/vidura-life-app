/**
 * "Balance your day": after a meal swap (or on a light day), suggest what to add
 * or ease off, e.g. a protein snack when the plate runs low, a short walk after
 * a heavier meal, a lighter next meal. Rules are simple and explainable; every
 * suggestion is optional and can be dismissed.
 *
 * Protein reference: roughly 0.8 g per kg of body weight a day (ICMR-NIN 2020 RDA),
 * about 46 g for a reference Indian woman and 54 g for a reference man.
 */
import { ACTIVITIES, MEAL_SLOTS, type AudienceId, type CategoryId, type DayPlan, type DietId, type Meal, type MealSlot } from "../data/content";
import { mealLoad, mealTags } from "./meals";
import type { DayExtra, DayState } from "./storage";

export const PROTEIN_TARGET: Record<AudienceId, number> = { everyone: 50, women: 46, men: 54 };

export const SLOT_ORDER: readonly MealSlot[] = MEAL_SLOTS.map((s) => s.id);
/** Local minutes by which each slot's meal is usually over. */
export const SLOT_END: Record<MealSlot, number> = { early: 7 * 60, breakfast: 9 * 60 + 30, midMorning: 11 * 60, lunch: 14 * 60, snack: 17 * 60, dinner: 19 * 60 + 30 };
const slotLabel = (s: MealSlot) => MEAL_SLOTS.find((m) => m.id === s)!.label.toLowerCase();

export interface PlateTotals {
  /** Today's plate, with swaps and additions. */
  protein: number;
  /** The plan as it was. */
  base: number;
  target: number;
}

export function plateTotals(plan: DayPlan, base: DayPlan, extras: readonly DayExtra[], audience: AudienceId): PlateTotals {
  const sum = (p: DayPlan) => SLOT_ORDER.reduce((s, k) => s + p[k].protein, 0);
  return {
    protein: sum(plan) + extras.reduce((s, e) => s + e.protein, 0),
    base: sum(base),
    target: PROTEIN_TARGET[audience],
  };
}

export type SuggestionKind = "add-food" | "add-move" | "lighter" | "reduce" | "tip";

export interface Suggestion {
  id: string;
  kind: SuggestionKind;
  icon: string;
  title: string;
  body: string;
  action?: { label: string; extra?: DayExtra; lighter?: { slot: MealSlot; hint: string }; removeExtra?: string };
}

interface ProteinAdd {
  id: string;
  icon: string;
  title: string;
  detail: string;
  protein: number;
  diets: DietId[];
  slots: MealSlot[];
}

const ALL: DietId[] = ["vegetarian", "non-vegetarian", "vegan"];
const DAIRY: DietId[] = ["vegetarian", "non-vegetarian"];

/** Everyday protein add-ons, smallest first. */
const PROTEIN_ADDS: readonly ProteinAdd[] = [
  { id: "curd", icon: "🥛", title: "A bowl of curd", detail: "1 katori, plain", protein: 4, diets: DAIRY, slots: ["breakfast", "lunch", "snack"] },
  { id: "soy-milk", icon: "🥛", title: "A glass of soy milk", detail: "200 ml", protein: 6, diets: ["vegan"], slots: ["breakfast", "midMorning", "snack"] },
  { id: "milk", icon: "🥛", title: "A glass of milk", detail: "200 ml, warm or cold", protein: 7, diets: DAIRY, slots: ["breakfast", "midMorning", "snack"] },
  { id: "sprouts", icon: "🌱", title: "Moong sprouts", detail: "1 cup, with lemon and onion", protein: 7, diets: ALL, slots: ["midMorning", "snack"] },
  { id: "dal", icon: "🥣", title: "An extra katori of dal", detail: "with your meal", protein: 7, diets: ALL, slots: ["lunch", "dinner"] },
  { id: "peanuts", icon: "🥜", title: "Roasted peanuts", detail: "¼ cup, unsalted", protein: 8, diets: ALL, slots: ["midMorning", "snack"] },
  { id: "tofu", icon: "🍲", title: "Tofu", detail: "100 g, in a bhurji or curry", protein: 9, diets: ALL, slots: ["breakfast", "lunch", "dinner"] },
  { id: "paneer", icon: "🧀", title: "Paneer", detail: "50 g, grilled or in a bhurji", protein: 9, diets: DAIRY, slots: ["breakfast", "lunch", "dinner"] },
  { id: "chana", icon: "🥜", title: "Roasted chana", detail: "½ cup, unsalted", protein: 10, diets: ALL, slots: ["midMorning", "snack"] },
  { id: "eggs", icon: "🥚", title: "Two boiled eggs", detail: "with a pinch of pepper", protein: 13, diets: ["non-vegetarian"], slots: ["breakfast", "snack"] },
  { id: "chicken", icon: "🍗", title: "Grilled chicken", detail: "100 g", protein: 23, diets: ["non-vegetarian"], slots: ["lunch", "dinner"] },
];

export interface BalanceInput {
  plan: DayPlan;
  base: DayPlan;
  day: DayState;
  diet: DietId;
  audience: AudienceId;
  categories: readonly CategoryId[];
  /** Local minutes after midnight now. */
  minutes: number;
  doneToday: ReadonlySet<string>;
}

const nextSlot = (slot: MealSlot, minutes: number): MealSlot | null => {
  const after = SLOT_ORDER.slice(SLOT_ORDER.indexOf(slot) + 1).filter((s) => s !== "early" && SLOT_END[s] > minutes);
  return after.find((s) => s === "lunch" || s === "dinner") ?? null;
};

function lighterHint(m: Meal): string {
  const t = `${m.title} ${m.detail}`.toLowerCase();
  if (/rotis?|bhakri|chapathi/.test(t) && /\b2\b|two/.test(t)) return "One roti instead of two, with extra sabzi";
  if (/rice|pongal|khichdi|bath|sadam/.test(t)) return "Half the rice, with extra sabzi or salad";
  return "A smaller portion, with extra vegetables";
}

/** Up to three suggestions, most useful first. */
export function balanceSuggestions(input: BalanceInput): Suggestion[] {
  const { plan, base, day, diet, audience, categories, minutes, doneToday } = input;
  const out: Suggestion[] = [];
  const totals = plateTotals(plan, base, day.extras, audience);
  const has = (id: string) => day.extras.some((e) => e.id === id);
  const swapped = SLOT_ORDER.filter((s) => day.swaps[s]);

  // 1. Protein running low: below the reference, or the swaps took a real bite out of it.
  const floor = Math.max(totals.target, totals.base - 6);
  const gap = floor - totals.protein;
  if (gap >= 4) {
    const open = SLOT_ORDER.filter((s) => SLOT_END[s] > minutes);
    const fits = PROTEIN_ADDS.filter((p) => p.diets.includes(diet) && !has(`protein-${p.id}`) && p.slots.some((s) => open.includes(s)));
    const pick = fits.find((p) => p.protein >= Math.min(gap, 13)) ?? fits[fits.length - 1];
    if (pick) {
      const slot = pick.slots.find((s) => open.includes(s))!;
      const dropped = totals.base - totals.protein;
      out.push({
        id: `protein-${pick.id}`,
        kind: "add-food",
        icon: pick.icon,
        title: `Add ${pick.title.toLowerCase()} at ${slotLabel(slot)}`,
        body:
          dropped >= 5 && swapped.length
            ? `Your swap brought today's plate down by about ${dropped} g of protein. ${pick.title} (${pick.detail}) adds about ${pick.protein} g.`
            : `Today's plate is about ${totals.protein} g of protein, a little under the ~${totals.target} g most adults need. ${pick.title} (${pick.detail}) adds about ${pick.protein} g.`,
        action: { label: "Add to today", extra: { id: `protein-${pick.id}`, kind: "food", slot, title: pick.title, detail: pick.detail, protein: pick.protein } },
      });
    }
  }

  // 2. A heavier swap: a short walk afterwards, and a lighter next meal.
  for (const slot of swapped) {
    const delta = mealLoad(plan[slot]) - mealLoad(base[slot]);
    if (delta < 1.5) continue;
    const label = slotLabel(slot);
    if ((slot === "breakfast" || slot === "lunch" || slot === "dinner") && minutes < SLOT_END[slot] + 90 && !has(`walk-${slot}`)) {
      const activityId = slot === "dinner" ? "evening-stroll" : slot === "lunch" ? "midday-walk" : "afternoon-move";
      out.push({
        id: `walk-${slot}`,
        kind: "add-move",
        icon: "🚶",
        title: `A 10-minute walk after ${label}`,
        body: `Your new ${label} is a little heavier than planned. An easy walk soon after eating is a simple way to balance it.`,
        action: { label: "Add walk", extra: { id: `walk-${slot}`, kind: "move", slot, title: "10-minute easy walk", detail: `After ${label}`, protein: 0, activityId } },
      });
    }
    const next = nextSlot(slot, minutes);
    if (next && !day.lighter[next] && mealLoad(plan[next]) > 0) {
      const hint = lighterHint(plan[next]);
      out.push({
        id: `lighter-${next}`,
        kind: "lighter",
        icon: "🍃",
        title: `Keep ${slotLabel(next)} lighter`,
        body: `${hint}. It evens out the day after a fuller ${label}.`,
        action: { label: "Make it lighter", lighter: { slot: next, hint } },
      });
    }
    const tags = mealTags(plan[slot]);
    if (categories.includes("sugar") && (tags.has("sweet") || tags.has("rice")))
      out.push({ id: "tip-sugar-order", kind: "tip", icon: "🥗", title: "Vegetables first", body: "Start that meal with salad or sabzi, then dal, and finish with the rice or roti." });
    if (categories.includes("cholesterol") && (tags.has("fried") || tags.has("ghee") || tags.has("coconut")))
      out.push({ id: "tip-chol-oil", kind: "tip", icon: "🥄", title: "Go easy on oil later", body: "Keep the next meal's tadka to a teaspoon of oil." });
    if (categories.includes("bp") && tags.has("salty"))
      out.push({ id: "tip-bp-salt", kind: "tip", icon: "🧂", title: "Easy on salt for the rest of the day", body: "Skip the pickle and papad at the next meal, and have a fruit or some tender coconut water later." });
    if (categories.includes("gut") && slot === "dinner")
      out.push({ id: "tip-gut-saunf", kind: "tip", icon: "🌿", title: "Saunf after dinner", body: "A teaspoon of fennel seeds after a fuller dinner, and a gentle stroll." });
  }

  // 3. Plenty of protein already, and an added portion on top: offer to drop it.
  const addedProtein = day.extras.filter((e) => e.kind === "food" && e.protein > 0);
  if (addedProtein.length && totals.protein - addedProtein[0].protein >= totals.target + 10)
    out.push({
      id: `reduce-${addedProtein[0].id}`,
      kind: "reduce",
      icon: "✔️",
      title: `You can skip the ${addedProtein[0].title.toLowerCase()}`,
      body: `Your plate already covers about ${totals.protein - addedProtein[0].protein} g of protein today.`,
      action: { label: "Remove it", removeExtra: addedProtein[0].id },
    });

  // 4. No movement logged by late afternoon: bring the evening stroll forward.
  const moved = ACTIVITIES.some((a) => a.kind === "move" && doneToday.has(a.id));
  if (!moved && minutes >= 15 * 60 && minutes < 20 * 60 && !has("move-evening") && !has("walk-dinner"))
    out.push({
      id: "move-evening",
      kind: "add-move",
      icon: "🌇",
      title: "Fit in an evening walk",
      body: "No movement logged yet today. A 10–15 minute stroll after dinner still counts.",
      action: { label: "Add walk", extra: { id: "move-evening", kind: "move", slot: "dinner", title: "Evening stroll", detail: "10–15 minutes after dinner", protein: 0, activityId: "evening-stroll" } },
    });

  const seen = new Set<string>();
  return out.filter((s) => !day.dismissed.includes(s.id) && !seen.has(s.id) && seen.add(s.id)).slice(0, 3);
}

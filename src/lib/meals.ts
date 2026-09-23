/**
 * Meal swaps: alternatives for one slot of today's plate, drawn from the user's
 * own kitchen first, then other regional kitchens, plus the protein picks, and
 * ranked for their focus areas. Diet is a hard filter: vegetarians never see
 * meat, fish or eggs; vegans only see vegan plans.
 */
import {
  AIR_FRY_DINNERS,
  AIR_FRY_LUNCHES,
  CATEGORIES,
  MEAL_PLANS,
  PROTEIN_SNACKS,
  REGIONS,
  WEEKDAYS,
  type CategoryId,
  type DayPlan,
  type DietId,
  type Meal,
  type MealSlot,
  type RegionId,
} from "../data/content";
import type { Prefs } from "./storage";

export type MealTag =
  | "millet"
  | "legume"
  | "greens"
  | "fermented"
  | "fish"
  | "egg"
  | "meat"
  | "dairy"
  | "nuts"
  | "seeds"
  | "fried"
  | "sweet"
  | "rice"
  | "coconut"
  | "ghee"
  | "oats"
  | "fruit"
  | "soy"
  | "light"
  | "heavy";

const TAG_RULES: [MealTag, RegExp][] = [
  ["millet", /\b(?:ragi|jowar|jonna|jolada|bajra|kambu|samai|millet|makki|koozh|ambali|mudde|sankati)\b/],
  ["legume", /\b(?:dal|pappu|paruppu|moong|chana|rajma|chole|sambh?ar|lentils?|kadala|kadle|sundal|horse gram|kollu|hurulikaalu|pesarattu|chillas?|cheelas?|besan|sprouts|cherupayar|bassaru|dhokla|chickpeas?|pesara|kootu)\b/],
  ["greens", /\b(?:palak|spinach|saag|keerai|soppu|soppina|methi leaves|leafy|greens|palakura|gongura|murunga|drumstick leaf)\b/],
  ["fermented", /\b(?:idlis?|dosas?|dhokla|curd|dahi|perugu|thayir|mosaru|buttermilk|majjiga|kanji|appam|kefir|yoghurt|mor kuzhambu)\b/],
  ["fish", /\b(?:fish|meen|macchi|chepa|rohu|surmai|mackerel|salmon|karimeen|prawns?|royyala|kane)\b/],
  ["egg", /\b(?:eggs?|anda)\b/],
  ["meat", /\b(?:chicken|murgh|murgi|kodi|kozhi|mutton|keema|tangri)\b/],
  ["dairy", /\b(?:paneer|curd|dahi|milk|buttermilk|raita|perugu|thayir|mosaru|ghee|majjiga)\b/],
  ["nuts", /\b(?:almonds?|walnuts?|akhrot|peanuts?|groundnuts?|cashews?)\b/],
  ["seeds", /\b(?:flax(?:seeds?)?|chia|pumpkin seeds?|sunflower|sesame|nuvvulu|til|hemp)\b/],
  ["fried", /\b(?:fried|pakoras?|bhaji|samosas?|puri|bhatura|murukku)\b|\bchips\b(?![^+·]*baked)|\bvada\b(?![^+·]*baked)/],
  ["sweet", /\b(?:kesari|laddus?|halwa|kheer|payasam|jaggery|honey|maple|mithai|banana chips|dates|chikki)\b/],
  ["rice", /\b(?:rice|pulihora|chitranna|bisi bele|sadam|pongal|khichdi|idiyappam)\b/],
  ["coconut", /\b(?:coconut|kobbari)\b/],
  ["ghee", /\bghee\b/],
  ["oats", /\boats?\b/],
  ["fruit", /\b(?:guava|papaya|pomegranate|berries|fruit|banana|nendran|amla|apple|orange|jamun)\b/],
  ["soy", /\b(?:tofu|soy)\b/],
  ["light", /\b(?:soup|broth|rasam|saaru|shorba|kanji|light|steamed|clear|thin)\b/],
  ["heavy", /\b(?:thali|sadhya|biryani|full)\b/],
];

/** Drop negations ("no ghee", "(no cream)", "unsweetened") before tagging. */
const textOf = (m: Meal) =>
  `${m.title} ${m.detail}`
    .toLowerCase()
    .replace(/\((?:no|without|less|minimal)[^)]*\)/g, " ")
    .replace(/\b(?:no|without|skip|minimal|less)\s+[a-z/ -]+?(?=,|\s\+|\s·|\)|$)/g, " ")
    .replace(/\bunsweetened\b|\bno sugar\b|\bmurukku-free\b/g, " ");

const tagCache = new WeakMap<Meal, ReadonlySet<MealTag>>();
export function mealTags(m: Meal): ReadonlySet<MealTag> {
  const hit = tagCache.get(m);
  if (hit) return hit;
  const t = textOf(m);
  const tags = new Set<MealTag>(TAG_RULES.filter(([, re]) => re.test(t)).map(([tag]) => tag));
  tagCache.set(m, tags);
  return tags;
}

/** How heavy a meal sits: rice-heavy, sweet, fried, thali-sized, rich. Used to suggest balance. */
export function mealLoad(m: Meal): number {
  const tags = mealTags(m);
  const t = textOf(m);
  let load = 0;
  if (tags.has("sweet")) load += 2;
  if (tags.has("fried")) load += 2;
  if (tags.has("heavy")) load += 1.5;
  if (tags.has("ghee")) load += 0.5;
  if (/\b(?:pulihora|tamarind rice|bisi bele|curd rice|thayir sadam|mosaru chitranna|sabudana|kesari)\b/.test(t)) load += 1.5;
  else if (tags.has("rice") && !/½ cup|small|little/.test(t)) load += 0.75;
  if (tags.has("light")) load -= 0.75;
  return load;
}

/** Points per tag for each focus. Positive = a good fit, negative = go easy. */
const FOCUS_WEIGHTS: Record<CategoryId, Partial<Record<MealTag, number>>> = {
  cholesterol: { oats: 3, millet: 2, legume: 2, greens: 1.5, fish: 2, nuts: 1.5, seeds: 1.5, fruit: 1, soy: 1, light: 0.5, fried: -4, ghee: -1.5, coconut: -1, meat: -0.5, heavy: -1, sweet: -1 },
  sugar: { millet: 3, legume: 2.5, greens: 2, oats: 1.5, seeds: 1, nuts: 1, egg: 1, fish: 1, soy: 1, sweet: -4, rice: -1.5, fried: -2, heavy: -1.5 },
  fertility: { legume: 1.5, greens: 2, nuts: 2, seeds: 2, egg: 1.5, fish: 1.5, fruit: 1.5, dairy: 0.5, fried: -3, sweet: -2 },
  hormonal: { seeds: 2.5, greens: 2, legume: 1.5, millet: 1.5, soy: 1, fruit: 1, sweet: -3, fried: -3 },
  gut: { fermented: 3, legume: 1, greens: 1, light: 1.5, oats: 1, fruit: 0.5, fried: -3, heavy: -1.5, sweet: -1.5 },
  inflammation: { greens: 2, fish: 2, nuts: 1.5, seeds: 1.5, fruit: 1.5, millet: 1, legume: 1, fried: -3, sweet: -2.5, meat: -0.5 },
};

export function focusScore(m: Meal, cat: CategoryId): number {
  const w = FOCUS_WEIGHTS[cat];
  let s = 0;
  for (const tag of mealTags(m)) s += w[tag] ?? 0;
  if (cat === "fertility" || cat === "sugar") s += Math.min(3, m.protein / 8);
  return s;
}

/** Diets whose plans a person can choose from. */
export function allowedDiets(diet: DietId): DietId[] {
  if (diet === "non-vegetarian") return ["non-vegetarian", "vegetarian"];
  if (diet === "vegetarian") return ["vegetarian", "vegan"];
  return ["vegan"];
}

export type OptionGroup = "yours" | "kitchens" | "protein";

export interface MealOption {
  key: string;
  meal: Meal;
  group: OptionGroup;
  /** Where it's from: a weekday of your plan, another region, or "Protein pick". */
  label: string;
  score: number;
  /** Focus areas it suits especially well. */
  fits: CategoryId[];
}

const sameMeal = (a: Meal, b: Meal) => a.title === b.title && a.detail === b.detail;
const regionLabel = (id: RegionId) => REGIONS.find((r) => r.id === id)?.label ?? id;

function candidates(prefs: Prefs, slot: MealSlot): Omit<MealOption, "score" | "fits">[] {
  const out: Omit<MealOption, "score" | "fits">[] = [];
  const diets = allowedDiets(prefs.diet);
  for (const region of REGIONS.map((r) => r.id)) {
    for (const diet of diets) {
      MEAL_PLANS[region][diet].forEach((day: DayPlan, w) => {
        out.push({
          key: `${region}:${diet}:${w}:${slot}`,
          meal: day[slot],
          group: region === prefs.region ? "yours" : "kitchens",
          label: region === prefs.region ? `${WEEKDAYS[w]}'s plan` : regionLabel(region),
        });
      });
    }
  }
  const picks: readonly Meal[] =
    slot === "snack" ? PROTEIN_SNACKS : prefs.diet === "non-vegetarian" && slot === "dinner" ? AIR_FRY_DINNERS : prefs.diet === "non-vegetarian" && slot === "lunch" ? AIR_FRY_LUNCHES : [];
  picks.forEach((meal, i) => out.push({ key: `pick:${slot}:${i}`, meal, group: "protein", label: "Protein pick" }));
  return out;
}

/** Alternatives for `slot`, best first, without duplicates or the current meal. */
export function mealOptions(prefs: Prefs, slot: MealSlot, current: Meal, categories: readonly CategoryId[]): MealOption[] {
  const seen = new Set<string>();
  const scored: MealOption[] = [];
  for (const c of candidates(prefs, slot)) {
    // Near-duplicates (the vegetarian and vegan versions of one dish) share their first two components.
    const core = c.meal.detail
      .toLowerCase()
      .split(/\s\+\s|,\s/)
      .slice(0, 2)
      .map((p) => p.replace(/\([^)]*\)/g, "").trim())
      .sort()
      .join("|");
    const id = `${c.meal.title}|${c.meal.detail}`.toLowerCase();
    if (sameMeal(c.meal, current) || seen.has(id) || seen.has(core)) continue;
    seen.add(id);
    seen.add(core);
    const perCat = categories.map((cat) => [cat, focusScore(c.meal, cat)] as const);
    const focus = perCat.reduce((s, [, v]) => s + v, 0);
    const score = focus + (c.group === "yours" ? 1.5 : c.group === "protein" ? 1 : 0) + Math.min(2, c.meal.protein / 15) - mealLoad(c.meal) * 0.5;
    const fits = perCat.filter(([, v]) => v >= 3).sort((a, b) => b[1] - a[1]).map(([cat]) => cat);
    scored.push({ ...c, score, fits });
  }
  return scored.sort((a, b) => b.score - a.score);
}

export const categoryShort = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)!;

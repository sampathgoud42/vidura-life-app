/**
 * Vidura Life — all app content in one typed file.
 *
 * Source: the original "Wellness app" artifact (reference/wellness-app.original.jsx).
 * Goals → focus categories, the morning ritual / weekly exercise / meal slots →
 * time-phase activities, tips → tip deck, affirmations → welcome messages.
 *
 * House rules for copy: calm, second person, practical. No medical or
 * physiological claims ("lowers LDL", "boosts testosterone" …) — the original's
 * claims were rewritten as plain, everyday suggestions. Traditional herbs carry
 * a check-with-your-doctor note.
 *
 * Keep this file free of runtime imports and non-erasable TypeScript
 * (no enums / namespaces): scripts/generate-images.mjs imports it directly with
 * Node's built-in type stripping.
 */

// ── Types ─────────────────────────────────────────────────────────────────────
export type PhaseId = "dawn" | "morning" | "midday" | "afternoon" | "evening" | "night";
export type CategoryId = "cholesterol" | "sugar" | "fertility" | "hormonal" | "gut" | "inflammation";
export type RegionId = "pan-indian" | "north-indian" | "telugu" | "tamil" | "kerala" | "bangalore";
export type DietId = "vegetarian" | "non-vegetarian" | "vegan";
export type ApproachId = "both" | "modern" | "ayurvedic";
export type AudienceId = "everyone" | "women" | "men";
export type ActivityKind = "ritual" | "move" | "breathe" | "meal" | "rest" | "light";
export type MealSlot = "early" | "breakfast" | "midMorning" | "lunch" | "snack" | "dinner";
export type ImageRatio = "16:9" | "1:1" | "4:5";
export type TipKind = "habit" | "food" | "mind" | "move" | "rest" | "care";

export interface Meal {
  title: string;
  detail: string;
  /** Approximate protein in grams for a typical home serving (see scripts/lib/protein.mjs). */
  protein: number;
}

export interface DayPlan {
  theme: string;
  emoji: string;
  early: Meal;
  breakfast: Meal;
  midMorning: Meal;
  lunch: Meal;
  snack: Meal;
  dinner: Meal;
}

export interface ImageSlot {
  /** Path relative to the app base, always `assets/{phase|focus}/{slug}.webp`. */
  src: string;
  alt: string;
  ratio: ImageRatio;
  /** Scene description; the shared style block is appended by `buildImagePrompt`. */
  subject: string;
  /** Which phase's colour tones the image should carry. */
  tone: PhaseId;
}

export interface Phase {
  id: PhaseId;
  label: string;
  /** Minutes after local midnight. `end` is exclusive; night wraps past midnight. */
  start: number;
  end: number;
  mood: string;
  theme: "light" | "dark";
  hero: ImageSlot;
}

export interface Category {
  id: CategoryId;
  /** The goal name used in the original artifact. */
  artifactId: string;
  label: string;
  short: string;
  emoji: string;
  blurb: string;
  image: ImageSlot;
}

export interface BreathPattern {
  inhale: number;
  exhale: number;
  hold?: number;
}

export interface Activity {
  id: string;
  phase: PhaseId;
  kind: ActivityKind;
  title: string;
  summary: string;
  minutes: number;
  /** Preferred time window, minutes after midnight. Night windows may run past 1440. */
  window: [number, number];
  /** Categories this suits. Empty = a daily foundation for everyone. */
  categories: CategoryId[];
  approach?: ApproachId[];
  /** Pull the headline from today's meal plan. */
  meal?: MealSlot;
  /** Pull the headline from today's exercise plan. */
  exercise?: boolean;
  /** Guided-mode prompts. `{meal}` and `{exercise}` are filled in at runtime. */
  steps: string[];
  breath?: BreathPattern;
  focus?: Partial<Record<CategoryId, string>>;
  audienceNote?: Partial<Record<Exclude<AudienceId, "everyone">, string>>;
  dietNote?: Partial<Record<DietId, string>>;
  note?: string;
  image: ImageSlot;
}

export interface Tip {
  id: string;
  category: CategoryId | "all";
  audience?: Exclude<AudienceId, "everyone">;
  kind: TipKind;
  icon: string;
  title: string;
  body: string;
}

export interface Message {
  text: string;
  sub: string;
  emoji: string;
}

export interface ExerciseDay {
  title: string;
  detail: string;
  minutes: number;
}

export interface Choice<T extends string> {
  id: T;
  label: string;
  sub: string;
  emoji: string;
}

// ── Brand ─────────────────────────────────────────────────────────────────────
export const APP = {
  name: "Vidura Life",
  tagline: "A calm companion for your day, tuned to the light outside.",
  privacyNote: "Your name and email are saved to Vidura's wellness records. Everything else stays on this device.",
  disclaimer:
    "General wellness ideas, not medical advice. Please talk to your doctor before changing your diet, starting supplements or herbs, or if you're pregnant, take medication or manage a health condition.",
} as const;

export const MIN = (h: number, m = 0) => h * 60 + m;

// ── Images ────────────────────────────────────────────────────────────────────
/**
 * Shared style block appended to every Nano Banana Pro prompt: content-themed,
 * modern minimalist flat art whose palette follows the time phase, so each image
 * sits inside that phase's living-light background. Flat colour also keeps files small.
 */
export const STYLE_BLOCK =
  "modern minimalist flat vector illustration, bold simple geometric shapes and a few overlapping triangles in a mid-century poster style, clean crisp edges, flat solid colours with simple two-tone shading, no gradients, no texture, no grain, no photorealism, limited palette of {phase}, simplified figures with minimal facial features, large calm areas of flat negative space, the whole canvas filled edge to edge with flat background colour from the palette (no white background, no inner panel or square, no vignette), South Asian people where people appear, no text, no letters, no logos, no border, no frame";

/** Per-phase palettes, matched to the app's phase themes (src/lib/palette.ts). */
export const PHASE_TONES: Record<PhaseId, string> = {
  dawn: "soft peach, blush pink, lilac, warm cream and a touch of deep plum",
  morning: "saffron orange, warm gold, cream, soft teal and charcoal",
  midday: "clear sky blue, sunny yellow, off-white, turquoise and deep navy",
  afternoon: "sage green, pale aqua, warm sand, teal and charcoal",
  evening: "amber, terracotta, dusty rose, deep plum and warm cream",
  night: "indigo, deep teal, midnight navy, soft lavender and pale moonlight yellow",
};

const COMPOSITION: Record<ImageRatio, string> = {
  "16:9": "Wide 16:9 frame; subject off-centre to the right with a calm, open left side.",
  "1:1": "Square 1:1 frame; one clear subject centred with generous flat negative space.",
  "4:5": "Vertical 4:5 frame; subject in the upper two-thirds, the bottom third a calm, simple flat area with very few shapes.",
};

export function buildImagePrompt(slot: ImageSlot): string {
  return `${slot.subject}. ${COMPOSITION[slot.ratio]} Style: ${STYLE_BLOCK.replace("{phase}", PHASE_TONES[slot.tone])}.`;
}

const img = (src: string, ratio: ImageRatio, tone: PhaseId, alt: string, subject: string): ImageSlot => ({
  src,
  ratio,
  tone,
  alt,
  subject,
});

// ── Time phases ───────────────────────────────────────────────────────────────
// Checked against the artifact's own timing: early-morning drink + walk at first
// light, breakfast and mid-morning bite, lunch, the evening protein snack at
// ~4–5 PM, dinner by 7:30 PM with evening pranayama, lights out by 10:30 PM.
export const PHASES: readonly Phase[] = [
  {
    id: "dawn",
    label: "Dawn",
    start: MIN(5),
    end: MIN(7),
    mood: "First light. Go slow.",
    theme: "light",
    hero: img(
      "assets/dawn/hero.webp",
      "16:9",
      "dawn",
      "A rooftop terrace at first light with a tulsi plant and a folded yoga mat",
      "A quiet South Asian rooftop terrace at first light, a potted tulsi plant, a folded cotton yoga mat and a steel tumbler of warm water on the parapet, distant low city silhouette under a peach and lilac sky",
    ),
  },
  {
    id: "morning",
    label: "Morning",
    start: MIN(7),
    end: MIN(11),
    mood: "Warm light. Steady start.",
    theme: "light",
    hero: img(
      "assets/morning/hero.webp",
      "16:9",
      "morning",
      "A sunlit Indian kitchen window with a cup of chai and marigolds",
      "A sunlit Indian home kitchen window, a steaming cup of chai, a bowl of poha with curry leaves and a string of marigolds, warm golden light pouring across a stone counter",
    ),
  },
  {
    id: "midday",
    label: "Midday",
    start: MIN(11),
    end: MIN(14),
    mood: "Bright and clear. Eat well.",
    theme: "light",
    hero: img(
      "assets/midday/hero.webp",
      "16:9",
      "midday",
      "A shaded courtyard with a neem tree and a home-cooked thali",
      "A shaded Indian courtyard under a neem tree, a simple home-cooked thali on a low wooden table, dappled bright daylight on terracotta floor tiles",
    ),
  },
  {
    id: "afternoon",
    label: "Afternoon",
    start: MIN(14),
    end: MIN(17),
    mood: "Clear skies. Keep moving.",
    theme: "light",
    hero: img(
      "assets/afternoon/hero.webp",
      "16:9",
      "afternoon",
      "A calm tree-lined park path under a clear sky",
      "A calm tree-lined park path in an Indian city with an empty bench, a South Asian person walking far in the distance, clear sky and sage-green leaves",
    ),
  },
  {
    id: "evening",
    label: "Evening",
    start: MIN(17),
    end: MIN(20),
    mood: "Golden hour. Ease off.",
    theme: "dark",
    hero: img(
      "assets/evening/hero.webp",
      "16:9",
      "evening",
      "A balcony at sunset with a glowing diya and a cup of herbal tea",
      "A balcony at sunset overlooking quiet rooftops, a brass diya glowing and a glass cup of herbal tea on the ledge, amber and rose sky fading to dusk",
    ),
  },
  {
    id: "night",
    label: "Night",
    start: MIN(20),
    end: MIN(5),
    mood: "Stars out. Wind down.",
    theme: "dark",
    hero: img(
      "assets/night/hero.webp",
      "16:9",
      "night",
      "A serene bedroom corner at night with a warm lamp and a cup of golden milk",
      "A serene bedroom corner at night, a floor cushion, a steel cup of warm golden milk and a softly glowing lamp, indigo window with a few faint stars",
    ),
  },
];

// ── Focus categories (the artifact's health goals) ────────────────────────────
export const CATEGORIES: readonly Category[] = [
  {
    id: "cholesterol",
    artifactId: "Cholesterol",
    label: "Cholesterol",
    short: "Heart",
    emoji: "❤️",
    blurb: "Kinder fats, fibre-rich plates and daily walks.",
    image: img(
      "assets/focus/cholesterol.webp",
      "1:1",
      "morning",
      "A clay bowl of oats with walnuts, almonds and pomegranate",
      "A clay bowl of oats topped with walnuts, almonds and pomegranate seeds beside a small brass cup of green tea on a linen cloth",
    ),
  },
  {
    id: "sugar",
    artifactId: "Sugar",
    label: "Blood Sugar",
    short: "Sugar",
    emoji: "🩸",
    blurb: "Low-GI plates, steady meals and walks after eating.",
    image: img(
      "assets/focus/sugar.webp",
      "1:1",
      "midday",
      "A millet roti thali with dal, cucumber and leafy greens",
      "Overhead view of a steel thali with jowar roti, dal, cucumber slices and leafy greens, a small bowl of fenugreek seeds and a cinnamon stick on a stone counter",
    ),
  },
  {
    id: "fertility",
    artifactId: "Fertility",
    label: "Fertility",
    short: "Fertility",
    emoji: "🧬",
    blurb: "Nourishing food, deep rest and room for calm.",
    image: img(
      "assets/focus/fertility.webp",
      "1:1",
      "evening",
      "A couple sharing tea on a quiet veranda, seen from behind",
      "A South Asian couple sitting close together on a quiet veranda sharing cups of tea, seen from behind, relaxed shoulders, potted plants and warm light",
    ),
  },
  {
    id: "hormonal",
    artifactId: "Hormonal Balance",
    label: "Hormonal Balance",
    short: "Hormones",
    emoji: "🌸",
    blurb: "A steady rhythm: light, sleep and calm.",
    image: img(
      "assets/focus/hormonal.webp",
      "1:1",
      "dawn",
      "A woman in a gentle yoga pose beside an open window",
      "A South Asian woman in a gentle seated yoga stretch on a cotton mat beside an open window with sheer curtains, a brass bowl of jasmine flowers nearby",
    ),
  },
  {
    id: "gut",
    artifactId: "Gut Health",
    label: "Gut Health",
    short: "Gut",
    emoji: "🌱",
    blurb: "Fermented foods, fibre and slower meals.",
    image: img(
      "assets/focus/gut.webp",
      "1:1",
      "afternoon",
      "Bowls of homemade curd, idli and buttermilk on a banana leaf",
      "Earthenware bowls of homemade curd and soft idli with a glass of spiced buttermilk and fresh curry leaves arranged on a banana leaf",
    ),
  },
  {
    id: "inflammation",
    artifactId: "Inflammation",
    label: "Inflammation",
    short: "Calm",
    emoji: "🔥",
    blurb: "Turmeric, greens, good sleep and gentle movement.",
    image: img(
      "assets/focus/inflammation.webp",
      "1:1",
      "morning",
      "Fresh turmeric, ginger and a cup of golden milk on a wooden board",
      "Fresh turmeric root, ginger, whole black pepper and a cup of golden turmeric milk on a rustic wooden board",
    ),
  },
];

// ── Preferences ("Make it yours") ─────────────────────────────────────────────
export const REGIONS: readonly Choice<RegionId>[] = [
  { id: "pan-indian", label: "Pan-Indian", sub: "A mix from across India", emoji: "🍲" },
  { id: "north-indian", label: "North Indian", sub: "Punjab · Delhi · UP · Rajasthan", emoji: "🏔️" },
  { id: "telugu", label: "Telugu", sub: "Andhra Pradesh · Telangana", emoji: "🌶️" },
  { id: "tamil", label: "Tamil", sub: "Tamil Nadu", emoji: "🌺" },
  { id: "kerala", label: "Kerala", sub: "Kerala", emoji: "🌴" },
  { id: "bangalore", label: "Bangalore", sub: "Karnataka · Bangalore", emoji: "🌸" },
];

export const DIETS: readonly Choice<DietId>[] = [
  { id: "vegetarian", label: "Vegetarian", sub: "Plant-based, with dairy", emoji: "🥗" },
  { id: "non-vegetarian", label: "Non-vegetarian", sub: "Includes eggs, fish & meat", emoji: "🍗" },
  { id: "vegan", label: "Vegan", sub: "No animal products", emoji: "🌿" },
];

export const APPROACHES: readonly Choice<ApproachId>[] = [
  { id: "both", label: "A little of each", sub: "Everyday habits + Ayurvedic rituals", emoji: "☯️" },
  { id: "modern", label: "Modern", sub: "Everyday habits only", emoji: "🔬" },
  { id: "ayurvedic", label: "Ayurvedic", sub: "Lean into traditional rituals", emoji: "🍃" },
];

export const AUDIENCES: readonly Choice<AudienceId>[] = [
  { id: "everyone", label: "Keep it general", sub: "Tips for everyone", emoji: "✨" },
  { id: "women", label: "Women's notes", sub: "Add women's health notes", emoji: "♀" },
  { id: "men", label: "Men's notes", sub: "Add men's health notes", emoji: "♂" },
];

export const DEFAULT_PREFS = {
  region: "pan-indian",
  diet: "vegetarian",
  approach: "both",
  audience: "everyone",
} as const satisfies { region: RegionId; diet: DietId; approach: ApproachId; audience: AudienceId };

export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

export const MEAL_SLOTS: readonly { id: MealSlot; label: string; time: string; emoji: string }[] = [
  { id: "early", label: "Early morning", time: "5:30", emoji: "🌅" },
  { id: "breakfast", label: "Breakfast", time: "8:00", emoji: "🍳" },
  { id: "midMorning", label: "Mid-morning", time: "10:30", emoji: "🍎" },
  { id: "lunch", label: "Lunch", time: "13:00", emoji: "🍛" },
  { id: "snack", label: "Evening snack", time: "16:30", emoji: "💪" },
  { id: "dinner", label: "Dinner", time: "19:00", emoji: "🌙" },
];

// ── Weekly movement (artifact EXERCISE_PLAN, Monday → Sunday) ─────────────────
export const EXERCISE_PLAN: readonly ExerciseDay[] = [
  { title: "Brisk walk + Anulom Vilom", detail: "A 45-minute brisk walk, then 10 minutes of Anulom Vilom.", minutes: 55 },
  { title: "Walk + Surya Namaskar", detail: "A 45-minute walk and 15 minutes of yoga with five rounds of Surya Namaskar.", minutes: 60 },
  { title: "Cycle or swim", detail: "30 minutes of cycling or swimming, a few flights of stairs, then Bhramari breath.", minutes: 40 },
  { title: "Bodyweight strength", detail: "30 minutes of squats, push-ups and lunges, then an easy 20-minute walk.", minutes: 50 },
  { title: "Nature walk + stretches", detail: "A 45-minute outdoor walk, a seated forward bend and gentle spinal twists.", minutes: 55 },
  { title: "Play day", detail: "An hour of active fun: a hike, a sport or dance. Try not to sit for more than 30 minutes at a stretch.", minutes: 60 },
  { title: "Gentle yoga + walk", detail: "30 minutes of gentle yoga, a 30-minute walk and a longer meditation.", minutes: 60 },
];

// ── Activities per phase ──────────────────────────────────────────────────────
export const HERB_NOTE =
  "Traditional herbs aren't right for everyone. Check with your doctor first if you're pregnant, breastfeeding, take medication or manage a health condition.";

export const ACTIVITIES: readonly Activity[] = [
  // Dawn · 5–7
  {
    id: "dawn-warm-water",
    phase: "dawn",
    kind: "ritual",
    title: "Warm water, first thing",
    summary: "Two slow glasses of warm water before anything else, then today's early drink.",
    minutes: 5,
    window: [MIN(5), MIN(6, 30)],
    categories: [],
    meal: "early",
    steps: [
      "Sit up slowly and roll your shoulders a few times.",
      "Sip the first glass of warm water. No rush.",
      "Pour the second glass and notice its warmth.",
      "Now today's early drink: {meal}.",
    ],
    focus: {
      sugar: "Soaked methi water is a traditional start to the day.",
      gut: "Warm ginger–ajwain or fennel water are gentle alternatives.",
      cholesterol: "A crushed garlic clove in warm water is a classic kitchen ritual.",
      inflammation: "A pinch of turmeric and black pepper turns it golden.",
      hormonal: "Soaked flaxseeds pair nicely with this.",
      fertility: "Follow it with a few soaked almonds and walnuts.",
    },
    image: img(
      "assets/dawn/warm-water.webp",
      "4:5",
      "dawn",
      "A steel tumbler of warm water with lemon on a windowsill at first light",
      "A steel tumbler of warm water with a slice of lemon and a few soaked fenugreek seeds on a windowsill at first light, thin steam rising",
    ),
  },
  {
    id: "dawn-move",
    phase: "dawn",
    kind: "move",
    title: "Morning movement",
    summary: "Today's movement. Go at a pace where you can still talk.",
    minutes: 45,
    window: [MIN(5, 30), MIN(7)],
    categories: [],
    exercise: true,
    steps: [
      "Today: {exercise}",
      "Warm up with gentle marching and shoulder rolls.",
      "Find a pace where you can talk, but not sing.",
      "Relax your jaw and shoulders. Breathe through your nose.",
      "For the last five minutes, slow down and let your breath settle.",
    ],
    note: "Build up gradually. If you have a heart, joint or blood-pressure condition, ask your doctor what's right for you.",
    image: img(
      "assets/dawn/move.webp",
      "4:5",
      "dawn",
      "A woman walking briskly on a tree-lined path at dawn",
      "A South Asian woman in comfortable cotton clothes walking briskly along a tree-lined path at dawn, light mist, peach sky behind the trees",
    ),
  },
  {
    id: "dawn-soaked-nuts",
    phase: "dawn",
    kind: "ritual",
    title: "Soaked almonds & walnuts",
    summary: "Five soaked almonds, two walnuts and a spoon of pumpkin seeds, eaten slowly.",
    minutes: 3,
    window: [MIN(6), MIN(7)],
    categories: ["cholesterol", "fertility", "inflammation", "sugar"],
    steps: [
      "Slip the skins off the soaked almonds if you like.",
      "Eat slowly and chew well.",
      "Finish with a few sips of warm water.",
    ],
    image: img(
      "assets/dawn/soaked-nuts.webp",
      "4:5",
      "dawn",
      "A brass bowl of soaked almonds, walnuts and pumpkin seeds",
      "A small brass bowl of soaked almonds with skins slipping off, walnut halves and pumpkin seeds on a white cotton cloth, soft dawn window light",
    ),
  },
  {
    id: "dawn-sunrise-breath",
    phase: "dawn",
    kind: "breathe",
    title: "Sunrise breathing",
    summary: "Six slow breaths a minute while the sky changes colour.",
    minutes: 5,
    window: [MIN(5), MIN(7)],
    categories: ["hormonal", "inflammation", "fertility"],
    breath: { inhale: 5, exhale: 5 },
    steps: [
      "Sit tall with your hands resting on your knees.",
      "Breathe in for five, out for five.",
      "Let each exhale be a little softer than the last.",
      "Watch the light change.",
    ],
    image: img(
      "assets/dawn/sunrise-breath.webp",
      "4:5",
      "dawn",
      "A man sitting cross-legged on a rooftop at sunrise, eyes closed",
      "A South Asian man sitting cross-legged on a rooftop at sunrise with eyes closed and relaxed posture, lilac and peach sky",
    ),
  },

  // Morning · 7–11
  {
    id: "morning-light",
    phase: "morning",
    kind: "light",
    title: "Twenty minutes of morning light",
    summary: "Step outside. A balcony, a doorstep or a short stroll all count.",
    minutes: 20,
    window: [MIN(7), MIN(9)],
    categories: ["hormonal", "fertility", "inflammation"],
    steps: [
      "Step outside, or sit by an open window.",
      "Let the light reach your face and arms.",
      "Keep your phone in your pocket for these minutes.",
      "Notice three things you can hear.",
    ],
    image: img(
      "assets/morning/light.webp",
      "4:5",
      "morning",
      "A woman on a balcony with tea, face turned to the morning sun",
      "A South Asian woman standing on a balcony holding a cup of tea, face turned towards warm morning sun, potted marigolds on the ledge",
    ),
  },
  {
    id: "morning-breakfast",
    phase: "morning",
    kind: "meal",
    title: "Breakfast",
    summary: "Sit down for it. Twenty unhurried minutes.",
    minutes: 20,
    window: [MIN(7, 30), MIN(9, 30)],
    categories: [],
    meal: "breakfast",
    steps: [
      "Today: {meal}.",
      "Sit down. No screens for this meal.",
      "Take three slow breaths before the first bite.",
      "Put the spoon down between bites.",
      "Stop when you feel comfortably satisfied.",
    ],
    focus: {
      sugar: "Start with the protein and vegetables; save the grains for last.",
      cholesterol: "Keep the oil light. A teaspoon goes a long way.",
      gut: "A small bowl of curd on the side is a classic pairing.",
      hormonal: "Add a spoon of ground flaxseed if you enjoy it.",
      fertility: "A few pumpkin seeds make a good topping.",
      inflammation: "A pinch of turmeric and black pepper in the tadka.",
    },
    image: img(
      "assets/morning/breakfast.webp",
      "4:5",
      "morning",
      "A home-cooked breakfast of vegetable upma with a bowl of curd",
      "A home-cooked Indian breakfast of vegetable oats upma with a small bowl of curd on a brass plate, gentle steam, warm morning light on a wooden table",
    ),
  },
  {
    id: "morning-surya",
    phase: "morning",
    kind: "move",
    title: "Five rounds of Surya Namaskar",
    summary: "Five slow sun salutations to wake up the whole body.",
    minutes: 10,
    window: [MIN(7), MIN(8, 30)],
    categories: ["sugar", "hormonal", "inflammation"],
    steps: [
      "Stand tall, palms together at your chest.",
      "Move with your breath: inhale to lengthen, exhale to fold.",
      "Go slowly and bend your knees whenever you need to.",
      "Finish standing still for three breaths.",
    ],
    note: "Skip anything that hurts. If you're pregnant or have back, knee or blood-pressure concerns, ask your doctor which poses suit you.",
    image: img(
      "assets/morning/surya.webp",
      "4:5",
      "morning",
      "A man doing a sun salutation on a sunlit terrace",
      "A South Asian man mid sun salutation on a cotton yoga mat on a sunlit terrace, arms raised, warm golden morning light",
    ),
  },
  {
    id: "morning-mid-bite",
    phase: "morning",
    kind: "meal",
    title: "Mid-morning bite",
    summary: "A small, fresh bite to carry you to lunch.",
    minutes: 10,
    window: [MIN(10), MIN(11)],
    categories: [],
    meal: "midMorning",
    steps: [
      "Today: {meal}.",
      "Pause what you're doing and step away from your desk.",
      "Eat slowly.",
      "Finish with a glass of water.",
    ],
    image: img(
      "assets/morning/mid-bite.webp",
      "4:5",
      "morning",
      "A small plate of guava, amla and walnuts on a desk by a window",
      "A small ceramic plate of guava slices, fresh amla and a few walnuts on a wooden desk by a window, late-morning light",
    ),
  },

  // Midday · 11–14
  {
    id: "midday-lunch",
    phase: "midday",
    kind: "meal",
    title: "Lunch",
    summary: "The main meal of your day. Make half the plate vegetables.",
    minutes: 25,
    window: [MIN(12, 30), MIN(14)],
    categories: [],
    meal: "lunch",
    steps: [
      "Today: {meal}.",
      "Fill half the plate with vegetables and salad.",
      "A quarter with dal, paneer, tofu, eggs or fish.",
      "A quarter with rice, roti or millet.",
      "Eat the salad first, slowly.",
    ],
    focus: {
      sugar: "Try this order: salad, then dal or sabzi, then rice or roti.",
      gut: "A bowl of homemade curd or buttermilk fits well here.",
      cholesterol: "Cook with mustard or olive oil and go easy on ghee.",
      inflammation: "Finish with a squeeze of lemon and fresh coriander.",
      hormonal: "Stir sesame or ground flaxseed into the raita.",
      fertility: "Aim for colourful vegetables and a good portion of protein.",
    },
    image: img(
      "assets/midday/lunch.webp",
      "4:5",
      "midday",
      "A balanced lunch thali with brown rice, sambar, vegetables and raita",
      "A balanced South Indian lunch on a banana leaf: brown rice, sambar, vegetable poriyal, cucumber raita and salad, bright clear daylight",
    ),
  },
  {
    id: "midday-curd",
    phase: "midday",
    kind: "ritual",
    title: "A bowl of homemade curd",
    summary: "Plain curd or buttermilk with lunch, a traditional companion.",
    minutes: 5,
    window: [MIN(12), MIN(14)],
    categories: ["gut"],
    steps: [
      "Plain and unsweetened is best.",
      "Add roasted jeera and a pinch of salt if you like.",
      "Enjoy it with lunch or just after.",
    ],
    dietNote: { vegan: "Vegan? Coconut yoghurt works well here." },
    image: img(
      "assets/midday/curd.webp",
      "4:5",
      "midday",
      "A clay bowl of homemade curd and a glass of spiced buttermilk",
      "A clay bowl of thick homemade curd and a glass of spiced buttermilk with curry leaves and roasted cumin on a stone surface, bright midday light",
    ),
  },
  {
    id: "midday-walk",
    phase: "midday",
    kind: "move",
    title: "Ten-minute walk after lunch",
    summary: "A short, easy walk once you've eaten. Stairs count too.",
    minutes: 10,
    window: [MIN(13), MIN(14)],
    categories: ["sugar", "cholesterol", "gut"],
    steps: [
      "Head out within 15 minutes of finishing your meal.",
      "Keep it easy. This isn't a workout.",
      "Swing your arms and breathe through your nose.",
      "Back to your day, a little lighter.",
    ],
    image: img(
      "assets/midday/walk.webp",
      "4:5",
      "midday",
      "An office worker taking an easy walk in a sunny courtyard",
      "A South Asian office worker taking an easy walk through a sunny courtyard with neem trees after lunch, relaxed stride, clear sky",
    ),
  },
  {
    id: "midday-reset",
    phase: "midday",
    kind: "breathe",
    title: "Two-minute desk reset",
    summary: "Stand, stretch and breathe before the afternoon.",
    minutes: 3,
    window: [MIN(11), MIN(13)],
    categories: ["inflammation", "hormonal"],
    breath: { inhale: 4, exhale: 6 },
    steps: [
      "Stand up and reach both arms overhead.",
      "Twist gently to the left, then to the right.",
      "Breathe in for four, out for six.",
      "Let your shoulders drop away from your ears.",
    ],
    image: img(
      "assets/midday/reset.webp",
      "4:5",
      "midday",
      "A woman stretching her arms overhead beside her desk",
      "A South Asian woman stretching her arms overhead beside her desk near a bright window with green plants, calm expression, midday light",
    ),
  },

  // Afternoon · 14–17
  {
    id: "afternoon-snack",
    phase: "afternoon",
    kind: "meal",
    title: "Protein snack",
    summary: "A small, protein-rich snack to carry you into the evening.",
    minutes: 10,
    window: [MIN(16), MIN(17)],
    categories: [],
    meal: "snack",
    steps: [
      "Today: {meal}.",
      "Serve it in a small bowl rather than eating from the pack.",
      "Sit down while you eat.",
      "Pair it with water or an unsweetened tea.",
    ],
    image: img(
      "assets/afternoon/snack.webp",
      "4:5",
      "afternoon",
      "A steel bowl of roasted chana and a glass of cumin water",
      "A small steel bowl of roasted chana and a glass of cumin water on a wooden table, soft afternoon light through leaves",
    ),
  },
  {
    id: "afternoon-tea",
    phase: "afternoon",
    kind: "ritual",
    title: "Herbal tea pause",
    summary: "A warm, caffeine-free cup and five quiet minutes.",
    minutes: 7,
    window: [MIN(15), MIN(16, 30)],
    categories: [],
    steps: [
      "Brew your cup and let it cool a little.",
      "Hold it with both hands.",
      "Sip slowly, away from your screen.",
      "Notice how your shoulders feel.",
    ],
    focus: {
      cholesterol: "Hibiscus tea is a lovely choice.",
      sugar: "Try warm cinnamon water.",
      hormonal: "Spearmint tea suits this pause.",
      gut: "Fennel (saunf) tea is a gentle favourite.",
      inflammation: "Tulsi and ginger kadha, lightly spiced.",
      fertility: "Tulsi tea with a little fresh ginger.",
    },
    image: img(
      "assets/afternoon/tea.webp",
      "4:5",
      "afternoon",
      "A glass cup of herbal tea with tulsi leaves and a cinnamon stick",
      "A glass cup of herbal tea with fresh tulsi leaves and a cinnamon stick on a wooden table, afternoon light through leaves, sage tones",
    ),
  },
  {
    id: "afternoon-move",
    phase: "afternoon",
    kind: "move",
    title: "Five-minute movement break",
    summary: "Stand up and move. Try not to sit for more than 30 minutes.",
    minutes: 5,
    window: [MIN(14), MIN(17)],
    categories: ["sugar", "inflammation", "cholesterol"],
    steps: [
      "Stand up and walk to the farthest window.",
      "Ten slow sit-to-stands from your chair.",
      "Ten calf raises.",
      "Shake out your hands and shoulders.",
    ],
    image: img(
      "assets/afternoon/move.webp",
      "4:5",
      "afternoon",
      "A man doing bodyweight squats in a bright living room",
      "A South Asian man doing slow bodyweight squats in a bright living room with plants, relaxed focus, clear afternoon light",
    ),
  },
  {
    id: "afternoon-water",
    phase: "afternoon",
    kind: "ritual",
    title: "Refill your water",
    summary: "A glass of warm or room-temperature water, sipped slowly.",
    minutes: 2,
    window: [MIN(14), MIN(16)],
    categories: ["gut", "sugar"],
    steps: ["Fill a glass with warm or room-temperature water.", "Sip it slowly, standing by a window.", "Refill your bottle for the evening."],
    image: img(
      "assets/afternoon/water.webp",
      "4:5",
      "afternoon",
      "A copper water bottle and a glass of water on a sunlit desk",
      "A copper water bottle and a clear glass of water on a sunlit desk beside a small potted plant, afternoon light, sage and sky tones",
    ),
  },

  // Evening · 17–20
  {
    id: "evening-anulom",
    phase: "evening",
    kind: "breathe",
    title: "Anulom Vilom, ten minutes",
    summary: "Alternate-nostril breathing to close the busy part of the day.",
    minutes: 10,
    window: [MIN(17, 30), MIN(19)],
    categories: [],
    breath: { inhale: 4, exhale: 6 },
    steps: [
      "Sit tall and rest your left hand on your knee.",
      "Close your right nostril with your thumb and breathe in through the left.",
      "Close the left and breathe out through the right.",
      "Breathe in through the right, switch, breathe out through the left. That's one round.",
      "Keep it smooth and quiet. Never strain.",
    ],
    note: "Breathe gently, never force or hold the breath, and stop if you feel dizzy.",
    image: img(
      "assets/evening/anulom.webp",
      "4:5",
      "evening",
      "A woman practising alternate-nostril breathing at dusk",
      "A South Asian woman practising alternate-nostril breathing, seated on a floor cushion at dusk beside a warm amber lamp, calm face",
    ),
  },
  {
    id: "evening-dinner",
    phase: "evening",
    kind: "meal",
    title: "Dinner by 7:30",
    summary: "A lighter dinner, finished by 7:30. Then the kitchen closes.",
    minutes: 25,
    window: [MIN(18, 30), MIN(19, 30)],
    categories: [],
    meal: "dinner",
    steps: [
      "Today: {meal}.",
      "Keep it lighter than lunch.",
      "Eat slowly, sitting down.",
      "Aim to finish by 7:30.",
      "Afterwards, the kitchen is closed. Water or herbal tea only.",
    ],
    focus: {
      sugar: "Finishing early leaves a long, calm overnight break from food.",
      gut: "Warm, cooked food is gentle in the evening.",
      cholesterol: "Go easy on fried sides and cream-based gravies.",
      inflammation: "Plenty of vegetables, lightly spiced with turmeric.",
      hormonal: "A steady dinner time helps the evening feel settled.",
      fertility: "Include a good portion of dal, paneer, tofu, eggs or fish.",
    },
    image: img(
      "assets/evening/dinner.webp",
      "4:5",
      "evening",
      "A light dinner of moong dal khichdi, bajra roti and sabzi",
      "A light Indian dinner of moong dal khichdi, a bajra roti and a bowl of sabzi in steel bowls, warm amber evening light on a wooden table",
    ),
  },
  {
    id: "evening-bhramari",
    phase: "evening",
    kind: "breathe",
    title: "Bhramari, the humming breath",
    summary: "Five minutes of soft humming on every exhale.",
    minutes: 5,
    window: [MIN(18), MIN(20)],
    categories: ["hormonal", "fertility", "inflammation"],
    breath: { inhale: 4, exhale: 6 },
    steps: [
      "Sit comfortably and close your eyes.",
      "Breathe in through your nose.",
      "Breathe out with a soft, steady hum, like a bee.",
      "Feel the gentle buzz in your face and head.",
      "Rest for a few natural breaths at the end.",
    ],
    image: img(
      "assets/evening/bhramari.webp",
      "4:5",
      "evening",
      "A man with eyes closed practising humming breath at dusk",
      "A South Asian man seated with eyes closed, fingertips resting lightly over his ears, practising humming breath at dusk, rose and amber tones",
    ),
  },
  {
    id: "evening-stroll",
    phase: "evening",
    kind: "move",
    title: "Easy stroll after dinner",
    summary: "Ten gentle minutes on your feet after eating.",
    minutes: 10,
    window: [MIN(19), MIN(20)],
    categories: ["sugar", "gut"],
    steps: [
      "Walk at an easy, chatting pace.",
      "Leave the phone in your pocket.",
      "Look up and notice the sky.",
      "Home, and start winding down.",
    ],
    image: img(
      "assets/evening/stroll.webp",
      "4:5",
      "evening",
      "An older couple strolling down a quiet lane at dusk",
      "An older South Asian couple taking an unhurried evening stroll down a quiet tree-lined lane at dusk, street lamps just glowing, amber sky",
    ),
  },

  // Night · 20–5
  {
    id: "night-golden-milk",
    phase: "night",
    kind: "ritual",
    title: "Warm golden milk",
    summary: "Warm milk with turmeric and a pinch of black pepper, a traditional bedtime cup.",
    minutes: 10,
    window: [MIN(20, 30), MIN(21, 30)],
    categories: ["inflammation", "hormonal", "fertility"],
    approach: ["both", "ayurvedic"],
    steps: [
      "Warm the milk gently. Don't let it boil over.",
      "Stir in a pinch of turmeric and black pepper.",
      "Sip slowly, somewhere calm.",
      "Let this be your last cup of the day, apart from water.",
    ],
    audienceNote: {
      women: "In Ayurveda, shatavari is a traditional addition to this cup.",
      men: "In Ayurveda, ashwagandha is a traditional addition to this cup.",
    },
    dietNote: { vegan: "Vegan? Use oat, almond or soy milk." },
    note: HERB_NOTE,
    image: img(
      "assets/night/golden-milk.webp",
      "4:5",
      "night",
      "A steel cup of golden turmeric milk beside a small brass lamp",
      "A steel cup of warm golden turmeric milk on a wooden bedside table next to a small glowing brass lamp, indigo window at night",
    ),
  },
  {
    id: "night-wind-down",
    phase: "night",
    kind: "rest",
    title: "Screens down, lights low",
    summary: "Dim the lights and put your phone to bed an hour before you go.",
    minutes: 15,
    window: [MIN(21), MIN(22)],
    categories: [],
    steps: [
      "Dim the lights around you.",
      "Set tomorrow's alarm, then place your phone away from the bed.",
      "Stretch gently for a minute.",
      "Write one line about today.",
    ],
    image: img(
      "assets/night/wind-down.webp",
      "4:5",
      "night",
      "A calm bedroom at night with a phone face-down and a journal",
      "A calm bedroom at night, a phone lying face-down on a wooden shelf, a softly glowing lamp and an open journal with a pen, indigo tones",
    ),
  },
  {
    id: "night-yoga-nidra",
    phase: "night",
    kind: "rest",
    title: "Yoga nidra, 20 minutes",
    summary: "Lie down and let a slow body scan carry you towards sleep.",
    minutes: 20,
    window: [MIN(21), MIN(22, 30)],
    categories: ["hormonal", "inflammation", "fertility"],
    breath: { inhale: 5, exhale: 5 },
    steps: [
      "Lie on your back and let your feet fall open.",
      "Bring your attention to your right hand, then your left.",
      "Move slowly through your whole body, part by part.",
      "Notice your breath without changing it.",
      "Rest here. There's nothing to do.",
    ],
    image: img(
      "assets/night/yoga-nidra.webp",
      "4:5",
      "night",
      "A woman resting on a yoga mat under a soft blanket in dim light",
      "A South Asian woman resting on her back on a yoga mat under a soft blanket, eyes closed, dim warm lamp at night, deep teal tones",
    ),
  },
  {
    id: "night-triphala",
    phase: "night",
    kind: "ritual",
    title: "Triphala at bedtime",
    summary: "A traditional Ayurvedic evening ritual: triphala stirred into warm water.",
    minutes: 3,
    window: [MIN(21), MIN(22)],
    categories: ["gut", "cholesterol"],
    approach: ["ayurvedic", "both"],
    steps: ["Stir it into a glass of warm water.", "Sip slowly.", "Rinse your mouth afterwards."],
    note: HERB_NOTE,
    image: img(
      "assets/night/triphala.webp",
      "4:5",
      "night",
      "A brass bowl of triphala powder and a glass of warm water on a tray",
      "A small brass bowl of triphala powder and a glass of warm water on a wooden tray lit by a single candle at night",
    ),
  },
  {
    id: "night-sleep",
    phase: "night",
    kind: "rest",
    title: "Lights out by 10:30",
    summary: "Aim for seven to eight hours, with the same bedtime most nights.",
    minutes: 5,
    window: [MIN(22), MIN(29)],
    categories: [],
    breath: { inhale: 4, exhale: 6 },
    steps: [
      "A cool, dark, quiet room.",
      "Breathe out for longer than you breathe in.",
      "If your mind is busy, name five things you're grateful for.",
      "Goodnight.",
    ],
    image: img(
      "assets/night/sleep.webp",
      "4:5",
      "night",
      "A serene bedroom at night with moonlight through the window",
      "A serene bedroom at night with rumpled linen bedding, moonlight through a window and a small jasmine sprig on the bedside, deep indigo",
    ),
  },
];

// ── Tips (claim-free rewrites of the artifact's tips and food lists) ──────────
export const TIPS: readonly Tip[] = [
  // Everyday
  { id: "all-same-times", category: "all", kind: "habit", icon: "🕰️", title: "Same times, most days", body: "Eating, moving and sleeping at roughly the same times each day makes good habits feel automatic." },
  { id: "all-plate", category: "all", kind: "food", icon: "🍽️", title: "The plate picture", body: "Half vegetables, a quarter protein, a quarter grains. An easy picture to carry to every meal." },
  { id: "all-kitchen-closes", category: "all", kind: "habit", icon: "🌙", title: "Close the kitchen early", body: "Finishing dinner by about 7:30 PM leaves a long, calm overnight break from food." },
  { id: "all-long-exhale", category: "all", kind: "mind", icon: "🌬️", title: "Breathe out longer", body: "When things feel rushed, make each exhale longer than the inhale for a minute or two." },
  { id: "all-last-hour", category: "all", kind: "rest", icon: "📵", title: "Protect the last hour", body: "Dim the screens and lights in the hour before bed, and let the day wind down on its own." },
  { id: "all-checkups", category: "all", kind: "care", icon: "🩺", title: "Keep your check-ups", body: "Regular check-ups with your doctor are the best way to see how you're really doing over time." },

  // Cholesterol
  { id: "chol-oil", category: "cholesterol", kind: "food", icon: "🥄", title: "Measure the oil", body: "Cook with mustard, sesame or olive oil, and measure it by the teaspoon. About three across the day is a sensible ceiling." },
  { id: "chol-grains", category: "cholesterol", kind: "food", icon: "🥣", title: "Oats, barley & dal", body: "Build breakfasts and lunches around oats, barley, rajma, chickpeas and moong dal." },
  { id: "chol-nuts", category: "cholesterol", kind: "food", icon: "🌰", title: "A small handful of nuts", body: "A few walnuts and almonds make an easy, satisfying snack most days." },
  { id: "chol-ease", category: "cholesterol", kind: "food", icon: "🍟", title: "Go easy on", body: "Fried snacks, packaged namkeen, cream-based curries, vanaspati, and generous butter or ghee." },
  { id: "chol-walk", category: "cholesterol", kind: "move", icon: "🚶", title: "Walk most days", body: "A brisk 45-minute walk most days, plus a little strength work, is a simple foundation." },
  { id: "chol-smoke", category: "cholesterol", kind: "care", icon: "🚭", title: "If you smoke", body: "Stopping is one of the most helpful things you can do for your heart. Your doctor can help you plan it." },
  { id: "chol-recheck", category: "cholesterol", kind: "care", icon: "📊", title: "Recheck, don't guess", body: "If you're working on your cholesterol, ask your doctor when to repeat your lipid profile." },

  // Blood sugar
  { id: "sugar-order", category: "sugar", kind: "food", icon: "🥗", title: "Order your plate", body: "Start with salad and vegetables, move on to dal or sabzi, and finish with rice or roti." },
  { id: "sugar-walk", category: "sugar", kind: "move", icon: "🚶", title: "Ten minutes after meals", body: "A short, easy walk after eating is a simple habit that costs nothing." },
  { id: "sugar-millets", category: "sugar", kind: "food", icon: "🌾", title: "Swap in millets", body: "Try ragi, jowar or bajra rotis and brown rice in place of maida and white rice on some days." },
  { id: "sugar-ease", category: "sugar", kind: "food", icon: "🍬", title: "Go easy on", body: "Sweetened tea and coffee, packaged juices, mithai, maida, white bread and instant noodles." },
  { id: "sugar-regular", category: "sugar", kind: "habit", icon: "⏰", title: "Don't skip meals", body: "Regular, moderate meals are easier to manage than long gaps followed by one big meal." },
  { id: "sugar-muscle", category: "sugar", kind: "move", icon: "💪", title: "Build a little muscle", body: "Two or three short strength sessions a week (squats, lunges, push-ups) are well worth the effort." },
  { id: "sugar-sleep", category: "sugar", kind: "rest", icon: "😴", title: "Sleep is part of the plan", body: "Seven to eight hours of sleep belongs in the plan, not as a reward at the end of it." },

  // Fertility
  { id: "fert-colour", category: "fertility", kind: "food", icon: "🥬", title: "Colourful plates", body: "Leafy greens, lentils, seeds, pomegranate and seasonal fruit keep meals varied and nourishing." },
  { id: "fert-cool", category: "fertility", audience: "men", kind: "habit", icon: "🌡️", title: "Keep things cool", body: "Avoid resting a laptop on your lap or long, very hot baths, and choose loose, breathable clothing." },
  { id: "fert-cycle", category: "fertility", audience: "women", kind: "habit", icon: "📅", title: "Get to know your cycle", body: "Tracking your cycle helps you learn your own rhythm. Your doctor can help you read it." },
  { id: "fert-calm", category: "fertility", kind: "mind", icon: "🧘", title: "Make room for calm", body: "Daily breathing practice, walks and time offline help keep stress in its place." },
  { id: "fert-glass", category: "fertility", kind: "habit", icon: "♻️", title: "Glass and steel", body: "Store and reheat food in glass or steel rather than plastic." },
  { id: "fert-rest", category: "fertility", kind: "rest", icon: "😴", title: "Rest is part of it", body: "A regular bedtime and seven to eight hours of sleep make every other habit easier." },
  { id: "fert-specialist", category: "fertility", kind: "care", icon: "🩺", title: "Ask for guidance", body: "If you've been trying for a while, a fertility specialist can walk you through your options." },

  // Hormonal balance
  { id: "horm-cycle-food", category: "hormonal", audience: "women", kind: "food", icon: "🌙", title: "Cycle-aware snacks", body: "Notice when cravings or low moods tend to arrive in your cycle, and plan nourishing snacks for those days." },
  { id: "horm-bedtime", category: "hormonal", kind: "rest", icon: "🛏️", title: "An early, steady bedtime", body: "Lights out around 10:30 on most nights is one of the simplest rhythms to protect." },
  { id: "horm-pranayama", category: "hormonal", kind: "mind", icon: "🧘", title: "Ten minutes of pranayama", body: "Anulom Vilom or Bhramari makes a calm anchor in a busy day." },
  { id: "horm-seeds", category: "hormonal", kind: "food", icon: "🌱", title: "Seeds and greens", body: "Flaxseed, sesame, pumpkin seeds, leafy greens and lentils are easy to add to everyday meals." },
  { id: "horm-simple-care", category: "hormonal", kind: "habit", icon: "🧴", title: "Keep it simple", body: "Choose simple personal-care products, and avoid heating food in plastic containers." },
  { id: "horm-light", category: "hormonal", kind: "habit", icon: "☀️", title: "Morning light", body: "Twenty minutes outdoors in the morning is a gentle way to set the day's rhythm." },
  { id: "horm-doctor", category: "hormonal", kind: "care", icon: "🩺", title: "Get it checked", body: "Irregular cycles, thyroid symptoms or PCOS worries deserve a proper conversation with your doctor." },

  // Gut health
  { id: "gut-chew", category: "gut", kind: "habit", icon: "🍽️", title: "Chew slowly", body: "Aim for 20–30 chews a bite. Slower meals are calmer meals." },
  { id: "gut-ferment", category: "gut", kind: "food", icon: "🥛", title: "Fermented favourites", body: "Idli, dosa, dhokla, homemade curd and kanji are easy ways to enjoy fermented foods." },
  { id: "gut-warm-water", category: "gut", kind: "habit", icon: "💧", title: "Warm water", body: "Sip warm or room-temperature water through the day." },
  { id: "gut-times", category: "gut", kind: "habit", icon: "⏰", title: "Regular meal times", body: "Eating at consistent times gives your whole day a steadier rhythm." },
  { id: "gut-saunf", category: "gut", kind: "food", icon: "🌿", title: "Saunf after meals", body: "Chewing a little fennel after a meal is a pleasant traditional habit." },
  { id: "gut-ease", category: "gut", kind: "food", icon: "🥤", title: "Go easy on", body: "Fizzy drinks, artificial sweeteners and heavily processed or fried food." },
  { id: "gut-fibre", category: "gut", kind: "food", icon: "🌾", title: "Fibre from real food", body: "Vegetables, dal, whole grains and fruit. Try to include some at every meal." },

  // Inflammation
  { id: "inf-turmeric", category: "inflammation", kind: "food", icon: "🟡", title: "Turmeric and pepper", body: "Add turmeric with a pinch of black pepper to dals and sabzis. It's a classic pairing." },
  { id: "inf-ginger", category: "inflammation", kind: "food", icon: "🍵", title: "Ginger in everything", body: "Fresh ginger in tea, dal and chutneys adds warmth and flavour." },
  { id: "inf-omega", category: "inflammation", kind: "food", icon: "🐟", title: "Walnuts, flax and chia", body: "Include walnuts, flaxseed or chia most days, or fish such as mackerel if you eat it." },
  { id: "inf-sleep", category: "inflammation", kind: "rest", icon: "😴", title: "Protect your sleep", body: "A consistent seven to eight hours is one of the kindest things you can do for yourself." },
  { id: "inf-moderate", category: "inflammation", kind: "move", icon: "🚶", title: "Moderate is the sweet spot", body: "Walking and yoga most days. Balance harder sessions with easy days." },
  { id: "inf-ease", category: "inflammation", kind: "food", icon: "🍩", title: "Go easy on", body: "Vanaspati and trans fats, refined sugar, maida, processed meats and deep-fried snacks." },
  { id: "inf-nidra", category: "inflammation", kind: "mind", icon: "🧘", title: "Try yoga nidra", body: "A 20–30 minute yoga nidra session is a deeply restful way to end the day." },

  // From the original app's per-goal tips (women's / men's notes), rewritten claim-free
  { id: "chol-cardio-weights", category: "cholesterol", audience: "women", kind: "move", icon: "🏋️", title: "Cardio plus weights", body: "Mix 30 minutes of brisk cardio with 20 minutes of strength work, three times a week." },
  { id: "chol-menopause", category: "cholesterol", audience: "women", kind: "care", icon: "🌸", title: "Around menopause", body: "Cholesterol often rises around menopause. It's a good time to check it every year and pay extra attention to fats and fibre." },
  { id: "chol-lift", category: "cholesterol", audience: "men", kind: "move", icon: "💪", title: "Walk, then lift", body: "A daily brisk walk, plus two short strength sessions a week, is a strong routine to build on." },
  { id: "sugar-pcos", category: "sugar", audience: "women", kind: "care", icon: "🌸", title: "PCOS and blood sugar", body: "PCOS is common and often comes with blood-sugar changes. Slow carbs, regular meals and movement all help. Your doctor can guide testing." },
  { id: "sugar-early-dinner", category: "sugar", audience: "men", kind: "habit", icon: "🕖", title: "Early dinner", body: "Finish dinner by about 7:30 PM, and keep it lighter than lunch." },
  { id: "fert-timing", category: "fertility", kind: "habit", icon: "🗓️", title: "Every two to three days", body: "Regular sex every two to three days through the month covers the fertile window without the stress of timing it." },
  { id: "fert-folic", category: "fertility", audience: "women", kind: "care", icon: "💊", title: "Folic acid first", body: "400 mcg of folic acid a day, ideally from three months before trying. Ask your doctor whether you need a higher dose." },
  { id: "fert-three-months", category: "fertility", audience: "men", kind: "habit", icon: "⏳", title: "Give it three months", body: "Sperm take roughly three months to develop, so give healthy changes at least that long." },
  { id: "fert-no-boosters", category: "fertility", audience: "men", kind: "care", icon: "🚫", title: "Skip testosterone boosters", body: "Testosterone and anabolic steroids can switch off sperm production. If you're trying for a baby, avoid them and talk to your doctor." },
  { id: "horm-waist", category: "hormonal", audience: "men", kind: "care", icon: "📏", title: "Keep an eye on your waist", body: "For men, a waistline creeping past about 90 cm (36 in) is worth a conversation with your doctor." },
  { id: "horm-strength", category: "hormonal", kind: "move", icon: "💪", title: "Strength twice a week", body: "Two short strength sessions a week (squats, lunges, push-ups) suit every stage of life." },
  { id: "gut-stress", category: "gut", kind: "mind", icon: "🌬️", title: "Slow down before you eat", body: "Busy, stressful days often upset digestion. Three slow breaths before a meal help you arrive at the table." },
  { id: "gut-cycle-bloat", category: "gut", audience: "women", kind: "food", icon: "🌿", title: "Bloating that comes and goes", body: "If bloating follows your cycle, warm fennel water and gentle walks are simple comforts." },
  { id: "inf-sun", category: "inflammation", kind: "habit", icon: "🌞", title: "Twenty minutes of sun", body: "Morning daylight is pleasant and helps your body make vitamin D. Ask your doctor about a test if you're mostly indoors." },
  { id: "inf-autoimmune", category: "inflammation", audience: "women", kind: "care", icon: "🩺", title: "Mention the patterns", body: "Autoimmune conditions are more common in women. Tell your doctor about joint pain, tiredness or rashes that keep coming back." },
];

// ── Tricks & remedies (the original app's goal remedies, rewritten) ───────────
/**
 * The original app's per-goal remedies (Both / Modern / Ayurvedic × men / women),
 * rewritten as plain suggestions without health claims. Items with a known safety
 * concern (shilajit, guggul, kapikacchu, daily neem, giloy) were left out.
 * `approach` is the set the item belongs to: "both" = a little of each.
 */
export interface Trick {
  id: string;
  category: CategoryId;
  approach: ApproachId;
  audience?: Exclude<AudienceId, "everyone">;
  icon: string;
  title: string;
  body: string;
  /** Traditional herb or supplement: shown with the check-with-your-doctor note. */
  herb?: boolean;
  caution?: string;
  dietNote?: Partial<Record<DietId, string>>;
}

const VEGAN_CURD = { vegan: "Vegan? Coconut or soy yoghurt works." };
const VEGAN_MILK = { vegan: "Vegan? Use oat, almond or soy milk." };
const MEDS = "If you take medicine for diabetes, ask your doctor first. It can add to the effect.";
const NOT_PREGNANT = "Skip it if you're pregnant or trying to conceive.";

type TrickInput = Omit<Trick, "category" | "approach">;
const tricks = (category: CategoryId, approach: ApproachId, list: TrickInput[]): Trick[] =>
  list.map((t) => ({ ...t, category, approach }));

export const TRICKS: readonly Trick[] = [
  // Cholesterol
  ...tricks("cholesterol", "both", [
    { id: "chol-b-garlic", icon: "🧄", title: "A garlic clove in the morning", body: "Crush one or two cloves into warm water, or add them to your cooking. A classic kitchen habit." },
    { id: "chol-b-flax", icon: "🌰", title: "Ground flaxseed", body: "A tablespoon in roti dough, curd or a smoothie. Grind it first, since whole seeds pass straight through." },
    { id: "chol-b-pomegranate", icon: "🍎", title: "Half a pomegranate", body: "Half a pomegranate or a portion of seasonal fruit makes an easy mid-morning bite." },
    { id: "chol-b-oats", icon: "🥣", title: "Oats by day, isabgol by night", body: "Oats at breakfast, and a teaspoon of isabgol (psyllium) in a full glass of water before dinner.", caution: "Take isabgol a couple of hours apart from any medicines." },
    { id: "chol-b-walnuts", icon: "🌰", title: "Four to six walnuts", body: "A few walnuts most days, as a snack or over breakfast." },
    { id: "chol-b-arjuna", icon: "🌸", title: "Arjuna bark tea", body: "Arjuna bark simmered in water is a traditional Ayurvedic heart tonic.", herb: true },
    { id: "chol-b-amla-arjuna", audience: "women", icon: "🍃", title: "Amla and arjuna kadha", body: "Fresh amla juice with an arjuna decoction, a traditional morning pairing.", herb: true },
  ]),
  ...tricks("cholesterol", "modern", [
    { id: "chol-m-psyllium", icon: "🥣", title: "A spoon of psyllium", body: "A teaspoon of isabgol in a full glass of water before dinner is an easy way to add soluble fibre.", caution: "Drink plenty of water with it, and keep it apart from medicines." },
    { id: "chol-m-omega", icon: "🐟", title: "Walnuts, chia and flax", body: "Some every day, plus oily fish such as mackerel or sardines once or twice a week if you eat fish." },
    { id: "chol-m-acv", icon: "🍎", title: "Apple cider vinegar, diluted", body: "Some people like a teaspoon of apple cider vinegar in a full glass of water before a meal. Never drink it neat, and rinse your mouth afterwards.", caution: "Skip it if you get reflux." },
    { id: "chol-m-colour", icon: "🍇", title: "Colour on the plate", body: "Pomegranate, amla, berries, green tea and leafy greens. Aim for a few colours every day." },
    { id: "chol-m-overnight", icon: "⏱️", title: "A 12-hour overnight break", body: "Dinner by 7:30, breakfast around 7:30. A 12-hour overnight break is easy to keep.", caution: "If you take medicine for diabetes, ask your doctor before changing meal times." },
    { id: "chol-m-soy", audience: "women", icon: "🌱", title: "Flaxseed and a little soy", body: "A spoon of flaxseed and moderate amounts of tofu or soy milk fit easily into the week." },
  ]),
  ...tricks("cholesterol", "ayurvedic", [
    { id: "chol-a-arjuna", icon: "🌸", title: "Arjuna bark tea", body: "Arjuna bark simmered in water, a traditional Ayurvedic heart tonic, taken once or twice a day.", herb: true },
    { id: "chol-a-triphala", icon: "🌿", title: "Triphala at bedtime", body: "A teaspoon of triphala in warm water before bed.", herb: true },
    { id: "chol-a-garlic-honey", icon: "🧄", title: "Garlic and honey", body: "Two crushed garlic cloves with half a teaspoon of honey on an empty stomach, a traditional morning ritual." },
    { id: "chol-a-amla", icon: "🍃", title: "Amla every day", body: "A fresh amla, or amla powder stirred into warm water." },
    { id: "chol-a-shatavari", audience: "women", icon: "🌸", title: "Arjuna with shatavari", body: "In Ayurveda, arjuna for the heart is often paired with shatavari for women.", herb: true },
    { id: "chol-a-hibiscus", audience: "women", icon: "🌺", title: "Amla and hibiscus tea", body: "Amla juice in the morning and a cup of hibiscus tea in the afternoon.", caution: NOT_PREGNANT },
    { id: "chol-a-lodhra", audience: "women", icon: "🌺", title: "Lodhra bark", body: "A teaspoon of lodhra powder in warm water is a traditional Ayurvedic remedy for women.", herb: true },
  ]),

  // Blood sugar
  ...tricks("sugar", "both", [
    { id: "sugar-b-methi", icon: "🌿", title: "Soaked methi seeds", body: "Soak a teaspoon of fenugreek seeds overnight. Drink the water and chew the seeds in the morning.", caution: MEDS },
    { id: "sugar-b-cinnamon", icon: "🍵", title: "Cinnamon water", body: "About half a teaspoon of cinnamon in warm water before meals. Ceylon cinnamon is the gentler choice for daily use." },
    { id: "sugar-b-karela", icon: "🥒", title: "Karela, as juice or sabzi", body: "A small glass (about 50 ml) of diluted bitter gourd juice, or karela sabzi a few times a week.", caution: `Not for pregnancy. ${MEDS}` },
    { id: "sugar-b-jamun", icon: "🌱", title: "Jamun seed powder", body: "Half a teaspoon of jamun seed powder in water, a traditional remedy. Enjoy the fruit itself in season too.", herb: true },
    { id: "sugar-b-overnight", icon: "⏱️", title: "7 pm to 7 am", body: "A 12-hour overnight break from food: dinner by 7, breakfast after 7.", caution: MEDS },
    { id: "sugar-b-spearmint", audience: "women", icon: "🌿", title: "Spearmint tea", body: "Two cups of spearmint tea a day are a popular choice for women managing PCOS." },
    { id: "sugar-b-inositol-foods", audience: "women", icon: "🥣", title: "Chickpeas, lentils and citrus", body: "Chickpeas, lentils, oranges and melon are easy foods to include most days, especially with PCOS." },
  ]),
  ...tricks("sugar", "modern", [
    { id: "sugar-m-walk", icon: "🚶", title: "Walk within 15 minutes", body: "Head out soon after you finish eating. Even ten easy minutes counts." },
    { id: "sugar-m-order", icon: "🥗", title: "Vegetables first, carbs last", body: "Eat the salad and sabzi first, then the dal, then the rice or roti." },
    { id: "sugar-m-fibre", icon: "🌿", title: "Methi plus isabgol", body: "Methi seeds in the morning and a spoon of isabgol before dinner add plenty of fibre.", caution: MEDS },
    { id: "sugar-m-swap", icon: "🌾", title: "Swap your grains", body: "Brown rice for white, ragi, jowar or bajra rotis for maida, and whole fruit instead of juice." },
    { id: "sugar-m-strength", icon: "💪", title: "Build some muscle", body: "Two or three short strength sessions a week: squats, lunges and wall push-ups." },
    { id: "sugar-m-gentle-fast", audience: "women", icon: "⏱️", title: "Keep fasts gentle", body: "A 12-hour overnight break is plenty. Very long fasts can leave you tired and ravenous." },
    { id: "sugar-m-inositol", audience: "women", icon: "🌸", title: "Ask about inositol", body: "Myo-inositol is a supplement often discussed for PCOS. Ask your doctor whether it suits you.", herb: true },
    { id: "sugar-m-longer-fast", audience: "men", icon: "⏱️", title: "A longer overnight break", body: "Some men find a 14-hour overnight break easy to keep. Build up slowly.", caution: MEDS },
  ]),
  ...tricks("sugar", "ayurvedic", [
    { id: "sugar-a-vijayasar", icon: "🥛", title: "Vijayasar tumbler", body: "Water left overnight in a vijayasar wood tumbler, sipped in the morning, is a traditional Ayurvedic ritual.", herb: true },
    { id: "sugar-a-tulsi", icon: "🍵", title: "Tulsi kadha", body: "Tulsi and ginger simmered in water, sipped warm." },
    { id: "sugar-a-karela", icon: "🥒", title: "Karela sabzi", body: "Bitter gourd sabzi three times a week, a classic of Ayurvedic kitchens." },
    { id: "sugar-a-methi", icon: "🌿", title: "Methi, the Ayurvedic way", body: "Methi seeds soaked overnight, or methi leaves in your dal and rotis.", caution: MEDS },
    { id: "sugar-a-shatavari", audience: "women", icon: "🌸", title: "Shatavari with methi", body: "In Ayurveda, shatavari is often paired with methi for women.", herb: true, dietNote: VEGAN_MILK },
    { id: "sugar-a-tulsi-spearmint", audience: "women", icon: "🌿", title: "Tulsi and spearmint tea", body: "Tulsi and spearmint brewed together make a calming afternoon cup." },
    { id: "sugar-a-lodhra", audience: "women", icon: "🌺", title: "Lodhra and ashoka", body: "A classical Ayurvedic pairing for women's health.", herb: true },
  ]),

  // Fertility
  ...tricks("fertility", "both", [
    { id: "fert-b-pumpkin", icon: "🎃", title: "Pumpkin seeds", body: "Two tablespoons a day, on their own or over breakfast." },
    { id: "fert-b-walnuts", icon: "🌰", title: "A handful of walnuts", body: "Four to six walnuts a day make an easy snack." },
    { id: "fert-b-colour", icon: "🍇", title: "Colourful fruit every day", body: "Pomegranate, amla, guava and seasonal berries." },
    { id: "fert-b-rest", icon: "😴", title: "Rest and a steady rhythm", body: "Seven to eight hours of sleep and a regular bedtime, for both partners." },
    { id: "fert-b-ashwagandha", audience: "men", icon: "🌿", title: "Ashwagandha at night", body: "Half a teaspoon of ashwagandha in warm milk at night is a traditional Ayurvedic practice for men.", herb: true, caution: "Quality varies between brands. Stop and see a doctor if you feel unwell.", dietNote: VEGAN_MILK },
    { id: "fert-b-tomato", audience: "men", icon: "🍅", title: "Cooked tomatoes", body: "Tomato cooked into dal, rasam or sabzi three or four times a week." },
    { id: "fert-b-shatavari", audience: "women", icon: "🌸", title: "Shatavari", body: "Half a teaspoon in warm milk, Ayurveda's best-known herb for women.", herb: true, dietNote: VEGAN_MILK },
    { id: "fert-b-flax", audience: "women", icon: "🌱", title: "Soaked flaxseeds", body: "A tablespoon of soaked or ground flaxseed every day." },
    { id: "fert-b-ashoka", audience: "women", icon: "🌺", title: "Ashoka bark", body: "Ashoka bark simmered in water is a traditional Ayurvedic tonic for women.", herb: true },
  ]),
  ...tricks("fertility", "modern", [
    { id: "fert-m-zinc", icon: "🎃", title: "Zinc-rich foods", body: "Pumpkin seeds, chickpeas, dal, cashews and, if you eat them, eggs and seafood." },
    { id: "fert-m-colour", icon: "🍇", title: "Antioxidant-rich plates", body: "Colourful vegetables and fruit at every meal: tomatoes, greens, carrots, amla, pomegranate." },
    { id: "fert-m-sun", icon: "☀️", title: "Morning daylight", body: "Twenty minutes outdoors in the morning. Ask your doctor about a vitamin D test if you're mostly indoors." },
    { id: "fert-m-no-smoke", icon: "🚭", title: "No smoking, little or no alcohol", body: "For both partners while you're trying. Your doctor can help you stop smoking." },
    { id: "fert-m-seeds", audience: "men", icon: "🌻", title: "Sunflower seeds and almonds", body: "A spoon of sunflower seeds and a few almonds, rich in vitamin E and selenium." },
    { id: "fert-m-folate", audience: "women", icon: "🥬", title: "Folate from food", body: "Methi, spinach, dal and chickpeas daily, alongside a folic acid tablet." },
    { id: "fert-m-omega", audience: "women", icon: "🐟", title: "Omega-3 foods", body: "Flaxseed, walnuts and chia, plus low-mercury fish such as sardines or salmon if you eat fish." },
    { id: "fert-m-iron", audience: "women", icon: "🥗", title: "Iron and vitamin D", body: "Iron-rich dal, greens and ragi with a squeeze of lemon, and some morning sun. Ask your doctor to check both." },
  ]),
  ...tricks("fertility", "ayurvedic", [
    { id: "fert-a-sesame", icon: "🌰", title: "Sesame and a spoon of ghee", body: "Sesame seeds and a teaspoon of ghee daily are traditional nourishing foods.", dietNote: { vegan: "Vegan? A teaspoon of cold-pressed sesame oil instead of ghee." } },
    { id: "fert-a-rhythm", icon: "🌙", title: "A steady daily rhythm", body: "Ayurveda puts routine at the centre: an early dinner, an early bedtime, an early rise." },
    { id: "fert-a-kitchen", icon: "🥛", title: "Nourishing classics", body: "Warm milk with a date or two, soaked almonds, sesame and seasonal fruit.", dietNote: VEGAN_MILK },
    { id: "fert-a-calm", icon: "🧘", title: "Pranayama every evening", body: "Ten minutes of Anulom Vilom and a few rounds of Bhramari." },
    { id: "fert-a-musli", audience: "men", icon: "🌱", title: "Safed musli", body: "A teaspoon of safed musli in warm milk, a traditional Ayurvedic tonic.", herb: true, dietNote: VEGAN_MILK },
    { id: "fert-a-gokshura", audience: "men", icon: "🌸", title: "Gokshura", body: "Gokshura is a traditional Ayurvedic herb for men's vitality.", herb: true },
    { id: "fert-a-shatavari", audience: "women", icon: "🌸", title: "Shatavari", body: "The most revered herb for women in Ayurveda, taken in warm milk.", herb: true, dietNote: VEGAN_MILK },
    { id: "fert-a-ashoka-lodhra", audience: "women", icon: "🌺", title: "Ashoka with lodhra", body: "A classical pairing for women's reproductive health in Ayurveda.", herb: true },
  ]),

  // Hormonal balance
  ...tricks("hormonal", "both", [
    { id: "horm-b-seeds", icon: "🌱", title: "Seeds every day", body: "A tablespoon of ground flaxseed, sesame or pumpkin seeds daily." },
    { id: "horm-b-light", icon: "☀️", title: "Morning light, early nights", body: "Twenty minutes of daylight in the morning and a steady bedtime." },
    { id: "horm-b-meals", icon: "⏰", title: "Regular meals", body: "Eat at roughly the same times each day, and don't skip breakfast." },
    { id: "horm-b-calm", icon: "🧘", title: "Ten minutes of pranayama", body: "Anulom Vilom or Bhramari, most evenings." },
    { id: "horm-b-shatavari", audience: "women", icon: "🌸", title: "Shatavari", body: "Half a teaspoon of shatavari in warm milk, morning or night.", herb: true, dietNote: VEGAN_MILK },
    { id: "horm-b-spearmint", audience: "women", icon: "🌿", title: "Spearmint tea", body: "Two cups a day, a popular choice with PCOS." },
    { id: "horm-b-methi-lodhra", audience: "women", icon: "🌿", title: "Methi and lodhra", body: "Methi seeds with lodhra bark, a traditional Ayurvedic pairing for PCOS.", herb: true },
    { id: "horm-b-ashoka", audience: "women", icon: "🌺", title: "Ashoka bark", body: "A traditional Ayurvedic tonic for the menstrual cycle.", herb: true },
    { id: "horm-b-strength", audience: "men", icon: "💪", title: "Strength twice a week", body: "Squats, push-ups and lunges twice a week, plus a daily walk." },
    { id: "horm-b-alcohol", audience: "men", icon: "🍺", title: "Easy on alcohol", body: "Keep alcohol low, with several alcohol-free days each week." },
  ]),
  ...tricks("hormonal", "modern", [
    { id: "horm-m-omega", icon: "🌰", title: "Flax and walnuts", body: "Omega-3 foods every day: flaxseed, walnuts, chia." },
    { id: "horm-m-slow-carbs", icon: "🌾", title: "Slow carbs", body: "Ragi, oats, jowar, dal and vegetables in place of maida and sugar." },
    { id: "horm-m-vitd", icon: "☀️", title: "Sunlight and vitamin D", body: "Twenty minutes of sun, and ask your doctor about a vitamin D test." },
    { id: "horm-m-sleep", icon: "😴", title: "Protect your sleep", body: "Seven to nine hours at the same time most nights, screens off an hour before." },
    { id: "horm-m-inositol-foods", audience: "women", icon: "🌸", title: "Inositol-rich foods", body: "Chickpeas, lentils and citrus. Ask your doctor about myo-inositol if you have PCOS." },
    { id: "horm-m-spearmint", audience: "women", icon: "🌿", title: "Spearmint tea", body: "Two cups a day, one of the most studied herbal teas for PCOS." },
    { id: "horm-m-move", audience: "men", icon: "🚶", title: "Move every day", body: "A daily brisk walk plus two strength sessions a week." },
  ]),
  ...tricks("hormonal", "ayurvedic", [
    { id: "horm-a-nidra", icon: "🧘", title: "Yoga nidra", body: "A 20–30 minute yoga nidra most evenings." },
    { id: "horm-a-abhyanga", icon: "🌿", title: "Abhyanga", body: "A warm sesame-oil self-massage before your bath, a relaxing Ayurvedic ritual." },
    { id: "horm-a-rhythm", icon: "🌙", title: "Rise and rest with the sun", body: "Wake early, make lunch your main meal, eat dinner early and be in bed by 10:30." },
    { id: "horm-a-ccf", icon: "🍵", title: "CCF tea", body: "Cumin, coriander and fennel seeds simmered together, a popular Ayurvedic tea." },
    { id: "horm-a-shatavari", audience: "women", icon: "🌸", title: "Shatavari", body: "The most revered Ayurvedic herb for women, for every stage of life.", herb: true, dietNote: VEGAN_MILK },
    { id: "horm-a-ashoka-lodhra", audience: "women", icon: "🌺", title: "Ashoka with lodhra", body: "A classical combination for the menstrual cycle.", herb: true },
    { id: "horm-a-ashwagandha", audience: "men", icon: "🌿", title: "Ashwagandha", body: "A traditional Ayurvedic herb for men, taken in warm milk at night.", herb: true, dietNote: VEGAN_MILK },
  ]),

  // Gut health
  ...tricks("gut", "both", [
    { id: "gut-b-curd", icon: "🥛", title: "A bowl of homemade curd", body: "With lunch, most days.", dietNote: VEGAN_CURD },
    { id: "gut-b-prebiotic", icon: "🧅", title: "Garlic, onion, oats and banana", body: "Everyday foods that feed a varied gut. Include some every day." },
    { id: "gut-b-triphala", icon: "🌿", title: "Triphala at bedtime", body: "A teaspoon in warm water before bed.", herb: true },
    { id: "gut-b-ajwain", icon: "🌶️", title: "Ajwain and hing", body: "Ajwain water in the morning and a pinch of hing in your dal." },
    { id: "gut-b-ferment", icon: "🥣", title: "Fermented favourites", body: "Idli, dosa, dhokla or kanji three or four times a week." },
    { id: "gut-b-fennel", icon: "🌿", title: "Fennel water", body: "Boil a teaspoon of fennel seeds in water and sip it warm." },
    { id: "gut-b-curd-flax", audience: "women", icon: "🥛", title: "Curd with flaxseed", body: "A bowl of curd with a teaspoon of ground flaxseed.", dietNote: VEGAN_CURD },
  ]),
  ...tricks("gut", "modern", [
    { id: "gut-m-psyllium", icon: "🌾", title: "Isabgol at night", body: "A teaspoon in a full glass of water before dinner.", caution: "Take it a couple of hours apart from any medicines." },
    { id: "gut-m-broth", icon: "🍵", title: "Dal broth", body: "A bowl of clear dal broth (or bone broth, if you eat meat) is gentle on busy days." },
    { id: "gut-m-curd", icon: "🥛", title: "Curd or kefir daily", body: "A small bowl every day.", dietNote: VEGAN_CURD },
    { id: "gut-m-resistant", icon: "🍚", title: "Cooked, then cooled", body: "Rice or potatoes that are cooked, cooled and reheated contain more resistant starch.", caution: "Cool cooked rice quickly, refrigerate it, eat it within a day and reheat until steaming hot." },
    { id: "gut-m-fibre", icon: "🥗", title: "25–30 g of fibre a day", body: "Dal, vegetables, whole grains and fruit at every meal gets you there." },
    { id: "gut-m-onions", icon: "🧅", title: "The onion family", body: "Garlic, onion, leek and a slightly green banana." },
  ]),
  ...tricks("gut", "ayurvedic", [
    { id: "gut-a-ajwain", icon: "🌶️", title: "Ajwain and hing", body: "Morning ajwain water and hing in your cooking, classic Ayurvedic digestives." },
    { id: "gut-a-saunf", icon: "🌿", title: "Saunf after meals", body: "Chew a teaspoon of fennel seeds after eating." },
    { id: "gut-a-ghee", icon: "🥄", title: "A teaspoon of ghee", body: "A small spoon of ghee on dal or rice, a traditional habit. Keep it to a teaspoon.", dietNote: { vegan: "Vegan? A teaspoon of cold-pressed sesame oil." } },
    { id: "gut-a-triphala-ginger", icon: "🌿", title: "Triphala and ginger", body: "Triphala at night and ginger tea in the morning.", herb: true },
    { id: "gut-a-jeera", icon: "🍵", title: "Jeera kadha", body: "Cumin and black pepper simmered in water, after a heavy meal." },
    { id: "gut-a-rose", audience: "women", icon: "🌸", title: "Fennel and rose tea", body: "Fennel seeds and dried rose petals brewed together." },
    { id: "gut-a-shatavari", audience: "women", icon: "🌸", title: "Shatavari with triphala", body: "A traditional Ayurvedic pairing for women.", herb: true },
  ]),

  // Inflammation
  ...tricks("inflammation", "both", [
    { id: "inf-b-turmeric", icon: "🟡", title: "Turmeric with black pepper", body: "In every dal and sabzi." },
    { id: "inf-b-ginger", icon: "🌿", title: "Fresh ginger daily", body: "In tea, dal and chutneys." },
    { id: "inf-b-colour", icon: "🍇", title: "Pomegranate and amla", body: "A little of each, most days." },
    { id: "inf-b-shallaki", icon: "🌿", title: "Shallaki (boswellia)", body: "A traditional Ayurvedic herb for stiff joints.", herb: true },
    { id: "inf-b-omega", icon: "🐟", title: "Walnuts, flax and chia", body: "Some every day, and oily fish once or twice a week if you eat it." },
    { id: "inf-b-hibiscus", audience: "women", icon: "🌺", title: "Hibiscus and ginger tea", body: "A warming afternoon cup.", caution: NOT_PREGNANT },
  ]),
  ...tricks("inflammation", "modern", [
    { id: "inf-m-plate", icon: "🥗", title: "A calmer plate", body: "Fewer refined carbs and fried foods. More vegetables, dal, whole grains and nuts." },
    { id: "inf-m-omega", icon: "🐟", title: "Omega-3 foods", body: "Walnuts, chia and ground flaxseed daily, or oily fish if you eat it." },
    { id: "inf-m-tea", icon: "🍵", title: "Green tea and pomegranate", body: "A cup of green tea and some pomegranate, most days." },
    { id: "inf-m-sleep", icon: "😴", title: "Sleep first", body: "Seven to eight hours, as regular as you can make it." },
    { id: "inf-m-sun", icon: "🌞", title: "Daylight and vitamin D", body: "Twenty minutes of sun. Ask your doctor about testing vitamin D if you're mostly indoors." },
    { id: "inf-m-cramps", audience: "women", icon: "🌸", title: "Comfort for period cramps", body: "Warmth on your tummy, gentle movement and ginger tea are simple comforts. See a doctor if periods are very painful." },
  ]),
  ...tricks("inflammation", "ayurvedic", [
    { id: "inf-a-shallaki", icon: "🌿", title: "Shallaki (boswellia)", body: "A traditional Ayurvedic herb for joints.", herb: true },
    { id: "inf-a-turmeric-ghee", icon: "🟡", title: "Turmeric in ghee", body: "Bloom turmeric in a little ghee for your tadka.", dietNote: { vegan: "Vegan? Use a little mustard or sesame oil." } },
    { id: "inf-a-kadha", icon: "🍵", title: "Rasayana kadha", body: "Ginger, tulsi, cinnamon and black pepper simmered together." },
    { id: "inf-a-nidra", icon: "🧘", title: "Yoga nidra", body: "Twenty to thirty minutes in the evening." },
    { id: "inf-a-hibiscus-tulsi", audience: "women", icon: "🌺", title: "Hibiscus and tulsi kadha", body: "Hibiscus, tulsi and ginger simmered together.", caution: NOT_PREGNANT },
    { id: "inf-a-shatavari", audience: "women", icon: "🌸", title: "Shatavari with turmeric", body: "A classic Ayurvedic pairing for women.", herb: true, dietNote: VEGAN_MILK },
  ]),
];

// ── Routines (the original app's daily ritual + goal-specific morning add-ons) ─
export interface RoutineStep {
  icon: string;
  text: string;
  audience?: Exclude<AudienceId, "everyone">;
  /** Only for the "A little of each" and Ayurvedic approaches. */
  ayurvedic?: boolean;
  herb?: boolean;
}

export const DAILY_RITUAL: readonly RoutineStep[] = [
  { icon: "💧", text: "Two glasses of warm water when you wake." },
  { icon: "🚶", text: "A 45-minute brisk walk or yoga." },
  { icon: "🌰", text: "Five soaked almonds, two walnuts and a spoon of pumpkin seeds before breakfast." },
  { icon: "🧘", text: "Ten minutes of Anulom Vilom in the evening." },
  { icon: "🌙", text: "Dinner by 7:30 PM, then the kitchen closes." },
  { icon: "☀️", text: "Twenty minutes of morning sunlight.", audience: "men" },
  { icon: "🧄", text: "A raw garlic clove on an empty stomach, if it suits you.", audience: "men" },
  { icon: "🌿", text: "Ashwagandha in warm milk at night, the Ayurvedic way.", audience: "men", ayurvedic: true, herb: true },
  { icon: "☀️", text: "Twenty minutes of morning sunlight.", audience: "women" },
  { icon: "🌱", text: "A teaspoon of soaked flaxseed.", audience: "women" },
  { icon: "🌸", text: "Shatavari in warm milk, the Ayurvedic way.", audience: "women", ayurvedic: true, herb: true },
];

export const MORNING_ADDS: Record<CategoryId, readonly RoutineStep[]> = {
  cholesterol: [
    { icon: "🧄", text: "One or two crushed garlic cloves in warm water." },
    { icon: "🌰", text: "A tablespoon of ground flaxseed stirred into water or curd." },
    { icon: "🥜", text: "Five almonds and two walnuts." },
    { icon: "🍃", text: "A glass of amla water.", audience: "women" },
  ],
  sugar: [
    { icon: "🌿", text: "Overnight methi water, seeds and all." },
    { icon: "🍵", text: "Half a teaspoon of cinnamon in warm water." },
    { icon: "🥒", text: "A small glass of diluted karela juice, a few mornings a week (not in pregnancy)." },
    { icon: "🌿", text: "A cup of spearmint tea.", audience: "women" },
  ],
  fertility: [
    { icon: "🎃", text: "A tablespoon of pumpkin seeds." },
    { icon: "🌰", text: "A few walnuts with your soaked almonds." },
    { icon: "☀️", text: "Twenty minutes of morning daylight." },
    { icon: "🍅", text: "Plan cooked tomato into today's lunch or dinner.", audience: "men" },
    { icon: "🌿", text: "Ashwagandha in warm milk at night.", audience: "men", ayurvedic: true, herb: true },
    { icon: "💊", text: "Your folic acid tablet with breakfast.", audience: "women" },
    { icon: "🌸", text: "Shatavari in warm milk.", audience: "women", ayurvedic: true, herb: true },
  ],
  hormonal: [
    { icon: "🌱", text: "A teaspoon of soaked flaxseed." },
    { icon: "☀️", text: "Step outside into the morning light." },
    { icon: "🥣", text: "A breakfast with protein, within a couple of hours of waking." },
    { icon: "🌿", text: "A cup of spearmint tea.", audience: "women" },
    { icon: "🌸", text: "Shatavari in warm milk.", audience: "women", ayurvedic: true, herb: true },
  ],
  gut: [
    { icon: "🌿", text: "Soaked methi water." },
    { icon: "🍵", text: "Warm ginger and ajwain water." },
    { icon: "🌿", text: "Fennel seed water, sipped warm." },
    { icon: "🥛", text: "A small bowl of curd with breakfast.", audience: "women" },
  ],
  inflammation: [
    { icon: "🟡", text: "Turmeric and a pinch of black pepper in warm water." },
    { icon: "🍇", text: "A few pomegranate seeds or berries." },
    { icon: "🥗", text: "A spoon of ground flaxseed or extra-virgin olive oil in breakfast." },
    { icon: "🌺", text: "A cup of rose tea.", audience: "women" },
  ],
};

// ── Food guides (the original app's foods to eat / avoid, per focus) ──────────
export interface FoodItem {
  name: string;
  note?: string;
  /** A typical serving, and its approximate protein in grams. */
  serving?: string;
  protein?: number;
  audience?: Exclude<AudienceId, "everyone">;
  /** Omit for every diet. */
  diets?: DietId[];
}

export interface FoodGuide {
  category: CategoryId;
  intro: string;
  enjoy: readonly FoodItem[];
  limit: readonly FoodItem[];
  enjoyImage: ImageSlot;
  limitImage: ImageSlot;
}

const NONVEG: DietId[] = ["non-vegetarian"];
const DAIRY: DietId[] = ["vegetarian", "non-vegetarian"];

export const FOOD_GUIDES: readonly FoodGuide[] = [
  {
    category: "cholesterol",
    intro: "Plenty of fibre, kinder fats and fewer fried foods.",
    enjoy: [
      { name: "Oats", note: "Porridge, upma or chilla", serving: "1 bowl", protein: 5 },
      { name: "Rajma and chickpeas", serving: "1 katori", protein: 8 },
      { name: "Moong dal", serving: "1 katori", protein: 7 },
      { name: "Barley and millets", note: "As a swap for white rice", serving: "½ cup cooked", protein: 3 },
      { name: "Walnuts and almonds", serving: "5 walnuts", protein: 3 },
      { name: "Flax and chia seeds", serving: "1 tbsp", protein: 2 },
      { name: "Mustard, olive or sesame oil", note: "Measured: about 3 teaspoons a day" },
      { name: "Pomegranate and amla", note: "The fruit, not the juice" },
      { name: "Garlic and ginger" },
      { name: "Isabgol (psyllium)", note: "In a full glass of water" },
      { name: "Green tea" },
      { name: "Tofu and soy", note: "In moderation", serving: "100 g tofu", protein: 9 },
      { name: "Leafy greens and berries", audience: "women" },
      { name: "Mackerel, sardines and rohu", serving: "100 g", protein: 19, diets: NONVEG },
    ],
    limit: [
      { name: "Fried snacks and namkeen", note: "Pakoras, samosas, chips, bhujia" },
      { name: "Vanaspati and trans fats", note: "Dalda, and some bakery biscuits and puffs" },
      { name: "Butter, ghee and cream in excess", note: "A teaspoon of ghee is fine; save cream gravies for occasions" },
      { name: "Full-fat dairy in large amounts", note: "Toned milk and homemade curd are easy swaps", diets: DAIRY },
      { name: "Frying oil used again and again" },
      { name: "Coconut oil in large amounts" },
      { name: "Packaged snacks and bakery items" },
      { name: "Processed meats", note: "Sausages, salami, ham", diets: NONVEG },
      { name: "Alcohol" },
    ],
    enjoyImage: img(
      "assets/food/cholesterol-enjoy.webp",
      "16:9",
      "morning",
      "A bowl of oats with walnuts beside rajma, pomegranate and garlic",
      "A calm still life of foods to enjoy: a clay bowl of oats topped with walnuts, a small heap of red kidney beans, a halved pomegranate, a garlic bulb, a sprig of ginger and a small bottle of mustard oil, arranged loosely on a table",
    ),
    limitImage: img(
      "assets/food/cholesterol-limit.webp",
      "16:9",
      "morning",
      "A hand gently pushing away a plate of fried samosas and pakoras",
      "A South Asian hand gently pushing away a plate of fried samosas and pakoras, a tin of vanaspati and a bowl of creamy curry set a little apart, calm and non-judgemental",
    ),
  },
  {
    category: "sugar",
    intro: "Slow carbs, lots of vegetables and some protein at every meal.",
    enjoy: [
      { name: "Ragi, jowar and bajra", note: "As rotis, dosa or porridge", serving: "1 roti", protein: 4 },
      { name: "Brown rice", serving: "½ cup cooked", protein: 3 },
      { name: "Moong and chana dal", serving: "1 katori", protein: 8 },
      { name: "Chickpeas and lentils", serving: "1 katori", protein: 8 },
      { name: "Sprouts", serving: "1 cup", protein: 7 },
      { name: "Methi leaves and seeds" },
      { name: "Bitter gourd, lauki and cucumber" },
      { name: "Leafy greens" },
      { name: "Guava, pear, jamun and amla", note: "Whole fruit, one portion at a time" },
      { name: "Cinnamon and turmeric" },
      { name: "Flax and pumpkin seeds", serving: "1 tbsp", protein: 3 },
      { name: "Paneer and curd", serving: "50 g paneer", protein: 9, diets: DAIRY },
      { name: "Eggs", serving: "2 eggs", protein: 13, diets: NONVEG },
      { name: "Spearmint tea", audience: "women" },
    ],
    limit: [
      { name: "Large portions of white rice", note: "Keep to about half a cup, with plenty of dal and sabzi" },
      { name: "Maida", note: "Naan, white bread, biscuits, noodles" },
      { name: "Sugar, jaggery and honey", note: "They all count as sugar" },
      { name: "Sweetened tea and coffee" },
      { name: "Packaged juices and soft drinks", note: "Eat the fruit instead" },
      { name: "Mithai and desserts", note: "Save them for occasions, and share" },
      { name: "Sweetened yoghurt and flavoured milk", diets: DAIRY },
      { name: "Instant noodles and ready snacks" },
      { name: "Big portions of very sweet fruit", note: "Mango, chikoo and banana: a small portion with a meal" },
    ],
    enjoyImage: img(
      "assets/food/sugar-enjoy.webp",
      "16:9",
      "midday",
      "Millet rotis with dal, bitter gourd, guava and a cinnamon stick",
      "A calm still life of foods to enjoy: a stack of jowar rotis, a bowl of dal, a whole bitter gourd, a few guavas, a sprig of methi leaves and a cinnamon stick, arranged loosely on a table",
    ),
    limitImage: img(
      "assets/food/sugar-limit.webp",
      "16:9",
      "midday",
      "A hand gently pushing away a plate of mithai and a sugary drink",
      "A South Asian hand gently pushing away a plate of mithai, with a glass of packaged juice and a slice of white bread set a little apart, calm and non-judgemental",
    ),
  },
  {
    category: "fertility",
    intro: "A varied, colourful plate with enough protein, for both partners.",
    enjoy: [
      { name: "Dal, chickpeas and rajma", serving: "1 katori", protein: 8 },
      { name: "Pumpkin seeds", serving: "2 tbsp", protein: 5 },
      { name: "Walnuts", serving: "5 walnuts", protein: 3 },
      { name: "Pomegranate, amla and berries" },
      { name: "Sesame seeds", serving: "1 tbsp", protein: 2 },
      { name: "Brown rice and millets", serving: "½ cup cooked", protein: 3 },
      { name: "Leafy greens and methi", note: "Good sources of folate", audience: "women" },
      { name: "Sweet potato", audience: "women" },
      { name: "A teaspoon of ghee", audience: "women", diets: DAIRY },
      { name: "Cooked tomatoes", audience: "men" },
      { name: "Sunflower seeds and almonds", serving: "1 tbsp seeds", protein: 2, audience: "men" },
      { name: "Bananas", audience: "men" },
      { name: "Paneer and curd", serving: "50 g paneer", protein: 9, diets: DAIRY },
      { name: "Eggs", serving: "2 eggs", protein: 13, diets: NONVEG },
      { name: "Low-mercury fish", note: "Sardines, salmon, rohu, pomfret", serving: "100 g", protein: 19, diets: NONVEG },
    ],
    limit: [
      { name: "Alcohol", note: "Best avoided while you're trying" },
      { name: "Smoking and tobacco", note: "Including gutka and second-hand smoke" },
      { name: "Too much caffeine", note: "Up to about 200 mg a day: two small coffees or three to four cups of chai" },
      { name: "Trans fats and fried food" },
      { name: "Refined sugar and maida" },
      { name: "Heating food in plastic", note: "Glass and steel instead" },
      { name: "High-mercury fish", note: "Shark, swordfish and surmai (king mackerel)", audience: "women", diets: NONVEG },
      { name: "Processed meats", audience: "men", diets: NONVEG },
      { name: "Saunas, hot tubs and tight underwear", audience: "men" },
      { name: "Testosterone boosters and steroids", audience: "men" },
    ],
    enjoyImage: img(
      "assets/food/fertility-enjoy.webp",
      "16:9",
      "evening",
      "Pomegranate, walnuts, pumpkin seeds, dal and leafy greens",
      "A calm still life of foods to enjoy: a halved pomegranate, a small bowl of walnuts, a scatter of pumpkin seeds, a bowl of yellow dal, a bunch of spinach and two tomatoes, arranged loosely on a table",
    ),
    limitImage: img(
      "assets/food/fertility-limit.webp",
      "16:9",
      "evening",
      "A hand gently setting aside a glass of alcohol and a cup of coffee",
      "A South Asian hand gently setting aside a glass of beer and a large cup of coffee, a packet of chips and a plastic takeaway box set a little apart, calm and non-judgemental",
    ),
  },
  {
    category: "hormonal",
    intro: "Seeds, greens, slow carbs and steady meal times.",
    enjoy: [
      { name: "Flax, sesame and pumpkin seeds", serving: "1 tbsp", protein: 2 },
      { name: "Chickpeas and lentils", serving: "1 katori", protein: 8 },
      { name: "Tofu and soy", note: "In moderation", serving: "100 g tofu", protein: 9 },
      { name: "Leafy greens and broccoli" },
      { name: "Sweet potato" },
      { name: "Pomegranate, berries and amla" },
      { name: "Cinnamon and turmeric" },
      { name: "Cashews and pumpkin seeds", note: "Zinc-rich snacks", serving: "10 cashews", protein: 3 },
      { name: "Spearmint tea", audience: "women" },
      { name: "Eggs and oily fish", note: "Foods with vitamin D", serving: "2 eggs", protein: 13, diets: NONVEG },
    ],
    limit: [
      { name: "Refined sugar" },
      { name: "Maida and refined carbs" },
      { name: "Too much caffeine", note: "Especially after noon" },
      { name: "Alcohol" },
      { name: "Trans fats and fried food" },
      { name: "Heating food in plastic" },
      { name: "Heavily scented personal-care products", note: "Simple ones are easier to live with" },
    ],
    enjoyImage: img(
      "assets/food/hormonal-enjoy.webp",
      "16:9",
      "dawn",
      "Bowls of flax, sesame and pumpkin seeds with greens and sweet potato",
      "A calm still life of foods to enjoy: three small bowls of flax, sesame and pumpkin seeds, a sweet potato, a head of broccoli, a few berries and a glass cup of mint tea, arranged loosely on a table",
    ),
    limitImage: img(
      "assets/food/hormonal-limit.webp",
      "16:9",
      "dawn",
      "A hand gently pushing away a sugary pastry and an extra cup of coffee",
      "A South Asian hand gently pushing away a sugary pastry and a third cup of coffee, with a plastic lunch box set a little apart, calm and non-judgemental",
    ),
  },
  {
    category: "gut",
    intro: "Fermented foods, fibre and slower, warmer meals.",
    enjoy: [
      { name: "Homemade curd and buttermilk", serving: "1 katori curd", protein: 4, diets: DAIRY },
      { name: "Coconut or soy yoghurt", diets: ["vegan"] },
      { name: "Idli, dosa and dhokla", serving: "2 idlis", protein: 4 },
      { name: "Kanji and fermented rice" },
      { name: "Moong dal khichdi", serving: "1 bowl", protein: 9 },
      { name: "Garlic and onion" },
      { name: "Oats and isabgol", serving: "1 bowl oats", protein: 5 },
      { name: "A slightly green banana" },
      { name: "Lauki and cooked vegetables" },
      { name: "Ginger, fennel, ajwain and jeera" },
      { name: "A teaspoon of ghee", diets: DAIRY },
    ],
    limit: [
      { name: "Heavily processed and fried food" },
      { name: "Refined sugar" },
      { name: "Artificial sweeteners" },
      { name: "Fizzy drinks" },
      { name: "Alcohol" },
      { name: "Ice-cold drinks with meals", note: "Warm or room-temperature water is gentler" },
      { name: "Packaged snacks" },
      { name: "Lots of red meat", diets: NONVEG },
      { name: "Antibiotics you don't need", note: "Only when your doctor prescribes them" },
    ],
    enjoyImage: img(
      "assets/food/gut-enjoy.webp",
      "16:9",
      "afternoon",
      "Idli, a bowl of curd, buttermilk, fennel and garlic",
      "A calm still life of foods to enjoy: a plate of soft idli, a clay bowl of curd, a glass of buttermilk, a small dish of fennel seeds, a garlic bulb and a banana, arranged loosely on a table",
    ),
    limitImage: img(
      "assets/food/gut-limit.webp",
      "16:9",
      "afternoon",
      "A hand gently pushing away a fizzy drink and a bag of chips",
      "A South Asian hand gently pushing away a can of fizzy drink and a bag of chips, a glass of iced soda set a little apart, calm and non-judgemental",
    ),
  },
  {
    category: "inflammation",
    intro: "Colourful plants, omega-3 foods and fewer fried or sugary foods.",
    enjoy: [
      { name: "Turmeric with black pepper" },
      { name: "Ginger and garlic" },
      { name: "Amla, pomegranate and berries" },
      { name: "Walnuts, flax and chia", serving: "1 tbsp", protein: 2 },
      { name: "Olive and mustard oil", note: "Measured, by the teaspoon" },
      { name: "Leafy greens and broccoli" },
      { name: "Tomatoes and beetroot" },
      { name: "Green tea" },
      { name: "Dal and millets", serving: "1 katori dal", protein: 7 },
      { name: "Dark chocolate", note: "70% or more, a square or two" },
      { name: "Oily fish", note: "Mackerel, sardines, salmon", serving: "100 g", protein: 19, diets: NONVEG },
    ],
    limit: [
      { name: "Vanaspati and trans fats", note: "Dalda and some bakery items" },
      { name: "Refined oils and deep frying" },
      { name: "Refined sugar" },
      { name: "Maida" },
      { name: "Artificial additives and packaged snacks" },
      { name: "Alcohol" },
      { name: "Processed and red meats", diets: NONVEG },
    ],
    enjoyImage: img(
      "assets/food/inflammation-enjoy.webp",
      "16:9",
      "morning",
      "Turmeric root, ginger, berries, walnuts and leafy greens",
      "A calm still life of foods to enjoy: fresh turmeric root, a knob of ginger, a small bowl of berries, walnuts, a bunch of leafy greens and a beetroot, arranged loosely on a table",
    ),
    limitImage: img(
      "assets/food/inflammation-limit.webp",
      "16:9",
      "morning",
      "A hand gently pushing away deep-fried snacks and a sugary dessert",
      "A South Asian hand gently pushing away a plate of deep-fried snacks and a sugary dessert, a tin of vanaspati set a little apart, calm and non-judgemental",
    ),
  },
];

// ── Fertility guide (shown with the Fertility focus) ──────────────────────────
/**
 * Plain-language fertility information for women and men, following WHO, NICE
 * CG156, ASRM and NHS guidance (see FERTILITY.sources). Nothing here promises an
 * outcome. There is no method to choose a baby's sex, and in India sex selection
 * is illegal under the PCPNDT Act, 1994. The guide says so plainly.
 */
export type Verdict = "recommended" | "if-low" | "optional" | "mixed" | "limited" | "specialist" | "avoid";

export interface SupplementNote {
  name: string;
  icon: string;
  dose?: string;
  verdict: Verdict;
  body: string;
}

export interface GuideTip {
  icon: string;
  title: string;
  body: string;
}

export interface MythFact {
  myth: string;
  fact: string;
  audience?: Exclude<AudienceId, "everyone">;
}

export interface TrackingMethod {
  icon: string;
  name: string;
  how: string;
  pros: readonly string[];
  cons: readonly string[];
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  recommended: "Recommended",
  "if-low": "If you're low",
  optional: "Optional",
  mixed: "Mixed evidence",
  limited: "Limited evidence",
  specialist: "Specialist only",
  avoid: "Avoid",
};

export type CyclePhaseId = "period" | "follicular" | "fertile" | "ovulation" | "luteal";
type Pair<T> = { women: T; men: T };

export interface FertilityContent {
  intro: Pair<string>;
  heroes: Pair<ImageSlot>;
  cycleNote: string;
  phases: readonly { id: CyclePhaseId; label: string; note: string }[];
  timing: readonly GuideTip[];
  approaches: readonly TrackingMethod[];
  methods: readonly TrackingMethod[];
  quality: Pair<{ title: string; lede: string; tips: readonly GuideTip[] }>;
  special: Pair<readonly GuideTip[]>;
  myths: readonly MythFact[];
  supplements: Pair<readonly SupplementNote[]>;
  menNote: string;
  doctor: readonly string[];
  sources: readonly { label: string; url?: string }[];
  disclaimer: string;
}

export const FERTILITY: FertilityContent = {
  intro: {
    women: "Your cycle, the best days to try, and what helps egg health, in plain language.",
    men: "Sperm health, timing with your partner's cycle, and the myths worth ignoring.",
  },
  heroes: {
    women: img(
      "assets/fertility/women.webp",
      "16:9",
      "dawn",
      "A woman by a sunny window with tea and a simple wall calendar",
      "A South Asian woman sitting relaxed by a sunny window with a cup of tea, a simple wall calendar beside her with a few days softly circled, a potted plant, hopeful and calm",
    ),
    men: img(
      "assets/fertility/men.webp",
      "16:9",
      "afternoon",
      "A man preparing a colourful meal at a kitchen counter",
      "A South Asian man calmly preparing a colourful meal at a kitchen counter: sliced tomatoes, a bowl of walnuts and pumpkin seeds, leafy greens and a glass of water, relaxed posture",
    ),
  },
  cycleNote:
    "These dates are estimates. They assume ovulation about 14 days before your next period, so they're less reliable if your cycle length varies by more than a few days. Ovulation (LH) tests help then.",
  phases: [
    { id: "period", label: "Period", note: "Rest when you need to. Iron-rich dal, greens and ragi help replace what's lost." },
    { id: "follicular", label: "Follicular phase", note: "Many people notice their energy building after their period." },
    { id: "fertile", label: "Fertile window", note: "The six days ending on ovulation. Clear, stretchy mucus is a sign." },
    { id: "ovulation", label: "Ovulation (estimated)", note: "Usually about 14 days before the next period." },
    { id: "luteal", label: "Luteal phase", note: "Cravings or low moods may show up in the last few days. Keep meals regular." },
  ],
  timing: [
    { icon: "🗓️", title: "The fertile window", body: "The six days ending on ovulation day. An egg lives for 12–24 hours, but sperm can survive up to five days, so the days before ovulation count most." },
    { icon: "✨", title: "The best days", body: "Chances are highest in the two to three days before ovulation and on the day itself." },
    { icon: "💞", title: "Simplest approach", body: "Sex every two to three days through the month covers the window without tracking (NICE). If you'd like to target it, every one to two days during the window is plenty." },
    { icon: "💧", title: "Signs to watch", body: "Clear, slippery, stretchy cervical mucus and a positive ovulation (LH) test mean ovulation is likely within a day or two." },
    { icon: "🧴", title: "Lubricants", body: "Some lubricants slow sperm down. If you need one, look for a product labelled sperm-friendly." },
    { icon: "🛏️", title: "Position doesn't matter", body: "There's no evidence that position, orgasm or lying down afterwards changes the odds." },
  ],
  approaches: [
    { icon: "💞", name: "Every 2–3 days", how: "Regular sex through the whole cycle, no tracking.", pros: ["No pressure or planning", "Covers the fertile window even if ovulation shifts"], cons: ["Needs regular sex all month"] },
    { icon: "🎯", name: "Timed to the window", how: "Every 1–2 days in the six fertile days.", pros: ["Focuses on the best days", "Useful when you're often apart"], cons: ["Can feel pressured and stressful", "Misses if the estimate is off"] },
  ],
  methods: [
    { icon: "📅", name: "Calendar or app", how: "Log your period start dates; the app estimates ovulation.", pros: ["Free and easy", "Works well with regular cycles"], cons: ["Only an estimate", "Unreliable if cycles vary"] },
    { icon: "🧪", name: "Ovulation (LH) tests", how: "Urine strips detect the hormone surge 24–36 hours before ovulation.", pros: ["Pinpoints the best two days", "Easy to read"], cons: ["The cost adds up", "PCOS can give confusing results"] },
    { icon: "🌡️", name: "Basal body temperature", how: "Take your temperature on waking; it rises slightly after ovulation.", pros: ["Cheap", "Confirms ovulation happened"], cons: ["Only shows it after the fact", "Thrown off by poor sleep, illness or alcohol"] },
    { icon: "💧", name: "Cervical mucus", how: "Notice when it turns clear, slippery and stretchy.", pros: ["Free", "Shows fertile days as they happen"], cons: ["Takes a few cycles to learn", "Infections and some medicines change it"] },
    { icon: "⌚", name: "Wearables and monitors", how: "Devices that track temperature, heart rate or hormones.", pros: ["Automatic and convenient"], cons: ["Expensive", "Accuracy varies"] },
  ],
  quality: {
    women: {
      title: "Egg health",
      lede: "Age matters most and can't be changed, but everyday habits still count.",
      tips: [
        { icon: "🎂", title: "Know the age curve", body: "Fertility declines gradually from the early 30s and faster after 35. If you're 35 or over, seek advice after six months of trying." },
        { icon: "🚭", title: "Don't smoke", body: "Smoking speeds up the loss of eggs and can bring menopause earlier. Avoid second-hand smoke too." },
        { icon: "🥗", title: "Mediterranean-style plates", body: "Vegetables, dal, whole grains, nuts, seeds and olive or mustard oil, with less sugar and fried food. Studies link this pattern with better fertility." },
        { icon: "⚖️", title: "A healthy weight", body: "Being underweight or overweight can upset ovulation. Small, steady changes count." },
        { icon: "🏃", title: "Move, don't overdo it", body: "Regular moderate exercise helps. Very intense training with weight loss can stop periods." },
        { icon: "🍷", title: "Alcohol-free while trying", body: "The safest choice is none, since you may be pregnant before you know it." },
      ],
    },
    men: {
      title: "Sperm health",
      lede: "Sperm take about three months to develop, so changes you make today show up around three months later.",
      tips: [
        { icon: "🌡️", title: "Keep cool", body: "Loose underwear, no laptop on your lap, and go easy on saunas and very hot baths." },
        { icon: "🚭", title: "Stop smoking and gutka", body: "Tobacco in any form harms sperm. Your doctor can help you quit." },
        { icon: "🍺", title: "Cut right back on alcohol", body: "Heavy drinking lowers sperm quality and sex drive." },
        { icon: "⚖️", title: "A healthy weight", body: "Extra weight around the middle is linked with lower sperm quality." },
        { icon: "🥗", title: "Eat the colours", body: "Fruit, vegetables, whole grains, nuts (walnuts, almonds) and fish. Fewer processed meats and sugary drinks." },
        { icon: "🧪", title: "Watch work exposures", body: "Pesticides, solvents, heavy metals and high heat can affect sperm. Use the protective gear." },
        { icon: "💊", title: "Check your medicines", body: "Some medicines, anabolic steroids and recreational drugs (including cannabis) affect sperm. Ask your doctor or pharmacist." },
      ],
    },
  },
  special: {
    women: [
      { icon: "📅", title: "Learn your cycle length", body: "Count from the first day of one period to the first day of the next, for a few months. Most adult cycles run 21–35 days." },
      { icon: "💊", title: "Start folic acid now", body: "400 mcg a day, ideally from three months before trying and through the first 12 weeks." },
      { icon: "☕", title: "Keep caffeine moderate", body: "Up to about 200 mg a day: roughly two small cups of coffee or three to four cups of chai." },
      { icon: "🐟", title: "Choose low-mercury fish", body: "Sardines, salmon, rohu and pomfret are good choices. Limit surmai (king mackerel), shark and swordfish." },
      { icon: "🩺", title: "A pre-pregnancy check-up", body: "Ask about rubella immunity, thyroid, anaemia, blood sugar and any regular medicines." },
    ],
    men: [
      { icon: "⏳", title: "Think in three-month blocks", body: "Give any change at least three months before judging it." },
      { icon: "🚫", title: "No steroids or boosters", body: "Testosterone, anabolic steroids and 'T boosters' can switch off sperm production." },
      { icon: "💞", title: "Regular sex, not saving up", body: "Every one to two days in the fertile window is ideal. Long gaps don't improve sperm." },
      { icon: "🤝", title: "Get checked together", body: "A semen analysis is simple and is usually one of the first tests when a couple has been trying for a while." },
    ],
  },
  myths: [
    { myth: "You can choose a boy or a girl with timing, diet, position or 'pH' tricks.", fact: "No method has been shown to work. The odds stay roughly 50:50 every time. In India, choosing or revealing a baby's sex before birth is illegal under the PCPNDT Act, 1994. If an inherited condition runs in the family, ask your doctor about genetic counselling." },
    { myth: "Ovulation always happens on day 14.", fact: "Only in some 28-day cycles. Ovulation is usually about 14 days before the next period, so it moves with your cycle length." },
    { myth: "Lying down with your legs up afterwards helps.", fact: "Sperm reach the cervix within minutes. There's no evidence that position or resting changes the odds." },
    { myth: "If it hasn't happened in a few months, something is wrong.", fact: "About eight in ten couples conceive within a year. See a doctor after 12 months of trying, or after six if the woman is 35 or older." },
    { myth: "Fertility problems are always the woman's.", fact: "Male factors play a part in about half of couples who struggle to conceive, so both partners should be checked." },
    { myth: "The pill harms your future fertility.", fact: "Fertility usually returns within a few months of stopping the pill.", audience: "women" },
    { myth: "Regular periods mean you definitely ovulate.", fact: "Usually, but not always. Ovulation tests or a blood test can confirm it.", audience: "women" },
    { myth: "Special fertility teas improve egg quality.", fact: "There's no good evidence, and some herbs aren't safe in early pregnancy. Check with your doctor.", audience: "women" },
    { myth: "Testosterone boosters improve fertility.", fact: "The opposite. Testosterone and steroid products can switch off sperm production.", audience: "men" },
    { myth: "Saving up for days improves the odds.", fact: "Abstaining for more than about five days doesn't help. Every one to two days in the fertile window is ideal.", audience: "men" },
    { myth: "Cold water, breath holds or 'power poses' raise testosterone.", fact: "There's no good evidence. Sleep, activity, a healthy weight and less alcohol are what reliably help.", audience: "men" },
    { myth: "Men's fertility doesn't change with age.", fact: "It declines more slowly than women's, but sperm quality drops gradually from about 40.", audience: "men" },
  ],
  supplements: {
    women: [
      { name: "Folic acid", icon: "💊", dose: "400 mcg a day", verdict: "recommended", body: "Start at least one month, ideally three, before trying and continue through the first 12 weeks. Some women need 5 mg (for example with diabetes, a BMI of 30 or more, some epilepsy medicines, or a previous pregnancy affected by a neural tube defect). Ask your doctor." },
      { name: "Vitamin D", icon: "☀️", dose: "10 mcg (400 IU) a day is the usual pregnancy advice", verdict: "if-low", body: "Many people in India are low despite the sunshine. Your doctor may test you and suggest a higher dose if you need it." },
      { name: "Iron", icon: "🩸", verdict: "if-low", body: "Anaemia is common in Indian women. Have your haemoglobin checked and take iron only if advised." },
      { name: "Iodine", icon: "🧂", verdict: "optional", body: "Needed in pregnancy. Iodised salt covers most needs, and many prenatal vitamins add 150 mcg." },
      { name: "Prenatal multivitamin", icon: "💊", verdict: "optional", body: "A convenient way to get folic acid, iodine and vitamin D together. Choose one made for pregnancy, and avoid high-dose vitamin A (retinol) and fish-liver oil." },
      { name: "Omega-3 (DHA)", icon: "🐟", verdict: "optional", body: "Food first: low-mercury fish once or twice a week, or an algae-based DHA if you're vegetarian. The evidence for fertility itself is mixed." },
      { name: "Myo-inositol", icon: "🌸", verdict: "mixed", body: "Studied mainly in PCOS, where some trials suggest more regular ovulation. The evidence is low-certainty, so discuss it with your doctor." },
      { name: "CoQ10", icon: "🔋", verdict: "limited", body: "Small studies, mostly in IVF, hint at a benefit for egg quality. Not proven." },
      { name: "DHEA", icon: "⚠️", verdict: "specialist", body: "A hormone, not a vitamin. Only under a fertility specialist's care." },
      { name: "Herbal fertility blends", icon: "🌿", verdict: "limited", body: "Little human evidence, and quality varies. Stop herbal products once you might be pregnant, unless your doctor says otherwise." },
    ],
    men: [
      { name: "Multivitamin", icon: "💊", verdict: "optional", body: "Reasonable if your diet is limited. It isn't a fertility treatment." },
      { name: "Antioxidant blends", icon: "🍇", dose: "Vitamin C, E, selenium, zinc, lycopene", verdict: "limited", body: "Widely sold for sperm health, but a large trial (MOXI, 2020) found no improvement in semen quality or pregnancy rates. Food first: fruit, vegetables, nuts and seeds." },
      { name: "Zinc and folic acid", icon: "💊", verdict: "if-low", body: "Only if you're deficient. A large trial (FAZST, 2020) found no benefit for semen quality or live births in most men." },
      { name: "CoQ10", icon: "🔋", verdict: "limited", body: "Some small trials show better sperm movement. There's no proof of more pregnancies." },
      { name: "Vitamin D", icon: "☀️", verdict: "if-low", body: "If a blood test shows you're low." },
      { name: "Ashwagandha", icon: "🌿", verdict: "limited", body: "Small studies report better semen results, but product quality varies and rare liver problems have been reported. Ask your doctor first." },
      { name: "Testosterone, 'T boosters', steroids, SARMs", icon: "🚫", verdict: "avoid", body: "They suppress the signals that make sperm and can cause very low counts. Recovery can take months." },
    ],
  },
  menNote: "No pill has been proven to raise the chance of pregnancy. Lifestyle changes matter more.",
  doctor: [
    "You've been trying for 12 months, or 6 months if the woman is 35 or older.",
    "Periods are irregular, very painful, very heavy, or have stopped.",
    "There's a known condition such as PCOS, endometriosis, thyroid problems, diabetes, or a past pelvic infection or surgery.",
    "For men: past testicular surgery or injury, undescended testes, mumps after puberty, or erection or ejaculation problems.",
    "An inherited condition runs in either family. Ask about genetic counselling.",
    "Either of you takes regular medicines. Ask whether they're suitable while trying.",
  ],
  sources: [
    { label: "WHO: Infertility fact sheet", url: "https://www.who.int/news-room/fact-sheets/detail/infertility" },
    { label: "NICE CG156: Fertility problems, assessment and treatment", url: "https://www.nice.org.uk/guidance/cg156" },
    { label: "NHS: Trying for a baby", url: "https://www.nhs.uk/pregnancy/trying-for-a-baby/" },
    { label: "NHS: Vitamins, supplements and nutrition in pregnancy", url: "https://www.nhs.uk/pregnancy/keeping-well/vitamins-supplements-and-nutrition/" },
    { label: "FDA/EPA: Advice about eating fish", url: "https://www.fda.gov/food/consumers/advice-about-eating-fish" },
    { label: "ASRM Practice Committee: Optimizing natural fertility (Fertility and Sterility, 2022)" },
    { label: "Wilcox, Weinberg & Baird: Timing of intercourse in relation to ovulation (NEJM, 1995)" },
    { label: "Schisterman et al.: Folic acid and zinc in men, the FAZST trial (JAMA, 2020)" },
    { label: "Steiner et al.: Antioxidants and male infertility, the MOXI trial (Fertility and Sterility, 2020)" },
    { label: "Government of India: PCPNDT Act, 1994" },
  ],
  disclaimer:
    "General information, not medical advice. It can't replace a check-up. Please talk to your doctor before starting supplements, and about anything that worries you.",
};

// ── Extras: book summaries (for everyone) ─────────────────────────────────────
/**
 * Short summaries of books and ideas worth living with, written for Vidura Life
 * in our own words (no quoted passages). A taster, not a substitute for the books.
 */
export type BookTheme = "purpose" | "mind" | "love" | "strategy" | "wisdom";

export interface BookIdea {
  title: string;
  body: string;
}

export interface BookPart {
  title: string;
  native?: string;
  subtitle: string;
  summary: string;
  ideas: readonly string[];
}

export interface Book {
  id: string;
  title: string;
  author: string;
  year: string;
  origin: string;
  icon: string;
  theme: BookTheme;
  oneLine: string;
  summary: string;
  parts?: readonly BookPart[];
  ideas: readonly BookIdea[];
  tryThis: readonly string[];
  note?: string;
}

export const BOOK_THEMES: readonly { id: BookTheme; label: string; hue: string }[] = [
  { id: "purpose", label: "Purpose", hue: "#e9a23b" },
  { id: "mind", label: "Mind & spirit", hue: "#9b7ad8" },
  { id: "love", label: "Relationships", hue: "#e0607a" },
  { id: "strategy", label: "Strategy", hue: "#4d8fd6" },
  { id: "wisdom", label: "Ancient wisdom", hue: "#2ea99f" },
];

export const BOOKS: readonly Book[] = [
  {
    id: "japanese-ideas",
    title: "Ikigai, Kaizen, Hansei & Ichigo Ichie",
    author: "Four Japanese ideas",
    year: "Traditional · popular books 1986–2019",
    origin: "Japan",
    icon: "🎋",
    theme: "purpose",
    oneLine: "Four Japanese words for a life with purpose, steady improvement, honest reflection and presence.",
    summary:
      "These four words travel well: ikigai, a reason to get up in the morning; kaizen, small and continuous improvement; hansei, honest self-reflection; and ichigo ichie, treasuring each moment as one of a kind. Together they make a gentle way to run an ordinary day.",
    parts: [
      {
        title: "Ikigai",
        native: "生き甲斐",
        subtitle: "A reason for being",
        summary:
          "Made famous abroad by Héctor García and Francesc Miralles's Ikigai (2016), which visits the long-lived villagers of Ogimi in Okinawa. In Japan, ikigai is often small and everyday (a morning ritual, a garden, grandchildren) rather than one grand purpose. The four-circle diagram often shared online is a later Western addition.",
        ideas: [
          "Stay busy with what you love. Many Okinawan elders never fully retire from it.",
          "Eat until you're about 80% full (hara hachi bu).",
          "Keep close friends: a moai, a small group that meets and looks out for each other.",
          "Move gently every day, spend time outdoors, smile and give thanks.",
        ],
      },
      {
        title: "Kaizen",
        native: "改善",
        subtitle: "Change for the better",
        summary:
          "A pillar of post-war Japanese industry, made famous by Toyota and brought to the world by Masaaki Imai's Kaizen (1986). Applied to life, as in Robert Maurer's One Small Step Can Change Your Life, it means steps so small they feel almost silly. That's exactly why they stick.",
        ideas: [
          "Shrink the step until it's easy: one push-up, one minute of stillness, one glass of water.",
          "Improve a little every day rather than a lot once in a while.",
          "Ask small questions (what's one tiny thing I could do?) to slip past resistance.",
          "Keep what works, then improve it again.",
        ],
      },
      {
        title: "Hansei",
        native: "反省",
        subtitle: "Honest reflection",
        summary:
          "The habit of looking back honestly, at mistakes and at successes, and deciding what to do better next time. Children learn it at school, and companies such as Toyota hold reflection meetings even after projects that went well.",
        ideas: [
          "Reflect without blame: own your part, then fix the process.",
          "Look back after good days too. There's always something to learn.",
          "Turn every reflection into one concrete change.",
          "Keep it short and regular. Three lines at the end of the day is enough.",
        ],
      },
      {
        title: "Ichigo ichie",
        native: "一期一会",
        subtitle: "One time, one meeting",
        summary:
          "Born in the Japanese tea ceremony, the phrase reminds host and guest that this exact gathering will never happen again. García and Miralles explored it in The Book of Ichigo Ichie (2019). It's an invitation to be fully present, especially with people.",
        ideas: [
          "Treat ordinary meetings as once in a lifetime, because they are.",
          "Put the phone away and use all five senses.",
          "Savour small rituals: tea, a meal, a walk.",
          "Let go of what's gone and welcome what's here.",
        ],
      },
    ],
    ideas: [
      { title: "Purpose can be small", body: "Ikigai lives in daily joys as much as in big goals." },
      { title: "Tiny steps compound", body: "Kaizen trusts small daily improvements over dramatic overhauls." },
      { title: "Reflection is a skill", body: "Hansei turns every day, good or bad, into a lesson." },
      { title: "This moment is unrepeatable", body: "Ichigo ichie asks you to show up fully for it." },
    ],
    tryThis: [
      "Name one small thing that gave you ikigai today.",
      "Pick a one-minute kaizen step for tomorrow.",
      "Before bed, write three lines of hansei: what went well, what didn't, one change.",
      "Have one conversation today with your phone out of sight.",
    ],
  },
  {
    id: "autobiography-of-a-yogi",
    title: "Autobiography of a Yogi",
    author: "Paramahansa Yogananda",
    year: "1946",
    origin: "India · USA",
    icon: "🕉️",
    theme: "mind",
    oneLine: "A yogi's life story that introduced millions in the West to meditation and Kriya Yoga.",
    summary:
      "Yogananda tells his story from a devout childhood in Gorakhpur and Kolkata, through years of training with his guru Sri Yukteswar in Serampore and Puri, to his journey to America in 1920. There he spent most of his life teaching meditation and founded Self-Realization Fellowship. Along the way he meets saints, scientists and seekers, among them Jagadish Chandra Bose, Anandamayi Ma and Mahatma Gandhi.",
    ideas: [
      { title: "Kriya Yoga", body: "A breath and meditation practice passed down from Mahavatar Babaji through Lahiri Mahasaya and Sri Yukteswar, offered as a practical path to inner stillness." },
      { title: "Teacher and student", body: "Much of the book is about learning from a teacher who is both loving and exacting, and about discipline as a kind of freedom." },
      { title: "One truth, many paths", body: "Yogananda saw the teachings of Krishna and of Christ as pointing to the same experience of the divine." },
      { title: "An inner science", body: "He presents meditation as something to test through practice rather than accept on faith." },
    ],
    tryThis: [
      "Sit quietly for ten minutes and simply follow your breath.",
      "Read one chapter slowly and note a line that stays with you.",
      "Notice the stillness just after meditating, and carry it into your next task.",
    ],
    note: "The book's accounts of miracles are best read as the author's own experience and faith.",
  },
  {
    id: "the-alchemist",
    title: "The Alchemist",
    author: "Paulo Coelho",
    year: "1988",
    origin: "Brazil",
    icon: "🏜️",
    theme: "purpose",
    oneLine: "A shepherd boy follows a recurring dream across the desert and learns what it means to pursue your own path.",
    summary:
      "Santiago, a young shepherd in Andalusia, keeps dreaming of treasure hidden near the Egyptian pyramids. Encouraged by a mysterious old king, he sells his flock and sets out. He's robbed in Tangier, works for a crystal merchant, crosses the Sahara with a caravan, falls in love at an oasis and learns from an alchemist. When he finally reaches the pyramids, he discovers the treasure was waiting much closer to where he began.",
    ideas: [
      { title: "Your Personal Legend", body: "Everyone has something they're meant to do. Most people let it go under the weight of fear and routine." },
      { title: "Commitment attracts help", body: "The book's best-known idea: when you truly commit to something, circumstances seem to line up to help you." },
      { title: "Read the omens", body: "Signs and coincidences are the world's way of guiding you, if you pay attention." },
      { title: "Fear is the real obstacle", body: "The fear of failing stops people more often than failure itself." },
      { title: "The journey is the treasure", body: "What Santiago learns along the way matters as much as what he finds." },
    ],
    tryThis: [
      "Write your personal legend in one sentence.",
      "Take one small step today on something you keep postponing.",
      "Notice one coincidence and ask what it might be telling you.",
    ],
  },
  {
    id: "who-will-cry",
    title: "Who Will Cry When You Die?",
    author: "Robin Sharma",
    year: "1999",
    origin: "Canada",
    icon: "🕯️",
    theme: "purpose",
    oneLine: "101 short lessons for living so fully that your life leaves a mark on others.",
    summary:
      "From the author of The Monk Who Sold His Ferrari, this is a collection of 101 bite-sized lessons, each only a page or two long. Its title comes from an old saying: when you were born, you cried and the world rejoiced, so live in a way that, when you die, the world cries and you rejoice.",
    ideas: [
      { title: "Small daily rituals", body: "Rise early, sit in silence for a few minutes, read and keep a journal. Small habits, repeated, shape a life." },
      { title: "Know what matters", body: "Get clear on your values and your calling, then spend your time on them first." },
      { title: "Simplify", body: "Cut the clutter, noise and commitments that don't serve you." },
      { title: "People over things", body: "Be generous with kindness, praise and time, especially with family." },
      { title: "Live now", body: "Don't wait for someday to live fully. Time is short and doesn't come back." },
    ],
    tryThis: [
      "Wake 30 minutes earlier and use the time for quiet, reading or a walk.",
      "Write down three things you're grateful for tonight.",
      "Do one kind thing for someone who won't expect it.",
    ],
  },
  {
    id: "five-love-languages",
    title: "The 5 Love Languages",
    author: "Gary Chapman",
    year: "1992",
    origin: "USA",
    icon: "💞",
    theme: "love",
    oneLine: "People give and receive love in different ways. Learning each other's keeps love growing.",
    summary:
      "Counsellor Gary Chapman noticed that couples could love each other sincerely and still feel unloved, because each showed love the way they liked to receive it. He grouped these ways into five 'languages'. Learning your partner's, and teaching them yours, keeps each person's 'love tank' full long after the early excitement fades.",
    ideas: [
      { title: "Words of affirmation", body: "Compliments, encouragement, and saying thank you or I love you out loud." },
      { title: "Quality time", body: "Undivided attention: real conversation and shared activities, phones away." },
      { title: "Receiving gifts", body: "Thoughtful tokens that say I was thinking of you. The thought matters more than the price." },
      { title: "Acts of service", body: "Doing things that lighten the other's load: cooking, fixing, helping." },
      { title: "Physical touch", body: "Holding hands, hugs and closeness." },
    ],
    tryThis: [
      "Ask your partner, a friend or your child: when do you feel most loved?",
      "Try their language once this week, even if it isn't yours.",
      "Tell them yours, kindly and specifically.",
    ],
    note: "It's a popular framework rather than proven science: studies so far haven't backed its core claims. Asking what makes someone feel loved is still worth doing.",
  },
  {
    id: "art-of-war",
    title: "The Art of War",
    author: "Sun Tzu",
    year: "c. 5th century BCE",
    origin: "China",
    icon: "⚔️",
    theme: "strategy",
    oneLine: "An ancient guide to strategy: plan well, know both sides, and avoid needless conflict.",
    summary:
      "Thirteen short chapters attributed to the general Sun Tzu cover planning, the cost of war, strategy, terrain, manoeuvre and intelligence. Its lessons have travelled far beyond the battlefield, into business, sport, negotiation and everyday decisions.",
    ideas: [
      { title: "The best victory needs no battle", body: "Winning without fighting, through position, preparation and persuasion, is the highest skill." },
      { title: "Know yourself and the other side", body: "Understand your own strengths and weaknesses as well as your opponent's, and you'll rarely be caught out." },
      { title: "Plan before you act", body: "Victories are won in preparation. Weigh the conditions, the timing and the ground first." },
      { title: "Be like water", body: "Adapt to the situation instead of forcing a fixed plan. Flow around strength and into openings." },
      { title: "Long conflicts are costly", body: "No one benefits from a drawn-out struggle. End it quickly, or avoid it." },
    ],
    tryThis: [
      "Before a tough conversation, write down what the other person wants and why.",
      "Pick your battles: let one small thing go today.",
      "Plan your week before it plans you.",
    ],
  },
  {
    id: "tao-te-ching",
    title: "Tao Te Ching",
    author: "Lao Tzu (Laozi)",
    year: "c. 4th century BCE",
    origin: "China",
    icon: "☯️",
    theme: "wisdom",
    oneLine: "Eighty-one short poems on living in harmony with the Tao: simply, humbly, without forcing.",
    summary:
      "One of the most translated books in the world, traditionally credited to Laozi, a record-keeper at the Zhou court. In 81 brief chapters it describes the Tao, the nameless way things naturally unfold, and te, the quiet power of living in step with it. Its advice is gently paradoxical: yield to overcome, empty yourself to be filled, do less to achieve more.",
    ideas: [
      { title: "Wu wei", body: "Effortless action: work with the grain of things instead of against it." },
      { title: "The way of water", body: "Nothing is softer than water, yet it wears away stone. Gentleness and persistence win." },
      { title: "Enough is plenty", body: "Contentment and simplicity bring more peace than always wanting more." },
      { title: "Lead lightly", body: "The best leaders are barely noticed. When the work is done, people feel they did it themselves." },
      { title: "Opposites need each other", body: "Hard and soft, full and empty, high and low: each gives the other its meaning." },
    ],
    tryThis: [
      "Do one task today without rushing or forcing it.",
      "Clear one small space: a drawer, a desk, a phone screen.",
      "When you meet resistance, try yielding first, like water.",
    ],
  },
  {
    id: "analects",
    title: "The Analects",
    author: "Confucius",
    year: "Compiled c. 5th–3rd century BCE",
    origin: "China",
    icon: "📜",
    theme: "wisdom",
    oneLine: "Sayings and conversations of Confucius on character, learning, family and good leadership.",
    summary:
      "The Analects gather the sayings of Confucius and his students into 20 short books. Rather than a system, they offer glimpses of a teacher at work: answering questions, encouraging students, admitting his limits. Its picture of a good person, kind, courteous and always learning, shaped East Asian life for more than two thousand years.",
    ideas: [
      { title: "Ren: humaneness", body: "Genuine kindness and care for others is the heart of a good life." },
      { title: "Reciprocity", body: "Don't do to others what you wouldn't want done to you." },
      { title: "Li: courtesy and ritual", body: "Everyday rituals and good manners give respect a shape, at home and in public." },
      { title: "Keep learning", body: "Study, then practise what you've learned. The joy is in both." },
      { title: "Check yourself daily", body: "One of his students asked himself every day: was I loyal, was I trustworthy, did I practise what I was taught?" },
      { title: "Lead by example", body: "People follow what leaders do far more than what they say." },
    ],
    tryThis: [
      "Put reciprocity into practice in one conversation today.",
      "Learn one new thing and use it before the day ends.",
      "End the day with those three questions.",
    ],
  },
  {
    id: "i-ching",
    title: "I Ching, the Book of Changes",
    author: "Traditional Chinese classic",
    year: "Core text c. 1000–750 BCE",
    origin: "China",
    icon: "🌓",
    theme: "wisdom",
    oneLine: "An ancient book of 64 symbols for change, read for centuries as a guide to timing and wise action.",
    summary:
      "The I Ching (Yijing) is one of the oldest Chinese classics. Its core is 64 hexagrams: figures of six stacked lines, each broken (yin) or unbroken (yang), each paired with a short text on a situation such as beginnings, conflict, patience or breakthrough. Later commentaries, traditionally credited to Confucius and known as the Ten Wings, made it a book of philosophy about how change works.",
    ideas: [
      { title: "Change is the one constant", body: "Every situation is in motion. The question isn't whether it will change, but how." },
      { title: "Timing matters", body: "The same action can be wise or foolish depending on the moment. Sometimes waiting is the move." },
      { title: "Seeds of the opposite", body: "Strength holds the beginning of weakness, and difficulty the beginning of ease." },
      { title: "Adapt with integrity", body: "Its recurring figure, the noble person, adapts to circumstances without giving up their principles." },
    ],
    tryThis: [
      "Facing a decision? Write down how the situation is changing and what good timing would look like.",
      "Ask whether this is a moment to act, or to wait and prepare.",
      "Notice one difficulty that has quietly started to ease.",
    ],
    note: "Traditionally it's consulted by tossing coins or sorting yarrow stalks. Many readers today use it as a prompt for reflection rather than a forecast.",
  },
];

// ── Welcome messages (the artifact's 15 affirmations + 17 new) ────────────────
export const MESSAGES: readonly Message[] = [
  { text: "You are in charge!", sub: "Every choice you make today is a vote for the healthier you.", emoji: "👑" },
  { text: "Glad you're taking care of yourself.", sub: "Self-care isn't selfish. It's the smartest thing you can do.", emoji: "🌟" },
  { text: "Small steps. Big results.", sub: "Consistency beats perfection every single time.", emoji: "🚀" },
  { text: "Your body is listening.", sub: "Every meal, every step, every breath. It all counts.", emoji: "❤️" },
  { text: "Progress, not perfection.", sub: "You showed up today. That's already a win.", emoji: "✨" },
  { text: "You're stronger than you think.", sub: "The fact that you're here proves it.", emoji: "💪" },
  { text: "Healing is happening.", sub: "Trust the process. Be gentle with yourself.", emoji: "🌱" },
  { text: "Today is a fresh start.", sub: "Yesterday doesn't define your wellness journey. Today does.", emoji: "🌅" },
  { text: "Fuel your greatness.", sub: "What you eat today is building the you of tomorrow.", emoji: "⚡" },
  { text: "You deserve to feel amazing.", sub: "Not someday. Starting now, one good choice at a time.", emoji: "🌸" },
  { text: "Your health is your wealth.", sub: "No investment pays better than the one you make in yourself.", emoji: "💎" },
  { text: "Be patient with yourself.", sub: "Real change takes time. You're doing better than you know.", emoji: "🕊️" },
  { text: "One day at a time.", sub: "You don't have to change everything today. Just today.", emoji: "🗓️" },
  { text: "Mind. Body. Spirit, aligned.", sub: "Wellness is a whole-person journey. Keep going.", emoji: "🧘" },
  { text: "You showed up. That matters.", sub: "Opening this app is the first rep of your day.", emoji: "🏆" },
  { text: "Slow is still forward.", sub: "Gentle progress is still progress.", emoji: "🐢" },
  { text: "Breathe. You're right on time.", sub: "There's no race here, just your own rhythm.", emoji: "🌬️" },
  { text: "Rest is productive.", sub: "Recovery is where the good work settles in.", emoji: "🛌" },
  { text: "Water, light, movement.", sub: "Three simple things. You've got this.", emoji: "💧" },
  { text: "Your pace is the right pace.", sub: "Comparison steals calm. Keep your eyes on your own path.", emoji: "🧭" },
  { text: "Kindness starts with you.", sub: "Speak to yourself the way you would to a good friend.", emoji: "🤍" },
  { text: "Every meal is a fresh choice.", sub: "No need to be perfect. Just thoughtful.", emoji: "🍲" },
  { text: "Little rituals, lasting change.", sub: "The small things you repeat become who you are.", emoji: "🪔" },
  { text: "Softer mornings, stronger days.", sub: "How you begin shapes everything after.", emoji: "☀️" },
  { text: "You're allowed to slow down.", sub: "Calm isn't a luxury. It's a practice.", emoji: "🍃" },
  { text: "Nourish, don't punish.", sub: "Food is care. Movement is a celebration.", emoji: "🥭" },
  { text: "The sun rose for you too.", sub: "Another day, another chance to feel good.", emoji: "🌄" },
  { text: "Listen inward.", sub: "Your body speaks softly. Today, listen.", emoji: "👂" },
  { text: "Consistency is a quiet superpower.", sub: "Show up gently, again and again.", emoji: "🔁" },
  { text: "Evenings are for unwinding.", sub: "Let the day go. You did enough.", emoji: "🌙" },
  { text: "Your future self says thank you.", sub: "What you do today is a gift to them.", emoji: "🎁" },
  { text: "Joy counts as wellness too.", sub: "Laugh, stretch, call someone you love.", emoji: "😊" },
];

// ── Regional meal plans (generated) ───────────────────────────────────────────
// <generated:meals>
// Extracted from the original "Wellness app" artifact by scripts/extract-artifact.mjs.
// 126 day plans · 6 regions × 3 diets × 7 days × 6 meal slots. Re-run the script to refresh.
export const MEAL_PLANS: Record<RegionId, Record<DietId, readonly DayPlan[]>> = {
  "pan-indian": {
    "vegetarian": [
      {
        theme: "Detox & Reset", emoji: "🌱",
        early: { title: "Methi + Lemon Water", detail: "Methi water + warm lemon + garlic clove", protein: 1 },
        breakfast: { title: "Oats Upma", detail: "Rolled oats with carrot, peas, capsicum in olive oil", protein: 7 },
        midMorning: { title: "Amla + Walnuts", detail: "Fresh amla + 5 soaked walnuts + pumpkin seeds", protein: 6 },
        lunch: { title: "Brown Rice + Moong Dal", detail: "Brown rice + moong dal tadka + cucumber-onion salad", protein: 11 },
        snack: { title: "Roasted Chana", detail: "½ cup roasted chana + warm jeera water", protein: 10 },
        dinner: { title: "Bajra Roti + Palak Sabzi", detail: "2 bajra rotis + spinach-garlic sabzi", protein: 10 },
      },
      {
        theme: "Fibre Power", emoji: "🥣",
        early: { title: "Methi + Amla Water", detail: "Methi water + amla juice + 8 curry leaves chewed", protein: 1 },
        breakfast: { title: "Daliya Khichdi", detail: "Broken wheat khichdi with mixed veggies + small curd", protein: 14 },
        midMorning: { title: "Guava + Cinnamon Water", detail: "1 whole guava + cinnamon water", protein: 2 },
        lunch: { title: "Rajma + Jowar Roti", detail: "Rajma curry + 2 jowar rotis + raw veggie salad", protein: 17 },
        snack: { title: "Makhana", detail: "1 cup roasted makhana with turmeric", protein: 3 },
        dinner: { title: "Moong Dal Soup + Methi Roti", detail: "Light moong soup + 2 fenugreek rotis", protein: 12 },
      },
      {
        theme: "Omega-3 Focus", emoji: "❤️",
        early: { title: "Garlic + Jeera Water", detail: "Crushed garlic in warm jeera water", protein: 0 },
        breakfast: { title: "Walnut Smoothie", detail: "Banana + 4 walnuts + 200ml low-fat milk blended", protein: 10 },
        midMorning: { title: "Mixed Seeds", detail: "1 tbsp each sunflower + pumpkin + flaxseeds", protein: 6 },
        lunch: { title: "Chana Dal + Ragi Roti", detail: "Chana dal + 2 ragi rotis + small curd", protein: 17 },
        snack: { title: "Sprouts Salad", detail: "Moong sprouts + lemon + pepper + onion + tomato", protein: 7 },
        dinner: { title: "Vegetable Khichdi", detail: "Moong dal + brown rice khichdi + ½ tsp ghee", protein: 9 },
      },
      {
        theme: "Anti-Inflammatory", emoji: "🌸",
        early: { title: "Turmeric-Ginger Kadha", detail: "Turmeric + ginger + black pepper in water", protein: 0 },
        breakfast: { title: "Moong Dal Chilla", detail: "3 moong chillas with mint chutney", protein: 18 },
        midMorning: { title: "Papaya", detail: "1 cup papaya", protein: 1 },
        lunch: { title: "Sambhar + Brown Rice", detail: "Mixed lentil sambhar + ½ cup brown rice + raita", protein: 11 },
        snack: { title: "Green Tea + Almonds", detail: "Masala green tea + 4 almonds", protein: 1 },
        dinner: { title: "Paneer Bhurji + Rotis", detail: "Low-fat paneer bhurji + 2 flaxseed wheat rotis", protein: 26 },
      },
      {
        theme: "Millet Magic", emoji: "🌾",
        early: { title: "Methi + Jamun Seed", detail: "Methi water + ½ tsp jamun seed powder", protein: 1 },
        breakfast: { title: "Ragi Porridge", detail: "Ragi porridge with cinnamon, unsweetened", protein: 3 },
        midMorning: { title: "Amla-Flax Smoothie", detail: "Amla + flaxseeds + ginger blended", protein: 2 },
        lunch: { title: "Toor Dal + Jowar Bhakri", detail: "Toor dal tadka + 2 jowar bhakris + raw onion", protein: 15 },
        snack: { title: "Steamed Dhokla", detail: "2 steamed dhokla — fermented", protein: 6 },
        dinner: { title: "Dalia + Buttermilk", detail: "Cracked wheat veg soup + jeera buttermilk", protein: 7 },
      },
      {
        theme: "Gut Health Day", emoji: "🥛",
        early: { title: "Methi + Tulsi", detail: "Methi water + 5 tulsi leaves chewed", protein: 1 },
        breakfast: { title: "Idli + Sambar", detail: "3 steamed idlis + light sambar + chutney", protein: 11 },
        midMorning: { title: "Pomegranate", detail: "½ pomegranate", protein: 2 },
        lunch: { title: "Chole + Brown Rice + Raita", detail: "Chickpea curry + ½ cup brown rice + cucumber raita", protein: 14 },
        snack: { title: "Curd + Chia Seeds", detail: "Low-fat curd + 1 tbsp soaked chia seeds", protein: 6 },
        dinner: { title: "Lauki Soup + Roti", detail: "Bottle gourd soup + ginger + garlic + 1–2 rotis", protein: 7 },
      },
      {
        theme: "Renewal", emoji: "✨",
        early: { title: "Super Detox Drink", detail: "Warm water + lemon + honey + cinnamon + turmeric", protein: 0 },
        breakfast: { title: "Flaxseed Poha", detail: "Brown rice poha + curry leaves + peas + 1 tbsp flaxseeds", protein: 7 },
        midMorning: { title: "Mixed Seasonal Fruit", detail: "Berries + papaya + pomegranate — whole fruit only", protein: 2 },
        lunch: { title: "Balanced Thali", detail: "Brown rice + dal + 2 sabzis + salad + 1 roti", protein: 16 },
        snack: { title: "Chana + Tulsi Tea", detail: "Roasted chana + tulsi-ginger herbal tea", protein: 10 },
        dinner: { title: "Light Khichdi", detail: "Moong-veg khichdi + roasted papad", protein: 11 },
      },
    ],
    "non-vegetarian": [
      {
        theme: "Detox & Reset", emoji: "🌱",
        early: { title: "Methi + Lemon Water", detail: "Methi water + warm lemon + crushed garlic", protein: 1 },
        breakfast: { title: "Egg White Omelette", detail: "2-egg white omelette + spinach + multigrain toast", protein: 13 },
        midMorning: { title: "Amla + Walnuts", detail: "Fresh amla + 5 walnuts + 2 tbsp pumpkin seeds", protein: 8 },
        lunch: { title: "Grilled Fish + Brown Rice", detail: "150g grilled rohu/surmai + ½ cup brown rice + salad", protein: 31 },
        snack: { title: "Roasted Chana", detail: "½ cup chana + jeera water", protein: 10 },
        dinner: { title: "Bajra Roti + Chicken Curry", detail: "2 bajra rotis + skinless chicken curry, min oil", protein: 28 },
      },
      {
        theme: "Protein Power", emoji: "💪",
        early: { title: "Methi + Amla Water", detail: "Methi water + amla juice + curry leaves", protein: 1 },
        breakfast: { title: "Eggs + Daliya", detail: "2 boiled eggs + broken wheat porridge with veggies", protein: 20 },
        midMorning: { title: "Guava + Pumpkin Seeds", detail: "1 whole guava + 1 tbsp pumpkin seeds", protein: 4 },
        lunch: { title: "Grilled Chicken + Jowar Roti", detail: "150g chicken breast + 2 jowar rotis + salad", protein: 44 },
        snack: { title: "Sprouts + Curd", detail: "Moong sprouts in curd", protein: 11 },
        dinner: { title: "Fish Soup + Methi Roti", detail: "Clear fish soup with veggies + 2 methi rotis", protein: 17 },
      },
      {
        theme: "Omega-3 Day", emoji: "❤️",
        early: { title: "Garlic + Jeera Water", detail: "Crushed garlic in warm jeera water", protein: 0 },
        breakfast: { title: "Mackerel + Roti", detail: "100g grilled mackerel + 1 multigrain roti", protein: 22 },
        midMorning: { title: "Seeds + Amla", detail: "Flaxseed + sunflower seeds + amla water", protein: 4 },
        lunch: { title: "Egg Curry + Brown Rice", detail: "2-egg curry (low oil) + ½ cup brown rice + raita", protein: 18 },
        snack: { title: "Makhana + Green Tea", detail: "1 cup makhana + unsweetened green tea", protein: 3 },
        dinner: { title: "Grilled Prawns + Khichdi", detail: "100g grilled prawns + moong-veg khichdi", protein: 29 },
      },
      {
        theme: "Anti-Inflammatory", emoji: "🌸",
        early: { title: "Turmeric-Ginger Decoction", detail: "Turmeric + ginger + black pepper in water", protein: 0 },
        breakfast: { title: "Scrambled Eggs + Oats", detail: "2-egg scramble with turmeric + oats upma", protein: 18 },
        midMorning: { title: "Papaya", detail: "1 cup papaya", protein: 1 },
        lunch: { title: "Chicken Sambhar + Rice", detail: "Chicken in sambhar + ½ cup brown rice + raita", protein: 31 },
        snack: { title: "Green Tea + Almonds", detail: "Ginger-cardamom green tea + 4 almonds", protein: 1 },
        dinner: { title: "Fish Tikka + Roti", detail: "2 grilled fish tikka + 2 flaxseed rotis", protein: 24 },
      },
      {
        theme: "Millet Day", emoji: "🌾",
        early: { title: "Methi + Jamun Seed", detail: "Methi water + ½ tsp jamun seed powder", protein: 1 },
        breakfast: { title: "Ragi Dosa + Egg", detail: "2 ragi dosas + 1 boiled egg + coconut chutney", protein: 12 },
        midMorning: { title: "Amla-Flax Smoothie", detail: "Amla + flaxseeds + ginger blended", protein: 2 },
        lunch: { title: "Lean Keema + Jowar Bhakri", detail: "Chicken keema (min oil) + 2 jowar bhakris + salad", protein: 29 },
        snack: { title: "Steamed Idli", detail: "2 idlis + mint chutney", protein: 4 },
        dinner: { title: "Chicken Bone Broth + Dalia", detail: "Clear chicken broth + veg dalia", protein: 13 },
      },
      {
        theme: "Gut Health", emoji: "🥛",
        early: { title: "Methi + Tulsi", detail: "Methi water + 5 tulsi leaves", protein: 1 },
        breakfast: { title: "Egg Bhurji + Toast", detail: "2-egg bhurji + spinach + 1 multigrain toast", protein: 18 },
        midMorning: { title: "Pomegranate + Curd", detail: "½ pomegranate + curd", protein: 6 },
        lunch: { title: "Fish Curry + Brown Rice", detail: "Light tomato-base fish curry + ½ cup brown rice", protein: 20 },
        snack: { title: "Chia Curd", detail: "Homemade curd + 1 tbsp soaked chia seeds", protein: 6 },
        dinner: { title: "Chicken Soup + Roti", detail: "Thin chicken-vegetable soup + 1 wheat roti", protein: 11 },
      },
      {
        theme: "Renewal & Strength", emoji: "✨",
        early: { title: "Super Detox Drink", detail: "Warm water + lemon + honey + cinnamon + turmeric", protein: 0 },
        breakfast: { title: "Flaxseed Poha + Egg", detail: "Brown rice poha + curry leaves + 1 boiled egg", protein: 9 },
        midMorning: { title: "Mixed Fruit", detail: "Berries + papaya + pomegranate — whole fruit only", protein: 2 },
        lunch: { title: "Grilled Chicken Thali", detail: "Grilled chicken + dal + sabzi + salad + 1 roti", protein: 29 },
        snack: { title: "Chana + Tulsi Tea", detail: "Roasted chana + tulsi-ginger tea", protein: 10 },
        dinner: { title: "Light Khichdi + Fish", detail: "Moong-veg khichdi + 80g steamed fish", protein: 23 },
      },
    ],
    "vegan": [
      {
        theme: "Detox & Reset", emoji: "🌱",
        early: { title: "Methi + Lemon + Garlic", detail: "Methi water + warm lemon + garlic + turmeric", protein: 1 },
        breakfast: { title: "Oats Upma (Dairy-free)", detail: "Oats upma with veggies in olive oil + green tea", protein: 7 },
        midMorning: { title: "Amla + Walnuts + Pumpkin Seeds", detail: "Fresh amla + walnuts + pumpkin seeds", protein: 5 },
        lunch: { title: "Brown Rice + Moong Dal", detail: "Brown rice + moong dal (mustard oil) + raw salad", protein: 11 },
        snack: { title: "Roasted Chana + Jeera Water", detail: "½ cup roasted chana + warm jeera water", protein: 10 },
        dinner: { title: "Bajra Roti + Palak Sabzi", detail: "2 bajra rotis + spinach-garlic sabzi", protein: 10 },
      },
      {
        theme: "Plant Protein", emoji: "🥣",
        early: { title: "Methi + Amla", detail: "Methi water + amla juice + curry leaves", protein: 1 },
        breakfast: { title: "Tofu Scramble + Roti", detail: "Crumbled tofu scramble with turmeric + 1 multigrain roti", protein: 15 },
        midMorning: { title: "Guava + Mixed Seeds", detail: "1 whole guava + sunflower + pumpkin seeds", protein: 6 },
        lunch: { title: "Rajma + Jowar Roti", detail: "Rajma curry (no dairy) + 2 jowar rotis + salad", protein: 17 },
        snack: { title: "Makhana", detail: "1 cup roasted makhana with turmeric", protein: 3 },
        dinner: { title: "Moong Dal Soup + Methi Roti", detail: "Moong soup + 2 fenugreek rotis", protein: 12 },
      },
      {
        theme: "Omega-3 Focus", emoji: "❤️",
        early: { title: "Garlic + Jeera Water", detail: "Crushed garlic in warm jeera water", protein: 0 },
        breakfast: { title: "Chia Oat Bowl", detail: "Oats soaked in oat milk + 1 tbsp chia + banana + cinnamon", protein: 9 },
        midMorning: { title: "Mixed Seeds", detail: "1 tbsp each flaxseed + chia + hemp seeds", protein: 7 },
        lunch: { title: "Chana Dal + Ragi Roti", detail: "Chana dal + 2 ragi rotis", protein: 14 },
        snack: { title: "Sprouts Salad", detail: "Moong + chana sprouts + lemon + pepper + onion", protein: 8 },
        dinner: { title: "Vegetable Khichdi", detail: "Moong + brown rice khichdi + ½ tsp coconut oil", protein: 9 },
      },
      {
        theme: "Anti-Inflammatory", emoji: "🌸",
        early: { title: "Turmeric-Ginger Kadha", detail: "Turmeric + ginger + black pepper in water", protein: 0 },
        breakfast: { title: "Moong Dal Chilla", detail: "3 moong chillas with mint chutney", protein: 18 },
        midMorning: { title: "Papaya + Ginger", detail: "1 cup papaya + pinch ginger powder", protein: 1 },
        lunch: { title: "Vegan Sambhar + Brown Rice", detail: "Lentil sambhar (no ghee) + ½ cup brown rice", protein: 8 },
        snack: { title: "Green Tea + Almonds", detail: "Masala green tea + 4 almonds", protein: 1 },
        dinner: { title: "Tofu Bhurji + Rotis", detail: "Tofu bhurji + turmeric + black pepper + 2 wheat rotis", protein: 18 },
      },
      {
        theme: "Millet Day", emoji: "🌾",
        early: { title: "Methi + Jamun Seed", detail: "Methi water + ½ tsp jamun seed powder", protein: 1 },
        breakfast: { title: "Ragi Porridge (Dairy-free)", detail: "Ragi in oat milk + cinnamon, no sugar", protein: 4 },
        midMorning: { title: "Amla-Flax Smoothie", detail: "Amla + flaxseeds + water + ginger blended", protein: 2 },
        lunch: { title: "Toor Dal + Jowar Bhakri", detail: "Toor dal tadka + 2 jowar bhakris + raw onion", protein: 15 },
        snack: { title: "Steamed Dhokla", detail: "2 steamed dhokla — fermented", protein: 6 },
        dinner: { title: "Dalia Soup", detail: "Cracked wheat vegetable soup + roasted papad", protein: 7 },
      },
      {
        theme: "Gut Health", emoji: "🥛",
        early: { title: "Methi + Tulsi", detail: "Methi water + 5 tulsi leaves", protein: 1 },
        breakfast: { title: "Idli + Vegan Sambar", detail: "3 idlis + vegan sambar (no ghee) + coconut chutney", protein: 12 },
        midMorning: { title: "Pomegranate", detail: "½ pomegranate", protein: 2 },
        lunch: { title: "Chole + Brown Rice", detail: "Chickpeas (olive oil) + ½ cup brown rice + kachumber salad", protein: 12 },
        snack: { title: "Coconut Yoghurt + Chia", detail: "Vegan coconut yoghurt + 1 tbsp soaked chia seeds", protein: 3 },
        dinner: { title: "Lauki Soup + Roti", detail: "Bottle gourd soup + garlic + ginger + 1–2 rotis", protein: 7 },
      },
      {
        theme: "Renewal", emoji: "✨",
        early: { title: "Super Detox Drink", detail: "Warm water + lemon + maple syrup + cinnamon + turmeric", protein: 0 },
        breakfast: { title: "Flaxseed Poha", detail: "Brown rice poha + curry leaves + peas + 1 tbsp flaxseeds", protein: 7 },
        midMorning: { title: "Mixed Fruit", detail: "Berries + papaya + pomegranate — whole fruit only", protein: 2 },
        lunch: { title: "Vegan Thali", detail: "Brown rice + dal + 2 sabzis + salad + 1 roti", protein: 16 },
        snack: { title: "Chana + Tulsi Tea", detail: "Roasted chana + tulsi-ginger herbal tea", protein: 10 },
        dinner: { title: "Light Khichdi", detail: "Moong-veg khichdi (no ghee) + roasted papad", protein: 11 },
      },
    ],
  },
  "north-indian": {
    "vegetarian": [
      {
        theme: "Detox & Reset", emoji: "🌱",
        early: { title: "Methi + Warm Lemon", detail: "Methi water + lemon + raw garlic + pinch hing", protein: 1 },
        breakfast: { title: "Oats Upma", detail: "Rolled oats with carrot, peas, capsicum, mustard seeds", protein: 7 },
        midMorning: { title: "Amla + Soaked Almonds", detail: "Fresh amla + 5 almonds + 2 walnuts", protein: 2 },
        lunch: { title: "Brown Rice + Moong Dal", detail: "Light moong dal tadka + brown rice + kachumber salad", protein: 11 },
        snack: { title: "Roasted Chana", detail: "½ cup roasted chana + warm jeera water", protein: 10 },
        dinner: { title: "Bajra Roti + Lauki Sabzi", detail: "2 bajra rotis + bottle gourd sabzi — light dinner", protein: 10 },
      },
      {
        theme: "Fibre Power", emoji: "🥣",
        early: { title: "Methi + Amla Water", detail: "Methi water + amla juice + curry leaves", protein: 1 },
        breakfast: { title: "Daliya (Broken Wheat) Khichdi", detail: "Daliya khichdi with mixed veggies + small curd", protein: 14 },
        midMorning: { title: "Guava + Cinnamon Water", detail: "1 whole guava + cinnamon water", protein: 2 },
        lunch: { title: "Rajma + Jowar Roti", detail: "Rajma curry + 2 jowar rotis + raw onion salad", protein: 17 },
        snack: { title: "Makhana", detail: "1 cup dry-roasted makhana with turmeric + jeera", protein: 3 },
        dinner: { title: "Moong Dal Soup + Methi Thepla", detail: "Light moong soup + 2 fenugreek theplas", protein: 12 },
      },
      {
        theme: "Heart-Healthy Fats", emoji: "❤️",
        early: { title: "Garlic + Jeera Water", detail: "1 raw garlic in warm jeera water", protein: 0 },
        breakfast: { title: "Sarson ka Saag + Makki Roti", detail: "Light mustard greens saag + 1 makki roti", protein: 7 },
        midMorning: { title: "Mixed Seeds", detail: "1 tbsp each flaxseed + pumpkin + sunflower seeds", protein: 6 },
        lunch: { title: "Chana Dal + Ragi Roti", detail: "Chana dal + 2 ragi rotis + cucumber raita", protein: 17 },
        snack: { title: "Moong Sprouts Chaat", detail: "Moong sprouts + lemon + chaat masala (no fried base)", protein: 7 },
        dinner: { title: "Vegetable Khichdi", detail: "Moong dal + brown rice khichdi + ½ tsp desi ghee", protein: 9 },
      },
      {
        theme: "Anti-Inflammatory", emoji: "🌸",
        early: { title: "Haldi-Adrak Kadha", detail: "Turmeric + ginger + black pepper + tulsi water", protein: 0 },
        breakfast: { title: "Besan Cheela", detail: "2 besan cheelas with spinach + mint-coriander chutney", protein: 12 },
        midMorning: { title: "Papaya + Ginger", detail: "1 cup papaya + pinch dry ginger powder", protein: 1 },
        lunch: { title: "Palak Paneer (Light) + Brown Rice", detail: "Low-fat palak paneer + ½ cup brown rice", protein: 17 },
        snack: { title: "Green Tea + Akhrot", detail: "Tulsi green tea + 4 walnuts", protein: 2 },
        dinner: { title: "Dal Tadka + Bajra Roti", detail: "Simple arhar dal tadka + 2 bajra rotis", protein: 15 },
      },
      {
        theme: "Millet Magic", emoji: "🌾",
        early: { title: "Methi + Jamun Seed Water", detail: "Methi water + ½ tsp jamun seed powder", protein: 1 },
        breakfast: { title: "Ragi Porridge", detail: "Ragi dalia with cinnamon + a pinch of cardamom, no sugar", protein: 3 },
        midMorning: { title: "Amla-Flax Smoothie", detail: "Amla + 1 tbsp flaxseeds + ginger blended", protein: 2 },
        lunch: { title: "Jowar Roti + Arhar Dal", detail: "2 jowar rotis + arhar dal + raw onion + nimbu", protein: 15 },
        snack: { title: "Steamed Dhokla", detail: "2 steamed dhoklas — fermented", protein: 6 },
        dinner: { title: "Bajra Khichdi", detail: "Bajra + moong dal khichdi with lauki", protein: 11 },
      },
      {
        theme: "Gut Health Day", emoji: "🥛",
        early: { title: "Methi + Tulsi", detail: "Methi water + 5 tulsi leaves chewed", protein: 1 },
        breakfast: { title: "Poha with Flaxseeds", detail: "Brown rice poha + mustard seeds + curry leaves + 1 tbsp flaxseeds", protein: 5 },
        midMorning: { title: "Pomegranate", detail: "½ pomegranate", protein: 2 },
        lunch: { title: "Chole + Brown Rice + Raita", detail: "Chickpea curry + ½ cup brown rice + cucumber raita", protein: 14 },
        snack: { title: "Dahi + Chia Seeds", detail: "Homemade dahi + 1 tbsp soaked chia seeds", protein: 6 },
        dinner: { title: "Lauki Sabzi + Bajra Roti", detail: "Bottle gourd with garlic + 1–2 bajra rotis", protein: 8 },
      },
      {
        theme: "Renewal", emoji: "✨",
        early: { title: "Super Detox Drink", detail: "Warm water + lemon + honey + cinnamon + haldi", protein: 0 },
        breakfast: { title: "Sabudana Khichdi (small)", detail: "Small portion sabudana khichdi + peanuts (Sunday special)", protein: 4 },
        midMorning: { title: "Mixed Seasonal Fruit", detail: "Papaya + pomegranate + berries — whole fruit only", protein: 2 },
        lunch: { title: "Full North Indian Thali", detail: "Dal + sabzi + small brown rice + 1 roti + salad", protein: 15 },
        snack: { title: "Roasted Makhana + Herbal Tea", detail: "Makhana + tulsi-ginger tea, no sugar", protein: 3 },
        dinner: { title: "Moong Dal Khichdi", detail: "Light moong-veg khichdi + 1 tsp ghee + roasted papad", protein: 11 },
      },
    ],
    "non-vegetarian": [
      {
        theme: "Detox & Reset", emoji: "🌱",
        early: { title: "Methi + Lemon", detail: "Methi water + warm lemon + crushed garlic", protein: 1 },
        breakfast: { title: "Anda Bhurji + Multigrain Toast", detail: "2-egg bhurji with spinach + 1 multigrain toast", protein: 18 },
        midMorning: { title: "Amla + Walnuts", detail: "Fresh amla + 5 walnuts + pumpkin seeds", protein: 6 },
        lunch: { title: "Grilled Murgh + Brown Rice", detail: "150g grilled chicken (no cream) + ½ cup brown rice + salad", protein: 38 },
        snack: { title: "Roasted Chana", detail: "½ cup chana + jeera water", protein: 10 },
        dinner: { title: "Bajra Roti + Keema Matar (light)", detail: "2 bajra rotis + lean chicken keema + green peas, min oil", protein: 30 },
      },
      {
        theme: "Protein Power", emoji: "💪",
        early: { title: "Methi + Amla", detail: "Methi water + amla juice + curry leaves", protein: 1 },
        breakfast: { title: "Boiled Anda + Daliya", detail: "2 boiled eggs + broken wheat porridge with veggies", protein: 20 },
        midMorning: { title: "Guava + Seeds", detail: "1 whole guava + pumpkin seeds", protein: 4 },
        lunch: { title: "Murgh Shorba + Jowar Roti", detail: "Light chicken shorba (broth-based) + 2 jowar rotis", protein: 16 },
        snack: { title: "Sprouts + Dahi", detail: "Moong sprouts + curd", protein: 11 },
        dinner: { title: "Fish Curry + Bajra Roti", detail: "Light rohu/surmai curry (mustard base) + 2 bajra rotis", protein: 25 },
      },
      {
        theme: "Omega-3 Day", emoji: "❤️",
        early: { title: "Garlic + Jeera Water", detail: "Crushed garlic in warm jeera water", protein: 0 },
        breakfast: { title: "Mackerel Tikka + Roti", detail: "100g grilled mackerel + 1 multigrain roti", protein: 22 },
        midMorning: { title: "Seeds + Amla", detail: "Flaxseed + sunflower seeds + amla water", protein: 4 },
        lunch: { title: "Anda Curry + Brown Rice", detail: "2-egg curry (low oil, no cream) + ½ cup brown rice + raita", protein: 18 },
        snack: { title: "Makhana + Green Tea", detail: "1 cup makhana + unsweetened tulsi tea", protein: 3 },
        dinner: { title: "Grilled Tangri + Khichdi", detail: "2 grilled chicken tangri (no butter) + moong khichdi", protein: 35 },
      },
      {
        theme: "Anti-Inflammatory", emoji: "🌸",
        early: { title: "Haldi-Adrak Kadha", detail: "Turmeric + ginger + pepper in water", protein: 0 },
        breakfast: { title: "Anda Omelette + Oats", detail: "2-egg omelette with haldi + oats upma", protein: 18 },
        midMorning: { title: "Papaya", detail: "1 cup papaya", protein: 1 },
        lunch: { title: "Murgh Saag + Brown Rice", detail: "Chicken in light spinach gravy + ½ cup brown rice", protein: 25 },
        snack: { title: "Green Tea + Akhrot", detail: "Ginger-cardamom green tea + 4 walnuts", protein: 2 },
        dinner: { title: "Fish Tikka + Bajra Roti", detail: "2 grilled fish tikka (no cream) + 2 bajra rotis", protein: 24 },
      },
      {
        theme: "Millet Day", emoji: "🌾",
        early: { title: "Methi + Jamun Seed", detail: "Methi water + ½ tsp jamun seed powder", protein: 1 },
        breakfast: { title: "Ragi Dosa + Anda", detail: "2 ragi dosas + 1 boiled egg + green chutney", protein: 11 },
        midMorning: { title: "Amla-Flax Smoothie", detail: "Amla + flaxseeds + ginger blended", protein: 2 },
        lunch: { title: "Murgh Shorba + Jowar Bhakri", detail: "Thin chicken broth + 2 jowar bhakris + salad", protein: 17 },
        snack: { title: "Steamed Idli", detail: "2 idlis + mint chutney", protein: 4 },
        dinner: { title: "Murgi ka Saalan + Bajra Roti", detail: "Light chicken saalan + 2 bajra rotis", protein: 28 },
      },
      {
        theme: "Gut Health", emoji: "🥛",
        early: { title: "Methi + Tulsi", detail: "Methi water + 5 tulsi leaves", protein: 1 },
        breakfast: { title: "Anda Bhurji + Toast", detail: "2-egg bhurji + spinach + multigrain toast", protein: 18 },
        midMorning: { title: "Pomegranate + Dahi", detail: "½ pomegranate + curd", protein: 6 },
        lunch: { title: "Macchi Curry + Brown Rice", detail: "Light tomato-base fish curry + ½ cup brown rice", protein: 20 },
        snack: { title: "Chia Dahi", detail: "Homemade curd + 1 tbsp soaked chia seeds", protein: 6 },
        dinner: { title: "Murgi Shorba + Roti", detail: "Thin chicken-vegetable broth + 1 bajra roti", protein: 12 },
      },
      {
        theme: "Renewal", emoji: "✨",
        early: { title: "Super Detox Drink", detail: "Warm water + lemon + honey + cinnamon + haldi", protein: 0 },
        breakfast: { title: "Poha + Anda", detail: "Brown rice poha + curry leaves + 1 boiled egg", protein: 9 },
        midMorning: { title: "Mixed Fruit", detail: "Papaya + pomegranate + berries only", protein: 2 },
        lunch: { title: "Tandoori Murgh Thali", detail: "Grilled chicken + dal + sabzi + salad + 1 roti", protein: 29 },
        snack: { title: "Chana + Tulsi Tea", detail: "Roasted chana + tulsi-ginger tea", protein: 10 },
        dinner: { title: "Khichdi + Grilled Fish", detail: "Moong-veg khichdi + 80g grilled rohu/surmai", protein: 23 },
      },
    ],
    "vegan": [
      {
        theme: "Detox & Reset", emoji: "🌱",
        early: { title: "Methi + Lemon + Garlic", detail: "Methi water + lemon + garlic + hing", protein: 1 },
        breakfast: { title: "Oats Upma (Dairy-free)", detail: "Oats with veggies in olive oil, no ghee", protein: 7 },
        midMorning: { title: "Amla + Walnuts + Seeds", detail: "Amla + walnuts + pumpkin seeds", protein: 5 },
        lunch: { title: "Brown Rice + Moong Dal", detail: "Moong dal (mustard oil) + brown rice + salad", protein: 11 },
        snack: { title: "Roasted Chana", detail: "½ cup chana + jeera water", protein: 10 },
        dinner: { title: "Bajra Roti + Lauki Sabzi", detail: "2 bajra rotis + lauki-garlic sabzi", protein: 10 },
      },
      {
        theme: "Fibre Power", emoji: "🥣",
        early: { title: "Methi + Amla", detail: "Methi water + amla juice + curry leaves", protein: 1 },
        breakfast: { title: "Daliya Khichdi (Vegan)", detail: "Daliya + veggies, coconut oil, no ghee/curd", protein: 7 },
        midMorning: { title: "Guava + Cinnamon Water", detail: "1 whole guava + cinnamon water", protein: 2 },
        lunch: { title: "Rajma + Jowar Roti", detail: "Rajma + 2 jowar rotis + salad", protein: 17 },
        snack: { title: "Makhana", detail: "Roasted makhana with turmeric", protein: 3 },
        dinner: { title: "Moong Dal Soup + Roti", detail: "Moong soup + 2 rotis, no dairy", protein: 12 },
      },
      {
        theme: "Heart-Healthy", emoji: "❤️",
        early: { title: "Garlic + Jeera Water", detail: "Garlic in warm jeera water", protein: 0 },
        breakfast: { title: "Saag + Makki Roti (Vegan)", detail: "Light mustard greens saag (no cream) + 1 makki roti", protein: 7 },
        midMorning: { title: "Mixed Seeds", detail: "Flaxseed + pumpkin + sunflower seeds", protein: 6 },
        lunch: { title: "Chana Dal + Ragi Roti", detail: "Chana dal + 2 ragi rotis", protein: 14 },
        snack: { title: "Sprouts Chaat", detail: "Moong sprouts + lemon + chaat masala", protein: 7 },
        dinner: { title: "Vegetable Khichdi", detail: "Moong + brown rice khichdi, coconut oil", protein: 9 },
      },
      {
        theme: "Anti-Inflammatory", emoji: "🌸",
        early: { title: "Haldi-Adrak Kadha", detail: "Turmeric + ginger + pepper + tulsi", protein: 0 },
        breakfast: { title: "Besan Cheela (Vegan)", detail: "2 besan cheelas + mint chutney, no dahi", protein: 10 },
        midMorning: { title: "Papaya", detail: "1 cup papaya", protein: 1 },
        lunch: { title: "Tofu Palak + Brown Rice", detail: "Tofu in spinach gravy + ½ cup brown rice", protein: 14 },
        snack: { title: "Green Tea + Walnuts", detail: "Tulsi tea + 4 walnuts", protein: 2 },
        dinner: { title: "Dal Tadka + Bajra Roti", detail: "Arhar dal + 2 bajra rotis, mustard oil", protein: 15 },
      },
      {
        theme: "Millet Magic", emoji: "🌾",
        early: { title: "Methi + Jamun Seed", detail: "Methi water + jamun seed powder", protein: 1 },
        breakfast: { title: "Ragi Porridge (Oat Milk)", detail: "Ragi + oat milk + cinnamon, no sugar", protein: 4 },
        midMorning: { title: "Amla-Flax Smoothie", detail: "Amla + flaxseeds + ginger + water", protein: 2 },
        lunch: { title: "Jowar Roti + Dal", detail: "2 jowar rotis + arhar dal + onion", protein: 15 },
        snack: { title: "Steamed Dhokla", detail: "2 steamed dhoklas", protein: 6 },
        dinner: { title: "Bajra Khichdi", detail: "Bajra + moong dal + lauki", protein: 9 },
      },
      {
        theme: "Gut Health", emoji: "🥛",
        early: { title: "Methi + Tulsi", detail: "Methi water + tulsi leaves", protein: 1 },
        breakfast: { title: "Poha + Flaxseeds", detail: "Brown rice poha + curry leaves + flaxseeds, no curd", protein: 5 },
        midMorning: { title: "Pomegranate", detail: "½ pomegranate", protein: 2 },
        lunch: { title: "Chole + Brown Rice", detail: "Chickpea curry + ½ cup brown rice", protein: 11 },
        snack: { title: "Coconut Dahi + Chia", detail: "Coconut yoghurt + chia seeds", protein: 3 },
        dinner: { title: "Lauki + Bajra Roti", detail: "Lauki sabzi + 1–2 bajra rotis", protein: 8 },
      },
      {
        theme: "Renewal", emoji: "✨",
        early: { title: "Super Detox Drink", detail: "Warm water + lemon + maple syrup + cinnamon + haldi", protein: 0 },
        breakfast: { title: "Sabudana Khichdi (Vegan)", detail: "Sabudana + peanuts + lemon (no ghee)", protein: 5 },
        midMorning: { title: "Mixed Fruit", detail: "Papaya + pomegranate + berries", protein: 2 },
        lunch: { title: "Full Vegan Thali", detail: "Dal + sabzi + salad + brown rice + 1 roti", protein: 16 },
        snack: { title: "Chana + Herbal Tea", detail: "Roasted chana + tulsi tea", protein: 10 },
        dinner: { title: "Moong Khichdi", detail: "Moong-veg khichdi, no ghee", protein: 9 },
      },
    ],
  },
  "telugu": {
    "vegetarian": [
      {
        theme: "Detox & Pesarattu", emoji: "🌱",
        early: { title: "Methi + Nimmakaya (Lemon) Water", detail: "Methi water + warm lemon + raw garlic clove", protein: 1 },
        breakfast: { title: "Pesarattu + Ginger Chutney", detail: "Green moong crepe — Ginger-coconut chutney", protein: 9 },
        midMorning: { title: "Amla + Nuvvulu (Sesame) Seeds", detail: "Fresh amla + 1 tbsp roasted sesame + walnuts", protein: 4 },
        lunch: { title: "Pappu + Brown Rice + Palakura", detail: "Moong pappu (dal) + ½ cup brown rice + spinach fry", protein: 12 },
        snack: { title: "Roasted Peanuts", detail: "¼ cup dry-roasted peanuts — Telugu staple, good fats", protein: 9 },
        dinner: { title: "Jonna Roti + Kobbari Pachadi", detail: "2 jowar rotis + coconut chutney + small dal", protein: 14 },
      },
      {
        theme: "Fibre Power", emoji: "🥣",
        early: { title: "Methi + Amla Water", detail: "Methi water + amla juice + 8 curry leaves chewed", protein: 1 },
        breakfast: { title: "Kara Pongal", detail: "Savoury pongal with pepper + jeera + ginger", protein: 7 },
        midMorning: { title: "Guava + Cinnamon Water", detail: "1 whole guava + cinnamon water", protein: 2 },
        lunch: { title: "Senagala Pappu + Jonna Roti", detail: "Chana dal + 2 jowar rotis + raw onion + nimbu", protein: 16 },
        snack: { title: "Pesara Vada (Baked)", detail: "Baked moong vada", protein: 6 },
        dinner: { title: "Nuvvulu Pappu + Rice", detail: "Sesame dal + ½ cup brown rice", protein: 10 },
      },
      {
        theme: "Omega-3 Focus", emoji: "❤️",
        early: { title: "Garlic + Jeera Water", detail: "Crushed garlic in warm jeera water", protein: 0 },
        breakfast: { title: "Pesarattu + Flaxseed Chutney", detail: "Pesarattu with ground flaxseed chutney", protein: 11 },
        midMorning: { title: "Mixed Seeds", detail: "Flaxseed + pumpkin + sesame seeds 1 tbsp each", protein: 6 },
        lunch: { title: "Pesara Pappu + Brown Rice + Kobbari", detail: "Moong dal + brown rice + coconut chutney (small)", protein: 11 },
        snack: { title: "Moong Sprouts Chaat", detail: "Pesara sprouts + lemon + chilli", protein: 7 },
        dinner: { title: "Vegetable Khichdi", detail: "Moong + brown rice khichdi + ½ tsp ghee", protein: 9 },
      },
      {
        theme: "Anti-Inflammatory", emoji: "🌸",
        early: { title: "Haldi-Adrak-Tulsi Kadha", detail: "Turmeric + ginger + black pepper + tulsi water", protein: 0 },
        breakfast: { title: "Ragi Dosa + Gongura Chutney", detail: "2 ragi dosas + gongura (sorrel) chutney", protein: 5 },
        midMorning: { title: "Papaya", detail: "1 cup papaya + pinch dry ginger", protein: 1 },
        lunch: { title: "Tomato Pappu + Brown Rice", detail: "Tomato dal + ½ cup brown rice + majjiga (buttermilk)", protein: 12 },
        snack: { title: "Green Tea + Nuvvulu", detail: "Unsweetened tea + roasted sesame til laddu (1 small)", protein: 4 },
        dinner: { title: "Pesara Pappu Soup + Jonna Roti", detail: "Light moong dal soup + 2 jowar rotis", protein: 14 },
      },
      {
        theme: "Millet Magic", emoji: "🌾",
        early: { title: "Methi + Jamun Seed Water", detail: "Methi water + ½ tsp jamun seed powder", protein: 1 },
        breakfast: { title: "Ragi Sankati (Java)", detail: "Ragi porridge — traditional Andhra breakfast, no sugar", protein: 3 },
        midMorning: { title: "Amla-Flax Smoothie", detail: "Amla + flaxseeds + ginger + water blended", protein: 2 },
        lunch: { title: "Jonna Roti + Sorakaya Pappu", detail: "Jowar roti + bottle gourd dal + curd", protein: 15 },
        snack: { title: "Roasted Peanuts + Jeera Water", detail: "Dry-roasted peanuts + warm jeera water", protein: 8 },
        dinner: { title: "Pesara Pappu Khichdi", detail: "Moong dal + jowar khichdi with veggies", protein: 11 },
      },
      {
        theme: "Gut Health Day", emoji: "🥛",
        early: { title: "Methi + Tulsi", detail: "Methi water + 5 tulsi leaves chewed", protein: 1 },
        breakfast: { title: "Idli + Sambar + Coconut Chutney", detail: "3 idlis + Andhra sambar + coconut", protein: 11 },
        midMorning: { title: "Pomegranate", detail: "½ pomegranate", protein: 2 },
        lunch: { title: "Pulihora + Pappu", detail: "Tamarind rice (small portion) + moong dal + raw onion", protein: 10 },
        snack: { title: "Perugu (Curd) + Chia", detail: "Homemade curd + 1 tbsp chia seeds", protein: 6 },
        dinner: { title: "Sorakaya Soup + Roti", detail: "Bottle gourd soup + 1–2 small rotis", protein: 5 },
      },
      {
        theme: "Renewal", emoji: "✨",
        early: { title: "Super Detox Drink", detail: "Warm water + lemon + honey + cinnamon + haldi", protein: 0 },
        breakfast: { title: "Upma with Mixed Veggies", detail: "Semolina/oats upma with veggies + coconut chutney", protein: 8 },
        midMorning: { title: "Mixed Seasonal Fruit", detail: "Papaya + pomegranate + guava", protein: 2 },
        lunch: { title: "Full Telugu Thali", detail: "Pappu + sambar + koora + perugu + ½ cup brown rice + papad", protein: 23 },
        snack: { title: "Pesara Vada + Tulsi Tea", detail: "Baked moong vada + tulsi-ginger tea", protein: 6 },
        dinner: { title: "Pesara Pappu Khichdi", detail: "Light moong-veg khichdi + 1 tsp ghee", protein: 9 },
      },
    ],
    "non-vegetarian": [
      {
        theme: "Detox & Reset", emoji: "🌱",
        early: { title: "Methi + Lemon", detail: "Methi water + warm lemon + garlic", protein: 1 },
        breakfast: { title: "Egg Pesarattu", detail: "Egg-stuffed pesarattu", protein: 15 },
        midMorning: { title: "Amla + Seeds", detail: "Amla + walnuts + sesame seeds", protein: 4 },
        lunch: { title: "Royyala Pulusu + Brown Rice", detail: "Andhra prawn tamarind curry (light) + ½ cup brown rice", protein: 21 },
        snack: { title: "Roasted Peanuts", detail: "¼ cup dry peanuts", protein: 9 },
        dinner: { title: "Jonna Roti + Kodi Pappu", detail: "2 jowar rotis + chicken dal — traditional Andhra", protein: 26 },
      },
      {
        theme: "Protein Power", emoji: "💪",
        early: { title: "Methi + Amla", detail: "Methi water + amla juice + curry leaves", protein: 1 },
        breakfast: { title: "Egg Pulusu + Ragi Dosa", detail: "Egg tamarind curry + 2 ragi dosas — Andhra style", protein: 18 },
        midMorning: { title: "Guava + Seeds", detail: "Guava + pumpkin seeds", protein: 4 },
        lunch: { title: "Kodi Kura + Brown Rice", detail: "Andhra chicken curry (light, tomato base) + ½ cup brown rice", protein: 23 },
        snack: { title: "Sprouts + Perugu", detail: "Moong sprouts + curd", protein: 11 },
        dinner: { title: "Fish Pulusu + Jonna Roti", detail: "Light fish tamarind curry + 2 jowar rotis", protein: 25 },
      },
      {
        theme: "Omega-3 Day", emoji: "❤️",
        early: { title: "Garlic + Jeera Water", detail: "Garlic in warm jeera water", protein: 0 },
        breakfast: { title: "Royyala Iguru + Ragi Dosa", detail: "Dry prawn stir-fry + 2 ragi dosas", protein: 23 },
        midMorning: { title: "Flaxseed + Amla", detail: "Flaxseeds + amla water", protein: 2 },
        lunch: { title: "Chepa Pulusu + Brown Rice", detail: "Fish tamarind curry (Andhra) + ½ cup brown rice", protein: 20 },
        snack: { title: "Makhana", detail: "Roasted makhana with turmeric", protein: 3 },
        dinner: { title: "Grilled Fish + Khichdi", detail: "Grilled rohu + moong-veg khichdi", protein: 26 },
      },
      {
        theme: "Anti-Inflammatory", emoji: "🌸",
        early: { title: "Haldi-Adrak Kadha", detail: "Turmeric + ginger + pepper + tulsi", protein: 0 },
        breakfast: { title: "Egg Bhurji + Ragi Dosa", detail: "Egg bhurji with turmeric + 2 ragi dosas", protein: 18 },
        midMorning: { title: "Papaya", detail: "1 cup papaya", protein: 1 },
        lunch: { title: "Kodi Sambar + Brown Rice", detail: "Chicken sambar + ½ cup brown rice + raita", protein: 21 },
        snack: { title: "Green Tea + Walnuts", detail: "Unsweetened tea + 4 walnuts", protein: 2 },
        dinner: { title: "Fish Tikka + Jonna Roti", detail: "Grilled fish + 2 jowar rotis", protein: 25 },
      },
      {
        theme: "Millet Day", emoji: "🌾",
        early: { title: "Methi + Jamun Seed", detail: "Methi water + jamun seed powder", protein: 1 },
        breakfast: { title: "Egg Pesarattu + Ragi Java", detail: "Egg pesarattu + small ragi porridge", protein: 17 },
        midMorning: { title: "Amla-Flax Smoothie", detail: "Amla + flaxseeds + ginger", protein: 2 },
        lunch: { title: "Kodi Fry + Jonna Roti", detail: "Dry-spiced chicken + 2 jowar rotis — Andhra style", protein: 28 },
        snack: { title: "Steamed Idli", detail: "2 idlis + gongura chutney", protein: 4 },
        dinner: { title: "Chepa Pulusu + Dalia", detail: "Light fish curry + cracked wheat", protein: 22 },
      },
      {
        theme: "Gut Health", emoji: "🥛",
        early: { title: "Methi + Tulsi", detail: "Methi water + tulsi leaves", protein: 1 },
        breakfast: { title: "Egg Idli Sambar", detail: "2 eggs + 3 idlis + Andhra sambar", protein: 24 },
        midMorning: { title: "Pomegranate + Perugu", detail: "½ pomegranate + curd", protein: 6 },
        lunch: { title: "Royyala Iguru + Brown Rice", detail: "Dry prawn stir-fry + ½ cup brown rice", protein: 21 },
        snack: { title: "Chia Perugu", detail: "Curd + chia seeds", protein: 6 },
        dinner: { title: "Clear Kodi Soup + Roti", detail: "Thin chicken broth + 1 roti", protein: 11 },
      },
      {
        theme: "Renewal", emoji: "✨",
        early: { title: "Super Detox Drink", detail: "Warm water + lemon + honey + cinnamon + haldi", protein: 0 },
        breakfast: { title: "Upma + Boiled Egg", detail: "Oats upma + 1 boiled egg", protein: 11 },
        midMorning: { title: "Mixed Fruit", detail: "Papaya + pomegranate + guava", protein: 2 },
        lunch: { title: "Full Non-Veg Telugu Thali", detail: "Chicken + fish + pappu + rice + salad", protein: 36 },
        snack: { title: "Chana + Tulsi Tea", detail: "Roasted chana + tulsi tea", protein: 10 },
        dinner: { title: "Moong Khichdi + Grilled Fish", detail: "Khichdi + 80g grilled rohu", protein: 23 },
      },
    ],
    "vegan": [
      {
        theme: "Detox", emoji: "🌱",
        early: { title: "Methi + Lemon + Garlic", detail: "Methi water + lemon + garlic + hing", protein: 1 },
        breakfast: { title: "Pesarattu (Vegan)", detail: "Green moong crepe + ginger-coconut chutney", protein: 10 },
        midMorning: { title: "Amla + Sesame Seeds", detail: "Amla + roasted sesame + walnuts", protein: 4 },
        lunch: { title: "Pappu + Brown Rice", detail: "Moong pappu + brown rice + spinach fry", protein: 12 },
        snack: { title: "Roasted Peanuts", detail: "¼ cup dry peanuts", protein: 9 },
        dinner: { title: "Jonna Roti + Dal", detail: "2 jowar rotis + small moong dal, no dairy", protein: 13 },
      },
      {
        theme: "Fibre", emoji: "🥣",
        early: { title: "Methi + Amla", detail: "Methi water + amla + curry leaves", protein: 1 },
        breakfast: { title: "Kara Pongal (Vegan)", detail: "Savoury pongal, coconut oil, no ghee", protein: 7 },
        midMorning: { title: "Guava + Cinnamon Water", detail: "Guava + cinnamon water", protein: 2 },
        lunch: { title: "Chana Dal + Jonna Roti", detail: "Chana dal + 2 jowar rotis + salad", protein: 17 },
        snack: { title: "Baked Pesara Vada", detail: "Baked moong vada", protein: 6 },
        dinner: { title: "Nuvvulu Pappu + Rice", detail: "Sesame dal + ½ cup brown rice", protein: 10 },
      },
      {
        theme: "Omega-3", emoji: "❤️",
        early: { title: "Garlic + Jeera Water", detail: "Garlic in warm jeera water", protein: 0 },
        breakfast: { title: "Pesarattu + Flaxseed Chutney", detail: "Pesarattu + ground flaxseed + coconut chutney", protein: 12 },
        midMorning: { title: "Mixed Seeds", detail: "Flaxseed + pumpkin + sesame", protein: 6 },
        lunch: { title: "Moong Dal + Brown Rice", detail: "Moong pappu + brown rice, coconut oil tadka", protein: 10 },
        snack: { title: "Sprouts Chaat", detail: "Pesara sprouts + lemon", protein: 7 },
        dinner: { title: "Vegetable Khichdi", detail: "Moong + jowar khichdi, coconut oil", protein: 9 },
      },
      {
        theme: "Anti-Inflammatory", emoji: "🌸",
        early: { title: "Haldi Kadha", detail: "Turmeric + ginger + pepper + tulsi", protein: 0 },
        breakfast: { title: "Ragi Dosa + Gongura Chutney", detail: "2 ragi dosas + gongura chutney (vegan)", protein: 5 },
        midMorning: { title: "Papaya", detail: "1 cup papaya", protein: 1 },
        lunch: { title: "Tomato Pappu + Brown Rice", detail: "Tomato dal + ½ cup brown rice", protein: 10 },
        snack: { title: "Green Tea + Sesame Laddu", detail: "Tea + 1 small til laddu", protein: 1 },
        dinner: { title: "Pappu Soup + Jonna Roti", detail: "Moong soup + 2 jowar rotis", protein: 14 },
      },
      {
        theme: "Millet", emoji: "🌾",
        early: { title: "Methi + Jamun Seed", detail: "Methi water + jamun powder", protein: 1 },
        breakfast: { title: "Ragi Sankati", detail: "Ragi porridge, no sugar", protein: 3 },
        midMorning: { title: "Amla-Flax Smoothie", detail: "Amla + flaxseeds + water", protein: 2 },
        lunch: { title: "Jonna Roti + Sorakaya Pappu", detail: "Jowar roti + bottle gourd dal", protein: 11 },
        snack: { title: "Peanuts + Jeera Water", detail: "Dry peanuts + warm jeera water", protein: 8 },
        dinner: { title: "Pesara Khichdi", detail: "Moong + jowar khichdi", protein: 9 },
      },
      {
        theme: "Gut", emoji: "🥛",
        early: { title: "Methi + Tulsi", detail: "Methi water + tulsi", protein: 1 },
        breakfast: { title: "Idli + Sambar (Vegan)", detail: "3 idlis + vegan sambar (no ghee tadka)", protein: 11 },
        midMorning: { title: "Pomegranate", detail: "½ pomegranate", protein: 2 },
        lunch: { title: "Pulihora + Pappu", detail: "Tamarind rice (small) + moong dal", protein: 10 },
        snack: { title: "Coconut Dahi + Chia", detail: "Coconut yoghurt + chia seeds", protein: 3 },
        dinner: { title: "Sorakaya Soup + Roti", detail: "Bottle gourd soup + roti", protein: 5 },
      },
      {
        theme: "Renewal", emoji: "✨",
        early: { title: "Super Detox Drink", detail: "Lemon + maple syrup + cinnamon + haldi", protein: 0 },
        breakfast: { title: "Upma + Coconut", detail: "Oats upma + coconut chutney, no dairy", protein: 6 },
        midMorning: { title: "Mixed Fruit", detail: "Papaya + pomegranate + guava", protein: 2 },
        lunch: { title: "Vegan Telugu Thali", detail: "Pappu + sambar + koora + brown rice + papad", protein: 19 },
        snack: { title: "Peanuts + Herbal Tea", detail: "Peanuts + tulsi tea", protein: 8 },
        dinner: { title: "Moong Khichdi", detail: "Moong-veg khichdi, coconut oil", protein: 9 },
      },
    ],
  },
  "tamil": {
    "vegetarian": [
      {
        theme: "Kanji & Kollu Detox", emoji: "🌱",
        early: { title: "Methi + Nimbu Water", detail: "Methi water + lemon + raw garlic", protein: 1 },
        breakfast: { title: "Kara Pongal", detail: "Savory pongal with pepper + jeera + ginger", protein: 7 },
        midMorning: { title: "Amla + Walnuts", detail: "Fresh amla + 5 walnuts + sesame seeds", protein: 5 },
        lunch: { title: "Kollu Rasam + Brown Rice", detail: "Horse gram rasam + ½ cup brown rice", protein: 8 },
        snack: { title: "Sundal (Boiled Chickpeas)", detail: "Boiled chana sundal with coconut + mustard — no fry", protein: 7 },
        dinner: { title: "Keerai Masiyal + Small Rice", detail: "Spinach mash + ½ cup brown rice — light", protein: 5 },
      },
      {
        theme: "Fibre Power", emoji: "🥣",
        early: { title: "Methi + Amla Water", detail: "Methi water + amla juice + curry leaves", protein: 1 },
        breakfast: { title: "Idli + Sambar", detail: "3 steamed idlis + vegetable sambar", protein: 11 },
        midMorning: { title: "Guava + Cinnamon Water", detail: "1 guava + cinnamon water", protein: 2 },
        lunch: { title: "Paruppu + Brown Rice + Rasam", detail: "Toor dal + ½ cup brown rice + pepper rasam", protein: 11 },
        snack: { title: "Roasted Murukku-free Snack", detail: "1 cup makhana or peanuts — skip fried murukku", protein: 3 },
        dinner: { title: "Vendakkai Sambar + Small Rice", detail: "Okra sambar + ½ cup brown rice", protein: 8 },
      },
      {
        theme: "Heart-Healthy Fats", emoji: "❤️",
        early: { title: "Garlic + Jeera Water", detail: "Crushed garlic in warm jeera water", protein: 0 },
        breakfast: { title: "Ragi Koozh", detail: "Finger millet porridge — Kongu Nadu tradition", protein: 3 },
        midMorning: { title: "Mixed Seeds", detail: "Flaxseed + sesame + pumpkin 1 tbsp each", protein: 6 },
        lunch: { title: "Paruppu + Brown Rice + Aviyal", detail: "Dal + ½ cup brown rice + aviyal (mixed veg, no coconut cream)", protein: 13 },
        snack: { title: "Moong Sprouts", detail: "Moong sprouts + lemon + pepper", protein: 7 },
        dinner: { title: "Vegetable Khichdi (Pongal)", detail: "Moong + brown rice pongal with veggies + ½ tsp ghee", protein: 9 },
      },
      {
        theme: "Anti-Inflammatory", emoji: "🌸",
        early: { title: "Milagu Jeeraga Rasam Water", detail: "Boil pepper + jeera in water", protein: 0 },
        breakfast: { title: "Rava Idli + Tomato Chutney", detail: "3 rava idlis + fresh tomato chutney, no frying", protein: 8 },
        midMorning: { title: "Papaya", detail: "1 cup papaya + pinch dry ginger", protein: 1 },
        lunch: { title: "Milagu Rasam + Brown Rice", detail: "Pepper rasam + ½ cup brown rice + papad", protein: 6 },
        snack: { title: "Green Tea + Almonds", detail: "Unsweetened tea + 4 almonds", protein: 1 },
        dinner: { title: "Kozhukattai", detail: "2 steamed kozhukattai (rice dumplings) — light, wholesome", protein: 3 },
      },
      {
        theme: "Millet Magic", emoji: "🌾",
        early: { title: "Methi + Jamun Seed", detail: "Methi water + jamun seed powder", protein: 1 },
        breakfast: { title: "Kambu (Pearl Millet) Koozh", detail: "Kambu porridge — traditional breakfast", protein: 3 },
        midMorning: { title: "Amla-Flax Smoothie", detail: "Amla + flaxseeds + ginger blended", protein: 2 },
        lunch: { title: "Samai (Little Millet) Rice + Dal", detail: "Little millet rice + toor dal + rasam", protein: 12 },
        snack: { title: "Roasted Peanuts + Murunga Leaf Tea", detail: "Peanuts + drumstick leaf tea", protein: 8 },
        dinner: { title: "Ragi Mudde + Sambar", detail: "Finger millet balls + light sambar — classic healthy combo", protein: 8 },
      },
      {
        theme: "Gut Health Day", emoji: "🥛",
        early: { title: "Methi + Tulsi", detail: "Methi water + tulsi leaves", protein: 1 },
        breakfast: { title: "Thayir Idli", detail: "2 idlis soaked in spiced curd", protein: 8 },
        midMorning: { title: "Pomegranate", detail: "½ pomegranate", protein: 2 },
        lunch: { title: "Thayir Sadam", detail: "Curd rice with mustard + curry leaves + pomegranate garnish", protein: 7 },
        snack: { title: "Perugu + Chia", detail: "Homemade curd + chia seeds", protein: 6 },
        dinner: { title: "Mor Kuzhambu + Small Rice", detail: "Buttermilk curry + ½ cup brown rice", protein: 6 },
      },
      {
        theme: "Renewal", emoji: "✨",
        early: { title: "Super Detox Drink", detail: "Warm water + lemon + honey + cinnamon + haldi", protein: 0 },
        breakfast: { title: "Pongal (Ven Pongal)", detail: "Ven pongal with pepper + ghee (small) — Sunday special", protein: 7 },
        midMorning: { title: "Mixed Seasonal Fruit", detail: "Papaya + pomegranate + guava", protein: 2 },
        lunch: { title: "Full Tamil Thali", detail: "Paruppu + rasam + sambar + kootu + thayir + small brown rice", protein: 23 },
        snack: { title: "Sundal + Herbal Tea", detail: "Boiled moong sundal + tulsi-ginger tea", protein: 7 },
        dinner: { title: "Moong Dal Pongal", detail: "Light moong-veg pongal + 1 tsp ghee", protein: 7 },
      },
    ],
    "non-vegetarian": [
      {
        theme: "Detox", emoji: "🌱",
        early: { title: "Methi + Nimbu", detail: "Methi water + lemon + garlic", protein: 1 },
        breakfast: { title: "Egg Dosa + Kollu Chutney", detail: "Egg dosa + horse gram chutney", protein: 11 },
        midMorning: { title: "Amla + Sesame", detail: "Amla + sesame seeds + walnuts", protein: 4 },
        lunch: { title: "Meen Rasam + Brown Rice", detail: "Fish pepper rasam + ½ cup brown rice — light", protein: 12 },
        snack: { title: "Roasted Peanuts", detail: "¼ cup dry peanuts", protein: 9 },
        dinner: { title: "Kari Kuzhambu + Ragi Dosa", detail: "Chicken curry (light) + 2 ragi dosas", protein: 25 },
      },
      {
        theme: "Protein Power", emoji: "💪",
        early: { title: "Methi + Amla", detail: "Methi water + amla + curry leaves", protein: 1 },
        breakfast: { title: "Egg Idli + Sambar", detail: "Egg stuffed idlis + veg sambar", protein: 15 },
        midMorning: { title: "Guava + Seeds", detail: "Guava + pumpkin seeds", protein: 4 },
        lunch: { title: "Kozhi Kuzhambu + Brown Rice", detail: "Chettinad-lite chicken curry + ½ cup brown rice", protein: 23 },
        snack: { title: "Sprouts + Curd", detail: "Moong sprouts + curd", protein: 11 },
        dinner: { title: "Meen Kozhambu + Small Rice", detail: "Tamarind fish curry + ½ cup brown rice", protein: 20 },
      },
      {
        theme: "Omega-3", emoji: "❤️",
        early: { title: "Garlic + Jeera", detail: "Garlic in warm jeera water", protein: 0 },
        breakfast: { title: "Meen Varuval + Ragi Dosa", detail: "Grilled fish fry (min oil) + 2 ragi dosas", protein: 22 },
        midMorning: { title: "Seeds + Amla", detail: "Flaxseed + sesame + amla water", protein: 3 },
        lunch: { title: "Meen Kulambu + Brown Rice", detail: "Fish curry + ½ cup brown rice + rasam", protein: 21 },
        snack: { title: "Makhana + Tea", detail: "Makhana + unsweetened tea", protein: 3 },
        dinner: { title: "Grilled Fish + Pongal", detail: "Grilled fish + small moong pongal", protein: 22 },
      },
      {
        theme: "Anti-Inflammatory", emoji: "🌸",
        early: { title: "Milagu Rasam Water", detail: "Pepper + jeera + garlic boiled", protein: 0 },
        breakfast: { title: "Egg Bhurji + Idli", detail: "Egg bhurji + 2 idlis", protein: 17 },
        midMorning: { title: "Papaya", detail: "1 cup papaya", protein: 1 },
        lunch: { title: "Kozhi Milagu Varuval + Rice", detail: "Pepper chicken (dry, min oil) + ½ cup brown rice", protein: 23 },
        snack: { title: "Green Tea + Almonds", detail: "Tea + 4 almonds", protein: 1 },
        dinner: { title: "Meen Varuval + Ragi Dosa", detail: "Grilled fish + 2 ragi dosas", protein: 22 },
      },
      {
        theme: "Millet", emoji: "🌾",
        early: { title: "Methi + Jamun Seed", detail: "Methi water + jamun seed powder", protein: 1 },
        breakfast: { title: "Ragi Mudde + Egg Curry", detail: "Ragi mudde + 1-egg curry", protein: 9 },
        midMorning: { title: "Amla-Flax Smoothie", detail: "Amla + flaxseeds + ginger", protein: 2 },
        lunch: { title: "Samai Rice + Kozhi Kozhambu", detail: "Little millet + light chicken curry", protein: 24 },
        snack: { title: "Steamed Idli", detail: "2 idlis + chutney", protein: 4 },
        dinner: { title: "Meen Rasam + Brown Rice", detail: "Fish pepper rasam + ½ cup brown rice", protein: 12 },
      },
      {
        theme: "Gut Health", emoji: "🥛",
        early: { title: "Methi + Tulsi", detail: "Methi water + tulsi", protein: 1 },
        breakfast: { title: "Egg Thayir Idli", detail: "Eggs + curd idli + sambar", protein: 26 },
        midMorning: { title: "Pomegranate + Curd", detail: "½ pomegranate + curd", protein: 6 },
        lunch: { title: "Thayir Sadam + Egg", detail: "Curd rice + 1 boiled egg", protein: 13 },
        snack: { title: "Chia Curd", detail: "Curd + chia seeds", protein: 6 },
        dinner: { title: "Kozhi Rasam + Brown Rice", detail: "Chicken pepper rasam + ½ cup brown rice", protein: 12 },
      },
      {
        theme: "Renewal", emoji: "✨",
        early: { title: "Super Detox Drink", detail: "Lemon + honey + cinnamon + haldi", protein: 0 },
        breakfast: { title: "Pongal + Egg", detail: "Ven pongal + 1 boiled egg", protein: 13 },
        midMorning: { title: "Mixed Fruit", detail: "Papaya + pomegranate + guava", protein: 2 },
        lunch: { title: "Full Non-Veg Tamil Thali", detail: "Kozhi + meen + dal + sambar + rice", protein: 40 },
        snack: { title: "Sundal + Herbal Tea", detail: "Peanut sundal + tulsi tea", protein: 7 },
        dinner: { title: "Moong Pongal + Grilled Fish", detail: "Light pongal + 80g grilled fish", protein: 21 },
      },
    ],
    "vegan": [
      {
        theme: "Kanji Detox", emoji: "🌱",
        early: { title: "Methi + Nimbu + Garlic", detail: "Methi water + lemon + garlic", protein: 1 },
        breakfast: { title: "Kara Pongal (Vegan)", detail: "Pongal with coconut oil, no ghee", protein: 7 },
        midMorning: { title: "Amla + Seeds", detail: "Amla + sesame + walnuts", protein: 4 },
        lunch: { title: "Kollu Rasam + Brown Rice", detail: "Horse gram rasam + ½ cup brown rice", protein: 8 },
        snack: { title: "Sundal", detail: "Boiled chana + coconut + mustard", protein: 7 },
        dinner: { title: "Keerai Masiyal + Small Rice", detail: "Spinach mash + small brown rice", protein: 4 },
      },
      {
        theme: "Fibre", emoji: "🥣",
        early: { title: "Methi + Amla", detail: "Methi water + amla + curry leaves", protein: 1 },
        breakfast: { title: "Idli + Vegan Sambar", detail: "3 idlis + sambar without ghee tadka", protein: 11 },
        midMorning: { title: "Guava + Cinnamon Water", detail: "Guava + cinnamon water", protein: 2 },
        lunch: { title: "Paruppu + Brown Rice + Rasam", detail: "Toor dal + brown rice + pepper rasam", protein: 11 },
        snack: { title: "Makhana", detail: "1 cup makhana", protein: 3 },
        dinner: { title: "Vendakkai Sambar + Rice", detail: "Okra sambar + ½ cup brown rice", protein: 8 },
      },
      {
        theme: "Heart-Healthy", emoji: "❤️",
        early: { title: "Garlic + Jeera", detail: "Garlic in warm jeera water", protein: 0 },
        breakfast: { title: "Ragi Koozh", detail: "Ragi porridge — no milk, no sugar", protein: 3 },
        midMorning: { title: "Mixed Seeds", detail: "Flaxseed + sesame + pumpkin", protein: 6 },
        lunch: { title: "Paruppu + Brown Rice + Aviyal", detail: "Dal + ½ cup brown rice + aviyal", protein: 13 },
        snack: { title: "Sprouts", detail: "Moong sprouts + lemon", protein: 7 },
        dinner: { title: "Veg Pongal (Vegan)", detail: "Moong pongal, coconut oil, no ghee", protein: 7 },
      },
      {
        theme: "Anti-Inflammatory", emoji: "🌸",
        early: { title: "Milagu Rasam Water", detail: "Pepper + jeera + garlic boiled", protein: 0 },
        breakfast: { title: "Rava Idli (Vegan)", detail: "3 rava idlis + tomato chutney, no curd", protein: 8 },
        midMorning: { title: "Papaya", detail: "1 cup papaya", protein: 1 },
        lunch: { title: "Milagu Rasam + Brown Rice", detail: "Pepper rasam + ½ cup brown rice", protein: 4 },
        snack: { title: "Green Tea + Almonds", detail: "Tea + 4 almonds", protein: 1 },
        dinner: { title: "Kozhukattai", detail: "2 steamed rice dumplings", protein: 3 },
      },
      {
        theme: "Millet", emoji: "🌾",
        early: { title: "Methi + Jamun Seed", detail: "Methi water + jamun seed powder", protein: 1 },
        breakfast: { title: "Kambu Koozh", detail: "Kambu porridge, no dairy", protein: 3 },
        midMorning: { title: "Amla-Flax Smoothie", detail: "Amla + flaxseeds + water", protein: 2 },
        lunch: { title: "Samai Rice + Dal", detail: "Little millet rice + toor dal + rasam", protein: 12 },
        snack: { title: "Peanuts + Murunga Tea", detail: "Dry peanuts + drumstick leaf tea", protein: 8 },
        dinner: { title: "Ragi Mudde + Sambar", detail: "Ragi mudde + light sambar", protein: 8 },
      },
      {
        theme: "Gut", emoji: "🥛",
        early: { title: "Methi + Tulsi", detail: "Methi water + tulsi", protein: 1 },
        breakfast: { title: "Idli + Vegan Sambar", detail: "3 idlis + vegan sambar", protein: 11 },
        midMorning: { title: "Pomegranate", detail: "½ pomegranate", protein: 2 },
        lunch: { title: "Thayir Sadam (Coconut Curd)", detail: "Coconut curd rice + mustard + curry leaves", protein: 3 },
        snack: { title: "Coconut Dahi + Chia", detail: "Coconut yoghurt + chia", protein: 3 },
        dinner: { title: "Mor Kuzhambu + Brown Rice", detail: "Vegan buttermilk curry + ½ cup brown rice", protein: 6 },
      },
      {
        theme: "Renewal", emoji: "✨",
        early: { title: "Super Detox Drink", detail: "Lemon + maple syrup + cinnamon + haldi", protein: 0 },
        breakfast: { title: "Pongal (Vegan)", detail: "Ven pongal, coconut oil, no ghee", protein: 7 },
        midMorning: { title: "Mixed Fruit", detail: "Papaya + pomegranate + guava", protein: 2 },
        lunch: { title: "Vegan Tamil Thali", detail: "Paruppu + sambar + kootu + brown rice + papad", protein: 21 },
        snack: { title: "Sundal + Tea", detail: "Boiled moong sundal + tulsi tea", protein: 7 },
        dinner: { title: "Moong Dal Pongal (Vegan)", detail: "Moong pongal, coconut oil", protein: 7 },
      },
    ],
  },
  "kerala": {
    "vegetarian": [
      {
        theme: "Kanji & Cherupayar Detox", emoji: "🌴",
        early: { title: "Methi + Warm Water + Coconut Vinegar", detail: "Methi water + splash coconut vinegar", protein: 1 },
        breakfast: { title: "Rice Kanji with Cherupayar", detail: "Rice porridge + boiled green moong thoran — traditional Kerala morning", protein: 10 },
        midMorning: { title: "Amla + Walnuts", detail: "Fresh amla + 5 walnuts", protein: 3 },
        lunch: { title: "Brown Rice + Cherupayar Curry + Rasam", detail: "Brown rice + green moong curry + pepper rasam", protein: 11 },
        snack: { title: "Banana (Nendran, small)", detail: "½ nendran banana", protein: 1 },
        dinner: { title: "Chapathi + Kadala Curry", detail: "2 wheat chapathis + black chickpea curry", protein: 14 },
      },
      {
        theme: "Fibre Power", emoji: "🥣",
        early: { title: "Methi + Amla Water", detail: "Methi water + amla juice + 8 curry leaves", protein: 1 },
        breakfast: { title: "Puttu + Kadala Curry", detail: "Steamed puttu + black chana curry — traditional Kerala breakfast", protein: 12 },
        midMorning: { title: "Guava + Cinnamon Water", detail: "1 guava + cinnamon water", protein: 2 },
        lunch: { title: "Brown Rice + Sambar + Thoran", detail: "Brown rice + vegetable sambar + cabbage thoran", protein: 10 },
        snack: { title: "Roasted Groundnuts", detail: "¼ cup groundnuts — common Kerala snack", protein: 9 },
        dinner: { title: "Idiyappam + Vegetable Stew", detail: "2 idiyappam (string hoppers) + light vegetable stew", protein: 5 },
      },
      {
        theme: "Heart-Healthy Fats", emoji: "❤️",
        early: { title: "Garlic + Jeera Water", detail: "Crushed garlic in warm jeera water", protein: 0 },
        breakfast: { title: "Appam + Coconut Stew", detail: "2 appam + light vegetable-coconut stew — choose thin coconut milk", protein: 5 },
        midMorning: { title: "Mixed Seeds", detail: "Flaxseed + pumpkin + sesame 1 tbsp each", protein: 6 },
        lunch: { title: "Brown Rice + Olan + Rasam", detail: "Brown rice + ash gourd-bean olan + pepper rasam", protein: 7 },
        snack: { title: "Moong Sprouts", detail: "Moong sprouts + lemon + pepper", protein: 7 },
        dinner: { title: "Vegetable Khichdi", detail: "Moong + brown rice khichdi + ½ tsp coconut oil", protein: 9 },
      },
      {
        theme: "Anti-Inflammatory", emoji: "🌸",
        early: { title: "Turmeric + Coconut Water", detail: "Turmeric + black pepper in warm coconut water — Kerala style", protein: 2 },
        breakfast: { title: "Ragi Puttu", detail: "Finger millet puttu — no sugar, healthy twist", protein: 4 },
        midMorning: { title: "Papaya", detail: "1 cup papaya", protein: 1 },
        lunch: { title: "Brown Rice + Erissery + Rasam", detail: "Brown rice + pumpkin-beans erissery + rasam", protein: 10 },
        snack: { title: "Green Tea + Almonds", detail: "Tulsi tea + 4 almonds", protein: 1 },
        dinner: { title: "Cherupayar Dal + Chapathi", detail: "Green moong dal + 2 chapathis", protein: 13 },
      },
      {
        theme: "Millet Magic", emoji: "🌾",
        early: { title: "Methi + Jamun Seed", detail: "Methi water + ½ tsp jamun seed powder", protein: 1 },
        breakfast: { title: "Ragi Kanji", detail: "Finger millet porridge — traditional Kerala wellness drink", protein: 3 },
        midMorning: { title: "Amla-Flax Smoothie", detail: "Amla + flaxseeds + ginger + water", protein: 2 },
        lunch: { title: "Brown Rice + Avial", detail: "Brown rice + mixed vegetable avial (less coconut)", protein: 6 },
        snack: { title: "Roasted Groundnuts + Tea", detail: "Groundnuts + unsweetened ginger tea", protein: 8 },
        dinner: { title: "Idiyappam + Moong Curry", detail: "2 idiyappam + green moong curry", protein: 10 },
      },
      {
        theme: "Gut Health Day", emoji: "🥛",
        early: { title: "Methi + Tulsi", detail: "Methi water + tulsi leaves", protein: 1 },
        breakfast: { title: "Idli + Sambar + Coconut Chutney", detail: "3 idlis + sambar + fresh coconut chutney", protein: 12 },
        midMorning: { title: "Pomegranate", detail: "½ pomegranate", protein: 2 },
        lunch: { title: "Curd Rice + Papad", detail: "Thayir sadam with mustard + curry leaves", protein: 7 },
        snack: { title: "Curd + Chia", detail: "Homemade curd + 1 tbsp chia seeds", protein: 6 },
        dinner: { title: "Chembu Curry + Small Rice", detail: "Taro root curry + ½ cup brown rice", protein: 5 },
      },
      {
        theme: "Renewal", emoji: "✨",
        early: { title: "Super Detox Drink", detail: "Warm water + lemon + honey + cinnamon + haldi", protein: 0 },
        breakfast: { title: "Appam + Vegetable Stew", detail: "2 appam + light coconut vegetable stew (Sunday special)", protein: 5 },
        midMorning: { title: "Mixed Seasonal Fruit", detail: "Papaya + pomegranate + nendran banana (½)", protein: 2 },
        lunch: { title: "Kerala Sadhya (Healthy Version)", detail: "Brown rice + sambar + avial + thoran + rasam + papad", protein: 16 },
        snack: { title: "Banana Chips (Baked, small) + Tea", detail: "Small baked chips + ginger tea", protein: 0 },
        dinner: { title: "Moong Dal Kanji", detail: "Green moong porridge + coconut + jeera", protein: 8 },
      },
    ],
    "non-vegetarian": [
      {
        theme: "Detox", emoji: "🌴",
        early: { title: "Methi + Coconut Water", detail: "Methi water + fresh coconut water", protein: 2 },
        breakfast: { title: "Egg Roast + Appam", detail: "Kerala egg roast (light) + 2 appam", protein: 16 },
        midMorning: { title: "Amla + Walnuts", detail: "Amla + walnuts", protein: 2 },
        lunch: { title: "Meen Curry + Brown Rice", detail: "Kerala fish curry (light coconut) + ½ cup brown rice", protein: 20 },
        snack: { title: "Groundnuts", detail: "Roasted groundnuts", protein: 8 },
        dinner: { title: "Chicken Stew + Idiyappam", detail: "Light coconut chicken stew + 2 idiyappam", protein: 23 },
      },
      {
        theme: "Protein Power", emoji: "💪",
        early: { title: "Methi + Amla", detail: "Methi water + amla juice", protein: 1 },
        breakfast: { title: "Egg Puttu + Kadala", detail: "Egg-stuffed puttu + black chana curry", protein: 18 },
        midMorning: { title: "Guava + Seeds", detail: "Guava + pumpkin seeds", protein: 4 },
        lunch: { title: "Chicken Curry + Brown Rice", detail: "Nadan chicken curry (light) + ½ cup brown rice", protein: 23 },
        snack: { title: "Sprouts + Curd", detail: "Moong sprouts + curd", protein: 11 },
        dinner: { title: "Fish Molee + Idiyappam", detail: "Light coconut fish molee + 2 idiyappam", protein: 20 },
      },
      {
        theme: "Omega-3", emoji: "❤️",
        early: { title: "Garlic + Jeera Water", detail: "Garlic in warm jeera water", protein: 0 },
        breakfast: { title: "Grilled Karimeen + Appam", detail: "Grilled pearl spot fish (min oil) + 2 appam", protein: 20 },
        midMorning: { title: "Flaxseed + Amla", detail: "Flaxseeds + amla water", protein: 2 },
        lunch: { title: "Meen Mulagushyam + Brown Rice", detail: "Fish tamarind curry + ½ cup brown rice", protein: 20 },
        snack: { title: "Makhana + Tea", detail: "Makhana + unsweetened tea", protein: 3 },
        dinner: { title: "Prawn Thoran + Rice", detail: "Dry coconut prawn stir-fry + ½ cup brown rice", protein: 21 },
      },
      {
        theme: "Anti-Inflammatory", emoji: "🌸",
        early: { title: "Turmeric + Coconut Water", detail: "Turmeric + pepper in coconut water", protein: 2 },
        breakfast: { title: "Egg Roast + Ragi Puttu", detail: "Egg roast + ragi puttu", protein: 16 },
        midMorning: { title: "Papaya", detail: "1 cup papaya", protein: 1 },
        lunch: { title: "Chicken Rasam + Brown Rice", detail: "Chicken pepper rasam + ½ cup brown rice", protein: 12 },
        snack: { title: "Green Tea + Almonds", detail: "Tea + 4 almonds", protein: 1 },
        dinner: { title: "Grilled Fish + Chapathi", detail: "Grilled fish + 2 chapathis", protein: 23 },
      },
      {
        theme: "Millet", emoji: "🌾",
        early: { title: "Methi + Jamun Seed", detail: "Methi water + jamun seed powder", protein: 1 },
        breakfast: { title: "Ragi Puttu + Egg Curry", detail: "Ragi puttu + 1-egg curry", protein: 10 },
        midMorning: { title: "Amla-Flax Smoothie", detail: "Amla + flaxseeds + ginger", protein: 2 },
        lunch: { title: "Brown Rice + Prawn Thoran", detail: "Brown rice + dry prawn stir-fry", protein: 21 },
        snack: { title: "Idli + Chutney", detail: "2 idlis + coconut chutney", protein: 5 },
        dinner: { title: "Meen Rasam + Brown Rice", detail: "Fish pepper rasam + ½ cup brown rice", protein: 12 },
      },
      {
        theme: "Gut Health", emoji: "🥛",
        early: { title: "Methi + Tulsi", detail: "Methi water + tulsi", protein: 1 },
        breakfast: { title: "Egg Idli + Sambar", detail: "Egg + 3 idlis + sambar", protein: 17 },
        midMorning: { title: "Pomegranate + Curd", detail: "½ pomegranate + curd", protein: 6 },
        lunch: { title: "Curd Rice + Grilled Fish", detail: "Curd rice + 80g grilled fish", protein: 21 },
        snack: { title: "Chia Curd", detail: "Curd + chia seeds", protein: 6 },
        dinner: { title: "Chicken Soup + Chapathi", detail: "Clear chicken broth + 1 chapathi", protein: 11 },
      },
      {
        theme: "Renewal", emoji: "✨",
        early: { title: "Super Detox Drink", detail: "Lemon + honey + cinnamon + haldi", protein: 0 },
        breakfast: { title: "Appam + Egg Stew", detail: "2 appam + egg stew (light coconut)", protein: 16 },
        midMorning: { title: "Mixed Fruit", detail: "Papaya + pomegranate + banana (½)", protein: 2 },
        lunch: { title: "Kerala Non-Veg Sadhya", detail: "Rice + fish + chicken + sambar + avial", protein: 36 },
        snack: { title: "Groundnuts + Tea", detail: "Groundnuts + ginger tea", protein: 8 },
        dinner: { title: "Kanji + Grilled Prawns", detail: "Rice kanji + 80g grilled prawns", protein: 19 },
      },
    ],
    "vegan": [
      {
        theme: "Kanji Detox", emoji: "🌴",
        early: { title: "Methi + Coconut Water", detail: "Methi water + coconut water + lemon", protein: 2 },
        breakfast: { title: "Rice Kanji + Cherupayar Thoran", detail: "Rice porridge + green moong thoran (no dairy)", protein: 10 },
        midMorning: { title: "Amla + Seeds", detail: "Amla + walnuts + pumpkin seeds", protein: 5 },
        lunch: { title: "Brown Rice + Cherupayar Curry", detail: "Brown rice + green moong + rasam", protein: 11 },
        snack: { title: "Banana (Nendran, ½)", detail: "½ nendran banana", protein: 1 },
        dinner: { title: "Chapathi + Kadala Curry", detail: "2 chapathis + black chana curry, no dairy", protein: 14 },
      },
      {
        theme: "Fibre", emoji: "🥣",
        early: { title: "Methi + Amla", detail: "Methi water + amla + curry leaves", protein: 1 },
        breakfast: { title: "Puttu (Ragi) + Kadala Curry", detail: "Ragi puttu + kadala curry, no dairy", protein: 12 },
        midMorning: { title: "Guava + Cinnamon Water", detail: "Guava + cinnamon water", protein: 2 },
        lunch: { title: "Brown Rice + Sambar + Thoran", detail: "Brown rice + sambar (no ghee) + thoran", protein: 10 },
        snack: { title: "Groundnuts", detail: "Roasted groundnuts", protein: 8 },
        dinner: { title: "Idiyappam + Veg Stew", detail: "2 idiyappam + vegetable-coconut stew (thin milk)", protein: 5 },
      },
      {
        theme: "Heart-Healthy", emoji: "❤️",
        early: { title: "Garlic + Jeera", detail: "Garlic in warm jeera water", protein: 0 },
        breakfast: { title: "Appam + Thin Coconut Stew", detail: "2 appam + veg stew, thin coconut milk", protein: 5 },
        midMorning: { title: "Mixed Seeds", detail: "Flaxseed + sesame + pumpkin", protein: 6 },
        lunch: { title: "Brown Rice + Olan", detail: "Brown rice + ash gourd-bean olan", protein: 6 },
        snack: { title: "Sprouts", detail: "Moong sprouts + lemon", protein: 7 },
        dinner: { title: "Moong Khichdi", detail: "Moong + brown rice, coconut oil", protein: 10 },
      },
      {
        theme: "Anti-Inflammatory", emoji: "🌸",
        early: { title: "Turmeric + Coconut Water", detail: "Turmeric + pepper in coconut water", protein: 2 },
        breakfast: { title: "Ragi Puttu (Vegan)", detail: "Ragi puttu, no dairy", protein: 4 },
        midMorning: { title: "Papaya", detail: "1 cup papaya", protein: 1 },
        lunch: { title: "Brown Rice + Erissery + Rasam", detail: "Brown rice + pumpkin erissery + rasam", protein: 7 },
        snack: { title: "Green Tea + Almonds", detail: "Tea + 4 almonds", protein: 1 },
        dinner: { title: "Cherupayar Dal + Chapathi", detail: "Moong dal + 2 chapathis", protein: 13 },
      },
      {
        theme: "Millet", emoji: "🌾",
        early: { title: "Methi + Jamun Seed", detail: "Methi water + jamun seed powder", protein: 1 },
        breakfast: { title: "Ragi Kanji (Vegan)", detail: "Ragi porridge, water-based", protein: 3 },
        midMorning: { title: "Amla-Flax Smoothie", detail: "Amla + flaxseeds + water", protein: 2 },
        lunch: { title: "Brown Rice + Avial", detail: "Brown rice + avial, less coconut", protein: 6 },
        snack: { title: "Groundnuts + Tea", detail: "Groundnuts + ginger tea", protein: 8 },
        dinner: { title: "Idiyappam + Moong Curry", detail: "2 idiyappam + green moong curry, no dairy", protein: 10 },
      },
      {
        theme: "Gut", emoji: "🥛",
        early: { title: "Methi + Tulsi", detail: "Methi water + tulsi", protein: 1 },
        breakfast: { title: "Idli + Vegan Sambar", detail: "3 idlis + sambar, no ghee", protein: 11 },
        midMorning: { title: "Pomegranate", detail: "½ pomegranate", protein: 2 },
        lunch: { title: "Coconut Curd Rice", detail: "Coconut yoghurt rice + mustard + curry leaves", protein: 3 },
        snack: { title: "Coconut Dahi + Chia", detail: "Coconut yoghurt + chia", protein: 3 },
        dinner: { title: "Chembu Curry + Brown Rice", detail: "Taro curry + ½ cup brown rice", protein: 5 },
      },
      {
        theme: "Renewal", emoji: "✨",
        early: { title: "Super Detox Drink", detail: "Lemon + maple syrup + cinnamon + haldi", protein: 0 },
        breakfast: { title: "Appam + Veg Stew (Vegan)", detail: "2 appam + thin veg stew, coconut milk", protein: 5 },
        midMorning: { title: "Mixed Fruit", detail: "Papaya + pomegranate + banana (½)", protein: 2 },
        lunch: { title: "Vegan Kerala Sadhya", detail: "Brown rice + sambar + avial + thoran + rasam", protein: 14 },
        snack: { title: "Banana Chips (Baked) + Tea", detail: "Small baked chips + ginger tea", protein: 0 },
        dinner: { title: "Moong Kanji", detail: "Green moong porridge + coconut + jeera", protein: 8 },
      },
    ],
  },
  "bangalore": {
    "vegetarian": [
      {
        theme: "Akki Roti Detox", emoji: "🌸",
        early: { title: "Methi + Warm Water + Tulsi", detail: "Methi water + tulsi + warm lemon — Bangalore morning", protein: 1 },
        breakfast: { title: "Akki Roti + Coconut Chutney", detail: "Rice flour flatbread with onion + curry leaves + coconut chutney", protein: 5 },
        midMorning: { title: "Amla + Walnuts", detail: "Fresh amla + 5 walnuts + sesame seeds", protein: 5 },
        lunch: { title: "Brown Rice + Sambar + Palya", detail: "Brown rice + vegetable sambar + beans palya", protein: 10 },
        snack: { title: "Hurulikaalu (Horse Gram) Soup", detail: "Boiled horse gram soup", protein: 7 },
        dinner: { title: "Jolada Roti + Dal", detail: "2 jowar rotis + toor dal — traditional Udupi-Bangalore combo", protein: 15 },
      },
      {
        theme: "Fibre Power", emoji: "🥣",
        early: { title: "Methi + Amla Water", detail: "Methi water + amla juice + curry leaves", protein: 1 },
        breakfast: { title: "Ragi Mudde + Sambar", detail: "Finger millet balls + vegetable sambar", protein: 8 },
        midMorning: { title: "Guava + Cinnamon Water", detail: "1 guava + cinnamon water", protein: 2 },
        lunch: { title: "Bisi Bele Bath (Light)", detail: "Bisi bele bath with less ghee, extra vegetables — one-pot comfort", protein: 10 },
        snack: { title: "Kadle Usli (Boiled Chickpeas)", detail: "Seasoned boiled chickpeas — Bangalore traditional snack", protein: 7 },
        dinner: { title: "Akki Roti + Soppina Saaru", detail: "Rice roti + leafy green rasam", protein: 7 },
      },
      {
        theme: "Heart-Healthy Fats", emoji: "❤️",
        early: { title: "Garlic + Jeera Water", detail: "Crushed garlic in warm jeera water", protein: 0 },
        breakfast: { title: "Ragi Dosa + Flaxseed Chutney", detail: "2 ragi dosas + ground flaxseed + coconut chutney", protein: 8 },
        midMorning: { title: "Mixed Seeds", detail: "Flaxseed + sesame + pumpkin 1 tbsp each", protein: 6 },
        lunch: { title: "Brown Rice + Menthya Soppu (Methi) Dal", detail: "Brown rice + methi leaves dal", protein: 10 },
        snack: { title: "Moong Sprouts", detail: "Moong sprouts + lemon + pepper", protein: 7 },
        dinner: { title: "Vegetable Pongal", detail: "Moong + brown rice pongal with veggies + ½ tsp ghee", protein: 9 },
      },
      {
        theme: "Anti-Inflammatory", emoji: "🌸",
        early: { title: "Haldi-Adrak-Tulsi Kadha", detail: "Turmeric + ginger + black pepper + tulsi water", protein: 0 },
        breakfast: { title: "Set Dosa + Tomato Saaru", detail: "2 set dosas + thin tomato rasam — light", protein: 7 },
        midMorning: { title: "Papaya", detail: "1 cup papaya + pinch dry ginger", protein: 1 },
        lunch: { title: "Brown Rice + Hurulikaalu Saaru", detail: "Brown rice + horse gram rasam", protein: 8 },
        snack: { title: "Green Tea + Almonds", detail: "Unsweetened tea + 4 almonds", protein: 1 },
        dinner: { title: "Jolada Roti + Palak Dal", detail: "2 jowar rotis + spinach dal", protein: 15 },
      },
      {
        theme: "Millet Magic", emoji: "🌾",
        early: { title: "Methi + Jamun Seed", detail: "Methi water + ½ tsp jamun seed powder", protein: 1 },
        breakfast: { title: "Ragi Kanji (Ambali)", detail: "Ragi porridge — traditional Karnataka breakfast", protein: 3 },
        midMorning: { title: "Amla-Flax Smoothie", detail: "Amla + flaxseeds + ginger blended", protein: 2 },
        lunch: { title: "Jolada Roti + Ennegayi", detail: "Jowar roti + stuffed small brinjal curry — Dharwad style", protein: 5 },
        snack: { title: "Kadle Usli + Jeera Water", detail: "Boiled chana + warm jeera water", protein: 7 },
        dinner: { title: "Ragi Mudde + Bassaru", detail: "Ragi mudde + lentil-spinach bassaru", protein: 9 },
      },
      {
        theme: "Gut Health Day", emoji: "🥛",
        early: { title: "Methi + Tulsi", detail: "Methi water + 5 tulsi leaves chewed", protein: 1 },
        breakfast: { title: "Idli + Sambar + Coconut Chutney", detail: "3 steamed idlis + sambar + fresh coconut chutney", protein: 12 },
        midMorning: { title: "Pomegranate", detail: "½ pomegranate", protein: 2 },
        lunch: { title: "Mosaru Chitranna", detail: "Curd rice with mustard + curry leaves + pomegranate", protein: 9 },
        snack: { title: "Perugu + Chia", detail: "Homemade curd + chia seeds", protein: 6 },
        dinner: { title: "Soppu Saaru + Small Rice", detail: "Leafy green rasam + ½ cup brown rice", protein: 6 },
      },
      {
        theme: "Renewal", emoji: "✨",
        early: { title: "Super Detox Drink", detail: "Warm water + lemon + honey + cinnamon + haldi", protein: 0 },
        breakfast: { title: "Rava Kesari Bath (tiny) + Idli", detail: "1 small kesari bath + 2 idlis — Sunday Bangalore tradition (minimal sugar)", protein: 5 },
        midMorning: { title: "Mixed Seasonal Fruit", detail: "Papaya + pomegranate + guava", protein: 2 },
        lunch: { title: "Full Karnataka Thali", detail: "Dal + sambar + palya + raita + small brown rice + jolada roti", protein: 23 },
        snack: { title: "Kadle Usli + Herbal Tea", detail: "Boiled chickpeas + tulsi-ginger tea", protein: 7 },
        dinner: { title: "Bisi Bele Bath (Small)", detail: "Light bisi bele bath + 1 tsp ghee + papad", protein: 10 },
      },
    ],
    "non-vegetarian": [
      {
        theme: "Detox", emoji: "🌸",
        early: { title: "Methi + Tulsi + Lemon", detail: "Methi water + tulsi + lemon", protein: 1 },
        breakfast: { title: "Egg Akki Roti", detail: "Egg + akki roti — Karnataka style", protein: 10 },
        midMorning: { title: "Amla + Seeds", detail: "Amla + walnuts + sesame", protein: 4 },
        lunch: { title: "Chicken Saaru + Brown Rice", detail: "Light Bangalore chicken rasam + ½ cup brown rice", protein: 12 },
        snack: { title: "Hurulikaalu Soup", detail: "Horse gram soup", protein: 7 },
        dinner: { title: "Jolada Roti + Chicken Palya", detail: "2 jowar rotis + dry chicken stir-fry, min oil", protein: 28 },
      },
      {
        theme: "Protein Power", emoji: "💪",
        early: { title: "Methi + Amla", detail: "Methi water + amla + curry leaves", protein: 1 },
        breakfast: { title: "Egg Dosa + Sambar", detail: "Egg dosa + veg sambar", protein: 14 },
        midMorning: { title: "Guava + Seeds", detail: "Guava + pumpkin seeds", protein: 4 },
        lunch: { title: "Mutton Saaru + Brown Rice", detail: "Light mutton rasam (thin broth) + ½ cup brown rice", protein: 11 },
        snack: { title: "Sprouts + Curd", detail: "Moong sprouts + curd", protein: 11 },
        dinner: { title: "Chicken Curry + Jolada Roti", detail: "Nati chicken curry (light) + 2 jowar rotis", protein: 28 },
      },
      {
        theme: "Omega-3", emoji: "❤️",
        early: { title: "Garlic + Jeera", detail: "Garlic in warm jeera water", protein: 0 },
        breakfast: { title: "Grilled Fish + Ragi Dosa", detail: "Grilled Kane fish + 2 ragi dosas — Karnataka favourite", protein: 22 },
        midMorning: { title: "Seeds + Amla", detail: "Flaxseed + sesame + amla water", protein: 3 },
        lunch: { title: "Fish Saaru + Brown Rice", detail: "Fish rasam (Karnataka) + ½ cup brown rice", protein: 12 },
        snack: { title: "Makhana + Tea", detail: "Makhana + unsweetened tea", protein: 3 },
        dinner: { title: "Prawn Palya + Akki Roti", detail: "Dry coconut prawn stir-fry + 2 akki rotis", protein: 25 },
      },
      {
        theme: "Anti-Inflammatory", emoji: "🌸",
        early: { title: "Haldi Kadha", detail: "Turmeric + ginger + pepper + tulsi", protein: 0 },
        breakfast: { title: "Egg Bhurji + Set Dosa", detail: "Egg bhurji + 2 set dosas", protein: 18 },
        midMorning: { title: "Papaya", detail: "1 cup papaya", protein: 1 },
        lunch: { title: "Hurulikaalu Saaru + Brown Rice + Chicken", detail: "Horse gram rasam + chicken + brown rice", protein: 28 },
        snack: { title: "Green Tea + Almonds", detail: "Tea + 4 almonds", protein: 1 },
        dinner: { title: "Grilled Fish + Jolada Roti", detail: "Grilled fish + 2 jowar rotis", protein: 25 },
      },
      {
        theme: "Millet", emoji: "🌾",
        early: { title: "Methi + Jamun Seed", detail: "Methi water + jamun seed powder", protein: 1 },
        breakfast: { title: "Ragi Mudde + Egg Curry", detail: "Ragi mudde + 1-egg curry", protein: 9 },
        midMorning: { title: "Amla-Flax Smoothie", detail: "Amla + flaxseeds + ginger", protein: 2 },
        lunch: { title: "Jolada Roti + Mutton Saaru", detail: "2 jowar rotis + thin mutton broth", protein: 16 },
        snack: { title: "Steamed Idli", detail: "2 idlis + chutney", protein: 4 },
        dinner: { title: "Fish Saaru + Brown Rice", detail: "Fish rasam + ½ cup brown rice", protein: 12 },
      },
      {
        theme: "Gut Health", emoji: "🥛",
        early: { title: "Methi + Tulsi", detail: "Methi water + tulsi", protein: 1 },
        breakfast: { title: "Egg Idli + Sambar", detail: "2 eggs + 3 idlis + sambar", protein: 24 },
        midMorning: { title: "Pomegranate + Curd", detail: "½ pomegranate + curd", protein: 6 },
        lunch: { title: "Mosaru Chitranna + Grilled Fish", detail: "Curd rice + 80g grilled fish", protein: 21 },
        snack: { title: "Chia Curd", detail: "Curd + chia seeds", protein: 6 },
        dinner: { title: "Chicken Saaru + Jolada Roti", detail: "Chicken rasam + 2 jowar rotis", protein: 17 },
      },
      {
        theme: "Renewal", emoji: "✨",
        early: { title: "Super Detox Drink", detail: "Lemon + honey + cinnamon + haldi", protein: 0 },
        breakfast: { title: "Set Dosa + Egg + Sambar", detail: "2 set dosas + egg + sambar", protein: 16 },
        midMorning: { title: "Mixed Fruit", detail: "Papaya + pomegranate + guava", protein: 2 },
        lunch: { title: "Karnataka Non-Veg Thali", detail: "Chicken + fish + dal + sambar + rice + jowar roti", protein: 44 },
        snack: { title: "Kadle + Tea", detail: "Boiled chickpeas + tulsi tea", protein: 7 },
        dinner: { title: "Bisi Bele Bath + Grilled Chicken", detail: "Light bisi bele bath + 80g grilled chicken", protein: 26 },
      },
    ],
    "vegan": [
      {
        theme: "Akki Roti Detox", emoji: "🌸",
        early: { title: "Methi + Tulsi + Lemon", detail: "Methi water + tulsi + lemon", protein: 1 },
        breakfast: { title: "Akki Roti (Vegan)", detail: "Akki roti + coconut chutney, no dairy", protein: 5 },
        midMorning: { title: "Amla + Seeds", detail: "Amla + walnuts + sesame", protein: 4 },
        lunch: { title: "Brown Rice + Sambar + Palya", detail: "Brown rice + sambar (no ghee) + palya", protein: 10 },
        snack: { title: "Hurulikaalu Soup", detail: "Horse gram soup", protein: 7 },
        dinner: { title: "Jolada Roti + Dal", detail: "2 jowar rotis + toor dal, no dairy", protein: 15 },
      },
      {
        theme: "Fibre", emoji: "🥣",
        early: { title: "Methi + Amla", detail: "Methi water + amla + curry leaves", protein: 1 },
        breakfast: { title: "Ragi Mudde + Vegan Sambar", detail: "Ragi mudde + sambar without ghee tadka", protein: 8 },
        midMorning: { title: "Guava + Cinnamon Water", detail: "Guava + cinnamon water", protein: 2 },
        lunch: { title: "Bisi Bele Bath (Vegan)", detail: "Bisi bele bath, coconut oil, no ghee", protein: 8 },
        snack: { title: "Kadle Usli", detail: "Boiled chickpeas seasoned", protein: 7 },
        dinner: { title: "Akki Roti + Soppina Saaru", detail: "Rice roti + leafy green rasam", protein: 7 },
      },
      {
        theme: "Heart-Healthy", emoji: "❤️",
        early: { title: "Garlic + Jeera", detail: "Garlic in warm jeera water", protein: 0 },
        breakfast: { title: "Ragi Dosa + Flaxseed Chutney", detail: "2 ragi dosas + flaxseed + coconut chutney", protein: 8 },
        midMorning: { title: "Mixed Seeds", detail: "Flaxseed + sesame + pumpkin", protein: 6 },
        lunch: { title: "Brown Rice + Methi Dal", detail: "Brown rice + methi dal, mustard oil", protein: 10 },
        snack: { title: "Sprouts", detail: "Moong sprouts + lemon", protein: 7 },
        dinner: { title: "Veg Pongal (Vegan)", detail: "Moong pongal, coconut oil", protein: 7 },
      },
      {
        theme: "Anti-Inflammatory", emoji: "🌸",
        early: { title: "Haldi Kadha", detail: "Turmeric + ginger + pepper + tulsi", protein: 0 },
        breakfast: { title: "Set Dosa (Vegan)", detail: "2 set dosas + tomato chutney, no curd", protein: 5 },
        midMorning: { title: "Papaya", detail: "1 cup papaya", protein: 1 },
        lunch: { title: "Brown Rice + Hurulikaalu Saaru", detail: "Brown rice + horse gram rasam", protein: 8 },
        snack: { title: "Green Tea + Almonds", detail: "Tea + 4 almonds", protein: 1 },
        dinner: { title: "Jolada Roti + Palak Dal", detail: "2 jowar rotis + spinach dal", protein: 15 },
      },
      {
        theme: "Millet", emoji: "🌾",
        early: { title: "Methi + Jamun Seed", detail: "Methi water + jamun seed powder", protein: 1 },
        breakfast: { title: "Ragi Ambali (Vegan)", detail: "Ragi porridge, water-based", protein: 3 },
        midMorning: { title: "Amla-Flax Smoothie", detail: "Amla + flaxseeds + water", protein: 2 },
        lunch: { title: "Jolada Roti + Ennegayi", detail: "Jowar roti + stuffed brinjal curry", protein: 6 },
        snack: { title: "Kadle Usli + Jeera Water", detail: "Chickpeas + warm jeera water", protein: 8 },
        dinner: { title: "Ragi Mudde + Bassaru", detail: "Ragi mudde + lentil-spinach bassaru", protein: 9 },
      },
      {
        theme: "Gut", emoji: "🥛",
        early: { title: "Methi + Tulsi", detail: "Methi water + tulsi", protein: 1 },
        breakfast: { title: "Idli + Vegan Sambar", detail: "3 idlis + sambar, no ghee", protein: 11 },
        midMorning: { title: "Pomegranate", detail: "½ pomegranate", protein: 2 },
        lunch: { title: "Mosaru Chitranna (Coconut Curd)", detail: "Coconut curd rice + mustard + curry leaves", protein: 3 },
        snack: { title: "Coconut Dahi + Chia", detail: "Coconut yoghurt + chia", protein: 3 },
        dinner: { title: "Soppu Saaru + Small Rice", detail: "Leafy green rasam + ½ cup brown rice", protein: 6 },
      },
      {
        theme: "Renewal", emoji: "✨",
        early: { title: "Super Detox Drink", detail: "Lemon + maple syrup + cinnamon + haldi", protein: 0 },
        breakfast: { title: "Ragi Mudde + Sambar (Vegan)", detail: "Ragi mudde + vegan sambar", protein: 8 },
        midMorning: { title: "Mixed Fruit", detail: "Papaya + pomegranate + guava", protein: 2 },
        lunch: { title: "Vegan Karnataka Thali", detail: "Dal + sambar + palya + brown rice + jowar roti", protein: 21 },
        snack: { title: "Kadle + Herbal Tea", detail: "Chickpeas + tulsi tea", protein: 8 },
        dinner: { title: "Bisi Bele Bath (Vegan)", detail: "Light bisi bele bath, coconut oil", protein: 8 },
      },
    ],
  },
};

/** Evening protein snacks (all diets) — the artifact swaps these into every day's snack slot. */
export const PROTEIN_SNACKS: readonly Meal[] = [
  { title: "Roasted Chana", detail: "½ cup dry-roasted chana · jeera water on the side", protein: 10 },
  { title: "Moong Sprouts Chaat", detail: "1 cup moong sprouts · lemon + chilli + onion", protein: 7 },
  { title: "Roasted Chana", detail: "½ cup roasted chana · unsweetened green tea", protein: 10 },
  { title: "Sprouted Chana Salad", detail: "1 cup sprouted chickpeas · cucumber + lemon + pepper", protein: 9 },
  { title: "Mixed Sprouts", detail: "½ cup moong + chana sprouts · amla on the side", protein: 4 },
  { title: "Roasted Chana", detail: "½ cup roasted chana · tulsi-ginger herbal tea", protein: 10 },
  { title: "Sprouts Bhel", detail: "1 cup moong sprouts + onion + tomato + lemon", protein: 7 },
];

/** Non-vegetarian air-fry dinners — used every day. */
export const AIR_FRY_DINNERS: readonly Meal[] = [
  { title: "Air Fry Chicken Breast", detail: "150g air fry chicken (0 oil) · side salad + 1 roti", protein: 39 },
  { title: "Air Fry Salmon Fillet", detail: "150g air fry salmon (5 min, 200°C) · lemon + herbs + brown rice", protein: 33 },
  { title: "Air Fry Chicken Tikka", detail: "150g air fry chicken tikka (no oil marinade) · mint chutney + 2 bajra rotis", protein: 43 },
  { title: "Air Fry Salmon + Quinoa Bowl", detail: "150g air fry salmon · ½ cup brown rice + cucumber salad", protein: 34 },
  { title: "Air Fry Chicken Thigh", detail: "150g air fry boneless thigh (200°C, 18 min) + spinach sabzi", protein: 32 },
  { title: "Air Fry Salmon with Herbs", detail: "150g air fry salmon + turmeric-lemon rub + 1 jowar roti", protein: 34 },
  { title: "Air Fry Chicken Breast + Dal", detail: "150g air fry chicken · moong dal + 1 roti", protein: 45 },
];

/** Non-vegetarian air-fry lunches — used on alternate days (Tue, Thu, Sat). */
export const AIR_FRY_LUNCHES: readonly Meal[] = [
  { title: "Air Fry Chicken + Brown Rice", detail: "150g air fry chicken breast · ½ cup brown rice + raita", protein: 40 },
  { title: "Air Fry Salmon + Dal", detail: "150g air fry salmon · moong dal + ½ cup brown rice", protein: 40 },
  { title: "Air Fry Chicken Bowl", detail: "150g air fry chicken + veggies · jowar roti + salad", protein: 42 },
  { title: "Air Fry Salmon + Millet", detail: "150g air fry salmon · ragi roti + green chutney", protein: 33 },
  { title: "Air Fry Chicken + Palak Dal", detail: "150g air fry chicken · palak dal + brown rice", protein: 44 },
  { title: "Air Fry Salmon + Rice", detail: "150g air fry salmon · ½ cup brown rice + rasam", protein: 34 },
  { title: "Air Fry Chicken Thali", detail: "150g air fry chicken · dal + sabzi + 1 roti", protein: 47 },
];
// </generated:meals>

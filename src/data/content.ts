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
  privacyNote: "Your details stay on this device only.",
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
const HERB_NOTE =
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
        early: { title: "Methi + Lemon Water", detail: "Methi water + warm lemon + garlic clove" },
        breakfast: { title: "Oats Upma", detail: "Rolled oats with carrot, peas, capsicum in olive oil" },
        midMorning: { title: "Amla + Walnuts", detail: "Fresh amla + 5 soaked walnuts + pumpkin seeds" },
        lunch: { title: "Brown Rice + Moong Dal", detail: "Brown rice + moong dal tadka + cucumber-onion salad" },
        snack: { title: "Roasted Chana", detail: "½ cup roasted chana + warm jeera water" },
        dinner: { title: "Bajra Roti + Palak Sabzi", detail: "2 bajra rotis + spinach-garlic sabzi" },
      },
      {
        theme: "Fibre Power", emoji: "🥣",
        early: { title: "Methi + Amla Water", detail: "Methi water + amla juice + 8 curry leaves chewed" },
        breakfast: { title: "Daliya Khichdi", detail: "Broken wheat khichdi with mixed veggies + small curd" },
        midMorning: { title: "Guava + Cinnamon Water", detail: "1 whole guava + cinnamon water" },
        lunch: { title: "Rajma + Jowar Roti", detail: "Rajma curry + 2 jowar rotis + raw veggie salad" },
        snack: { title: "Makhana", detail: "1 cup roasted makhana with turmeric" },
        dinner: { title: "Moong Dal Soup + Methi Roti", detail: "Light moong soup + 2 fenugreek rotis" },
      },
      {
        theme: "Omega-3 Focus", emoji: "❤️",
        early: { title: "Garlic + Jeera Water", detail: "Crushed garlic in warm jeera water" },
        breakfast: { title: "Walnut Smoothie", detail: "Banana + 4 walnuts + 200ml low-fat milk blended" },
        midMorning: { title: "Mixed Seeds", detail: "1 tbsp each sunflower + pumpkin + flaxseeds" },
        lunch: { title: "Chana Dal + Ragi Roti", detail: "Chana dal + 2 ragi rotis + small curd" },
        snack: { title: "Sprouts Salad", detail: "Moong sprouts + lemon + pepper + onion + tomato" },
        dinner: { title: "Vegetable Khichdi", detail: "Moong dal + brown rice khichdi + ½ tsp ghee" },
      },
      {
        theme: "Anti-Inflammatory", emoji: "🌸",
        early: { title: "Turmeric-Ginger Kadha", detail: "Turmeric + ginger + black pepper in water" },
        breakfast: { title: "Moong Dal Chilla", detail: "3 moong chillas with mint chutney" },
        midMorning: { title: "Papaya", detail: "1 cup papaya" },
        lunch: { title: "Sambhar + Brown Rice", detail: "Mixed lentil sambhar + ½ cup brown rice + raita" },
        snack: { title: "Green Tea + Almonds", detail: "Masala green tea + 4 almonds" },
        dinner: { title: "Paneer Bhurji + Rotis", detail: "Low-fat paneer bhurji + 2 flaxseed wheat rotis" },
      },
      {
        theme: "Millet Magic", emoji: "🌾",
        early: { title: "Methi + Jamun Seed", detail: "Methi water + ½ tsp jamun seed powder" },
        breakfast: { title: "Ragi Porridge", detail: "Ragi porridge with cinnamon, unsweetened" },
        midMorning: { title: "Amla-Flax Smoothie", detail: "Amla + flaxseeds + ginger blended" },
        lunch: { title: "Toor Dal + Jowar Bhakri", detail: "Toor dal tadka + 2 jowar bhakris + raw onion" },
        snack: { title: "Steamed Dhokla", detail: "2 steamed dhokla — fermented" },
        dinner: { title: "Dalia + Buttermilk", detail: "Cracked wheat veg soup + jeera buttermilk" },
      },
      {
        theme: "Gut Health Day", emoji: "🥛",
        early: { title: "Methi + Tulsi", detail: "Methi water + 5 tulsi leaves chewed" },
        breakfast: { title: "Idli + Sambar", detail: "3 steamed idlis + light sambar + chutney" },
        midMorning: { title: "Pomegranate", detail: "½ pomegranate" },
        lunch: { title: "Chole + Brown Rice + Raita", detail: "Chickpea curry + ½ cup brown rice + cucumber raita" },
        snack: { title: "Curd + Chia Seeds", detail: "Low-fat curd + 1 tbsp soaked chia seeds" },
        dinner: { title: "Lauki Soup + Roti", detail: "Bottle gourd soup + ginger + garlic + 1–2 rotis" },
      },
      {
        theme: "Renewal", emoji: "✨",
        early: { title: "Super Detox Drink", detail: "Warm water + lemon + honey + cinnamon + turmeric" },
        breakfast: { title: "Flaxseed Poha", detail: "Brown rice poha + curry leaves + peas + 1 tbsp flaxseeds" },
        midMorning: { title: "Mixed Seasonal Fruit", detail: "Berries + papaya + pomegranate — whole fruit only" },
        lunch: { title: "Balanced Thali", detail: "Brown rice + dal + 2 sabzis + salad + 1 roti" },
        snack: { title: "Chana + Tulsi Tea", detail: "Roasted chana + tulsi-ginger herbal tea" },
        dinner: { title: "Light Khichdi", detail: "Moong-veg khichdi + roasted papad" },
      },
    ],
    "non-vegetarian": [
      {
        theme: "Detox & Reset", emoji: "🌱",
        early: { title: "Methi + Lemon Water", detail: "Methi water + warm lemon + crushed garlic" },
        breakfast: { title: "Egg White Omelette", detail: "2-egg white omelette + spinach + multigrain toast" },
        midMorning: { title: "Amla + Walnuts", detail: "Fresh amla + 5 walnuts + 2 tbsp pumpkin seeds" },
        lunch: { title: "Grilled Fish + Brown Rice", detail: "150g grilled rohu/surmai + ½ cup brown rice + salad" },
        snack: { title: "Roasted Chana", detail: "½ cup chana + jeera water" },
        dinner: { title: "Bajra Roti + Chicken Curry", detail: "2 bajra rotis + skinless chicken curry, min oil" },
      },
      {
        theme: "Protein Power", emoji: "💪",
        early: { title: "Methi + Amla Water", detail: "Methi water + amla juice + curry leaves" },
        breakfast: { title: "Eggs + Daliya", detail: "2 boiled eggs + broken wheat porridge with veggies" },
        midMorning: { title: "Guava + Pumpkin Seeds", detail: "1 whole guava + 1 tbsp pumpkin seeds" },
        lunch: { title: "Grilled Chicken + Jowar Roti", detail: "150g chicken breast + 2 jowar rotis + salad" },
        snack: { title: "Sprouts + Curd", detail: "Moong sprouts in curd" },
        dinner: { title: "Fish Soup + Methi Roti", detail: "Clear fish soup with veggies + 2 methi rotis" },
      },
      {
        theme: "Omega-3 Day", emoji: "❤️",
        early: { title: "Garlic + Jeera Water", detail: "Crushed garlic in warm jeera water" },
        breakfast: { title: "Mackerel + Roti", detail: "100g grilled mackerel + 1 multigrain roti" },
        midMorning: { title: "Seeds + Amla", detail: "Flaxseed + sunflower seeds + amla water" },
        lunch: { title: "Egg Curry + Brown Rice", detail: "2-egg curry (low oil) + ½ cup brown rice + raita" },
        snack: { title: "Makhana + Green Tea", detail: "1 cup makhana + unsweetened green tea" },
        dinner: { title: "Grilled Prawns + Khichdi", detail: "100g grilled prawns + moong-veg khichdi" },
      },
      {
        theme: "Anti-Inflammatory", emoji: "🌸",
        early: { title: "Turmeric-Ginger Decoction", detail: "Turmeric + ginger + black pepper in water" },
        breakfast: { title: "Scrambled Eggs + Oats", detail: "2-egg scramble with turmeric + oats upma" },
        midMorning: { title: "Papaya", detail: "1 cup papaya" },
        lunch: { title: "Chicken Sambhar + Rice", detail: "Chicken in sambhar + ½ cup brown rice + raita" },
        snack: { title: "Green Tea + Almonds", detail: "Ginger-cardamom green tea + 4 almonds" },
        dinner: { title: "Fish Tikka + Roti", detail: "2 grilled fish tikka + 2 flaxseed rotis" },
      },
      {
        theme: "Millet Day", emoji: "🌾",
        early: { title: "Methi + Jamun Seed", detail: "Methi water + ½ tsp jamun seed powder" },
        breakfast: { title: "Ragi Dosa + Egg", detail: "2 ragi dosas + 1 boiled egg + coconut chutney" },
        midMorning: { title: "Amla-Flax Smoothie", detail: "Amla + flaxseeds + ginger blended" },
        lunch: { title: "Lean Keema + Jowar Bhakri", detail: "Chicken keema (min oil) + 2 jowar bhakris + salad" },
        snack: { title: "Steamed Idli", detail: "2 idlis + mint chutney" },
        dinner: { title: "Chicken Bone Broth + Dalia", detail: "Clear chicken broth + veg dalia" },
      },
      {
        theme: "Gut Health", emoji: "🥛",
        early: { title: "Methi + Tulsi", detail: "Methi water + 5 tulsi leaves" },
        breakfast: { title: "Egg Bhurji + Toast", detail: "2-egg bhurji + spinach + 1 multigrain toast" },
        midMorning: { title: "Pomegranate + Curd", detail: "½ pomegranate + curd" },
        lunch: { title: "Fish Curry + Brown Rice", detail: "Light tomato-base fish curry + ½ cup brown rice" },
        snack: { title: "Chia Curd", detail: "Homemade curd + 1 tbsp soaked chia seeds" },
        dinner: { title: "Chicken Soup + Roti", detail: "Thin chicken-vegetable soup + 1 wheat roti" },
      },
      {
        theme: "Renewal & Strength", emoji: "✨",
        early: { title: "Super Detox Drink", detail: "Warm water + lemon + honey + cinnamon + turmeric" },
        breakfast: { title: "Flaxseed Poha + Egg", detail: "Brown rice poha + curry leaves + 1 boiled egg" },
        midMorning: { title: "Mixed Fruit", detail: "Berries + papaya + pomegranate — whole fruit only" },
        lunch: { title: "Grilled Chicken Thali", detail: "Grilled chicken + dal + sabzi + salad + 1 roti" },
        snack: { title: "Chana + Tulsi Tea", detail: "Roasted chana + tulsi-ginger tea" },
        dinner: { title: "Light Khichdi + Fish", detail: "Moong-veg khichdi + 80g steamed fish" },
      },
    ],
    "vegan": [
      {
        theme: "Detox & Reset", emoji: "🌱",
        early: { title: "Methi + Lemon + Garlic", detail: "Methi water + warm lemon + garlic + turmeric" },
        breakfast: { title: "Oats Upma (Dairy-free)", detail: "Oats upma with veggies in olive oil + green tea" },
        midMorning: { title: "Amla + Walnuts + Pumpkin Seeds", detail: "Fresh amla + walnuts + pumpkin seeds" },
        lunch: { title: "Brown Rice + Moong Dal", detail: "Brown rice + moong dal (mustard oil) + raw salad" },
        snack: { title: "Roasted Chana + Jeera Water", detail: "½ cup roasted chana + warm jeera water" },
        dinner: { title: "Bajra Roti + Palak Sabzi", detail: "2 bajra rotis + spinach-garlic sabzi" },
      },
      {
        theme: "Plant Protein", emoji: "🥣",
        early: { title: "Methi + Amla", detail: "Methi water + amla juice + curry leaves" },
        breakfast: { title: "Tofu Scramble + Roti", detail: "Crumbled tofu scramble with turmeric + 1 multigrain roti" },
        midMorning: { title: "Guava + Mixed Seeds", detail: "1 whole guava + sunflower + pumpkin seeds" },
        lunch: { title: "Rajma + Jowar Roti", detail: "Rajma curry (no dairy) + 2 jowar rotis + salad" },
        snack: { title: "Makhana", detail: "1 cup roasted makhana with turmeric" },
        dinner: { title: "Moong Dal Soup + Methi Roti", detail: "Moong soup + 2 fenugreek rotis" },
      },
      {
        theme: "Omega-3 Focus", emoji: "❤️",
        early: { title: "Garlic + Jeera Water", detail: "Crushed garlic in warm jeera water" },
        breakfast: { title: "Chia Oat Bowl", detail: "Oats soaked in oat milk + 1 tbsp chia + banana + cinnamon" },
        midMorning: { title: "Mixed Seeds", detail: "1 tbsp each flaxseed + chia + hemp seeds" },
        lunch: { title: "Chana Dal + Ragi Roti", detail: "Chana dal + 2 ragi rotis" },
        snack: { title: "Sprouts Salad", detail: "Moong + chana sprouts + lemon + pepper + onion" },
        dinner: { title: "Vegetable Khichdi", detail: "Moong + brown rice khichdi + ½ tsp coconut oil" },
      },
      {
        theme: "Anti-Inflammatory", emoji: "🌸",
        early: { title: "Turmeric-Ginger Kadha", detail: "Turmeric + ginger + black pepper in water" },
        breakfast: { title: "Moong Dal Chilla", detail: "3 moong chillas with mint chutney — high protein" },
        midMorning: { title: "Papaya + Ginger", detail: "1 cup papaya + pinch ginger powder" },
        lunch: { title: "Vegan Sambhar + Brown Rice", detail: "Lentil sambhar (no ghee) + ½ cup brown rice" },
        snack: { title: "Green Tea + Almonds", detail: "Masala green tea + 4 almonds" },
        dinner: { title: "Tofu Bhurji + Rotis", detail: "Tofu bhurji + turmeric + black pepper + 2 wheat rotis" },
      },
      {
        theme: "Millet Day", emoji: "🌾",
        early: { title: "Methi + Jamun Seed", detail: "Methi water + ½ tsp jamun seed powder" },
        breakfast: { title: "Ragi Porridge (Dairy-free)", detail: "Ragi in oat milk + cinnamon, no sugar" },
        midMorning: { title: "Amla-Flax Smoothie", detail: "Amla + flaxseeds + water + ginger blended" },
        lunch: { title: "Toor Dal + Jowar Bhakri", detail: "Toor dal tadka + 2 jowar bhakris + raw onion" },
        snack: { title: "Steamed Dhokla", detail: "2 steamed dhokla — fermented" },
        dinner: { title: "Dalia Soup", detail: "Cracked wheat vegetable soup + roasted papad" },
      },
      {
        theme: "Gut Health", emoji: "🥛",
        early: { title: "Methi + Tulsi", detail: "Methi water + 5 tulsi leaves" },
        breakfast: { title: "Idli + Vegan Sambar", detail: "3 idlis + vegan sambar (no ghee) + coconut chutney" },
        midMorning: { title: "Pomegranate", detail: "½ pomegranate" },
        lunch: { title: "Chole + Brown Rice", detail: "Chickpeas (olive oil) + ½ cup brown rice + kachumber salad" },
        snack: { title: "Coconut Yoghurt + Chia", detail: "Vegan coconut yoghurt + 1 tbsp soaked chia seeds" },
        dinner: { title: "Lauki Soup + Roti", detail: "Bottle gourd soup + garlic + ginger + 1–2 rotis" },
      },
      {
        theme: "Renewal", emoji: "✨",
        early: { title: "Super Detox Drink", detail: "Warm water + lemon + maple syrup + cinnamon + turmeric" },
        breakfast: { title: "Flaxseed Poha", detail: "Brown rice poha + curry leaves + peas + 1 tbsp flaxseeds" },
        midMorning: { title: "Mixed Fruit", detail: "Berries + papaya + pomegranate — whole fruit only" },
        lunch: { title: "Vegan Thali", detail: "Brown rice + dal + 2 sabzis + salad + 1 roti" },
        snack: { title: "Chana + Tulsi Tea", detail: "Roasted chana + tulsi-ginger herbal tea" },
        dinner: { title: "Light Khichdi", detail: "Moong-veg khichdi (no ghee) + roasted papad" },
      },
    ],
  },
  "north-indian": {
    "vegetarian": [
      {
        theme: "Detox & Reset", emoji: "🌱",
        early: { title: "Methi + Warm Lemon", detail: "Methi water + lemon + raw garlic + pinch hing" },
        breakfast: { title: "Oats Upma", detail: "Rolled oats with carrot, peas, capsicum, mustard seeds" },
        midMorning: { title: "Amla + Soaked Almonds", detail: "Fresh amla + 5 almonds + 2 walnuts" },
        lunch: { title: "Brown Rice + Moong Dal", detail: "Light moong dal tadka + brown rice + kachumber salad" },
        snack: { title: "Roasted Chana", detail: "½ cup roasted chana + warm jeera water" },
        dinner: { title: "Bajra Roti + Lauki Sabzi", detail: "2 bajra rotis + bottle gourd sabzi — light dinner" },
      },
      {
        theme: "Fibre Power", emoji: "🥣",
        early: { title: "Methi + Amla Water", detail: "Methi water + amla juice + curry leaves" },
        breakfast: { title: "Daliya (Broken Wheat) Khichdi", detail: "Daliya khichdi with mixed veggies + small curd" },
        midMorning: { title: "Guava + Cinnamon Water", detail: "1 whole guava + cinnamon water" },
        lunch: { title: "Rajma + Jowar Roti", detail: "Rajma curry + 2 jowar rotis + raw onion salad" },
        snack: { title: "Makhana", detail: "1 cup dry-roasted makhana with turmeric + jeera" },
        dinner: { title: "Moong Dal Soup + Methi Thepla", detail: "Light moong soup + 2 fenugreek theplas" },
      },
      {
        theme: "Heart-Healthy Fats", emoji: "❤️",
        early: { title: "Garlic + Jeera Water", detail: "1 raw garlic in warm jeera water" },
        breakfast: { title: "Sarson ka Saag + Makki Roti", detail: "Light mustard greens saag + 1 makki roti" },
        midMorning: { title: "Mixed Seeds", detail: "1 tbsp each flaxseed + pumpkin + sunflower seeds" },
        lunch: { title: "Chana Dal + Ragi Roti", detail: "Chana dal + 2 ragi rotis + cucumber raita" },
        snack: { title: "Moong Sprouts Chaat", detail: "Moong sprouts + lemon + chaat masala (no fried base)" },
        dinner: { title: "Vegetable Khichdi", detail: "Moong dal + brown rice khichdi + ½ tsp desi ghee" },
      },
      {
        theme: "Anti-Inflammatory", emoji: "🌸",
        early: { title: "Haldi-Adrak Kadha", detail: "Turmeric + ginger + black pepper + tulsi water" },
        breakfast: { title: "Besan Cheela", detail: "2 besan cheelas with spinach + mint-coriander chutney" },
        midMorning: { title: "Papaya + Ginger", detail: "1 cup papaya + pinch dry ginger powder" },
        lunch: { title: "Palak Paneer (Light) + Brown Rice", detail: "Low-fat palak paneer + ½ cup brown rice" },
        snack: { title: "Green Tea + Akhrot", detail: "Tulsi green tea + 4 walnuts" },
        dinner: { title: "Dal Tadka + Bajra Roti", detail: "Simple arhar dal tadka + 2 bajra rotis" },
      },
      {
        theme: "Millet Magic", emoji: "🌾",
        early: { title: "Methi + Jamun Seed Water", detail: "Methi water + ½ tsp jamun seed powder" },
        breakfast: { title: "Ragi Porridge", detail: "Ragi dalia with cinnamon + a pinch of cardamom, no sugar" },
        midMorning: { title: "Amla-Flax Smoothie", detail: "Amla + 1 tbsp flaxseeds + ginger blended" },
        lunch: { title: "Jowar Roti + Arhar Dal", detail: "2 jowar rotis + arhar dal + raw onion + nimbu" },
        snack: { title: "Steamed Dhokla", detail: "2 steamed dhoklas — fermented" },
        dinner: { title: "Bajra Khichdi", detail: "Bajra + moong dal khichdi with lauki" },
      },
      {
        theme: "Gut Health Day", emoji: "🥛",
        early: { title: "Methi + Tulsi", detail: "Methi water + 5 tulsi leaves chewed" },
        breakfast: { title: "Poha with Flaxseeds", detail: "Brown rice poha + mustard seeds + curry leaves + 1 tbsp flaxseeds" },
        midMorning: { title: "Pomegranate", detail: "½ pomegranate" },
        lunch: { title: "Chole + Brown Rice + Raita", detail: "Chickpea curry + ½ cup brown rice + cucumber raita" },
        snack: { title: "Dahi + Chia Seeds", detail: "Homemade dahi + 1 tbsp soaked chia seeds" },
        dinner: { title: "Lauki Sabzi + Bajra Roti", detail: "Bottle gourd with garlic + 1–2 bajra rotis" },
      },
      {
        theme: "Renewal", emoji: "✨",
        early: { title: "Super Detox Drink", detail: "Warm water + lemon + honey + cinnamon + haldi" },
        breakfast: { title: "Sabudana Khichdi (small)", detail: "Small portion sabudana khichdi + peanuts (Sunday special)" },
        midMorning: { title: "Mixed Seasonal Fruit", detail: "Papaya + pomegranate + berries — whole fruit only" },
        lunch: { title: "Full North Indian Thali", detail: "Dal + sabzi + small brown rice + 1 roti + salad" },
        snack: { title: "Roasted Makhana + Herbal Tea", detail: "Makhana + tulsi-ginger tea, no sugar" },
        dinner: { title: "Moong Dal Khichdi", detail: "Light moong-veg khichdi + 1 tsp ghee + roasted papad" },
      },
    ],
    "non-vegetarian": [
      {
        theme: "Detox & Reset", emoji: "🌱",
        early: { title: "Methi + Lemon", detail: "Methi water + warm lemon + crushed garlic" },
        breakfast: { title: "Anda Bhurji + Multigrain Toast", detail: "2-egg bhurji with spinach + 1 multigrain toast" },
        midMorning: { title: "Amla + Walnuts", detail: "Fresh amla + 5 walnuts + pumpkin seeds" },
        lunch: { title: "Grilled Murgh + Brown Rice", detail: "150g grilled chicken (no cream) + ½ cup brown rice + salad" },
        snack: { title: "Roasted Chana", detail: "½ cup chana + jeera water" },
        dinner: { title: "Bajra Roti + Keema Matar (light)", detail: "2 bajra rotis + lean chicken keema + green peas, min oil" },
      },
      {
        theme: "Protein Power", emoji: "💪",
        early: { title: "Methi + Amla", detail: "Methi water + amla juice + curry leaves" },
        breakfast: { title: "Boiled Anda + Daliya", detail: "2 boiled eggs + broken wheat porridge with veggies" },
        midMorning: { title: "Guava + Seeds", detail: "1 whole guava + pumpkin seeds" },
        lunch: { title: "Murgh Shorba + Jowar Roti", detail: "Light chicken shorba (broth-based) + 2 jowar rotis" },
        snack: { title: "Sprouts + Dahi", detail: "Moong sprouts + curd" },
        dinner: { title: "Fish Curry + Bajra Roti", detail: "Light rohu/surmai curry (mustard base) + 2 bajra rotis" },
      },
      {
        theme: "Omega-3 Day", emoji: "❤️",
        early: { title: "Garlic + Jeera Water", detail: "Crushed garlic in warm jeera water" },
        breakfast: { title: "Mackerel Tikka + Roti", detail: "100g grilled mackerel + 1 multigrain roti" },
        midMorning: { title: "Seeds + Amla", detail: "Flaxseed + sunflower seeds + amla water" },
        lunch: { title: "Anda Curry + Brown Rice", detail: "2-egg curry (low oil, no cream) + ½ cup brown rice + raita" },
        snack: { title: "Makhana + Green Tea", detail: "1 cup makhana + unsweetened tulsi tea" },
        dinner: { title: "Grilled Tangri + Khichdi", detail: "2 grilled chicken tangri (no butter) + moong khichdi" },
      },
      {
        theme: "Anti-Inflammatory", emoji: "🌸",
        early: { title: "Haldi-Adrak Kadha", detail: "Turmeric + ginger + pepper in water" },
        breakfast: { title: "Anda Omelette + Oats", detail: "2-egg omelette with haldi + oats upma" },
        midMorning: { title: "Papaya", detail: "1 cup papaya" },
        lunch: { title: "Murgh Saag + Brown Rice", detail: "Chicken in light spinach gravy + ½ cup brown rice" },
        snack: { title: "Green Tea + Akhrot", detail: "Ginger-cardamom green tea + 4 walnuts" },
        dinner: { title: "Fish Tikka + Bajra Roti", detail: "2 grilled fish tikka (no cream) + 2 bajra rotis" },
      },
      {
        theme: "Millet Day", emoji: "🌾",
        early: { title: "Methi + Jamun Seed", detail: "Methi water + ½ tsp jamun seed powder" },
        breakfast: { title: "Ragi Dosa + Anda", detail: "2 ragi dosas + 1 boiled egg + green chutney" },
        midMorning: { title: "Amla-Flax Smoothie", detail: "Amla + flaxseeds + ginger blended" },
        lunch: { title: "Murgh Shorba + Jowar Bhakri", detail: "Thin chicken broth + 2 jowar bhakris + salad" },
        snack: { title: "Steamed Idli", detail: "2 idlis + mint chutney" },
        dinner: { title: "Murgi ka Saalan + Bajra Roti", detail: "Light chicken saalan + 2 bajra rotis" },
      },
      {
        theme: "Gut Health", emoji: "🥛",
        early: { title: "Methi + Tulsi", detail: "Methi water + 5 tulsi leaves" },
        breakfast: { title: "Anda Bhurji + Toast", detail: "2-egg bhurji + spinach + multigrain toast" },
        midMorning: { title: "Pomegranate + Dahi", detail: "½ pomegranate + curd" },
        lunch: { title: "Macchi Curry + Brown Rice", detail: "Light tomato-base fish curry + ½ cup brown rice" },
        snack: { title: "Chia Dahi", detail: "Homemade curd + 1 tbsp soaked chia seeds" },
        dinner: { title: "Murgi Shorba + Roti", detail: "Thin chicken-vegetable broth + 1 bajra roti" },
      },
      {
        theme: "Renewal", emoji: "✨",
        early: { title: "Super Detox Drink", detail: "Warm water + lemon + honey + cinnamon + haldi" },
        breakfast: { title: "Poha + Anda", detail: "Brown rice poha + curry leaves + 1 boiled egg" },
        midMorning: { title: "Mixed Fruit", detail: "Papaya + pomegranate + berries only" },
        lunch: { title: "Tandoori Murgh Thali", detail: "Grilled chicken + dal + sabzi + salad + 1 roti" },
        snack: { title: "Chana + Tulsi Tea", detail: "Roasted chana + tulsi-ginger tea" },
        dinner: { title: "Khichdi + Grilled Fish", detail: "Moong-veg khichdi + 80g grilled rohu/surmai" },
      },
    ],
    "vegan": [
      {
        theme: "Detox & Reset", emoji: "🌱",
        early: { title: "Methi + Lemon + Garlic", detail: "Methi water + lemon + garlic + hing" },
        breakfast: { title: "Oats Upma (Dairy-free)", detail: "Oats with veggies in olive oil, no ghee" },
        midMorning: { title: "Amla + Walnuts + Seeds", detail: "Amla + walnuts + pumpkin seeds" },
        lunch: { title: "Brown Rice + Moong Dal", detail: "Moong dal (mustard oil) + brown rice + salad" },
        snack: { title: "Roasted Chana", detail: "½ cup chana + jeera water" },
        dinner: { title: "Bajra Roti + Lauki Sabzi", detail: "2 bajra rotis + lauki-garlic sabzi" },
      },
      {
        theme: "Fibre Power", emoji: "🥣",
        early: { title: "Methi + Amla", detail: "Methi water + amla juice + curry leaves" },
        breakfast: { title: "Daliya Khichdi (Vegan)", detail: "Daliya + veggies, coconut oil, no ghee/curd" },
        midMorning: { title: "Guava + Cinnamon Water", detail: "1 whole guava + cinnamon water" },
        lunch: { title: "Rajma + Jowar Roti", detail: "Rajma + 2 jowar rotis + salad" },
        snack: { title: "Makhana", detail: "Roasted makhana with turmeric" },
        dinner: { title: "Moong Dal Soup + Roti", detail: "Moong soup + 2 rotis, no dairy" },
      },
      {
        theme: "Heart-Healthy", emoji: "❤️",
        early: { title: "Garlic + Jeera Water", detail: "Garlic in warm jeera water" },
        breakfast: { title: "Saag + Makki Roti (Vegan)", detail: "Light mustard greens saag (no cream) + 1 makki roti" },
        midMorning: { title: "Mixed Seeds", detail: "Flaxseed + pumpkin + sunflower seeds" },
        lunch: { title: "Chana Dal + Ragi Roti", detail: "Chana dal + 2 ragi rotis" },
        snack: { title: "Sprouts Chaat", detail: "Moong sprouts + lemon + chaat masala" },
        dinner: { title: "Vegetable Khichdi", detail: "Moong + brown rice khichdi, coconut oil" },
      },
      {
        theme: "Anti-Inflammatory", emoji: "🌸",
        early: { title: "Haldi-Adrak Kadha", detail: "Turmeric + ginger + pepper + tulsi" },
        breakfast: { title: "Besan Cheela (Vegan)", detail: "2 besan cheelas + mint chutney, no dahi" },
        midMorning: { title: "Papaya", detail: "1 cup papaya" },
        lunch: { title: "Tofu Palak + Brown Rice", detail: "Tofu in spinach gravy + ½ cup brown rice" },
        snack: { title: "Green Tea + Walnuts", detail: "Tulsi tea + 4 walnuts" },
        dinner: { title: "Dal Tadka + Bajra Roti", detail: "Arhar dal + 2 bajra rotis, mustard oil" },
      },
      {
        theme: "Millet Magic", emoji: "🌾",
        early: { title: "Methi + Jamun Seed", detail: "Methi water + jamun seed powder" },
        breakfast: { title: "Ragi Porridge (Oat Milk)", detail: "Ragi + oat milk + cinnamon, no sugar" },
        midMorning: { title: "Amla-Flax Smoothie", detail: "Amla + flaxseeds + ginger + water" },
        lunch: { title: "Jowar Roti + Dal", detail: "2 jowar rotis + arhar dal + onion" },
        snack: { title: "Steamed Dhokla", detail: "2 steamed dhoklas" },
        dinner: { title: "Bajra Khichdi", detail: "Bajra + moong dal + lauki" },
      },
      {
        theme: "Gut Health", emoji: "🥛",
        early: { title: "Methi + Tulsi", detail: "Methi water + tulsi leaves" },
        breakfast: { title: "Poha + Flaxseeds", detail: "Brown rice poha + curry leaves + flaxseeds, no curd" },
        midMorning: { title: "Pomegranate", detail: "½ pomegranate" },
        lunch: { title: "Chole + Brown Rice", detail: "Chickpea curry + ½ cup brown rice" },
        snack: { title: "Coconut Dahi + Chia", detail: "Coconut yoghurt + chia seeds" },
        dinner: { title: "Lauki + Bajra Roti", detail: "Lauki sabzi + 1–2 bajra rotis" },
      },
      {
        theme: "Renewal", emoji: "✨",
        early: { title: "Super Detox Drink", detail: "Warm water + lemon + maple syrup + cinnamon + haldi" },
        breakfast: { title: "Sabudana Khichdi (Vegan)", detail: "Sabudana + peanuts + lemon (no ghee)" },
        midMorning: { title: "Mixed Fruit", detail: "Papaya + pomegranate + berries" },
        lunch: { title: "Full Vegan Thali", detail: "Dal + sabzi + salad + brown rice + 1 roti" },
        snack: { title: "Chana + Herbal Tea", detail: "Roasted chana + tulsi tea" },
        dinner: { title: "Moong Khichdi", detail: "Moong-veg khichdi, no ghee" },
      },
    ],
  },
  "telugu": {
    "vegetarian": [
      {
        theme: "Detox & Pesarattu", emoji: "🌱",
        early: { title: "Methi + Nimmakaya (Lemon) Water", detail: "Methi water + warm lemon + raw garlic clove" },
        breakfast: { title: "Pesarattu + Ginger Chutney", detail: "Green moong crepe — high protein, ginger-coconut chutney" },
        midMorning: { title: "Amla + Nuvvulu (Sesame) Seeds", detail: "Fresh amla + 1 tbsp roasted sesame + walnuts" },
        lunch: { title: "Pappu + Brown Rice + Palakura", detail: "Moong pappu (dal) + ½ cup brown rice + spinach fry" },
        snack: { title: "Roasted Peanuts", detail: "¼ cup dry-roasted peanuts — Telugu staple, good fats" },
        dinner: { title: "Jonna Roti + Kobbari Pachadi", detail: "2 jowar rotis + coconut chutney + small dal" },
      },
      {
        theme: "Fibre Power", emoji: "🥣",
        early: { title: "Methi + Amla Water", detail: "Methi water + amla juice + 8 curry leaves chewed" },
        breakfast: { title: "Kara Pongal", detail: "Savoury pongal with pepper + jeera + ginger" },
        midMorning: { title: "Guava + Cinnamon Water", detail: "1 whole guava + cinnamon water" },
        lunch: { title: "Senagala Pappu + Jonna Roti", detail: "Chana dal + 2 jowar rotis + raw onion + nimbu" },
        snack: { title: "Pesara Vada (Baked)", detail: "Baked moong vada — traditional protein snack" },
        dinner: { title: "Nuvvulu Pappu + Rice", detail: "Sesame dal + ½ cup brown rice" },
      },
      {
        theme: "Omega-3 Focus", emoji: "❤️",
        early: { title: "Garlic + Jeera Water", detail: "Crushed garlic in warm jeera water" },
        breakfast: { title: "Pesarattu + Flaxseed Chutney", detail: "Pesarattu with ground flaxseed chutney" },
        midMorning: { title: "Mixed Seeds", detail: "Flaxseed + pumpkin + sesame seeds 1 tbsp each" },
        lunch: { title: "Pesara Pappu + Brown Rice + Kobbari", detail: "Moong dal + brown rice + coconut chutney (small)" },
        snack: { title: "Moong Sprouts Chaat", detail: "Pesara sprouts + lemon + chilli" },
        dinner: { title: "Vegetable Khichdi", detail: "Moong + brown rice khichdi + ½ tsp ghee" },
      },
      {
        theme: "Anti-Inflammatory", emoji: "🌸",
        early: { title: "Haldi-Adrak-Tulsi Kadha", detail: "Turmeric + ginger + black pepper + tulsi water" },
        breakfast: { title: "Ragi Dosa + Gongura Chutney", detail: "2 ragi dosas + gongura (sorrel) chutney — iron-rich" },
        midMorning: { title: "Papaya", detail: "1 cup papaya + pinch dry ginger" },
        lunch: { title: "Tomato Pappu + Brown Rice", detail: "Tomato dal + ½ cup brown rice + majjiga (buttermilk)" },
        snack: { title: "Green Tea + Nuvvulu", detail: "Unsweetened tea + roasted sesame til laddu (1 small)" },
        dinner: { title: "Pesara Pappu Soup + Jonna Roti", detail: "Light moong dal soup + 2 jowar rotis" },
      },
      {
        theme: "Millet Magic", emoji: "🌾",
        early: { title: "Methi + Jamun Seed Water", detail: "Methi water + ½ tsp jamun seed powder" },
        breakfast: { title: "Ragi Sankati (Java)", detail: "Ragi porridge — traditional Andhra breakfast, no sugar" },
        midMorning: { title: "Amla-Flax Smoothie", detail: "Amla + flaxseeds + ginger + water blended" },
        lunch: { title: "Jonna Roti + Sorakaya Pappu", detail: "Jowar roti + bottle gourd dal + curd" },
        snack: { title: "Roasted Peanuts + Jeera Water", detail: "Dry-roasted peanuts + warm jeera water" },
        dinner: { title: "Pesara Pappu Khichdi", detail: "Moong dal + jowar khichdi with veggies" },
      },
      {
        theme: "Gut Health Day", emoji: "🥛",
        early: { title: "Methi + Tulsi", detail: "Methi water + 5 tulsi leaves chewed" },
        breakfast: { title: "Idli + Sambar + Coconut Chutney", detail: "3 idlis + Andhra sambar + coconut" },
        midMorning: { title: "Pomegranate", detail: "½ pomegranate" },
        lunch: { title: "Pulihora + Pappu", detail: "Tamarind rice (small portion) + moong dal + raw onion" },
        snack: { title: "Perugu (Curd) + Chia", detail: "Homemade curd + 1 tbsp chia seeds" },
        dinner: { title: "Sorakaya Soup + Roti", detail: "Bottle gourd soup + 1–2 small rotis" },
      },
      {
        theme: "Renewal", emoji: "✨",
        early: { title: "Super Detox Drink", detail: "Warm water + lemon + honey + cinnamon + haldi" },
        breakfast: { title: "Upma with Mixed Veggies", detail: "Semolina/oats upma with veggies + coconut chutney" },
        midMorning: { title: "Mixed Seasonal Fruit", detail: "Papaya + pomegranate + guava" },
        lunch: { title: "Full Telugu Thali", detail: "Pappu + sambar + koora + perugu + ½ cup brown rice + papad" },
        snack: { title: "Pesara Vada + Tulsi Tea", detail: "Baked moong vada + tulsi-ginger tea" },
        dinner: { title: "Pesara Pappu Khichdi", detail: "Light moong-veg khichdi + 1 tsp ghee" },
      },
    ],
    "non-vegetarian": [
      {
        theme: "Detox & Reset", emoji: "🌱",
        early: { title: "Methi + Lemon", detail: "Methi water + warm lemon + garlic" },
        breakfast: { title: "Egg Pesarattu", detail: "Egg-stuffed pesarattu — high protein" },
        midMorning: { title: "Amla + Seeds", detail: "Amla + walnuts + sesame seeds" },
        lunch: { title: "Royyala Pulusu + Brown Rice", detail: "Andhra prawn tamarind curry (light) + ½ cup brown rice" },
        snack: { title: "Roasted Peanuts", detail: "¼ cup dry peanuts" },
        dinner: { title: "Jonna Roti + Kodi Pappu", detail: "2 jowar rotis + chicken dal — traditional Andhra" },
      },
      {
        theme: "Protein Power", emoji: "💪",
        early: { title: "Methi + Amla", detail: "Methi water + amla juice + curry leaves" },
        breakfast: { title: "Egg Pulusu + Ragi Dosa", detail: "Egg tamarind curry + 2 ragi dosas — Andhra style" },
        midMorning: { title: "Guava + Seeds", detail: "Guava + pumpkin seeds" },
        lunch: { title: "Kodi Kura + Brown Rice", detail: "Andhra chicken curry (light, tomato base) + ½ cup brown rice" },
        snack: { title: "Sprouts + Perugu", detail: "Moong sprouts + curd" },
        dinner: { title: "Fish Pulusu + Jonna Roti", detail: "Light fish tamarind curry + 2 jowar rotis" },
      },
      {
        theme: "Omega-3 Day", emoji: "❤️",
        early: { title: "Garlic + Jeera Water", detail: "Garlic in warm jeera water" },
        breakfast: { title: "Royyala Iguru + Ragi Dosa", detail: "Dry prawn stir-fry + 2 ragi dosas" },
        midMorning: { title: "Flaxseed + Amla", detail: "Flaxseeds + amla water" },
        lunch: { title: "Chepa Pulusu + Brown Rice", detail: "Fish tamarind curry (Andhra) + ½ cup brown rice" },
        snack: { title: "Makhana", detail: "Roasted makhana with turmeric" },
        dinner: { title: "Grilled Fish + Khichdi", detail: "Grilled rohu + moong-veg khichdi" },
      },
      {
        theme: "Anti-Inflammatory", emoji: "🌸",
        early: { title: "Haldi-Adrak Kadha", detail: "Turmeric + ginger + pepper + tulsi" },
        breakfast: { title: "Egg Bhurji + Ragi Dosa", detail: "Egg bhurji with turmeric + 2 ragi dosas" },
        midMorning: { title: "Papaya", detail: "1 cup papaya" },
        lunch: { title: "Kodi Sambar + Brown Rice", detail: "Chicken sambar + ½ cup brown rice + raita" },
        snack: { title: "Green Tea + Walnuts", detail: "Unsweetened tea + 4 walnuts" },
        dinner: { title: "Fish Tikka + Jonna Roti", detail: "Grilled fish + 2 jowar rotis" },
      },
      {
        theme: "Millet Day", emoji: "🌾",
        early: { title: "Methi + Jamun Seed", detail: "Methi water + jamun seed powder" },
        breakfast: { title: "Egg Pesarattu + Ragi Java", detail: "Egg pesarattu + small ragi porridge" },
        midMorning: { title: "Amla-Flax Smoothie", detail: "Amla + flaxseeds + ginger" },
        lunch: { title: "Kodi Fry + Jonna Roti", detail: "Dry-spiced chicken + 2 jowar rotis — Andhra style" },
        snack: { title: "Steamed Idli", detail: "2 idlis + gongura chutney" },
        dinner: { title: "Chepa Pulusu + Dalia", detail: "Light fish curry + cracked wheat" },
      },
      {
        theme: "Gut Health", emoji: "🥛",
        early: { title: "Methi + Tulsi", detail: "Methi water + tulsi leaves" },
        breakfast: { title: "Egg Idli Sambar", detail: "2 eggs + 3 idlis + Andhra sambar" },
        midMorning: { title: "Pomegranate + Perugu", detail: "½ pomegranate + curd" },
        lunch: { title: "Royyala Iguru + Brown Rice", detail: "Dry prawn stir-fry + ½ cup brown rice" },
        snack: { title: "Chia Perugu", detail: "Curd + chia seeds" },
        dinner: { title: "Clear Kodi Soup + Roti", detail: "Thin chicken broth + 1 roti" },
      },
      {
        theme: "Renewal", emoji: "✨",
        early: { title: "Super Detox Drink", detail: "Warm water + lemon + honey + cinnamon + haldi" },
        breakfast: { title: "Upma + Boiled Egg", detail: "Oats upma + 1 boiled egg" },
        midMorning: { title: "Mixed Fruit", detail: "Papaya + pomegranate + guava" },
        lunch: { title: "Full Non-Veg Telugu Thali", detail: "Chicken + fish + pappu + rice + salad" },
        snack: { title: "Chana + Tulsi Tea", detail: "Roasted chana + tulsi tea" },
        dinner: { title: "Moong Khichdi + Grilled Fish", detail: "Khichdi + 80g grilled rohu" },
      },
    ],
    "vegan": [
      {
        theme: "Detox", emoji: "🌱",
        early: { title: "Methi + Lemon + Garlic", detail: "Methi water + lemon + garlic + hing" },
        breakfast: { title: "Pesarattu (Vegan)", detail: "Green moong crepe + ginger-coconut chutney" },
        midMorning: { title: "Amla + Sesame Seeds", detail: "Amla + roasted sesame + walnuts" },
        lunch: { title: "Pappu + Brown Rice", detail: "Moong pappu + brown rice + spinach fry" },
        snack: { title: "Roasted Peanuts", detail: "¼ cup dry peanuts" },
        dinner: { title: "Jonna Roti + Dal", detail: "2 jowar rotis + small moong dal, no dairy" },
      },
      {
        theme: "Fibre", emoji: "🥣",
        early: { title: "Methi + Amla", detail: "Methi water + amla + curry leaves" },
        breakfast: { title: "Kara Pongal (Vegan)", detail: "Savoury pongal, coconut oil, no ghee" },
        midMorning: { title: "Guava + Cinnamon Water", detail: "Guava + cinnamon water" },
        lunch: { title: "Chana Dal + Jonna Roti", detail: "Chana dal + 2 jowar rotis + salad" },
        snack: { title: "Baked Pesara Vada", detail: "Baked moong vada" },
        dinner: { title: "Nuvvulu Pappu + Rice", detail: "Sesame dal + ½ cup brown rice" },
      },
      {
        theme: "Omega-3", emoji: "❤️",
        early: { title: "Garlic + Jeera Water", detail: "Garlic in warm jeera water" },
        breakfast: { title: "Pesarattu + Flaxseed Chutney", detail: "Pesarattu + ground flaxseed + coconut chutney" },
        midMorning: { title: "Mixed Seeds", detail: "Flaxseed + pumpkin + sesame" },
        lunch: { title: "Moong Dal + Brown Rice", detail: "Moong pappu + brown rice, coconut oil tadka" },
        snack: { title: "Sprouts Chaat", detail: "Pesara sprouts + lemon" },
        dinner: { title: "Vegetable Khichdi", detail: "Moong + jowar khichdi, coconut oil" },
      },
      {
        theme: "Anti-Inflammatory", emoji: "🌸",
        early: { title: "Haldi Kadha", detail: "Turmeric + ginger + pepper + tulsi" },
        breakfast: { title: "Ragi Dosa + Gongura Chutney", detail: "2 ragi dosas + gongura chutney (vegan)" },
        midMorning: { title: "Papaya", detail: "1 cup papaya" },
        lunch: { title: "Tomato Pappu + Brown Rice", detail: "Tomato dal + ½ cup brown rice" },
        snack: { title: "Green Tea + Sesame Laddu", detail: "Tea + 1 small til laddu" },
        dinner: { title: "Pappu Soup + Jonna Roti", detail: "Moong soup + 2 jowar rotis" },
      },
      {
        theme: "Millet", emoji: "🌾",
        early: { title: "Methi + Jamun Seed", detail: "Methi water + jamun powder" },
        breakfast: { title: "Ragi Sankati", detail: "Ragi porridge, no sugar" },
        midMorning: { title: "Amla-Flax Smoothie", detail: "Amla + flaxseeds + water" },
        lunch: { title: "Jonna Roti + Sorakaya Pappu", detail: "Jowar roti + bottle gourd dal" },
        snack: { title: "Peanuts + Jeera Water", detail: "Dry peanuts + warm jeera water" },
        dinner: { title: "Pesara Khichdi", detail: "Moong + jowar khichdi" },
      },
      {
        theme: "Gut", emoji: "🥛",
        early: { title: "Methi + Tulsi", detail: "Methi water + tulsi" },
        breakfast: { title: "Idli + Sambar (Vegan)", detail: "3 idlis + vegan sambar (no ghee tadka)" },
        midMorning: { title: "Pomegranate", detail: "½ pomegranate" },
        lunch: { title: "Pulihora + Pappu", detail: "Tamarind rice (small) + moong dal" },
        snack: { title: "Coconut Dahi + Chia", detail: "Coconut yoghurt + chia seeds" },
        dinner: { title: "Sorakaya Soup + Roti", detail: "Bottle gourd soup + roti" },
      },
      {
        theme: "Renewal", emoji: "✨",
        early: { title: "Super Detox Drink", detail: "Lemon + maple syrup + cinnamon + haldi" },
        breakfast: { title: "Upma + Coconut", detail: "Oats upma + coconut chutney, no dairy" },
        midMorning: { title: "Mixed Fruit", detail: "Papaya + pomegranate + guava" },
        lunch: { title: "Vegan Telugu Thali", detail: "Pappu + sambar + koora + brown rice + papad" },
        snack: { title: "Peanuts + Herbal Tea", detail: "Peanuts + tulsi tea" },
        dinner: { title: "Moong Khichdi", detail: "Moong-veg khichdi, coconut oil" },
      },
    ],
  },
  "tamil": {
    "vegetarian": [
      {
        theme: "Kanji & Kollu Detox", emoji: "🌱",
        early: { title: "Methi + Nimbu Water", detail: "Methi water + lemon + raw garlic" },
        breakfast: { title: "Kara Pongal", detail: "Savory pongal with pepper + jeera + ginger — filling" },
        midMorning: { title: "Amla + Walnuts", detail: "Fresh amla + 5 walnuts + sesame seeds" },
        lunch: { title: "Kollu Rasam + Brown Rice", detail: "Horse gram rasam + ½ cup brown rice — incredible for cholesterol" },
        snack: { title: "Sundal (Boiled Chickpeas)", detail: "Boiled chana sundal with coconut + mustard — no fry" },
        dinner: { title: "Keerai Masiyal + Small Rice", detail: "Spinach mash + ½ cup brown rice — light, iron-rich" },
      },
      {
        theme: "Fibre Power", emoji: "🥣",
        early: { title: "Methi + Amla Water", detail: "Methi water + amla juice + curry leaves" },
        breakfast: { title: "Idli + Sambar", detail: "3 steamed idlis + vegetable sambar" },
        midMorning: { title: "Guava + Cinnamon Water", detail: "1 guava + cinnamon water" },
        lunch: { title: "Paruppu + Brown Rice + Rasam", detail: "Toor dal + ½ cup brown rice + pepper rasam" },
        snack: { title: "Roasted Murukkku-free Snack", detail: "1 cup makhana or peanuts — skip fried murukku" },
        dinner: { title: "Vendakkai Sambar + Small Rice", detail: "Okra sambar + ½ cup brown rice" },
      },
      {
        theme: "Heart-Healthy Fats", emoji: "❤️",
        early: { title: "Garlic + Jeera Water", detail: "Crushed garlic in warm jeera water" },
        breakfast: { title: "Ragi Koozh", detail: "Finger millet porridge — Kongu Nadu tradition" },
        midMorning: { title: "Mixed Seeds", detail: "Flaxseed + sesame + pumpkin 1 tbsp each" },
        lunch: { title: "Paruppu + Brown Rice + Aviyal", detail: "Dal + ½ cup brown rice + aviyal (mixed veg, no coconut cream)" },
        snack: { title: "Moong Sprouts", detail: "Moong sprouts + lemon + pepper" },
        dinner: { title: "Vegetable Khichdi (Pongal)", detail: "Moong + brown rice pongal with veggies + ½ tsp ghee" },
      },
      {
        theme: "Anti-Inflammatory", emoji: "🌸",
        early: { title: "Milagu Jeeraga Rasam Water", detail: "Boil pepper + jeera in water" },
        breakfast: { title: "Rava Idli + Tomato Chutney", detail: "3 rava idlis + fresh tomato chutney, no frying" },
        midMorning: { title: "Papaya", detail: "1 cup papaya + pinch dry ginger" },
        lunch: { title: "Milagu Rasam + Brown Rice", detail: "Pepper rasam + ½ cup brown rice + papad" },
        snack: { title: "Green Tea + Almonds", detail: "Unsweetened tea + 4 almonds" },
        dinner: { title: "Kozhukattai", detail: "2 steamed kozhukattai (rice dumplings) — light, wholesome" },
      },
      {
        theme: "Millet Magic", emoji: "🌾",
        early: { title: "Methi + Jamun Seed", detail: "Methi water + jamun seed powder" },
        breakfast: { title: "Kambu (Pearl Millet) Koozh", detail: "Kambu porridge — traditional breakfast, lowers blood sugar" },
        midMorning: { title: "Amla-Flax Smoothie", detail: "Amla + flaxseeds + ginger blended" },
        lunch: { title: "Samai (Little Millet) Rice + Dal", detail: "Little millet rice + toor dal + rasam" },
        snack: { title: "Roasted Peanuts + Murunga Leaf Tea", detail: "Peanuts + drumstick leaf tea — potent anti-diabetic" },
        dinner: { title: "Ragi Mudde + Sambar", detail: "Finger millet balls + light sambar — classic healthy combo" },
      },
      {
        theme: "Gut Health Day", emoji: "🥛",
        early: { title: "Methi + Tulsi", detail: "Methi water + tulsi leaves" },
        breakfast: { title: "Thayir Idli", detail: "2 idlis soaked in spiced curd" },
        midMorning: { title: "Pomegranate", detail: "½ pomegranate" },
        lunch: { title: "Thayir Sadam", detail: "Curd rice with mustard + curry leaves + pomegranate garnish" },
        snack: { title: "Perugu + Chia", detail: "Homemade curd + chia seeds" },
        dinner: { title: "Mor Kuzhambu + Small Rice", detail: "Buttermilk curry + ½ cup brown rice — digestive, cooling" },
      },
      {
        theme: "Renewal", emoji: "✨",
        early: { title: "Super Detox Drink", detail: "Warm water + lemon + honey + cinnamon + haldi" },
        breakfast: { title: "Pongal (Ven Pongal)", detail: "Ven pongal with pepper + ghee (small) — Sunday special" },
        midMorning: { title: "Mixed Seasonal Fruit", detail: "Papaya + pomegranate + guava" },
        lunch: { title: "Full Tamil Thali", detail: "Paruppu + rasam + sambar + kootu + thayir + small brown rice" },
        snack: { title: "Sundal + Herbal Tea", detail: "Boiled moong sundal + tulsi-ginger tea" },
        dinner: { title: "Moong Dal Pongal", detail: "Light moong-veg pongal + 1 tsp ghee" },
      },
    ],
    "non-vegetarian": [
      {
        theme: "Detox", emoji: "🌱",
        early: { title: "Methi + Nimbu", detail: "Methi water + lemon + garlic" },
        breakfast: { title: "Egg Dosa + Kollu Chutney", detail: "Egg dosa + horse gram chutney — high protein" },
        midMorning: { title: "Amla + Sesame", detail: "Amla + sesame seeds + walnuts" },
        lunch: { title: "Meen Rasam + Brown Rice", detail: "Fish pepper rasam + ½ cup brown rice — light" },
        snack: { title: "Roasted Peanuts", detail: "¼ cup dry peanuts" },
        dinner: { title: "Kari Kuzhambu + Ragi Dosa", detail: "Chicken curry (light) + 2 ragi dosas" },
      },
      {
        theme: "Protein Power", emoji: "💪",
        early: { title: "Methi + Amla", detail: "Methi water + amla + curry leaves" },
        breakfast: { title: "Egg Idli + Sambar", detail: "Egg stuffed idlis + veg sambar" },
        midMorning: { title: "Guava + Seeds", detail: "Guava + pumpkin seeds" },
        lunch: { title: "Kozhi Kuzhambu + Brown Rice", detail: "Chettinad-lite chicken curry + ½ cup brown rice" },
        snack: { title: "Sprouts + Curd", detail: "Moong sprouts + curd" },
        dinner: { title: "Meen Kozhambu + Small Rice", detail: "Tamarind fish curry + ½ cup brown rice" },
      },
      {
        theme: "Omega-3", emoji: "❤️",
        early: { title: "Garlic + Jeera", detail: "Garlic in warm jeera water" },
        breakfast: { title: "Meen Varuval + Ragi Dosa", detail: "Grilled fish fry (min oil) + 2 ragi dosas" },
        midMorning: { title: "Seeds + Amla", detail: "Flaxseed + sesame + amla water" },
        lunch: { title: "Meen Kulambu + Brown Rice", detail: "Fish curry + ½ cup brown rice + rasam" },
        snack: { title: "Makhana + Tea", detail: "Makhana + unsweetened tea" },
        dinner: { title: "Grilled Fish + Pongal", detail: "Grilled fish + small moong pongal" },
      },
      {
        theme: "Anti-Inflammatory", emoji: "🌸",
        early: { title: "Milagu Rasam Water", detail: "Pepper + jeera + garlic boiled" },
        breakfast: { title: "Egg Bhurji + Idli", detail: "Egg bhurji + 2 idlis" },
        midMorning: { title: "Papaya", detail: "1 cup papaya" },
        lunch: { title: "Kozhi Milagu Varuval + Rice", detail: "Pepper chicken (dry, min oil) + ½ cup brown rice" },
        snack: { title: "Green Tea + Almonds", detail: "Tea + 4 almonds" },
        dinner: { title: "Meen Varuval + Ragi Dosa", detail: "Grilled fish + 2 ragi dosas" },
      },
      {
        theme: "Millet", emoji: "🌾",
        early: { title: "Methi + Jamun Seed", detail: "Methi water + jamun seed powder" },
        breakfast: { title: "Ragi Mudde + Egg Curry", detail: "Ragi mudde + 1-egg curry" },
        midMorning: { title: "Amla-Flax Smoothie", detail: "Amla + flaxseeds + ginger" },
        lunch: { title: "Samai Rice + Kozhi Kozhambu", detail: "Little millet + light chicken curry" },
        snack: { title: "Steamed Idli", detail: "2 idlis + chutney" },
        dinner: { title: "Meen Rasam + Brown Rice", detail: "Fish pepper rasam + ½ cup brown rice" },
      },
      {
        theme: "Gut Health", emoji: "🥛",
        early: { title: "Methi + Tulsi", detail: "Methi water + tulsi" },
        breakfast: { title: "Egg Thayir Idli", detail: "Eggs + curd idli + sambar" },
        midMorning: { title: "Pomegranate + Curd", detail: "½ pomegranate + curd" },
        lunch: { title: "Thayir Sadam + Egg", detail: "Curd rice + 1 boiled egg" },
        snack: { title: "Chia Curd", detail: "Curd + chia seeds" },
        dinner: { title: "Kozhi Rasam + Brown Rice", detail: "Chicken pepper rasam + ½ cup brown rice" },
      },
      {
        theme: "Renewal", emoji: "✨",
        early: { title: "Super Detox Drink", detail: "Lemon + honey + cinnamon + haldi" },
        breakfast: { title: "Pongal + Egg", detail: "Ven pongal + 1 boiled egg" },
        midMorning: { title: "Mixed Fruit", detail: "Papaya + pomegranate + guava" },
        lunch: { title: "Full Non-Veg Tamil Thali", detail: "Kozhi + meen + dal + sambar + rice" },
        snack: { title: "Sundal + Herbal Tea", detail: "Peanut sundal + tulsi tea" },
        dinner: { title: "Moong Pongal + Grilled Fish", detail: "Light pongal + 80g grilled fish" },
      },
    ],
    "vegan": [
      {
        theme: "Kanji Detox", emoji: "🌱",
        early: { title: "Methi + Nimbu + Garlic", detail: "Methi water + lemon + garlic" },
        breakfast: { title: "Kara Pongal (Vegan)", detail: "Pongal with coconut oil, no ghee" },
        midMorning: { title: "Amla + Seeds", detail: "Amla + sesame + walnuts" },
        lunch: { title: "Kollu Rasam + Brown Rice", detail: "Horse gram rasam + ½ cup brown rice" },
        snack: { title: "Sundal", detail: "Boiled chana + coconut + mustard" },
        dinner: { title: "Keerai Masiyal + Small Rice", detail: "Spinach mash + small brown rice" },
      },
      {
        theme: "Fibre", emoji: "🥣",
        early: { title: "Methi + Amla", detail: "Methi water + amla + curry leaves" },
        breakfast: { title: "Idli + Vegan Sambar", detail: "3 idlis + sambar without ghee tadka" },
        midMorning: { title: "Guava + Cinnamon Water", detail: "Guava + cinnamon water" },
        lunch: { title: "Paruppu + Brown Rice + Rasam", detail: "Toor dal + brown rice + pepper rasam" },
        snack: { title: "Makhana", detail: "1 cup makhana" },
        dinner: { title: "Vendakkai Sambar + Rice", detail: "Okra sambar + ½ cup brown rice" },
      },
      {
        theme: "Heart-Healthy", emoji: "❤️",
        early: { title: "Garlic + Jeera", detail: "Garlic in warm jeera water" },
        breakfast: { title: "Ragi Koozh", detail: "Ragi porridge — no milk, no sugar" },
        midMorning: { title: "Mixed Seeds", detail: "Flaxseed + sesame + pumpkin" },
        lunch: { title: "Paruppu + Brown Rice + Aviyal", detail: "Dal + ½ cup brown rice + aviyal" },
        snack: { title: "Sprouts", detail: "Moong sprouts + lemon" },
        dinner: { title: "Veg Pongal (Vegan)", detail: "Moong pongal, coconut oil, no ghee" },
      },
      {
        theme: "Anti-Inflammatory", emoji: "🌸",
        early: { title: "Milagu Rasam Water", detail: "Pepper + jeera + garlic boiled" },
        breakfast: { title: "Rava Idli (Vegan)", detail: "3 rava idlis + tomato chutney, no curd" },
        midMorning: { title: "Papaya", detail: "1 cup papaya" },
        lunch: { title: "Milagu Rasam + Brown Rice", detail: "Pepper rasam + ½ cup brown rice" },
        snack: { title: "Green Tea + Almonds", detail: "Tea + 4 almonds" },
        dinner: { title: "Kozhukattai", detail: "2 steamed rice dumplings" },
      },
      {
        theme: "Millet", emoji: "🌾",
        early: { title: "Methi + Jamun Seed", detail: "Methi water + jamun seed powder" },
        breakfast: { title: "Kambu Koozh", detail: "Kambu porridge, no dairy" },
        midMorning: { title: "Amla-Flax Smoothie", detail: "Amla + flaxseeds + water" },
        lunch: { title: "Samai Rice + Dal", detail: "Little millet rice + toor dal + rasam" },
        snack: { title: "Peanuts + Murunga Tea", detail: "Dry peanuts + drumstick leaf tea" },
        dinner: { title: "Ragi Mudde + Sambar", detail: "Ragi mudde + light sambar" },
      },
      {
        theme: "Gut", emoji: "🥛",
        early: { title: "Methi + Tulsi", detail: "Methi water + tulsi" },
        breakfast: { title: "Idli + Vegan Sambar", detail: "3 idlis + vegan sambar" },
        midMorning: { title: "Pomegranate", detail: "½ pomegranate" },
        lunch: { title: "Thayir Sadam (Coconut Curd)", detail: "Coconut curd rice + mustard + curry leaves" },
        snack: { title: "Coconut Dahi + Chia", detail: "Coconut yoghurt + chia" },
        dinner: { title: "Mor Kuzhambu + Brown Rice", detail: "Vegan buttermilk curry + ½ cup brown rice" },
      },
      {
        theme: "Renewal", emoji: "✨",
        early: { title: "Super Detox Drink", detail: "Lemon + maple syrup + cinnamon + haldi" },
        breakfast: { title: "Pongal (Vegan)", detail: "Ven pongal, coconut oil, no ghee" },
        midMorning: { title: "Mixed Fruit", detail: "Papaya + pomegranate + guava" },
        lunch: { title: "Vegan Tamil Thali", detail: "Paruppu + sambar + kootu + brown rice + papad" },
        snack: { title: "Sundal + Tea", detail: "Boiled moong sundal + tulsi tea" },
        dinner: { title: "Moong Dal Pongal (Vegan)", detail: "Moong pongal, coconut oil" },
      },
    ],
  },
  "kerala": {
    "vegetarian": [
      {
        theme: "Kanji & Cherupayar Detox", emoji: "🌴",
        early: { title: "Methi + Warm Water + Coconut Vinegar", detail: "Methi water + splash coconut vinegar" },
        breakfast: { title: "Rice Kanji with Cherupayar", detail: "Rice porridge + boiled green moong thoran — traditional Kerala morning" },
        midMorning: { title: "Amla + Walnuts", detail: "Fresh amla + 5 walnuts" },
        lunch: { title: "Brown Rice + Cherupayar Curry + Rasam", detail: "Brown rice + green moong curry + pepper rasam" },
        snack: { title: "Banana (Nendran, small)", detail: "½ nendran banana" },
        dinner: { title: "Chapathi + Kadala Curry", detail: "2 wheat chapathis + black chickpea curry — protein-rich" },
      },
      {
        theme: "Fibre Power", emoji: "🥣",
        early: { title: "Methi + Amla Water", detail: "Methi water + amla juice + 8 curry leaves" },
        breakfast: { title: "Puttu + Kadala Curry", detail: "Steamed puttu + black chana curry — traditional Kerala breakfast" },
        midMorning: { title: "Guava + Cinnamon Water", detail: "1 guava + cinnamon water" },
        lunch: { title: "Brown Rice + Sambar + Thoran", detail: "Brown rice + vegetable sambar + cabbage thoran" },
        snack: { title: "Roasted Groundnuts", detail: "¼ cup groundnuts — common Kerala snack" },
        dinner: { title: "Idiyappam + Vegetable Stew", detail: "2 idiyappam (string hoppers) + light vegetable stew" },
      },
      {
        theme: "Heart-Healthy Fats", emoji: "❤️",
        early: { title: "Garlic + Jeera Water", detail: "Crushed garlic in warm jeera water" },
        breakfast: { title: "Appam + Coconut Stew", detail: "2 appam + light vegetable-coconut stew — choose thin coconut milk" },
        midMorning: { title: "Mixed Seeds", detail: "Flaxseed + pumpkin + sesame 1 tbsp each" },
        lunch: { title: "Brown Rice + Olan + Rasam", detail: "Brown rice + ash gourd-bean olan + pepper rasam" },
        snack: { title: "Moong Sprouts", detail: "Moong sprouts + lemon + pepper" },
        dinner: { title: "Vegetable Khichdi", detail: "Moong + brown rice khichdi + ½ tsp coconut oil" },
      },
      {
        theme: "Anti-Inflammatory", emoji: "🌸",
        early: { title: "Turmeric + Coconut Water", detail: "Turmeric + black pepper in warm coconut water — Kerala style" },
        breakfast: { title: "Ragi Puttu", detail: "Finger millet puttu — no sugar, healthy twist" },
        midMorning: { title: "Papaya", detail: "1 cup papaya" },
        lunch: { title: "Brown Rice + Erissery + Rasam", detail: "Brown rice + pumpkin-beans erissery + rasam" },
        snack: { title: "Green Tea + Almonds", detail: "Tulsi tea + 4 almonds" },
        dinner: { title: "Cherupayar Dal + Chapathi", detail: "Green moong dal + 2 chapathis" },
      },
      {
        theme: "Millet Magic", emoji: "🌾",
        early: { title: "Methi + Jamun Seed", detail: "Methi water + ½ tsp jamun seed powder" },
        breakfast: { title: "Ragi Kanji", detail: "Finger millet porridge — traditional Kerala wellness drink" },
        midMorning: { title: "Amla-Flax Smoothie", detail: "Amla + flaxseeds + ginger + water" },
        lunch: { title: "Brown Rice + Avial", detail: "Brown rice + mixed vegetable avial (less coconut)" },
        snack: { title: "Roasted Groundnuts + Tea", detail: "Groundnuts + unsweetened ginger tea" },
        dinner: { title: "Idiyappam + Moong Curry", detail: "2 idiyappam + green moong curry" },
      },
      {
        theme: "Gut Health Day", emoji: "🥛",
        early: { title: "Methi + Tulsi", detail: "Methi water + tulsi leaves" },
        breakfast: { title: "Idli + Sambar + Coconut Chutney", detail: "3 idlis + sambar + fresh coconut chutney" },
        midMorning: { title: "Pomegranate", detail: "½ pomegranate" },
        lunch: { title: "Curd Rice + Papad", detail: "Thayir sadam with mustard + curry leaves" },
        snack: { title: "Curd + Chia", detail: "Homemade curd + 1 tbsp chia seeds" },
        dinner: { title: "Chembu Curry + Small Rice", detail: "Taro root curry + ½ cup brown rice" },
      },
      {
        theme: "Renewal", emoji: "✨",
        early: { title: "Super Detox Drink", detail: "Warm water + lemon + honey + cinnamon + haldi" },
        breakfast: { title: "Appam + Vegetable Stew", detail: "2 appam + light coconut vegetable stew (Sunday special)" },
        midMorning: { title: "Mixed Seasonal Fruit", detail: "Papaya + pomegranate + nendran banana (½)" },
        lunch: { title: "Kerala Sadhya (Healthy Version)", detail: "Brown rice + sambar + avial + thoran + rasam + papad" },
        snack: { title: "Banana Chips (Baked, small) + Tea", detail: "Small baked chips + ginger tea" },
        dinner: { title: "Moong Dal Kanji", detail: "Green moong porridge + coconut + jeera — healing night meal" },
      },
    ],
    "non-vegetarian": [
      {
        theme: "Detox", emoji: "🌴",
        early: { title: "Methi + Coconut Water", detail: "Methi water + fresh coconut water" },
        breakfast: { title: "Egg Roast + Appam", detail: "Kerala egg roast (light) + 2 appam" },
        midMorning: { title: "Amla + Walnuts", detail: "Amla + walnuts" },
        lunch: { title: "Meen Curry + Brown Rice", detail: "Kerala fish curry (light coconut) + ½ cup brown rice" },
        snack: { title: "Groundnuts", detail: "Roasted groundnuts" },
        dinner: { title: "Chicken Stew + Idiyappam", detail: "Light coconut chicken stew + 2 idiyappam" },
      },
      {
        theme: "Protein Power", emoji: "💪",
        early: { title: "Methi + Amla", detail: "Methi water + amla juice" },
        breakfast: { title: "Egg Puttu + Kadala", detail: "Egg-stuffed puttu + black chana curry" },
        midMorning: { title: "Guava + Seeds", detail: "Guava + pumpkin seeds" },
        lunch: { title: "Chicken Curry + Brown Rice", detail: "Nadan chicken curry (light) + ½ cup brown rice" },
        snack: { title: "Sprouts + Curd", detail: "Moong sprouts + curd" },
        dinner: { title: "Fish Molee + Idiyappam", detail: "Light coconut fish molee + 2 idiyappam" },
      },
      {
        theme: "Omega-3", emoji: "❤️",
        early: { title: "Garlic + Jeera Water", detail: "Garlic in warm jeera water" },
        breakfast: { title: "Grilled Karimeen + Appam", detail: "Grilled pearl spot fish (min oil) + 2 appam" },
        midMorning: { title: "Flaxseed + Amla", detail: "Flaxseeds + amla water" },
        lunch: { title: "Meen Mulagushyam + Brown Rice", detail: "Fish tamarind curry + ½ cup brown rice" },
        snack: { title: "Makhana + Tea", detail: "Makhana + unsweetened tea" },
        dinner: { title: "Prawn Thoran + Rice", detail: "Dry coconut prawn stir-fry + ½ cup brown rice" },
      },
      {
        theme: "Anti-Inflammatory", emoji: "🌸",
        early: { title: "Turmeric + Coconut Water", detail: "Turmeric + pepper in coconut water" },
        breakfast: { title: "Egg Roast + Ragi Puttu", detail: "Egg roast + ragi puttu" },
        midMorning: { title: "Papaya", detail: "1 cup papaya" },
        lunch: { title: "Chicken Rasam + Brown Rice", detail: "Chicken pepper rasam + ½ cup brown rice" },
        snack: { title: "Green Tea + Almonds", detail: "Tea + 4 almonds" },
        dinner: { title: "Grilled Fish + Chapathi", detail: "Grilled fish + 2 chapathis" },
      },
      {
        theme: "Millet", emoji: "🌾",
        early: { title: "Methi + Jamun Seed", detail: "Methi water + jamun seed powder" },
        breakfast: { title: "Ragi Puttu + Egg Curry", detail: "Ragi puttu + 1-egg curry" },
        midMorning: { title: "Amla-Flax Smoothie", detail: "Amla + flaxseeds + ginger" },
        lunch: { title: "Brown Rice + Prawn Thoran", detail: "Brown rice + dry prawn stir-fry" },
        snack: { title: "Idli + Chutney", detail: "2 idlis + coconut chutney" },
        dinner: { title: "Meen Rasam + Brown Rice", detail: "Fish pepper rasam + ½ cup brown rice" },
      },
      {
        theme: "Gut Health", emoji: "🥛",
        early: { title: "Methi + Tulsi", detail: "Methi water + tulsi" },
        breakfast: { title: "Egg Idli + Sambar", detail: "Egg + 3 idlis + sambar" },
        midMorning: { title: "Pomegranate + Curd", detail: "½ pomegranate + curd" },
        lunch: { title: "Curd Rice + Grilled Fish", detail: "Curd rice + 80g grilled fish" },
        snack: { title: "Chia Curd", detail: "Curd + chia seeds" },
        dinner: { title: "Chicken Soup + Chapathi", detail: "Clear chicken broth + 1 chapathi" },
      },
      {
        theme: "Renewal", emoji: "✨",
        early: { title: "Super Detox Drink", detail: "Lemon + honey + cinnamon + haldi" },
        breakfast: { title: "Appam + Egg Stew", detail: "2 appam + egg stew (light coconut)" },
        midMorning: { title: "Mixed Fruit", detail: "Papaya + pomegranate + banana (½)" },
        lunch: { title: "Kerala Non-Veg Sadhya", detail: "Rice + fish + chicken + sambar + avial" },
        snack: { title: "Groundnuts + Tea", detail: "Groundnuts + ginger tea" },
        dinner: { title: "Kanji + Grilled Prawns", detail: "Rice kanji + 80g grilled prawns" },
      },
    ],
    "vegan": [
      {
        theme: "Kanji Detox", emoji: "🌴",
        early: { title: "Methi + Coconut Water", detail: "Methi water + coconut water + lemon" },
        breakfast: { title: "Rice Kanji + Cherupayar Thoran", detail: "Rice porridge + green moong thoran (no dairy)" },
        midMorning: { title: "Amla + Seeds", detail: "Amla + walnuts + pumpkin seeds" },
        lunch: { title: "Brown Rice + Cherupayar Curry", detail: "Brown rice + green moong + rasam" },
        snack: { title: "Banana (Nendran, ½)", detail: "½ nendran banana" },
        dinner: { title: "Chapathi + Kadala Curry", detail: "2 chapathis + black chana curry, no dairy" },
      },
      {
        theme: "Fibre", emoji: "🥣",
        early: { title: "Methi + Amla", detail: "Methi water + amla + curry leaves" },
        breakfast: { title: "Puttu (Ragi) + Kadala Curry", detail: "Ragi puttu + kadala curry, no dairy" },
        midMorning: { title: "Guava + Cinnamon Water", detail: "Guava + cinnamon water" },
        lunch: { title: "Brown Rice + Sambar + Thoran", detail: "Brown rice + sambar (no ghee) + thoran" },
        snack: { title: "Groundnuts", detail: "Roasted groundnuts" },
        dinner: { title: "Idiyappam + Veg Stew", detail: "2 idiyappam + vegetable-coconut stew (thin milk)" },
      },
      {
        theme: "Heart-Healthy", emoji: "❤️",
        early: { title: "Garlic + Jeera", detail: "Garlic in warm jeera water" },
        breakfast: { title: "Appam + Thin Coconut Stew", detail: "2 appam + veg stew, thin coconut milk" },
        midMorning: { title: "Mixed Seeds", detail: "Flaxseed + sesame + pumpkin" },
        lunch: { title: "Brown Rice + Olan", detail: "Brown rice + ash gourd-bean olan" },
        snack: { title: "Sprouts", detail: "Moong sprouts + lemon" },
        dinner: { title: "Moong Khichdi", detail: "Moong + brown rice, coconut oil" },
      },
      {
        theme: "Anti-Inflammatory", emoji: "🌸",
        early: { title: "Turmeric + Coconut Water", detail: "Turmeric + pepper in coconut water" },
        breakfast: { title: "Ragi Puttu (Vegan)", detail: "Ragi puttu, no dairy" },
        midMorning: { title: "Papaya", detail: "1 cup papaya" },
        lunch: { title: "Brown Rice + Erissery + Rasam", detail: "Brown rice + pumpkin erissery + rasam" },
        snack: { title: "Green Tea + Almonds", detail: "Tea + 4 almonds" },
        dinner: { title: "Cherupayar Dal + Chapathi", detail: "Moong dal + 2 chapathis" },
      },
      {
        theme: "Millet", emoji: "🌾",
        early: { title: "Methi + Jamun Seed", detail: "Methi water + jamun seed powder" },
        breakfast: { title: "Ragi Kanji (Vegan)", detail: "Ragi porridge, water-based" },
        midMorning: { title: "Amla-Flax Smoothie", detail: "Amla + flaxseeds + water" },
        lunch: { title: "Brown Rice + Avial", detail: "Brown rice + avial, less coconut" },
        snack: { title: "Groundnuts + Tea", detail: "Groundnuts + ginger tea" },
        dinner: { title: "Idiyappam + Moong Curry", detail: "2 idiyappam + green moong curry, no dairy" },
      },
      {
        theme: "Gut", emoji: "🥛",
        early: { title: "Methi + Tulsi", detail: "Methi water + tulsi" },
        breakfast: { title: "Idli + Vegan Sambar", detail: "3 idlis + sambar, no ghee" },
        midMorning: { title: "Pomegranate", detail: "½ pomegranate" },
        lunch: { title: "Coconut Curd Rice", detail: "Coconut yoghurt rice + mustard + curry leaves" },
        snack: { title: "Coconut Dahi + Chia", detail: "Coconut yoghurt + chia" },
        dinner: { title: "Chembu Curry + Brown Rice", detail: "Taro curry + ½ cup brown rice" },
      },
      {
        theme: "Renewal", emoji: "✨",
        early: { title: "Super Detox Drink", detail: "Lemon + maple syrup + cinnamon + haldi" },
        breakfast: { title: "Appam + Veg Stew (Vegan)", detail: "2 appam + thin veg stew, coconut milk" },
        midMorning: { title: "Mixed Fruit", detail: "Papaya + pomegranate + banana (½)" },
        lunch: { title: "Vegan Kerala Sadhya", detail: "Brown rice + sambar + avial + thoran + rasam" },
        snack: { title: "Banana Chips (Baked) + Tea", detail: "Small baked chips + ginger tea" },
        dinner: { title: "Moong Kanji", detail: "Green moong porridge + coconut + jeera" },
      },
    ],
  },
  "bangalore": {
    "vegetarian": [
      {
        theme: "Akki Roti Detox", emoji: "🌸",
        early: { title: "Methi + Warm Water + Tulsi", detail: "Methi water + tulsi + warm lemon — Bangalore morning" },
        breakfast: { title: "Akki Roti + Coconut Chutney", detail: "Rice flour flatbread with onion + curry leaves + coconut chutney" },
        midMorning: { title: "Amla + Walnuts", detail: "Fresh amla + 5 walnuts + sesame seeds" },
        lunch: { title: "Brown Rice + Sambar + Palya", detail: "Brown rice + vegetable sambar + beans palya" },
        snack: { title: "Hurulikaalu (Horse Gram) Soup", detail: "Boiled horse gram soup — Bangalore's superfood, lowers cholesterol" },
        dinner: { title: "Jolada Roti + Dal", detail: "2 jowar rotis + toor dal — traditional Udupi-Bangalore combo" },
      },
      {
        theme: "Fibre Power", emoji: "🥣",
        early: { title: "Methi + Amla Water", detail: "Methi water + amla juice + curry leaves" },
        breakfast: { title: "Ragi Mudde + Sambar", detail: "Finger millet balls + vegetable sambar" },
        midMorning: { title: "Guava + Cinnamon Water", detail: "1 guava + cinnamon water" },
        lunch: { title: "Bisi Bele Bath (Light)", detail: "Bisi bele bath with less ghee, extra vegetables — one-pot comfort" },
        snack: { title: "Kadle Usli (Boiled Chickpeas)", detail: "Seasoned boiled chickpeas — Bangalore traditional snack" },
        dinner: { title: "Akki Roti + Soppina Saaru", detail: "Rice roti + leafy green rasam" },
      },
      {
        theme: "Heart-Healthy Fats", emoji: "❤️",
        early: { title: "Garlic + Jeera Water", detail: "Crushed garlic in warm jeera water" },
        breakfast: { title: "Ragi Dosa + Flaxseed Chutney", detail: "2 ragi dosas + ground flaxseed + coconut chutney" },
        midMorning: { title: "Mixed Seeds", detail: "Flaxseed + sesame + pumpkin 1 tbsp each" },
        lunch: { title: "Brown Rice + Menthya Soppu (Methi) Dal", detail: "Brown rice + methi leaves dal" },
        snack: { title: "Moong Sprouts", detail: "Moong sprouts + lemon + pepper" },
        dinner: { title: "Vegetable Pongal", detail: "Moong + brown rice pongal with veggies + ½ tsp ghee" },
      },
      {
        theme: "Anti-Inflammatory", emoji: "🌸",
        early: { title: "Haldi-Adrak-Tulsi Kadha", detail: "Turmeric + ginger + black pepper + tulsi water" },
        breakfast: { title: "Set Dosa + Tomato Saaru", detail: "2 set dosas + thin tomato rasam — light" },
        midMorning: { title: "Papaya", detail: "1 cup papaya + pinch dry ginger" },
        lunch: { title: "Brown Rice + Hurulikaalu Saaru", detail: "Brown rice + horse gram rasam — incredible anti-cholesterol combo" },
        snack: { title: "Green Tea + Almonds", detail: "Unsweetened tea + 4 almonds" },
        dinner: { title: "Jolada Roti + Palak Dal", detail: "2 jowar rotis + spinach dal" },
      },
      {
        theme: "Millet Magic", emoji: "🌾",
        early: { title: "Methi + Jamun Seed", detail: "Methi water + ½ tsp jamun seed powder" },
        breakfast: { title: "Ragi Kanji (Ambali)", detail: "Ragi porridge — traditional Karnataka breakfast, exceptional for sugar" },
        midMorning: { title: "Amla-Flax Smoothie", detail: "Amla + flaxseeds + ginger blended" },
        lunch: { title: "Jolada Roti + Ennegayi", detail: "Jowar roti + stuffed small brinjal curry — Dharwad style" },
        snack: { title: "Kadle Usli + Jeera Water", detail: "Boiled chana + warm jeera water" },
        dinner: { title: "Ragi Mudde + Bassaru", detail: "Ragi mudde + lentil-spinach bassar — Kannadiga superfood combination" },
      },
      {
        theme: "Gut Health Day", emoji: "🥛",
        early: { title: "Methi + Tulsi", detail: "Methi water + 5 tulsi leaves chewed" },
        breakfast: { title: "Idli + Sambar + Coconut Chutney", detail: "3 steamed idlis + sambar + fresh coconut chutney" },
        midMorning: { title: "Pomegranate", detail: "½ pomegranate" },
        lunch: { title: "Mosaru Chitranna", detail: "Curd rice with mustard + curry leaves + pomegranate" },
        snack: { title: "Perugu + Chia", detail: "Homemade curd + chia seeds" },
        dinner: { title: "Soppu Saaru + Small Rice", detail: "Leafy green rasam + ½ cup brown rice — gut-healing" },
      },
      {
        theme: "Renewal", emoji: "✨",
        early: { title: "Super Detox Drink", detail: "Warm water + lemon + honey + cinnamon + haldi" },
        breakfast: { title: "Rava Kesari Bath (tiny) + Idli", detail: "1 small kesari bath + 2 idlis — Sunday Bangalore tradition (minimal sugar)" },
        midMorning: { title: "Mixed Seasonal Fruit", detail: "Papaya + pomegranate + guava" },
        lunch: { title: "Full Karnataka Thali", detail: "Dal + sambar + palya + raita + small brown rice + jolada roti" },
        snack: { title: "Kadle Usli + Herbal Tea", detail: "Boiled chickpeas + tulsi-ginger tea" },
        dinner: { title: "Bisi Bele Bath (Small)", detail: "Light bisi bele bath + 1 tsp ghee + papad" },
      },
    ],
    "non-vegetarian": [
      {
        theme: "Detox", emoji: "🌸",
        early: { title: "Methi + Tulsi + Lemon", detail: "Methi water + tulsi + lemon" },
        breakfast: { title: "Egg Akki Roti", detail: "Egg + akki roti — Karnataka style" },
        midMorning: { title: "Amla + Seeds", detail: "Amla + walnuts + sesame" },
        lunch: { title: "Chicken Saaru + Brown Rice", detail: "Light Bangalore chicken rasam + ½ cup brown rice" },
        snack: { title: "Hurulikaalu Soup", detail: "Horse gram soup" },
        dinner: { title: "Jolada Roti + Chicken Palya", detail: "2 jowar rotis + dry chicken stir-fry, min oil" },
      },
      {
        theme: "Protein Power", emoji: "💪",
        early: { title: "Methi + Amla", detail: "Methi water + amla + curry leaves" },
        breakfast: { title: "Egg Dosa + Sambar", detail: "Egg dosa + veg sambar" },
        midMorning: { title: "Guava + Seeds", detail: "Guava + pumpkin seeds" },
        lunch: { title: "Mutton Saaru + Brown Rice", detail: "Light mutton rasam (thin broth) + ½ cup brown rice" },
        snack: { title: "Sprouts + Curd", detail: "Moong sprouts + curd" },
        dinner: { title: "Chicken Curry + Jolada Roti", detail: "Nati chicken curry (light) + 2 jowar rotis" },
      },
      {
        theme: "Omega-3", emoji: "❤️",
        early: { title: "Garlic + Jeera", detail: "Garlic in warm jeera water" },
        breakfast: { title: "Grilled Fish + Ragi Dosa", detail: "Grilled Kane fish + 2 ragi dosas — Karnataka favourite" },
        midMorning: { title: "Seeds + Amla", detail: "Flaxseed + sesame + amla water" },
        lunch: { title: "Fish Saaru + Brown Rice", detail: "Fish rasam (Karnataka) + ½ cup brown rice" },
        snack: { title: "Makhana + Tea", detail: "Makhana + unsweetened tea" },
        dinner: { title: "Prawn Palya + Akki Roti", detail: "Dry coconut prawn stir-fry + 2 akki rotis" },
      },
      {
        theme: "Anti-Inflammatory", emoji: "🌸",
        early: { title: "Haldi Kadha", detail: "Turmeric + ginger + pepper + tulsi" },
        breakfast: { title: "Egg Bhurji + Set Dosa", detail: "Egg bhurji + 2 set dosas" },
        midMorning: { title: "Papaya", detail: "1 cup papaya" },
        lunch: { title: "Hurulikaalu Saaru + Brown Rice + Chicken", detail: "Horse gram rasam + chicken + brown rice" },
        snack: { title: "Green Tea + Almonds", detail: "Tea + 4 almonds" },
        dinner: { title: "Grilled Fish + Jolada Roti", detail: "Grilled fish + 2 jowar rotis" },
      },
      {
        theme: "Millet", emoji: "🌾",
        early: { title: "Methi + Jamun Seed", detail: "Methi water + jamun seed powder" },
        breakfast: { title: "Ragi Mudde + Egg Curry", detail: "Ragi mudde + 1-egg curry" },
        midMorning: { title: "Amla-Flax Smoothie", detail: "Amla + flaxseeds + ginger" },
        lunch: { title: "Jolada Roti + Mutton Saaru", detail: "2 jowar rotis + thin mutton broth" },
        snack: { title: "Steamed Idli", detail: "2 idlis + chutney" },
        dinner: { title: "Fish Saaru + Brown Rice", detail: "Fish rasam + ½ cup brown rice" },
      },
      {
        theme: "Gut Health", emoji: "🥛",
        early: { title: "Methi + Tulsi", detail: "Methi water + tulsi" },
        breakfast: { title: "Egg Idli + Sambar", detail: "2 eggs + 3 idlis + sambar" },
        midMorning: { title: "Pomegranate + Curd", detail: "½ pomegranate + curd" },
        lunch: { title: "Mosaru Chitranna + Grilled Fish", detail: "Curd rice + 80g grilled fish" },
        snack: { title: "Chia Curd", detail: "Curd + chia seeds" },
        dinner: { title: "Chicken Saaru + Jolada Roti", detail: "Chicken rasam + 2 jowar rotis" },
      },
      {
        theme: "Renewal", emoji: "✨",
        early: { title: "Super Detox Drink", detail: "Lemon + honey + cinnamon + haldi" },
        breakfast: { title: "Set Dosa + Egg + Sambar", detail: "2 set dosas + egg + sambar" },
        midMorning: { title: "Mixed Fruit", detail: "Papaya + pomegranate + guava" },
        lunch: { title: "Karnataka Non-Veg Thali", detail: "Chicken + fish + dal + sambar + rice + jowar roti" },
        snack: { title: "Kadle + Tea", detail: "Boiled chickpeas + tulsi tea" },
        dinner: { title: "Bisi Bele Bath + Grilled Chicken", detail: "Light bisi bele bath + 80g grilled chicken" },
      },
    ],
    "vegan": [
      {
        theme: "Akki Roti Detox", emoji: "🌸",
        early: { title: "Methi + Tulsi + Lemon", detail: "Methi water + tulsi + lemon" },
        breakfast: { title: "Akki Roti (Vegan)", detail: "Akki roti + coconut chutney, no dairy" },
        midMorning: { title: "Amla + Seeds", detail: "Amla + walnuts + sesame" },
        lunch: { title: "Brown Rice + Sambar + Palya", detail: "Brown rice + sambar (no ghee) + palya" },
        snack: { title: "Hurulikaalu Soup", detail: "Horse gram soup" },
        dinner: { title: "Jolada Roti + Dal", detail: "2 jowar rotis + toor dal, no dairy" },
      },
      {
        theme: "Fibre", emoji: "🥣",
        early: { title: "Methi + Amla", detail: "Methi water + amla + curry leaves" },
        breakfast: { title: "Ragi Mudde + Vegan Sambar", detail: "Ragi mudde + sambar without ghee tadka" },
        midMorning: { title: "Guava + Cinnamon Water", detail: "Guava + cinnamon water" },
        lunch: { title: "Bisi Bele Bath (Vegan)", detail: "Bisi bele bath, coconut oil, no ghee" },
        snack: { title: "Kadle Usli", detail: "Boiled chickpeas seasoned" },
        dinner: { title: "Akki Roti + Soppina Saaru", detail: "Rice roti + leafy green rasam" },
      },
      {
        theme: "Heart-Healthy", emoji: "❤️",
        early: { title: "Garlic + Jeera", detail: "Garlic in warm jeera water" },
        breakfast: { title: "Ragi Dosa + Flaxseed Chutney", detail: "2 ragi dosas + flaxseed + coconut chutney" },
        midMorning: { title: "Mixed Seeds", detail: "Flaxseed + sesame + pumpkin" },
        lunch: { title: "Brown Rice + Methi Dal", detail: "Brown rice + methi dal, mustard oil" },
        snack: { title: "Sprouts", detail: "Moong sprouts + lemon" },
        dinner: { title: "Veg Pongal (Vegan)", detail: "Moong pongal, coconut oil" },
      },
      {
        theme: "Anti-Inflammatory", emoji: "🌸",
        early: { title: "Haldi Kadha", detail: "Turmeric + ginger + pepper + tulsi" },
        breakfast: { title: "Set Dosa (Vegan)", detail: "2 set dosas + tomato chutney, no curd" },
        midMorning: { title: "Papaya", detail: "1 cup papaya" },
        lunch: { title: "Brown Rice + Hurulikaalu Saaru", detail: "Brown rice + horse gram rasam" },
        snack: { title: "Green Tea + Almonds", detail: "Tea + 4 almonds" },
        dinner: { title: "Jolada Roti + Palak Dal", detail: "2 jowar rotis + spinach dal" },
      },
      {
        theme: "Millet", emoji: "🌾",
        early: { title: "Methi + Jamun Seed", detail: "Methi water + jamun seed powder" },
        breakfast: { title: "Ragi Ambali (Vegan)", detail: "Ragi porridge, water-based" },
        midMorning: { title: "Amla-Flax Smoothie", detail: "Amla + flaxseeds + water" },
        lunch: { title: "Jolada Roti + Ennegayi", detail: "Jowar roti + stuffed brinjal curry" },
        snack: { title: "Kadle Usli + Jeera Water", detail: "Chickpeas + warm jeera water" },
        dinner: { title: "Ragi Mudde + Bassaru", detail: "Ragi mudde + lentil-spinach bassaru" },
      },
      {
        theme: "Gut", emoji: "🥛",
        early: { title: "Methi + Tulsi", detail: "Methi water + tulsi" },
        breakfast: { title: "Idli + Vegan Sambar", detail: "3 idlis + sambar, no ghee" },
        midMorning: { title: "Pomegranate", detail: "½ pomegranate" },
        lunch: { title: "Mosaru Chitranna (Coconut Curd)", detail: "Coconut curd rice + mustard + curry leaves" },
        snack: { title: "Coconut Dahi + Chia", detail: "Coconut yoghurt + chia" },
        dinner: { title: "Soppu Saaru + Small Rice", detail: "Leafy green rasam + ½ cup brown rice" },
      },
      {
        theme: "Renewal", emoji: "✨",
        early: { title: "Super Detox Drink", detail: "Lemon + maple syrup + cinnamon + haldi" },
        breakfast: { title: "Ragi Mudde + Sambar (Vegan)", detail: "Ragi mudde + vegan sambar" },
        midMorning: { title: "Mixed Fruit", detail: "Papaya + pomegranate + guava" },
        lunch: { title: "Vegan Karnataka Thali", detail: "Dal + sambar + palya + brown rice + jowar roti" },
        snack: { title: "Kadle + Herbal Tea", detail: "Chickpeas + tulsi tea" },
        dinner: { title: "Bisi Bele Bath (Vegan)", detail: "Light bisi bele bath, coconut oil" },
      },
    ],
  },
};

/** Evening protein snacks (all diets) — the artifact swaps these into every day's snack slot. */
export const PROTEIN_SNACKS: readonly Meal[] = [
  { title: "Roasted Chana", detail: "½ cup dry-roasted chana · ~10g protein · jeera water on the side" },
  { title: "Moong Sprouts Chaat", detail: "1 cup moong sprouts · ~14g protein · lemon + chilli + onion" },
  { title: "Roasted Chana", detail: "½ cup roasted chana · ~10g protein · unsweetened green tea" },
  { title: "Sprouted Chana Salad", detail: "1 cup sprouted chickpeas · ~15g protein · cucumber + lemon + pepper" },
  { title: "Mixed Sprouts", detail: "½ cup moong + chana sprouts · ~12g protein · amla on the side" },
  { title: "Roasted Chana", detail: "½ cup roasted chana · ~10g protein · tulsi-ginger herbal tea" },
  { title: "Sprouts Bhel", detail: "1 cup moong sprouts + onion + tomato + lemon · ~14g protein" },
];

/** Non-vegetarian air-fry dinners — used every day. */
export const AIR_FRY_DINNERS: readonly Meal[] = [
  { title: "Air Fry Chicken Breast", detail: "150g air fry chicken (0 oil) · ~47g protein · side salad + 1 roti" },
  { title: "Air Fry Salmon Fillet", detail: "150g air fry salmon (5 min, 200°C) · ~37g protein · lemon + herbs + brown rice" },
  { title: "Air Fry Chicken Tikka", detail: "150g air fry chicken tikka (no oil marinade) · ~47g protein · mint chutney + 2 bajra rotis" },
  { title: "Air Fry Salmon + Quinoa Bowl", detail: "150g air fry salmon · ~37g protein · ½ cup brown rice + cucumber salad" },
  { title: "Air Fry Chicken Thigh", detail: "150g air fry boneless thigh (200°C, 18 min) · ~43g protein + spinach sabzi" },
  { title: "Air Fry Salmon with Herbs", detail: "150g air fry salmon + turmeric-lemon rub · ~37g protein + 1 jowar roti" },
  { title: "Air Fry Chicken Breast + Dal", detail: "150g air fry chicken · ~47g protein · moong dal + 1 roti" },
];

/** Non-vegetarian air-fry lunches — used on alternate days (Tue, Thu, Sat). */
export const AIR_FRY_LUNCHES: readonly Meal[] = [
  { title: "Air Fry Chicken + Brown Rice", detail: "150g air fry chicken breast · ~47g protein · ½ cup brown rice + raita" },
  { title: "Air Fry Salmon + Dal", detail: "150g air fry salmon · ~37g protein · moong dal + ½ cup brown rice" },
  { title: "Air Fry Chicken Bowl", detail: "150g air fry chicken + veggies · ~47g protein · jowar roti + salad" },
  { title: "Air Fry Salmon + Millet", detail: "150g air fry salmon · ~37g protein · ragi roti + green chutney" },
  { title: "Air Fry Chicken + Palak Dal", detail: "150g air fry chicken · ~47g protein · palak dal + brown rice" },
  { title: "Air Fry Salmon + Rice", detail: "150g air fry salmon · ~37g protein · ½ cup brown rice + rasam" },
  { title: "Air Fry Chicken Thali", detail: "150g air fry chicken · ~47g protein · dal + sabzi + 1 roti" },
];

/** Approximate daily protein (g) per diet, Monday → Sunday. */
export const PROTEIN_ESTIMATE: Record<DietId, readonly number[]> = {
  "vegetarian": [72,74,71,75,70,76,73],
  "non-vegetarian": [88,92,95,85,90,89,84],
  "vegan": [70,73,71,74,70,75,71],
};
// </generated:meals>

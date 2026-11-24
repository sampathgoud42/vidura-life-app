/**
 * Breathing techniques: what each one is for, when to practise it, when NOT to,
 * how strong the evidence is, and the exact pacing the interactive player follows.
 *
 * Pacing is described as a list of segments (inhale, exhale, hold, pump, rest…) that
 * the player walks through second by second, with voice cues, a soft beat for the
 * fast techniques, and an ocean or hum tone for Ujjayi and Bhramari.
 */
import type { CategoryId, ImageSlot, PhaseId } from "./content";

export type TechniqueId = "coherent" | "nadi-shodhana" | "anulom-vilom" | "bhramari" | "kapalbhati" | "bhastrika" | "ujjayi" | "dirga";

/** Evidence tags, kept honest: only slow breathing has solid trial evidence. */
export type BreathEvidence = "good" | "some" | "limited";
export const BREATH_EVIDENCE_LABEL: Record<BreathEvidence, string> = {
  good: "Good evidence",
  some: "Some evidence",
  limited: "Limited evidence",
};

export interface Source {
  label: string;
  url: string;
}

export interface Technique {
  id: TechniqueId;
  name: string;
  /** English name or what it's also called. */
  aka: string;
  emoji: string;
  /** One line, for the comparison table. */
  primary: string;
  /** For the comparison table. */
  bestTime: string;
  /** Short line for the suggestion card. */
  tagline: string;
  what: string;
  benefits: string[];
  how: string[];
  /** When NOT to do it. */
  avoid: string[];
  evidence: BreathEvidence;
  evidenceNote: string;
  /** Fast, forceful techniques: rhythmic beat, rounds, and a safety check before starting. */
  fast: boolean;
  /** Session lengths offered (slow techniques), in minutes. */
  lengths?: number[];
  defaultMinutes: number;
  phases: PhaseId[];
  goodFor: CategoryId[];
  image: ImageSlot;
  sources: Source[];
}

const pubmed = (id: number) => `https://pubmed.ncbi.nlm.nih.gov/${id}/`;
const SRC = {
  zaccaro: { label: "Zaccaro A, et al. How breath-control can change your life: a systematic review on slow breathing. Front Hum Neurosci, 2018.", url: pubmed(30245619) },
  chaddha: { label: "Chaddha A, et al. Device and non-device-guided slow breathing to reduce blood pressure: systematic review and meta-analysis. Complement Ther Med, 2019.", url: pubmed(31331557) },
  garg: { label: "Garg P, et al. Effect of breathing exercises on blood pressure and heart rate: systematic review and meta-analysis. Int J Cardiol Cardiovasc Risk Prev, 2024.", url: pubmed(38179185) },
  fincham: { label: "Fincham GW, et al. Effect of breathwork on stress and mental health: a meta-analysis of randomised controlled trials. Sci Rep, 2023.", url: pubmed(36624160) },
  balban: { label: "Balban MY, et al. Brief structured respiration practices enhance mood and reduce physiological arousal. Cell Rep Med, 2023.", url: pubmed(36630953) },
  jayawardena: { label: "Jayawardena R, et al. Exploring the therapeutic benefits of pranayama (yogic breathing): a systematic review. Int J Yoga, 2020.", url: pubmed(32669763) },
  nam: { label: "Nam TG, et al. Alternate nostril breathing and blood pressure: systematic review and meta-analysis of RCTs. Complement Med Res, 2024.", url: pubmed(39008954) },
  woo: { label: "Woo M, et al. Slow-paced breathing and humming breathing: effects on heart rate variability and affect (pilot). Physiol Behav, 2025.", url: pubmed(40482984) },
  roj: { label: "Roj AR, et al. Yogic bellows, neural sparks: the neurophysiological mechanisms of Kapalbhati, a systematic review. Ann Neurosci, 2026.", url: pubmed(40520439) },
  mason: { label: "Mason H, et al. Cardiovascular and respiratory effect of yogic slow breathing in the yoga beginner. Evid Based Complement Alternat Med, 2013.", url: pubmed(23710236) },
} satisfies Record<string, Source>;

const art = (file: string, tone: PhaseId, alt: string, subject: string): ImageSlot => ({ src: `assets/breath/${file}.webp`, ratio: "4:5", tone, alt, subject });

/** Applies to every technique. */
export const BREATH_SAFETY_ALL = [
  "Never practise while driving, in water or anywhere a faint could hurt you.",
  "Sit down if you feel lightheaded, and go back to normal breathing.",
  "Children and anyone pregnant should stick to gentle, slow breathing with no holds and nothing forceful.",
];

export const BREATH_DISCLAIMER =
  "General wellness information, not medical advice. If you have a heart, lung, eye or blood-pressure condition, are pregnant, or take medicines for any of these, check with your doctor before starting breathwork.";

const FAST_AVOID = [
  "Pregnancy, or a period you might be pregnant",
  "High blood pressure that isn't well controlled, or heart disease",
  "Recent surgery on the abdomen, chest or eyes, or a hernia",
  "Epilepsy, glaucoma, vertigo, or panic attacks",
  "Within 2–3 hours of a meal: do it on an empty stomach",
  "Stop at once if you feel dizzy, tingly or short of breath",
];

export const TECHNIQUES: readonly Technique[] = [
  {
    id: "coherent",
    name: "Coherent breathing",
    aka: "Resonance breathing, about 5.5 breaths a minute",
    emoji: "🌊",
    primary: "Heart health, HRV, emotional balance",
    bestTime: "Anytime, especially between parts of the workday",
    tagline: "Five and a half seconds in, five and a half out.",
    what: "Slow, even breathing at about five and a half breaths a minute. At this pace heart rate and blood pressure rise and fall in step with the breath, which strengthens the body's calming reflexes.",
    benefits: [
      "Raises heart rate variability, a marker of a resilient nervous system",
      "Lowers blood pressure a little with regular practice",
      "Calms stress and steadies emotions within minutes",
    ],
    how: [
      "Sit or lie comfortably with one hand on your belly.",
      "Breathe in through your nose for about five and a half seconds, letting the belly rise.",
      "Breathe out softly for the same count. No pauses, no strain.",
      "Keep going for five to ten minutes. Let the orb set the pace.",
    ],
    avoid: ["Ease off if you feel lightheaded; shorten the count to four in, four out.", "Very low blood pressure: practise lying down at first."],
    evidence: "good",
    evidenceNote: "Slow breathing near six breaths a minute is the best-studied breathing practice, with meta-analyses showing small drops in blood pressure and less stress.",
    fast: false,
    lengths: [3, 5, 10, 15],
    defaultMinutes: 5,
    phases: ["dawn", "morning", "midday", "afternoon", "evening", "night"],
    goodFor: ["bp", "hormonal", "fertility", "inflammation", "hair", "sugar", "cholesterol", "thyroid", "gut"],
    image: art(
      "coherent",
      "midday",
      "A woman at a desk breathing slowly with one hand on her belly",
      "A South Asian woman sitting upright at a tidy desk with eyes closed and one hand resting on her belly, breathing slowly, soft wave shapes flowing around her, calm midday light",
    ),
    sources: [SRC.zaccaro, SRC.chaddha, SRC.garg, SRC.fincham],
  },
  {
    id: "nadi-shodhana",
    name: "Nadi Shodhana",
    aka: "Channel-cleansing breath, the slower alternate-nostril practice",
    emoji: "🌗",
    primary: "Calm focus and balance",
    bestTime: "Morning or evening, on a calm stomach",
    tagline: "Slow alternate-nostril breathing, with an optional gentle hold.",
    what: "A slow alternate-nostril breath: in through one side, out through the other, switching each round. Experienced practitioners add a short, gentle pause after each inhale.",
    benefits: ["Settles a busy mind before meditation or sleep", "May lower blood pressure and heart rate a little", "Builds slow, controlled breathing"],
    how: [
      "Sit tall. Rest your right thumb by the right nostril and your ring finger by the left.",
      "Close the right nostril and breathe in slowly through the left.",
      "If you're experienced, pause gently with both nostrils closed. Otherwise skip the hold.",
      "Open the right nostril and breathe out slowly. Then in through the right, switch, and out through the left. That's one round.",
    ],
    avoid: [
      "A blocked or very runny nose: wait until it clears",
      "Skip the hold if you're pregnant, have high blood pressure or heart disease",
      "Stop if you feel breathless or dizzy",
    ],
    evidence: "some",
    evidenceNote: "Alternate-nostril breathing lowered blood pressure in a 2024 meta-analysis of small trials. Benefits for focus come from small studies.",
    fast: false,
    lengths: [3, 5, 10, 15],
    defaultMinutes: 5,
    phases: ["dawn", "morning", "evening"],
    goodFor: ["bp", "hormonal", "inflammation", "thyroid"],
    image: art(
      "nadi-shodhana",
      "dawn",
      "A man practising alternate-nostril breathing at sunrise",
      "A South Asian man sitting cross-legged at sunrise with his right hand raised to his nose in the alternate-nostril position, eyes closed, a half-light half-dark circle behind him",
    ),
    sources: [SRC.nam, SRC.jayawardena],
  },
  {
    id: "anulom-vilom",
    name: "Anulom Vilom",
    aka: "Alternate-nostril breathing, no hold",
    emoji: "🔁",
    primary: "Stress relief and steady breathing",
    bestTime: "Morning or evening, to begin or close the day",
    tagline: "Alternate-nostril breathing, smooth and without holding.",
    what: "The everyday version of alternate-nostril breathing: in through one nostril, out through the other, continuously, with no breath hold. Easy for beginners.",
    benefits: ["Eases stress and racing thoughts", "May lower blood pressure a little over weeks", "A gentle daily habit for any age"],
    how: [
      "Sit tall and rest your left hand on your knee.",
      "Close the right nostril with your thumb and breathe in through the left.",
      "Close the left and breathe out through the right.",
      "Breathe in through the right, switch, and breathe out through the left. Keep it smooth and quiet.",
    ],
    avoid: ["A blocked nose: wait until it clears", "Stop if you feel dizzy, and never force the breath"],
    evidence: "some",
    evidenceNote: "Small randomised trials show modest drops in blood pressure and stress; larger, longer trials are still needed.",
    fast: false,
    lengths: [3, 5, 10, 15],
    defaultMinutes: 5,
    phases: ["dawn", "morning", "evening"],
    goodFor: ["bp", "hormonal", "inflammation", "fertility"],
    image: {
      src: "assets/evening/anulom.webp",
      ratio: "4:5",
      tone: "evening",
      alt: "A woman practising alternate-nostril breathing at dusk",
      subject: "A South Asian woman practising alternate-nostril breathing, seated on a floor cushion at dusk beside a warm amber lamp, calm face",
    },
    sources: [SRC.nam, SRC.jayawardena],
  },
  {
    id: "bhramari",
    name: "Bhramari",
    aka: "Humming bee breath",
    emoji: "🐝",
    primary: "Quick calm, stress and sleep",
    bestTime: "Evening, or whenever stress spikes",
    tagline: "A soft hum on every long exhale. Hum along with the tone.",
    what: "Breathe in through the nose, then hum softly on a long exhale. The hum naturally lengthens the out-breath, which is what calms the body.",
    benefits: ["Calms stress quickly, often within a few rounds", "Helps you wind down before sleep", "Gently slows the heart rate"],
    how: [
      "Sit comfortably and close your eyes. You can rest your fingertips lightly over your ears.",
      "Breathe in through your nose.",
      "Breathe out with a soft, steady hum, like a bee. Hum along with the tone.",
      "Feel the buzz in your face and head. Rest for a few natural breaths at the end.",
    ],
    avoid: ["An active ear infection or ear pain", "Don't press hard on the ears", "Stop if you feel lightheaded"],
    evidence: "some",
    evidenceNote: "Small studies, including a 2025 pilot, link humming breath to higher heart rate variability and calmer mood. Large trials are lacking.",
    fast: false,
    lengths: [3, 5, 10, 15],
    defaultMinutes: 5,
    phases: ["afternoon", "evening", "night"],
    goodFor: ["bp", "hormonal", "fertility", "inflammation", "hair", "thyroid"],
    image: {
      src: "assets/evening/bhramari.webp",
      ratio: "4:5",
      tone: "evening",
      alt: "A man with eyes closed practising humming breath at dusk",
      subject: "A South Asian man seated with eyes closed, fingertips resting lightly over his ears, practising humming breath at dusk, rose and amber tones",
    },
    sources: [SRC.woo, SRC.jayawardena],
  },
  {
    id: "kapalbhati",
    name: "Kapalbhati",
    aka: "Skull-shining breath",
    emoji: "⚡",
    primary: "Digestion, core tone, mental clarity",
    bestTime: "Morning, on an empty stomach",
    tagline: "Short, sharp exhales in rounds, with rests between.",
    what: "Short, forceful exhales through the nose, driven by a quick pull of the belly, with the inhale happening by itself. Done in rounds with rest between them.",
    benefits: ["Feels energising and clears the head", "Works the deep belly muscles", "Traditionally used to support digestion"],
    how: [
      "Sit tall on an empty stomach with your hands on your knees.",
      "Breathe out sharply through the nose by pulling the belly in. Let the inhale happen on its own.",
      "Follow the beat: about one exhale a second. Beginners do rounds of 20.",
      "Rest with natural breathing between rounds. Three rounds is plenty.",
    ],
    avoid: FAST_AVOID,
    evidence: "limited",
    evidenceNote: "Studies are small and mostly short-term. It changes brain and nerve activity, but claims about weight loss or detox aren't supported.",
    fast: true,
    defaultMinutes: 3,
    phases: ["dawn", "morning"],
    goodFor: ["gut", "sugar", "cholesterol"],
    image: art(
      "kapalbhati",
      "morning",
      "A woman sitting tall doing Kapalbhati breathing in the morning",
      "A South Asian woman sitting tall cross-legged on a mat in the early morning, hands on knees, belly drawn in mid-exhale, short bold lines bursting outward from her nose to show sharp breaths",
    ),
    sources: [SRC.roj, SRC.jayawardena],
  },
  {
    id: "bhastrika",
    name: "Bhastrika",
    aka: "Bellows breath",
    emoji: "🔥",
    primary: "Energy, circulation, lung capacity",
    bestTime: "Morning, or the mid-afternoon slump (2–3 hours after lunch)",
    tagline: "Strong, even breaths in and out, in short rounds.",
    what: "Strong, equal breaths in and out through the nose, like a bellows, in short rounds of about ten breaths with rest in between.",
    benefits: ["A quick, natural energy lift", "Exercises the breathing muscles", "Clears sleepiness and sharpens attention"],
    how: [
      "Sit tall on an empty stomach.",
      "Breathe in and out strongly through the nose, equal in and out, following the beat.",
      "Do about ten breaths, then rest with natural breathing.",
      "Three rounds is enough. Start gently and build up over weeks.",
    ],
    avoid: FAST_AVOID,
    evidence: "limited",
    evidenceNote: "Evidence comes from small, short studies. It's safe for most healthy adults when done gently, but it isn't for everyone.",
    fast: true,
    defaultMinutes: 3,
    phases: ["dawn", "morning", "afternoon"],
    goodFor: ["sugar", "cholesterol", "thyroid"],
    image: art(
      "bhastrika",
      "morning",
      "A man doing bellows breathing with an energetic posture in the morning",
      "A South Asian man sitting tall on a mat in the morning with fists raised beside his shoulders, chest lifted, doing energetic bellows breathing, bold rays of sunlight behind him",
    ),
    sources: [SRC.jayawardena],
  },
  {
    id: "ujjayi",
    name: "Ujjayi",
    aka: "Ocean breath, victorious breath",
    emoji: "🌬️",
    primary: "Deep focus, grounding",
    bestTime: "Before demanding tasks, or during exercise and yoga",
    tagline: "Slow breathing with a soft ocean sound in the throat.",
    what: "Slow breathing through the nose with a gentle narrowing at the back of the throat, which makes a soft ocean-like sound. The sound slows the breath and gives the mind something to rest on.",
    benefits: ["Steadies focus before demanding tasks", "Slows the breath naturally, which calms the nervous system", "Paces the breath during yoga and exercise"],
    how: [
      "Breathe in through your nose and gently narrow the back of your throat, as if fogging a mirror with your mouth closed.",
      "You'll hear a soft ocean sound. Match it to the sound you hear.",
      "Breathe out slowly with the same soft sound.",
      "Keep it quiet and easy: the sound should be heard by you, not the room.",
    ],
    avoid: ["Don't strain or squeeze the throat", "Ease off if you have low blood pressure and feel dizzy", "A sore throat or recent throat surgery"],
    evidence: "some",
    evidenceNote: "Studies show Ujjayi slows breathing and shifts heart-rate control toward calm, much like other slow breathing. Trials are small.",
    fast: false,
    lengths: [3, 5, 10, 15],
    defaultMinutes: 5,
    phases: ["morning", "midday", "afternoon"],
    goodFor: ["thyroid", "hormonal", "bp"],
    image: art(
      "ujjayi",
      "afternoon",
      "A woman breathing calmly with ocean waves around her",
      "A South Asian woman sitting upright with eyes closed and a calm focused face, stylised ocean waves curling gently around her, afternoon light",
    ),
    sources: [SRC.mason, SRC.zaccaro],
  },
  {
    id: "dirga",
    name: "Dirga",
    aka: "Three-part breath: belly, ribs, chest",
    emoji: "🫁",
    primary: "Full lung expansion, undoing desk posture",
    bestTime: "Evening wind-down, or before sleep",
    tagline: "Fill belly, ribs and chest, then let it go in reverse.",
    what: "A slow, full breath that fills the lungs in three parts, belly, then ribs, then chest, and empties in reverse. It undoes the shallow chest breathing that comes with long hours at a desk.",
    benefits: ["Uses the full lungs instead of shallow chest breathing", "Opens a rounded, desk-bound posture", "A calm, slow rhythm that prepares you for sleep"],
    how: [
      "Lie down or sit tall with one hand on your belly and one on your chest.",
      "Breathe in to the belly, then widen the ribs, then lift the chest.",
      "Breathe out from the chest, then the ribs, then gently draw the belly in.",
      "Keep it smooth and unhurried. Never force the last bit of air in or out.",
    ],
    avoid: ["Stop if you feel lightheaded", "After recent chest or abdominal surgery, check with your doctor first"],
    evidence: "some",
    evidenceNote: "A form of slow breathing, so it shares the calming effects seen in slow-breathing trials. Studies on Dirga itself are few.",
    fast: false,
    lengths: [3, 5, 10, 15],
    defaultMinutes: 5,
    phases: ["evening", "night"],
    goodFor: ["hormonal", "inflammation", "bp", "fertility"],
    image: art(
      "dirga",
      "night",
      "A man lying down with hands on belly and chest, breathing deeply at night",
      "A South Asian man lying on his back on a soft mat at night with one hand on his belly and one on his chest, breathing deeply, three soft layered arcs rising above his body",
    ),
    sources: [SRC.zaccaro, SRC.balban],
  },
];

export const techniqueById = (id: string): Technique | undefined => TECHNIQUES.find((t) => t.id === id);

// ── Hands and posture ───────────────────────────────────────────────────────

export interface HandPose {
  /** Mudra (hand position) name. */
  mudra: string;
  /** One line: how to hold it. */
  mudraHow: string;
  /** Optional simpler version. */
  easier?: string;
  posture: string;
  postureHow: string;
  /** Full-body pose image (WebP, 4:5; a "-sm" copy sits beside it). */
  image?: { src: string; alt: string };
  /** Show the small accurate hand drawing too, where the image can't show the fingers clearly. */
  inset?: boolean;
}

const JNANA = "Jnana (Chin) mudra";
const JNANA_HOW = "Tip of the index finger touches the tip of the thumb; the other three fingers stay relaxed and straight. Rest the hands on the knees, palms up.";
const SEATED = "Seated, spine tall";
const SEATED_HOW = "Cross-legged on a cushion (Sukhasana), or upright on a chair with feet flat. Shoulders soft, chin level.";

export const HAND_POSE: Record<TechniqueId, HandPose> = {
  "nadi-shodhana": {
    inset: true,
    image: { src: "assets/mudra/nasika.webp", alt: "A man seated cross-legged on a cushion, right hand at his nose in Nasika mudra, left hand on his knee in Jnana mudra, eyes closed" },
    mudra: "Nasika (Vishnu) mudra, right hand",
    mudraHow: "Fold the index and middle fingers into the palm. The thumb closes the right nostril; the ring finger closes the left. The left hand rests on the knee in Jnana mudra.",
    posture: SEATED,
    postureHow: SEATED_HOW,
  },
  "anulom-vilom": {
    inset: true,
    image: { src: "assets/mudra/nasika.webp", alt: "A man seated cross-legged on a cushion, right hand at his nose in Nasika mudra, left hand on his knee in Jnana mudra, eyes closed" },
    mudra: "Nasika (Vishnu) mudra, right hand",
    mudraHow: "Fold the index and middle fingers into the palm. The thumb closes the right nostril; the ring finger closes the left. The left hand rests on the knee in Jnana mudra.",
    posture: SEATED,
    postureHow: SEATED_HOW,
  },
  bhramari: {
    inset: true,
    image: { src: "assets/mudra/shanmukhi.webp", alt: "A woman seated cross-legged with her hands over her face in Shanmukhi mudra: thumbs on the ears, fingers over the eyes, beside the nose and around the lips" },
    mudra: "Shanmukhi mudra",
    mudraHow: "Thumbs press the ear flaps closed, index fingers rest on the closed eyes, middle fingers beside the nose, ring and little fingers around the lips.",
    easier: "Beginners: just press the ear flaps closed with your index fingers.",
    posture: SEATED,
    postureHow: SEATED_HOW,
  },
  kapalbhati: {
    image: { src: "assets/mudra/jnana.webp", alt: "A woman seated cross-legged on a cushion, spine tall, hands on her knees in Jnana mudra, palms up, eyes closed" },
    mudra: JNANA,
    mudraHow: JNANA_HOW,
    posture: "Seated upright, never lying down",
    postureHow: "Cross-legged or on a chair, spine tall so the belly can move freely. Don't practise lying down.",
  },
  bhastrika: {
    image: { src: "assets/mudra/jnana.webp", alt: "A woman seated cross-legged on a cushion, spine tall, hands on her knees in Jnana mudra, palms up, eyes closed" },
    mudra: JNANA,
    mudraHow: JNANA_HOW,
    posture: "Seated upright, never lying down",
    postureHow: "Cross-legged or on a chair, spine tall so the chest and belly can move freely. Don't practise lying down.",
  },
  ujjayi: {
    image: { src: "assets/mudra/jnana.webp", alt: "A woman seated cross-legged on a cushion, spine tall, hands on her knees in Jnana mudra, palms up, eyes closed" },
    mudra: JNANA,
    mudraHow: JNANA_HOW,
    posture: SEATED,
    postureHow: `${SEATED_HOW} Ujjayi also works during gentle yoga.`,
  },
  coherent: {
    image: { src: "assets/mudra/dhyana.webp", alt: "A woman seated cross-legged on a round cushion, hands resting in her lap in Dhyana mudra, right over left, thumbs touching, eyes closed" },
    mudra: "Dhyana mudra",
    mudraHow: "Hands rest in the lap, right hand on top of the left, palms up, thumb tips lightly touching. Or simply rest the hands on the thighs.",
    posture: SEATED,
    postureHow: SEATED_HOW,
  },
  dirga: {
    image: { src: "assets/mudra/dirga.webp", alt: "A person lying on their back on a mat, one hand resting on the belly and one on the chest, eyes closed" },
    mudra: "One hand on the belly, one on the chest",
    mudraHow: "Feel the belly rise first, then the ribs widen, then the chest lift; empty in reverse.",
    posture: "Lying down (Shavasana) or seated",
    postureHow: "Lie on your back with knees bent or legs long, or sit tall. Let the shoulders and jaw go soft.",
  },
};

/** Guide order: the comparison table Sampath asked for first, then the rest. */
export const TABLE_ORDER: TechniqueId[] = ["kapalbhati", "bhastrika", "coherent", "ujjayi", "dirga", "bhramari", "nadi-shodhana", "anulom-vilom"];

// ── Pacing ──────────────────────────────────────────────────────────────────

export type SegKind = "in" | "out" | "hold" | "pump" | "rest" | "ready";
/** Voice clips the player can speak (files in public/assets/audio/voice). */
export type VoiceClip =
  | "in"
  | "hold"
  | "out"
  | "hum"
  | "done"
  | "inleft"
  | "inright"
  | "outleft"
  | "outright"
  | "belly"
  | "ribs"
  | "chest"
  | "rest"
  | "ready"
  | "kapal"
  | "bellows"
  | "last"
  /** Short cues after the opening guidance: "In…", "Out…", "Hold…". */
  | "sin"
  | "sout"
  | "shold";

export interface Segment {
  kind: SegKind;
  secs: number;
  /** Big label on screen. */
  label: string;
  /** Spoken at the start. */
  say?: VoiceClip;
  /** Extra cues during the segment: [second, clip]. */
  cues?: [number, VoiceClip][];
  /** Speak a countdown ("four, three, two, one") after the opening cue. */
  count?: boolean;
  side?: "left" | "right";
  /** Dirga: which part is filling. */
  part?: "belly" | "ribs" | "chest";
  /** Soft pacing beat at the start (fast techniques). */
  beat?: "in" | "out";
  /** Background tone that follows the breath. */
  tone?: "ocean" | "hum";
  /** Fast techniques: which round and pump this is. */
  round?: number;
  rounds?: number;
  rep?: number;
  reps?: number;
}

export interface Options {
  minutes: number;
  /** Nadi Shodhana: add a gentle hold after each inhale (experienced only). */
  hold?: boolean;
  /** Fast techniques: pumps per round (Kapalbhati 20 or 30) or breaths per round (Bhastrika 10). */
  reps?: number;
  /** Fast techniques: number of rounds. */
  rounds?: number;
  /** How much the voice says. Standard (default): full guidance for about 30 s, then short cues. */
  guide?: GuideLevel;
}

/**
 * short: only "In… Out… Hold…" from the first second.
 * standard: counting, nostril and body cues for about the first 30 s, then short cues.
 * complete: counting and every cue for the whole session.
 */
export type GuideLevel = "short" | "standard" | "complete";
export const GUIDE_LEVELS: { id: GuideLevel; label: string; hint: string }[] = [
  { id: "short", label: "Short", hint: "Just “In… Out… Hold…” from the start, no counting." },
  { id: "standard", label: "Standard", hint: "Counts you in for the first 30 seconds, then just “In… Out… Hold…”." },
  { id: "complete", label: "Complete", hint: "Counts every breath for the whole session." },
];

/** Full guidance plays for about the first 30 seconds, then the round in progress finishes. */
export const GUIDED_SECONDS = 30;

/** After the opening guidance: one short word per phase, no counting. */
function brief(s: Segment): Segment {
  const say: VoiceClip = s.kind === "in" ? "sin" : s.kind === "hold" ? "shold" : "sout";
  return { ...s, say, count: false, cues: undefined };
}

const GUIDE_KEY = "vidura.breathGuide";
export function loadGuideLevel(): GuideLevel {
  try {
    const v = globalThis.localStorage?.getItem(GUIDE_KEY);
    return v === "short" || v === "complete" ? v : "standard";
  } catch {
    return "standard";
  }
}
export function saveGuideLevel(level: GuideLevel): void {
  try {
    globalThis.localStorage?.setItem(GUIDE_KEY, level);
  } catch {
    /* private mode: the choice just isn't remembered */
  }
}

const repeatUntil = (cycle: Segment[], o: Options): Segment[] => {
  const per = cycle.reduce((s, x) => s + x.secs, 0);
  const n = Math.max(1, Math.round((o.minutes * 60) / per));
  // Rounds that start inside the guidance window are fully spoken; the rest get short cues.
  const level = o.guide ?? "standard";
  const full = (k: number) => level === "complete" || (level === "standard" && k * per < GUIDED_SECONDS);
  return Array.from({ length: n }, (_, k) => (full(k) ? cycle : cycle.map(brief))).flat();
};

function fastProgram(t: Technique, o: Options): Segment[] {
  const rounds = o.rounds ?? 3;
  const out: Segment[] = [];
  const kapal = t.id === "kapalbhati";
  const reps = o.reps ?? (kapal ? 20 : 10);
  for (let r = 1; r <= rounds; r++) {
    out.push({
      kind: "ready",
      secs: kapal ? 5 : 6,
      label: r === 1 ? "Get ready" : r === rounds ? "Last round" : `Round ${r}`,
      say: r === 1 ? (kapal ? "kapal" : "bellows") : r === rounds ? "last" : "ready",
      round: r,
      rounds,
    });
    for (let i = 1; i <= reps; i++) {
      if (kapal) {
        out.push({ kind: "pump", secs: 1, label: "Out", beat: "out", round: r, rounds, rep: i, reps });
      } else {
        out.push({ kind: "in", secs: 1, label: "In", beat: "in", round: r, rounds, rep: i, reps });
        out.push({ kind: "out", secs: 1, label: "Out", beat: "out", round: r, rounds, rep: i, reps });
      }
    }
    out.push({ kind: "rest", secs: r === rounds ? 20 : 30, label: "Rest", say: "rest", round: r, rounds });
  }
  return out;
}

/** The full session, segment by segment. */
export function program(t: Technique, o: Options): Segment[] {
  switch (t.id) {
    case "coherent":
      return repeatUntil(
        [
          { kind: "in", secs: 5.5, label: "Inhale", say: "in", count: true },
          { kind: "out", secs: 5.5, label: "Exhale", say: "out", count: true },
        ],
        o,
      );
    case "nadi-shodhana": {
      const hold: Segment[] = o.hold ? [{ kind: "hold", secs: 4, label: "Gentle hold", say: "hold", count: true }] : [];
      return repeatUntil(
        [
          { kind: "in", secs: 5, label: "In · left nostril", say: "inleft", side: "left", count: true },
          ...hold,
          { kind: "out", secs: 7, label: "Out · right nostril", say: "outright", side: "right", count: true },
          { kind: "in", secs: 5, label: "In · right nostril", say: "inright", side: "right", count: true },
          ...hold,
          { kind: "out", secs: 7, label: "Out · left nostril", say: "outleft", side: "left", count: true },
        ],
        o,
      );
    }
    case "anulom-vilom":
      return repeatUntil(
        [
          { kind: "in", secs: 4, label: "In · left nostril", say: "inleft", side: "left", count: true },
          { kind: "out", secs: 6, label: "Out · right nostril", say: "outright", side: "right", count: true },
          { kind: "in", secs: 4, label: "In · right nostril", say: "inright", side: "right", count: true },
          { kind: "out", secs: 6, label: "Out · left nostril", say: "outleft", side: "left", count: true },
        ],
        o,
      );
    case "bhramari":
      return repeatUntil(
        [
          { kind: "in", secs: 4, label: "Inhale", say: "in", count: true },
          { kind: "out", secs: 8, label: "Hum…", say: "hum", tone: "hum" },
        ],
        o,
      );
    case "ujjayi":
      return repeatUntil(
        [
          { kind: "in", secs: 5, label: "In · ocean sound", say: "in", tone: "ocean" },
          { kind: "out", secs: 7, label: "Out · ocean sound", say: "out", tone: "ocean" },
        ],
        o,
      );
    case "dirga":
      return repeatUntil(
        [
          { kind: "in", secs: 6, label: "Inhale", say: "belly", cues: [[2, "ribs"], [4, "chest"]], part: "belly" },
          { kind: "out", secs: 7, label: "Exhale", say: "out", cues: [[2.5, "ribs"], [5, "belly"]], part: "chest" },
        ],
        o,
      );
    case "kapalbhati":
    case "bhastrika":
      return fastProgram(t, o);
  }
}

export const programSeconds = (segs: readonly Segment[]): number => segs.reduce((s, x) => s + x.secs, 0);

/** Dirga: which part is filling or emptying at a moment in the segment. */
export function dirgaPart(seg: Segment, at: number): "belly" | "ribs" | "chest" {
  const third = seg.secs / 3;
  const i = Math.min(2, Math.floor(at / third));
  return (seg.kind === "in" ? ["belly", "ribs", "chest"] : ["chest", "ribs", "belly"])[i] as "belly" | "ribs" | "chest";
}

// ── Practice times ──────────────────────────────────────────────────────────

/** Recommended practice time for each technique (minutes after midnight). */
export const RECOMMENDED_AT: Record<TechniqueId, number> = {
  kapalbhati: 6 * 60 + 30,
  bhastrika: 6 * 60 + 45,
  "nadi-shodhana": 6 * 60,
  ujjayi: 9 * 60 + 30,
  coherent: 13 * 60 + 45,
  "anulom-vilom": 17 * 60 + 45,
  bhramari: 20 * 60,
  dirga: 21 * 60 + 30,
};

/** Main meals (minutes after midnight): fast techniques wait 2.5 hours after these start. */
const MEALS: [number, number][] = [
  [7 * 60 + 30, 9 * 60 + 30], // breakfast
  [12 * 60 + 30, 14 * 60], // lunch
  [18 * 60 + 30, 19 * 60 + 30], // dinner
];

export function afterMeal(minutes: number): boolean {
  return MEALS.some(([start]) => minutes >= start && minutes < start + 150);
}

/** Before 11:00 and not just after breakfast: when forceful breathing is best. */
const morningEmpty = (minutes: number) => minutes >= 4 * 60 && minutes < 11 * 60 && !afterMeal(minutes);

/** A gentle caution when a fast technique is set for later in the day or after a meal. */
export function timeCaution(t: Technique, minutes: number): string | null {
  if (!t.fast) return null;
  if (minutes >= 17 * 60 || minutes < 4 * 60) return "Fast breathing in the evening can make it harder to fall asleep. Mornings on an empty stomach suit it best.";
  if (afterMeal(minutes)) return "This is soon after a usual mealtime. Leave 2–3 hours after eating, as forceful breathing on a full stomach can cause discomfort.";
  if (!morningEmpty(minutes) && t.id === "kapalbhati") return "Kapalbhati suits the morning, on an empty stomach, best.";
  return null;
}

/** Minutes between two clock times, the short way round. */
const gap = (a: number, b: number) => {
  const d = Math.abs(a - b) % 1440;
  return Math.min(d, 1440 - d);
};

// ── Suggestions ─────────────────────────────────────────────────────────────

/**
 * Can a fast (forceful) technique be suggested right now? Never for a blood-pressure or
 * fertility focus. Otherwise in the morning on an empty stomach, or within an hour of
 * a practice time the person chose themselves.
 */
export function fastAllowed(t: Technique, minutes: number, categories: readonly CategoryId[], chosenAt?: number): boolean {
  if (!t.fast) return true;
  if (categories.includes("bp") || categories.includes("fertility")) return false;
  if (chosenAt !== undefined && chosenAt !== RECOMMENDED_AT[t.id] && gap(chosenAt, minutes) <= 60) return true;
  return morningEmpty(minutes);
}

/**
 * One technique for this moment: close to its practice time (the person's own, or the
 * recommended one) and safe for their focus areas.
 * Scores: within 45 min of its time +6 (+8 more if the person set that time), within 2 h +3, a good part of the day for it +2,
 * each matching focus +2 (max 3), a BP, hormonal or fertility focus prefers Coherent and
 * Bhramari (+4), done today −50, already in today's plan −20, plus a small daily rotation.
 */
export function suggestTechnique(opts: {
  minutes: number;
  phase: PhaseId;
  categories: readonly CategoryId[];
  doneToday: ReadonlySet<string>;
  exclude?: readonly TechniqueId[];
  day: number;
  times?: Partial<Record<TechniqueId, number>>;
}): Technique {
  const { minutes, phase, categories, doneToday, exclude = [], day, times = {} } = opts;
  const calmFirst = categories.some((c) => c === "bp" || c === "hormonal" || c === "fertility");
  const scored = TECHNIQUES.filter((t) => fastAllowed(t, minutes, categories, times[t.id])).map((t, i) => {
    const at = times[t.id] ?? RECOMMENDED_AT[t.id];
    const g = gap(at, minutes);
    let s = g <= 45 ? 6 : g <= 120 ? 3 : 0;
    if (times[t.id] !== undefined && g <= 45) s += 8; // the person chose this time themselves
    if (t.phases.includes(phase)) s += 2;
    s += Math.min(3, categories.filter((c) => t.goodFor.includes(c)).length) * 2;
    if (calmFirst && (t.id === "coherent" || t.id === "bhramari")) s += 4;
    if (doneToday.has(breathLogId(t.id))) s -= 50;
    if (exclude.includes(t.id)) s -= 20;
    s += ((day * 7 + i * 13) % 10) / 20; // 0–0.45: rotates equal options across days
    return { t, s };
  });
  scored.sort((a, b) => b.s - a.s);
  return scored[0]?.t ?? TECHNIQUES[0];
}

/** The id a finished technique session is logged under. */
export const breathLogId = (id: TechniqueId) => `breath-${id}`;

// ── Saved on this device ────────────────────────────────────────────────────
const TIMES_KEY = "vidura.breathTimes";

export function loadBreathTimes(): Partial<Record<TechniqueId, number>> {
  try {
    const o = JSON.parse(localStorage.getItem(TIMES_KEY) || "{}");
    const out: Partial<Record<TechniqueId, number>> = {};
    for (const t of TECHNIQUES) {
      const v = o[t.id];
      if (typeof v === "number" && v >= 0 && v < 1440) out[t.id] = Math.round(v);
    }
    return out;
  } catch {
    return {};
  }
}

/** Save a practice time, or pass null to go back to the recommended time. */
export function saveBreathTime(id: TechniqueId, minutes: number | null): Partial<Record<TechniqueId, number>> {
  const all = loadBreathTimes();
  if (minutes === null || minutes === RECOMMENDED_AT[id]) delete all[id];
  else all[id] = minutes;
  try {
    localStorage.setItem(TIMES_KEY, JSON.stringify(all));
    (globalThis as { dispatchEvent?: (e: Event) => boolean }).dispatchEvent?.(new Event("vidura:breath-times"));
  } catch {
    /* ignore */
  }
  return all;
}

export const toHHMM = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
export const fromHHMM = (v: string): number | null => {
  const m = /^(\d{1,2}):(\d{2})/.exec(v);
  if (!m) return null;
  const n = Number(m[1]) * 60 + Number(m[2]);
  return n >= 0 && n < 1440 ? n : null;
};

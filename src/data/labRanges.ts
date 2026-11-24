/**
 * "Your numbers": educational reference ranges for each condition guide,
 * personalised by sex (from the Health notes setting) and an optional age band.
 *
 * These are widely used guideline cut-offs (sources listed per guide), rounded for
 * reading at a glance. They are not a diagnosis, and every lab prints its own
 * reference range, which always wins.
 */
import type { AudienceId } from "./content";

// ── Who the ranges are for ──────────────────────────────────────────────────
export type Sex = "male" | "female";
export type AgeBandId = "18-29" | "30-34" | "35-39" | "40-44" | "45-49" | "50-54" | "55-59" | "60-69" | "70+";

export const AGE_BANDS: readonly { id: AgeBandId; label: string; from: number; to: number }[] = [
  { id: "18-29", label: "18–29", from: 18, to: 29 },
  { id: "30-34", label: "30–34", from: 30, to: 34 },
  { id: "35-39", label: "35–39", from: 35, to: 39 },
  { id: "40-44", label: "40–44", from: 40, to: 44 },
  { id: "45-49", label: "45–49", from: 45, to: 49 },
  { id: "50-54", label: "50–54", from: 50, to: 54 },
  { id: "55-59", label: "55–59", from: 55, to: 59 },
  { id: "60-69", label: "60–69", from: 60, to: 69 },
  { id: "70+", label: "70+", from: 70, to: 85 },
];

export interface Person {
  sex: Sex | null;
  age: AgeBandId | null;
}

export const sexFromAudience = (a: AudienceId): Sex | null => (a === "men" ? "male" : a === "women" ? "female" : null);
export const audienceFromSex = (s: Sex | null): AudienceId => (s === "male" ? "men" : s === "female" ? "women" : "everyone");

const band = (p: Person) => AGE_BANDS.find((b) => b.id === p.age) ?? null;

/** "For a man aged 35–39", "For a woman", "For adults aged 50–54", "For adults". */
export function personLabel(p: Person): string {
  const who = p.sex === "male" ? "a man" : p.sex === "female" ? "a woman" : "adults";
  const b = band(p);
  return `For ${who}${b ? ` aged ${b.label}` : ""}`;
}

// ── Shapes ──────────────────────────────────────────────────────────────────
/** good = where you want to be · ok = fine / mild · watch = act on it · high = see a doctor · urgent = act now */
export type Tone = "good" | "ok" | "watch" | "high" | "urgent";

export interface Band {
  label: string;
  range: string;
  meaning: string;
  tone: Tone;
}

export interface LabTest {
  name: string;
  /** How it's measured: sample, timing, units. */
  how: string;
  bands: Band[];
  /** A personalised line ("For a man aged 35–39: …"), when there is something specific to say. */
  forYou?: string;
}

export interface GuideNumbers {
  tests: LabTest[];
  /** How to read the report: 2 to 4 short lines. */
  read: string[];
  sources: { label: string; url: string }[];
}

export const RANGES_NOTE =
  "Educational reference ranges, not a diagnosis. Labs differ: always use the reference range printed on your own report, and go through results with your doctor.";

// ── Helpers ─────────────────────────────────────────────────────────────────
const isMale = (p: Person) => p.sex === "male";
const isFemale = (p: Person) => p.sex === "female";
const ageFrom = (p: Person) => band(p)?.from ?? null;
const ageMid = (p: Person) => {
  const b = band(p);
  return b ? Math.round((b.from + b.to) / 2) : null;
};

// ── Per guide ───────────────────────────────────────────────────────────────
type Builder = (p: Person) => GuideNumbers;

const cholesterol: Builder = (p) => {
  const a = ageFrom(p);
  const hdlLow = isMale(p) ? "Under 40" : isFemale(p) ? "Under 50" : "Under 40 (men), under 50 (women)";
  const hdlMid = isMale(p) ? "40–59" : isFemale(p) ? "50–59" : "40–59 (men), 50–59 (women)";
  return {
    tests: [
      {
        name: "LDL cholesterol (the 'bad' one)",
        how: "Lipid profile blood test, mg/dL. Fasting not usually needed.",
        bands: [
          { label: "Optimal", range: "Under 100", meaning: "Where you want to be.", tone: "good" },
          { label: "Near / above optimal", range: "100–129", meaning: "Fine for most people without other risks.", tone: "ok" },
          { label: "Borderline high", range: "130–159", meaning: "Time for diet, exercise and a risk check.", tone: "watch" },
          { label: "High", range: "160–189", meaning: "Talk to your doctor about treatment.", tone: "high" },
          { label: "Very high", range: "190 and above", meaning: "Often inherited. Usually needs a statin, whatever your other risks.", tone: "urgent" },
        ],
        forYou:
          a === null
            ? "With diabetes, aim under 70; after a heart attack or stroke, under 55. Your doctor sets your personal target."
            : a < 40
              ? `${personLabel(p)}: aim under 100. Risk builds over decades, so an LDL of 160 or more is worth acting on now, even if you feel well. With diabetes, aim under 70.`
              : `${personLabel(p)}: aim under 100, or under 70 with diabetes or other risks. From 40, your doctor also estimates your 10-year heart risk (age, blood pressure, smoking, diabetes), which can lower your target.`,
      },
      {
        name: "HDL cholesterol (the 'good' one)",
        how: "Same lipid profile, mg/dL. Higher is better.",
        bands: [
          { label: "Low", range: hdlLow, meaning: "A heart-risk factor. Exercise and stopping smoking raise it.", tone: "watch" },
          { label: "Acceptable", range: hdlMid, meaning: "Typical.", tone: "ok" },
          { label: "Protective", range: "60 and above", meaning: "Counts in your favour.", tone: "good" },
        ],
      },
      {
        name: "Triglycerides",
        how: "Same lipid profile, mg/dL. Most accurate after a 9–12 hour fast.",
        bands: [
          { label: "Normal", range: "Under 150", meaning: "Where you want to be.", tone: "good" },
          { label: "Borderline high", range: "150–199", meaning: "Cut sugar, refined carbs and alcohol.", tone: "watch" },
          { label: "High", range: "200–499", meaning: "Often goes with insulin resistance; see your doctor.", tone: "high" },
          { label: "Very high", range: "500 and above", meaning: "Risk of pancreatitis: see your doctor soon.", tone: "urgent" },
        ],
      },
      {
        name: "Total cholesterol",
        how: "Same lipid profile, mg/dL.",
        bands: [
          { label: "Desirable", range: "Under 200", meaning: "Read it together with LDL and HDL.", tone: "good" },
          { label: "Borderline high", range: "200–239", meaning: "Look at LDL to decide.", tone: "watch" },
          { label: "High", range: "240 and above", meaning: "Usually means a high LDL too.", tone: "high" },
        ],
      },
    ],
    read: [
      "Look at LDL first: it drives treatment decisions. Total cholesterol alone can mislead (a high HDL pushes it up).",
      "Reports in mmol/L? Multiply cholesterol values by 38.67, and triglycerides by 88.57, to compare with these mg/dL numbers.",
      "LDL is usually calculated. If triglycerides are over 400, ask for a direct LDL.",
      "One high result: recheck after 6 to 12 weeks of changes before starting medicine, unless LDL is 190 or more.",
    ],
    sources: [
      { label: "NCEP Adult Treatment Panel III report (Circulation, 2002)", url: "https://pubmed.ncbi.nlm.nih.gov/12485966/" },
      { label: "2018 AHA/ACC Guideline on the Management of Blood Cholesterol", url: "https://pubmed.ncbi.nlm.nih.gov/30586774/" },
      { label: "Lipid Association of India 2023 update", url: "https://pubmed.ncbi.nlm.nih.gov/38485619/" },
    ],
  };
};

const sugar: Builder = (p) => {
  const a = ageFrom(p);
  const target =
    a !== null && a >= 60
      ? "with diabetes, under 7 to 7.5% is a common target at your age, or under 8% with other serious illness or low-sugar episodes."
      : "with diabetes, most adults aim for under 7%.";
  const screen =
    a === null
      ? ""
      : a >= 35
        ? " Test at least every 3 years, or every year if you've had prediabetes."
        : " South Asians develop diabetes younger and at lower weights: test now if your BMI is 23 or more, or diabetes runs in your family.";
  return {
    tests: [
      {
        name: "HbA1c",
        how: "Blood test, %. Your average sugar over about 3 months. No fasting.",
        bands: [
          { label: "Normal", range: "Under 5.7%", meaning: "Where you want to be.", tone: "good" },
          { label: "Prediabetes", range: "5.7–6.4%", meaning: "High risk, and the best time to reverse it.", tone: "watch" },
          { label: "Diabetes", range: "6.5% and above", meaning: "Confirmed with a second test.", tone: "high" },
        ],
        forYou: `${personLabel(p)}: ${target}${screen}`,
      },
      {
        name: "Fasting plasma glucose",
        how: "Blood test after 8+ hours without food, mg/dL.",
        bands: [
          { label: "Low", range: "Under 70", meaning: "Too low if you have symptoms; ask your doctor.", tone: "watch" },
          { label: "Normal", range: "70–99", meaning: "Where you want to be.", tone: "good" },
          { label: "Prediabetes", range: "100–125", meaning: "Impaired fasting glucose (WHO and many Indian labs start this at 110).", tone: "watch" },
          { label: "Diabetes", range: "126 and above", meaning: "On two separate tests.", tone: "high" },
        ],
      },
      {
        name: "2-hour glucose tolerance test (OGTT)",
        how: "Blood test 2 hours after a 75 g glucose drink, mg/dL.",
        bands: [
          { label: "Normal", range: "Under 140", meaning: "Where you want to be.", tone: "good" },
          { label: "Prediabetes", range: "140–199", meaning: "Impaired glucose tolerance.", tone: "watch" },
          { label: "Diabetes", range: "200 and above", meaning: "Confirmed with a second test.", tone: "high" },
        ],
        forYou: isFemale(p) ? "Pregnancy uses lower, different cut-offs: the gestational diabetes test is done at 24 to 28 weeks." : undefined,
      },
    ],
    read: [
      "HbA1c shows your 3-month average; fasting glucose is a one-morning snapshot. Doctors use both.",
      "Anaemia, iron deficiency and some haemoglobin variants (common in South Asia) can make HbA1c read falsely high or low. If it disagrees with your glucose, ask why.",
      "Reports in mmol/L? Divide mg/dL by 18 (100 mg/dL = 5.6 mmol/L, 126 = 7.0).",
    ],
    sources: [
      { label: "ADA Standards of Care 2025: Diagnosis and Classification of Diabetes", url: "https://pubmed.ncbi.nlm.nih.gov/39651986/" },
    ],
  };
};

const bp: Builder = (p) => {
  const a = ageFrom(p);
  return {
    tests: [
      {
        name: "Blood pressure",
        how: "Upper-arm cuff, mmHg, after 5 minutes seated. Written top/bottom, e.g. 128/82.",
        bands: [
          { label: "Normal", range: "Under 120 and under 80", meaning: "Where you want to be.", tone: "good" },
          { label: "Elevated", range: "120–129 and under 80", meaning: "Lifestyle changes now.", tone: "ok" },
          { label: "Stage 1", range: "130–139 or 80–89", meaning: "Lifestyle, plus medicine if your heart risk is high.", tone: "watch" },
          { label: "Stage 2", range: "140+ or 90+", meaning: "Usually needs medicine as well.", tone: "high" },
          { label: "Severe", range: "180+ or 120+", meaning: "Rest and recheck. With chest pain, breathlessness, weakness or vision change, get emergency care.", tone: "urgent" },
        ],
        forYou:
          a === null
            ? "With treatment, most adults aim for under 130/80."
            : a >= 60
              ? `${personLabel(p)}: most guidelines still aim for under 130/80 if you feel well on it. Stand up slowly, as dizziness on standing is more common at this age.`
              : `${personLabel(p)}: aim for under 120/80. ${a >= 40 ? "Check every year." : "Check at least every 2 to 3 years, and every year if it's 120 or more."}`,
      },
    ],
    read: [
      "Use whichever number puts you in the higher group: 128/85 is stage 1 because of the 85.",
      "One clinic reading is not a diagnosis; nerves push it up. Average home readings: two in the morning and two in the evening for 7 days.",
      "European and Indian guidance diagnose hypertension at 140/90 in the clinic, or 135/85 as a home average; the 2025 US guideline starts earlier, at 130/80.",
    ],
    sources: [
      { label: "AHA/ACC: 2025 High Blood Pressure Guideline, top things to know", url: "https://professional.heart.org/en/science-news/2025-high-blood-pressure-guideline" },
    ],
  };
};

const inflammation: Builder = (p) => {
  const mid = ageMid(p);
  const esrUpper = (sex: Sex, age: number) => Math.round(sex === "male" ? age / 2 : (age + 10) / 2);
  const esrRange =
    mid !== null && p.sex
      ? `Up to about ${esrUpper(p.sex, mid)}`
      : mid !== null
        ? `Up to about ${esrUpper("male", mid)} (men), ${esrUpper("female", mid)} (women)`
        : "Up to about age ÷ 2 (men), (age + 10) ÷ 2 (women)";
  return {
    tests: [
      {
        name: "hs-CRP (high-sensitivity C-reactive protein)",
        how: "Blood test, mg/L. Take it when you've been well for 2 weeks.",
        bands: [
          { label: "Low", range: "Under 1", meaning: "Low inflammation; lower heart risk.", tone: "good" },
          { label: "Average", range: "1–3", meaning: "Typical. Weight, activity and sleep move it.", tone: "ok" },
          { label: "High", range: "Over 3", meaning: "Low-grade inflammation and higher heart risk. Repeat to confirm.", tone: "watch" },
          { label: "Very high", range: "Over 10", meaning: "Usually an infection or injury, not lifestyle. Repeat in 2 weeks.", tone: "high" },
        ],
      },
      {
        name: "ESR (sed rate)",
        how: "Blood test, mm/hr. Rises slowly with age, and is higher in women.",
        bands: [
          { label: "Normal", range: esrRange, meaning: "No sign of significant inflammation.", tone: "good" },
          { label: "Raised", range: "Above that", meaning: "Not specific: infection, arthritis, anaemia and more. Your doctor looks for the cause.", tone: "watch" },
        ],
        forYou: mid !== null ? `${personLabel(p)}: the normal upper limit is worked out from age and sex, as shown.` : undefined,
      },
    ],
    read: [
      "These tests say how much inflammation there is, not where. They're clues for your doctor, not a diagnosis.",
      "A cold, dental infection, injury or a hard workout spikes CRP for days. Average two results taken 2 weeks apart.",
      "hs-CRP and ordinary CRP measure the same protein; hs-CRP just reads the low range precisely.",
    ],
    sources: [
      { label: "Pearson et al., CDC/AHA statement on markers of inflammation (Circulation, 2003)", url: "https://pubmed.ncbi.nlm.nih.gov/12551878/" },
    ],
  };
};

const bodyAches: Builder = (p) => {
  const fer = isMale(p) ? "30–400" : isFemale(p) ? "30–150" : "30–400 (men), 30–150 (women)";
  return {
    tests: [
      {
        name: "Vitamin D (25-hydroxy)",
        how: "Blood test, ng/mL (nmol/L ÷ 2.5).",
        bands: [
          { label: "Deficient", range: "Under 12", meaning: "Treat; can cause bone and muscle pain.", tone: "high" },
          { label: "Inadequate", range: "12–19", meaning: "Top up with sun, food or a modest supplement.", tone: "watch" },
          { label: "Adequate", range: "20–50", meaning: "Enough for bones and muscles. Some labs flag under 30.", tone: "good" },
          { label: "High", range: "51–100", meaning: "More than needed; no extra benefit.", tone: "ok" },
          { label: "Too high", range: "Over 100", meaning: "Risk of toxicity: stop supplements and see your doctor.", tone: "urgent" },
        ],
      },
      {
        name: "Vitamin B12",
        how: "Blood test, pg/mL.",
        bands: [
          { label: "Low", range: "Under 200", meaning: "Deficient. Can cause tingling, weakness and tiredness.", tone: "high" },
          { label: "Borderline", range: "200–300", meaning: "Ask for MMA or homocysteine to confirm.", tone: "watch" },
          { label: "Normal", range: "Over 300", meaning: "Fine.", tone: "good" },
        ],
        forYou: "Vegetarians, vegans and anyone on metformin or acid-reducing tablets run low more often.",
      },
      {
        name: "Ferritin (iron stores)",
        how: "Blood test, ng/mL.",
        bands: [
          { label: "Low", range: "Under 30", meaning: "Iron deficiency is likely, even if haemoglobin is normal.", tone: "watch" },
          { label: "Typical", range: fer, meaning: "Normal stores.", tone: "good" },
          { label: "High", range: "Above that", meaning: "Inflammation, liver disease or iron overload. Your doctor checks why.", tone: "watch" },
        ],
        forYou: isFemale(p) ? `${personLabel(p)}: heavy periods are the most common cause of low ferritin.` : undefined,
      },
      {
        name: "CK (creatine kinase), if on a statin with muscle pain",
        how: "Blood test, U/L. Compared with your lab's upper limit (ULN).",
        bands: [
          { label: "Normal", range: "Within lab range", meaning: "Pain is unlikely to be muscle damage.", tone: "good" },
          { label: "Mildly raised", range: "Up to 4× ULN", meaning: "Often from exercise; recheck after rest.", tone: "ok" },
          { label: "Raised", range: "4–10× ULN", meaning: "Your doctor may pause or change the statin.", tone: "watch" },
          { label: "Very high", range: "Over 10× ULN", meaning: "Stop the statin and see your doctor the same day.", tone: "urgent" },
        ],
      },
    ],
    read: [
      "Test vitamin D, B12, ferritin and TSH (see the Thyroid guide) in one blood draw, and treat only what's low.",
      "Ferritin rises with inflammation, so a 'normal' ferritin alongside a high CRP can hide iron deficiency.",
      "Avoid hard exercise for 2 days before a CK test; it raises CK on its own.",
    ],
    sources: [
      { label: "IOM 2011 Dietary Reference Intakes for calcium and vitamin D", url: "https://pubmed.ncbi.nlm.nih.gov/21118827/" },
      { label: "Stroes et al., Statin-associated muscle symptoms: EAS consensus (2015)", url: "https://pubmed.ncbi.nlm.nih.gov/25694464/" },
    ],
  };
};

const hormonal: Builder = (p) => {
  const a = ageFrom(p);
  const men: LabTest[] = [
    {
      name: isMale(p) ? "Total testosterone" : "Men: total testosterone",
      how: "Blood test between 7 and 10 am, ideally fasting, ng/dL (nmol/L × 28.8).",
      bands: [
        { label: "Low", range: "Under 264", meaning: "Repeat on another morning; low twice plus symptoms is low testosterone.", tone: "watch" },
        { label: "Normal", range: "264–916", meaning: "Healthy range for adult men.", tone: "good" },
        { label: "High", range: "Over 916", meaning: "Usually from supplements or injections.", tone: "watch" },
      ],
      forYou:
        isMale(p) && a !== null
          ? a >= 50
            ? `${personLabel(p)}: levels drift down about 1% a year after 40, so values sit lower at your age. Treatment is only for a confirmed low result plus symptoms.`
            : `${personLabel(p)}: a low result at your age is usually weight, sleep, alcohol or medicines; fixing those often restores it.`
          : undefined,
    },
  ];
  const women: LabTest[] = [
    {
      name: isFemale(p) ? "Testosterone and LH:FSH (PCOS check)" : "Women: testosterone and LH:FSH (PCOS check)",
      how: "Blood tests on day 2 to 5 of the cycle where possible.",
      bands: [
        { label: "Testosterone", range: "Above the lab's female range", meaning: "High androgens, one of the PCOS criteria.", tone: "watch" },
        { label: "LH:FSH ratio", range: "Above 2", meaning: "Supportive only; not used to diagnose PCOS.", tone: "ok" },
        { label: "Cycle length", range: "21–35 days", meaning: "Normal. Shorter or longer most months is 'irregular'.", tone: "good" },
      ],
      forYou:
        isFemale(p) && a !== null && a >= 45
          ? `${personLabel(p)}: irregular cycles and changing FSH usually mean perimenopause rather than a hormone disorder.`
          : "PCOS has no single number: it needs 2 of 3 (irregular cycles, high androgens, polycystic ovaries on scan).",
    },
    {
      name: isFemale(p) ? "Prolactin" : "Women: prolactin",
      how: "Blood test, ng/mL, not pregnant or breastfeeding.",
      bands: [
        { label: "Normal", range: "Under 25", meaning: "Fine.", tone: "good" },
        { label: "Raised", range: "25–100", meaning: "Repeat; stress, some medicines and thyroid problems raise it.", tone: "watch" },
        { label: "High", range: "Over 100", meaning: "See your doctor; a pituitary scan may be needed.", tone: "high" },
      ],
    },
  ];
  return {
    tests: isMale(p) ? men : isFemale(p) ? women : [...women, ...men],
    read: [
      "Hormones swing through the day and the cycle, so timing matters: morning for testosterone, early cycle for women's tests.",
      "One abnormal value is repeated before anything is treated.",
      "Thyroid results (TSH) are covered in the Thyroid guide.",
    ],
    sources: [
      { label: "Travison et al., Harmonized reference ranges for testosterone in men (JCEM, 2017)", url: "https://pubmed.ncbi.nlm.nih.gov/28324103/" },
      { label: "Bhasin et al., Endocrine Society testosterone therapy guideline (2018)", url: "https://pubmed.ncbi.nlm.nih.gov/29562364/" },
      { label: "Teede et al., 2023 International PCOS Guideline", url: "https://pubmed.ncbi.nlm.nih.gov/37580861/" },
    ],
  };
};

const thyroid: Builder = (p) => {
  const a = ageFrom(p);
  const upper = a === null ? 4.0 : a >= 70 ? 7.0 : a >= 60 ? 5.0 : 4.0;
  const u = upper.toFixed(1);
  return {
    tests: [
      {
        name: "TSH (thyroid-stimulating hormone)",
        how: "Blood test, mIU/L. The first and most useful thyroid test.",
        bands: [
          { label: "Very low", range: "Under 0.1", meaning: "With high free T4/T3: overactive thyroid.", tone: "high" },
          { label: "Low", range: "0.1–0.39", meaning: "Recheck with free T4; may be mildly overactive.", tone: "watch" },
          { label: "Typical", range: `0.4–${u}`, meaning: "Normal thyroid function.", tone: "good" },
          { label: "Raised", range: `${u}–10`, meaning: "With normal free T4: subclinical (mild) underactive. Recheck in 6–12 weeks with anti-TPO.", tone: "watch" },
          { label: "High", range: "Over 10", meaning: "Underactive thyroid; usually treated.", tone: "high" },
        ],
        forYou:
          a !== null && a >= 60
            ? `${personLabel(p)}: TSH naturally drifts up with age, so up to about ${u} can be normal now. Mildly raised values are often watched rather than treated.`
            : isFemale(p)
              ? `${personLabel(p)}: planning a pregnancy or pregnant? Trimester-specific ranges apply, and if you're on levothyroxine most doctors aim for TSH under 2.5 before conceiving.`
              : a !== null
                ? `${personLabel(p)}: typical range 0.4–4.0. On levothyroxine, most adults are kept around 0.5–2.5.`
                : undefined,
      },
      {
        name: "Free T4",
        how: "Blood test, ng/dL (pmol/L ÷ 12.9). Checked when TSH is out of range.",
        bands: [
          { label: "Low", range: "Under 0.8", meaning: "With high TSH: underactive thyroid.", tone: "high" },
          { label: "Normal", range: "0.8–1.8", meaning: "Normal hormone level.", tone: "good" },
          { label: "High", range: "Over 1.8", meaning: "With low TSH: overactive thyroid.", tone: "high" },
        ],
      },
      {
        name: "Anti-TPO antibodies",
        how: "Blood test, IU/mL. Done once, usually when TSH is mildly high.",
        bands: [
          { label: "Negative", range: "Below lab cut-off (often under 35)", meaning: "No sign of autoimmune thyroid disease.", tone: "good" },
          { label: "Positive", range: "Above cut-off", meaning: "Hashimoto's: higher chance of becoming underactive over the years. Check TSH yearly.", tone: "watch" },
        ],
      },
    ],
    read: [
      "Read TSH first. It moves the opposite way to your thyroid: high TSH means underactive, low TSH means overactive.",
      "Stop biotin (hair and skin supplements) 2 to 3 days before the test; it can make results look overactive. Test at the same lab each time.",
      "On levothyroxine: recheck 6 to 8 weeks after any dose change, and take the tablet after the blood draw that morning.",
      "Illness, recent iodine-contrast scans and some medicines shift results temporarily, so one odd value is rechecked, not treated.",
    ],
    sources: [
      { label: "Garber et al., AACE/ATA hypothyroidism guidelines (2012)", url: "https://pubmed.ncbi.nlm.nih.gov/23246686/" },
      { label: "Surks & Hollowell, Age-specific distribution of TSH (JCEM, 2007)", url: "https://pubmed.ncbi.nlm.nih.gov/17911171/" },
      { label: "Alexander et al., ATA thyroid disease in pregnancy guidelines (2017)", url: "https://pubmed.ncbi.nlm.nih.gov/28056690/" },
    ],
  };
};

/** Rough typical AMH (ng/mL) by age: [low end, high end] of the middle range. */
function amhTypical(age: number): [number, number] {
  if (age < 30) return [1.5, 6.0];
  if (age < 35) return [1.3, 4.5];
  if (age < 40) return [1.0, 3.0];
  if (age < 45) return [0.3, 1.5];
  return [0, 0.5];
}

const fertility: Builder = (p) => {
  const a = ageFrom(p);
  const men: LabTest = {
    name: isMale(p) ? "Semen analysis" : "Men: semen analysis",
    how: "After 2 to 7 days without ejaculation; sample reaches the lab within an hour. WHO 2021 lower reference limits.",
    bands: [
      { label: "Volume", range: "1.4 mL or more", meaning: "Less can mean a collection or duct problem.", tone: "good" },
      { label: "Concentration", range: "16 million/mL or more", meaning: "Sperm count per millilitre.", tone: "good" },
      { label: "Total count", range: "39 million or more", meaning: "Per ejaculate.", tone: "good" },
      { label: "Total motility", range: "42% or more", meaning: "Sperm that move at all.", tone: "good" },
      { label: "Progressive motility", range: "30% or more", meaning: "Sperm that swim forward.", tone: "good" },
      { label: "Normal forms", range: "4% or more", meaning: "Most sperm look abnormal even in fertile men.", tone: "good" },
    ],
    forYou:
      isMale(p) && a !== null
        ? a >= 40
          ? `${personLabel(p)}: sperm quality and DNA quality decline gradually after 40, so don't wait long to test if you're trying.`
          : `${personLabel(p)}: if you've been trying for a year (6 months if your partner is 35+), test at the same time as your partner.`
        : undefined,
  };
  const [lo, hi] = a !== null ? amhTypical(a) : [1.5, 4.0];
  const amhTypicalText = a !== null && a >= 45 ? "Under 0.5 is usual" : `About ${lo}–${hi}`;
  const women: LabTest[] = [
    {
      name: isFemale(p) ? "AMH (egg reserve)" : "Women: AMH (egg reserve)",
      how: "Blood test any day of the cycle, ng/mL (pmol/L ÷ 7.14). Falls with age.",
      bands: [
        a !== null && a >= 45
          ? { label: "Very low", range: "Under 0.1", meaning: "Usually means menopause is near.", tone: "watch" }
          : a !== null && a >= 40
            ? { label: "Low for your age", range: "Under 0.3", meaning: "Fewer eggs in reserve; see a fertility doctor soon.", tone: "watch" }
            : { label: "Low", range: "Under 1.0", meaning: "Fewer eggs in reserve; natural conception is still possible.", tone: "watch" },
        { label: a !== null ? "Typical for your age" : "Typical (early 30s)", range: amhTypicalText, meaning: "Expected range.", tone: "good" },
        { label: "High", range: "Over 4–5", meaning: "May suggest PCOS (fits with irregular cycles).", tone: "ok" },
      ],
      forYou:
        isFemale(p) && a !== null
          ? a < 35
            ? `${personLabel(p)}: see a doctor after 12 months of trying, or sooner with irregular cycles.`
            : a < 40
              ? `${personLabel(p)}: see a doctor after 6 months of trying.`
              : `${personLabel(p)}: see a fertility doctor before or as soon as you start trying.`
          : undefined,
    },
    {
      name: isFemale(p) ? "FSH on day 2–5 of the cycle" : "Women: FSH on day 2–5",
      how: "Blood test, IU/L.",
      bands: [
        { label: "Normal", range: "Under 10", meaning: "Fine.", tone: "good" },
        { label: "Borderline", range: "10–15", meaning: "Reserve may be falling.", tone: "watch" },
        { label: "High", range: "Over 15", meaning: "Reduced egg reserve.", tone: "high" },
      ],
    },
  ];
  return {
    tests: isMale(p) ? [men] : isFemale(p) ? women : [...women, men],
    read: [
      ...(isMale(p) ? [] : ["AMH predicts how many eggs IVF can collect, not whether you can conceive naturally. FSH is read on day 2 to 5 of the cycle only."]),
      ...(isFemale(p)
        ? ["Test both partners together: in about a third of couples the cause is on the man's side."]
        : [
            "Semen results vary a lot from one sample to the next: one low result is repeated after about 3 months.",
            "Results above the WHO limits don't guarantee fertility, and results below them don't mean you can't conceive.",
          ]),
    ],
    sources: [
      ...(isFemale(p) ? [] : [{ label: "Björndahl et al., The sixth edition of the WHO semen manual (Fertil Steril, 2022)", url: "https://pubmed.ncbi.nlm.nih.gov/34986984/" }]),
      ...(isMale(p) ? [] : [{ label: "Seifer et al., Age-specific AMH values for 17,120 women (Fertil Steril, 2011)", url: "https://pubmed.ncbi.nlm.nih.gov/21074758/" }]),
    ],
  };
};

const gut: Builder = (p) => {
  const a = ageFrom(p);
  const hb = isMale(p) ? "Under 13" : isFemale(p) ? "Under 12" : "Under 13 (men), under 12 (women)";
  return {
    tests: [
      {
        name: "Faecal calprotectin",
        how: "Stool test, µg/g. Separates gut inflammation (like IBD) from IBS.",
        bands: [
          { label: "Normal", range: "Under 50", meaning: "Fits IBS; inflammatory bowel disease unlikely.", tone: "good" },
          { label: "Borderline", range: "50–200", meaning: "Repeat in 2–6 weeks, off painkillers like ibuprofen.", tone: "watch" },
          { label: "Raised", range: "Over 200", meaning: "See a gastroenterologist; colonoscopy may be needed.", tone: "high" },
        ],
      },
      {
        name: "Stool habits",
        how: "Your own tracking for 2 weeks. Bristol stool chart types 1–7.",
        bands: [
          { label: "Frequency", range: "3 a week to 3 a day", meaning: "All normal.", tone: "good" },
          { label: "Bristol types 3–4", range: "Smooth sausage", meaning: "Ideal.", tone: "good" },
          { label: "Types 1–2", range: "Hard lumps", meaning: "Constipation: more fibre and water.", tone: "watch" },
          { label: "Types 6–7", range: "Mushy or watery", meaning: "Diarrhoea: see a doctor if it lasts over 2 weeks.", tone: "watch" },
        ],
      },
      {
        name: "Haemoglobin",
        how: "Blood count, g/dL.",
        bands: [
          { label: "Anaemia", range: hb, meaning: "With gut symptoms, a red flag to investigate.", tone: "high" },
          { label: "Normal", range: "Above that", meaning: "Fine.", tone: "good" },
        ],
      },
    ],
    read: [
      "IBS is diagnosed by symptoms once tests like these are normal; there's no single IBS test.",
      "Coeliac blood tests (tTG-IgA) only work while you're still eating gluten.",
      a !== null && a >= 45
        ? `${personLabel(p)}: bowel cancer screening is recommended from 45. New bowel changes at your age always need a doctor.`
        : "New bowel changes after 45, blood in the stool or weight loss always need a doctor.",
    ],
    sources: [
      { label: "ACG Clinical Guideline: Management of IBS (2021)", url: "https://pubmed.ncbi.nlm.nih.gov/33315591/" },
    ],
  };
};

const hair: Builder = (p) => {
  const mid = ageMid(p);
  const share = mid !== null ? Math.min(80, Math.max(10, Math.round(mid))) : null;
  const men: LabTest = {
    name: isMale(p) ? "Norwood stage (men's pattern)" : "Men: Norwood stage",
    how: "Look in a mirror with a second mirror for the crown, in the same light each time.",
    bands: [
      { label: "Stage 1", range: "No recession", meaning: "Adolescent hairline.", tone: "good" },
      { label: "Stage 2", range: "Slight temple recession", meaning: "A normal adult hairline; not balding.", tone: "good" },
      { label: "Stage 3", range: "Deeper temples (or crown, 3V)", meaning: "The earliest stage counted as balding. Best time to start treatment.", tone: "watch" },
      { label: "Stages 4–5", range: "Temples and crown widen", meaning: "Treatment still keeps and regrows a lot.", tone: "high" },
      { label: "Stages 6–7", range: "Only a band at the sides and back", meaning: "Medicines keep what's left; a transplant restores the front.", tone: "high" },
    ],
    forYou:
      isMale(p) && share !== null
        ? `${personLabel(p)}: roughly ${share}% of men your age have some pattern loss. The earlier treatment starts, the more hair you keep.`
        : undefined,
  };
  const women: LabTest = {
    name: isFemale(p) ? "Ludwig grade (women's pattern)" : "Women: Ludwig grade",
    how: "Look at your parting from above.",
    bands: [
      { label: "Grade I", range: "Slightly wider parting", meaning: "Early; treatment works best now.", tone: "watch" },
      { label: "Grade II", range: "Clearly wider, thinner on top", meaning: "See a dermatologist.", tone: "high" },
      { label: "Grade III", range: "See-through on top", meaning: "See a dermatologist.", tone: "high" },
    ],
  };
  return {
    tests: [
      ...(isMale(p) ? [men] : isFemale(p) ? [women] : [men, women]),
      {
        name: "Daily shedding and the pull test",
        how: "Gently pull about 60 hairs between finger and thumb, a few days after washing.",
        bands: [
          { label: "Daily shedding", range: "50–100 hairs", meaning: "Normal.", tone: "good" },
          { label: "Pull test", range: "Up to 6 hairs (10%)", meaning: "Normal.", tone: "good" },
          { label: "Pull test", range: "More than 6 hairs", meaning: "Active shedding: check ferritin, vitamin D, TSH, and recent illness or crash dieting.", tone: "watch" },
        ],
      },
    ],
    read: [
      "Pattern hair loss has no blood marker: it's diagnosed by the pattern. Blood tests rule out other causes of diffuse shedding.",
      "Useful checks if shedding is diffuse: ferritin (under 30 is low), vitamin D and TSH. See the Body aches and Thyroid guides for their ranges.",
      "Photos every 3 months in the same light tell you more than daily counting.",
    ],
    sources: [
      { label: "Kaufman et al., Finasteride in men with androgenetic alopecia (J Am Acad Dermatol, 1998)", url: "https://pubmed.ncbi.nlm.nih.gov/9777765/" },
    ],
  };
};

const BUILDERS: Record<string, Builder> = {
  cholesterol,
  sugar,
  bp,
  inflammation,
  "body-aches": bodyAches,
  hormonal,
  thyroid,
  fertility,
  gut,
  hair,
};

export function numbersFor(guideId: string, person: Person): GuideNumbers | null {
  return BUILDERS[guideId]?.(person) ?? null;
}

export const hasNumbers = (guideId: string) => guideId in BUILDERS;


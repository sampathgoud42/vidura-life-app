/**
 * Condition guides: one evidence-based analysis per focus area, in a fixed
 * five-part format (root cause and gimmicks, gold-standard protocol, global cost
 * and access, a smart-patient plan, and a safety checklist), plus references.
 *
 * Evidence tags:
 *   proven       = large randomised trials or meta-analyses, guideline-backed
 *   likely       = smaller trials or consistent clinical practice
 *   experimental = early, weak or anecdotal evidence
 *
 * Prices are rough USD estimates (late 2026) for comparison only, not quotes.
 * Nothing here is a prescription: every guide ends with "see your doctor".
 */
import type { CategoryId, ImageSlot } from "./content";

export type Evidence = "proven" | "likely" | "experimental";

export const EVIDENCE_LABEL: Record<Evidence, string> = {
  proven: "Proven",
  likely: "Likely helps",
  experimental: "Experimental",
};

export interface CauseStep {
  /** Short label for the diagram box. */
  label: string;
  /** One line under the label. */
  detail: string;
  /** Treatments that act at this step, shown as tags beside the box. */
  actsHere?: string[];
}

export interface Treatment {
  name: string;
  evidence: Evidence;
  what: string;
  timeline: string;
  sideEffects: string;
}

export interface CostRow {
  item: string;
  usa: string;
  india: string;
  thailand: string;
  indonesia: string;
  sriLanka: string;
}

export interface ConditionGuide {
  /** Unique slug, used in the image path and URL hash. */
  id: string;
  /** The focus area this guide belongs to. */
  category: CategoryId;
  title: string;
  emoji: string;
  /** The uncomfortable truth first, then the bottom line. */
  bottomLine: string;
  /** A 16:9 illustration of the root cause (no text in the art; the diagram carries the labels). */
  image: ImageSlot;
  rootCause: {
    summary: string;
    /** What feeds the problem (top row of the diagram). */
    drivers: string[];
    /** The chain from mechanism to harm, top to bottom. */
    chain: CauseStep[];
  };
  gimmicks: { name: string; why: string }[];
  protocol: Treatment[];
  experimental: string;
  costs: CostRow[];
  costNote: string;
  plan: { budget: string[]; convenient: string[] };
  food?: { eat: string[]; avoid: string[]; note: string };
  safety: string[];
  redFlags: string[];
  sources: { label: string; url?: string }[];
}

export const COUNTRIES = [
  ["usa", "USA"],
  ["india", "India"],
  ["thailand", "Thailand"],
  ["indonesia", "Indonesia"],
  ["sriLanka", "Sri Lanka"],
] as const;

export const GUIDE_DISCLAIMER =
  "General information to discuss with your doctor, not medical advice. Please see a licensed doctor before starting any prescription medicine or procedure.";

export const CONDITION_GUIDES: readonly ConditionGuide[] = [
  // ── Hair loss (male androgenetic alopecia) ─────────────────────────────────
  {
    id: "hair",
    category: "hair",
    title: "Hair loss",
    emoji: "💈",
    bottomLine:
      "No treatment cures pattern hair loss, and what works only works while you keep using it. The boring, cheap combination wins: minoxidil, plus a DHT blocker (finasteride or dutasteride) if you accept its small risk, started early. A transplant without ongoing treatment is wasted money.",
    image: {
      src: "assets/guides/hair.webp",
      ratio: "16:9",
      tone: "night",
      alt: "Cross-section of scalp showing hair follicles shrinking from thick to tiny, left to right",
      subject: "Hair follicles in a scalp cross-section, shown left to right shrinking from a thick deep follicle with a strong hair to a tiny shallow follicle with a fine wisp, simple educational scene with no text, labels or letters",
    },
    rootCause: {
      summary:
        "Pattern hair loss is genetic sensitivity to DHT, a hormone made from testosterone. Testosterone levels are usually normal. Follicles that are shrinking can be rescued; follicles that are gone cannot, so starting early matters more than any product.",
      drivers: ["Genes (sensitive follicles)", "Normal testosterone", "Age"],
      chain: [
        { label: "Testosterone → DHT", detail: "The enzyme 5-alpha-reductase converts it in the scalp", actsHere: ["Finasteride", "Dutasteride"] },
        { label: "DHT hits sensitive follicles", detail: "Mainly the crown and hairline", actsHere: ["Topical finasteride"] },
        { label: "Growth phase shortens", detail: "Each cycle, hairs grow for less time", actsHere: ["Minoxidil", "Microneedling"] },
        { label: "Follicles miniaturise", detail: "Thick hairs turn thin, short and colourless" },
        { label: "Visible thinning, then baldness", detail: "Fully lost follicles cannot come back", actsHere: ["Hair transplant"] },
      ],
    },
    gimmicks: [
      { name: "Biotin and hair gummies", why: "Only help the rare person who is deficient. No trial shows they treat pattern loss, and biotin can distort thyroid and heart lab tests." },
      { name: "DHT-blocking and growth shampoos and serums", why: "Minutes of contact and mostly small, maker-funded studies. Ketoconazole 2% shampoo is the one modest add-on with data." },
      { name: "Clinic packages of PRP, GFC or mesotherapy", why: "Small, inconsistent trials and no standard protocol. Sold without minoxidil or a DHT blocker, they are mostly an upsell." },
    ],
    protocol: [
      { name: "Minoxidil 5% topical", evidence: "proven", what: "Foam or solution once or twice a day. No hormonal, sexual or sperm effects.", timeline: "Shedding at 2 to 8 weeks is normal. Results by 4 to 6 months, peak about 12 months.", sideEffects: "Scalp itch, mostly from the solution's propylene glycol." },
      { name: "Low-dose oral minoxidil", evidence: "likely", what: "Off-label 1.25 to 5 mg a day. Trials show results similar to topical, with easier use.", timeline: "Similar to topical.", sideEffects: "Body hair, ankle swelling, fast heartbeat, dizziness. Needs a heart check first." },
      { name: "Finasteride 1 mg", evidence: "proven", what: "A daily pill that cuts scalp DHT. About 80 to 90% of men stop losing hair in trials.", timeline: "Shedding stops in 3 to 6 months, regrowth in 6 to 12 months, peak at 1 to 2 years.", sideEffects: "Sexual side effects in about 1 to 4% in trials, usually reversible. Can lower sperm count in some men. Halves PSA readings." },
      { name: "Dutasteride 0.5 mg", evidence: "likely", what: "Stronger than finasteride in trials. Approved for hair loss in Korea and Japan, off-label elsewhere.", timeline: "Similar to finasteride.", sideEffects: "Like finasteride, slightly more often. Stays in the body for weeks." },
      { name: "Topical finasteride", evidence: "likely", what: "A daily scalp spray with similar hair results and much less effect on blood DHT.", timeline: "Similar to oral finasteride.", sideEffects: "Lower but not zero risk of the oral side effects." },
      { name: "Hair transplant (FUE or FUT)", evidence: "proven", what: "Moves permanent follicles from the back of the head. One-time surgery.", timeline: "Final result in 12 to 18 months.", sideEffects: "Surgical risks and scarring. Native hair keeps thinning without treatment." },
    ],
    experimental:
      "Ketoconazole shampoo and weekly microneedling with minoxidil have some support as add-ons. PRP, exosomes, stem-cell hair cloning, pyrilutamide, clascoterone for the scalp and rosemary oil remain experimental or weakly tested.",
    costs: [
      { item: "Minoxidil 5% topical, per month", usa: "$12–30", india: "$6–12", thailand: "$15–30", indonesia: "$10–25", sriLanka: "$8–20" },
      { item: "Oral minoxidil, per month", usa: "$5–15", india: "$1–3", thailand: "$5–15", indonesia: "$3–10", sriLanka: "$3–8" },
      { item: "Finasteride 1 mg, per month", usa: "$10–30", india: "$2–5", thailand: "$10–30", indonesia: "$6–20", sriLanka: "$5–15" },
      { item: "Dermatologist visit", usa: "$150–300", india: "$6–20", thailand: "$30–80", indonesia: "$15–40", sriLanka: "$10–30" },
      { item: "Transplant, about 3,000 grafts", usa: "$9,000–20,000+", india: "$1,200–4,000", thailand: "$4,000–10,000", indonesia: "$3,000–7,000", sriLanka: "$2,000–5,000" },
    ],
    costNote: "India is cheapest for lifelong medicine and transplants; Thailand offers more hospital-grade medical-tourism logistics.",
    plan: {
      budget: [
        "One dermatologist visit to confirm the diagnosis.",
        "Generic minoxidil: store-brand 5% foam, or low-dose oral if your doctor agrees.",
        "If you accept the small risk: generic finasteride 1 mg (in the USA, quartering a 5 mg tablet is a common saving).",
        "Ketoconazole 2% shampoo two or three times a week.",
        "Photos every 3 months in the same light. Judge at 12 months.",
        "Only after a year of stable treatment, consider a transplant for areas that didn't respond.",
      ],
      convenient: [
        "One or two pills a day (oral minoxidil, with finasteride if you choose it). Nothing to apply.",
        "90-day refills from a licensed online pharmacy and a phone reminder.",
        "If you want no sexual or sperm risk at all: minoxidil, ketoconazole shampoo and microneedling only, accepting slower long-term progress.",
      ],
    },
    food: {
      eat: [
        "Protein at every meal: eggs, fish, dal, paneer, curd, soy (about 1 g per kg of body weight a day)",
        "Iron foods with vitamin C: greens, lentils, chickpeas with lemon, amla or guava",
        "Zinc: pumpkin seeds, chickpeas, cashews, eggs",
        "Vitamin D: oily fish, egg yolks, morning sun (supplement only if a test is low)",
        "Omega-3: sardines, mackerel, walnuts, flax",
      ],
      avoid: [
        "Crash diets: they trigger heavy shedding 2 to 4 months later",
        "Sugary drinks and junk food, linked with insulin resistance",
        "Smoking and heavy drinking",
        "High-dose vitamin A or selenium supplements, which cause hair loss",
        "Bodybuilding products with DHEA, prohormones or steroids",
      ],
      note: "Food fixes shedding from deficiencies; it does not reverse genetic pattern loss.",
    },
    safety: [
      "Confirm it's pattern loss. Patches, sudden diffuse shedding, redness, scaling or pain point to other causes.",
      "Blood tests if loss is diffuse: thyroid (TSH), ferritin, vitamin D, blood count.",
      "Before a DHT blocker: a PSA test if over about 45, and talk about mood history and plans for children.",
      "Before oral minoxidil: blood pressure and heart check.",
      "Pregnant women must not handle broken finasteride or dutasteride tablets.",
      "Transplant: a qualified surgeon does the key steps, with real before-and-after photos and a plan for future loss.",
    ],
    redFlags: ["Breast tenderness or lumps", "Low mood", "Ongoing sexual problems", "Chest pain, fainting or swelling on oral minoxidil"],
    sources: [
      { label: "Kaufman et al., Finasteride in men with androgenetic alopecia (J Am Acad Dermatol, 1998)", url: "https://pubmed.ncbi.nlm.nih.gov/9777765/" },
      { label: "Gubelin Harcha et al., Dutasteride vs finasteride, randomised trial (J Am Acad Dermatol, 2014)", url: "https://pubmed.ncbi.nlm.nih.gov/24411083/" },
      { label: "Piraccini et al., Topical finasteride spray, phase III trial (JEADV, 2022)", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9297965/" },
      { label: "Randolph & Tosti, Oral minoxidil for hair loss: efficacy and safety review (2021)", url: "https://pubmed.ncbi.nlm.nih.gov/32622136/" },
      { label: "Low-dose oral minoxidil for non-scarring alopecia: systematic review", url: "https://pubmed.ncbi.nlm.nih.gov/32516434/" },
      { label: "Dhurat et al., Microneedling with minoxidil, randomised study (Int J Trichology, 2013)", url: "https://pubmed.ncbi.nlm.nih.gov/23960389/" },
    ],
  },

  // ── Cholesterol ────────────────────────────────────────────────────────────
  {
    id: "cholesterol",
    category: "cholesterol",
    title: "High cholesterol",
    emoji: "❤️",
    bottomLine:
      "Diet alone usually lowers LDL by only 5 to 15%, so many people at real risk need a statin, and a generic statin costs a few dollars a month. What matters is your overall heart risk and your LDL number, not a supplement shelf.",
    image: {
      src: "assets/guides/cholesterol.webp",
      ratio: "16:9",
      tone: "morning",
      alt: "Cut-away artery showing LDL particles building into plaque that narrows it",
      subject: "A cut-away of an artery: smooth open artery on the left, yellow fatty plaque building up inside the wall and narrowing the channel on the right, round LDL particles drifting in the blood, simple educational scene with no text, labels or letters",
    },
    rootCause: {
      summary:
        "LDL cholesterol is carried in particles that slip into artery walls. Your genes and diet set how much LDL the liver makes and clears. Over decades, trapped LDL builds plaque that can rupture and cause a heart attack or stroke.",
      drivers: ["Genes (incl. familial high cholesterol)", "Saturated and trans fats", "Excess weight, inactivity", "Underactive thyroid, diabetes"],
      chain: [
        { label: "Liver makes more LDL, clears less", detail: "Fewer LDL receptors on liver cells", actsHere: ["Statins", "PCSK9 drugs"] },
        { label: "Gut absorbs cholesterol", detail: "From food and bile", actsHere: ["Ezetimibe", "Soluble fibre"] },
        { label: "High LDL in the blood", detail: "More particles reach artery walls" },
        { label: "Plaque builds in arteries", detail: "LDL is trapped, oxidised and inflamed" },
        { label: "Heart attack or stroke", detail: "When plaque ruptures and a clot forms", actsHere: ["Lower LDL longer = lower risk"] },
      ],
    },
    gimmicks: [
      { name: "Red yeast rice and 'natural statin' pills", why: "They contain a statin in uncontrolled doses, sometimes with a kidney toxin (citrinin). A regulated generic statin is cheaper and safer." },
      { name: "Fish-oil capsules for LDL", why: "Omega-3 lowers triglycerides, not LDL. Over-the-counter fish oil hasn't reduced heart attacks in large trials." },
      { name: "Detox teas and garlic pills", why: "Effects on LDL are tiny or unproven, and they delay effective treatment." },
    ],
    protocol: [
      { name: "Diet and activity", evidence: "proven", what: "Less saturated and trans fat, 5 to 10 g soluble fibre a day (oats, psyllium, dal), 150 minutes of activity a week.", timeline: "LDL change in 4 to 12 weeks, usually 5 to 15%.", sideEffects: "None." },
      { name: "Statins (atorvastatin, rosuvastatin)", evidence: "proven", what: "Lower LDL 30 to 50% or more. Each 1 mmol/L (39 mg/dL) drop cuts major heart events by about a fifth.", timeline: "Full LDL effect in 4 to 6 weeks; risk falls over years.", sideEffects: "Muscle aches (true intolerance is uncommon), a small rise in diabetes risk, rare liver effects." },
      { name: "Ezetimibe", evidence: "proven", what: "Blocks gut absorption; adds about 20% more LDL lowering on top of a statin.", timeline: "4 weeks.", sideEffects: "Few." },
      { name: "PCSK9 drugs and inclisiran", evidence: "proven", what: "Injections that lower LDL about 50 to 60% more, for very high risk or familial cases.", timeline: "Weeks.", sideEffects: "Injection-site reactions. Expensive." },
    ],
    experimental:
      "Plant sterol foods and psyllium have modest support. Berberine, nattokinase and most 'heart' supplements have weak or no outcome data.",
    costs: [
      { item: "Atorvastatin 20 mg, per month", usa: "$4–15", india: "$1–3", thailand: "$3–10", indonesia: "$2–8", sriLanka: "$2–6" },
      { item: "Ezetimibe 10 mg, per month", usa: "$10–20", india: "$2–4", thailand: "$8–20", indonesia: "$5–15", sriLanka: "$4–10" },
      { item: "Lipid panel blood test", usa: "$20–60", india: "$3–8", thailand: "$10–25", indonesia: "$8–15", sriLanka: "$4–10" },
      { item: "PCSK9 injection, per month", usa: "$500+ list", india: "$100–200", thailand: "$300–500", indonesia: "$300–500", sriLanka: "Limited" },
    ],
    costNote: "Generic statins are among the cheapest effective medicines everywhere. Branded combination pills cost more for no extra benefit.",
    plan: {
      budget: [
        "Get a lipid panel and calculate your 10-year heart risk with your doctor.",
        "If a statin is advised: generic atorvastatin or rosuvastatin, via a discount card or online pharmacy in the USA, or any licensed chemist in South Asia.",
        "Add psyllium or oats daily and swap fried snacks for nuts.",
        "Recheck lipids at 6 to 12 weeks, then yearly.",
      ],
      convenient: [
        "One statin pill at the same time daily (rosuvastatin and atorvastatin work any time of day).",
        "A single-pill statin plus ezetimibe if you need both.",
      ],
    },
    safety: [
      "Lipid panel, and lipoprotein(a) once in life.",
      "Thyroid (TSH), HbA1c and liver tests before starting.",
      "LDL above 190 mg/dL (4.9 mmol/L): ask about familial hypercholesterolaemia and testing your family.",
      "Statins are stopped in pregnancy and when planning one.",
      "Report unexplained muscle pain or dark urine.",
    ],
    redFlags: ["Chest pain or pressure", "Sudden weakness, face droop or speech trouble", "Severe muscle pain with dark urine"],
    sources: [
      { label: "AHA: Top things to know, 2018 Guideline on the Management of Blood Cholesterol", url: "https://professional.heart.org/en/science-news/2018-guideline-on-the-management-of-blood-cholesterol/top-things-to-know" },
      { label: "Cholesterol Treatment Trialists: More intensive LDL lowering, meta-analysis (Lancet, 2010)", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2988224/" },
      { label: "AAFP summary of the AHA/ACC cholesterol guideline (2019)", url: "https://www.aafp.org/afp/2019/0501/p589.pdf" },
    ],
  },

  // ── Blood sugar ────────────────────────────────────────────────────────────
  {
    id: "sugar",
    category: "sugar",
    title: "High blood sugar and type 2 diabetes",
    emoji: "🩸",
    bottomLine:
      "Prediabetes is often reversible and type 2 diabetes often goes into remission with enough weight loss, but no herb or powder does that. Losing about 7% of body weight and walking 150 minutes a week cut new diabetes by 58% in a large trial; metformin costs a few dollars a month.",
    image: {
      src: "assets/guides/sugar.webp",
      ratio: "16:9",
      tone: "midday",
      alt: "Sugar crowding outside a cell whose insulin doors are half closed, beside a tired pancreas",
      subject: "Glucose shown as small glowing cubes crowding outside a muscle cell whose door-like insulin receptors are half closed, with a tired pancreas shape nearby, simple educational scene with no text, labels or letters",
    },
    rootCause: {
      summary:
        "Type 2 diabetes starts when muscle, liver and fat stop responding well to insulin. The pancreas makes more insulin to compensate, until it can't keep up. South Asians develop this at lower body weights, partly because of more fat around the organs.",
      drivers: ["Genes and family history", "Belly and organ fat", "Inactivity", "Refined carbs, sugary drinks", "Poor sleep"],
      chain: [
        { label: "Insulin resistance", detail: "Muscle and liver ignore insulin's signal", actsHere: ["Weight loss", "Exercise", "Metformin"] },
        { label: "Liver releases too much sugar", detail: "Especially overnight", actsHere: ["Metformin"] },
        { label: "Pancreas tires", detail: "Beta cells can't keep up", actsHere: ["GLP-1 drugs"] },
        { label: "High blood sugar", detail: "HbA1c rises above 6.5%", actsHere: ["SGLT2 drugs"] },
        { label: "Damage to vessels and nerves", detail: "Heart, kidneys, eyes, feet" },
      ],
    },
    gimmicks: [
      { name: "Herbal 'diabetes cure' powders", why: "Bitter gourd, jamun and cinnamon have small, inconsistent effects. Some products have been found spiked with hidden prescription drugs." },
      { name: "Expensive 'reversal' programmes", why: "The proven part is weight loss and activity, which you can do with a dietitian. Remission depends on how much weight you lose, not on the package." },
      { name: "'Sugar-free' sweets and diabetic biscuits", why: "Often made of refined flour and fat that still raise sugar and weight." },
    ],
    protocol: [
      { name: "Weight loss and activity", evidence: "proven", what: "Lose 5 to 10% of weight (15 kg can put many into remission), 150 minutes of walking a week, strength work twice a week, a walk after meals.", timeline: "Sugar improves within weeks; HbA1c changes over 3 months.", sideEffects: "None." },
      { name: "Metformin", evidence: "proven", what: "First-line pill that reduces liver sugar output. Also cut new diabetes by 31% in prediabetes.", timeline: "Effect within 2 to 4 weeks.", sideEffects: "Stomach upset (extended-release helps), low vitamin B12 over years." },
      { name: "SGLT2 inhibitors (dapagliflozin, empagliflozin)", evidence: "proven", what: "Pass sugar out in urine. Protect the heart and kidneys.", timeline: "Weeks.", sideEffects: "Genital yeast infections, dehydration, rare ketoacidosis." },
      { name: "GLP-1 drugs (semaglutide, tirzepatide)", evidence: "proven", what: "Lower sugar and weight strongly; reduce heart events in high-risk people.", timeline: "Weeks for sugar, months for weight.", sideEffects: "Nausea, constipation, rare pancreatitis or gallstones. Costly in many countries." },
    ],
    experimental:
      "Continuous glucose monitors are proven for insulin users and useful for learning, but not essential for most. Berberine and apple cider vinegar have small, short trials.",
    costs: [
      { item: "Metformin, per month", usa: "$4–10", india: "$1–3", thailand: "$2–6", indonesia: "$2–5", sriLanka: "$1–3" },
      { item: "Dapagliflozin 10 mg, per month", usa: "$30–500", india: "$3–8", thailand: "$20–40", indonesia: "$15–35", sriLanka: "$5–15" },
      { item: "Semaglutide, per month", usa: "$350–1,000", india: "$15–60 (generics)", thailand: "$150–300", indonesia: "$150–300", sriLanka: "$100–250" },
      { item: "HbA1c test", usa: "$20–50", india: "$3–6", thailand: "$8–15", indonesia: "$6–12", sriLanka: "$3–8" },
    ],
    costNote: "Dapagliflozin and semaglutide prices fell sharply in India as generics arrived; US prices depend heavily on insurance and manufacturer programmes.",
    plan: {
      budget: [
        "HbA1c and fasting glucose test.",
        "Generic metformin (extended-release if your stomach complains) and a structured walking plan.",
        "Add a generic SGLT2 inhibitor if your doctor advises, especially with heart or kidney risk.",
        "Recheck HbA1c every 3 months until on target, then every 6 months.",
      ],
      convenient: [
        "A once-weekly GLP-1 injection where affordable: strongest effect for the least daily effort.",
        "A single combination pill (metformin plus an SGLT2 or DPP-4 drug) to cut tablet count.",
        "A 10-minute walk after each main meal.",
      ],
    },
    safety: [
      "HbA1c, kidney function (eGFR and urine albumin), lipids and blood pressure.",
      "A yearly eye exam and foot check.",
      "Vitamin B12 yearly on long-term metformin.",
      "Sulfonylureas and insulin can cause low sugar: learn the signs.",
      "GLP-1 drugs are avoided with a personal or family history of medullary thyroid cancer, and in pregnancy.",
    ],
    redFlags: ["Extreme thirst and peeing with weight loss", "Confusion or shakiness (low sugar)", "Vomiting with abdominal pain on an SGLT2 drug", "A foot wound that isn't healing"],
    sources: [
      { label: "ADA: Pharmacologic approaches to glycemic treatment, Standards of Care 2025", url: "https://pubmed.ncbi.nlm.nih.gov/39651989/" },
      { label: "Diabetes Prevention Program: lifestyle or metformin (NEJM, 2002)", url: "https://pubmed.ncbi.nlm.nih.gov/11832527/" },
      { label: "Lean et al., DiRECT trial: weight management for type 2 diabetes remission (Lancet, 2018)" },
    ],
  },

  // ── Blood pressure ─────────────────────────────────────────────────────────
  {
    id: "bp",
    category: "bp",
    title: "High blood pressure",
    emoji: "🩺",
    bottomLine:
      "High blood pressure usually has no symptoms, so feeling fine proves nothing. Less salt and more potassium help everyone, but most people above 140/90 also need a cheap generic pill, often for life.",
    image: {
      src: "assets/guides/bp.webp",
      ratio: "16:9",
      tone: "afternoon",
      alt: "A heart pushing blood into a stiff narrow artery, with a kidney holding water and a salt shaker",
      subject: "A heart pumping into a narrowed, stiff artery with a pressure gauge needle high, a kidney shape holding water droplets and a salt shaker nearby, simple educational scene with no text, labels or letters",
    },
    rootCause: {
      summary:
        "Pressure rises when the kidneys hold on to salt and water, and when arteries stiffen and narrow. Hormone systems (renin-angiotensin) and stress nerves push it higher. Years of high pressure strain the heart, brain and kidneys.",
      drivers: ["Too much salt, too little potassium", "Excess weight", "Alcohol", "Inactivity, stress", "Sleep apnea", "Age, genes"],
      chain: [
        { label: "Kidneys retain salt and water", detail: "More fluid in the circulation", actsHere: ["Less salt", "Thiazide diuretics"] },
        { label: "Hormone signals tighten arteries", detail: "Renin-angiotensin system", actsHere: ["ACE inhibitors", "ARBs"] },
        { label: "Arteries stiffen and narrow", detail: "Age, salt and smoking", actsHere: ["Amlodipine", "Exercise"] },
        { label: "Blood pressure stays high", detail: "Above 130/80 to 140/90" },
        { label: "Stroke, heart and kidney damage", detail: "Each 10 mmHg lower cuts heart and stroke risk about a fifth" },
      ],
    },
    gimmicks: [
      { name: "BP 'detox' teas and supplements", why: "No outcome evidence, and some contain liquorice, which raises blood pressure." },
      { name: "Magnetic or copper bracelets", why: "Studied and shown to do nothing." },
      { name: "Stopping pills once readings are normal", why: "Normal readings usually mean the pill is working. Pressure creeps back up within weeks." },
    ],
    protocol: [
      { name: "Less salt, more potassium", evidence: "proven", what: "Under 5 g salt a day (WHO). A potassium-enriched salt substitute cut strokes and deaths in a large trial.", timeline: "Weeks.", sideEffects: "Potassium salt isn't for people with kidney disease or on some drugs." },
      { name: "DASH-style eating, weight loss, exercise", evidence: "proven", what: "Fruit, vegetables, dal, low-fat dairy; about 1 mmHg drop per kg lost; walking plus isometric work like wall sits.", timeline: "4 to 12 weeks.", sideEffects: "None." },
      { name: "First-line pills", evidence: "proven", what: "Amlodipine, an ARB (telmisartan, losartan) or ACE inhibitor, and a thiazide-like diuretic (chlorthalidone, indapamide), often as one combined pill.", timeline: "Effect in 2 to 4 weeks.", sideEffects: "Ankle swelling (amlodipine), cough (ACE inhibitors), changes in potassium or sodium (diuretics)." },
    ],
    experimental:
      "Renal denervation is approved for some resistant cases. Beetroot juice and garlic have small effects; most 'BP supplements' have none.",
    costs: [
      { item: "Amlodipine 5 mg, per month", usa: "$4–10", india: "$1–2", thailand: "$2–6", indonesia: "$1–4", sriLanka: "$1–3" },
      { item: "Telmisartan or losartan, per month", usa: "$5–15", india: "$1–4", thailand: "$4–12", indonesia: "$3–10", sriLanka: "$2–6" },
      { item: "Validated home BP monitor (one-time)", usa: "$30–60", india: "$20–35", thailand: "$30–50", indonesia: "$25–45", sriLanka: "$25–45" },
      { item: "Doctor visit", usa: "$100–250", india: "$5–15", thailand: "$20–50", indonesia: "$10–30", sriLanka: "$8–20" },
    ],
    costNote: "This is one of the cheapest chronic conditions to treat well; the monitor pays for itself.",
    plan: {
      budget: [
        "Buy a validated upper-arm monitor and log morning and evening readings for a week.",
        "Cut salt to under a teaspoon a day; switch to a potassium salt substitute if your doctor agrees.",
        "If still above target: generic amlodipine or telmisartan.",
        "Recheck in 4 weeks; add a second drug rather than waiting months.",
      ],
      convenient: [
        "One single-pill combination (for example telmisartan plus amlodipine) taken daily.",
        "A home monitor that syncs readings to your phone, shared with your doctor.",
      ],
    },
    safety: [
      "Confirm with home or 24-hour readings; one clinic reading isn't enough.",
      "Kidney function, potassium, sodium, glucose, lipids and an ECG at the start.",
      "Under 30, very high or hard to control: ask about secondary causes (kidney, adrenal, sleep apnea).",
      "ACE inhibitors and ARBs are not used in pregnancy.",
      "Avoid regular painkillers like ibuprofen; they raise pressure.",
    ],
    redFlags: ["Readings above 180/120 with headache, chest pain or blurred vision", "Sudden weakness or trouble speaking", "Fainting after starting a pill"],
    sources: [
      { label: "AHA/ACC: 2025 High Blood Pressure Guideline, top things to know", url: "https://professional.heart.org/en/science-news/2025-high-blood-pressure-guideline" },
      { label: "ACC: New 2025 guideline on prevention, detection and management of high blood pressure", url: "https://www.acc.org/latest-in-cardiology/journal-scans/2025/08/14/15/36/new-acc-aha-guideline-addresses-prevention-detection-evaluation-and-management-of-hbp" },
      { label: "WHO: Salt reduction fact sheet", url: "https://www.who.int/news-room/fact-sheets/detail/salt-reduction" },
      { label: "Neal et al., Salt Substitute and Stroke Study (NEJM, 2021)" },
    ],
  },

  // ── Gut health (IBS and common gut complaints) ─────────────────────────────
  {
    id: "gut",
    category: "gut",
    title: "Gut health and IBS",
    emoji: "🌱",
    bottomLine:
      "Most chronic bloating, pain and irregular bowels without warning signs is irritable bowel syndrome, a real gut-brain disorder, not a toxin or 'leaky gut' problem. The best-tested fixes are cheap: a guided low-FODMAP trial, soluble fibre, peppermint oil and gut-directed therapy.",
    image: {
      src: "assets/guides/gut.webp",
      ratio: "16:9",
      tone: "afternoon",
      alt: "The gut and brain linked by a nerve, with gas bubbles inside the intestine",
      subject: "A friendly stylised intestine connected by a glowing nerve line to a brain above, small gas bubbles inside the intestine and wavy signal lines between them, simple educational scene with no text, labels or letters",
    },
    rootCause: {
      summary:
        "In IBS, the gut and brain amplify each other's signals. The gut is more sensitive to normal stretching, moves too fast or too slow, and certain carbohydrates (FODMAPs) ferment into gas. Infections, stress and medicines can trigger it.",
      drivers: ["A past gut infection", "Stress and anxiety", "Genes", "Antibiotics", "Diet (FODMAPs)"],
      chain: [
        { label: "Gut-brain signals amplified", detail: "Nerves over-report normal activity", actsHere: ["Gut-directed CBT", "Low-dose amitriptyline"] },
        { label: "Motility changes", detail: "Too fast (diarrhoea) or too slow (constipation)", actsHere: ["Soluble fibre", "Linaclotide"] },
        { label: "FODMAPs ferment into gas", detail: "Onion, garlic, wheat, some fruits and pulses", actsHere: ["Low-FODMAP trial"] },
        { label: "Spasm and hypersensitivity", detail: "Cramping pain after meals", actsHere: ["Peppermint oil", "Antispasmodics"] },
        { label: "Bloating, pain, irregular bowels", detail: "Real symptoms, no structural damage" },
      ],
    },
    gimmicks: [
      { name: "IgG food intolerance tests", why: "IgG shows exposure, not intolerance. Guidelines advise against them." },
      { name: "Colon cleanses and detox kits", why: "No benefit, and they can cause dehydration and salt imbalance." },
      { name: "Expensive multi-strain probiotics", why: "Evidence is weak and strain-specific; the ACG guideline does not recommend probiotics for IBS." },
    ],
    protocol: [
      { name: "Rule out other causes", evidence: "proven", what: "Celiac blood test and, with diarrhoea, CRP or faecal calprotectin to rule out inflammatory bowel disease.", timeline: "One visit.", sideEffects: "None." },
      { name: "Low-FODMAP diet trial", evidence: "proven", what: "Two to six weeks of low-FODMAP eating, then reintroduce foods one at a time. Best with a dietitian.", timeline: "Relief often within 2 to 4 weeks.", sideEffects: "Too restrictive if kept long term." },
      { name: "Soluble fibre (psyllium)", evidence: "proven", what: "Start 1 teaspoon a day and build up slowly.", timeline: "2 to 4 weeks.", sideEffects: "Gas at first." },
      { name: "Peppermint oil capsules", evidence: "likely", what: "Enteric-coated capsules for cramping pain.", timeline: "Days to weeks.", sideEffects: "Heartburn." },
      { name: "Gut-directed CBT or hypnotherapy", evidence: "proven", what: "Retrains gut-brain signalling; works in about half to two-thirds of people. Apps now exist.", timeline: "6 to 12 weeks.", sideEffects: "None." },
      { name: "Prescription options", evidence: "proven", what: "Low-dose amitriptyline for pain; linaclotide for constipation; rifaximin for diarrhoea and bloating.", timeline: "2 to 8 weeks.", sideEffects: "Drowsiness, dry mouth (amitriptyline); diarrhoea (linaclotide)." },
    ],
    experimental:
      "Specific probiotic strains, faecal transplants and 'microbiome testing' services remain experimental for IBS.",
    costs: [
      { item: "Psyllium husk, per month", usa: "$10–15", india: "$2–4", thailand: "$5–10", indonesia: "$4–8", sriLanka: "$3–6" },
      { item: "Peppermint oil capsules, per month", usa: "$15–25", india: "$5–10", thailand: "$10–20", indonesia: "$8–15", sriLanka: "$6–12" },
      { item: "Amitriptyline 10 mg, per month", usa: "$5–10", india: "$1", thailand: "$2–5", indonesia: "$2–4", sriLanka: "$1–2" },
      { item: "Rifaximin, 2-week course", usa: "$1,500–2,500 (brand)", india: "$10–20", thailand: "$40–80", indonesia: "$30–60", sriLanka: "$15–30" },
      { item: "Gastroenterologist visit", usa: "$200–400", india: "$8–20", thailand: "$30–80", indonesia: "$15–40", sriLanka: "$10–25" },
    ],
    costNote: "Rifaximin shows the biggest gap: the same drug is around 100 times cheaper in India.",
    plan: {
      budget: [
        "One visit and basic blood tests to rule out celiac disease and inflammation.",
        "A free low-FODMAP app or printed list for a 4-week trial, then structured reintroduction.",
        "Psyllium daily and peppermint oil for flare days.",
        "Ask about low-dose amitriptyline if pain persists.",
      ],
      convenient: [
        "A gut-directed hypnotherapy or CBT app, 15 minutes a day.",
        "Psyllium stirred into water or curd each morning.",
      ],
    },
    safety: [
      "Blood count, CRP, celiac serology, thyroid test; faecal calprotectin if diarrhoea.",
      "A colonoscopy for new symptoms over 45, or any red flag below.",
      "Avoid long, unsupervised elimination diets.",
    ],
    redFlags: ["Blood in stool or black stools", "Unexplained weight loss", "Anaemia", "Symptoms waking you at night", "Family history of bowel cancer, celiac or IBD", "Fever"],
    sources: [
      { label: "Lacy et al., ACG Clinical Guideline: Management of Irritable Bowel Syndrome (Am J Gastroenterol, 2021)", url: "https://pubmed.ncbi.nlm.nih.gov/33315591/" },
      { label: "ACG IBS guideline, full text (PMC)", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8132693/" },
      { label: "Ford et al., ATLANTIS trial: low-dose amitriptyline for IBS in primary care (Lancet, 2023)" },
    ],
  },

  // ── Inflammation ───────────────────────────────────────────────────────────
  {
    id: "inflammation",
    category: "inflammation",
    title: "Chronic inflammation",
    emoji: "🔥",
    bottomLine:
      "Chronic low-grade inflammation isn't a disease you treat with a pill; it's a sign of what drives many diseases. Supplements rarely move it. Losing belly fat, moving daily, sleeping well, not smoking and treating hidden causes like gum disease do.",
    image: {
      src: "assets/guides/inflammation.webp",
      ratio: "16:9",
      tone: "evening",
      alt: "Immune cells in belly fat sending inflammatory signals toward the heart and joints",
      subject: "Soft glowing orange immune cells clustered in belly fat tissue, sending small spark-like signals through blood vessels toward a heart and joints, simple educational scene with no text, labels or letters",
    },
    rootCause: {
      summary:
        "Short bursts of inflammation heal us. When the immune system stays switched on at a low level for years, fed by visceral fat, inactivity, smoking and poor sleep, it damages arteries, joints and metabolism. A blood test called hs-CRP measures it.",
      drivers: ["Belly fat", "Inactivity", "Smoking", "Poor sleep, chronic stress", "Ultra-processed food", "Gum disease, hidden infection", "Low vitamin D (linked, not proven cause)"],
      chain: [
        { label: "Fat and stressed tissues send alarms", detail: "Immune cells gather in visceral fat", actsHere: ["Weight loss", "Exercise"] },
        { label: "Cytokines rise", detail: "IL-6 and TNF circulate", actsHere: ["Colchicine (heart patients)"] },
        { label: "Liver makes CRP", detail: "hs-CRP above 3 mg/L is high", actsHere: ["Statins"] },
        { label: "Insulin resistance and artery damage", detail: "Plaque, high sugar, joint pain" },
        { label: "Heart disease, diabetes, fatigue, body aches", detail: "Inflammation speeds them up and makes muscles and joints more sensitive to pain" },
      ],
    },
    gimmicks: [
      { name: "High-dose turmeric and 'anti-inflammatory' stacks", why: "Curcumin is poorly absorbed, effects are small, and concentrated products have caused liver injury. Turmeric in cooking is fine." },
      { name: "IV vitamin drips", why: "No evidence of benefit in healthy people, with infection and cost risks." },
      { name: "Alkaline water and detox diets", why: "The body controls its own pH; these don't change inflammation." },
    ],
    protocol: [
      { name: "Lose visceral fat and move daily", evidence: "proven", what: "Even 5 to 10% weight loss lowers CRP. Aim for 150 minutes of moderate exercise a week.", timeline: "CRP falls over 2 to 6 months.", sideEffects: "None." },
      { name: "Mediterranean-style eating", evidence: "proven", what: "Vegetables, pulses, nuts, olive or mustard oil, fish; fewer fried and processed foods.", timeline: "Months.", sideEffects: "None." },
      { name: "Quit smoking, sleep 7 to 9 hours, treat gum disease and sleep apnea", evidence: "likely", what: "Each removes an ongoing trigger.", timeline: "Weeks to months.", sideEffects: "None." },
      { name: "Statins for those at heart risk", evidence: "proven", what: "Lower both LDL and CRP; benefit shown in people with high CRP.", timeline: "Weeks.", sideEffects: "See the cholesterol guide." },
      { name: "Low-dose colchicine", evidence: "proven", what: "0.5 mg a day reduced heart events in people with existing heart disease. Only with a cardiologist.", timeline: "Months.", sideEffects: "Diarrhoea; interacts with several drugs." },
    ],
    experimental:
      "Omega-3 supplements, curcumin, intermittent fasting protocols and 'inflammation panels' sold direct to consumers have mixed or weak evidence.",
    costs: [
      { item: "hs-CRP blood test", usa: "$20–50", india: "$4–8", thailand: "$10–20", indonesia: "$8–15", sriLanka: "$4–10" },
      { item: "Generic statin, per month", usa: "$4–15", india: "$1–3", thailand: "$3–10", indonesia: "$2–8", sriLanka: "$2–6" },
      { item: "Colchicine 0.5 mg, per month", usa: "$10–40", india: "$1–3", thailand: "$3–8", indonesia: "$3–8", sriLanka: "$2–5" },
      { item: "Dental cleaning", usa: "$100–200", india: "$10–25", thailand: "$30–60", indonesia: "$20–40", sriLanka: "$10–25" },
    ],
    costNote: "The most effective steps are free; the most expensive products (drips, stacks) have the least evidence.",
    plan: {
      budget: [
        "An hs-CRP test with your routine bloods; repeat if high, since a cold can raise it.",
        "Daily brisk walk, more vegetables and pulses, fewer fried snacks.",
        "A dental check-up and cleaning.",
        "If you have heart risk, discuss a statin.",
        "Muscles or body aching too? Add vitamin D, B12, ferritin and TSH to the same blood draw and correct only what's low (see Muscle and body aches below).",
      ],
      convenient: [
        "Two habits only: a 30-minute walk and a fixed bedtime.",
        "Turmeric and ginger in daily cooking instead of capsules.",
      ],
    },
    safety: [
      "hs-CRP above 10 mg/L usually means an infection or another illness: see a doctor.",
      "Persistent joint swelling, rashes or fevers need checks for autoimmune disease.",
      "Long-term painkillers (NSAIDs) raise stomach, kidney and heart risks.",
      "Turmeric and fish-oil supplements can interact with blood thinners.",
    ],
    redFlags: ["Swollen, hot joints", "Unexplained fever or weight loss", "Yellow eyes or dark urine on supplements"],
    sources: [
      { label: "Furman et al., Chronic inflammation in the etiology of disease across the life span (Nature Medicine, 2019)", url: "https://pubmed.ncbi.nlm.nih.gov/31806905/" },
      { label: "Nidorf et al., LoDoCo2: colchicine in chronic coronary disease (NEJM, 2020)" },
      { label: "Ridker et al., JUPITER: rosuvastatin in people with elevated CRP (NEJM, 2008)" },
    ],
  },

  // ── Hormonal balance ───────────────────────────────────────────────────────
  {
    id: "hormonal",
    category: "hormonal",
    title: "Hormonal balance",
    emoji: "🌸",
    bottomLine:
      "'Hormonal imbalance' is not a diagnosis; the common real ones are PCOS and thyroid problems in women, and low testosterone or thyroid problems in men. Each is diagnosed with specific blood tests and treated with cheap, proven medicines, not 'balancing' supplements.",
    image: {
      src: "assets/guides/hormonal.webp",
      ratio: "16:9",
      tone: "dawn",
      alt: "Hormone glands linked to the brain, with a gently tipped balance scale",
      subject: "Stylised glands as soft shapes, a thyroid butterfly at the neck, ovaries and testes as simple ovals, connected by gentle arcs to the brain, a balance scale tipping slightly, simple educational scene with no text, labels or letters",
    },
    rootCause: {
      summary:
        "Insulin resistance and genes drive PCOS, where the ovaries make extra androgens. Autoimmunity drives most underactive thyroid. In men, excess weight, poor sleep and some medicines lower testosterone. All of them show up as tiredness, weight change, skin and cycle or libido changes.",
      drivers: ["Insulin resistance, excess weight", "Genes", "Autoimmunity (thyroid)", "Poor sleep, stress", "Some medicines, anabolic steroids"],
      chain: [
        { label: "High insulin, inflammation", detail: "Push the ovaries to make androgens", actsHere: ["Weight loss", "Metformin"] },
        { label: "Brain-gland signals shift", detail: "LH, FSH and TSH change", actsHere: ["Contraceptive pill", "Letrozole"] },
        { label: "Hormone levels off", detail: "Androgens up (women), testosterone down (men), thyroid down", actsHere: ["Levothyroxine", "Testosterone (confirmed cases)"] },
        { label: "Symptoms", detail: "Irregular periods, acne, hair changes, fatigue, low libido", actsHere: ["Spironolactone"] },
        { label: "Long-term risks", detail: "Diabetes, heart disease, infertility" },
      ],
    },
    gimmicks: [
      { name: "'Hormone balancing' teas, gummies and seed cycling", why: "No trial shows they correct a hormone disorder." },
      { name: "Testosterone boosters (tribulus, fenugreek blends)", why: "No meaningful rise in testosterone in trials; some contain hidden steroids." },
      { name: "Saliva hormone panels and 'adrenal fatigue' protocols", why: "Unreliable tests for a condition that is not recognised by endocrinologists." },
    ],
    protocol: [
      { name: "Lifestyle (PCOS and low testosterone)", evidence: "proven", what: "5 to 10% weight loss improves cycles in PCOS and raises testosterone in overweight men. Strength training and 7 to 9 hours of sleep.", timeline: "3 to 6 months.", sideEffects: "None." },
      { name: "PCOS medicines", evidence: "proven", what: "Combined contraceptive pill for cycles, acne and hair; metformin for insulin resistance; letrozole for ovulation when trying to conceive; spironolactone for unwanted hair.", timeline: "3 to 6 months for skin and hair.", sideEffects: "Pill: clot risk in some women. Spironolactone: not in pregnancy." },
      { name: "Levothyroxine for underactive thyroid", evidence: "proven", what: "Daily tablet on an empty stomach, dose guided by TSH.", timeline: "6 to 8 weeks per dose change.", sideEffects: "Palpitations if the dose is too high." },
      { name: "Testosterone therapy (men)", evidence: "proven", what: "Only for confirmed low testosterone (two low morning tests plus symptoms).", timeline: "Libido in weeks, other effects over months.", sideEffects: "Shuts down sperm production (infertility), raises red-cell count. Not for men wanting children." },
    ],
    experimental:
      "Inositol for PCOS has modest support. Ashwagandha, shatavari and most herbal 'balancers' have small, low-quality trials.",
    costs: [
      { item: "Levothyroxine, per month", usa: "$4–15", india: "$1–2", thailand: "$2–6", indonesia: "$2–5", sriLanka: "$1–3" },
      { item: "Combined contraceptive pill, per month", usa: "$10–30", india: "$1–3", thailand: "$2–8", indonesia: "$2–6", sriLanka: "$1–4" },
      { item: "Hormone blood panel (TSH, testosterone or androgens)", usa: "$50–200", india: "$10–30", thailand: "$30–80", indonesia: "$20–60", sriLanka: "$10–30" },
      { item: "Testosterone therapy, per month", usa: "$30–100", india: "$5–15", thailand: "$20–60", indonesia: "$15–50", sriLanka: "$10–30" },
    ],
    costNote: "Testing is the main cost; the core medicines are cheap generics everywhere.",
    plan: {
      budget: [
        "Targeted tests through your doctor, not a large wellness panel.",
        "Treat what's found with generics: levothyroxine, the pill, metformin.",
        "Lifestyle first for PCOS and borderline testosterone.",
        "Thyroid results off? The Thyroid guide covers TSH, levothyroxine and overactive thyroid in full.",
      ],
      convenient: [
        "One daily tablet at a fixed time (levothyroxine first thing in the morning).",
        "A long-acting form where suitable, such as a hormonal IUD for PCOS cycle protection.",
      ],
    },
    safety: [
      "Women: TSH, prolactin, testosterone, HbA1c and lipids; ultrasound if needed.",
      "Men: two early-morning testosterone tests, LH, FSH, prolactin, blood count and PSA before therapy.",
      "Testosterone and anabolic steroids stop sperm production: discuss fertility first.",
      "Pregnancy test before spironolactone or letrozole.",
    ],
    redFlags: ["Milky nipple discharge or new headaches with vision change", "Very fast heartbeat or tremor", "Missed periods for over 3 months", "Rapid new hair growth or voice deepening in women"],
    sources: [
      { label: "Teede et al., 2023 International Evidence-based Guideline for PCOS", url: "https://pubmed.ncbi.nlm.nih.gov/37580861/" },
      { label: "Bhasin et al., Testosterone Therapy in Men With Hypogonadism: Endocrine Society Guideline (2018)", url: "https://pubmed.ncbi.nlm.nih.gov/29562364/" },
      { label: "Endocrine Society: Testosterone therapy guideline, full text", url: "https://www.endocrine.org/clinical-practice-guidelines/testosterone-therapy" },
    ],
  },

  // ── Thyroid ────────────────────────────────────────────────────────────────
  {
    id: "thyroid",
    category: "thyroid",
    title: "Thyroid problems",
    emoji: "🦋",
    bottomLine:
      "One cheap blood test, TSH, finds almost every thyroid problem, and the main treatment for an underactive thyroid is a tablet that costs a dollar or two a month. Iodine, kelp and 'thyroid support' supplements don't fix it and can make it worse. The real work is taking the tablet the right way and rechecking TSH.",
    image: {
      src: "assets/guides/thyroid.webp",
      ratio: "16:9",
      tone: "morning",
      alt: "A butterfly-shaped thyroid gland at the base of the neck, linked by a soft arc to the brain's control centre",
      subject: "A softly glowing butterfly-shaped thyroid gland at the base of a stylised neck, linked by a gentle curved arrow up to a small glowing control centre at the base of the brain and a second arrow back down, small droplets of hormone flowing outward to the body, simple educational scene with no text, labels or letters",
    },
    rootCause: {
      summary:
        "The brain's pituitary gland sends TSH to tell the thyroid how much hormone (T4, then T3) to make. In most people with thyroid disease, the immune system is the cause: Hashimoto's slowly destroys the gland (underactive), and Graves' over-stimulates it (overactive). Iodine status, pregnancy and some medicines tip the balance too. About one in ten Indian adults has an underactive thyroid, often undiagnosed.",
      drivers: ["Autoimmunity (Hashimoto's, Graves')", "Too little or too much iodine", "Pregnancy and the year after birth", "Medicines: lithium, amiodarone", "Being a woman, age, family history"],
      chain: [
        { label: "Immune system targets the thyroid", detail: "Anti-TPO antibodies (Hashimoto's) or TSH-receptor antibodies (Graves')", actsHere: ["Monitoring TSH"] },
        { label: "Gland makes too little or too much", detail: "T4 and T3 fall, or rise", actsHere: ["Levothyroxine", "Carbimazole / methimazole"] },
        { label: "Pituitary pushes back", detail: "TSH rises when hormone is low, falls when it's high" },
        { label: "Whole-body metabolism shifts", detail: "Energy, weight, heart rate, mood, cycles, cholesterol", actsHere: ["Beta-blockers (symptoms)"] },
        { label: "Long-term harm if untreated", detail: "High cholesterol and heart strain, bone loss, fertility and pregnancy problems", actsHere: ["Radioiodine", "Surgery"] },
      ],
    },
    gimmicks: [
      { name: "'Thyroid support' pills with iodine, kelp or bladderwrack", why: "Iodised salt already covers iodine for most people. Extra iodine can trigger or worsen both underactive and overactive thyroid, especially with Hashimoto's." },
      { name: "Thyroid and adrenal 'glandulars'", why: "Dried animal gland with unpredictable amounts of real thyroid hormone. They can cause an overdose and hide your true results." },
      { name: "Reverse-T3 panels and 'treat the symptoms, not the TSH' clinics", why: "Reverse T3 doesn't guide treatment in guidelines, and dosing to feel 'optimal' rather than to TSH risks heart rhythm problems and bone loss." },
    ],
    protocol: [
      { name: "Levothyroxine (underactive thyroid)", evidence: "proven", what: "A daily synthetic T4 tablet, usually started at about 1.6 mcg per kg (lower if older or with heart disease), adjusted to bring TSH into range. Usually lifelong.", timeline: "Energy improves over 2 to 6 weeks; TSH is rechecked 6 to 8 weeks after each change.", sideEffects: "None at the right dose. Too much causes palpitations, anxiety, poor sleep and, over years, bone loss." },
      { name: "Watchful waiting for mild (subclinical) cases", evidence: "proven", what: "TSH between about 4 and 10 with normal free T4 often settles by itself. Recheck in 6 to 12 weeks, then every 6 to 12 months. Treatment is considered if TSH keeps rising, with symptoms, antibodies, or pregnancy plans.", timeline: "Decided over 3 to 12 months.", sideEffects: "None; avoids lifelong tablets that trials show don't help most older adults with mild cases." },
      { name: "Antithyroid tablets (overactive thyroid)", evidence: "proven", what: "Carbimazole or methimazole for 12 to 18 months for Graves'; propylthiouracil in early pregnancy. About half stay in remission afterwards.", timeline: "Symptoms ease in 3 to 8 weeks.", sideEffects: "Rash, itch; rarely a sudden drop in white cells (agranulocytosis): sore throat with fever needs an urgent blood count. Rare liver injury." },
      { name: "Beta-blockers (overactive thyroid)", evidence: "proven", what: "Propranolol or atenolol calm a racing heart and tremor while other treatment takes effect.", timeline: "Hours to days.", sideEffects: "Tiredness; not for some people with asthma." },
      { name: "Radioactive iodine", evidence: "proven", what: "One drink or capsule that shrinks an overactive gland or nodule. Most people then need levothyroxine for life.", timeline: "Works over 2 to 6 months.", sideEffects: "Not in pregnancy or breastfeeding; can worsen Graves' eye disease, especially in smokers." },
      { name: "Thyroid surgery", evidence: "proven", what: "For large goitres, suspicious nodules, severe Graves' eye disease or when other options fail.", timeline: "One-time; levothyroxine afterwards.", sideEffects: "Voice change or low calcium in a small share of cases; lowest with a high-volume surgeon." },
    ],
    experimental:
      "Selenium may lower anti-TPO antibodies, but trials show no clear benefit for symptoms or thyroid function (it does help mild Graves' eye disease). Adding T3 (liothyronine) helps a minority who still feel unwell on levothyroxine, in trials with mixed results. Gluten-free diets help only if you also have coeliac disease. Ashwagandha and other herbs are untested and can shift thyroid levels.",
    costs: [
      { item: "TSH blood test", usa: "$25–100", india: "$2–6", thailand: "$8–20", indonesia: "$7–18", sriLanka: "$3–8" },
      { item: "Full panel (TSH, free T4, anti-TPO)", usa: "$60–200", india: "$8–20", thailand: "$30–70", indonesia: "$25–60", sriLanka: "$10–25" },
      { item: "Levothyroxine, per month", usa: "$4–15", india: "$1–2", thailand: "$2–6", indonesia: "$2–5", sriLanka: "$1–3" },
      { item: "Carbimazole or methimazole, per month", usa: "$10–30", india: "$1–3", thailand: "$2–6", indonesia: "$2–6", sriLanka: "$1–3" },
      { item: "Endocrinologist visit", usa: "$150–350", india: "$6–20", thailand: "$30–80", indonesia: "$15–40", sriLanka: "$10–30" },
      { item: "Radioactive iodine, one-time", usa: "$1,500–5,000", india: "$100–400", thailand: "$500–1,500", indonesia: "$300–1,000", sriLanka: "$100–400" },
      { item: "Thyroidectomy", usa: "$10,000–25,000", india: "$1,000–3,000", thailand: "$4,000–8,000", indonesia: "$2,500–6,000", sriLanka: "$1,500–4,000" },
    ],
    costNote: "Ongoing care is cheap everywhere: generic tablets plus one or two TSH tests a year. Travelling only makes sense for surgery or radioiodine, and follow-up TSH checks can be done at any local lab.",
    plan: {
      budget: [
        "Start with TSH alone, plus free T4 only if TSH is outside the range. Add anti-TPO once if TSH is mildly high.",
        "Generic levothyroxine from a reliable maker. Stay on the same brand where you can, and retest TSH if it changes.",
        "Retest 6 to 8 weeks after each dose change, then once a year when stable, at a low-cost lab.",
        "Use iodised salt; skip kelp, iodine drops, glandulars and 'thyroid support' blends.",
        "Overactive: generic carbimazole or methimazole with a beta-blocker; radioiodine in India or Sri Lanka costs a fraction of US prices if you need a definitive fix.",
      ],
      convenient: [
        "One tablet on waking with water, then a 30 to 60-minute gap before tea or breakfast. A bedtime dose (3 or more hours after dinner) works too if mornings are hard.",
        "A 90-day supply and a yearly TSH test booked on the same date every year.",
        "Pregnancy plans: a TSH test before trying, and a pre-agreed dose increase as soon as the test is positive.",
      ],
    },
    food: {
      eat: [
        "Iodised salt, in normal amounts",
        "Protein foods with selenium and zinc: eggs, fish, dal, curd, sunflower and pumpkin seeds",
        "Plenty of fibre and vegetables, including cooked cabbage, cauliflower and broccoli",
        "Calcium and iron foods, eaten at least 4 hours apart from the tablet",
      ],
      avoid: [
        "Kelp, seaweed tablets and iodine drops",
        "Calcium, iron, antacids or coffee within 30 minutes to 4 hours of levothyroxine",
        "Biotin supplements in the days before a blood test",
        "Large amounts of raw cruciferous juice or soy supplements, if iodine intake is low",
      ],
      note: "No diet cures autoimmune thyroid disease. Food matters mainly for timing around the tablet and for avoiding iodine excess.",
    },
    safety: [
      "Confirm with a repeat test: one abnormal TSH is rechecked with free T4 before starting lifelong treatment, unless very abnormal.",
      "Tell your doctor about biotin, recent iodine contrast scans, amiodarone, lithium, steroids or the pill, which change results.",
      "Pregnant or planning: TSH before conception, and an early dose increase on levothyroxine (often about 25 to 30%).",
      "On antithyroid tablets: know the warning sign, sore throat or fever, and get a blood count the same day.",
      "Older adults or heart disease: start low and increase slowly.",
      "Any lump in the neck: ultrasound first; a fine-needle biopsy only if the scan suggests it.",
    ],
    redFlags: [
      "Racing or irregular heartbeat, chest pain or breathlessness",
      "Sore throat with fever while on carbimazole or methimazole",
      "A new neck lump, hoarse voice or trouble swallowing",
      "Bulging, red or painful eyes, or double vision",
      "Extreme drowsiness, confusion or feeling very cold (severe underactive thyroid)",
    ],
    sources: [
      { label: "Jonklaas et al., ATA Guidelines for the Treatment of Hypothyroidism (Thyroid, 2014)", url: "https://pubmed.ncbi.nlm.nih.gov/25266247/" },
      { label: "Ross et al., ATA Guidelines for Diagnosis and Management of Hyperthyroidism (Thyroid, 2016)", url: "https://pubmed.ncbi.nlm.nih.gov/27521067/" },
      { label: "Alexander et al., ATA Guidelines for Thyroid Disease During Pregnancy and Postpartum (Thyroid, 2017)", url: "https://pubmed.ncbi.nlm.nih.gov/28056690/" },
      { label: "Garber et al., AACE/ATA Clinical Practice Guidelines for Hypothyroidism in Adults (2012)", url: "https://pubmed.ncbi.nlm.nih.gov/23246686/" },
      { label: "Unnikrishnan et al., Prevalence of hypothyroidism in adults: eight cities of India (2013)", url: "https://pubmed.ncbi.nlm.nih.gov/23961480/" },
      { label: "Surks & Hollowell, Age-specific distribution of TSH in the US population (JCEM, 2007)", url: "https://pubmed.ncbi.nlm.nih.gov/17911171/" },
      { label: "Biondi & Cooper, Subclinical thyroid disease (Lancet, 2012)", url: "https://pubmed.ncbi.nlm.nih.gov/22273398/" },
      { label: "van Zuuren et al., Selenium supplementation for Hashimoto's thyroiditis (Cochrane, 2013)", url: "https://pubmed.ncbi.nlm.nih.gov/23744563/" },
    ],
  },

  // ── Fertility ──────────────────────────────────────────────────────────────
  {
    id: "fertility",
    category: "fertility",
    title: "Fertility and infertility",
    emoji: "🧬",
    bottomLine:
      "Age is the strongest factor, and no supplement offsets it. Infertility is shared: about a third of cases involve the man, a third the woman and a third both or unknown, so test both partners early. IVF abroad can cost a quarter of US prices, but compare live-birth rates, not package prices.",
    image: {
      src: "assets/guides/fertility.webp",
      ratio: "16:9",
      tone: "evening",
      alt: "An egg and sperm near an open tube, with a calendar and an hourglass for timing and age",
      subject: "An egg cell surrounded by a few swimming sperm near an open fallopian tube, with a small calendar and an hourglass in the background suggesting timing and age, simple educational scene with no text, labels or letters",
    },
    rootCause: {
      summary:
        "Pregnancy needs an egg released on time, healthy sperm, open tubes and a receptive womb. Infertility happens when any step fails: ovulation problems (PCOS, thyroid), blocked tubes (infection, endometriosis), fewer or lower-quality eggs with age, or sperm problems.",
      drivers: ["Age (especially over 35)", "PCOS, thyroid", "Past pelvic infection, endometriosis", "Smoking, obesity", "Heat, steroids, testosterone use (men)"],
      chain: [
        { label: "Egg release (ovulation)", detail: "Irregular in PCOS and thyroid disease", actsHere: ["Letrozole", "Weight loss"] },
        { label: "Sperm production", detail: "Varicocele, heat, steroids, smoking", actsHere: ["Stop testosterone", "Varicocele repair"] },
        { label: "Egg meets sperm", detail: "Needs open tubes and good timing", actsHere: ["Timed intercourse", "IUI"] },
        { label: "Embryo implants", detail: "Egg quality falls with age", actsHere: ["IVF / ICSI"] },
        { label: "Pregnancy, or infertility", detail: "No pregnancy after 12 months (6 if over 35)" },
      ],
    },
    gimmicks: [
      { name: "Male antioxidant fertility blends", why: "The large MOXI trial found no improvement in semen or live births." },
      { name: "IVF 'add-ons' sold to everyone", why: "Endometrial scratching, embryo glue and routine extra testing add cost with little or no proven gain in live births." },
      { name: "Fertility teas, detoxes and 'womb cleanses'", why: "No evidence, and some herbs aren't safe in early pregnancy." },
    ],
    protocol: [
      { name: "Timing and lifestyle", evidence: "proven", what: "Sex every 1 to 2 days in the fertile window; stop smoking; healthy weight; folic acid for women.", timeline: "About 80% conceive within 12 months.", sideEffects: "None." },
      { name: "Evaluate both partners", evidence: "proven", what: "Semen analysis; ovulation, thyroid and AMH tests; check the tubes (HSG or ultrasound).", timeline: "After 12 months trying, or 6 if over 35.", sideEffects: "Minor." },
      { name: "Ovulation induction", evidence: "proven", what: "Letrozole is first-line for PCOS.", timeline: "3 to 6 cycles.", sideEffects: "Twins risk; hot flushes." },
      { name: "IUI", evidence: "likely", what: "Washed sperm placed in the womb; useful for mild male factor or unexplained cases.", timeline: "3 to 6 cycles.", sideEffects: "Multiple pregnancy with stimulation." },
      { name: "IVF / ICSI", evidence: "proven", what: "Highest success per cycle, especially for blocked tubes, severe male factor and age.", timeline: "About 6 to 8 weeks per cycle.", sideEffects: "Ovarian hyperstimulation (OHSS), multiple pregnancy, cost." },
    ],
    experimental:
      "Egg freezing for future use is proven technology but success depends heavily on age at freezing. PRP for ovaries and mitochondrial treatments are experimental.",
    costs: [
      { item: "Semen analysis", usa: "$100–200", india: "$5–15", thailand: "$30–60", indonesia: "$20–40", sriLanka: "$8–20" },
      { item: "Letrozole, per cycle", usa: "$10–50", india: "$2–5", thailand: "$5–15", indonesia: "$5–15", sriLanka: "$2–6" },
      { item: "IUI, per cycle", usa: "$500–4,000", india: "$100–300", thailand: "$500–1,200", indonesia: "$400–1,000", sriLanka: "$200–500" },
      { item: "IVF, per cycle", usa: "$15,000–25,000", india: "$2,500–4,500", thailand: "$6,000–10,000", indonesia: "$5,000–8,000", sriLanka: "$3,000–5,000" },
    ],
    costNote: "Thailand restricts some services for foreign couples and India's ART Act regulates clinics; check the current rules before planning travel.",
    plan: {
      budget: [
        "Do the cheap tests first for both: semen analysis and day-21 progesterone or ovulation tracking.",
        "Letrozole cycles if ovulation is the issue.",
        "If IVF is needed, compare clinics by published live-birth rates for your age group and skip add-ons.",
      ],
      convenient: [
        "One combined couple's fertility visit with both sets of tests on the same day.",
        "If over 37, or tubes are blocked, go straight to IVF rather than months of lower-yield steps.",
      ],
    },
    safety: [
      "Women: TSH, prolactin, AMH, rubella immunity, tubal check.",
      "Men: semen analysis by WHO criteria; stop testosterone or anabolic steroids.",
      "Choose a registered clinic (India's ART Act; SART in the USA) with transparent success rates.",
      "Ask about OHSS prevention and single-embryo transfer.",
    ],
    redFlags: ["Severe pelvic pain or bloating during stimulation", "Very heavy or absent periods", "Pain or a lump in a testicle"],
    sources: [
      { label: "WHO: Infertility fact sheet", url: "https://www.who.int/news-room/fact-sheets/detail/infertility" },
      { label: "AUA/ASRM: Diagnosis and Treatment of Infertility in Men, Part I", url: "https://pubmed.ncbi.nlm.nih.gov/33295257/" },
      { label: "Teede et al., 2023 International PCOS Guideline (letrozole first-line)", url: "https://pubmed.ncbi.nlm.nih.gov/37580861/" },
      { label: "Steiner et al., MOXI trial: antioxidants and male infertility (Fertility and Sterility, 2020)" },
    ],
  },
  // ── Muscle and body aches (shown with Inflammation) ────────────────────────
  {
    id: "body-aches",
    category: "inflammation",
    title: "Muscle and body aches",
    emoji: "💪",
    bottomLine:
      "Most everyday body aches come from overuse, poor sleep, stress and inactivity, not from a hidden deficiency, and painkillers only mask them. But low vitamin D, B12, iron or thyroid, and medicines like statins, are common and cheap to test, so check them once instead of buying supplements blind.",
    image: {
      src: "assets/guides/body-aches.webp",
      ratio: "16:9",
      tone: "evening",
      alt: "Sore muscle fibres surrounded by sun, leaf, drop and moon icons for vitamin D, minerals, iron and sleep",
      subject: "Muscle fibres drawn as soft bundles with small glowing spots of soreness, surrounded by floating icons of a sun (vitamin D), a leaf (magnesium), a drop (iron) and a crescent moon (sleep), simple educational scene with no text, labels or letters",
    },
    rootCause: {
      summary:
        "Muscles ache when they're strained, inflamed, short of fuel and minerals, or when the nervous system turns up pain signals. Chronic low-grade inflammation and nutrient deficiencies both lower the threshold, so normal activity starts to hurt.",
      drivers: ["Inactivity, then sudden effort", "Poor sleep, stress", "Low vitamin D, B12, iron, magnesium", "Underactive thyroid", "Excess weight, chronic inflammation", "Medicines (statins), viral illness"],
      chain: [
        { label: "Muscle strain or low fuel", detail: "Micro-tears, low iron or thyroid slow repair", actsHere: ["Graded exercise", "Iron, if low"] },
        { label: "Inflammation in tissues", detail: "Cytokines sensitise nerve endings", actsHere: ["Weight loss", "Sleep"] },
        { label: "Deficiency weakens muscle and bone", detail: "Low vitamin D (bone ache), B12 (nerve pain), magnesium (cramps)", actsHere: ["Vitamin D or B12, if low"] },
        { label: "Pain signals amplified", detail: "Poor sleep and stress turn up the volume", actsHere: ["CBT, exercise", "Duloxetine (fibromyalgia)"] },
        { label: "Widespread aches and fatigue", detail: "Can become a long-term pain cycle" },
      ],
    },
    gimmicks: [
      { name: "Vitamin D megadoses without a test", why: "In trials, vitamin D eases pain mainly in people who are truly deficient; very high doses can raise calcium and harm the kidneys." },
      { name: "Magnesium and multivitamin 'pain relief' blends", why: "Magnesium hasn't beaten placebo for ordinary cramps in older adults; blends add cost, not proof." },
      { name: "Daily painkillers and pain balms as the plan", why: "NSAIDs carry stomach, kidney and heart risks with long use, and they don't fix the cause." },
    ],
    protocol: [
      { name: "Test, then correct real deficiencies", evidence: "proven", what: "Vitamin D, B12, ferritin, TSH, blood count, CRP, and CK if on a statin. Treat only what's low.", timeline: "Deficiency aches ease over 6 to 12 weeks of correction.", sideEffects: "Vitamin D excess raises calcium; iron upsets the stomach." },
      { name: "Graded exercise and stretching", evidence: "proven", what: "Walking, strength work 2 to 3 times a week and stretching. The strongest treatment for widespread pain and fibromyalgia.", timeline: "4 to 12 weeks.", sideEffects: "Mild soreness at first; build up slowly." },
      { name: "Sleep and stress", evidence: "likely", what: "7 to 9 hours, a fixed bedtime; CBT or relaxation for chronic pain.", timeline: "Weeks.", sideEffects: "None." },
      { name: "Lower inflammation", evidence: "likely", what: "Weight loss, fewer processed foods, more vegetables, pulses and fish (see the inflammation guide).", timeline: "Months.", sideEffects: "None." },
      { name: "Short-term pain relief", evidence: "proven", what: "Paracetamol or a short NSAID course; topical diclofenac gel for local pain.", timeline: "Hours.", sideEffects: "NSAIDs: stomach, kidney, blood-pressure effects." },
      { name: "Statin aches: check before stopping", evidence: "proven", what: "In a blinded trial, most aches on statins also appeared on placebo. Your doctor can pause, switch or lower the dose.", timeline: "2 to 4 weeks off to compare.", sideEffects: "Stopping raises heart risk." },
    ],
    experimental:
      "Magnesium for night cramps, turmeric for muscle soreness, cupping and IV vitamin drips have weak or no evidence. Quinine for cramps is effective but carries serious risks and is discouraged.",
    costs: [
      { item: "Vitamin D, B12, ferritin, TSH tests", usa: "$80–250", india: "$15–35", thailand: "$40–100", indonesia: "$30–70", sriLanka: "$15–40" },
      { item: "Vitamin D3 (if low), per month", usa: "$3–10", india: "$1–3", thailand: "$4–10", indonesia: "$3–8", sriLanka: "$2–5" },
      { item: "Vitamin B12 (if low), per month", usa: "$4–10", india: "$1–3", thailand: "$4–10", indonesia: "$3–8", sriLanka: "$2–5" },
      { item: "Physiotherapy session", usa: "$80–150", india: "$5–15", thailand: "$25–50", indonesia: "$15–35", sriLanka: "$8–20" },
    ],
    costNote: "One set of blood tests costs less than a few months of untested supplements.",
    plan: {
      budget: [
        "One blood-test panel: vitamin D, B12, ferritin, TSH, blood count, CRP.",
        "Correct only what's low with generic vitamin D3, B12 or iron.",
        "A free routine: daily walk plus 15 minutes of strength and stretching.",
        "Paracetamol or topical diclofenac for bad days, not daily pills.",
      ],
      convenient: [
        "A weekly vitamin D dose if prescribed, instead of daily tablets.",
        "Two or three short strength sessions a week at home with a band.",
      ],
    },
    food: {
      eat: [
        "Protein at each meal for muscle repair: dal, eggs, paneer, fish, chicken, soy",
        "Vitamin D: oily fish, egg yolks, fortified milk, plus morning sun",
        "B12: eggs, dairy, fish, meat (vegetarians and vegans often need a supplement)",
        "Magnesium and potassium: nuts, seeds, greens, bananas, pulses",
        "Iron with vitamin C: greens, lentils, rajma with lemon or amla",
      ],
      avoid: [
        "Long gaps without protein or water, especially around exercise",
        "Heavy alcohol, which depletes B vitamins and magnesium",
        "Ultra-processed, fried and sugary food that feeds inflammation",
        "Too much caffeine late in the day, which hurts sleep",
      ],
      note: "Vegetarians, people mostly indoors and those over 50 are most often low in B12 or vitamin D.",
    },
    safety: [
      "Blood tests before supplements: vitamin D, B12, ferritin, TSH, CRP, and CK if on a statin.",
      "Pain with morning stiffness in the shoulders and hips over 50: ask about polymyalgia rheumatica.",
      "Widespread pain for over 3 months with fatigue and poor sleep: ask about fibromyalgia.",
      "Don't take NSAIDs regularly with kidney disease, ulcers, heart failure or blood thinners.",
    ],
    redFlags: ["Dark urine with severe muscle pain or weakness", "Muscle weakness (trouble climbing stairs or rising)", "Fever, rash or swollen joints", "Calf pain and swelling in one leg", "Unexplained weight loss"],
    sources: [
      { label: "Macfarlane et al., EULAR revised recommendations for the management of fibromyalgia (2017)", url: "https://pubmed.ncbi.nlm.nih.gov/27377815/" },
      { label: "Cochrane: Vitamin D for chronic painful conditions in adults", url: "https://www.cochrane.org/evidence/CD007771_vitamin-d-treatment-chronic-painful-conditions-adults" },
      { label: "Serum vitamin D and chronic musculoskeletal pain in adults: systematic review (2024)", url: "https://pubmed.ncbi.nlm.nih.gov/39683456/" },
      { label: "BHF: SAMSON trial, no difference in side effects between a statin and a dummy pill (2020)", url: "https://www.bhf.org.uk/what-we-do/news-from-the-bhf/news-archive/2020/november/no-difference-in-side-effects-with-a-statin-or-dummy-pill" },
    ],
  },
];

/** The guides shown for a focus area (Inflammation also shows Muscle and body aches). */
export const guidesFor = (cat: CategoryId) => CONDITION_GUIDES.filter((g) => g.category === cat);

export const guideById = (id: string) => CONDITION_GUIDES.find((g) => g.id === id);

import { useState, useEffect, useRef } from "react";

// ── STORAGE HELPERS ───────────────────────────────────────────────────────────
const STORAGE_KEY = "wellness-profile-v1";
async function saveProfile(p) {
  try { await window.storage.set(STORAGE_KEY, JSON.stringify(p)); } catch(e) {}
}
async function loadProfile() {
  try { const r = await window.storage.get(STORAGE_KEY); return r ? JSON.parse(r.value) : null; }
  catch(e) { return null; }
}
async function clearProfile() {
  try { await window.storage.delete(STORAGE_KEY); } catch(e) {}
}
// 0=Mon … 6=Sun
function getTodayIdx() { return (new Date().getDay() + 6) % 7; }

// ── PALETTE ──────────────────────────────────────────────────────────────────
const C = {
  bg:"#0D1117", surface:"#13182A", card:"#1C2236", border:"#252D45",
  green:"#30D158", teal:"#5AC8FA", orange:"#FF9F0A", red:"#FF453A",
  purple:"#BF5AF2", yellow:"#FFD60A", pink:"#FF6B9D", cyan:"#64D2FF",
  blue:"#0A84FF", rose:"#FF375F",
  text1:"#F2F2F7", text2:"#AEAEB2", text3:"#48484A",
};

// ── GOALS PER GENDER ─────────────────────────────────────────────────────────
const GOALS_MALE = [
  { id:"Cholesterol", icon:"🫀", color:C.orange, short:"Chol."     },
  { id:"Sugar",       icon:"🩸", color:C.green,  short:"Sugar"     },
  { id:"Fertility",   icon:"🧬", color:C.teal,   short:"Fertility" },
  { id:"Gut Health",  icon:"🌱", color:C.purple, short:"Gut"       },
  { id:"Inflammation",icon:"🔥", color:C.pink,   short:"Inflam."   },
];
const GOALS_FEMALE = [
  { id:"Cholesterol",      icon:"🫀", color:C.orange, short:"Chol."     },
  { id:"Sugar",            icon:"🩸", color:C.green,  short:"Sugar"     },
  { id:"Fertility",        icon:"🧬", color:C.teal,   short:"Fertility" },
  { id:"Hormonal Balance", icon:"🌸", color:C.rose,   short:"Hormones"  },
  { id:"Gut Health",       icon:"🌱", color:C.purple, short:"Gut"       },
  { id:"Inflammation",     icon:"🔥", color:C.pink,   short:"Inflam."   },
];

// ── AGE NOTES (gender-aware) ──────────────────────────────────────────────────
const AGE_NOTES = {
  Male: {
    "25-30":"At 25–30, testosterone is near peak. Build strong metabolic habits now — diet, sleep, and exercise done right at this age set the foundation for the next 20 years.",
    "30-35":"At 30–35, desk jobs and stress start affecting lipids, cortisol and gut health. Prioritise daily movement and reduce processed carbs before the numbers worsen.",
    "35-40":"At 35–40, testosterone begins its gradual decline and abdominal fat accumulates faster. Strength training + sleep quality are now as important as diet.",
    "40+":  "After 40, cholesterol tends to spike, prostate health becomes relevant, and insulin resistance deepens. Extra attention to zinc, omega-3, fibre and sleep is critical.",
  },
  Female: {
    "25-30":"At 25–30, focus on building iron stores, bone density, and healthy hormone patterns. This is the best time to address PCOS, thyroid, or cycle irregularities before they compound.",
    "30-35":"At 30–35, PCOS risk peaks, and insulin resistance can develop silently. Stress management, low-glycaemic eating and gut health are especially important now.",
    "35-40":"At 35–40, perimenopause begins for some women. Oestrogen fluctuations affect cholesterol and bone health. Phytoestrogen foods, calcium and strength training become essential.",
    "40+":  "After 40, oestrogen decline sharply raises LDL and cardiovascular risk. Bone density loss accelerates. Calcium, Vitamin D, omega-3 and regular resistance exercise are non-negotiable.",
  },
};

// ── MORNING RITUAL BASE ───────────────────────────────────────────────────────
const MORNING_BASE = [
  "💧 2 glasses warm water immediately on waking — flushes kidneys, activates metabolism",
  "🚶 45-min brisk walk or yoga — the single most powerful intervention for all health goals",
  "🥜 5 soaked almonds + 2 walnuts + 1 tbsp pumpkin seeds before breakfast",
  "🧘 10-min Anulom Vilom pranayama (evening) — lowers cortisol and systemic inflammation",
  "🌙 Dinner by 7:30 PM — 12-hour overnight fast improves all metabolic markers",
];

const MORNING_GENDER = {
  Male: [
    "🌿 ½ tsp Ashwagandha in warm milk at night — supports testosterone and sperm quality",
    "☀️  20-min morning sunlight — testosterone production peaks with Vitamin D exposure",
    "🧄 1 raw garlic clove on empty stomach — allicin supports heart health and blood flow",
  ],
  Female: [
    "🌸 Shatavari powder (½ tsp) in warm milk — Ayurveda's premier women's hormone tonic",
    "☀️  20-min morning sunlight — Vitamin D is critical for hormonal balance and bone health",
    "🫚 1 tsp soaked flaxseeds — phytoestrogens gently support oestrogen balance",
  ],
};

const EXERCISE_PLAN = [
  "🚶 45-min brisk morning walk + 10-min Anulom Vilom pranayama",
  "🧘 45-min walk + 15-min yoga: 5× Surya Namaskar (improves insulin sensitivity)",
  "🚴 30-min cycling or swimming + stair climbing + Bhramari pranayama",
  "🏋️ 30-min bodyweight strength (squats, push-ups, lunges) + 20-min walk",
  "🌿 45-min outdoor nature walk + Paschimottanasana + spinal twists",
  "🏊 60-min active movement: hike / sports / dance (no sitting >30 min)",
  "🌸 30-min gentle yoga + 30-min walk + full meditation + sleep before 10:30 PM",
];

// ── GOAL DATA ─────────────────────────────────────────────────────────────────
const GOAL_DATA = {
  Cholesterol: {
    color:C.orange, icon:"🫀",
    desc:{
      Male:  "Lower LDL, raise HDL, cut triglycerides. Men's risk rises sharply after 35.",
      Female:"Post-35 oestrogen decline raises LDL rapidly. Address it before menopause compounds it.",
    },
    morningAdd:{
      Male:  ["🧄 1–2 raw garlic cloves in warm water — allicin blocks cholesterol synthesis","🌰 1 tbsp ground flaxseed in water — ALA omega-3 reduces LDL","🍃 5 almonds + 2 walnuts — phytosterols block gut cholesterol absorption"],
      Female:["🍃 5 almonds + 2 walnuts — phytosterols block cholesterol absorption","🌱 1 tbsp flaxseeds (soaked) — phytoestrogens + omega-3 double benefit for women","🍃 Amla water — Vitamin C raises HDL, lowers LDL oxidation"],
    },
    remedies:{
      Both:{
        Male:[
          {icon:"🧄",name:"Raw Garlic Daily",       desc:"1–2 cloves crushed in warm water on empty stomach. Allicin lowers LDL by 10–15% and improves blood pressure in men.", tags:["LDL ↓","BP ↓"]},
          {icon:"🌰",name:"Flaxseed Powder",         desc:"1 tbsp in roti dough or curd. ALA omega-3 + lignans reduce LDL. Especially effective in men with high triglycerides.", tags:["LDL ↓","TG ↓"]},
          {icon:"🫐",name:"Pomegranate Daily",        desc:"½ pomegranate seeds. Punicalagins prevent LDL oxidation — the key step in male arterial plaque formation.", tags:["LDL Oxidation ↓"]},
          {icon:"🌸",name:"Arjuna Bark Decoction",   desc:"1 tsp arjuna powder boiled in water, twice daily. Ayurveda's premier cardiac tonic — clinically reduces total cholesterol in men.", tags:["LDL ↓","Heart ↑"]},
          {icon:"🥣",name:"Oats + Isabgol",           desc:"Daily oats + 1 tsp psyllium before dinner. Beta-glucan + soluble fibre bind bile acids, forcing liver to use cholesterol.", tags:["LDL ↓"]},
        ],
        Female:[
          {icon:"🌱",name:"Flaxseeds (Phytoestrogen)",desc:"1 tbsp soaked flaxseeds daily. Lignans act as phytoestrogens AND reduce LDL — double benefit for women over 35.", tags:["LDL ↓","Hormones ↑"]},
          {icon:"🍃",name:"Amla + Arjuna Kadha",      desc:"Amla juice + arjuna decoction each morning. Synergistic — amla raises HDL while arjuna reduces total cholesterol.", tags:["HDL ↑","LDL ↓"]},
          {icon:"🫐",name:"Pomegranate Daily",         desc:"½ pomegranate seeds. Post-menopausal women show highest benefit from pomegranate's anti-LDL oxidation effects.", tags:["LDL Oxidation ↓"]},
          {icon:"🥣",name:"Psyllium Husk (Isabgol)",   desc:"1 tsp before dinner. Most evidence-backed soluble fibre for cholesterol reduction in women.", tags:["LDL ↓"]},
          {icon:"🌰",name:"Walnuts Daily",              desc:"4–6 walnuts per day. ALA omega-3 raises HDL — especially important for women post-35 as oestrogen declines.", tags:["HDL ↑","LDL ↓"]},
        ],
      },
      Modern:{
        Male:[
          {icon:"🥣",name:"Psyllium Husk",        desc:"1 tsp in water before dinner. Binds bile acids, forcing cholesterol usage.", tags:["LDL ↓"]},
          {icon:"🐟",name:"Omega-3 Sources",       desc:"Walnuts + chia + flaxseeds daily. Raises HDL and cuts VLDL triglycerides.", tags:["HDL ↑","TG ↓"]},
          {icon:"🍎",name:"Apple Cider Vinegar",   desc:"1 tbsp diluted before meals. Reduces total cholesterol and triglycerides.", tags:["TG ↓"]},
          {icon:"🫐",name:"Polyphenol Foods",       desc:"Pomegranate + amla + green tea. Prevent LDL oxidation — key to artery health.", tags:["LDL Oxidation ↓"]},
          {icon:"⏱️",name:"Intermittent Fasting",  desc:"12-hr overnight fast. Reduces fasting LDL and triglycerides in 4–6 weeks.", tags:["LDL ↓","TG ↓"]},
        ],
        Female:[
          {icon:"🥣",name:"Psyllium Husk",         desc:"1 tsp before dinner. Top evidence-backed cholesterol reducer in women's trials.", tags:["LDL ↓"]},
          {icon:"🌱",name:"Flaxseeds + Soy (moderate)",desc:"1 tbsp flaxseeds + moderate tofu/soy. Phytoestrogens reduce post-menopausal LDL elevation.", tags:["LDL ↓","Hormones"]},
          {icon:"🫐",name:"Polyphenol Foods",        desc:"Pomegranate + amla + green tea + berries. Women benefit more from polyphenols for LDL oxidation.", tags:["LDL Oxidation ↓"]},
          {icon:"🐟",name:"Omega-3 Foods",           desc:"Walnuts + chia + flaxseeds. EPA/DHA raise HDL — critical as oestrogen protection declines.", tags:["HDL ↑"]},
          {icon:"⏱️",name:"Intermittent Fasting",   desc:"12-hr overnight fast. Reduces insulin + LDL. (Note: avoid >16-hr fasting for women — it raises cortisol).", tags:["LDL ↓"]},
        ],
      },
      Ayurvedic:{
        Male:[
          {icon:"🌸",name:"Arjuna Bark Tea",    desc:"Boil arjuna powder twice daily. Premier Ayurvedic heart tonic for men.", tags:["LDL ↓"]},
          {icon:"🌿",name:"Guggul",              desc:"Guggulsterones inhibit cholesterol synthesis — equivalent to mild statins.", tags:["LDL ↓"]},
          {icon:"🪷",name:"Triphala at Bedtime", desc:"1 tsp in warm water. Cleanses liver and reduces medha dhatu (fat tissue).", tags:["Cholesterol ↓"]},
          {icon:"🧄",name:"Garlic + Honey",      desc:"2 garlic cloves + ½ tsp honey on empty stomach. Lowers serum cholesterol.", tags:["LDL ↓"]},
          {icon:"🍃",name:"Amla Daily",          desc:"Fresh amla or powder — Vitamin C reduces LDL by 15–20% in Ayurvedic studies.", tags:["LDL ↓","HDL ↑"]},
        ],
        Female:[
          {icon:"🌸",name:"Arjuna + Shatavari",  desc:"Arjuna for heart + Shatavari for hormones. The classic Ayurvedic combo for women's cardiac health.", tags:["LDL ↓","Hormones"]},
          {icon:"🌿",name:"Guggul (Kanchanara)", desc:"Kanchanara guggul — specifically formulated for women, addresses both cholesterol and thyroid.", tags:["LDL ↓"]},
          {icon:"🪷",name:"Triphala at Bedtime", desc:"1 tsp in warm water. Liver cleanse and cholesterol reduction for all genders.", tags:["Cholesterol ↓"]},
          {icon:"🍃",name:"Amla + Hibiscus Tea", desc:"Amla juice + hibiscus tea daily. Hibiscus lowers LDL and supports female hormonal balance.", tags:["LDL ↓","Hormones"]},
          {icon:"🌺",name:"Lodhra Bark",         desc:"1 tsp lodhra powder in warm water. Traditional Ayurvedic herb for women — reduces inflammation and cholesterol.", tags:["LDL ↓"]},
        ],
      },
    },
    foodsToEat:{
      Male: ["Oats","Barley","Rajma","Chickpeas","Moong Dal","Walnuts","Almonds","Flaxseeds","Chia Seeds","Olive Oil","Pomegranate","Amla","Brown Rice","Garlic","Ginger","Psyllium Husk","Green Tea","Mackerel/Rohu (Non-veg)","Soy (moderate)","Pumpkin Seeds"],
      Female:["Flaxseeds","Walnuts","Almonds","Oats","Rajma","Chickpeas","Moong Dal","Pomegranate","Amla","Brown Rice","Soy/Tofu (moderate)","Hibiscus Tea","Olive Oil","Garlic","Psyllium Husk","Green Tea","Berries","Papaya","Sesame Seeds","Dark Leafy Greens"],
    },
    foodsToAvoid:["Full-fat Dairy","Butter & Ghee (excess)","Fried Foods","Trans Fats","Packaged Snacks","Refined Oil","Cream-based Curries","Processed Meats","Coconut Oil (excess)","Alcohol"],
    tips:{
      Male:[
        {icon:"🏃",t:"Exercise = Natural Statin",     d:"45-min daily walk reduces LDL by 5–10% in men. Strength training additionally raises HDL."},
        {icon:"🫒",t:"Switch Cooking Oil",             d:"Replace refined oil with mustard or olive oil. Max 3 tsp/day. This alone improves lipid profile."},
        {icon:"🚬",t:"Quit Smoking",                   d:"Smoking reduces HDL (good cholesterol) by 5–10 mg/dL. No dietary intervention overcomes active smoking."},
        {icon:"📊",t:"Retest in 6 Weeks",              d:"Most dietary changes show measurable impact in fasting lipid profile within 4–6 weeks."},
      ],
      Female:[
        {icon:"🏃",t:"Cardio + Weights",               d:"Combine 30-min cardio + 20-min strength training 3×/week. Post-oestrogen decline, this is the most effective intervention."},
        {icon:"🌸",t:"Oestrogen & Cholesterol",        d:"Oestrogen naturally keeps LDL low before menopause. After 40, dietary fat quality matters more than ever."},
        {icon:"🫒",t:"Use Olive or Sesame Oil",        d:"Phytosterols in these oils reduce cholesterol absorption. Max 3 tsp/day total cooking oil."},
        {icon:"📊",t:"Annual Lipid Check",             d:"Women's LDL can spike rapidly post-35. Annual fasting lipid profile is essential."},
      ],
    },
  },

  Sugar: {
    color:C.green, icon:"🩸",
    desc:{
      Male:  "Stabilise fasting glucose, reduce HbA1c, improve insulin sensitivity through low-GI eating.",
      Female:"PCOS affects 1 in 5 Indian women and causes insulin resistance. Managing sugar is the #1 PCOS intervention.",
    },
    morningAdd:{
      Male:  ["🌿 Overnight methi water — slows glucose absorption all morning","🫗 ½ tsp cinnamon in warm water — reduces post-meal sugar spike 20–30%","🥒 50ml karela juice diluted — activates same pathway as metformin"],
      Female:["🌿 Overnight methi water — especially important for PCOS-related insulin resistance","🌸 Spearmint tea — reduces androgens that worsen PCOS insulin issues","🫗 ½ tsp cinnamon in warm water — improves insulin sensitivity in women with PCOS"],
    },
    remedies:{
      Both:{
        Male:[
          {icon:"🌿",name:"Methi Seeds",       desc:"Soak 1 tsp overnight, drink on empty stomach. Galactomannan fibre slows glucose absorption.",tags:["Fasting Sugar ↓"]},
          {icon:"🫗",name:"Cinnamon Water",     desc:"½ tsp before meals. Reduces post-meal blood sugar spikes by 20–30% in men.",tags:["Post-meal Sugar ↓"]},
          {icon:"🥒",name:"Karela Juice",       desc:"50ml diluted daily. Polypeptide-P mimics insulin. Most studied anti-diabetic herb.",tags:["Blood Sugar ↓"]},
          {icon:"🌱",name:"Jamun Seed Powder",  desc:"½ tsp with water. Jamboline inhibits sugar conversion — traditional male diabetic remedy.",tags:["Fasting Sugar ↓"]},
          {icon:"⏱️",name:"12-Hr Overnight Fast",desc:"7pm–7am eating window. Reduces fasting insulin and glucose in 4–6 weeks.",tags:["Insulin ↓","Sugar ↓"]},
        ],
        Female:[
          {icon:"🌿",name:"Methi Seeds",        desc:"Essential for women with PCOS — galactomannan reduces insulin resistance specifically linked to androgen excess.",tags:["Insulin Resistance ↓"]},
          {icon:"🌸",name:"Spearmint Tea",       desc:"2 cups daily. Reduces elevated androgens (testosterone) in PCOS women, which directly improves insulin sensitivity.",tags:["Androgens ↓","Sugar ↓"]},
          {icon:"🫗",name:"Cinnamon Water",      desc:"½ tsp before meals. Clinical trials in PCOS women show fasting sugar improvement in 8 weeks.",tags:["PCOS","Sugar ↓"]},
          {icon:"🥒",name:"Karela Juice",        desc:"50ml diluted. Improves glucose metabolism and helps regulate menstrual cycles in PCOS.",tags:["Sugar ↓","PCOS"]},
          {icon:"🌱",name:"Inositol-rich Foods", desc:"Chickpeas, lentils, oranges, cantaloupe. Inositol is clinically proven to improve insulin sensitivity in PCOS women.",tags:["PCOS","Insulin ↓"]},
        ],
      },
      Modern:{
        Male:[
          {icon:"🚶",name:"Post-meal Walk",      desc:"10-min walk after every meal. Muscles consume glucose, blunting spike by 30%.",tags:["Post-meal Sugar ↓"]},
          {icon:"⏱️",name:"Intermittent Fasting",desc:"16:8 window reduces fasting insulin significantly in men.",tags:["Insulin ↓"]},
          {icon:"🌿",name:"Methi + Isabgol",      desc:"Combined soluble fibre — most evidence-backed combo for male type-2 prevention.",tags:["Sugar ↓"]},
          {icon:"📉",name:"Low-GI Swap",          desc:"Brown rice (GI 50) over white (GI 72). Ragi (GI 68) over maida (GI 85).",tags:["Glycaemic Control"]},
          {icon:"💪",name:"Strength Training",    desc:"Building muscle mass is the most underrated blood sugar intervention. Muscle absorbs glucose.",tags:["Insulin Sensitivity ↑"]},
        ],
        Female:[
          {icon:"🚶",name:"Post-meal Walk",       desc:"10-min walk after meals. More effective in women with PCOS than in metabolically normal women.",tags:["Post-meal Sugar ↓"]},
          {icon:"⏱️",name:"12-Hr Fast Only",      desc:"Limit fast to 12 hrs for women — longer fasting raises cortisol in women more than men.",tags:["Insulin ↓"]},
          {icon:"🌸",name:"Inositol Supplement",  desc:"Myo-inositol (from food or supplement) is clinically proven for PCOS insulin resistance.",tags:["PCOS","Insulin ↓"]},
          {icon:"📉",name:"Low-GI Diet",           desc:"Low-glycaemic eating is the #1 diet intervention for PCOS. Ragi, oats, dal over maida.",tags:["PCOS","Sugar ↓"]},
          {icon:"💪",name:"Resistance Training",   desc:"Strength training 3×/week improves insulin sensitivity more than cardio alone in PCOS women.",tags:["Insulin Sensitivity ↑"]},
        ],
      },
      Ayurvedic:{
        Male:[
          {icon:"🌱",name:"Vijayasar Tumbler",   desc:"Fill water in vijayasar wood glass overnight. Traditional Ayurvedic anti-diabetic for men.",tags:["Blood Sugar ↓"]},
          {icon:"🍃",name:"Neem Leaves",          desc:"4–5 neem leaves on empty stomach. Blood purifier and insulin sensitiser.",tags:["Sugar ↓"]},
          {icon:"🌿",name:"Gurmar (Gymnema)",      desc:"'Sugar destroyer' — chewing leaves blocks sweet taste and sugar absorption.",tags:["Sugar ↓"]},
          {icon:"🌸",name:"Tulsi Kadha",           desc:"Tulsi + ginger boiled — reduces cortisol-driven blood sugar in men.",tags:["Sugar ↓"]},
          {icon:"🫚",name:"Bitter Gourd Sabzi",   desc:"Karela sabzi 3×/week — not just juice, eating the whole vegetable is effective too.",tags:["Blood Sugar ↓"]},
        ],
        Female:[
          {icon:"🌸",name:"Shatavari + Methi",   desc:"Shatavari supports female hormones while methi lowers blood sugar. Combined effect for PCOS.",tags:["PCOS","Sugar ↓"]},
          {icon:"🌺",name:"Lodhra + Ashoka",      desc:"Traditional Ayurvedic combination for female reproductive health + blood sugar regulation.",tags:["PCOS","Hormones"]},
          {icon:"🌿",name:"Gurmar (Gymnema)",      desc:"Blocks sugar absorption — equally effective in women, regardless of PCOS status.",tags:["Sugar ↓"]},
          {icon:"🌸",name:"Tulsi + Spearmint Tea", desc:"Tulsi reduces cortisol + spearmint reduces androgens. Powerful PCOS combination.",tags:["PCOS","Sugar ↓"]},
          {icon:"🍃",name:"Neem Leaves",           desc:"4–5 neem leaves on empty stomach — blood purifier, anti-androgenic properties benefit PCOS.",tags:["PCOS","Sugar ↓"]},
        ],
      },
    },
    foodsToEat:{
      Male: ["Bitter Gourd","Methi Leaves","Jamun","Cinnamon","Turmeric","Brown Rice","Ragi","Jowar","Bajra","Oats","Moong Dal","Chana Dal","Leafy Greens","Cucumber","Lauki","Amla","Guava","Pear"],
      Female:["Bitter Gourd","Methi Leaves","Spearmint","Cinnamon","Chickpeas (Inositol)","Lentils","Brown Rice","Ragi","Oats","Flaxseeds","Leafy Greens","Amla","Berries","Guava","Pumpkin Seeds","Sesame Seeds","Turmeric"],
    },
    foodsToAvoid:["White Rice (excess)","Maida","Refined Sugar","Sugary Tea & Coffee","Packaged Juices","Sweets & Mithai","White Bread","Instant Noodles","Sweetened Yoghurt","Excess Fruits (mango, banana)"],
    tips:{
      Male:[
        {icon:"🍽️",t:"Plate Method",       d:"½ plate non-starchy veg + ¼ protein + ¼ complex carb. Reduces post-meal glucose by 20–25%."},
        {icon:"🕖",t:"Early Dinner",        d:"Dinner by 7:30 PM. Late eating disrupts circadian insulin rhythm in men."},
        {icon:"💪",t:"Build Muscle",        d:"Every 1kg of muscle gained improves insulin sensitivity — the most underrated blood sugar strategy."},
        {icon:"🚶",t:"Post-meal Walk",      d:"10-min walk after every meal. Most effective and completely free intervention."},
      ],
      Female:[
        {icon:"🌸",t:"PCOS & Insulin",      d:"PCOS affects 1 in 5 Indian women. Insulin resistance is the root cause in 70% of cases. Low-GI diet is treatment."},
        {icon:"🍽️",t:"Never Skip Meals",    d:"Meal skipping raises cortisol in women, worsening insulin resistance and worsening PCOS symptoms."},
        {icon:"💪",t:"Strength Training",   d:"Resistance training 3×/week is more effective than cardio alone for insulin sensitivity in women."},
        {icon:"😴",t:"Sleep Quality",       d:"Poor sleep raises morning cortisol and blood sugar, and worsens PCOS. 8 hrs is medicine."},
      ],
    },
  },

  Fertility: {
    color:C.teal, icon:"🧬",
    desc:{
      Male:  "Improve sperm count, motility & morphology. Boost testosterone naturally with zinc, omega-3 and targeted Ayurvedic herbs.",
      Female:"Improve egg quality, support ovulation, regulate cycles and create the best hormonal environment for conception.",
    },
    morningAdd:{
      Male:[
        "🌿 Ashwagandha ½ tsp in warm milk at night — proven to raise testosterone and sperm count by 167%",
        "🎃 1 tbsp pumpkin seeds — richest plant source of zinc, essential for sperm production",
        "🍅 Cooked tomato — lycopene reduces sperm DNA fragmentation significantly",
      ],
      Female:[
        "🌸 Shatavari ½ tsp in warm milk — Ayurveda's premier female reproductive tonic; supports FSH and oestrogen",
        "🫚 1 tbsp soaked flaxseeds — phytoestrogens support oestrogen balance and egg quality",
        "🍃 Folate-rich foods (methi, spinach, dal) — critical for egg health and early pregnancy",
      ],
    },
    remedies:{
      Both:{
        Male:[
          {icon:"🌿",name:"Ashwagandha (Withania)",    desc:"½ tsp in warm milk at night. 90-day RCTs show 167% sperm count increase, 57% motility improvement and raised testosterone.",tags:["Count ↑","Testosterone ↑"]},
          {icon:"🎃",name:"Pumpkin Seeds (Zinc)",       desc:"2 tbsp daily. Zinc is the #1 micronutrient for testosterone synthesis. Deficiency directly causes low sperm count.",tags:["Testosterone ↑","Count ↑"]},
          {icon:"🍅",name:"Cooked Tomatoes (Lycopene)", desc:"3–4×/week. Lycopene reduces oxidative stress in testes and improves sperm morphology — clinically proven.",tags:["Morphology ↑"]},
          {icon:"🪨",name:"Shilajit",                   desc:"Small amount in warm milk. Fulvic acid + 80+ trace minerals — Ayurveda's premier male reproductive rejuvenator.",tags:["Testosterone ↑","Energy ↑"]},
          {icon:"🌰",name:"Walnuts Daily",               desc:"4–6 walnuts. DHA omega-3 is a structural component of the sperm tail membrane — directly improves motility.",tags:["Motility ↑"]},
        ],
        Female:[
          {icon:"🌸",name:"Shatavari",                  desc:"½ tsp in warm milk morning and night. Adaptogen that supports FSH/LH balance, oestrogen production and uterine lining.",tags:["Egg Quality ↑","Cycle ↑"]},
          {icon:"🌺",name:"Ashoka Bark Decoction",       desc:"Boil ashoka bark in water, drink twice daily. Premier Ayurvedic uterine tonic — regulates cycle and reduces endometrial irregularities.",tags:["Cycle ↑","Uterus ↑"]},
          {icon:"🌿",name:"Methi + Lodhra",              desc:"Methi improves insulin sensitivity (critical for PCOS fertility) + lodhra bark regulates LH/FSH ratio.",tags:["PCOS","Cycle ↑"]},
          {icon:"🫚",name:"Flaxseeds (Phytoestrogen)",   desc:"1 tbsp soaked flaxseeds daily. Lignans mimic oestrogen gently — supports follicular phase and egg maturation.",tags:["Oestrogen ↑","Egg Quality ↑"]},
          {icon:"🫐",name:"Antioxidant Protocol",         desc:"Pomegranate + amla + berries daily. Antioxidants reduce oxidative stress on eggs — critical for egg quality after 30.",tags:["Egg Quality ↑"]},
        ],
      },
      Modern:{
        Male:[
          {icon:"🎃",name:"Zinc (Pumpkin Seeds)",        desc:"2 tbsp daily. Zinc deficiency is the #1 micronutrient cause of male infertility worldwide.",tags:["Count ↑","Testosterone ↑"]},
          {icon:"🥚",name:"Selenium + Vitamin E",         desc:"Sunflower seeds + almonds daily. This combination improves sperm motility in multiple RCTs.",tags:["Motility ↑"]},
          {icon:"🫐",name:"Antioxidant Protocol",         desc:"Pomegranate + amla + walnuts daily. Neutralise free radicals that cause sperm DNA fragmentation.",tags:["DNA Integrity ↑"]},
          {icon:"🍅",name:"Lycopene Foods",               desc:"Cooked tomato 3–4×/week + watermelon. Lycopene is the most studied antioxidant for male fertility.",tags:["Morphology ↑"]},
          {icon:"☀️",name:"Vitamin D (Sunlight)",         desc:"20-min morning sunlight. Vitamin D receptors exist in the testes — deficiency reduces testosterone by 30%.",tags:["Testosterone ↑"]},
        ],
        Female:[
          {icon:"🌿",name:"Folate-Rich Foods",            desc:"Methi, spinach, dal, chickpeas daily. Folate is non-negotiable for egg quality and prevents neural tube defects.",tags:["Egg Quality ↑"]},
          {icon:"🌸",name:"Inositol (Myo-Inositol)",      desc:"Found in chickpeas, lentils, oranges. Clinical gold standard for PCOS-related ovulatory infertility.",tags:["PCOS","Ovulation ↑"]},
          {icon:"🫐",name:"CoQ10 via Antioxidant Foods",  desc:"Pomegranate + berries + amla. CoQ10 equivalent from food reduces egg oxidative damage, especially after 35.",tags:["Egg Quality ↑"]},
          {icon:"🐟",name:"Omega-3 Foods",                desc:"Flaxseeds + walnuts + chia. DHA improves embryo quality and supports uterine blood flow.",tags:["Uterus ↑","Egg Quality ↑"]},
          {icon:"☀️",name:"Vitamin D + Iron",             desc:"20-min sunlight + iron-rich foods. Both deficiencies impair ovulation — extremely common in Indian women.",tags:["Ovulation ↑"]},
        ],
      },
      Ayurvedic:{
        Male:[
          {icon:"🌿",name:"Ashwagandha",    desc:"½ tsp in warm milk nightly. Most evidence-backed Ayurvedic herb for male reproductive health.",tags:["Count ↑","Testosterone ↑"]},
          {icon:"🪨",name:"Shilajit",        desc:"Fulvic acid + 80+ trace minerals — comprehensive male reproductive tonic.",tags:["Testosterone ↑"]},
          {icon:"🌱",name:"Safed Musli",     desc:"1 tsp in warm milk. Increases sperm production, reduces cortisol, classified as a Vajikaran herb.",tags:["Count ↑"]},
          {icon:"🌸",name:"Gokshura",        desc:"Stimulates LH release, naturally boosting testosterone levels without side effects.",tags:["Testosterone ↑"]},
          {icon:"🌺",name:"Kapikacchu (Mucuna)",desc:"L-DOPA precursor — improves testosterone, mood and sperm quality simultaneously.",tags:["Quality ↑"]},
        ],
        Female:[
          {icon:"🌸",name:"Shatavari",               desc:"The most revered Ayurvedic female herb. Supports all stages of female fertility — from follicular development to uterine lining.",tags:["Egg Quality ↑","Cycle ↑"]},
          {icon:"🌺",name:"Ashoka + Lodhra",          desc:"Classical Ayurvedic combination for uterine health, cycle regulation and reducing menstrual disorders.",tags:["Uterus ↑","Cycle ↑"]},
          {icon:"🌿",name:"Kanchanara Guggul",        desc:"Specifically for PCOS and ovarian cysts in Ayurveda. Reduces cyst formation and normalises ovulation.",tags:["PCOS","Ovulation ↑"]},
          {icon:"🌱",name:"Safed Musli",              desc:"1 tsp in warm milk. Acts as female Vajikaran — nourishes reproductive tissues (artava dhatu).",tags:["Egg Quality ↑"]},
          {icon:"🫚",name:"Sesame + Ghee",            desc:"Sesame seeds + 1 tsp ghee daily. Both nourish artava dhatu (reproductive tissue) in Ayurvedic texts.",tags:["Uterus ↑"]},
        ],
      },
    },
    foodsToEat:{
      Male: ["Pumpkin Seeds (Zinc)","Walnuts (Omega-3)","Cooked Tomatoes (Lycopene)","Pomegranate","Eggs","Paneer","Chickpeas","Sunflower Seeds (Selenium)","Dark Chocolate (70%+)","Spinach","Ashwagandha Milk","Almonds","Garlic","Ginger","Amla","Brown Rice","Safed Musli Milk","Bananas"],
      Female:["Shatavari Milk","Flaxseeds","Spinach (Folate)","Methi (Folate)","Chickpeas (Inositol)","Lentils (Folate)","Pomegranate","Sesame Seeds","Amla","Walnuts","Berries","Pumpkin Seeds","Sweet Potato","Avocado","Ghee (1 tsp)","Brown Rice","Safed Musli","Ashoka Tea"],
    },
    foodsToAvoid:{
      Male: ["Alcohol","Excess Soy","Refined Sugar","Junk Food","Plastic-wrapped Hot Food","Excessive Caffeine","Processed Meats","Trans Fats","Hot Tubs & Tight Synthetics","BPA Plastics"],
      Female:["Refined Sugar (disrupts ovulation)","Excess Dairy (PCOS)","Alcohol","Trans Fats","Processed Foods","Excess Caffeine","Refined Carbs (raise insulin)","Plastic Containers (BPA)","Excess Soy (isoflavones)","Alcohol"],
    },
    tips:{
      Male:[
        {icon:"🌡️",t:"Avoid Testicular Heat",   d:"Avoid laptops on lap, hot tubs, tight synthetics. Sperm production requires 2°C below body temperature."},
        {icon:"😴",t:"Sleep = Testosterone",     d:"Testosterone is produced during deep sleep cycles. 7–8 hrs is non-negotiable for sperm count and quality."},
        {icon:"🧘",t:"Stress Kills Sperm",       d:"Chronic stress raises cortisol, which directly suppresses testosterone and sperm production."},
        {icon:"🚰",t:"Avoid BPA Plastics",       d:"Switch to glass or copper vessels. BPA and phthalates are endocrine disruptors that lower sperm count."},
      ],
      Female:[
        {icon:"📅",t:"Track Your Cycle",         d:"Use a cycle app to identify your fertile window (days 11–16 approx). BBT tracking and LH strips improve timing."},
        {icon:"😴",t:"Sleep Regulates Hormones", d:"Melatonin protects egg quality during overnight hours. 8 hrs before 10:30 PM supports optimal FSH and LH patterns."},
        {icon:"🧘",t:"Stress Suppresses Ovulation",d:"Chronic stress raises cortisol → suppresses GnRH → disrupts ovulation. Daily pranayama is reproductive medicine."},
        {icon:"🚰",t:"Avoid Endocrine Disruptors",d:"Use glass/steel storage, chemical-free cookware and natural personal care products. BPA disrupts female hormones."},
      ],
    },
  },

  "Hormonal Balance": {
    color:C.rose, icon:"🌸",
    desc:{
      Female:"Balance oestrogen, progesterone and androgens. Address PCOS, irregular cycles, thyroid, PMS and perimenopause naturally.",
    },
    morningAdd:{
      Female:["🌸 Shatavari powder in warm milk — premier Ayurvedic female hormone tonic","🫚 1 tsp soaked flaxseeds — phytoestrogens gently support oestrogen levels","🌺 Spearmint tea — clinically proven to reduce excess androgens in PCOS women"],
    },
    remedies:{
      Both:{
        Female:[
          {icon:"🌸",name:"Shatavari",              desc:"½ tsp in warm milk morning and night. Adaptogen that supports oestrogen production, FSH balance, and reduces PMS symptoms.",tags:["Hormones ↑","PMS ↓"]},
          {icon:"🌺",name:"Spearmint Tea",           desc:"2 cups daily. Reduces elevated free testosterone in PCOS women — clinically proven in RCTs.",tags:["Androgens ↓","PCOS"]},
          {icon:"🌿",name:"Methi + Lodhra",          desc:"Methi seeds (blood sugar) + lodhra bark (hormone regulator). Traditional Ayurvedic combination for PCOS.",tags:["PCOS","Cycle ↑"]},
          {icon:"🌺",name:"Ashoka Bark Decoction",  desc:"Boil ashoka bark in water. Premier Ayurvedic uterine tonic — regulates menstrual cycle and reduces dysmenorrhoea.",tags:["Cycle ↑","PMS ↓"]},
          {icon:"🫚",name:"Flaxseeds (Phytoestrogens)",desc:"1 tbsp daily soaked. Lignans act as mild phytoestrogens, helping balance oestrogen-progesterone ratio.",tags:["Oestrogen ↑","Hormones"]},
        ],
      },
      Modern:{
        Female:[
          {icon:"🌸",name:"Inositol (Myo + D-Chiro)",desc:"Found in chickpeas, lentils, oranges. Clinical gold standard for PCOS insulin and hormonal regulation.",tags:["PCOS","Insulin ↓","LH ↓"]},
          {icon:"🌺",name:"Spearmint Tea",            desc:"2 cups daily. Reduces free testosterone in PCOS — one of the best-studied herbal interventions.",tags:["Androgens ↓"]},
          {icon:"🫚",name:"Omega-3 (Flax + Walnuts)", desc:"Daily omega-3 reduces prostaglandin-driven menstrual pain and regulates LH/FSH ratio.",tags:["PMS ↓","Hormones"]},
          {icon:"🌿",name:"Low-GI Diet",               desc:"Low-glycaemic eating reduces insulin → reduces androgen production in ovaries. The root PCOS fix.",tags:["PCOS","Androgens ↓"]},
          {icon:"☀️",name:"Vitamin D3",               desc:"Critical for progesterone production and thyroid function. 20-min sunlight + Vitamin D-rich foods.",tags:["Progesterone ↑","Thyroid ↑"]},
        ],
      },
      Ayurvedic:{
        Female:[
          {icon:"🌸",name:"Shatavari",               desc:"The most revered Ayurvedic female herb. Supports all stages — menstruation, fertility, perimenopause.",tags:["Hormones ↑"]},
          {icon:"🌺",name:"Ashoka + Lodhra",          desc:"Classical combination for uterine health, cycle regulation and reducing menstrual pain.",tags:["Cycle ↑","PMS ↓"]},
          {icon:"🌿",name:"Kanchanara Guggul",        desc:"Specifically for PCOS and thyroid health in Ayurveda. Reduces cyst formation.",tags:["PCOS","Thyroid"]},
          {icon:"🧘",name:"Yoga Nidra Daily",         desc:"Deep relaxation practice. Reduces cortisol and prolactin — two key hormone disruptors in women.",tags:["Cortisol ↓","Hormones"]},
          {icon:"🫚",name:"Sesame + Castor Oil Massage",desc:"Warm sesame oil abdominal massage on days 1–14 of cycle. Ayurvedic practice to support follicular phase.",tags:["Cycle ↑"]},
        ],
      },
    },
    foodsToEat:{
      Female:["Flaxseeds (Phytoestrogen)","Shatavari","Spearmint","Soy/Tofu (moderate)","Chickpeas (Inositol)","Lentils","Sesame Seeds","Pomegranate","Berries","Dark Leafy Greens","Broccoli","Sweet Potato","Pumpkin Seeds","Cinnamon","Turmeric","Amla","Vitamin D Foods","Zinc-rich Foods"],
    },
    foodsToAvoid:["Refined Sugar (disrupts cortisol)","Excess Dairy (PCOS)","Processed Soy (excess)","Alcohol","Refined Carbs","Trans Fats","Excess Caffeine (disrupts cortisol)","Plastic Containers","Chemical Cosmetics","Fried Foods"],
    tips:{
      Female:[
        {icon:"🌙",t:"Track Your Cycle",         d:"Use an app to track your cycle. Identify luteal phase (days 15–28) when cravings and mood dips occur — adjust diet accordingly."},
        {icon:"😴",t:"Sleep Regulates Hormones", d:"Melatonin, cortisol, oestrogen and progesterone all depend on sleep quality. 8 hrs before 10:30 PM is hormone medicine."},
        {icon:"🧘",t:"Cortisol = Hormone Chaos", d:"Chronic stress raises cortisol, which suppresses progesterone and worsens PCOS/PMS. Daily pranayama is non-negotiable."},
        {icon:"🚫",t:"Reduce Endocrine Disruptors",d:"Avoid heating food in plastic, switch to glass/steel storage, choose chemical-free personal care products."},
      ],
    },
  },

  "Gut Health": {
    color:C.purple, icon:"🌱",
    desc:{
      Male:  "Heal gut lining, build diverse microbiome. Men's gut health directly affects testosterone and mood.",
      Female:"Women's gut microbiome directly affects oestrogen metabolism. A healthy gut is essential for hormone balance.",
    },
    morningAdd:{
      Male:  ["🌿 Soaked methi water — prebiotic fibre feeds beneficial gut bacteria","🍵 Warm ginger + ajwain water — stimulates digestive fire","🧅 Raw garlic clove — prebiotic FOS directly feeds Lactobacillus"],
      Female:["🌿 Soaked methi water — prebiotic and hormone-supportive","🥛 Small bowl curd on empty stomach — probiotic colonisation is best on empty stomach","🌸 Fennel seed water — reduces bloating and supports female digestive health"],
    },
    remedies:{
      Both:{
        Male:[
          {icon:"🥛",name:"Probiotic Curd Daily",     desc:"1 bowl homemade curd with lunch. Replenishes Lactobacillus flora that affects testosterone metabolism.",tags:["Microbiome ↑"]},
          {icon:"🧅",name:"Prebiotic Foods",           desc:"Garlic, onion, oats, banana daily. Feeds beneficial bacteria — critical for male gut-hormone axis.",tags:["Microbiome ↑"]},
          {icon:"🪷",name:"Triphala at Bedtime",       desc:"1 tsp in warm water nightly. Tones bowel wall, improves absorption, gentle daily detox.",tags:["Detox","Motility ↑"]},
          {icon:"🌶️",name:"Ajwain + Hing Water",      desc:"Immediate relief from male-pattern bloating and gas. Activates digestive enzymes.",tags:["Bloating ↓"]},
          {icon:"🫙",name:"Fermented Foods",            desc:"Idli, dhokla, kanji 3–4×/week. Live organisms colonise gut and produce B vitamins.",tags:["Microbiome ↑"]},
        ],
        Female:[
          {icon:"🥛",name:"Probiotic Curd + Flaxseeds",desc:"1 bowl curd + 1 tsp flaxseeds daily. Probiotics + phytoestrogens — gut-hormone synergy unique to women.",tags:["Microbiome ↑","Hormones"]},
          {icon:"🌸",name:"Fennel Seed Water",          desc:"Boil fennel seeds, drink warm. Reduces female-specific bloating and supports beneficial bacteria.",tags:["Bloating ↓","Microbiome ↑"]},
          {icon:"🪷",name:"Triphala at Bedtime",        desc:"1 tsp in warm water. Women metabolise triphala slightly differently — take with warm water, not milk.",tags:["Detox","Motility ↑"]},
          {icon:"🧅",name:"Prebiotic Foods",            desc:"Garlic, onion, asparagus, banana. Feeds Lactobacillus, which produces short-chain fatty acids that regulate oestrogen.",tags:["Microbiome ↑","Oestrogen ↑"]},
          {icon:"🫙",name:"Fermented Foods",            desc:"Idli, dhokla, homemade kanji. The gut microbiome regulates the oestrobolome — the set of gut bacteria that metabolise oestrogen.",tags:["Microbiome ↑","Hormones"]},
        ],
      },
      Modern:{
        Male:[
          {icon:"🌱",name:"Psyllium Husk",     desc:"1 tsp in water — prebiotic fibre + bulking agent. Men need 38g fibre/day.",tags:["Motility ↑"]},
          {icon:"🍵",name:"Bone Broth / Dal Broth",desc:"Clear dal broth — glutamine repairs intestinal lining and reduces leaky gut.",tags:["Gut Lining ↑"]},
          {icon:"🥛",name:"Kefir or Curd",      desc:"Daily probiotics reduce IBS symptoms and improve gut transit time.",tags:["Microbiome ↑"]},
          {icon:"🧅",name:"Prebiotic Protocol", desc:"Include garlic, onion, leek and slightly unripe banana daily — best natural prebiotics.",tags:["Microbiome ↑"]},
          {icon:"🌾",name:"Resistant Starch",   desc:"Cooled rice/roti is digested slower and feeds gut bacteria. Cook and refrigerate.",tags:["Microbiome ↑"]},
        ],
        Female:[
          {icon:"🌱",name:"Psyllium Husk",      desc:"1 tsp in water before dinner. Women with slower gut transit benefit most from bulking fibre.",tags:["Constipation ↓"]},
          {icon:"🥛",name:"Probiotic Curd",      desc:"Lactobacillus rhamnosus and L. acidophilus (in homemade curd) specifically benefit female gut-vaginal health.",tags:["Microbiome ↑"]},
          {icon:"🧅",name:"Oestrobolome Support",desc:"Garlic + onion + leek — prebiotic foods that support the gut bacteria responsible for oestrogen metabolism.",tags:["Hormones","Microbiome ↑"]},
          {icon:"🫙",name:"Fermented Foods",     desc:"Daily fermented foods improve gut flora — which in turn regulates oestrogen recycling in women.",tags:["Microbiome ↑","Hormones"]},
          {icon:"🌾",name:"High-Fibre Diet",     desc:"Women's gut transit is slower. 25–30g fibre/day reduces bloating, constipation and hormone imbalance.",tags:["Motility ↑"]},
        ],
      },
      Ayurvedic:{
        Male:[
          {icon:"🌶️",name:"Ajwain + Hing",      desc:"Morning ajwain water + hing in cooking. Best Ayurvedic digestive for male vata-type bloating.",tags:["Bloating ↓"]},
          {icon:"🌿",name:"Saunf After Meals",   desc:"Chew 1 tsp fennel after every meal. Relaxes intestinal muscles and reduces gas.",tags:["Digestion ↑"]},
          {icon:"🫚",name:"Desi Ghee (1 tsp)",   desc:"Small amount of ghee — butyric acid nourishes colonocytes (gut lining cells) in men.",tags:["Gut Lining ↑"]},
          {icon:"🪷",name:"Triphala + Ginger",   desc:"Triphala at night + ginger tea morning. Comprehensive Ayurvedic gut restoration.",tags:["Motility ↑"]},
          {icon:"🍵",name:"Jeera Kadha",          desc:"Boil jeera + black pepper. Stimulates agni and reduces bloating after heavy meals.",tags:["Digestion ↑"]},
        ],
        Female:[
          {icon:"🌸",name:"Shatavari + Triphala", desc:"Shatavari nourishes female gut mucosa while Triphala detoxifies. Unique Ayurvedic female gut formula.",tags:["Gut Lining ↑","Hormones"]},
          {icon:"🌸",name:"Fennel + Rose Tea",    desc:"Fennel + rose petals boiled in water. Traditional female digestive — reduces bloating linked to menstrual cycle.",tags:["Bloating ↓","Cycle ↑"]},
          {icon:"🫚",name:"Desi Ghee (1 tsp)",    desc:"Butyric acid repairs gut lining. Especially important for women with IBS-type symptoms.",tags:["Gut Lining ↑"]},
          {icon:"🌿",name:"Saunf + Ajwain",       desc:"Chew saunf after meals, ajwain water in morning. Female digestive rhythm support.",tags:["Digestion ↑"]},
          {icon:"🪷",name:"Triphala at Bedtime",  desc:"Night cleanse. Women's gut eliminates oestrogen metabolites overnight — triphala supports this.",tags:["Detox","Hormones"]},
        ],
      },
    },
    foodsToEat:{
      Male:  ["Homemade Curd","Idli","Dhokla","Garlic","Onion","Banana","Oats","Psyllium Husk","Ginger","Fennel Seeds","Ajwain","Ghee (1 tsp)","Moong Dal","Lauki","Triphala","Dal Broth"],
      Female:["Homemade Curd + Flaxseeds","Idli","Dhokla","Garlic","Onion","Fennel Seeds","Banana","Oats","Psyllium Husk","Ginger","Rose Tea","Shatavari","Ghee (1 tsp)","Moong Dal","Lauki","Triphala"],
    },
    foodsToAvoid:["Processed Foods","Refined Sugar","Alcohol","Fried Foods","Artificial Sweeteners","Carbonated Drinks","Cold Food on Empty Stomach","Overuse of Antibiotics","Excess Red Meat","Packaged Snacks"],
    tips:{
      Male:[
        {icon:"🍽️",t:"Chew 20–30 Times",     d:"Digestion starts in the mouth. Men with IBS or bloating see dramatic improvement from slower eating alone."},
        {icon:"🧘",t:"Gut-Brain Axis",         d:"Chronic work stress directly causes leaky gut in men. Pranayama reduces gut inflammation by lowering cortisol."},
        {icon:"💧",t:"Warm Water Only",         d:"Cold water suppresses digestive enzymes. Drink warm or room-temperature water throughout the day."},
        {icon:"⏰",t:"Consistent Meal Times",  d:"The gut microbiome has a circadian rhythm. Eating at consistent times improves digestion and flora diversity."},
      ],
      Female:[
        {icon:"🌸",t:"Gut-Hormone Connection", d:"The gut's oestrobolome (set of gut bacteria) regulates oestrogen. A healthy gut = balanced hormones."},
        {icon:"🍽️",t:"Eat Mindfully",           d:"Women with PCOS or hormonal issues benefit enormously from slow eating and portion awareness."},
        {icon:"💧",t:"Warm Water + Fennel",      d:"Start morning with warm fennel water. Reduces female-specific bloating that worsens cyclically."},
        {icon:"🧘",t:"Stress and Gut Health",   d:"Anxiety and stress cause IBS-type symptoms in women 2× more often than men. Yoga nidra helps."},
      ],
    },
  },

  Inflammation: {
    color:C.pink, icon:"🔥",
    desc:{
      Male:  "Reduce chronic systemic inflammation — root of heart disease, diabetes, and accelerated ageing.",
      Female:"Autoimmune conditions are 3× more common in women. Reducing inflammation is also the key to PCOS and hormonal balance.",
    },
    morningAdd:{
      Male:  ["🟡 Turmeric + black pepper in warm water — piperine boosts curcumin absorption 2000×","🫚 1 tbsp extra-virgin olive oil — oleocanthal has ibuprofen-like action","🫐 Pomegranate or berries — polyphenols suppress NF-κB inflammatory pathway"],
      Female:["🟡 Turmeric + black pepper in warm water — curcumin reduces inflammatory cytokines that worsen PCOS","🫚 1 tbsp flaxseeds — omega-3 + phytoestrogen double anti-inflammatory benefit","🌸 Hibiscus or rose tea — polyphenols reduce oestrogen-driven inflammation"],
    },
    remedies:{
      Both:{
        Male:[
          {icon:"🟡",name:"Turmeric + Black Pepper",  desc:"In every cooked dish. Curcumin = NF-κB inhibitor. Black pepper increases absorption 2000%.",tags:["CRP ↓","Pain ↓"]},
          {icon:"🌿",name:"Ginger Daily",               desc:"Fresh ginger in food and tea. Gingerols and shogaols inhibit COX-2 (same target as ibuprofen).",tags:["Joint Inflam. ↓"]},
          {icon:"🫐",name:"Pomegranate + Amla",         desc:"Polyphenols from both prevent LDL oxidation and suppress inflammatory cascades in men.",tags:["CRP ↓"]},
          {icon:"🌸",name:"Shallaki (Boswellia)",        desc:"Inhibits 5-LOX enzyme — powerful for joint inflammation and male cardiovascular inflammation.",tags:["Joint Pain ↓"]},
          {icon:"🐟",name:"Omega-3 Foods",              desc:"Walnuts + flaxseeds + chia daily. EPA/DHA produce anti-inflammatory resolvins.",tags:["Systemic Inflam. ↓"]},
        ],
        Female:[
          {icon:"🟡",name:"Turmeric + Black Pepper",   desc:"Essential for women with PCOS, endometriosis or autoimmune conditions — reduces IL-6 and TNF-α.",tags:["CRP ↓","PCOS"]},
          {icon:"🌸",name:"Hibiscus + Ginger Tea",      desc:"Hibiscus reduces blood pressure + inflammation. Ginger reduces prostaglandin-driven menstrual pain.",tags:["CRP ↓","PMS ↓"]},
          {icon:"🌿",name:"Flaxseeds (Omega-3 + Lignan)",desc:"Reduces inflammatory prostaglandins that cause menstrual pain, while also supporting hormone balance.",tags:["Period Pain ↓","Inflam. ↓"]},
          {icon:"🌺",name:"Guduchi (Giloy)",             desc:"Immunomodulator — balances immune response. Particularly important for women with autoimmune tendency.",tags:["Immune Balance"]},
          {icon:"🫐",name:"Polyphenol Protocol",         desc:"Berries + pomegranate + amla + green tea. Women respond more strongly to dietary polyphenols for CRP reduction.",tags:["CRP ↓"]},
        ],
      },
      Modern:{
        Male:[
          {icon:"🥗",name:"Anti-Inflammatory Diet",   desc:"Minimise refined carbs, seed oils, red meat. These are primary dietary inflammation drivers in men.",tags:["Systemic Inflam. ↓"]},
          {icon:"🐟",name:"Omega-3 Protocol",          desc:"Walnuts + chia + flaxseeds. EPA/DHA-derived resolvins actively reduce inflammation.",tags:["CRP ↓"]},
          {icon:"🫐",name:"Polyphenols",               desc:"Daily pomegranate + green tea. Inhibit COX-2 enzyme without NSAID side effects.",tags:["CRP ↓"]},
          {icon:"😴",name:"Sleep is Anti-Inflammatory",desc:"Poor sleep raises IL-6 and TNF-α by 40%. 7–8 hrs is more anti-inflammatory than any supplement.",tags:["Cytokines ↓"]},
          {icon:"🌞",name:"Vitamin D",                  desc:"20-min daily sunlight. Vitamin D3 deficiency = elevated CRP. Common in Indian men who work indoors.",tags:["CRP ↓"]},
        ],
        Female:[
          {icon:"🌺",name:"Omega-3 + GLA",             desc:"Flaxseeds + evening primrose (for GLA). Omega-3 reduces prostaglandins causing menstrual + systemic inflammation.",tags:["Period Pain ↓","CRP ↓"]},
          {icon:"🫐",name:"Polyphenol Protocol",        desc:"Berries + pomegranate + amla. Research shows women with PCOS/endometriosis benefit significantly from polyphenols.",tags:["PCOS","CRP ↓"]},
          {icon:"🥗",name:"Anti-Inflammatory Diet",    desc:"Low-glycaemic + high-omega-3. Inflammatory diet is a key driver of PCOS and female hormonal conditions.",tags:["Systemic Inflam. ↓"]},
          {icon:"😴",name:"Sleep + Circadian Rhythm",  desc:"Disrupted sleep raises IL-6 and worsens autoimmune conditions in women. Consistent 8-hr sleep is essential.",tags:["Cytokines ↓"]},
          {icon:"🌞",name:"Vitamin D",                  desc:"Critical for immune regulation in women. Deficiency worsens autoimmune, PCOS and inflammatory conditions.",tags:["Immune Balance"]},
        ],
      },
      Ayurvedic:{
        Male:[
          {icon:"🪷",name:"Shallaki (Boswellia)",      desc:"Dual COX-2 and 5-LOX inhibitor. Most powerful Ayurvedic anti-inflammatory for joint and heart.",tags:["Joint Pain ↓"]},
          {icon:"🟡",name:"Turmeric + Ghee",            desc:"Curcumin dissolved in fat for maximum absorption. Ancient pitta-reducing recipe.",tags:["CRP ↓"]},
          {icon:"🌿",name:"Guduchi (Giloy)",             desc:"Immunomodulator — reduces autoimmune inflammation without suppressing immunity.",tags:["Immune Balance"]},
          {icon:"🍵",name:"Rasayana Kadha",              desc:"Ginger + tulsi + cinnamon + black pepper boiled together. Traditional daily anti-inflammatory decoction.",tags:["Systemic Inflam. ↓"]},
          {icon:"🌸",name:"Neem Blood Purification",    desc:"4–5 neem leaves on empty stomach. Removes ama (toxic metabolites) — Ayurvedic root of inflammation.",tags:["Ama ↓"]},
        ],
        Female:[
          {icon:"🌸",name:"Shatavari + Turmeric",      desc:"Shatavari reduces oestrogen-driven inflammation; turmeric reduces systemic CRP. Classic female formula.",tags:["Hormonal Inflam. ↓"]},
          {icon:"🪷",name:"Shallaki (Boswellia)",       desc:"Reduces prostaglandins causing menstrual pain and endometriosis inflammation.",tags:["Period Pain ↓"]},
          {icon:"🌺",name:"Lodhra + Guduchi",            desc:"Lodhra is anti-inflammatory for the female reproductive tract. Guduchi is a systemic immunomodulator.",tags:["Pelvic Inflam. ↓"]},
          {icon:"🍵",name:"Hibiscus + Tulsi Kadha",     desc:"Hibiscus + tulsi + ginger boiled. Reduces blood pressure, inflammation and cortisol in women.",tags:["CRP ↓","Cortisol ↓"]},
          {icon:"🧘",name:"Yoga Nidra",                  desc:"Deep relaxation reduces IL-6 and cortisol. Autoimmune women show measurable CRP reduction with 30-min practice.",tags:["Cytokines ↓"]},
        ],
      },
    },
    foodsToEat:{
      Male:  ["Turmeric","Ginger","Garlic","Amla","Pomegranate","Walnuts","Flaxseeds","Olive Oil","Leafy Greens","Green Tea","Dark Chocolate (70%+)","Almonds","Beets","Shallaki","Giloy","Tomatoes"],
      Female:["Turmeric","Ginger","Flaxseeds","Amla","Pomegranate","Berries","Hibiscus Tea","Walnuts","Chia Seeds","Olive Oil","Leafy Greens","Green Tea","Broccoli","Shatavari","Guduchi","Sesame Seeds"],
    },
    foodsToAvoid:["Trans Fats (Dalda, Vanaspati)","Refined Vegetable Oils","Refined Sugar","Maida","Processed Meats","Alcohol","Excess Omega-6 Oils","Artificial Additives","Fried Snacks","Excess Red Meat"],
    tips:{
      Male:[
        {icon:"😴",t:"Sleep Reduces Inflammation", d:"Poor sleep raises CRP and IL-6 by 40% in men. 7–8 hrs is more powerful than any anti-inflammatory supplement."},
        {icon:"🧘",t:"Stress = Fire",               d:"Chronic stress raises cortisol → which paradoxically increases systemic inflammation long-term."},
        {icon:"🌞",t:"Vitamin D Daily",              d:"20-min sunlight. Indian men who work indoors are commonly Vitamin D deficient — a major CRP driver."},
        {icon:"🚶",t:"Moderate Exercise",            d:"Walking and yoga are anti-inflammatory. Extreme overtraining INCREASES inflammation — balance is key."},
      ],
      Female:[
        {icon:"🌸",t:"Hormones Drive Inflammation", d:"PCOS, endometriosis and perimenopause all have inflammation as a root component. Anti-inflammatory diet addresses all."},
        {icon:"😴",t:"Sleep + Autoimmune Risk",      d:"Women are 3× more likely to develop autoimmune conditions. Sleep deprivation is the #1 trigger — protect your sleep."},
        {icon:"🧘",t:"Yoga Nidra Practice",          d:"30-min yoga nidra reduces inflammatory cytokines measurably. Practice daily, especially premenstrually."},
        {icon:"🌞",t:"Vitamin D Critical for Women", d:"Deficiency worsens PCOS, autoimmune and bone conditions. Daily sunlight + D-rich foods are essential."},
      ],
    },
  },
};

// ── BASE MEALS ────────────────────────────────────────────────────────────────
const BASE_MEALS = {
  Vegetarian:[
    {theme:"Detox & Reset 🌱",em:{t:"Methi + Lemon Water",d:"Methi water + warm lemon + garlic clove"},br:{t:"Oats Upma",d:"Rolled oats with carrot, peas, capsicum in olive oil"},mm:{t:"Amla + Walnuts",d:"Fresh amla + 5 soaked walnuts + pumpkin seeds"},lu:{t:"Brown Rice + Moong Dal",d:"Brown rice + moong dal tadka + cucumber-onion salad"},es:{t:"Roasted Chana",d:"½ cup roasted chana + warm jeera water"},di:{t:"Bajra Roti + Palak Sabzi",d:"2 bajra rotis + spinach-garlic sabzi"}},
    {theme:"Fibre Power 🫘",em:{t:"Methi + Amla Water",d:"Methi water + amla juice + 8 curry leaves chewed"},br:{t:"Daliya Khichdi",d:"Broken wheat khichdi with mixed veggies + small curd"},mm:{t:"Guava + Cinnamon Water",d:"1 whole guava + cinnamon water"},lu:{t:"Rajma + Jowar Roti",d:"Rajma curry + 2 jowar rotis + raw veggie salad"},es:{t:"Makhana",d:"1 cup roasted makhana with turmeric"},di:{t:"Moong Dal Soup + Methi Roti",d:"Light moong soup + 2 fenugreek rotis"}},
    {theme:"Omega-3 Focus 🫀",em:{t:"Garlic + Jeera Water",d:"Crushed garlic in warm jeera water"},br:{t:"Walnut Smoothie",d:"Banana + 4 walnuts + 200ml low-fat milk blended"},mm:{t:"Mixed Seeds",d:"1 tbsp each sunflower + pumpkin + flaxseeds"},lu:{t:"Chana Dal + Ragi Roti",d:"Chana dal (GI 22) + 2 ragi rotis + small curd"},es:{t:"Sprouts Salad",d:"Moong sprouts + lemon + pepper + onion + tomato"},di:{t:"Vegetable Khichdi",d:"Moong dal + brown rice khichdi + ½ tsp ghee"}},
    {theme:"Anti-Inflammatory 🌸",em:{t:"Turmeric-Ginger Kadha",d:"Turmeric + ginger + black pepper in water"},br:{t:"Moong Dal Chilla",d:"3 moong chillas with mint chutney"},mm:{t:"Papaya",d:"1 cup papaya — papain enzyme aids metabolism"},lu:{t:"Sambhar + Brown Rice",d:"Mixed lentil sambhar + ½ cup brown rice + raita"},es:{t:"Green Tea + Almonds",d:"Masala green tea + 4 almonds"},di:{t:"Paneer Bhurji + Rotis",d:"Low-fat paneer bhurji + 2 flaxseed wheat rotis"}},
    {theme:"Millet Magic 🌾",em:{t:"Methi + Jamun Seed",d:"Methi water + ½ tsp jamun seed powder"},br:{t:"Ragi Porridge",d:"Ragi porridge with cinnamon, unsweetened"},mm:{t:"Amla-Flax Smoothie",d:"Amla + flaxseeds + ginger blended"},lu:{t:"Toor Dal + Jowar Bhakri",d:"Toor dal tadka + 2 jowar bhakris + raw onion"},es:{t:"Steamed Dhokla",d:"2 steamed dhokla — fermented, low GI"},di:{t:"Dalia + Buttermilk",d:"Cracked wheat veg soup + jeera buttermilk"}},
    {theme:"Gut Health Day 🫙",em:{t:"Methi + Tulsi",d:"Methi water + 5 tulsi leaves chewed"},br:{t:"Idli + Sambar",d:"3 steamed idlis (probiotic) + light sambar + chutney"},mm:{t:"Pomegranate",d:"½ pomegranate — polyphenols + anti-inflammatory"},lu:{t:"Chole + Brown Rice + Raita",d:"Chickpea curry + ½ cup brown rice + cucumber raita"},es:{t:"Curd + Chia Seeds",d:"Low-fat curd + 1 tbsp soaked chia seeds"},di:{t:"Lauki Soup + Roti",d:"Bottle gourd soup + ginger + garlic + 1–2 rotis"}},
    {theme:"Renewal ✨",em:{t:"Super Detox Drink",d:"Warm water + lemon + honey + cinnamon + turmeric"},br:{t:"Flaxseed Poha",d:"Brown rice poha + curry leaves + peas + 1 tbsp flaxseeds"},mm:{t:"Mixed Seasonal Fruit",d:"Berries + papaya + pomegranate — whole fruit only"},lu:{t:"Balanced Thali",d:"Brown rice + dal + 2 sabzis + salad + 1 roti"},es:{t:"Chana + Tulsi Tea",d:"Roasted chana + tulsi-ginger herbal tea"},di:{t:"Light Khichdi",d:"Moong-veg khichdi + roasted papad"}},
  ],
  "Non-Vegetarian":[
    {theme:"Detox & Reset 🌱",em:{t:"Methi + Lemon Water",d:"Methi water + warm lemon + crushed garlic"},br:{t:"Egg White Omelette",d:"2-egg white omelette + spinach + multigrain toast"},mm:{t:"Amla + Walnuts",d:"Fresh amla + 5 walnuts + 2 tbsp pumpkin seeds"},lu:{t:"Grilled Fish + Brown Rice",d:"150g grilled rohu/surmai + ½ cup brown rice + salad"},es:{t:"Roasted Chana",d:"½ cup chana + jeera water"},di:{t:"Bajra Roti + Chicken Curry",d:"2 bajra rotis + skinless chicken curry, min oil"}},
    {theme:"Protein Power 💪",em:{t:"Methi + Amla Water",d:"Methi water + amla juice + curry leaves"},br:{t:"Eggs + Daliya",d:"2 boiled eggs + broken wheat porridge with veggies"},mm:{t:"Guava + Pumpkin Seeds",d:"1 whole guava + 1 tbsp pumpkin seeds"},lu:{t:"Grilled Chicken + Jowar Roti",d:"150g chicken breast + 2 jowar rotis + salad"},es:{t:"Sprouts + Curd",d:"Moong sprouts in curd — protein + probiotic"},di:{t:"Fish Soup + Methi Roti",d:"Clear fish soup with veggies + 2 methi rotis"}},
    {theme:"Omega-3 Day 🫀",em:{t:"Garlic + Jeera Water",d:"Crushed garlic in warm jeera water"},br:{t:"Mackerel + Roti",d:"100g grilled mackerel + 1 multigrain roti — best omega-3 fish"},mm:{t:"Seeds + Amla",d:"Flaxseed + sunflower seeds + amla water"},lu:{t:"Egg Curry + Brown Rice",d:"2-egg curry (low oil) + ½ cup brown rice + raita"},es:{t:"Makhana + Green Tea",d:"1 cup makhana + unsweetened green tea"},di:{t:"Grilled Prawns + Khichdi",d:"100g grilled prawns + moong-veg khichdi"}},
    {theme:"Anti-Inflammatory 🌸",em:{t:"Turmeric-Ginger Decoction",d:"Turmeric + ginger + black pepper in water"},br:{t:"Scrambled Eggs + Oats",d:"2-egg scramble with turmeric + oats upma"},mm:{t:"Papaya",d:"1 cup papaya — anti-inflammatory enzymes"},lu:{t:"Chicken Sambhar + Rice",d:"Chicken in sambhar + ½ cup brown rice + raita"},es:{t:"Green Tea + Almonds",d:"Ginger-cardamom green tea + 4 almonds"},di:{t:"Fish Tikka + Roti",d:"2 grilled fish tikka + 2 flaxseed rotis"}},
    {theme:"Millet Day 🌾",em:{t:"Methi + Jamun Seed",d:"Methi water + ½ tsp jamun seed powder"},br:{t:"Ragi Dosa + Egg",d:"2 ragi dosas + 1 boiled egg + coconut chutney"},mm:{t:"Amla-Flax Smoothie",d:"Amla + flaxseeds + ginger blended"},lu:{t:"Lean Keema + Jowar Bhakri",d:"Chicken keema (min oil) + 2 jowar bhakris + salad"},es:{t:"Steamed Idli",d:"2 idlis + mint chutney — fermented probiotic"},di:{t:"Chicken Bone Broth + Dalia",d:"Clear chicken broth + veg dalia"}},
    {theme:"Gut Health 🫙",em:{t:"Methi + Tulsi",d:"Methi water + 5 tulsi leaves"},br:{t:"Egg Bhurji + Toast",d:"2-egg bhurji + spinach + 1 multigrain toast"},mm:{t:"Pomegranate + Curd",d:"½ pomegranate + curd — polyphenols + probiotic"},lu:{t:"Fish Curry + Brown Rice",d:"Light tomato-base fish curry + ½ cup brown rice"},es:{t:"Chia Curd",d:"Homemade curd + 1 tbsp soaked chia seeds"},di:{t:"Chicken Soup + Roti",d:"Thin chicken-vegetable soup + 1 wheat roti"}},
    {theme:"Renewal & Strength ✨",em:{t:"Super Detox Drink",d:"Warm water + lemon + honey + cinnamon + turmeric"},br:{t:"Flaxseed Poha + Egg",d:"Brown rice poha + curry leaves + 1 boiled egg"},mm:{t:"Mixed Fruit",d:"Berries + papaya + pomegranate — whole fruit only"},lu:{t:"Grilled Chicken Thali",d:"Grilled chicken + dal + sabzi + salad + 1 roti"},es:{t:"Chana + Tulsi Tea",d:"Roasted chana + tulsi-ginger tea"},di:{t:"Light Khichdi + Fish",d:"Moong-veg khichdi + 80g steamed fish"}},
  ],
  Vegan:[
    {theme:"Detox & Reset 🌱",em:{t:"Methi + Lemon + Garlic",d:"Methi water + warm lemon + garlic + turmeric"},br:{t:"Oats Upma (Dairy-free)",d:"Oats upma with veggies in olive oil + green tea"},mm:{t:"Amla + Walnuts + Pumpkin Seeds",d:"Fresh amla + walnuts + pumpkin seeds — zinc + omega-3"},lu:{t:"Brown Rice + Moong Dal",d:"Brown rice + moong dal (mustard oil) + raw salad"},es:{t:"Roasted Chana + Jeera Water",d:"½ cup roasted chana + warm jeera water"},di:{t:"Bajra Roti + Palak Sabzi",d:"2 bajra rotis + spinach-garlic sabzi"}},
    {theme:"Plant Protein 🫘",em:{t:"Methi + Amla",d:"Methi water + amla juice + curry leaves"},br:{t:"Tofu Scramble + Roti",d:"Crumbled tofu scramble with turmeric + 1 multigrain roti"},mm:{t:"Guava + Mixed Seeds",d:"1 whole guava + sunflower + pumpkin seeds"},lu:{t:"Rajma + Jowar Roti",d:"Rajma curry (no dairy) + 2 jowar rotis + salad"},es:{t:"Makhana",d:"1 cup roasted makhana with turmeric"},di:{t:"Moong Dal Soup + Methi Roti",d:"Moong soup + 2 fenugreek rotis"}},
    {theme:"Omega-3 Focus 🫀",em:{t:"Garlic + Jeera Water",d:"Crushed garlic in warm jeera water"},br:{t:"Chia Oat Bowl",d:"Oats soaked in oat milk + 1 tbsp chia + banana + cinnamon"},mm:{t:"Mixed Seeds",d:"1 tbsp each flaxseed + chia + hemp seeds"},lu:{t:"Chana Dal + Ragi Roti",d:"Chana dal (GI 22) + 2 ragi rotis"},es:{t:"Sprouts Salad",d:"Moong + chana sprouts + lemon + pepper + onion"},di:{t:"Vegetable Khichdi",d:"Moong + brown rice khichdi + ½ tsp coconut oil"}},
    {theme:"Anti-Inflammatory 🌸",em:{t:"Turmeric-Ginger Kadha",d:"Turmeric + ginger + black pepper in water"},br:{t:"Moong Dal Chilla",d:"3 moong chillas with mint chutney — high protein"},mm:{t:"Papaya + Ginger",d:"1 cup papaya + pinch ginger powder"},lu:{t:"Vegan Sambhar + Brown Rice",d:"Lentil sambhar (no ghee) + ½ cup brown rice"},es:{t:"Green Tea + Almonds",d:"Masala green tea + 4 almonds"},di:{t:"Tofu Bhurji + Rotis",d:"Tofu bhurji + turmeric + black pepper + 2 wheat rotis"}},
    {theme:"Millet Day 🌾",em:{t:"Methi + Jamun Seed",d:"Methi water + ½ tsp jamun seed powder"},br:{t:"Ragi Porridge (Dairy-free)",d:"Ragi in oat milk + cinnamon, no sugar"},mm:{t:"Amla-Flax Smoothie",d:"Amla + flaxseeds + water + ginger blended"},lu:{t:"Toor Dal + Jowar Bhakri",d:"Toor dal tadka + 2 jowar bhakris + raw onion"},es:{t:"Steamed Dhokla",d:"2 steamed dhokla — fermented, low GI"},di:{t:"Dalia Soup",d:"Cracked wheat vegetable soup + roasted papad"}},
    {theme:"Gut Health 🫙",em:{t:"Methi + Tulsi",d:"Methi water + 5 tulsi leaves"},br:{t:"Idli + Vegan Sambar",d:"3 idlis + vegan sambar (no ghee) + coconut chutney"},mm:{t:"Pomegranate",d:"½ pomegranate — nature's statin + anti-inflammatory"},lu:{t:"Chole + Brown Rice",d:"Chickpeas (olive oil) + ½ cup brown rice + kachumber salad"},es:{t:"Coconut Yoghurt + Chia",d:"Vegan coconut yoghurt + 1 tbsp soaked chia seeds"},di:{t:"Lauki Soup + Roti",d:"Bottle gourd soup + garlic + ginger + 1–2 rotis"}},
    {theme:"Renewal ✨",em:{t:"Super Detox Drink",d:"Warm water + lemon + maple syrup + cinnamon + turmeric"},br:{t:"Flaxseed Poha",d:"Brown rice poha + curry leaves + peas + 1 tbsp flaxseeds"},mm:{t:"Mixed Fruit",d:"Berries + papaya + pomegranate — whole fruit only"},lu:{t:"Vegan Thali",d:"Brown rice + dal + 2 sabzis + salad + 1 roti"},es:{t:"Chana + Tulsi Tea",d:"Roasted chana + tulsi-ginger herbal tea"},di:{t:"Light Khichdi",d:"Moong-veg khichdi (no ghee) + roasted papad"}},
  ],
};

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

// ── REGION CONFIG ─────────────────────────────────────────────────────────────
const REGIONS = [
  { id:"North Indian", icon:"🏔️", sub:"Punjab · Delhi · UP · Rajasthan" },
  { id:"Telugu",       icon:"🌶️", sub:"Andhra Pradesh · Telangana"       },
  { id:"Tamil",        icon:"🌺", sub:"Tamil Nadu"                        },
  { id:"Kerala",       icon:"🌴", sub:"Kerala"                            },
  { id:"Bangalore",    icon:"🌸", sub:"Karnataka · Bangalore"             },
];

// ── REGION MEALS ──────────────────────────────────────────────────────────────
// Helper: m(title, desc) shorthand
const m = (t,d) => ({t,d});

const REGION_MEALS = {
  "North Indian":{
    Vegetarian:[
      {theme:"Detox & Reset 🌱",
        em:m("Methi + Warm Lemon","Methi water + lemon + raw garlic + pinch hing"),
        br:m("Oats Upma","Rolled oats with carrot, peas, capsicum, mustard seeds"),
        mm:m("Amla + Soaked Almonds","Fresh amla + 5 almonds + 2 walnuts"),
        lu:m("Brown Rice + Moong Dal","Light moong dal tadka + brown rice + kachumber salad"),
        es:m("Roasted Chana","½ cup roasted chana + warm jeera water"),
        di:m("Bajra Roti + Lauki Sabzi","2 bajra rotis + bottle gourd sabzi — light dinner")},
      {theme:"Fibre Power 🫘",
        em:m("Methi + Amla Water","Methi water + amla juice + curry leaves"),
        br:m("Daliya (Broken Wheat) Khichdi","Daliya khichdi with mixed veggies + small curd"),
        mm:m("Guava + Cinnamon Water","1 whole guava + cinnamon water"),
        lu:m("Rajma + Jowar Roti","Rajma curry + 2 jowar rotis + raw onion salad"),
        es:m("Makhana","1 cup dry-roasted makhana with turmeric + jeera"),
        di:m("Moong Dal Soup + Methi Thepla","Light moong soup + 2 fenugreek theplas")},
      {theme:"Heart-Healthy Fats 🫀",
        em:m("Garlic + Jeera Water","1 raw garlic in warm jeera water"),
        br:m("Sarson ka Saag + Makki Roti","Light mustard greens saag + 1 makki roti (heart-healthy)"),
        mm:m("Mixed Seeds","1 tbsp each flaxseed + pumpkin + sunflower seeds"),
        lu:m("Chana Dal + Ragi Roti","Chana dal (GI 22) + 2 ragi rotis + cucumber raita"),
        es:m("Moong Sprouts Chaat","Moong sprouts + lemon + chaat masala (no fried base)"),
        di:m("Vegetable Khichdi","Moong dal + brown rice khichdi + ½ tsp desi ghee")},
      {theme:"Anti-Inflammatory 🌸",
        em:m("Haldi-Adrak Kadha","Turmeric + ginger + black pepper + tulsi water"),
        br:m("Besan Cheela","2 besan cheelas with spinach + mint-coriander chutney"),
        mm:m("Papaya + Ginger","1 cup papaya + pinch dry ginger powder"),
        lu:m("Palak Paneer (Light) + Brown Rice","Low-fat palak paneer + ½ cup brown rice"),
        es:m("Green Tea + Akhrot","Tulsi green tea + 4 walnuts"),
        di:m("Dal Tadka + Bajra Roti","Simple arhar dal tadka + 2 bajra rotis")},
      {theme:"Millet Magic 🌾",
        em:m("Methi + Jamun Seed Water","Methi water + ½ tsp jamun seed powder"),
        br:m("Ragi Porridge","Ragi dalia with cinnamon + a pinch of cardamom, no sugar"),
        mm:m("Amla-Flax Smoothie","Amla + 1 tbsp flaxseeds + ginger blended"),
        lu:m("Jowar Roti + Arhar Dal","2 jowar rotis + arhar dal + raw onion + nimbu"),
        es:m("Steamed Dhokla","2 steamed dhoklas — fermented, low GI"),
        di:m("Bajra Khichdi","Bajra + moong dal khichdi with lauki — very gut-friendly")},
      {theme:"Gut Health Day 🫙",
        em:m("Methi + Tulsi","Methi water + 5 tulsi leaves chewed"),
        br:m("Poha with Flaxseeds","Brown rice poha + mustard seeds + curry leaves + 1 tbsp flaxseeds"),
        mm:m("Pomegranate","½ pomegranate — polyphenols, anti-LDL"),
        lu:m("Chole + Brown Rice + Raita","Chickpea curry + ½ cup brown rice + cucumber raita"),
        es:m("Dahi + Chia Seeds","Homemade dahi + 1 tbsp soaked chia seeds"),
        di:m("Lauki Sabzi + Bajra Roti","Bottle gourd with garlic + 1–2 bajra rotis")},
      {theme:"Renewal ✨",
        em:m("Super Detox Drink","Warm water + lemon + honey + cinnamon + haldi"),
        br:m("Sabudana Khichdi (small)","Small portion sabudana khichdi + peanuts (Sunday special)"),
        mm:m("Mixed Seasonal Fruit","Papaya + pomegranate + berries — whole fruit only"),
        lu:m("Full North Indian Thali","Dal + sabzi + small brown rice + 1 roti + salad"),
        es:m("Roasted Makhana + Herbal Tea","Makhana + tulsi-ginger tea, no sugar"),
        di:m("Moong Dal Khichdi","Light moong-veg khichdi + 1 tsp ghee + roasted papad")},
    ],
    "Non-Vegetarian":[
      {theme:"Detox & Reset 🌱",
        em:m("Methi + Lemon","Methi water + warm lemon + crushed garlic"),
        br:m("Anda Bhurji + Multigrain Toast","2-egg bhurji with spinach + 1 multigrain toast"),
        mm:m("Amla + Walnuts","Fresh amla + 5 walnuts + pumpkin seeds"),
        lu:m("Grilled Murgh + Brown Rice","150g grilled chicken (no cream) + ½ cup brown rice + salad"),
        es:m("Roasted Chana","½ cup chana + jeera water"),
        di:m("Bajra Roti + Keema Matar (light)","2 bajra rotis + lean chicken keema + green peas, min oil")},
      {theme:"Protein Power 💪",
        em:m("Methi + Amla","Methi water + amla juice + curry leaves"),
        br:m("Boiled Anda + Daliya","2 boiled eggs + broken wheat porridge with veggies"),
        mm:m("Guava + Seeds","1 whole guava + pumpkin seeds"),
        lu:m("Murgh Shorba + Jowar Roti","Light chicken shorba (broth-based) + 2 jowar rotis"),
        es:m("Sprouts + Dahi","Moong sprouts + curd — protein + probiotic"),
        di:m("Fish Curry + Bajra Roti","Light rohu/surmai curry (mustard base) + 2 bajra rotis")},
      {theme:"Omega-3 Day 🫀",
        em:m("Garlic + Jeera Water","Crushed garlic in warm jeera water"),
        br:m("Mackerel Tikka + Roti","100g grilled mackerel + 1 multigrain roti — best omega-3"),
        mm:m("Seeds + Amla","Flaxseed + sunflower seeds + amla water"),
        lu:m("Anda Curry + Brown Rice","2-egg curry (low oil, no cream) + ½ cup brown rice + raita"),
        es:m("Makhana + Green Tea","1 cup makhana + unsweetened tulsi tea"),
        di:m("Grilled Tangri + Khichdi","2 grilled chicken tangri (no butter) + moong khichdi")},
      {theme:"Anti-Inflammatory 🌸",
        em:m("Haldi-Adrak Kadha","Turmeric + ginger + pepper in water"),
        br:m("Anda Omelette + Oats","2-egg omelette with haldi + oats upma"),
        mm:m("Papaya","1 cup papaya — anti-inflammatory bromelain"),
        lu:m("Murgh Saag + Brown Rice","Chicken in light spinach gravy + ½ cup brown rice"),
        es:m("Green Tea + Akhrot","Ginger-cardamom green tea + 4 walnuts"),
        di:m("Fish Tikka + Bajra Roti","2 grilled fish tikka (no cream) + 2 bajra rotis")},
      {theme:"Millet Day 🌾",
        em:m("Methi + Jamun Seed","Methi water + ½ tsp jamun seed powder"),
        br:m("Ragi Dosa + Anda","2 ragi dosas + 1 boiled egg + green chutney"),
        mm:m("Amla-Flax Smoothie","Amla + flaxseeds + ginger blended"),
        lu:m("Murgh Shorba + Jowar Bhakri","Thin chicken broth + 2 jowar bhakris + salad"),
        es:m("Steamed Idli","2 idlis + mint chutney — fermented probiotic"),
        di:m("Murgi ka Saalan + Bajra Roti","Light chicken saalan + 2 bajra rotis")},
      {theme:"Gut Health 🫙",
        em:m("Methi + Tulsi","Methi water + 5 tulsi leaves"),
        br:m("Anda Bhurji + Toast","2-egg bhurji + spinach + multigrain toast"),
        mm:m("Pomegranate + Dahi","½ pomegranate + curd — polyphenols + probiotic"),
        lu:m("Macchi Curry + Brown Rice","Light tomato-base fish curry + ½ cup brown rice"),
        es:m("Chia Dahi","Homemade curd + 1 tbsp soaked chia seeds"),
        di:m("Murgi Shorba + Roti","Thin chicken-vegetable broth + 1 bajra roti")},
      {theme:"Renewal ✨",
        em:m("Super Detox Drink","Warm water + lemon + honey + cinnamon + haldi"),
        br:m("Poha + Anda","Brown rice poha + curry leaves + 1 boiled egg"),
        mm:m("Mixed Fruit","Papaya + pomegranate + berries only"),
        lu:m("Tandoori Murgh Thali","Grilled chicken + dal + sabzi + salad + 1 roti"),
        es:m("Chana + Tulsi Tea","Roasted chana + tulsi-ginger tea"),
        di:m("Khichdi + Grilled Fish","Moong-veg khichdi + 80g grilled rohu/surmai")},
    ],
    Vegan:[
      {theme:"Detox & Reset 🌱",em:m("Methi + Lemon + Garlic","Methi water + lemon + garlic + hing"),br:m("Oats Upma (Dairy-free)","Oats with veggies in olive oil, no ghee"),mm:m("Amla + Walnuts + Seeds","Amla + walnuts + pumpkin seeds"),lu:m("Brown Rice + Moong Dal","Moong dal (mustard oil) + brown rice + salad"),es:m("Roasted Chana","½ cup chana + jeera water"),di:m("Bajra Roti + Lauki Sabzi","2 bajra rotis + lauki-garlic sabzi")},
      {theme:"Fibre Power 🫘",em:m("Methi + Amla","Methi water + amla juice + curry leaves"),br:m("Daliya Khichdi (Vegan)","Daliya + veggies, coconut oil, no ghee/curd"),mm:m("Guava + Cinnamon Water","1 whole guava + cinnamon water"),lu:m("Rajma + Jowar Roti","Rajma + 2 jowar rotis + salad"),es:m("Makhana","Roasted makhana with turmeric"),di:m("Moong Dal Soup + Roti","Moong soup + 2 rotis, no dairy")},
      {theme:"Heart-Healthy 🫀",em:m("Garlic + Jeera Water","Garlic in warm jeera water"),br:m("Saag + Makki Roti (Vegan)","Light mustard greens saag (no cream) + 1 makki roti"),mm:m("Mixed Seeds","Flaxseed + pumpkin + sunflower seeds"),lu:m("Chana Dal + Ragi Roti","Chana dal + 2 ragi rotis"),es:m("Sprouts Chaat","Moong sprouts + lemon + chaat masala"),di:m("Vegetable Khichdi","Moong + brown rice khichdi, coconut oil")},
      {theme:"Anti-Inflammatory 🌸",em:m("Haldi-Adrak Kadha","Turmeric + ginger + pepper + tulsi"),br:m("Besan Cheela (Vegan)","2 besan cheelas + mint chutney, no dahi"),mm:m("Papaya","1 cup papaya"),lu:m("Tofu Palak + Brown Rice","Tofu in spinach gravy + ½ cup brown rice"),es:m("Green Tea + Walnuts","Tulsi tea + 4 walnuts"),di:m("Dal Tadka + Bajra Roti","Arhar dal + 2 bajra rotis, mustard oil")},
      {theme:"Millet Magic 🌾",em:m("Methi + Jamun Seed","Methi water + jamun seed powder"),br:m("Ragi Porridge (Oat Milk)","Ragi + oat milk + cinnamon, no sugar"),mm:m("Amla-Flax Smoothie","Amla + flaxseeds + ginger + water"),lu:m("Jowar Roti + Dal","2 jowar rotis + arhar dal + onion"),es:m("Steamed Dhokla","2 steamed dhoklas"),di:m("Bajra Khichdi","Bajra + moong dal + lauki")},
      {theme:"Gut Health 🫙",em:m("Methi + Tulsi","Methi water + tulsi leaves"),br:m("Poha + Flaxseeds","Brown rice poha + curry leaves + flaxseeds, no curd"),mm:m("Pomegranate","½ pomegranate"),lu:m("Chole + Brown Rice","Chickpea curry + ½ cup brown rice"),es:m("Coconut Dahi + Chia","Coconut yoghurt + chia seeds"),di:m("Lauki + Bajra Roti","Lauki sabzi + 1–2 bajra rotis")},
      {theme:"Renewal ✨",em:m("Super Detox Drink","Warm water + lemon + maple syrup + cinnamon + haldi"),br:m("Sabudana Khichdi (Vegan)","Sabudana + peanuts + lemon (no ghee)"),mm:m("Mixed Fruit","Papaya + pomegranate + berries"),lu:m("Full Vegan Thali","Dal + sabzi + salad + brown rice + 1 roti"),es:m("Chana + Herbal Tea","Roasted chana + tulsi tea"),di:m("Moong Khichdi","Moong-veg khichdi, no ghee")},
    ],
  },

  "Telugu":{
    Vegetarian:[
      {theme:"Detox & Pesarattu 🌱",
        em:m("Methi + Nimmakaya (Lemon) Water","Methi water + warm lemon + raw garlic clove"),
        br:m("Pesarattu + Ginger Chutney","Green moong crepe — high protein, low GI. Ginger-coconut chutney"),
        mm:m("Amla + Nuvvulu (Sesame) Seeds","Fresh amla + 1 tbsp roasted sesame + walnuts"),
        lu:m("Pappu + Brown Rice + Palakura","Moong pappu (dal) + ½ cup brown rice + spinach fry"),
        es:m("Roasted Peanuts","¼ cup dry-roasted peanuts — Telugu staple, good fats"),
        di:m("Jonna Roti + Kobbari Pachadi","2 jowar rotis + coconut chutney + small dal")},
      {theme:"Fibre Power 🫘",
        em:m("Methi + Amla Water","Methi water + amla juice + 8 curry leaves chewed"),
        br:m("Kara Pongal","Savoury pongal with pepper + jeera + ginger — low GI"),
        mm:m("Guava + Cinnamon Water","1 whole guava + cinnamon water"),
        lu:m("Senagala Pappu + Jonna Roti","Chana dal + 2 jowar rotis + raw onion + nimbu"),
        es:m("Pesara Vada (Baked)","Baked moong vada — traditional protein snack"),
        di:m("Nuvvulu Pappu + Rice","Sesame dal + ½ cup brown rice — heart-healthy")},
      {theme:"Omega-3 Focus 🫀",
        em:m("Garlic + Jeera Water","Crushed garlic in warm jeera water"),
        br:m("Pesarattu + Flaxseed Chutney","Pesarattu with ground flaxseed chutney — omega-3 boost"),
        mm:m("Mixed Seeds","Flaxseed + pumpkin + sesame seeds 1 tbsp each"),
        lu:m("Pesara Pappu + Brown Rice + Kobbari","Moong dal + brown rice + coconut chutney (small)"),
        es:m("Moong Sprouts Chaat","Pesara sprouts + lemon + chilli"),
        di:m("Vegetable Khichdi","Moong + brown rice khichdi + ½ tsp ghee")},
      {theme:"Anti-Inflammatory 🌸",
        em:m("Haldi-Adrak-Tulsi Kadha","Turmeric + ginger + black pepper + tulsi water"),
        br:m("Ragi Dosa + Gongura Chutney","2 ragi dosas + gongura (sorrel) chutney — iron-rich"),
        mm:m("Papaya","1 cup papaya + pinch dry ginger"),
        lu:m("Tomato Pappu + Brown Rice","Tomato dal + ½ cup brown rice + majjiga (buttermilk)"),
        es:m("Green Tea + Nuvvulu","Unsweetened tea + roasted sesame til laddu (1 small)"),
        di:m("Pesara Pappu Soup + Jonna Roti","Light moong dal soup + 2 jowar rotis")},
      {theme:"Millet Magic 🌾",
        em:m("Methi + Jamun Seed Water","Methi water + ½ tsp jamun seed powder"),
        br:m("Ragi Sankati (Java)","Ragi porridge — traditional Andhra breakfast, no sugar"),
        mm:m("Amla-Flax Smoothie","Amla + flaxseeds + ginger + water blended"),
        lu:m("Jonna Roti + Sorakaya Pappu","Jowar roti + bottle gourd dal + curd"),
        es:m("Roasted Peanuts + Jeera Water","Dry-roasted peanuts + warm jeera water"),
        di:m("Pesara Pappu Khichdi","Moong dal + jowar khichdi with veggies")},
      {theme:"Gut Health Day 🫙",
        em:m("Methi + Tulsi","Methi water + 5 tulsi leaves chewed"),
        br:m("Idli + Sambar + Coconut Chutney","3 idlis (fermented probiotic) + Andhra sambar + coconut"),
        mm:m("Pomegranate","½ pomegranate — anti-inflammatory"),
        lu:m("Pulihora + Pappu","Tamarind rice (small portion) + moong dal + raw onion"),
        es:m("Perugu (Curd) + Chia","Homemade curd + 1 tbsp chia seeds"),
        di:m("Sorakaya Soup + Roti","Bottle gourd soup + 1–2 small rotis")},
      {theme:"Renewal ✨",
        em:m("Super Detox Drink","Warm water + lemon + honey + cinnamon + haldi"),
        br:m("Upma with Mixed Veggies","Semolina/oats upma with veggies + coconut chutney"),
        mm:m("Mixed Seasonal Fruit","Papaya + pomegranate + guava"),
        lu:m("Full Telugu Thali","Pappu + sambar + koora + perugu + ½ cup brown rice + papad"),
        es:m("Pesara Vada + Tulsi Tea","Baked moong vada + tulsi-ginger tea"),
        di:m("Pesara Pappu Khichdi","Light moong-veg khichdi + 1 tsp ghee")},
    ],
    "Non-Vegetarian":[
      {theme:"Detox & Reset 🌱",em:m("Methi + Lemon","Methi water + warm lemon + garlic"),br:m("Egg Pesarattu","Egg-stuffed pesarattu — high protein, low GI"),mm:m("Amla + Seeds","Amla + walnuts + sesame seeds"),lu:m("Royyala Pulusu + Brown Rice","Andhra prawn tamarind curry (light) + ½ cup brown rice"),es:m("Roasted Peanuts","¼ cup dry peanuts"),di:m("Jonna Roti + Kodi Pappu","2 jowar rotis + chicken dal — traditional Andhra")},
      {theme:"Protein Power 💪",em:m("Methi + Amla","Methi water + amla juice + curry leaves"),br:m("Egg Pulusu + Ragi Dosa","Egg tamarind curry + 2 ragi dosas — Andhra style"),mm:m("Guava + Seeds","Guava + pumpkin seeds"),lu:m("Kodi Kura + Brown Rice","Andhra chicken curry (light, tomato base) + ½ cup brown rice"),es:m("Sprouts + Perugu","Moong sprouts + curd"),di:m("Fish Pulusu + Jonna Roti","Light fish tamarind curry + 2 jowar rotis")},
      {theme:"Omega-3 Day 🫀",em:m("Garlic + Jeera Water","Garlic in warm jeera water"),br:m("Royyala Iguru + Ragi Dosa","Dry prawn stir-fry + 2 ragi dosas"),mm:m("Flaxseed + Amla","Flaxseeds + amla water"),lu:m("Chepa Pulusu + Brown Rice","Fish tamarind curry (Andhra) + ½ cup brown rice"),es:m("Makhana","Roasted makhana with turmeric"),di:m("Grilled Fish + Khichdi","Grilled rohu + moong-veg khichdi")},
      {theme:"Anti-Inflammatory 🌸",em:m("Haldi-Adrak Kadha","Turmeric + ginger + pepper + tulsi"),br:m("Egg Bhurji + Ragi Dosa","Egg bhurji with turmeric + 2 ragi dosas"),mm:m("Papaya","1 cup papaya"),lu:m("Kodi Sambar + Brown Rice","Chicken sambar + ½ cup brown rice + raita"),es:m("Green Tea + Walnuts","Unsweetened tea + 4 walnuts"),di:m("Fish Tikka + Jonna Roti","Grilled fish + 2 jowar rotis")},
      {theme:"Millet Day 🌾",em:m("Methi + Jamun Seed","Methi water + jamun seed powder"),br:m("Egg Pesarattu + Ragi Java","Egg pesarattu + small ragi porridge"),mm:m("Amla-Flax Smoothie","Amla + flaxseeds + ginger"),lu:m("Kodi Fry + Jonna Roti","Dry-spiced chicken + 2 jowar rotis — Andhra style"),es:m("Steamed Idli","2 idlis + gongura chutney"),di:m("Chepa Pulusu + Dalia","Light fish curry + cracked wheat")},
      {theme:"Gut Health 🫙",em:m("Methi + Tulsi","Methi water + tulsi leaves"),br:m("Egg Idli Sambar","2 eggs + 3 idlis + Andhra sambar"),mm:m("Pomegranate + Perugu","½ pomegranate + curd"),lu:m("Royyala Iguru + Brown Rice","Dry prawn stir-fry + ½ cup brown rice"),es:m("Chia Perugu","Curd + chia seeds"),di:m("Clear Kodi Soup + Roti","Thin chicken broth + 1 roti")},
      {theme:"Renewal ✨",em:m("Super Detox Drink","Warm water + lemon + honey + cinnamon + haldi"),br:m("Upma + Boiled Egg","Oats upma + 1 boiled egg"),mm:m("Mixed Fruit","Papaya + pomegranate + guava"),lu:m("Full Non-Veg Telugu Thali","Chicken + fish + pappu + rice + salad"),es:m("Chana + Tulsi Tea","Roasted chana + tulsi tea"),di:m("Moong Khichdi + Grilled Fish","Khichdi + 80g grilled rohu")},
    ],
    Vegan:[
      {theme:"Detox 🌱",em:m("Methi + Lemon + Garlic","Methi water + lemon + garlic + hing"),br:m("Pesarattu (Vegan)","Green moong crepe + ginger-coconut chutney"),mm:m("Amla + Sesame Seeds","Amla + roasted sesame + walnuts"),lu:m("Pappu + Brown Rice","Moong pappu + brown rice + spinach fry"),es:m("Roasted Peanuts","¼ cup dry peanuts"),di:m("Jonna Roti + Dal","2 jowar rotis + small moong dal, no dairy")},
      {theme:"Fibre 🫘",em:m("Methi + Amla","Methi water + amla + curry leaves"),br:m("Kara Pongal (Vegan)","Savoury pongal, coconut oil, no ghee"),mm:m("Guava + Cinnamon Water","Guava + cinnamon water"),lu:m("Chana Dal + Jonna Roti","Chana dal + 2 jowar rotis + salad"),es:m("Baked Pesara Vada","Baked moong vada"),di:m("Nuvvulu Pappu + Rice","Sesame dal + ½ cup brown rice")},
      {theme:"Omega-3 🫀",em:m("Garlic + Jeera Water","Garlic in warm jeera water"),br:m("Pesarattu + Flaxseed Chutney","Pesarattu + ground flaxseed + coconut chutney"),mm:m("Mixed Seeds","Flaxseed + pumpkin + sesame"),lu:m("Moong Dal + Brown Rice","Moong pappu + brown rice, coconut oil tadka"),es:m("Sprouts Chaat","Pesara sprouts + lemon"),di:m("Vegetable Khichdi","Moong + jowar khichdi, coconut oil")},
      {theme:"Anti-Inflammatory 🌸",em:m("Haldi Kadha","Turmeric + ginger + pepper + tulsi"),br:m("Ragi Dosa + Gongura Chutney","2 ragi dosas + gongura chutney (vegan)"),mm:m("Papaya","1 cup papaya"),lu:m("Tomato Pappu + Brown Rice","Tomato dal + ½ cup brown rice"),es:m("Green Tea + Sesame Laddu","Tea + 1 small til laddu"),di:m("Pappu Soup + Jonna Roti","Moong soup + 2 jowar rotis")},
      {theme:"Millet 🌾",em:m("Methi + Jamun Seed","Methi water + jamun powder"),br:m("Ragi Sankati","Ragi porridge, no sugar"),mm:m("Amla-Flax Smoothie","Amla + flaxseeds + water"),lu:m("Jonna Roti + Sorakaya Pappu","Jowar roti + bottle gourd dal"),es:m("Peanuts + Jeera Water","Dry peanuts + warm jeera water"),di:m("Pesara Khichdi","Moong + jowar khichdi")},
      {theme:"Gut 🫙",em:m("Methi + Tulsi","Methi water + tulsi"),br:m("Idli + Sambar (Vegan)","3 idlis + vegan sambar (no ghee tadka)"),mm:m("Pomegranate","½ pomegranate"),lu:m("Pulihora + Pappu","Tamarind rice (small) + moong dal"),es:m("Coconut Dahi + Chia","Coconut yoghurt + chia seeds"),di:m("Sorakaya Soup + Roti","Bottle gourd soup + roti")},
      {theme:"Renewal ✨",em:m("Super Detox Drink","Lemon + maple syrup + cinnamon + haldi"),br:m("Upma + Coconut","Oats upma + coconut chutney, no dairy"),mm:m("Mixed Fruit","Papaya + pomegranate + guava"),lu:m("Vegan Telugu Thali","Pappu + sambar + koora + brown rice + papad"),es:m("Peanuts + Herbal Tea","Peanuts + tulsi tea"),di:m("Moong Khichdi","Moong-veg khichdi, coconut oil")},
    ],
  },

  "Tamil":{
    Vegetarian:[
      {theme:"Kanji & Kollu Detox 🌱",
        em:m("Methi + Nimbu Water","Methi water + lemon + raw garlic"),
        br:m("Kara Pongal","Savory pongal with pepper + jeera + ginger — low GI, filling"),
        mm:m("Amla + Walnuts","Fresh amla + 5 walnuts + sesame seeds"),
        lu:m("Kollu Rasam + Brown Rice","Horse gram rasam + ½ cup brown rice — incredible for cholesterol"),
        es:m("Sundal (Boiled Chickpeas)","Boiled chana sundal with coconut + mustard — no fry"),
        di:m("Keerai Masiyal + Small Rice","Spinach mash + ½ cup brown rice — light, iron-rich")},
      {theme:"Fibre Power 🫘",
        em:m("Methi + Amla Water","Methi water + amla juice + curry leaves"),
        br:m("Idli + Sambar","3 steamed idlis (fermented probiotic) + vegetable sambar"),
        mm:m("Guava + Cinnamon Water","1 guava + cinnamon water"),
        lu:m("Paruppu + Brown Rice + Rasam","Toor dal + ½ cup brown rice + pepper rasam"),
        es:m("Roasted Murukkku-free Snack","1 cup makhana or peanuts — skip fried murukku"),
        di:m("Vendakkai Sambar + Small Rice","Okra sambar + ½ cup brown rice")},
      {theme:"Heart-Healthy Fats 🫀",
        em:m("Garlic + Jeera Water","Crushed garlic in warm jeera water"),
        br:m("Ragi Koozh","Finger millet porridge — Kongu Nadu tradition, extremely heart-healthy"),
        mm:m("Mixed Seeds","Flaxseed + sesame + pumpkin 1 tbsp each"),
        lu:m("Paruppu + Brown Rice + Aviyal","Dal + ½ cup brown rice + aviyal (mixed veg, no coconut cream)"),
        es:m("Moong Sprouts","Moong sprouts + lemon + pepper"),
        di:m("Vegetable Khichdi (Pongal)","Moong + brown rice pongal with veggies + ½ tsp ghee")},
      {theme:"Anti-Inflammatory 🌸",
        em:m("Milagu Jeeraga Rasam Water","Boil pepper + jeera in water — traditional Tamil anti-inflammatory"),
        br:m("Rava Idli + Tomato Chutney","3 rava idlis + fresh tomato chutney, no frying"),
        mm:m("Papaya","1 cup papaya + pinch dry ginger"),
        lu:m("Milagu Rasam + Brown Rice","Pepper rasam + ½ cup brown rice + papad"),
        es:m("Green Tea + Almonds","Unsweetened tea + 4 almonds"),
        di:m("Kozhukattai","2 steamed kozhukattai (rice dumplings) — light, wholesome")},
      {theme:"Millet Magic 🌾",
        em:m("Methi + Jamun Seed","Methi water + jamun seed powder"),
        br:m("Kambu (Pearl Millet) Koozh","Kambu porridge — traditional breakfast, lowers blood sugar"),
        mm:m("Amla-Flax Smoothie","Amla + flaxseeds + ginger blended"),
        lu:m("Samai (Little Millet) Rice + Dal","Little millet rice + toor dal + rasam"),
        es:m("Roasted Peanuts + Murunga Leaf Tea","Peanuts + drumstick leaf tea — potent anti-diabetic"),
        di:m("Ragi Mudde + Sambar","Finger millet balls + light sambar — classic healthy combo")},
      {theme:"Gut Health Day 🫙",
        em:m("Methi + Tulsi","Methi water + tulsi leaves"),
        br:m("Thayir Idli","2 idlis soaked in spiced curd — probiotic breakfast"),
        mm:m("Pomegranate","½ pomegranate"),
        lu:m("Thayir Sadam","Curd rice with mustard + curry leaves + pomegranate garnish — probiotic"),
        es:m("Perugu + Chia","Homemade curd + chia seeds"),
        di:m("Mor Kuzhambu + Small Rice","Buttermilk curry + ½ cup brown rice — digestive, cooling")},
      {theme:"Renewal ✨",
        em:m("Super Detox Drink","Warm water + lemon + honey + cinnamon + haldi"),
        br:m("Pongal (Ven Pongal)","Ven pongal with pepper + ghee (small) — Sunday special"),
        mm:m("Mixed Seasonal Fruit","Papaya + pomegranate + guava"),
        lu:m("Full Tamil Thali","Paruppu + rasam + sambar + kootu + thayir + small brown rice"),
        es:m("Sundal + Herbal Tea","Boiled moong sundal + tulsi-ginger tea"),
        di:m("Moong Dal Pongal","Light moong-veg pongal + 1 tsp ghee")},
    ],
    "Non-Vegetarian":[
      {theme:"Detox 🌱",em:m("Methi + Nimbu","Methi water + lemon + garlic"),br:m("Egg Dosa + Kollu Chutney","Egg dosa + horse gram chutney — high protein"),mm:m("Amla + Sesame","Amla + sesame seeds + walnuts"),lu:m("Meen Rasam + Brown Rice","Fish pepper rasam + ½ cup brown rice — light, anti-inflammatory"),es:m("Roasted Peanuts","¼ cup dry peanuts"),di:m("Kari Kuzhambu + Ragi Dosa","Chicken curry (light) + 2 ragi dosas")},
      {theme:"Protein Power 💪",em:m("Methi + Amla","Methi water + amla + curry leaves"),br:m("Egg Idli + Sambar","Egg stuffed idlis + veg sambar"),mm:m("Guava + Seeds","Guava + pumpkin seeds"),lu:m("Kozhi Kuzhambu + Brown Rice","Chettinad-lite chicken curry + ½ cup brown rice"),es:m("Sprouts + Curd","Moong sprouts + curd"),di:m("Meen Kozhambu + Small Rice","Tamarind fish curry + ½ cup brown rice")},
      {theme:"Omega-3 🫀",em:m("Garlic + Jeera","Garlic in warm jeera water"),br:m("Meen Varuval + Ragi Dosa","Grilled fish fry (min oil) + 2 ragi dosas"),mm:m("Seeds + Amla","Flaxseed + sesame + amla water"),lu:m("Meen Kulambu + Brown Rice","Fish curry + ½ cup brown rice + rasam"),es:m("Makhana + Tea","Makhana + unsweetened tea"),di:m("Grilled Fish + Pongal","Grilled fish + small moong pongal")},
      {theme:"Anti-Inflammatory 🌸",em:m("Milagu Rasam Water","Pepper + jeera + garlic boiled"),br:m("Egg Bhurji + Idli","Egg bhurji + 2 idlis"),mm:m("Papaya","1 cup papaya"),lu:m("Kozhi Milagu Varuval + Rice","Pepper chicken (dry, min oil) + ½ cup brown rice"),es:m("Green Tea + Almonds","Tea + 4 almonds"),di:m("Meen Varuval + Ragi Dosa","Grilled fish + 2 ragi dosas")},
      {theme:"Millet 🌾",em:m("Methi + Jamun Seed","Methi water + jamun seed powder"),br:m("Ragi Mudde + Egg Curry","Ragi mudde + 1-egg curry"),mm:m("Amla-Flax Smoothie","Amla + flaxseeds + ginger"),lu:m("Samai Rice + Kozhi Kozhambu","Little millet + light chicken curry"),es:m("Steamed Idli","2 idlis + chutney"),di:m("Meen Rasam + Brown Rice","Fish pepper rasam + ½ cup brown rice")},
      {theme:"Gut Health 🫙",em:m("Methi + Tulsi","Methi water + tulsi"),br:m("Egg Thayir Idli","Eggs + curd idli + sambar — probiotic"),mm:m("Pomegranate + Curd","½ pomegranate + curd"),lu:m("Thayir Sadam + Egg","Curd rice + 1 boiled egg"),es:m("Chia Curd","Curd + chia seeds"),di:m("Kozhi Rasam + Brown Rice","Chicken pepper rasam + ½ cup brown rice")},
      {theme:"Renewal ✨",em:m("Super Detox Drink","Lemon + honey + cinnamon + haldi"),br:m("Pongal + Egg","Ven pongal + 1 boiled egg"),mm:m("Mixed Fruit","Papaya + pomegranate + guava"),lu:m("Full Non-Veg Tamil Thali","Kozhi + meen + dal + sambar + rice"),es:m("Sundal + Herbal Tea","Peanut sundal + tulsi tea"),di:m("Moong Pongal + Grilled Fish","Light pongal + 80g grilled fish")},
    ],
    Vegan:[
      {theme:"Kanji Detox 🌱",em:m("Methi + Nimbu + Garlic","Methi water + lemon + garlic"),br:m("Kara Pongal (Vegan)","Pongal with coconut oil, no ghee"),mm:m("Amla + Seeds","Amla + sesame + walnuts"),lu:m("Kollu Rasam + Brown Rice","Horse gram rasam + ½ cup brown rice"),es:m("Sundal","Boiled chana + coconut + mustard"),di:m("Keerai Masiyal + Small Rice","Spinach mash + small brown rice")},
      {theme:"Fibre 🫘",em:m("Methi + Amla","Methi water + amla + curry leaves"),br:m("Idli + Vegan Sambar","3 idlis + sambar without ghee tadka"),mm:m("Guava + Cinnamon Water","Guava + cinnamon water"),lu:m("Paruppu + Brown Rice + Rasam","Toor dal + brown rice + pepper rasam"),es:m("Makhana","1 cup makhana"),di:m("Vendakkai Sambar + Rice","Okra sambar + ½ cup brown rice")},
      {theme:"Heart-Healthy 🫀",em:m("Garlic + Jeera","Garlic in warm jeera water"),br:m("Ragi Koozh","Ragi porridge — no milk, no sugar"),mm:m("Mixed Seeds","Flaxseed + sesame + pumpkin"),lu:m("Paruppu + Brown Rice + Aviyal","Dal + ½ cup brown rice + aviyal"),es:m("Sprouts","Moong sprouts + lemon"),di:m("Veg Pongal (Vegan)","Moong pongal, coconut oil, no ghee")},
      {theme:"Anti-Inflammatory 🌸",em:m("Milagu Rasam Water","Pepper + jeera + garlic boiled"),br:m("Rava Idli (Vegan)","3 rava idlis + tomato chutney, no curd"),mm:m("Papaya","1 cup papaya"),lu:m("Milagu Rasam + Brown Rice","Pepper rasam + ½ cup brown rice"),es:m("Green Tea + Almonds","Tea + 4 almonds"),di:m("Kozhukattai","2 steamed rice dumplings")},
      {theme:"Millet 🌾",em:m("Methi + Jamun Seed","Methi water + jamun seed powder"),br:m("Kambu Koozh","Kambu porridge, no dairy"),mm:m("Amla-Flax Smoothie","Amla + flaxseeds + water"),lu:m("Samai Rice + Dal","Little millet rice + toor dal + rasam"),es:m("Peanuts + Murunga Tea","Dry peanuts + drumstick leaf tea"),di:m("Ragi Mudde + Sambar","Ragi mudde + light sambar")},
      {theme:"Gut 🫙",em:m("Methi + Tulsi","Methi water + tulsi"),br:m("Idli + Vegan Sambar","3 idlis + vegan sambar"),mm:m("Pomegranate","½ pomegranate"),lu:m("Thayir Sadam (Coconut Curd)","Coconut curd rice + mustard + curry leaves"),es:m("Coconut Dahi + Chia","Coconut yoghurt + chia"),di:m("Mor Kuzhambu + Brown Rice","Vegan buttermilk curry + ½ cup brown rice")},
      {theme:"Renewal ✨",em:m("Super Detox Drink","Lemon + maple syrup + cinnamon + haldi"),br:m("Pongal (Vegan)","Ven pongal, coconut oil, no ghee"),mm:m("Mixed Fruit","Papaya + pomegranate + guava"),lu:m("Vegan Tamil Thali","Paruppu + sambar + kootu + brown rice + papad"),es:m("Sundal + Tea","Boiled moong sundal + tulsi tea"),di:m("Moong Dal Pongal (Vegan)","Moong pongal, coconut oil")},
    ],
  },

  "Kerala":{
    Vegetarian:[
      {theme:"Kanji & Cherupayar Detox 🌴",
        em:m("Methi + Warm Water + Coconut Vinegar","Methi water + splash coconut vinegar — Kerala detox"),
        br:m("Rice Kanji with Cherupayar","Rice porridge + boiled green moong thoran — traditional Kerala morning"),
        mm:m("Amla + Walnuts","Fresh amla + 5 walnuts"),
        lu:m("Brown Rice + Cherupayar Curry + Rasam","Brown rice + green moong curry + pepper rasam"),
        es:m("Banana (Nendran, small)","½ nendran banana — Kerala's best low-GI fruit"),
        di:m("Chapathi + Kadala Curry","2 wheat chapathis + black chickpea curry — protein-rich")},
      {theme:"Fibre Power 🫘",
        em:m("Methi + Amla Water","Methi water + amla juice + 8 curry leaves"),
        br:m("Puttu + Kadala Curry","Steamed puttu + black chana curry — traditional Kerala breakfast"),
        mm:m("Guava + Cinnamon Water","1 guava + cinnamon water"),
        lu:m("Brown Rice + Sambar + Thoran","Brown rice + vegetable sambar + cabbage thoran"),
        es:m("Roasted Groundnuts","¼ cup groundnuts — common Kerala snack"),
        di:m("Idiyappam + Vegetable Stew","2 idiyappam (string hoppers) + light vegetable stew")},
      {theme:"Heart-Healthy Fats 🫀",
        em:m("Garlic + Jeera Water","Crushed garlic in warm jeera water"),
        br:m("Appam + Coconut Stew","2 appam + light vegetable-coconut stew — choose thin coconut milk"),
        mm:m("Mixed Seeds","Flaxseed + pumpkin + sesame 1 tbsp each"),
        lu:m("Brown Rice + Olan + Rasam","Brown rice + ash gourd-bean olan + pepper rasam"),
        es:m("Moong Sprouts","Moong sprouts + lemon + pepper"),
        di:m("Vegetable Khichdi","Moong + brown rice khichdi + ½ tsp coconut oil")},
      {theme:"Anti-Inflammatory 🌸",
        em:m("Turmeric + Coconut Water","Turmeric + black pepper in warm coconut water — Kerala style"),
        br:m("Ragi Puttu","Finger millet puttu — no sugar, healthy twist"),
        mm:m("Papaya","1 cup papaya"),
        lu:m("Brown Rice + Erissery + Rasam","Brown rice + pumpkin-beans erissery + rasam"),
        es:m("Green Tea + Almonds","Tulsi tea + 4 almonds"),
        di:m("Cherupayar Dal + Chapathi","Green moong dal + 2 chapathis")},
      {theme:"Millet Magic 🌾",
        em:m("Methi + Jamun Seed","Methi water + ½ tsp jamun seed powder"),
        br:m("Ragi Kanji","Finger millet porridge — traditional Kerala wellness drink"),
        mm:m("Amla-Flax Smoothie","Amla + flaxseeds + ginger + water"),
        lu:m("Brown Rice + Avial","Brown rice + mixed vegetable avial (less coconut)"),
        es:m("Roasted Groundnuts + Tea","Groundnuts + unsweetened ginger tea"),
        di:m("Idiyappam + Moong Curry","2 idiyappam + green moong curry")},
      {theme:"Gut Health Day 🫙",
        em:m("Methi + Tulsi","Methi water + tulsi leaves"),
        br:m("Idli + Sambar + Coconut Chutney","3 idlis + sambar + fresh coconut chutney"),
        mm:m("Pomegranate","½ pomegranate"),
        lu:m("Curd Rice + Papad","Thayir sadam with mustard + curry leaves — probiotic"),
        es:m("Curd + Chia","Homemade curd + 1 tbsp chia seeds"),
        di:m("Chembu Curry + Small Rice","Taro root curry + ½ cup brown rice — gut-friendly")},
      {theme:"Renewal ✨",
        em:m("Super Detox Drink","Warm water + lemon + honey + cinnamon + haldi"),
        br:m("Appam + Vegetable Stew","2 appam + light coconut vegetable stew (Sunday special)"),
        mm:m("Mixed Seasonal Fruit","Papaya + pomegranate + nendran banana (½)"),
        lu:m("Kerala Sadhya (Healthy Version)","Brown rice + sambar + avial + thoran + rasam + papad"),
        es:m("Banana Chips (Baked, small) + Tea","Small baked chips + ginger tea"),
        di:m("Moong Dal Kanji","Green moong porridge + coconut + jeera — healing night meal")},
    ],
    "Non-Vegetarian":[
      {theme:"Detox 🌴",em:m("Methi + Coconut Water","Methi water + fresh coconut water"),br:m("Egg Roast + Appam","Kerala egg roast (light) + 2 appam"),mm:m("Amla + Walnuts","Amla + walnuts"),lu:m("Meen Curry + Brown Rice","Kerala fish curry (light coconut) + ½ cup brown rice"),es:m("Groundnuts","Roasted groundnuts"),di:m("Chicken Stew + Idiyappam","Light coconut chicken stew + 2 idiyappam")},
      {theme:"Protein Power 💪",em:m("Methi + Amla","Methi water + amla juice"),br:m("Egg Puttu + Kadala","Egg-stuffed puttu + black chana curry"),mm:m("Guava + Seeds","Guava + pumpkin seeds"),lu:m("Chicken Curry + Brown Rice","Nadan chicken curry (light) + ½ cup brown rice"),es:m("Sprouts + Curd","Moong sprouts + curd"),di:m("Fish Molee + Idiyappam","Light coconut fish molee + 2 idiyappam")},
      {theme:"Omega-3 🫀",em:m("Garlic + Jeera Water","Garlic in warm jeera water"),br:m("Grilled Karimeen + Appam","Grilled pearl spot fish (min oil) + 2 appam — Kerala omega-3"),mm:m("Flaxseed + Amla","Flaxseeds + amla water"),lu:m("Meen Mulagushyam + Brown Rice","Fish tamarind curry + ½ cup brown rice"),es:m("Makhana + Tea","Makhana + unsweetened tea"),di:m("Prawn Thoran + Rice","Dry coconut prawn stir-fry + ½ cup brown rice")},
      {theme:"Anti-Inflammatory 🌸",em:m("Turmeric + Coconut Water","Turmeric + pepper in coconut water"),br:m("Egg Roast + Ragi Puttu","Egg roast + ragi puttu"),mm:m("Papaya","1 cup papaya"),lu:m("Chicken Rasam + Brown Rice","Chicken pepper rasam + ½ cup brown rice"),es:m("Green Tea + Almonds","Tea + 4 almonds"),di:m("Grilled Fish + Chapathi","Grilled fish + 2 chapathis")},
      {theme:"Millet 🌾",em:m("Methi + Jamun Seed","Methi water + jamun seed powder"),br:m("Ragi Puttu + Egg Curry","Ragi puttu + 1-egg curry"),mm:m("Amla-Flax Smoothie","Amla + flaxseeds + ginger"),lu:m("Brown Rice + Prawn Thoran","Brown rice + dry prawn stir-fry"),es:m("Idli + Chutney","2 idlis + coconut chutney"),di:m("Meen Rasam + Brown Rice","Fish pepper rasam + ½ cup brown rice")},
      {theme:"Gut Health 🫙",em:m("Methi + Tulsi","Methi water + tulsi"),br:m("Egg Idli + Sambar","Egg + 3 idlis + sambar"),mm:m("Pomegranate + Curd","½ pomegranate + curd"),lu:m("Curd Rice + Grilled Fish","Curd rice + 80g grilled fish"),es:m("Chia Curd","Curd + chia seeds"),di:m("Chicken Soup + Chapathi","Clear chicken broth + 1 chapathi")},
      {theme:"Renewal ✨",em:m("Super Detox Drink","Lemon + honey + cinnamon + haldi"),br:m("Appam + Egg Stew","2 appam + egg stew (light coconut)"),mm:m("Mixed Fruit","Papaya + pomegranate + banana (½)"),lu:m("Kerala Non-Veg Sadhya","Rice + fish + chicken + sambar + avial"),es:m("Groundnuts + Tea","Groundnuts + ginger tea"),di:m("Kanji + Grilled Prawns","Rice kanji + 80g grilled prawns")},
    ],
    Vegan:[
      {theme:"Kanji Detox 🌴",em:m("Methi + Coconut Water","Methi water + coconut water + lemon"),br:m("Rice Kanji + Cherupayar Thoran","Rice porridge + green moong thoran (no dairy)"),mm:m("Amla + Seeds","Amla + walnuts + pumpkin seeds"),lu:m("Brown Rice + Cherupayar Curry","Brown rice + green moong + rasam"),es:m("Banana (Nendran, ½)","½ nendran banana"),di:m("Chapathi + Kadala Curry","2 chapathis + black chana curry, no dairy")},
      {theme:"Fibre 🫘",em:m("Methi + Amla","Methi water + amla + curry leaves"),br:m("Puttu (Ragi) + Kadala Curry","Ragi puttu + kadala curry, no dairy"),mm:m("Guava + Cinnamon Water","Guava + cinnamon water"),lu:m("Brown Rice + Sambar + Thoran","Brown rice + sambar (no ghee) + thoran"),es:m("Groundnuts","Roasted groundnuts"),di:m("Idiyappam + Veg Stew","2 idiyappam + vegetable-coconut stew (thin milk)")},
      {theme:"Heart-Healthy 🫀",em:m("Garlic + Jeera","Garlic in warm jeera water"),br:m("Appam + Thin Coconut Stew","2 appam + veg stew, thin coconut milk"),mm:m("Mixed Seeds","Flaxseed + sesame + pumpkin"),lu:m("Brown Rice + Olan","Brown rice + ash gourd-bean olan"),es:m("Sprouts","Moong sprouts + lemon"),di:m("Moong Khichdi","Moong + brown rice, coconut oil")},
      {theme:"Anti-Inflammatory 🌸",em:m("Turmeric + Coconut Water","Turmeric + pepper in coconut water"),br:m("Ragi Puttu (Vegan)","Ragi puttu, no dairy"),mm:m("Papaya","1 cup papaya"),lu:m("Brown Rice + Erissery + Rasam","Brown rice + pumpkin erissery + rasam"),es:m("Green Tea + Almonds","Tea + 4 almonds"),di:m("Cherupayar Dal + Chapathi","Moong dal + 2 chapathis")},
      {theme:"Millet 🌾",em:m("Methi + Jamun Seed","Methi water + jamun seed powder"),br:m("Ragi Kanji (Vegan)","Ragi porridge, water-based"),mm:m("Amla-Flax Smoothie","Amla + flaxseeds + water"),lu:m("Brown Rice + Avial","Brown rice + avial, less coconut"),es:m("Groundnuts + Tea","Groundnuts + ginger tea"),di:m("Idiyappam + Moong Curry","2 idiyappam + green moong curry, no dairy")},
      {theme:"Gut 🫙",em:m("Methi + Tulsi","Methi water + tulsi"),br:m("Idli + Vegan Sambar","3 idlis + sambar, no ghee"),mm:m("Pomegranate","½ pomegranate"),lu:m("Coconut Curd Rice","Coconut yoghurt rice + mustard + curry leaves"),es:m("Coconut Dahi + Chia","Coconut yoghurt + chia"),di:m("Chembu Curry + Brown Rice","Taro curry + ½ cup brown rice")},
      {theme:"Renewal ✨",em:m("Super Detox Drink","Lemon + maple syrup + cinnamon + haldi"),br:m("Appam + Veg Stew (Vegan)","2 appam + thin veg stew, coconut milk"),mm:m("Mixed Fruit","Papaya + pomegranate + banana (½)"),lu:m("Vegan Kerala Sadhya","Brown rice + sambar + avial + thoran + rasam"),es:m("Banana Chips (Baked) + Tea","Small baked chips + ginger tea"),di:m("Moong Kanji","Green moong porridge + coconut + jeera")},
    ],
  },

  "Bangalore":{
    Vegetarian:[
      {theme:"Akki Roti Detox 🌸",
        em:m("Methi + Warm Water + Tulsi","Methi water + tulsi + warm lemon — Bangalore morning"),
        br:m("Akki Roti + Coconut Chutney","Rice flour flatbread with onion + curry leaves + coconut chutney"),
        mm:m("Amla + Walnuts","Fresh amla + 5 walnuts + sesame seeds"),
        lu:m("Brown Rice + Sambar + Palya","Brown rice + vegetable sambar + beans palya"),
        es:m("Hurulikaalu (Horse Gram) Soup","Boiled horse gram soup — Bangalore's superfood, lowers cholesterol"),
        di:m("Jolada Roti + Dal","2 jowar rotis + toor dal — traditional Udupi-Bangalore combo")},
      {theme:"Fibre Power 🫘",
        em:m("Methi + Amla Water","Methi water + amla juice + curry leaves"),
        br:m("Ragi Mudde + Sambar","Finger millet balls + vegetable sambar — most filling low-GI breakfast"),
        mm:m("Guava + Cinnamon Water","1 guava + cinnamon water"),
        lu:m("Bisi Bele Bath (Light)","Bisi bele bath with less ghee, extra vegetables — one-pot comfort"),
        es:m("Kadle Usli (Boiled Chickpeas)","Seasoned boiled chickpeas — Bangalore traditional snack"),
        di:m("Akki Roti + Soppina Saaru","Rice roti + leafy green rasam")},
      {theme:"Heart-Healthy Fats 🫀",
        em:m("Garlic + Jeera Water","Crushed garlic in warm jeera water"),
        br:m("Ragi Dosa + Flaxseed Chutney","2 ragi dosas + ground flaxseed + coconut chutney"),
        mm:m("Mixed Seeds","Flaxseed + sesame + pumpkin 1 tbsp each"),
        lu:m("Brown Rice + Menthya Soppu (Methi) Dal","Brown rice + methi leaves dal — heart-healthy"),
        es:m("Moong Sprouts","Moong sprouts + lemon + pepper"),
        di:m("Vegetable Pongal","Moong + brown rice pongal with veggies + ½ tsp ghee")},
      {theme:"Anti-Inflammatory 🌸",
        em:m("Haldi-Adrak-Tulsi Kadha","Turmeric + ginger + black pepper + tulsi water"),
        br:m("Set Dosa + Tomato Saaru","2 set dosas + thin tomato rasam — light, anti-inflammatory"),
        mm:m("Papaya","1 cup papaya + pinch dry ginger"),
        lu:m("Brown Rice + Hurulikaalu Saaru","Brown rice + horse gram rasam — incredible anti-cholesterol combo"),
        es:m("Green Tea + Almonds","Unsweetened tea + 4 almonds"),
        di:m("Jolada Roti + Palak Dal","2 jowar rotis + spinach dal")},
      {theme:"Millet Magic 🌾",
        em:m("Methi + Jamun Seed","Methi water + ½ tsp jamun seed powder"),
        br:m("Ragi Kanji (Ambali)","Ragi porridge — traditional Karnataka breakfast, exceptional for sugar"),
        mm:m("Amla-Flax Smoothie","Amla + flaxseeds + ginger blended"),
        lu:m("Jolada Roti + Ennegayi","Jowar roti + stuffed small brinjal curry — Dharwad style"),
        es:m("Kadle Usli + Jeera Water","Boiled chana + warm jeera water"),
        di:m("Ragi Mudde + Bassaru","Ragi mudde + lentil-spinach bassar — Kannadiga superfood combination")},
      {theme:"Gut Health Day 🫙",
        em:m("Methi + Tulsi","Methi water + 5 tulsi leaves chewed"),
        br:m("Idli + Sambar + Coconut Chutney","3 steamed idlis + sambar + fresh coconut chutney"),
        mm:m("Pomegranate","½ pomegranate — polyphenols, anti-LDL"),
        lu:m("Mosaru Chitranna","Curd rice with mustard + curry leaves + pomegranate — probiotic"),
        es:m("Perugu + Chia","Homemade curd + chia seeds"),
        di:m("Soppu Saaru + Small Rice","Leafy green rasam + ½ cup brown rice — gut-healing")},
      {theme:"Renewal ✨",
        em:m("Super Detox Drink","Warm water + lemon + honey + cinnamon + haldi"),
        br:m("Rava Kesari Bath (tiny) + Idli","1 small kesari bath + 2 idlis — Sunday Bangalore tradition (minimal sugar)"),
        mm:m("Mixed Seasonal Fruit","Papaya + pomegranate + guava"),
        lu:m("Full Karnataka Thali","Dal + sambar + palya + raita + small brown rice + jolada roti"),
        es:m("Kadle Usli + Herbal Tea","Boiled chickpeas + tulsi-ginger tea"),
        di:m("Bisi Bele Bath (Small)","Light bisi bele bath + 1 tsp ghee + papad")},
    ],
    "Non-Vegetarian":[
      {theme:"Detox 🌸",em:m("Methi + Tulsi + Lemon","Methi water + tulsi + lemon"),br:m("Egg Akki Roti","Egg + akki roti — Karnataka style"),mm:m("Amla + Seeds","Amla + walnuts + sesame"),lu:m("Chicken Saaru + Brown Rice","Light Bangalore chicken rasam + ½ cup brown rice"),es:m("Hurulikaalu Soup","Horse gram soup"),di:m("Jolada Roti + Chicken Palya","2 jowar rotis + dry chicken stir-fry, min oil")},
      {theme:"Protein Power 💪",em:m("Methi + Amla","Methi water + amla + curry leaves"),br:m("Egg Dosa + Sambar","Egg dosa + veg sambar"),mm:m("Guava + Seeds","Guava + pumpkin seeds"),lu:m("Mutton Saaru + Brown Rice","Light mutton rasam (thin broth) + ½ cup brown rice"),es:m("Sprouts + Curd","Moong sprouts + curd"),di:m("Chicken Curry + Jolada Roti","Nati chicken curry (light) + 2 jowar rotis")},
      {theme:"Omega-3 🫀",em:m("Garlic + Jeera","Garlic in warm jeera water"),br:m("Grilled Fish + Ragi Dosa","Grilled Kane fish + 2 ragi dosas — Karnataka favourite"),mm:m("Seeds + Amla","Flaxseed + sesame + amla water"),lu:m("Fish Saaru + Brown Rice","Fish rasam (Karnataka) + ½ cup brown rice"),es:m("Makhana + Tea","Makhana + unsweetened tea"),di:m("Prawn Palya + Akki Roti","Dry coconut prawn stir-fry + 2 akki rotis")},
      {theme:"Anti-Inflammatory 🌸",em:m("Haldi Kadha","Turmeric + ginger + pepper + tulsi"),br:m("Egg Bhurji + Set Dosa","Egg bhurji + 2 set dosas"),mm:m("Papaya","1 cup papaya"),lu:m("Hurulikaalu Saaru + Brown Rice + Chicken","Horse gram rasam + chicken + brown rice"),es:m("Green Tea + Almonds","Tea + 4 almonds"),di:m("Grilled Fish + Jolada Roti","Grilled fish + 2 jowar rotis")},
      {theme:"Millet 🌾",em:m("Methi + Jamun Seed","Methi water + jamun seed powder"),br:m("Ragi Mudde + Egg Curry","Ragi mudde + 1-egg curry"),mm:m("Amla-Flax Smoothie","Amla + flaxseeds + ginger"),lu:m("Jolada Roti + Mutton Saaru","2 jowar rotis + thin mutton broth"),es:m("Steamed Idli","2 idlis + chutney"),di:m("Fish Saaru + Brown Rice","Fish rasam + ½ cup brown rice")},
      {theme:"Gut Health 🫙",em:m("Methi + Tulsi","Methi water + tulsi"),br:m("Egg Idli + Sambar","2 eggs + 3 idlis + sambar"),mm:m("Pomegranate + Curd","½ pomegranate + curd"),lu:m("Mosaru Chitranna + Grilled Fish","Curd rice + 80g grilled fish"),es:m("Chia Curd","Curd + chia seeds"),di:m("Chicken Saaru + Jolada Roti","Chicken rasam + 2 jowar rotis")},
      {theme:"Renewal ✨",em:m("Super Detox Drink","Lemon + honey + cinnamon + haldi"),br:m("Set Dosa + Egg + Sambar","2 set dosas + egg + sambar"),mm:m("Mixed Fruit","Papaya + pomegranate + guava"),lu:m("Karnataka Non-Veg Thali","Chicken + fish + dal + sambar + rice + jowar roti"),es:m("Kadle + Tea","Boiled chickpeas + tulsi tea"),di:m("Bisi Bele Bath + Grilled Chicken","Light bisi bele bath + 80g grilled chicken")},
    ],
    Vegan:[
      {theme:"Akki Roti Detox 🌸",em:m("Methi + Tulsi + Lemon","Methi water + tulsi + lemon"),br:m("Akki Roti (Vegan)","Akki roti + coconut chutney, no dairy"),mm:m("Amla + Seeds","Amla + walnuts + sesame"),lu:m("Brown Rice + Sambar + Palya","Brown rice + sambar (no ghee) + palya"),es:m("Hurulikaalu Soup","Horse gram soup"),di:m("Jolada Roti + Dal","2 jowar rotis + toor dal, no dairy")},
      {theme:"Fibre 🫘",em:m("Methi + Amla","Methi water + amla + curry leaves"),br:m("Ragi Mudde + Vegan Sambar","Ragi mudde + sambar without ghee tadka"),mm:m("Guava + Cinnamon Water","Guava + cinnamon water"),lu:m("Bisi Bele Bath (Vegan)","Bisi bele bath, coconut oil, no ghee"),es:m("Kadle Usli","Boiled chickpeas seasoned"),di:m("Akki Roti + Soppina Saaru","Rice roti + leafy green rasam")},
      {theme:"Heart-Healthy 🫀",em:m("Garlic + Jeera","Garlic in warm jeera water"),br:m("Ragi Dosa + Flaxseed Chutney","2 ragi dosas + flaxseed + coconut chutney"),mm:m("Mixed Seeds","Flaxseed + sesame + pumpkin"),lu:m("Brown Rice + Methi Dal","Brown rice + methi dal, mustard oil"),es:m("Sprouts","Moong sprouts + lemon"),di:m("Veg Pongal (Vegan)","Moong pongal, coconut oil")},
      {theme:"Anti-Inflammatory 🌸",em:m("Haldi Kadha","Turmeric + ginger + pepper + tulsi"),br:m("Set Dosa (Vegan)","2 set dosas + tomato chutney, no curd"),mm:m("Papaya","1 cup papaya"),lu:m("Brown Rice + Hurulikaalu Saaru","Brown rice + horse gram rasam"),es:m("Green Tea + Almonds","Tea + 4 almonds"),di:m("Jolada Roti + Palak Dal","2 jowar rotis + spinach dal")},
      {theme:"Millet 🌾",em:m("Methi + Jamun Seed","Methi water + jamun seed powder"),br:m("Ragi Ambali (Vegan)","Ragi porridge, water-based"),mm:m("Amla-Flax Smoothie","Amla + flaxseeds + water"),lu:m("Jolada Roti + Ennegayi","Jowar roti + stuffed brinjal curry"),es:m("Kadle Usli + Jeera Water","Chickpeas + warm jeera water"),di:m("Ragi Mudde + Bassaru","Ragi mudde + lentil-spinach bassaru")},
      {theme:"Gut 🫙",em:m("Methi + Tulsi","Methi water + tulsi"),br:m("Idli + Vegan Sambar","3 idlis + sambar, no ghee"),mm:m("Pomegranate","½ pomegranate"),lu:m("Mosaru Chitranna (Coconut Curd)","Coconut curd rice + mustard + curry leaves"),es:m("Coconut Dahi + Chia","Coconut yoghurt + chia"),di:m("Soppu Saaru + Small Rice","Leafy green rasam + ½ cup brown rice")},
      {theme:"Renewal ✨",em:m("Super Detox Drink","Lemon + maple syrup + cinnamon + haldi"),br:m("Ragi Mudde + Sambar (Vegan)","Ragi mudde + vegan sambar"),mm:m("Mixed Fruit","Papaya + pomegranate + guava"),lu:m("Vegan Karnataka Thali","Dal + sambar + palya + brown rice + jowar roti"),es:m("Kadle + Herbal Tea","Chickpeas + tulsi tea"),di:m("Bisi Bele Bath (Vegan)","Light bisi bele bath, coconut oil")},
    ],
  },
};


// ── PROTEIN DATA ──────────────────────────────────────────────────────────────
// Evening snacks — alternating chana / sprouts (all diets)
const PROTEIN_SNACKS = [
  {t:"Roasted Chana",          d:"½ cup dry-roasted chana · ~10g protein · jeera water on the side"},
  {t:"Moong Sprouts Chaat",    d:"1 cup moong sprouts · ~14g protein · lemon + chilli + onion"},
  {t:"Roasted Chana",          d:"½ cup roasted chana · ~10g protein · unsweetened green tea"},
  {t:"Sprouted Chana Salad",   d:"1 cup sprouted chickpeas · ~15g protein · cucumber + lemon + pepper"},
  {t:"Mixed Sprouts",          d:"½ cup moong + chana sprouts · ~12g protein · amla on the side"},
  {t:"Roasted Chana",          d:"½ cup roasted chana · ~10g protein · tulsi-ginger herbal tea"},
  {t:"Sprouts Bhel",           d:"1 cup moong sprouts + onion + tomato + lemon · ~14g protein"},
];

// Air-fry dinners for Non-Vegetarian — alternating chicken / salmon
const AIR_FRY_DINNERS = [
  {t:"Air Fry Chicken Breast",        d:"150g air fry chicken (0 oil) · ~47g protein · side salad + 1 roti"},
  {t:"Air Fry Salmon Fillet",         d:"150g air fry salmon (5 min, 200°C) · ~37g protein · lemon + herbs + brown rice"},
  {t:"Air Fry Chicken Tikka",         d:"150g air fry chicken tikka (no oil marinade) · ~47g protein · mint chutney + 2 bajra rotis"},
  {t:"Air Fry Salmon + Quinoa Bowl",  d:"150g air fry salmon · ~37g protein · ½ cup brown rice + cucumber salad"},
  {t:"Air Fry Chicken Thigh",         d:"150g air fry boneless thigh (200°C, 18 min) · ~43g protein + spinach sabzi"},
  {t:"Air Fry Salmon with Herbs",     d:"150g air fry salmon + turmeric-lemon rub · ~37g protein + 1 jowar roti"},
  {t:"Air Fry Chicken Breast + Dal",  d:"150g air fry chicken · ~47g protein · moong dal + 1 roti"},
];

// Air-fry lunch options for Non-Vegetarian (supplement lu on high-protein days)
const AIR_FRY_LUNCHES = [
  {t:"Air Fry Chicken + Brown Rice",  d:"150g air fry chicken breast · ~47g protein · ½ cup brown rice + raita"},
  {t:"Air Fry Salmon + Dal",          d:"150g air fry salmon · ~37g protein · moong dal + ½ cup brown rice"},
  {t:"Air Fry Chicken Bowl",          d:"150g air fry chicken + veggies · ~47g protein · jowar roti + salad"},
  {t:"Air Fry Salmon + Millet",       d:"150g air fry salmon · ~37g protein · ragi roti + green chutney"},
  {t:"Air Fry Chicken + Palak Dal",   d:"150g air fry chicken · ~47g protein · palak dal + brown rice"},
  {t:"Air Fry Salmon + Rice",         d:"150g air fry salmon · ~37g protein · ½ cup brown rice + rasam"},
  {t:"Air Fry Chicken Thali",         d:"150g air fry chicken · ~47g protein · dal + sabzi + 1 roti"},
];

// Protein estimates per day (grams) — displayed as a badge
const PROTEIN_EST = {
  Vegetarian:       [72, 74, 71, 75, 70, 76, 73],
  "Non-Vegetarian": [88, 92, 95, 85, 90, 89, 84],
  Vegan:            [70, 73, 71, 74, 70, 75, 71],
};

// Per-meal protein sources shown in the breakdown
const PROTEIN_BREAKDOWN = {
  Vegetarian: [
    ["Oats/Daliya ~8g","Moong Dal ~18g","Chana Snack ~10g","Paneer/Tofu ~18g","Curd ~8g","Nuts/Seeds ~6g","= ~68–78g"],
    ["Daliya ~8g","Rajma/Dal ~18g","Chana Snack ~10g","Dal ~18g","Curd ~8g","Seeds ~6g","= ~68–78g"],
    ["Smoothie ~10g","Chana Dal ~20g","Sprouts ~14g","Khichdi ~15g","Seeds ~6g","Curd ~8g","= ~73g"],
    ["Besan/Moong ~12g","Dal ~18g","Sprouts/Chana ~12g","Paneer ~18g","Curd ~8g","Nuts ~5g","= ~73–75g"],
    ["Ragi ~7g","Chana Dal ~20g","Seeds ~6g","Dal ~18g","Chana ~10g","Khichdi ~12g","= ~73g"],
    ["Idli ~6g","Chole ~15g","Chana ~10g","Dal ~18g","Curd ~11g","Seeds ~6g","= ~66–76g"],
    ["Poha ~5g","Dal Thali ~20g","Sprouts ~14g","Dal ~18g","Chana ~10g","Curd ~8g","= ~75g"],
  ],
  "Non-Vegetarian":[
    ["Eggs ~12g","Air Fry Chicken ~47g","Chana ~10g","Dal ~12g","Curd ~8g","Seeds ~5g","= ~94g*"],
    ["Eggs ~12g","Chicken ~47g","Sprouts ~14g","Dal ~12g","Curd ~8g","Nuts ~5g","= ~98g*"],
    ["Fish ~37g","Air Fry Salmon ~37g","Chana ~10g","Egg ~12g","Curd ~8g","Seeds ~5g","= ~109g*"],
    ["Eggs ~12g","Chicken/Fish ~40g","Sprouts ~14g","Dal ~12g","Curd ~8g","Nuts ~5g","= ~91g"],
    ["Eggs ~12g","Chicken ~47g","Chana ~10g","Dal ~12g","Curd ~8g","Seeds ~5g","= ~94g"],
    ["Eggs ~12g","Fish ~37g","Sprouts ~14g","Dal ~12g","Curd ~8g","Nuts ~5g","= ~88g"],
    ["Eggs ~12g","Chicken ~47g","Chana ~10g","Dal ~12g","Curd ~8g","Seeds ~5g","= ~94g"],
  ],
  Vegan:[
    ["Tofu/Moong ~14g","Dal ~18g","Chana ~10g","Dal ~18g","Seeds ~8g","Sprouts ~6g","= ~74g"],
    ["Tofu ~14g","Rajma ~18g","Sprouts ~14g","Dal ~18g","Chana ~10g","Seeds ~6g","= ~80g"],
    ["Oats ~8g","Chana Dal ~20g","Seeds ~8g","Khichdi ~14g","Chana ~10g","Seeds ~6g","= ~66–76g"],
    ["Moong ~12g","Dal ~18g","Sprouts ~14g","Dal ~18g","Chana ~10g","Seeds ~6g","= ~78g"],
    ["Ragi ~7g","Chana Dal ~20g","Seeds ~8g","Dal ~18g","Chana ~10g","Seeds ~6g","= ~69–75g"],
    ["Idli ~6g","Chole ~15g","Sprouts ~14g","Dal ~18g","Chana ~10g","Seeds ~6g","= ~69–75g"],
    ["Tofu ~14g","Dal ~18g","Chana ~10g","Dal ~18g","Sprouts ~14g","Seeds ~6g","= ~80g"],
  ],
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
function goalColor(g){ return [...GOALS_MALE,...GOALS_FEMALE].find(x=>x.id===g)?.color || C.text2; }
function goalIcon(g){  return [...GOALS_MALE,...GOALS_FEMALE].find(x=>x.id===g)?.icon  || ""; }

function buildPlan(profile){
  const { gender, diet, style, goals, region } = profile;
  const dietKey = diet || "Vegetarian";
  const regionMeals = region && REGION_MEALS[region]?.[dietKey];
  const baseMeals = regionMeals || BASE_MEALS[dietKey] || BASE_MEALS.Vegetarian;
  const styleKey = style === "Modern" ? "Modern" : style === "Ayurvedic" ? "Ayurvedic" : "Both";

  // ── Protein enhancement: inject snacks + air-fry ──────────────────────────
  const meals = baseMeals.map((day, i) => {
    const enhanced = { ...day, es: PROTEIN_SNACKS[i] };
    if (dietKey === "Non-Vegetarian") {
      // Alternate: odd days air-fry lunch, even days air-fry dinner
      if (i % 2 === 0) {
        enhanced.di = AIR_FRY_DINNERS[i];
      } else {
        enhanced.lu = AIR_FRY_LUNCHES[i];
        enhanced.di = AIR_FRY_DINNERS[i];
      }
    }
    return enhanced;
  });

  const allRemedies=[], morningAdds=[], eatSet=new Set(), avoidSet=new Set(), allTips=[];

  goals.forEach(g=>{
    const gd = GOAL_DATA[g]; if(!gd) return;
    const styleBlock = gd.remedies[styleKey] || gd.remedies["Both"] || {};
    const list = styleBlock[gender] || styleBlock.Male || [];
    list.forEach(r=>allRemedies.push({...r,goal:g,gc:gd.color}));
    const mAdds = gd.morningAdd?.[gender] || gd.morningAdd?.Male || [];
    mAdds.forEach(a=>morningAdds.push({text:a,goal:g}));
    const fe = gd.foodsToEat?.[gender] || gd.foodsToEat?.Male || [];
    fe.forEach(f=>eatSet.add(f));
    const avoidList = Array.isArray(gd.foodsToAvoid)
      ? gd.foodsToAvoid
      : (gd.foodsToAvoid?.[gender] || gd.foodsToAvoid?.Male || []);
    avoidList.forEach(f=>avoidSet.add(f));
    const gt = gd.tips?.[gender] || gd.tips?.Male || [];
    gt.forEach(t=>allTips.push({...t,goal:g}));
  });

  return { meals, allRemedies, morningAdds, foodsToEat:[...eatSet], foodsToAvoid:[...avoidSet], allTips };
}

// ── UI PIECES ─────────────────────────────────────────────────────────────────
function SecLabel({label,color=C.text2}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:9}}>
      <div style={{width:3,height:14,borderRadius:2,background:color}}/>
      <span style={{fontSize:11,fontWeight:700,letterSpacing:1.3,textTransform:"uppercase",color:C.text2}}>{label}</span>
    </div>
  );
}

function SingleChip({item,selected,onSelect,color}){
  const on=selected===item.id;
  return(
    <button onClick={()=>onSelect(item.id)} style={{
      display:"flex",alignItems:"center",gap:9,padding:"10px 13px",
      borderRadius:13,border:`1.5px solid ${on?color:C.border}`,
      background:on?color+"1A":C.card,cursor:"pointer",flex:1,minWidth:0,
      boxShadow:on?`0 0 12px ${color}33`:"none",
      transform:on?"scale(1.02)":"scale(1)",transition:"all 0.15s",
    }}>
      <span style={{fontSize:18}}>{item.icon}</span>
      <div style={{textAlign:"left",flex:1,minWidth:0}}>
        <div style={{fontSize:12,fontWeight:700,color:on?color:C.text1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.label}</div>
        {item.sub&&<div style={{fontSize:10,color:C.text3}}>{item.sub}</div>}
      </div>
      {on&&<div style={{width:15,height:15,borderRadius:"50%",background:color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"#000",flexShrink:0}}>✓</div>}
    </button>
  );
}

function GoalChip({item,selected,onToggle}){
  const on=selected.includes(item.id);
  return(
    <button onClick={()=>onToggle(item.id)} style={{
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      gap:3,padding:"11px 4px",borderRadius:13,
      border:`1.5px solid ${on?item.color:C.border}`,
      background:on?item.color+"18":C.card,cursor:"pointer",flex:1,minWidth:0,
      boxShadow:on?`0 0 12px ${item.color}33`:"none",
      transform:on?"scale(1.04)":"scale(1)",transition:"all 0.15s",
    }}>
      <span style={{fontSize:20}}>{item.icon}</span>
      <span style={{fontSize:9,fontWeight:700,color:on?item.color:C.text2,textAlign:"center",lineHeight:1.2}}>{item.short}</span>
      {on&&<div style={{width:12,height:12,borderRadius:"50%",background:item.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,color:"#000"}}>✓</div>}
    </button>
  );
}

// Gender selector pill
function GenderPill({g,selected,onSelect}){
  const cfg={Male:{icon:"♂",label:"Male",color:C.blue},Female:{icon:"♀",label:"Female",color:C.rose}}[g];
  const on=selected===g;
  return(
    <button onClick={()=>onSelect(g)} style={{
      flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      gap:6,padding:"16px 10px",borderRadius:16,
      border:`2px solid ${on?cfg.color:C.border}`,
      background:on?cfg.color+"18":C.card,cursor:"pointer",
      boxShadow:on?`0 0 20px ${cfg.color}44`:"none",
      transform:on?"scale(1.03)":"scale(1)",transition:"all 0.2s cubic-bezier(.34,1.56,.64,1)",
    }}>
      <span style={{fontSize:36,color:on?cfg.color:C.text3}}>{cfg.icon}</span>
      <span style={{fontSize:13,fontWeight:800,color:on?cfg.color:C.text2}}>{cfg.label}</span>
      {on&&<div style={{width:18,height:18,borderRadius:"50%",background:cfg.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#000"}}>✓</div>}
    </button>
  );
}

function DayCard({day,idx,meal,goals,todayIdx,diet}){
  const isToday = idx === todayIdx;
  const [open,setOpen]=useState(isToday);
  const [showProtein,setShowProtein]=useState(false);
  const cardRef = useRef(null);
  const acc=[C.green,C.teal,C.orange,C.purple,C.pink,C.teal,C.yellow][idx];
  const rows=[{k:"em",l:"Early Morning",e:"🌅"},{k:"br",l:"Breakfast",e:"🍳"},{k:"mm",l:"Mid-Morning",e:"🍎"},{k:"lu",l:"Lunch",e:"🍛"},{k:"es",l:"Evening Snack",e:"💪"},{k:"di",l:"Dinner",e:"🌙"}];
  const dietKey = diet || "Vegetarian";
  const proteinEst = (PROTEIN_EST[dietKey] || PROTEIN_EST.Vegetarian)[idx];
  const breakdown = (PROTEIN_BREAKDOWN[dietKey] || PROTEIN_BREAKDOWN.Vegetarian)[idx];
  const proteinPct = Math.min(100, Math.round((proteinEst / 100) * 100));
  const proteinColor = proteinEst >= 80 ? C.green : proteinEst >= 70 ? "#FFD60A" : C.orange;

  useEffect(()=>{
    if(isToday && cardRef.current){
      setTimeout(()=>cardRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),400);
    }
  },[]);

  return(
    <div ref={cardRef} style={{background:C.card,borderRadius:15,border:`1.5px solid ${isToday?acc:open?acc+"55":C.border}`,marginBottom:9,overflow:"hidden",transition:"border-color 0.2s",boxShadow:isToday?`0 0 18px ${acc}33`:"none"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{width:"100%",background:isToday?acc+"0A":"none",border:"none",cursor:"pointer",padding:"12px 14px",display:"flex",alignItems:"center",gap:10,color:C.text1}}>
        <div style={{width:32,height:32,borderRadius:9,background:acc+"22",border:`1.5px solid ${acc}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:acc,flexShrink:0}}>{idx+1}</div>
        <div style={{flex:1,textAlign:"left"}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:13,fontWeight:700}}>{day}</span>
            {isToday&&<span style={{fontSize:9,fontWeight:800,padding:"2px 7px",borderRadius:20,background:acc,color:"#000",letterSpacing:.5}}>TODAY</span>}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}>
            <span style={{fontSize:10,color:C.text3}}>{meal.theme}</span>
            <span style={{fontSize:9,fontWeight:800,padding:"1px 7px",borderRadius:20,background:proteinColor+"22",color:proteinColor,border:`1px solid ${proteinColor}44`}}>~{proteinEst}g protein</span>
          </div>
        </div>
        <div style={{display:"flex",gap:3,marginRight:4}}>{goals.slice(0,4).map(g=><span key={g} style={{fontSize:12}}>{goalIcon(g)}</span>)}</div>
        <div style={{fontSize:10,color:C.text3,transition:"transform 0.2s",transform:open?"rotate(180deg)":"none"}}>▼</div>
      </button>

      {/* Protein bar — always visible when card is open OR closed but today */}
      <div style={{height:3,background:C.border}}>
        <div style={{height:3,width:`${proteinPct}%`,background:`linear-gradient(90deg,${proteinColor},${proteinColor}88)`,transition:"width 0.6s ease",borderRadius:2}}/>
      </div>

      {open&&(
        <div style={{padding:"0 12px 12px"}}>
          {/* Protein summary pill */}
          <button onClick={()=>setShowProtein(s=>!s)} style={{
            width:"100%",margin:"10px 0 8px",background:proteinColor+"12",border:`1px solid ${proteinColor}33`,
            borderRadius:10,padding:"8px 12px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",
          }}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:14}}>💪</span>
              <div style={{textAlign:"left"}}>
                <div style={{fontSize:11,fontWeight:700,color:proteinColor}}>Daily Protein Target: ~{proteinEst}g</div>
                <div style={{fontSize:10,color:C.text3}}>Target: 70g min · {proteinEst>=70?"✅ Met":"⚠️ Boost with snacks"} · tap to see breakdown</div>
              </div>
            </div>
            <span style={{fontSize:10,color:C.text3,transition:"transform 0.2s",transform:showProtein?"rotate(180deg)":"none"}}>▼</span>
          </button>

          {showProtein&&(
            <div style={{background:C.surface,borderRadius:10,padding:"10px 12px",marginBottom:10,border:`1px solid ${proteinColor}22`}}>
              <div style={{fontSize:10,fontWeight:700,color:proteinColor,marginBottom:7,letterSpacing:.8}}>PROTEIN BREAKDOWN</div>
              {breakdown.map((item,i)=>{
                const isTotal=item.startsWith("=");
                return(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
                    {!isTotal&&<div style={{width:8,height:8,borderRadius:"50%",background:proteinColor+"66",flexShrink:0}}/>}
                    <span style={{fontSize:isTotal?11:10,color:isTotal?proteinColor:C.text2,fontWeight:isTotal?700:400}}>{item}</span>
                  </div>
                );
              })}
              {dietKey==="Non-Vegetarian"&&<p style={{fontSize:9,color:C.text3,margin:"6px 0 0",fontStyle:"italic"}}>*Air fry chicken/salmon included in lunch and/or dinner — no oil, max protein retention.</p>}
            </div>
          )}

          {/* Meals grid */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:8}}>
            {rows.map(r=>{
              const meal_item = meal[r.k];
              const isProteinSnack = r.k==="es";
              const isAirFry = meal_item?.d?.includes("air fry") || meal_item?.d?.includes("Air fry");
              return(
                <div key={r.k} style={{
                  background:isAirFry?"#5AC8FA0A":isProteinSnack?C.green+"0A":C.surface,
                  borderRadius:10,padding:"10px 11px",
                  border:`1px solid ${isAirFry?C.teal+"44":isProteinSnack?C.green+"33":C.border}`,
                }}>
                  <div style={{fontSize:9,fontWeight:700,letterSpacing:.8,color:isAirFry?C.teal:isProteinSnack?C.green:C.orange,marginBottom:3}}>
                    {r.e} {r.l.toUpperCase()}
                    {isProteinSnack&&<span style={{marginLeft:4,fontSize:8,background:C.green+"22",color:C.green,padding:"1px 5px",borderRadius:8,fontWeight:800}}>PROTEIN</span>}
                    {isAirFry&&<span style={{marginLeft:4,fontSize:8,background:C.teal+"22",color:C.teal,padding:"1px 5px",borderRadius:8,fontWeight:800}}>AIR FRY</span>}
                  </div>
                  <div style={{fontSize:12,fontWeight:700,color:C.text1,marginBottom:2}}>{meal_item?.t}</div>
                  <div style={{fontSize:10,color:C.text2,lineHeight:1.5}}>{meal_item?.d}</div>
                </div>
              );
            })}
          </div>
          <div style={{background:C.teal+"12",borderRadius:10,padding:"10px 12px",border:`1px solid ${C.teal}33`,display:"flex",gap:8,alignItems:"flex-start"}}>
            <span style={{fontSize:16}}>🏃</span>
            <div>
              <div style={{fontSize:9,fontWeight:700,letterSpacing:.8,color:C.teal,marginBottom:2}}>EXERCISE</div>
              <div style={{fontSize:11,color:C.text2}}>{EXERCISE_PLAN[idx]}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── COLLAPSIBLE SECTION ───────────────────────────────────────────────────────
function CollapsibleSection({ title, subtitle, icon, accentColor=C.yellow, defaultOpen=true, badge, children }){
  const [open,setOpen]=useState(defaultOpen);
  return(
    <div style={{borderRadius:14,border:`1px solid ${open?accentColor+"44":C.border}`,marginBottom:12,overflow:"hidden",transition:"border-color 0.2s",background:C.card}}>
      <button onClick={()=>setOpen(o=>!o)} style={{
        width:"100%",background:open?accentColor+"0D":"none",border:"none",cursor:"pointer",
        padding:"12px 14px",display:"flex",alignItems:"center",gap:10,color:C.text1,
      }}>
        <span style={{fontSize:18,flexShrink:0}}>{icon}</span>
        <div style={{flex:1,textAlign:"left"}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:12,fontWeight:700,color:open?accentColor:C.text1}}>{title}</span>
            {badge&&<span style={{fontSize:9,fontWeight:800,padding:"2px 7px",borderRadius:20,background:accentColor,color:"#000"}}>{badge}</span>}
          </div>
          {subtitle&&<div style={{fontSize:10,color:C.text3,marginTop:1}}>{subtitle}</div>}
        </div>
        <div style={{fontSize:10,color:C.text3,transition:"transform 0.25s",transform:open?"rotate(180deg)":"none",flexShrink:0}}>▼</div>
      </button>
      {open&&<div style={{padding:"0 14px 14px",borderTop:`1px solid ${accentColor+"22"}`}}>{children}</div>}
    </div>
  );
}

// ── TESTOSTERONE SECRETS DATA ─────────────────────────────────────────────────
const T_SECRETS = [
  {
    num:"#1", emoji:"🫁", title:"The Breath Hold",
    hook:"Right after waking. Takes 90 seconds.",
    steps:["Deep inhale → hold for 30 seconds","Mild hypoxia causes stress hormones to spike","LH (luteinising hormone) activates — the main switch for testosterone"],
    fact:"Climbers living in low-oxygen environments have 60% higher testosterone than sea-level counterparts.",
    science:"Hypoxia triggers HIF-1α → stimulates Leydig cells → testosterone surge.",
    color:"#5AC8FA",
  },
  {
    num:"#2", emoji:"🧊", title:"Targeted Cold Exposure",
    hook:"Not a full cold shower. Directly on the scrotum for 60 seconds.",
    steps:["Run cold water directly on the scrotal area for 60 seconds","The sharp blood rush causes a vasodilatory rebound","Testicular temperature drops → T rises up to 3×"],
    fact:"Norwegian research: targeted scrotal cooling works ~4× better than full-body cold immersion for testosterone response.",
    science:"Sperm and testosterone production both require ~34–35°C (2°C below body temperature). Warming → then rapid cooling creates a powerful thermal stress response.",
    color:"#64D2FF",
  },
  {
    num:"#3", emoji:"💪", title:"20 Push-Ups with Static Pause",
    hook:"This isn't fitness — it's biochemistry.",
    steps:["Do a push-up and hold the bottom position for 3 seconds","Complete 20 reps with the pause each time","The isometric tension at the bottom is the key — not the rep count"],
    fact:"Isometric holds spike growth hormone and testosterone within minutes. Skip the pause = skip the hormonal effect.",
    science:"Isometric muscle contractions at 70–80% of max effort trigger acute GH and testosterone release via hypothalamic signalling.",
    color:"#30D158",
  },
  {
    num:"#4", emoji:"🪞", title:"The Alpha Face",
    hook:"30 seconds in the mirror. Sounds strange — the neuroscience is real.",
    steps:["Stand in front of a mirror for 30 seconds","Tight jaw, direct eye contact, slight frown — hold it","Your brain interprets your own facial expression as environmental dominance"],
    fact:"Actors use this before intense scenes. Research on 'power posing' shows cortisol drops and testosterone rises within 2 minutes of adopting dominant postures and expressions.",
    science:"The brain's mirror neuron system and the hypothalamic-pituitary-adrenal axis respond to proprioceptive feedback — your own face signals status to your own brain.",
    color:"#BF5AF2",
  },
];

// ── DISCLAIMER ────────────────────────────────────────────────────────────────
function Disclaimer(){
  return(
    <p style={{fontSize:9.5,color:C.text3,lineHeight:1.6,margin:"18px 0 4px",textAlign:"center",padding:"0 8px"}}>
      ⚠️ <strong style={{color:C.text3}}>Guidance only, not professional medical advice.</strong> This plan is for general wellness education. Always consult a qualified doctor or registered dietitian before making dietary changes, starting supplements, or if you have any medical condition or are on medication.
    </p>
  );
}

// ── HOME SCREEN ───────────────────────────────────────────────────────────────
function HomeScreen({profile,setProfile,onView}){
  const ages=[{id:"25-30",label:"25–30",icon:"🌱",sub:"Young Adult"},{id:"30-35",label:"30–35",icon:"⚡",sub:"Prime Years"},{id:"35-40",label:"35–40",icon:"🎯",sub:"Mid Thirties"},{id:"40+",label:"40+",icon:"🏆",sub:"Mature Adult"}];
  const diets=[{id:"Vegetarian",label:"Vegetarian",icon:"🥗",sub:"Plant-based"},{id:"Non-Vegetarian",label:"Non-Vegetarian",icon:"🍗",sub:"Includes meat"},{id:"Vegan",label:"Vegan",icon:"🌿",sub:"No animal products"}];
  const styles=[{id:"Both",label:"Both",icon:"☯️",sub:"Best of both"},{id:"Modern",label:"Modern",icon:"🔬",sub:"Evidence-based"},{id:"Ayurvedic",label:"Ayurvedic",icon:"🪷",sub:"Ancient wisdom"}];
  const goals = profile.gender==="Female" ? GOALS_FEMALE : GOALS_MALE;

  const toggleGoal=id=>{
    setProfile(p=>{
      const has=p.goals.includes(id);
      return {...p,goals:has?p.goals.filter(g=>g!==id):[...p.goals,id]};
    });
  };
  const setGender=g=>{
    // Reset goals when gender changes to avoid stale goal (e.g. Male Fertility on Female)
    setProfile(p=>({...p,gender:g,goals:[]}));
  };

  const ready=profile.gender&&profile.age&&profile.region&&profile.diet&&profile.style&&profile.goals.length>0;
  const genderColor=profile.gender==="Female"?C.rose:profile.gender==="Male"?C.blue:C.text3;

  return(
    <div style={{paddingBottom:90}}>
      {/* Hero */}
      <div style={{background:`linear-gradient(160deg,#080D1A 0%,${C.surface} 100%)`,padding:"54px 18px 22px",borderBottom:`1px solid ${C.border}`}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:6,background:C.green+"18",border:`1px solid ${C.green}44`,borderRadius:20,padding:"4px 11px",marginBottom:13}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:C.green,display:"block"}}/>
          <span style={{fontSize:10,fontWeight:700,letterSpacing:1.3,color:C.green}}>WELLNESS ADVISOR</span>
        </div>
        <h1 style={{fontSize:27,fontWeight:800,lineHeight:1.2,margin:"0 0 8px",fontFamily:"system-ui"}}>
          Personalised<br/>
          <span style={{background:`linear-gradient(90deg,${C.green},${C.teal})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Health Reset Plan</span>
        </h1>
        <p style={{fontSize:12,color:C.text2,margin:0,lineHeight:1.6}}>Your gender, goals & lifestyle — one personalised Indian wellness plan.</p>
      </div>

      <div style={{padding:"18px 15px",display:"flex",flexDirection:"column",gap:20}}>

        {/* ── GENDER (FIRST) ── */}
        <div>
          <SecLabel label="I am a…" color={genderColor}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <GenderPill g="Male"   selected={profile.gender} onSelect={setGender}/>
            <GenderPill g="Female" selected={profile.gender} onSelect={setGender}/>
          </div>
        </div>

        {/* ── AGE ── */}
        <div>
          <SecLabel label="Age Range" color={C.orange}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
            {ages.map(a=><SingleChip key={a.id} item={a} selected={profile.age} onSelect={v=>setProfile(p=>({...p,age:v}))} color={C.orange}/>)}
          </div>
        </div>

        {/* ── ETHNICITY + REGION ── */}
        <div>
          <SecLabel label="Ethnicity & Region" color={C.teal}/>
          {/* Fixed Indian pill */}
          <div style={{background:C.card,borderRadius:13,border:`1.5px solid ${C.teal}`,padding:"10px 13px",display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <span style={{fontSize:18}}>🇮🇳</span>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:700,color:C.teal}}>Indian</div>
              <div style={{fontSize:10,color:C.text3}}>Select your regional cuisine below</div>
            </div>
            <div style={{width:15,height:15,borderRadius:"50%",background:C.teal,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"#000"}}>✓</div>
          </div>
          {/* Region sub-selector */}
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {REGIONS.map(r=>{
              const on=profile.region===r.id;
              return(
                <button key={r.id} onClick={()=>setProfile(p=>({...p,region:r.id}))} style={{
                  display:"flex",alignItems:"center",gap:11,padding:"10px 13px",
                  borderRadius:13,border:`1.5px solid ${on?C.teal:C.border}`,
                  background:on?C.teal+"18":C.surface,cursor:"pointer",
                  boxShadow:on?`0 0 12px ${C.teal}33`:"none",
                  transform:on?"scale(1.01)":"scale(1)",transition:"all 0.15s",
                }}>
                  <span style={{fontSize:20}}>{r.icon}</span>
                  <div style={{flex:1,textAlign:"left"}}>
                    <div style={{fontSize:12,fontWeight:700,color:on?C.teal:C.text1}}>{r.id}</div>
                    <div style={{fontSize:10,color:C.text3}}>{r.sub}</div>
                  </div>
                  {on&&<div style={{width:15,height:15,borderRadius:"50%",background:C.teal,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"#000",flexShrink:0}}>✓</div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── DIET ── */}
        <div>
          <SecLabel label="Diet Preference" color={C.green}/>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {diets.map(d=><SingleChip key={d.id} item={d} selected={profile.diet} onSelect={v=>setProfile(p=>({...p,diet:v}))} color={C.green}/>)}
          </div>
        </div>

        {/* ── STYLE ── */}
        <div>
          <SecLabel label="Wellness Approach" color={C.purple}/>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {styles.map(s=><SingleChip key={s.id} item={s} selected={profile.style} onSelect={v=>setProfile(p=>({...p,style:v}))} color={C.purple}/>)}
          </div>
        </div>

        {/* ── GOALS (MULTI-SELECT, GENDER-AWARE) ── */}
        <div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:9}}>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <div style={{width:3,height:14,borderRadius:2,background:C.pink}}/>
              <span style={{fontSize:11,fontWeight:700,letterSpacing:1.3,textTransform:"uppercase",color:C.text2}}>Health Goals</span>
            </div>
            <span style={{fontSize:10,color:C.text3}}>Select one or more</span>
          </div>
          {!profile.gender?(
            <div style={{background:C.card,borderRadius:13,border:`1px dashed ${C.border}`,padding:"16px",textAlign:"center"}}>
              <div style={{fontSize:20,marginBottom:6}}>👆</div>
              <div style={{fontSize:12,color:C.text3}}>Select your gender above to see personalised goals</div>
            </div>
          ):(
            <>
              <div style={{display:"grid",gridTemplateColumns:`repeat(${profile.gender==="Female"?3:5},1fr)`,gap:6}}>
                {goals.map(g=><GoalChip key={g.id} item={g} selected={profile.goals} onToggle={toggleGoal}/>)}
              </div>
              {profile.goals.length>0&&(
                <div style={{marginTop:8,display:"flex",flexWrap:"wrap",gap:5}}>
                  {profile.goals.map(g=>(
                    <span key={g} style={{fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:20,background:goalColor(g)+"20",color:goalColor(g),border:`1px solid ${goalColor(g)}40`}}>
                      {goalIcon(g)} {g}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── CTA ── */}
        <button onClick={onView} disabled={!ready} style={{
          width:"100%",padding:"15px",borderRadius:15,border:"none",
          background:ready?`linear-gradient(135deg,${C.green},#28A745)`:C.card,
          color:ready?"#000":C.text3,fontSize:15,fontWeight:800,
          cursor:ready?"pointer":"not-allowed",transition:"all 0.2s",
          boxShadow:ready?`0 8px 20px ${C.green}44`:"none",
        }}>
          {ready?"✨  View My Personalised Plan →":"Complete your profile above ↑"}
        </button>

        {!ready&&(
          <div style={{display:"flex",justifyContent:"center",gap:5,flexWrap:"wrap"}}>
            {[{l:"Gender",v:!!profile.gender},{l:"Age",v:!!profile.age},{l:"Region",v:!!profile.region},{l:"Diet",v:!!profile.diet},{l:"Style",v:!!profile.style},{l:"Goals",v:profile.goals.length>0}].map(s=>(
              <span key={s.l} style={{fontSize:10,padding:"3px 9px",borderRadius:20,background:s.v?C.green+"20":C.card,color:s.v?C.green:C.text3,border:`1px solid ${s.v?C.green+"44":C.border}`,fontWeight:700}}>
                {s.v?"✓ ":""}{s.l}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── RESULT SCREEN ─────────────────────────────────────────────────────────────
function ResultScreen({profile,onBack,onReset}){
  const [tab,setTab]=useState("plan");
  const plan=buildPlan(profile);
  const tabs=[{id:"plan",l:"📅 Plan"},{id:"remedies",l:"🌿 Remedies"},{id:"foods",l:"🥗 Foods"},{id:"tips",l:"💡 Tips"}];
  const genderColor=profile.gender==="Female"?C.rose:C.blue;
  const genderIcon=profile.gender==="Female"?"♀":"♂";
  const todayIdx=getTodayIdx();
  const todayName=DAYS[todayIdx];

  const remediesByGoal={};
  plan.allRemedies.forEach(r=>{ if(!remediesByGoal[r.goal]) remediesByGoal[r.goal]=[]; remediesByGoal[r.goal].push(r); });
  const tipsByGoal={};
  plan.allTips.forEach(t=>{ if(!tipsByGoal[t.goal]) tipsByGoal[t.goal]=[]; tipsByGoal[t.goal].push(t); });

  return(
    <div style={{paddingBottom:80}}>
      {/* Header */}
      <div style={{background:C.surface,padding:"48px 15px 13px",borderBottom:`1px solid ${C.border}`,position:"sticky",top:0,zIndex:50}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
          <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",color:C.green,fontSize:12,fontWeight:700,padding:0,display:"flex",alignItems:"center",gap:4}}>← Edit Profile</button>
          <button onClick={onReset} style={{background:C.red+"18",border:`1px solid ${C.red}33`,borderRadius:20,cursor:"pointer",color:C.red,fontSize:11,fontWeight:700,padding:"4px 11px"}}>🗑 Reset</button>
        </div>
        <div style={{fontSize:18,fontWeight:800,marginBottom:3}}>Your Wellness Plan ✨</div>
        <div style={{fontSize:10,color:C.teal,fontWeight:600,marginBottom:6}}>📅 Today is {todayName} — plan scrolled to your day</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
          <span style={{fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:20,background:genderColor+"20",color:genderColor,border:`1px solid ${genderColor}40`}}>{genderIcon} {profile.gender}</span>
          {[{v:profile.age,c:C.orange},{v:"Indian",c:C.teal},{v:profile.region,c:C.cyan},{v:profile.diet,c:C.green},{v:profile.style,c:C.purple}].map((p,i)=>(
            <span key={i} style={{fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:20,background:p.c+"20",color:p.c,border:`1px solid ${p.c}40`}}>{p.v}</span>
          ))}
          {profile.goals.map(g=>(
            <span key={g} style={{fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:20,background:goalColor(g)+"20",color:goalColor(g),border:`1px solid ${goalColor(g)}40`}}>{goalIcon(g)} {g}</span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:5,padding:"9px 13px",background:C.bg,position:"sticky",top:155,zIndex:40,overflowX:"auto"}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            background:tab===t.id?C.green:C.card,color:tab===t.id?"#000":C.text2,
            border:"none",borderRadius:20,padding:"6px 13px",fontSize:11,fontWeight:700,
            cursor:"pointer",whiteSpace:"nowrap",transition:"all 0.15s",flexShrink:0,
          }}>{t.l}</button>
        ))}
      </div>

      <div style={{padding:"9px 13px"}}>

        {/* ── PLAN ── */}
        {tab==="plan"&&(
          <div>
            {/* ── Age / Gender note ── */}
            <CollapsibleSection
              title={`${profile.gender} · ${profile.age} · Age Note`}
              subtitle="How your age & gender shape this plan"
              icon={genderIcon} accentColor={genderColor} defaultOpen={true}
            >
              <p style={{fontSize:12,color:C.text2,lineHeight:1.7,margin:"10px 0 0"}}>{AGE_NOTES[profile.gender]?.[profile.age]}</p>
            </CollapsibleSection>

            {/* ── Goal descriptions ── */}
            <CollapsibleSection
              title="Your Selected Goals"
              subtitle={`${profile.goals.length} goal${profile.goals.length>1?"s":""} · tap each day for how they're addressed`}
              icon="🎯" accentColor={C.pink} defaultOpen={true}
            >
              <div style={{display:"flex",flexDirection:"column",gap:7,marginTop:10}}>
                {profile.goals.map(g=>{
                  const gd=GOAL_DATA[g]; if(!gd) return null;
                  const descText=gd.desc?.[profile.gender]||gd.desc?.Male||"";
                  return(
                    <div key={g} style={{background:gd.color+"10",borderRadius:11,padding:"11px 13px",border:`1px solid ${gd.color}33`,display:"flex",gap:10,alignItems:"flex-start"}}>
                      <span style={{fontSize:20}}>{gd.icon}</span>
                      <div>
                        <div style={{fontSize:12,fontWeight:700,color:gd.color,marginBottom:2}}>{g}</div>
                        <div style={{fontSize:11,color:C.text2,lineHeight:1.5}}>{descText}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CollapsibleSection>

            {/* ── Daily Morning Ritual ── */}
            <CollapsibleSection
              title="Daily Morning Ritual"
              subtitle="Do these every single morning for results"
              icon="🌅" accentColor={C.yellow} defaultOpen={true}
            >
              <div style={{marginTop:10}}>
                {MORNING_BASE.map((s,i)=>(
                  <div key={i} style={{display:"flex",gap:8,marginBottom:7,alignItems:"flex-start"}}>
                    <div style={{width:17,height:17,borderRadius:"50%",background:C.orange,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:800,color:"#000",flexShrink:0,marginTop:1}}>{i+1}</div>
                    <span style={{fontSize:11,color:C.text2,lineHeight:1.6}}>{s}</span>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* ── Gender-specific additions ── */}
            <CollapsibleSection
              title={`${profile.gender}-Specific Additions`}
              subtitle={`Tailored for ${profile.gender.toLowerCase()} physiology`}
              icon={genderIcon} accentColor={genderColor} defaultOpen={true}
              badge={profile.gender}
            >
              <div style={{marginTop:10}}>
                {MORNING_GENDER[profile.gender]?.map((s,i)=>(
                  <div key={i} style={{display:"flex",gap:8,marginBottom:7,alignItems:"flex-start"}}>
                    <span style={{width:7,height:7,borderRadius:"50%",background:genderColor,display:"block",flexShrink:0,marginTop:4}}/>
                    <span style={{fontSize:11,color:C.text2,lineHeight:1.6}}>{s}</span>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* ── Goal-specific morning additions ── */}
            {plan.morningAdds.length>0&&(
              <CollapsibleSection
                title="Goal-Specific Morning Additions"
                subtitle="Extra steps based on your goals"
                icon="✦" accentColor={C.pink} defaultOpen={true}
              >
                <div style={{marginTop:10}}>
                  {plan.morningAdds.map((a,i)=>(
                    <div key={i} style={{display:"flex",gap:8,marginBottom:7,alignItems:"flex-start"}}>
                      <span style={{width:7,height:7,borderRadius:"50%",background:goalColor(a.goal),display:"block",flexShrink:0,marginTop:4}}/>
                      <div>
                        <span style={{fontSize:9,fontWeight:700,color:goalColor(a.goal),marginRight:5}}>{goalIcon(a.goal)} {a.goal}</span>
                        <span style={{fontSize:11,color:C.text2,lineHeight:1.6}}>{a.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* ── TESTOSTERONE SECRETS (Male + Fertility only) ── */}
            {profile.gender==="Male" && profile.goals.includes("Fertility") && (
              <CollapsibleSection
                title="Testosterone Secrets"
                subtitle="4 biohacks most men never hear about"
                icon="⚡" accentColor="#FFD60A" defaultOpen={false}
                badge="EXCLUSIVE"
              >
                <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:12}}>
                  {T_SECRETS.map((s,i)=>(
                    <div key={i} style={{
                      background:`linear-gradient(135deg,${s.color}14,${s.color}06)`,
                      borderRadius:13,padding:"14px 15px",
                      border:`1px solid ${s.color}44`,
                      borderLeft:`3px solid ${s.color}`,
                    }}>
                      {/* Header */}
                      <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:9}}>
                        <span style={{fontSize:26}}>{s.emoji}</span>
                        <div>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <span style={{fontSize:9,fontWeight:800,padding:"2px 7px",borderRadius:20,background:s.color,color:"#000"}}>SECRET {s.num}</span>
                          </div>
                          <div style={{fontSize:14,fontWeight:800,color:s.color,marginTop:3}}>{s.title}</div>
                        </div>
                      </div>
                      {/* Hook */}
                      <p style={{fontSize:12,fontWeight:600,color:C.text1,margin:"0 0 10px",lineHeight:1.5,fontStyle:"italic"}}>"{s.hook}"</p>
                      {/* Steps */}
                      <div style={{marginBottom:10}}>
                        {s.steps.map((step,j)=>(
                          <div key={j} style={{display:"flex",gap:8,marginBottom:5,alignItems:"flex-start"}}>
                            <div style={{width:16,height:16,borderRadius:"50%",background:s.color+"30",border:`1px solid ${s.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:800,color:s.color,flexShrink:0,marginTop:1}}>{j+1}</div>
                            <span style={{fontSize:11,color:C.text2,lineHeight:1.5}}>{step}</span>
                          </div>
                        ))}
                      </div>
                      {/* Fact */}
                      <div style={{background:"rgba(255,255,255,0.05)",borderRadius:9,padding:"9px 11px",marginBottom:8,border:`1px solid ${s.color}22`}}>
                        <div style={{fontSize:9,fontWeight:800,color:s.color,letterSpacing:.8,marginBottom:3}}>📊 THE FACT</div>
                        <p style={{fontSize:11,color:C.text1,margin:0,lineHeight:1.6}}>{s.fact}</p>
                      </div>
                      {/* Science */}
                      <div style={{display:"flex",gap:6,alignItems:"flex-start"}}>
                        <span style={{fontSize:13,flexShrink:0}}>🔬</span>
                        <p style={{fontSize:10,color:C.text3,margin:0,lineHeight:1.6,fontStyle:"italic"}}>{s.science}</p>
                      </div>
                    </div>
                  ))}
                  <p style={{fontSize:9.5,color:C.text3,textAlign:"center",lineHeight:1.6,margin:"4px 0 0"}}>
                    ⚠️ These are biohacking observations, not clinical prescriptions. Consult a doctor before making physiological changes.
                  </p>
                </div>
              </CollapsibleSection>
            )}

            {DAYS.map((day,i)=>(
              <DayCard key={day} day={day} idx={i} meal={plan.meals[i]} goals={profile.goals} todayIdx={todayIdx} diet={profile.diet}/>
            ))}
            <Disclaimer/>
          </div>
        )}

        {/* ── REMEDIES ── */}
        {tab==="remedies"&&(
          <div>
            <div style={{background:genderColor+"10",borderRadius:12,padding:"11px 13px",border:`1px solid ${genderColor}33`,marginBottom:12,display:"flex",gap:9,alignItems:"center"}}>
              <span style={{fontSize:24}}>{genderIcon}</span>
              <div>
                <div style={{fontSize:11,fontWeight:700,color:genderColor}}>Gender-Specific Remedies · {profile.style} Approach</div>
                <div style={{fontSize:11,color:C.text2}}>{profile.goals.map(g=>goalIcon(g)+" "+g).join(" · ")}</div>
              </div>
            </div>
            {Object.entries(remediesByGoal).map(([goal,rems])=>(
              <div key={goal} style={{marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8,padding:"7px 12px",background:goalColor(goal)+"14",borderRadius:10,border:`1px solid ${goalColor(goal)}33`}}>
                  <span style={{fontSize:16}}>{goalIcon(goal)}</span>
                  <span style={{fontSize:12,fontWeight:700,color:goalColor(goal)}}>{goal}</span>
                  <span style={{fontSize:10,color:C.text3,marginLeft:"auto"}}>{genderIcon} {profile.gender}-specific</span>
                </div>
                {rems.map((r,i)=>(
                  <div key={i} style={{background:C.card,borderRadius:12,padding:"13px 14px",marginBottom:8,border:`1px solid ${C.border}`,borderLeft:`3px solid ${goalColor(goal)}`}}>
                    <div style={{display:"flex",gap:9,alignItems:"center",marginBottom:7}}>
                      <span style={{fontSize:20}}>{r.icon}</span>
                      <div>
                        <div style={{fontSize:13,fontWeight:700}}>{r.name}</div>
                        <div style={{display:"flex",flexWrap:"wrap",gap:3,marginTop:2}}>
                          {r.tags.map(tag=>(
                            <span key={tag} style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:10,background:goalColor(goal)+"20",color:goalColor(goal)}}>{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p style={{fontSize:12,color:C.text2,lineHeight:1.6,margin:0}}>{r.desc}</p>
                  </div>
                ))}
              </div>
            ))}
            <Disclaimer/>
          </div>
        )}

        {/* ── FOODS ── */}
        {tab==="foods"&&(
          <div>
            <div style={{background:genderColor+"10",borderRadius:12,padding:"11px 13px",border:`1px solid ${genderColor}33`,marginBottom:10,display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontSize:18}}>{genderIcon}</span>
              <div style={{fontSize:11,color:C.text2}}>{profile.gender}-specific foods based on your selected goals</div>
            </div>
            <div style={{background:C.card,borderRadius:12,padding:"13px 14px",border:`1px solid ${C.green}33`,marginBottom:10}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:.8,color:C.green,marginBottom:9}}>✅ FOODS TO INCLUDE</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                {plan.foodsToEat.map((f,i)=>(
                  <span key={i} style={{background:C.green+"18",color:C.green,fontSize:11,padding:"4px 10px",borderRadius:20,border:`1px solid ${C.green}33`}}>{f}</span>
                ))}
              </div>
            </div>
            <div style={{background:C.card,borderRadius:12,padding:"13px 14px",border:`1px solid ${C.red}33`}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:.8,color:C.red,marginBottom:9}}>🚫 FOODS TO AVOID</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                {plan.foodsToAvoid.map((f,i)=>(
                  <span key={i} style={{background:C.red+"18",color:C.red,fontSize:11,padding:"4px 10px",borderRadius:20,border:`1px solid ${C.red}33`}}>{f}</span>
                ))}
              </div>
            </div>
            <Disclaimer/>
          </div>
        )}

        {/* ── TIPS ── */}
        {tab==="tips"&&(
          <div>
            {Object.entries(tipsByGoal).map(([goal,tips])=>(
              <div key={goal} style={{marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8,padding:"7px 12px",background:goalColor(goal)+"14",borderRadius:10,border:`1px solid ${goalColor(goal)}33`}}>
                  <span style={{fontSize:16}}>{goalIcon(goal)}</span>
                  <span style={{fontSize:12,fontWeight:700,color:goalColor(goal)}}>{goal}</span>
                  <span style={{fontSize:10,color:C.text3,marginLeft:"auto"}}>{genderIcon} {profile.gender}</span>
                </div>
                {tips.map((t,i)=>(
                  <div key={i} style={{background:C.card,borderRadius:12,padding:"12px 13px",border:`1px solid ${C.border}`,display:"flex",gap:10,alignItems:"flex-start",marginBottom:7}}>
                    <span style={{fontSize:20}}>{t.icon}</span>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,marginBottom:3}}>{t.t}</div>
                      <div style={{fontSize:11,color:C.text2,lineHeight:1.6}}>{t.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <Disclaimer/>
          </div>
        )}
      </div>
    </div>
  );
}

// ── AFFIRMATIONS DATA ─────────────────────────────────────────────────────────
const AFFIRMATIONS = [
  { text:"You are in charge!",              sub:"Every choice you make today is a vote for the healthier you.",       emoji:"👑", color:C.yellow  },
  { text:"Glad you're taking care of yourself.", sub:"Self-care isn't selfish — it's the smartest thing you can do.", emoji:"🌟", color:C.green  },
  { text:"Small steps. Big results.",       sub:"Consistency beats perfection every single time.",                    emoji:"🚀", color:C.teal   },
  { text:"Your body is listening.",         sub:"Every meal, every step, every breath — it all counts.",             emoji:"🫀", color:C.rose   },
  { text:"Progress, not perfection.",       sub:"You showed up today. That's already a win.",                        emoji:"✨", color:C.purple },
  { text:"You're stronger than you think.", sub:"The fact that you're here proves it.",                               emoji:"💪", color:C.orange },
  { text:"Healing is happening.",           sub:"Trust the process. The body knows how to heal.",                    emoji:"🌱", color:C.green  },
  { text:"Today is a fresh start.",         sub:"Yesterday doesn't define your wellness journey — today does.",      emoji:"🌅", color:C.yellow },
  { text:"Fuel your greatness.",            sub:"What you eat today is building the you of tomorrow.",               emoji:"⚡", color:C.teal   },
  { text:"You deserve to feel amazing.",    sub:"Not someday — starting right now, one good choice at a time.",      emoji:"🌸", color:C.rose   },
  { text:"Your health is your wealth.",     sub:"No investment pays better dividends than the one in your body.",    emoji:"💎", color:C.cyan   },
  { text:"Be patient with yourself.",       sub:"Real change takes time. You're doing better than you know.",        emoji:"🕊️", color:C.purple },
  { text:"One day at a time.",              sub:"You don't have to change everything today. Just today.",             emoji:"🗓️", color:C.orange },
  { text:"Mind. Body. Spirit — aligned.",   sub:"Wellness is a whole-person journey. Keep going.",                   emoji:"🧘", color:C.green  },
  { text:"You showed up. That matters.",    sub:"Opening this app is the first rep of your day.",                    emoji:"🏆", color:C.yellow },
];

// ── SPLASH SCREEN ─────────────────────────────────────────────────────────────
function SplashScreen({ onDone, isReturning }) {
  const [phase, setPhase] = useState("in"); // in | hold | out
  const aff = useRef(AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]).current;
  const timeOfDay = (() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  })();

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 300);
    const t2 = setTimeout(() => setPhase("out"),  2800);
    const t3 = setTimeout(() => onDone(),          3400);
    return () => [t1,t2,t3].forEach(clearTimeout);
  }, []);

  const opacity = phase === "in" ? 0 : phase === "hold" ? 1 : 0;
  const ty      = phase === "in" ? 28 : phase === "hold" ? 0 : -20;

  return (
    <div style={{
      minHeight:"100vh", background:C.bg,
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      padding:32, textAlign:"center",
      transition:"background 0.6s",
    }}>
      <style>{`
        @keyframes pulse-aff { 0%,100%{transform:scale(1)} 50%{transform:scale(1.12)} }
        @keyframes shimmer { 0%{opacity:.5} 100%{opacity:1} }
      `}</style>

      {/* Glow ring */}
      <div style={{
        position:"relative", width:110, height:110, marginBottom:28,
        opacity, transform:`translateY(${ty}px)`,
        transition:"opacity 0.55s ease, transform 0.55s ease",
      }}>
        <div style={{
          position:"absolute", inset:-10, borderRadius:"50%",
          background:`radial-gradient(circle, ${aff.color}33 0%, transparent 70%)`,
          animation:"pulse-aff 2.2s ease-in-out infinite",
        }}/>
        <div style={{
          width:110, height:110, borderRadius:"50%",
          background:`linear-gradient(135deg, ${aff.color}22, ${aff.color}08)`,
          border:`2px solid ${aff.color}55`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:50,
        }}>
          {aff.emoji}
        </div>
      </div>

      {/* Greeting */}
      <div style={{
        fontSize:12, fontWeight:600, letterSpacing:1.5, textTransform:"uppercase",
        color:aff.color, marginBottom:12,
        opacity, transform:`translateY(${ty}px)`,
        transition:"opacity 0.55s ease 0.05s, transform 0.55s ease 0.05s",
      }}>
        {timeOfDay} {isReturning ? "— Welcome back 👋" : ""}
      </div>

      {/* Main affirmation */}
      <h1 style={{
        fontSize:28, fontWeight:800, lineHeight:1.25, margin:"0 0 14px",
        fontFamily:"system-ui",
        background:`linear-gradient(135deg, ${aff.color}, ${aff.color}BB)`,
        WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
        opacity, transform:`translateY(${ty}px)`,
        transition:"opacity 0.55s ease 0.1s, transform 0.55s ease 0.1s",
      }}>
        {aff.text}
      </h1>

      {/* Sub-text */}
      <p style={{
        fontSize:14, color:C.text2, lineHeight:1.7, maxWidth:280, margin:"0 0 32px",
        opacity, transform:`translateY(${ty}px)`,
        transition:"opacity 0.55s ease 0.15s, transform 0.55s ease 0.15s",
      }}>
        {aff.sub}
      </p>

      {/* App name */}
      <div style={{
        display:"flex", alignItems:"center", gap:8,
        opacity, transform:`translateY(${ty}px)`,
        transition:"opacity 0.55s ease 0.2s, transform 0.55s ease 0.2s",
      }}>
        <div style={{width:28,height:28,borderRadius:8,background:`linear-gradient(135deg,${C.green},${C.teal})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🪷</div>
        <div style={{textAlign:"left"}}>
          <div style={{fontSize:12,fontWeight:800,color:C.text1}}>Wellness Advisor</div>
          <div style={{fontSize:10,color:C.text3}}>Indian Health Reset · AI-Powered</div>
        </div>
      </div>

      {/* Progress dots */}
      <div style={{
        position:"absolute", bottom:44,
        display:"flex", gap:6,
        opacity, transition:"opacity 0.4s",
      }}>
        {[0,1,2].map(i=>(
          <div key={i} style={{
            width: i===1 ? 20 : 6,
            height:6, borderRadius:3,
            background: i===1 ? aff.color : aff.color+"44",
            transition:"all 0.4s",
          }}/>
        ))}
      </div>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
const EMPTY_PROFILE = {gender:"",age:"",ethnicity:"Indian",diet:"",style:"",goals:[],region:""};

export default function App(){
  const [profile,setProfile]   = useState(EMPTY_PROFILE);
  const [screen,setScreen]     = useState("splash"); // splash | loading | home | result
  const [isReturning,setIsReturning] = useState(false);

  // After splash, load cache
  const afterSplash = () => {
    setScreen("loading");
    loadProfile().then(saved=>{
      if(saved && saved.gender && saved.age && saved.diet && saved.style && saved.goals?.length){
        setProfile(saved);
        setIsReturning(true);
        setScreen("result");
      } else {
        setScreen("home");
      }
    });
  };

  const handleView = async () => { await saveProfile(profile); setScreen("result"); };
  const handleBack = () => setScreen("home");
  const handleReset = async () => { await clearProfile(); setProfile(EMPTY_PROFILE); setScreen("home"); };

  if(screen==="splash")  return <SplashScreen onDone={afterSplash} isReturning={isReturning}/>;
  if(screen==="loading") return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:14}}>
      <div style={{fontSize:36,animation:"spin0 1s linear infinite"}}>🪷</div>
      <div style={{fontSize:13,color:C.text2}}>Loading your plan…</div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.text1,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif"}}>
      <style>{`*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}::-webkit-scrollbar{display:none}`}</style>
      <div style={{maxWidth:430,margin:"0 auto"}}>
        {screen==="home"
          ?<HomeScreen profile={profile} setProfile={setProfile} onView={handleView}/>
          :<ResultScreen profile={profile} onBack={handleBack} onReset={handleReset}/>
        }
      </div>
    </div>
  );
}

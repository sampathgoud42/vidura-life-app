// Per-goal data (gender-split remedies × Both/Modern/Ayurvedic, morning
// additions, foods, tips) — ported from the user's Claude wellness artifact.
import { C } from './wellnessPalette.js';

export const GOAL_DATA = {
  Cholesterol: {
    color: C.orange, icon: '🫀',
    desc: {
      Male: "Lower LDL, raise HDL, cut triglycerides. Men's risk rises sharply after 35.",
      Female: 'Post-35 oestrogen decline raises LDL rapidly. Address it before menopause compounds it.',
    },
    morningAdd: {
      Male: ['🧄 1–2 raw garlic cloves in warm water — allicin blocks cholesterol synthesis', '🌰 1 tbsp ground flaxseed in water — ALA omega-3 reduces LDL', '🍃 5 almonds + 2 walnuts — phytosterols block gut cholesterol absorption'],
      Female: ['🍃 5 almonds + 2 walnuts — phytosterols block cholesterol absorption', '🌱 1 tbsp flaxseeds (soaked) — phytoestrogens + omega-3 double benefit for women', '🍃 Amla water — Vitamin C raises HDL, lowers LDL oxidation'],
    },
    remedies: {
      Both: {
        Male: [
          { icon: '🧄', name: 'Raw Garlic Daily', desc: '1–2 cloves crushed in warm water on empty stomach. Allicin lowers LDL by 10–15% and improves blood pressure in men.', tags: ['LDL ↓', 'BP ↓'] },
          { icon: '🌰', name: 'Flaxseed Powder', desc: '1 tbsp in roti dough or curd. ALA omega-3 + lignans reduce LDL. Especially effective in men with high triglycerides.', tags: ['LDL ↓', 'TG ↓'] },
          { icon: '🫐', name: 'Pomegranate Daily', desc: '½ pomegranate seeds. Punicalagins prevent LDL oxidation — the key step in male arterial plaque formation.', tags: ['LDL Oxidation ↓'] },
          { icon: '🌸', name: 'Arjuna Bark Decoction', desc: "1 tsp arjuna powder boiled in water, twice daily. Ayurveda's premier cardiac tonic — clinically reduces total cholesterol in men.", tags: ['LDL ↓', 'Heart ↑'] },
          { icon: '🥣', name: 'Oats + Isabgol', desc: 'Daily oats + 1 tsp psyllium before dinner. Beta-glucan + soluble fibre bind bile acids, forcing liver to use cholesterol.', tags: ['LDL ↓'] },
        ],
        Female: [
          { icon: '🌱', name: 'Flaxseeds (Phytoestrogen)', desc: '1 tbsp soaked flaxseeds daily. Lignans act as phytoestrogens AND reduce LDL — double benefit for women over 35.', tags: ['LDL ↓', 'Hormones ↑'] },
          { icon: '🍃', name: 'Amla + Arjuna Kadha', desc: 'Amla juice + arjuna decoction each morning. Synergistic — amla raises HDL while arjuna reduces total cholesterol.', tags: ['HDL ↑', 'LDL ↓'] },
          { icon: '🫐', name: 'Pomegranate Daily', desc: "½ pomegranate seeds. Post-menopausal women show highest benefit from pomegranate's anti-LDL oxidation effects.", tags: ['LDL Oxidation ↓'] },
          { icon: '🥣', name: 'Psyllium Husk (Isabgol)', desc: '1 tsp before dinner. Most evidence-backed soluble fibre for cholesterol reduction in women.', tags: ['LDL ↓'] },
          { icon: '🌰', name: 'Walnuts Daily', desc: '4–6 walnuts per day. ALA omega-3 raises HDL — especially important for women post-35 as oestrogen declines.', tags: ['HDL ↑', 'LDL ↓'] },
        ],
      },
      Modern: {
        Male: [
          { icon: '🥣', name: 'Psyllium Husk', desc: '1 tsp in water before dinner. Binds bile acids, forcing cholesterol usage.', tags: ['LDL ↓'] },
          { icon: '🐟', name: 'Omega-3 Sources', desc: 'Walnuts + chia + flaxseeds daily. Raises HDL and cuts VLDL triglycerides.', tags: ['HDL ↑', 'TG ↓'] },
          { icon: '🍎', name: 'Apple Cider Vinegar', desc: '1 tbsp diluted before meals. Reduces total cholesterol and triglycerides.', tags: ['TG ↓'] },
          { icon: '🫐', name: 'Polyphenol Foods', desc: 'Pomegranate + amla + green tea. Prevent LDL oxidation — key to artery health.', tags: ['LDL Oxidation ↓'] },
          { icon: '⏱️', name: 'Intermittent Fasting', desc: '12-hr overnight fast. Reduces fasting LDL and triglycerides in 4–6 weeks.', tags: ['LDL ↓', 'TG ↓'] },
        ],
        Female: [
          { icon: '🥣', name: 'Psyllium Husk', desc: "1 tsp before dinner. Top evidence-backed cholesterol reducer in women's trials.", tags: ['LDL ↓'] },
          { icon: '🌱', name: 'Flaxseeds + Soy (moderate)', desc: '1 tbsp flaxseeds + moderate tofu/soy. Phytoestrogens reduce post-menopausal LDL elevation.', tags: ['LDL ↓', 'Hormones'] },
          { icon: '🫐', name: 'Polyphenol Foods', desc: 'Pomegranate + amla + green tea + berries. Women benefit more from polyphenols for LDL oxidation.', tags: ['LDL Oxidation ↓'] },
          { icon: '🐟', name: 'Omega-3 Foods', desc: 'Walnuts + chia + flaxseeds. EPA/DHA raise HDL — critical as oestrogen protection declines.', tags: ['HDL ↑'] },
          { icon: '⏱️', name: 'Intermittent Fasting', desc: '12-hr overnight fast. Reduces insulin + LDL. (Note: avoid >16-hr fasting for women — it raises cortisol).', tags: ['LDL ↓'] },
        ],
      },
      Ayurvedic: {
        Male: [
          { icon: '🌸', name: 'Arjuna Bark Tea', desc: 'Boil arjuna powder twice daily. Premier Ayurvedic heart tonic for men.', tags: ['LDL ↓'] },
          { icon: '🌿', name: 'Guggul', desc: 'Guggulsterones inhibit cholesterol synthesis — equivalent to mild statins.', tags: ['LDL ↓'] },
          { icon: '🪷', name: 'Triphala at Bedtime', desc: '1 tsp in warm water. Cleanses liver and reduces medha dhatu (fat tissue).', tags: ['Cholesterol ↓'] },
          { icon: '🧄', name: 'Garlic + Honey', desc: '2 garlic cloves + ½ tsp honey on empty stomach. Lowers serum cholesterol.', tags: ['LDL ↓'] },
          { icon: '🍃', name: 'Amla Daily', desc: 'Fresh amla or powder — Vitamin C reduces LDL by 15–20% in Ayurvedic studies.', tags: ['LDL ↓', 'HDL ↑'] },
        ],
        Female: [
          { icon: '🌸', name: 'Arjuna + Shatavari', desc: "Arjuna for heart + Shatavari for hormones. The classic Ayurvedic combo for women's cardiac health.", tags: ['LDL ↓', 'Hormones'] },
          { icon: '🌿', name: 'Guggul (Kanchanara)', desc: 'Kanchanara guggul — specifically formulated for women, addresses both cholesterol and thyroid.', tags: ['LDL ↓'] },
          { icon: '🪷', name: 'Triphala at Bedtime', desc: '1 tsp in warm water. Liver cleanse and cholesterol reduction for all genders.', tags: ['Cholesterol ↓'] },
          { icon: '🍃', name: 'Amla + Hibiscus Tea', desc: 'Amla juice + hibiscus tea daily. Hibiscus lowers LDL and supports female hormonal balance.', tags: ['LDL ↓', 'Hormones'] },
          { icon: '🌺', name: 'Lodhra Bark', desc: '1 tsp lodhra powder in warm water. Traditional Ayurvedic herb for women — reduces inflammation and cholesterol.', tags: ['LDL ↓'] },
        ],
      },
    },
    foodsToEat: {
      Male: ['Oats', 'Barley', 'Rajma', 'Chickpeas', 'Moong Dal', 'Walnuts', 'Almonds', 'Flaxseeds', 'Chia Seeds', 'Olive Oil', 'Pomegranate', 'Amla', 'Brown Rice', 'Garlic', 'Ginger', 'Psyllium Husk', 'Green Tea', 'Mackerel/Rohu (Non-veg)', 'Soy (moderate)', 'Pumpkin Seeds'],
      Female: ['Flaxseeds', 'Walnuts', 'Almonds', 'Oats', 'Rajma', 'Chickpeas', 'Moong Dal', 'Pomegranate', 'Amla', 'Brown Rice', 'Soy/Tofu (moderate)', 'Hibiscus Tea', 'Olive Oil', 'Garlic', 'Psyllium Husk', 'Green Tea', 'Berries', 'Papaya', 'Sesame Seeds', 'Dark Leafy Greens'],
    },
    foodsToAvoid: ['Full-fat Dairy', 'Butter & Ghee (excess)', 'Fried Foods', 'Trans Fats', 'Packaged Snacks', 'Refined Oil', 'Cream-based Curries', 'Processed Meats', 'Coconut Oil (excess)', 'Alcohol'],
    tips: {
      Male: [
        { icon: '🏃', t: 'Exercise = Natural Statin', d: '45-min daily walk reduces LDL by 5–10% in men. Strength training additionally raises HDL.' },
        { icon: '🫒', t: 'Switch Cooking Oil', d: 'Replace refined oil with mustard or olive oil. Max 3 tsp/day. This alone improves lipid profile.' },
        { icon: '🚬', t: 'Quit Smoking', d: 'Smoking reduces HDL (good cholesterol) by 5–10 mg/dL. No dietary intervention overcomes active smoking.' },
        { icon: '📊', t: 'Retest in 6 Weeks', d: 'Most dietary changes show measurable impact in fasting lipid profile within 4–6 weeks.' },
      ],
      Female: [
        { icon: '🏃', t: 'Cardio + Weights', d: 'Combine 30-min cardio + 20-min strength training 3×/week. Post-oestrogen decline, this is the most effective intervention.' },
        { icon: '🌸', t: 'Oestrogen & Cholesterol', d: 'Oestrogen naturally keeps LDL low before menopause. After 40, dietary fat quality matters more than ever.' },
        { icon: '🫒', t: 'Use Olive or Sesame Oil', d: 'Phytosterols in these oils reduce cholesterol absorption. Max 3 tsp/day total cooking oil.' },
        { icon: '📊', t: 'Annual Lipid Check', d: "Women's LDL can spike rapidly post-35. Annual fasting lipid profile is essential." },
      ],
    },
  },

  Sugar: {
    color: C.green, icon: '🩸',
    desc: {
      Male: 'Stabilise fasting glucose, reduce HbA1c, improve insulin sensitivity through low-GI eating.',
      Female: 'PCOS affects 1 in 5 Indian women and causes insulin resistance. Managing sugar is the #1 PCOS intervention.',
    },
    morningAdd: {
      Male: ['🌿 Overnight methi water — slows glucose absorption all morning', '🫗 ½ tsp cinnamon in warm water — reduces post-meal sugar spike 20–30%', '🥒 50ml karela juice diluted — activates same pathway as metformin'],
      Female: ['🌿 Overnight methi water — especially important for PCOS-related insulin resistance', '🌸 Spearmint tea — reduces androgens that worsen PCOS insulin issues', '🫗 ½ tsp cinnamon in warm water — improves insulin sensitivity in women with PCOS'],
    },
    remedies: {
      Both: {
        Male: [
          { icon: '🌿', name: 'Methi Seeds', desc: 'Soak 1 tsp overnight, drink on empty stomach. Galactomannan fibre slows glucose absorption.', tags: ['Fasting Sugar ↓'] },
          { icon: '🫗', name: 'Cinnamon Water', desc: '½ tsp before meals. Reduces post-meal blood sugar spikes by 20–30% in men.', tags: ['Post-meal Sugar ↓'] },
          { icon: '🥒', name: 'Karela Juice', desc: '50ml diluted daily. Polypeptide-P mimics insulin. Most studied anti-diabetic herb.', tags: ['Blood Sugar ↓'] },
          { icon: '🌱', name: 'Jamun Seed Powder', desc: '½ tsp with water. Jamboline inhibits sugar conversion — traditional male diabetic remedy.', tags: ['Fasting Sugar ↓'] },
          { icon: '⏱️', name: '12-Hr Overnight Fast', desc: '7pm–7am eating window. Reduces fasting insulin and glucose in 4–6 weeks.', tags: ['Insulin ↓', 'Sugar ↓'] },
        ],
        Female: [
          { icon: '🌿', name: 'Methi Seeds', desc: 'Essential for women with PCOS — galactomannan reduces insulin resistance specifically linked to androgen excess.', tags: ['Insulin Resistance ↓'] },
          { icon: '🌸', name: 'Spearmint Tea', desc: '2 cups daily. Reduces elevated androgens (testosterone) in PCOS women, which directly improves insulin sensitivity.', tags: ['Androgens ↓', 'Sugar ↓'] },
          { icon: '🫗', name: 'Cinnamon Water', desc: '½ tsp before meals. Clinical trials in PCOS women show fasting sugar improvement in 8 weeks.', tags: ['PCOS', 'Sugar ↓'] },
          { icon: '🥒', name: 'Karela Juice', desc: '50ml diluted. Improves glucose metabolism and helps regulate menstrual cycles in PCOS.', tags: ['Sugar ↓', 'PCOS'] },
          { icon: '🌱', name: 'Inositol-rich Foods', desc: 'Chickpeas, lentils, oranges, cantaloupe. Inositol is clinically proven to improve insulin sensitivity in PCOS women.', tags: ['PCOS', 'Insulin ↓'] },
        ],
      },
      Modern: {
        Male: [
          { icon: '🚶', name: 'Post-meal Walk', desc: '10-min walk after every meal. Muscles consume glucose, blunting spike by 30%.', tags: ['Post-meal Sugar ↓'] },
          { icon: '⏱️', name: 'Intermittent Fasting', desc: '16:8 window reduces fasting insulin significantly in men.', tags: ['Insulin ↓'] },
          { icon: '🌿', name: 'Methi + Isabgol', desc: 'Combined soluble fibre — most evidence-backed combo for male type-2 prevention.', tags: ['Sugar ↓'] },
          { icon: '📉', name: 'Low-GI Swap', desc: 'Brown rice (GI 50) over white (GI 72). Ragi (GI 68) over maida (GI 85).', tags: ['Glycaemic Control'] },
          { icon: '💪', name: 'Strength Training', desc: 'Building muscle mass is the most underrated blood sugar intervention. Muscle absorbs glucose.', tags: ['Insulin Sensitivity ↑'] },
        ],
        Female: [
          { icon: '🚶', name: 'Post-meal Walk', desc: '10-min walk after meals. More effective in women with PCOS than in metabolically normal women.', tags: ['Post-meal Sugar ↓'] },
          { icon: '⏱️', name: '12-Hr Fast Only', desc: 'Limit fast to 12 hrs for women — longer fasting raises cortisol in women more than men.', tags: ['Insulin ↓'] },
          { icon: '🌸', name: 'Inositol Supplement', desc: 'Myo-inositol (from food or supplement) is clinically proven for PCOS insulin resistance.', tags: ['PCOS', 'Insulin ↓'] },
          { icon: '📉', name: 'Low-GI Diet', desc: 'Low-glycaemic eating is the #1 diet intervention for PCOS. Ragi, oats, dal over maida.', tags: ['PCOS', 'Sugar ↓'] },
          { icon: '💪', name: 'Resistance Training', desc: 'Strength training 3×/week improves insulin sensitivity more than cardio alone in PCOS women.', tags: ['Insulin Sensitivity ↑'] },
        ],
      },
      Ayurvedic: {
        Male: [
          { icon: '🌱', name: 'Vijayasar Tumbler', desc: 'Fill water in vijayasar wood glass overnight. Traditional Ayurvedic anti-diabetic for men.', tags: ['Blood Sugar ↓'] },
          { icon: '🍃', name: 'Neem Leaves', desc: '4–5 neem leaves on empty stomach. Blood purifier and insulin sensitiser.', tags: ['Sugar ↓'] },
          { icon: '🌿', name: 'Gurmar (Gymnema)', desc: "'Sugar destroyer' — chewing leaves blocks sweet taste and sugar absorption.", tags: ['Sugar ↓'] },
          { icon: '🌸', name: 'Tulsi Kadha', desc: 'Tulsi + ginger boiled — reduces cortisol-driven blood sugar in men.', tags: ['Sugar ↓'] },
          { icon: '🫚', name: 'Bitter Gourd Sabzi', desc: 'Karela sabzi 3×/week — not just juice, eating the whole vegetable is effective too.', tags: ['Blood Sugar ↓'] },
        ],
        Female: [
          { icon: '🌸', name: 'Shatavari + Methi', desc: 'Shatavari supports female hormones while methi lowers blood sugar. Combined effect for PCOS.', tags: ['PCOS', 'Sugar ↓'] },
          { icon: '🌺', name: 'Lodhra + Ashoka', desc: 'Traditional Ayurvedic combination for female reproductive health + blood sugar regulation.', tags: ['PCOS', 'Hormones'] },
          { icon: '🌿', name: 'Gurmar (Gymnema)', desc: 'Blocks sugar absorption — equally effective in women, regardless of PCOS status.', tags: ['Sugar ↓'] },
          { icon: '🌸', name: 'Tulsi + Spearmint Tea', desc: 'Tulsi reduces cortisol + spearmint reduces androgens. Powerful PCOS combination.', tags: ['PCOS', 'Sugar ↓'] },
          { icon: '🍃', name: 'Neem Leaves', desc: '4–5 neem leaves on empty stomach — blood purifier, anti-androgenic properties benefit PCOS.', tags: ['PCOS', 'Sugar ↓'] },
        ],
      },
    },
    foodsToEat: {
      Male: ['Bitter Gourd', 'Methi Leaves', 'Jamun', 'Cinnamon', 'Turmeric', 'Brown Rice', 'Ragi', 'Jowar', 'Bajra', 'Oats', 'Moong Dal', 'Chana Dal', 'Leafy Greens', 'Cucumber', 'Lauki', 'Amla', 'Guava', 'Pear'],
      Female: ['Bitter Gourd', 'Methi Leaves', 'Spearmint', 'Cinnamon', 'Chickpeas (Inositol)', 'Lentils', 'Brown Rice', 'Ragi', 'Oats', 'Flaxseeds', 'Leafy Greens', 'Amla', 'Berries', 'Guava', 'Pumpkin Seeds', 'Sesame Seeds', 'Turmeric'],
    },
    foodsToAvoid: ['White Rice (excess)', 'Maida', 'Refined Sugar', 'Sugary Tea & Coffee', 'Packaged Juices', 'Sweets & Mithai', 'White Bread', 'Instant Noodles', 'Sweetened Yoghurt', 'Excess Fruits (mango, banana)'],
    tips: {
      Male: [
        { icon: '🍽️', t: 'Plate Method', d: '½ plate non-starchy veg + ¼ protein + ¼ complex carb. Reduces post-meal glucose by 20–25%.' },
        { icon: '🕖', t: 'Early Dinner', d: 'Dinner by 7:30 PM. Late eating disrupts circadian insulin rhythm in men.' },
        { icon: '💪', t: 'Build Muscle', d: 'Every 1kg of muscle gained improves insulin sensitivity — the most underrated blood sugar strategy.' },
        { icon: '🚶', t: 'Post-meal Walk', d: '10-min walk after every meal. Most effective and completely free intervention.' },
      ],
      Female: [
        { icon: '🌸', t: 'PCOS & Insulin', d: 'PCOS affects 1 in 5 Indian women. Insulin resistance is the root cause in 70% of cases. Low-GI diet is treatment.' },
        { icon: '🍽️', t: 'Never Skip Meals', d: 'Meal skipping raises cortisol in women, worsening insulin resistance and worsening PCOS symptoms.' },
        { icon: '💪', t: 'Strength Training', d: 'Resistance training 3×/week is more effective than cardio alone for insulin sensitivity in women.' },
        { icon: '😴', t: 'Sleep Quality', d: 'Poor sleep raises morning cortisol and blood sugar, and worsens PCOS. 8 hrs is medicine.' },
      ],
    },
  },

  Fertility: {
    color: C.teal, icon: '🧬',
    desc: {
      Male: 'Improve sperm count, motility & morphology. Boost testosterone naturally with zinc, omega-3 and targeted Ayurvedic herbs.',
      Female: 'Improve egg quality, support ovulation, regulate cycles and create the best hormonal environment for conception.',
    },
    morningAdd: {
      Male: ['🌿 Ashwagandha ½ tsp in warm milk at night — proven to raise testosterone and sperm count by 167%', '🎃 1 tbsp pumpkin seeds — richest plant source of zinc, essential for sperm production', '🍅 Cooked tomato — lycopene reduces sperm DNA fragmentation significantly'],
      Female: ["🌸 Shatavari ½ tsp in warm milk — Ayurveda's premier female reproductive tonic; supports FSH and oestrogen", '🫚 1 tbsp soaked flaxseeds — phytoestrogens support oestrogen balance and egg quality', '🍃 Folate-rich foods (methi, spinach, dal) — critical for egg health and early pregnancy'],
    },
    remedies: {
      Both: {
        Male: [
          { icon: '🌿', name: 'Ashwagandha (Withania)', desc: '½ tsp in warm milk at night. 90-day RCTs show 167% sperm count increase, 57% motility improvement and raised testosterone.', tags: ['Count ↑', 'Testosterone ↑'] },
          { icon: '🎃', name: 'Pumpkin Seeds (Zinc)', desc: '2 tbsp daily. Zinc is the #1 micronutrient for testosterone synthesis. Deficiency directly causes low sperm count.', tags: ['Testosterone ↑', 'Count ↑'] },
          { icon: '🍅', name: 'Cooked Tomatoes (Lycopene)', desc: '3–4×/week. Lycopene reduces oxidative stress in testes and improves sperm morphology — clinically proven.', tags: ['Morphology ↑'] },
          { icon: '🪨', name: 'Shilajit', desc: "Small amount in warm milk. Fulvic acid + 80+ trace minerals — Ayurveda's premier male reproductive rejuvenator.", tags: ['Testosterone ↑', 'Energy ↑'] },
          { icon: '🌰', name: 'Walnuts Daily', desc: '4–6 walnuts. DHA omega-3 is a structural component of the sperm tail membrane — directly improves motility.', tags: ['Motility ↑'] },
        ],
        Female: [
          { icon: '🌸', name: 'Shatavari', desc: '½ tsp in warm milk morning and night. Adaptogen that supports FSH/LH balance, oestrogen production and uterine lining.', tags: ['Egg Quality ↑', 'Cycle ↑'] },
          { icon: '🌺', name: 'Ashoka Bark Decoction', desc: 'Boil ashoka bark in water, drink twice daily. Premier Ayurvedic uterine tonic — regulates cycle and reduces endometrial irregularities.', tags: ['Cycle ↑', 'Uterus ↑'] },
          { icon: '🌿', name: 'Methi + Lodhra', desc: 'Methi improves insulin sensitivity (critical for PCOS fertility) + lodhra bark regulates LH/FSH ratio.', tags: ['PCOS', 'Cycle ↑'] },
          { icon: '🫚', name: 'Flaxseeds (Phytoestrogen)', desc: '1 tbsp soaked flaxseeds daily. Lignans mimic oestrogen gently — supports follicular phase and egg maturation.', tags: ['Oestrogen ↑', 'Egg Quality ↑'] },
          { icon: '🫐', name: 'Antioxidant Protocol', desc: 'Pomegranate + amla + berries daily. Antioxidants reduce oxidative stress on eggs — critical for egg quality after 30.', tags: ['Egg Quality ↑'] },
        ],
      },
      Modern: {
        Male: [
          { icon: '🎃', name: 'Zinc (Pumpkin Seeds)', desc: '2 tbsp daily. Zinc deficiency is the #1 micronutrient cause of male infertility worldwide.', tags: ['Count ↑', 'Testosterone ↑'] },
          { icon: '🥚', name: 'Selenium + Vitamin E', desc: 'Sunflower seeds + almonds daily. This combination improves sperm motility in multiple RCTs.', tags: ['Motility ↑'] },
          { icon: '🫐', name: 'Antioxidant Protocol', desc: 'Pomegranate + amla + walnuts daily. Neutralise free radicals that cause sperm DNA fragmentation.', tags: ['DNA Integrity ↑'] },
          { icon: '🍅', name: 'Lycopene Foods', desc: 'Cooked tomato 3–4×/week + watermelon. Lycopene is the most studied antioxidant for male fertility.', tags: ['Morphology ↑'] },
          { icon: '☀️', name: 'Vitamin D (Sunlight)', desc: '20-min morning sunlight. Vitamin D receptors exist in the testes — deficiency reduces testosterone by 30%.', tags: ['Testosterone ↑'] },
        ],
        Female: [
          { icon: '🌿', name: 'Folate-Rich Foods', desc: 'Methi, spinach, dal, chickpeas daily. Folate is non-negotiable for egg quality and prevents neural tube defects.', tags: ['Egg Quality ↑'] },
          { icon: '🌸', name: 'Inositol (Myo-Inositol)', desc: 'Found in chickpeas, lentils, oranges. Clinical gold standard for PCOS-related ovulatory infertility.', tags: ['PCOS', 'Ovulation ↑'] },
          { icon: '🫐', name: 'CoQ10 via Antioxidant Foods', desc: 'Pomegranate + berries + amla. CoQ10 equivalent from food reduces egg oxidative damage, especially after 35.', tags: ['Egg Quality ↑'] },
          { icon: '🐟', name: 'Omega-3 Foods', desc: 'Flaxseeds + walnuts + chia. DHA improves embryo quality and supports uterine blood flow.', tags: ['Uterus ↑', 'Egg Quality ↑'] },
          { icon: '☀️', name: 'Vitamin D + Iron', desc: '20-min sunlight + iron-rich foods. Both deficiencies impair ovulation — extremely common in Indian women.', tags: ['Ovulation ↑'] },
        ],
      },
      Ayurvedic: {
        Male: [
          { icon: '🌿', name: 'Ashwagandha', desc: '½ tsp in warm milk nightly. Most evidence-backed Ayurvedic herb for male reproductive health.', tags: ['Count ↑', 'Testosterone ↑'] },
          { icon: '🪨', name: 'Shilajit', desc: 'Fulvic acid + 80+ trace minerals — comprehensive male reproductive tonic.', tags: ['Testosterone ↑'] },
          { icon: '🌱', name: 'Safed Musli', desc: '1 tsp in warm milk. Increases sperm production, reduces cortisol, classified as a Vajikaran herb.', tags: ['Count ↑'] },
          { icon: '🌸', name: 'Gokshura', desc: 'Stimulates LH release, naturally boosting testosterone levels without side effects.', tags: ['Testosterone ↑'] },
          { icon: '🌺', name: 'Kapikacchu (Mucuna)', desc: 'L-DOPA precursor — improves testosterone, mood and sperm quality simultaneously.', tags: ['Quality ↑'] },
        ],
        Female: [
          { icon: '🌸', name: 'Shatavari', desc: 'The most revered Ayurvedic female herb. Supports all stages of female fertility — from follicular development to uterine lining.', tags: ['Egg Quality ↑', 'Cycle ↑'] },
          { icon: '🌺', name: 'Ashoka + Lodhra', desc: 'Classical Ayurvedic combination for uterine health, cycle regulation and reducing menstrual disorders.', tags: ['Uterus ↑', 'Cycle ↑'] },
          { icon: '🌿', name: 'Kanchanara Guggul', desc: 'Specifically for PCOS and ovarian cysts in Ayurveda. Reduces cyst formation and normalises ovulation.', tags: ['PCOS', 'Ovulation ↑'] },
          { icon: '🌱', name: 'Safed Musli', desc: '1 tsp in warm milk. Acts as female Vajikaran — nourishes reproductive tissues (artava dhatu).', tags: ['Egg Quality ↑'] },
          { icon: '🫚', name: 'Sesame + Ghee', desc: 'Sesame seeds + 1 tsp ghee daily. Both nourish artava dhatu (reproductive tissue) in Ayurvedic texts.', tags: ['Uterus ↑'] },
        ],
      },
    },
    foodsToEat: {
      Male: ['Pumpkin Seeds (Zinc)', 'Walnuts (Omega-3)', 'Cooked Tomatoes (Lycopene)', 'Pomegranate', 'Eggs', 'Paneer', 'Chickpeas', 'Sunflower Seeds (Selenium)', 'Dark Chocolate (70%+)', 'Spinach', 'Ashwagandha Milk', 'Almonds', 'Garlic', 'Ginger', 'Amla', 'Brown Rice', 'Safed Musli Milk', 'Bananas'],
      Female: ['Shatavari Milk', 'Flaxseeds', 'Spinach (Folate)', 'Methi (Folate)', 'Chickpeas (Inositol)', 'Lentils (Folate)', 'Pomegranate', 'Sesame Seeds', 'Amla', 'Walnuts', 'Berries', 'Pumpkin Seeds', 'Sweet Potato', 'Avocado', 'Ghee (1 tsp)', 'Brown Rice', 'Safed Musli', 'Ashoka Tea'],
    },
    foodsToAvoid: {
      Male: ['Alcohol', 'Excess Soy', 'Refined Sugar', 'Junk Food', 'Plastic-wrapped Hot Food', 'Excessive Caffeine', 'Processed Meats', 'Trans Fats', 'Hot Tubs & Tight Synthetics', 'BPA Plastics'],
      Female: ['Refined Sugar (disrupts ovulation)', 'Excess Dairy (PCOS)', 'Alcohol', 'Trans Fats', 'Processed Foods', 'Excess Caffeine', 'Refined Carbs (raise insulin)', 'Plastic Containers (BPA)', 'Excess Soy (isoflavones)', 'Smoking'],
    },
    tips: {
      Male: [
        { icon: '🌡️', t: 'Avoid Testicular Heat', d: 'Avoid laptops on lap, hot tubs, tight synthetics. Sperm production requires 2°C below body temperature.' },
        { icon: '😴', t: 'Sleep = Testosterone', d: 'Testosterone is produced during deep sleep cycles. 7–8 hrs is non-negotiable for sperm count and quality.' },
        { icon: '🧘', t: 'Stress Kills Sperm', d: 'Chronic stress raises cortisol, which directly suppresses testosterone and sperm production.' },
        { icon: '🚰', t: 'Avoid BPA Plastics', d: 'Switch to glass or copper vessels. BPA and phthalates are endocrine disruptors that lower sperm count.' },
      ],
      Female: [
        { icon: '📅', t: 'Track Your Cycle', d: 'Use a cycle app to identify your fertile window (days 11–16 approx). BBT tracking and LH strips improve timing.' },
        { icon: '😴', t: 'Sleep Regulates Hormones', d: 'Melatonin protects egg quality during overnight hours. 8 hrs before 10:30 PM supports optimal FSH and LH patterns.' },
        { icon: '🧘', t: 'Stress Suppresses Ovulation', d: 'Chronic stress raises cortisol → suppresses GnRH → disrupts ovulation. Daily pranayama is reproductive medicine.' },
        { icon: '🚰', t: 'Avoid Endocrine Disruptors', d: 'Use glass/steel storage, chemical-free cookware and natural personal care products. BPA disrupts female hormones.' },
      ],
    },
  },

  'Hormonal Balance': {
    color: C.rose, icon: '🌸',
    desc: {
      Female: 'Balance oestrogen, progesterone and androgens. Address PCOS, irregular cycles, thyroid, PMS and perimenopause naturally.',
    },
    morningAdd: {
      Female: ['🌸 Shatavari powder in warm milk — premier Ayurvedic female hormone tonic', '🫚 1 tsp soaked flaxseeds — phytoestrogens gently support oestrogen levels', '🌺 Spearmint tea — clinically proven to reduce excess androgens in PCOS women'],
    },
    remedies: {
      Both: {
        Female: [
          { icon: '🌸', name: 'Shatavari', desc: '½ tsp in warm milk morning and night. Adaptogen that supports oestrogen production, FSH balance, and reduces PMS symptoms.', tags: ['Hormones ↑', 'PMS ↓'] },
          { icon: '🌺', name: 'Spearmint Tea', desc: '2 cups daily. Reduces elevated free testosterone in PCOS women — clinically proven in RCTs.', tags: ['Androgens ↓', 'PCOS'] },
          { icon: '🌿', name: 'Methi + Lodhra', desc: 'Methi seeds (blood sugar) + lodhra bark (hormone regulator). Traditional Ayurvedic combination for PCOS.', tags: ['PCOS', 'Cycle ↑'] },
          { icon: '🌺', name: 'Ashoka Bark Decoction', desc: 'Boil ashoka bark in water. Premier Ayurvedic uterine tonic — regulates menstrual cycle and reduces dysmenorrhoea.', tags: ['Cycle ↑', 'PMS ↓'] },
          { icon: '🫚', name: 'Flaxseeds (Phytoestrogens)', desc: '1 tbsp daily soaked. Lignans act as mild phytoestrogens, helping balance oestrogen-progesterone ratio.', tags: ['Oestrogen ↑', 'Hormones'] },
        ],
      },
      Modern: {
        Female: [
          { icon: '🌸', name: 'Inositol (Myo + D-Chiro)', desc: 'Found in chickpeas, lentils, oranges. Clinical gold standard for PCOS insulin and hormonal regulation.', tags: ['PCOS', 'Insulin ↓', 'LH ↓'] },
          { icon: '🌺', name: 'Spearmint Tea', desc: '2 cups daily. Reduces free testosterone in PCOS — one of the best-studied herbal interventions.', tags: ['Androgens ↓'] },
          { icon: '🫚', name: 'Omega-3 (Flax + Walnuts)', desc: 'Daily omega-3 reduces prostaglandin-driven menstrual pain and regulates LH/FSH ratio.', tags: ['PMS ↓', 'Hormones'] },
          { icon: '🌿', name: 'Low-GI Diet', desc: 'Low-glycaemic eating reduces insulin → reduces androgen production in ovaries. The root PCOS fix.', tags: ['PCOS', 'Androgens ↓'] },
          { icon: '☀️', name: 'Vitamin D3', desc: 'Critical for progesterone production and thyroid function. 20-min sunlight + Vitamin D-rich foods.', tags: ['Progesterone ↑', 'Thyroid ↑'] },
        ],
      },
      Ayurvedic: {
        Female: [
          { icon: '🌸', name: 'Shatavari', desc: 'The most revered Ayurvedic female herb. Supports all stages — menstruation, fertility, perimenopause.', tags: ['Hormones ↑'] },
          { icon: '🌺', name: 'Ashoka + Lodhra', desc: 'Classical combination for uterine health, cycle regulation and reducing menstrual pain.', tags: ['Cycle ↑', 'PMS ↓'] },
          { icon: '🌿', name: 'Kanchanara Guggul', desc: 'Specifically for PCOS and thyroid health in Ayurveda. Reduces cyst formation.', tags: ['PCOS', 'Thyroid'] },
          { icon: '🧘', name: 'Yoga Nidra Daily', desc: 'Deep relaxation practice. Reduces cortisol and prolactin — two key hormone disruptors in women.', tags: ['Cortisol ↓', 'Hormones'] },
          { icon: '🫚', name: 'Sesame + Castor Oil Massage', desc: 'Warm sesame oil abdominal massage on days 1–14 of cycle. Ayurvedic practice to support follicular phase.', tags: ['Cycle ↑'] },
        ],
      },
    },
    foodsToEat: {
      Female: ['Flaxseeds (Phytoestrogen)', 'Shatavari', 'Spearmint', 'Soy/Tofu (moderate)', 'Chickpeas (Inositol)', 'Lentils', 'Sesame Seeds', 'Pomegranate', 'Berries', 'Dark Leafy Greens', 'Broccoli', 'Sweet Potato', 'Pumpkin Seeds', 'Cinnamon', 'Turmeric', 'Amla', 'Vitamin D Foods', 'Zinc-rich Foods'],
    },
    foodsToAvoid: ['Refined Sugar (disrupts cortisol)', 'Excess Dairy (PCOS)', 'Processed Soy (excess)', 'Alcohol', 'Refined Carbs', 'Trans Fats', 'Excess Caffeine (disrupts cortisol)', 'Plastic Containers', 'Chemical Cosmetics', 'Fried Foods'],
    tips: {
      Female: [
        { icon: '🌙', t: 'Track Your Cycle', d: 'Use an app to track your cycle. Identify luteal phase (days 15–28) when cravings and mood dips occur — adjust diet accordingly.' },
        { icon: '😴', t: 'Sleep Regulates Hormones', d: 'Melatonin, cortisol, oestrogen and progesterone all depend on sleep quality. 8 hrs before 10:30 PM is hormone medicine.' },
        { icon: '🧘', t: 'Cortisol = Hormone Chaos', d: 'Chronic stress raises cortisol, which suppresses progesterone and worsens PCOS/PMS. Daily pranayama is non-negotiable.' },
        { icon: '🚫', t: 'Reduce Endocrine Disruptors', d: 'Avoid heating food in plastic, switch to glass/steel storage, choose chemical-free personal care products.' },
      ],
    },
  },

  'Gut Health': {
    color: C.purple, icon: '🌱',
    desc: {
      Male: "Heal gut lining, build diverse microbiome. Men's gut health directly affects testosterone and mood.",
      Female: "Women's gut microbiome directly affects oestrogen metabolism. A healthy gut is essential for hormone balance.",
    },
    morningAdd: {
      Male: ['🌿 Soaked methi water — prebiotic fibre feeds beneficial gut bacteria', '🍵 Warm ginger + ajwain water — stimulates digestive fire', '🧅 Raw garlic clove — prebiotic FOS directly feeds Lactobacillus'],
      Female: ['🌿 Soaked methi water — prebiotic and hormone-supportive', '🥛 Small bowl curd on empty stomach — probiotic colonisation is best on empty stomach', '🌸 Fennel seed water — reduces bloating and supports female digestive health'],
    },
    remedies: {
      Both: {
        Male: [
          { icon: '🥛', name: 'Probiotic Curd Daily', desc: '1 bowl homemade curd with lunch. Replenishes Lactobacillus flora that affects testosterone metabolism.', tags: ['Microbiome ↑'] },
          { icon: '🧅', name: 'Prebiotic Foods', desc: 'Garlic, onion, oats, banana daily. Feeds beneficial bacteria — critical for male gut-hormone axis.', tags: ['Microbiome ↑'] },
          { icon: '🪷', name: 'Triphala at Bedtime', desc: '1 tsp in warm water nightly. Tones bowel wall, improves absorption, gentle daily detox.', tags: ['Detox', 'Motility ↑'] },
          { icon: '🌶️', name: 'Ajwain + Hing Water', desc: 'Immediate relief from male-pattern bloating and gas. Activates digestive enzymes.', tags: ['Bloating ↓'] },
          { icon: '🫙', name: 'Fermented Foods', desc: 'Idli, dhokla, kanji 3–4×/week. Live organisms colonise gut and produce B vitamins.', tags: ['Microbiome ↑'] },
        ],
        Female: [
          { icon: '🥛', name: 'Probiotic Curd + Flaxseeds', desc: '1 bowl curd + 1 tsp flaxseeds daily. Probiotics + phytoestrogens — gut-hormone synergy unique to women.', tags: ['Microbiome ↑', 'Hormones'] },
          { icon: '🌸', name: 'Fennel Seed Water', desc: 'Boil fennel seeds, drink warm. Reduces female-specific bloating and supports beneficial bacteria.', tags: ['Bloating ↓', 'Microbiome ↑'] },
          { icon: '🪷', name: 'Triphala at Bedtime', desc: '1 tsp in warm water. Women metabolise triphala slightly differently — take with warm water, not milk.', tags: ['Detox', 'Motility ↑'] },
          { icon: '🧅', name: 'Prebiotic Foods', desc: 'Garlic, onion, asparagus, banana. Feeds Lactobacillus, which produces short-chain fatty acids that regulate oestrogen.', tags: ['Microbiome ↑', 'Oestrogen ↑'] },
          { icon: '🫙', name: 'Fermented Foods', desc: 'Idli, dhokla, homemade kanji. The gut microbiome regulates the oestrobolome — the set of gut bacteria that metabolise oestrogen.', tags: ['Microbiome ↑', 'Hormones'] },
        ],
      },
      Modern: {
        Male: [
          { icon: '🌱', name: 'Psyllium Husk', desc: '1 tsp in water — prebiotic fibre + bulking agent. Men need 38g fibre/day.', tags: ['Motility ↑'] },
          { icon: '🍵', name: 'Bone Broth / Dal Broth', desc: 'Clear dal broth — glutamine repairs intestinal lining and reduces leaky gut.', tags: ['Gut Lining ↑'] },
          { icon: '🥛', name: 'Kefir or Curd', desc: 'Daily probiotics reduce IBS symptoms and improve gut transit time.', tags: ['Microbiome ↑'] },
          { icon: '🧅', name: 'Prebiotic Protocol', desc: 'Include garlic, onion, leek and slightly unripe banana daily — best natural prebiotics.', tags: ['Microbiome ↑'] },
          { icon: '🌾', name: 'Resistant Starch', desc: 'Cooled rice/roti is digested slower and feeds gut bacteria. Cook and refrigerate.', tags: ['Microbiome ↑'] },
        ],
        Female: [
          { icon: '🌱', name: 'Psyllium Husk', desc: '1 tsp in water before dinner. Women with slower gut transit benefit most from bulking fibre.', tags: ['Constipation ↓'] },
          { icon: '🥛', name: 'Probiotic Curd', desc: 'Lactobacillus rhamnosus and L. acidophilus (in homemade curd) specifically benefit female gut-vaginal health.', tags: ['Microbiome ↑'] },
          { icon: '🧅', name: 'Oestrobolome Support', desc: 'Garlic + onion + leek — prebiotic foods that support the gut bacteria responsible for oestrogen metabolism.', tags: ['Hormones', 'Microbiome ↑'] },
          { icon: '🫙', name: 'Fermented Foods', desc: 'Daily fermented foods improve gut flora — which in turn regulates oestrogen recycling in women.', tags: ['Microbiome ↑', 'Hormones'] },
          { icon: '🌾', name: 'High-Fibre Diet', desc: "Women's gut transit is slower. 25–30g fibre/day reduces bloating, constipation and hormone imbalance.", tags: ['Motility ↑'] },
        ],
      },
      Ayurvedic: {
        Male: [
          { icon: '🌶️', name: 'Ajwain + Hing', desc: 'Morning ajwain water + hing in cooking. Best Ayurvedic digestive for male vata-type bloating.', tags: ['Bloating ↓'] },
          { icon: '🌿', name: 'Saunf After Meals', desc: 'Chew 1 tsp fennel after every meal. Relaxes intestinal muscles and reduces gas.', tags: ['Digestion ↑'] },
          { icon: '🫚', name: 'Desi Ghee (1 tsp)', desc: 'Small amount of ghee — butyric acid nourishes colonocytes (gut lining cells) in men.', tags: ['Gut Lining ↑'] },
          { icon: '🪷', name: 'Triphala + Ginger', desc: 'Triphala at night + ginger tea morning. Comprehensive Ayurvedic gut restoration.', tags: ['Motility ↑'] },
          { icon: '🍵', name: 'Jeera Kadha', desc: 'Boil jeera + black pepper. Stimulates agni and reduces bloating after heavy meals.', tags: ['Digestion ↑'] },
        ],
        Female: [
          { icon: '🌸', name: 'Shatavari + Triphala', desc: 'Shatavari nourishes female gut mucosa while Triphala detoxifies. Unique Ayurvedic female gut formula.', tags: ['Gut Lining ↑', 'Hormones'] },
          { icon: '🌸', name: 'Fennel + Rose Tea', desc: 'Fennel + rose petals boiled in water. Traditional female digestive — reduces bloating linked to menstrual cycle.', tags: ['Bloating ↓', 'Cycle ↑'] },
          { icon: '🫚', name: 'Desi Ghee (1 tsp)', desc: 'Butyric acid repairs gut lining. Especially important for women with IBS-type symptoms.', tags: ['Gut Lining ↑'] },
          { icon: '🌿', name: 'Saunf + Ajwain', desc: 'Chew saunf after meals, ajwain water in morning. Female digestive rhythm support.', tags: ['Digestion ↑'] },
          { icon: '🪷', name: 'Triphala at Bedtime', desc: "Night cleanse. Women's gut eliminates oestrogen metabolites overnight — triphala supports this.", tags: ['Detox', 'Hormones'] },
        ],
      },
    },
    foodsToEat: {
      Male: ['Homemade Curd', 'Idli', 'Dhokla', 'Garlic', 'Onion', 'Banana', 'Oats', 'Psyllium Husk', 'Ginger', 'Fennel Seeds', 'Ajwain', 'Ghee (1 tsp)', 'Moong Dal', 'Lauki', 'Triphala', 'Dal Broth'],
      Female: ['Homemade Curd + Flaxseeds', 'Idli', 'Dhokla', 'Garlic', 'Onion', 'Fennel Seeds', 'Banana', 'Oats', 'Psyllium Husk', 'Ginger', 'Rose Tea', 'Shatavari', 'Ghee (1 tsp)', 'Moong Dal', 'Lauki', 'Triphala'],
    },
    foodsToAvoid: ['Processed Foods', 'Refined Sugar', 'Alcohol', 'Fried Foods', 'Artificial Sweeteners', 'Carbonated Drinks', 'Cold Food on Empty Stomach', 'Overuse of Antibiotics', 'Excess Red Meat', 'Packaged Snacks'],
    tips: {
      Male: [
        { icon: '🍽️', t: 'Chew 20–30 Times', d: 'Digestion starts in the mouth. Men with IBS or bloating see dramatic improvement from slower eating alone.' },
        { icon: '🧘', t: 'Gut-Brain Axis', d: 'Chronic work stress directly causes leaky gut in men. Pranayama reduces gut inflammation by lowering cortisol.' },
        { icon: '💧', t: 'Warm Water Only', d: 'Cold water suppresses digestive enzymes. Drink warm or room-temperature water throughout the day.' },
        { icon: '⏰', t: 'Consistent Meal Times', d: 'The gut microbiome has a circadian rhythm. Eating at consistent times improves digestion and flora diversity.' },
      ],
      Female: [
        { icon: '🌸', t: 'Gut-Hormone Connection', d: "The gut's oestrobolome (set of gut bacteria) regulates oestrogen. A healthy gut = balanced hormones." },
        { icon: '🍽️', t: 'Eat Mindfully', d: 'Women with PCOS or hormonal issues benefit enormously from slow eating and portion awareness.' },
        { icon: '💧', t: 'Warm Water + Fennel', d: 'Start morning with warm fennel water. Reduces female-specific bloating that worsens cyclically.' },
        { icon: '🧘', t: 'Stress and Gut Health', d: 'Anxiety and stress cause IBS-type symptoms in women 2× more often than men. Yoga nidra helps.' },
      ],
    },
  },

  Inflammation: {
    color: C.pink, icon: '🔥',
    desc: {
      Male: 'Reduce chronic systemic inflammation — root of heart disease, diabetes, and accelerated ageing.',
      Female: 'Autoimmune conditions are 3× more common in women. Reducing inflammation is also the key to PCOS and hormonal balance.',
    },
    morningAdd: {
      Male: ['🟡 Turmeric + black pepper in warm water — piperine boosts curcumin absorption 2000×', '🫚 1 tbsp extra-virgin olive oil — oleocanthal has ibuprofen-like action', '🫐 Pomegranate or berries — polyphenols suppress NF-κB inflammatory pathway'],
      Female: ['🟡 Turmeric + black pepper in warm water — curcumin reduces inflammatory cytokines that worsen PCOS', '🫚 1 tbsp flaxseeds — omega-3 + phytoestrogen double anti-inflammatory benefit', '🌸 Hibiscus or rose tea — polyphenols reduce oestrogen-driven inflammation'],
    },
    remedies: {
      Both: {
        Male: [
          { icon: '🟡', name: 'Turmeric + Black Pepper', desc: 'In every cooked dish. Curcumin = NF-κB inhibitor. Black pepper increases absorption 2000%.', tags: ['CRP ↓', 'Pain ↓'] },
          { icon: '🌿', name: 'Ginger Daily', desc: 'Fresh ginger in food and tea. Gingerols and shogaols inhibit COX-2 (same target as ibuprofen).', tags: ['Joint Inflam. ↓'] },
          { icon: '🫐', name: 'Pomegranate + Amla', desc: 'Polyphenols from both prevent LDL oxidation and suppress inflammatory cascades in men.', tags: ['CRP ↓'] },
          { icon: '🌸', name: 'Shallaki (Boswellia)', desc: 'Inhibits 5-LOX enzyme — powerful for joint inflammation and male cardiovascular inflammation.', tags: ['Joint Pain ↓'] },
          { icon: '🐟', name: 'Omega-3 Foods', desc: 'Walnuts + flaxseeds + chia daily. EPA/DHA produce anti-inflammatory resolvins.', tags: ['Systemic Inflam. ↓'] },
        ],
        Female: [
          { icon: '🟡', name: 'Turmeric + Black Pepper', desc: 'Essential for women with PCOS, endometriosis or autoimmune conditions — reduces IL-6 and TNF-α.', tags: ['CRP ↓', 'PCOS'] },
          { icon: '🌸', name: 'Hibiscus + Ginger Tea', desc: 'Hibiscus reduces blood pressure + inflammation. Ginger reduces prostaglandin-driven menstrual pain.', tags: ['CRP ↓', 'PMS ↓'] },
          { icon: '🌿', name: 'Flaxseeds (Omega-3 + Lignan)', desc: 'Reduces inflammatory prostaglandins that cause menstrual pain, while also supporting hormone balance.', tags: ['Period Pain ↓', 'Inflam. ↓'] },
          { icon: '🌺', name: 'Guduchi (Giloy)', desc: 'Immunomodulator — balances immune response. Particularly important for women with autoimmune tendency.', tags: ['Immune Balance'] },
          { icon: '🫐', name: 'Polyphenol Protocol', desc: 'Berries + pomegranate + amla + green tea. Women respond more strongly to dietary polyphenols for CRP reduction.', tags: ['CRP ↓'] },
        ],
      },
      Modern: {
        Male: [
          { icon: '🥗', name: 'Anti-Inflammatory Diet', desc: 'Minimise refined carbs, seed oils, red meat. These are primary dietary inflammation drivers in men.', tags: ['Systemic Inflam. ↓'] },
          { icon: '🐟', name: 'Omega-3 Protocol', desc: 'Walnuts + chia + flaxseeds. EPA/DHA-derived resolvins actively reduce inflammation.', tags: ['CRP ↓'] },
          { icon: '🫐', name: 'Polyphenols', desc: 'Daily pomegranate + green tea. Inhibit COX-2 enzyme without NSAID side effects.', tags: ['CRP ↓'] },
          { icon: '😴', name: 'Sleep is Anti-Inflammatory', desc: 'Poor sleep raises IL-6 and TNF-α by 40%. 7–8 hrs is more anti-inflammatory than any supplement.', tags: ['Cytokines ↓'] },
          { icon: '🌞', name: 'Vitamin D', desc: '20-min daily sunlight. Vitamin D3 deficiency = elevated CRP. Common in Indian men who work indoors.', tags: ['CRP ↓'] },
        ],
        Female: [
          { icon: '🌺', name: 'Omega-3 + GLA', desc: 'Flaxseeds + evening primrose (for GLA). Omega-3 reduces prostaglandins causing menstrual + systemic inflammation.', tags: ['Period Pain ↓', 'CRP ↓'] },
          { icon: '🫐', name: 'Polyphenol Protocol', desc: 'Berries + pomegranate + amla. Research shows women with PCOS/endometriosis benefit significantly from polyphenols.', tags: ['PCOS', 'CRP ↓'] },
          { icon: '🥗', name: 'Anti-Inflammatory Diet', desc: 'Low-glycaemic + high-omega-3. Inflammatory diet is a key driver of PCOS and female hormonal conditions.', tags: ['Systemic Inflam. ↓'] },
          { icon: '😴', name: 'Sleep + Circadian Rhythm', desc: 'Disrupted sleep raises IL-6 and worsens autoimmune conditions in women. Consistent 8-hr sleep is essential.', tags: ['Cytokines ↓'] },
          { icon: '🌞', name: 'Vitamin D', desc: 'Critical for immune regulation in women. Deficiency worsens autoimmune, PCOS and inflammatory conditions.', tags: ['Immune Balance'] },
        ],
      },
      Ayurvedic: {
        Male: [
          { icon: '🪷', name: 'Shallaki (Boswellia)', desc: 'Dual COX-2 and 5-LOX inhibitor. Most powerful Ayurvedic anti-inflammatory for joint and heart.', tags: ['Joint Pain ↓'] },
          { icon: '🟡', name: 'Turmeric + Ghee', desc: 'Curcumin dissolved in fat for maximum absorption. Ancient pitta-reducing recipe.', tags: ['CRP ↓'] },
          { icon: '🌿', name: 'Guduchi (Giloy)', desc: 'Immunomodulator — reduces autoimmune inflammation without suppressing immunity.', tags: ['Immune Balance'] },
          { icon: '🍵', name: 'Rasayana Kadha', desc: 'Ginger + tulsi + cinnamon + black pepper boiled together. Traditional daily anti-inflammatory decoction.', tags: ['Systemic Inflam. ↓'] },
          { icon: '🌸', name: 'Neem Blood Purification', desc: '4–5 neem leaves on empty stomach. Removes ama (toxic metabolites) — Ayurvedic root of inflammation.', tags: ['Ama ↓'] },
        ],
        Female: [
          { icon: '🌸', name: 'Shatavari + Turmeric', desc: 'Shatavari reduces oestrogen-driven inflammation; turmeric reduces systemic CRP. Classic female formula.', tags: ['Hormonal Inflam. ↓'] },
          { icon: '🪷', name: 'Shallaki (Boswellia)', desc: 'Reduces prostaglandins causing menstrual pain and endometriosis inflammation.', tags: ['Period Pain ↓'] },
          { icon: '🌺', name: 'Lodhra + Guduchi', desc: 'Lodhra is anti-inflammatory for the female reproductive tract. Guduchi is a systemic immunomodulator.', tags: ['Pelvic Inflam. ↓'] },
          { icon: '🍵', name: 'Hibiscus + Tulsi Kadha', desc: 'Hibiscus + tulsi + ginger boiled. Reduces blood pressure, inflammation and cortisol in women.', tags: ['CRP ↓', 'Cortisol ↓'] },
          { icon: '🧘', name: 'Yoga Nidra', desc: 'Deep relaxation reduces IL-6 and cortisol. Autoimmune women show measurable CRP reduction with 30-min practice.', tags: ['Cytokines ↓'] },
        ],
      },
    },
    foodsToEat: {
      Male: ['Turmeric', 'Ginger', 'Garlic', 'Amla', 'Pomegranate', 'Walnuts', 'Flaxseeds', 'Olive Oil', 'Leafy Greens', 'Green Tea', 'Dark Chocolate (70%+)', 'Almonds', 'Beets', 'Shallaki', 'Giloy', 'Tomatoes'],
      Female: ['Turmeric', 'Ginger', 'Flaxseeds', 'Amla', 'Pomegranate', 'Berries', 'Hibiscus Tea', 'Walnuts', 'Chia Seeds', 'Olive Oil', 'Leafy Greens', 'Green Tea', 'Broccoli', 'Shatavari', 'Guduchi', 'Sesame Seeds'],
    },
    foodsToAvoid: ['Trans Fats (Dalda, Vanaspati)', 'Refined Vegetable Oils', 'Refined Sugar', 'Maida', 'Processed Meats', 'Alcohol', 'Excess Omega-6 Oils', 'Artificial Additives', 'Fried Snacks', 'Excess Red Meat'],
    tips: {
      Male: [
        { icon: '😴', t: 'Sleep Reduces Inflammation', d: 'Poor sleep raises CRP and IL-6 by 40% in men. 7–8 hrs is more powerful than any anti-inflammatory supplement.' },
        { icon: '🧘', t: 'Stress = Fire', d: 'Chronic stress raises cortisol → which paradoxically increases systemic inflammation long-term.' },
        { icon: '🌞', t: 'Vitamin D Daily', d: '20-min sunlight. Indian men who work indoors are commonly Vitamin D deficient — a major CRP driver.' },
        { icon: '🚶', t: 'Moderate Exercise', d: 'Walking and yoga are anti-inflammatory. Extreme overtraining INCREASES inflammation — balance is key.' },
      ],
      Female: [
        { icon: '🌸', t: 'Hormones Drive Inflammation', d: 'PCOS, endometriosis and perimenopause all have inflammation as a root component. Anti-inflammatory diet addresses all.' },
        { icon: '😴', t: 'Sleep + Autoimmune Risk', d: 'Women are 3× more likely to develop autoimmune conditions. Sleep deprivation is the #1 trigger — protect your sleep.' },
        { icon: '🧘', t: 'Yoga Nidra Practice', d: '30-min yoga nidra reduces inflammatory cytokines measurably. Practice daily, especially premenstrually.' },
        { icon: '🌞', t: 'Vitamin D Critical for Women', d: 'Deficiency worsens PCOS, autoimmune and bone conditions. Daily sunlight + D-rich foods are essential.' },
      ],
    },
  },
};

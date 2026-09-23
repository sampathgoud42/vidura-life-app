// Content ported from the user's Claude artifact
// (public/artifacts/7f9366b2 — "Personalised Health Reset Plan"): a
// gender-aware, multi-goal Indian wellness advisor. Palette shifted to the
// Vidura World "Dawn Garden" forest tones; data kept faithful to the source.

import { C } from './wellnessPalette.js';
export { C };

export function getTodayIdx() {
  return (new Date().getDay() + 6) % 7; // 0=Mon … 6=Sun
}

// ── goals per gender ─────────────────────────────────────────────────────────
export const GOALS_MALE = [
  { id: 'Cholesterol', icon: '🫀', color: C.orange, short: 'Chol.' },
  { id: 'Sugar', icon: '🩸', color: C.green, short: 'Sugar' },
  { id: 'Fertility', icon: '🧬', color: C.teal, short: 'Fertility' },
  { id: 'Gut Health', icon: '🌱', color: C.purple, short: 'Gut' },
  { id: 'Inflammation', icon: '🔥', color: C.pink, short: 'Inflam.' },
];
export const GOALS_FEMALE = [
  { id: 'Cholesterol', icon: '🫀', color: C.orange, short: 'Chol.' },
  { id: 'Sugar', icon: '🩸', color: C.green, short: 'Sugar' },
  { id: 'Fertility', icon: '🧬', color: C.teal, short: 'Fertility' },
  { id: 'Hormonal Balance', icon: '🌸', color: C.rose, short: 'Hormones' },
  { id: 'Gut Health', icon: '🌱', color: C.purple, short: 'Gut' },
  { id: 'Inflammation', icon: '🔥', color: C.pink, short: 'Inflam.' },
];
export function goalColor(g) {
  return [...GOALS_MALE, ...GOALS_FEMALE].find((x) => x.id === g)?.color || C.text2;
}
export function goalIcon(g) {
  return [...GOALS_MALE, ...GOALS_FEMALE].find((x) => x.id === g)?.icon || '';
}

export const AGE_NOTES = {
  Male: {
    '25-30': 'At 25–30, testosterone is near peak. Build strong metabolic habits now — diet, sleep, and exercise done right at this age set the foundation for the next 20 years.',
    '30-35': 'At 30–35, desk jobs and stress start affecting lipids, cortisol and gut health. Prioritise daily movement and reduce processed carbs before the numbers worsen.',
    '35-40': 'At 35–40, testosterone begins its gradual decline and abdominal fat accumulates faster. Strength training + sleep quality are now as important as diet.',
    '40+': 'After 40, cholesterol tends to spike, prostate health becomes relevant, and insulin resistance deepens. Extra attention to zinc, omega-3, fibre and sleep is critical.',
  },
  Female: {
    '25-30': 'At 25–30, focus on building iron stores, bone density, and healthy hormone patterns. This is the best time to address PCOS, thyroid, or cycle irregularities before they compound.',
    '30-35': 'At 30–35, PCOS risk peaks, and insulin resistance can develop silently. Stress management, low-glycaemic eating and gut health are especially important now.',
    '35-40': 'At 35–40, perimenopause begins for some women. Oestrogen fluctuations affect cholesterol and bone health. Phytoestrogen foods, calcium and strength training become essential.',
    '40+': 'After 40, oestrogen decline sharply raises LDL and cardiovascular risk. Bone density loss accelerates. Calcium, Vitamin D, omega-3 and regular resistance exercise are non-negotiable.',
  },
};

export const MORNING_BASE = [
  '💧 2 glasses warm water immediately on waking — flushes kidneys, activates metabolism',
  '🚶 45-min brisk walk or yoga — the single most powerful intervention for all health goals',
  '🥜 5 soaked almonds + 2 walnuts + 1 tbsp pumpkin seeds before breakfast',
  '🧘 10-min Anulom Vilom pranayama (evening) — lowers cortisol and systemic inflammation',
  '🌙 Dinner by 7:30 PM — 12-hour overnight fast improves all metabolic markers',
];

export const MORNING_GENDER = {
  Male: [
    '🌿 ½ tsp Ashwagandha in warm milk at night — supports testosterone and sperm quality',
    '☀️ 20-min morning sunlight — testosterone production peaks with Vitamin D exposure',
    '🧄 1 raw garlic clove on empty stomach — allicin supports heart health and blood flow',
  ],
  Female: [
    "🌸 Shatavari powder (½ tsp) in warm milk — Ayurveda's premier women's hormone tonic",
    '☀️ 20-min morning sunlight — Vitamin D is critical for hormonal balance and bone health',
    '🫚 1 tsp soaked flaxseeds — phytoestrogens gently support oestrogen balance',
  ],
};

export const EXERCISE_PLAN = [
  '🚶 45-min brisk morning walk + 10-min Anulom Vilom pranayama',
  '🧘 45-min walk + 15-min yoga: 5× Surya Namaskar (improves insulin sensitivity)',
  '🚴 30-min cycling or swimming + stair climbing + Bhramari pranayama',
  '🏋️ 30-min bodyweight strength (squats, push-ups, lunges) + 20-min walk',
  '🌿 45-min outdoor nature walk + Paschimottanasana + spinal twists',
  '🏊 60-min active movement: hike / sports / dance (no sitting >30 min)',
  '🌸 30-min gentle yoga + 30-min walk + full meditation + sleep before 10:30 PM',
];

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const REGIONS = [
  { id: 'North Indian', icon: '🏔️', sub: 'Punjab · Delhi · UP · Rajasthan' },
  { id: 'Telugu', icon: '🌶️', sub: 'Andhra Pradesh · Telangana' },
  { id: 'Tamil', icon: '🌺', sub: 'Tamil Nadu' },
  { id: 'Kerala', icon: '🌴', sub: 'Kerala' },
  { id: 'Bangalore', icon: '🌸', sub: 'Karnataka · Bangalore' },
];

// signature regional dish names layered onto breakfast/lunch/dinner
export const REGION_DISHES = {
  'North Indian': { br: ['Daliya with veggies', 'Besan cheela + mint chutney', 'Vegetable poha'], lu: ['Rajma + bajra roti', 'Sarson ka saag + makki roti', 'Dal tadka + jowar roti'], di: ['Makki roti + light saag', 'Moong khichdi + lauki', 'Bajra roti + palak'] },
  Telugu: { br: ['Pesarattu (moong dosa)', 'Ragi sankati + gongura chutney', 'Vegetable upma'], lu: ['Pappu (dal) + brown rice', 'Jonna roti + gongura pachadi', 'Pulihora (tamarind millet rice)'], di: ['Jonna roti + tomato pulusu', 'Ragi sankati + light pappu', 'Vegetable pulusu + roti'] },
  Tamil: { br: ['Kara pongal (millet)', 'Kambu koozh (pearl-millet porridge)', 'Idli + kollu chutney'], lu: ['Keerai masiyal + brown rice', 'Kollu rasam + thayir sadam', 'Ragi mudde + sambar'], di: ['Kollu rasam + 1 roti', 'Keerai kootu + kambu dosa', 'Kozhukattai + rasam'] },
  Kerala: { br: ['Puttu + kadala curry', 'Appam + vegetable stew', 'Idiyappam + thin coconut milk'], lu: ['Avial + red-rice kanji', 'Olan + brown rice', 'Chembu (taro) curry + rice'], di: ['Rice kanji + payar thoran', 'Ragi puttu + light stew', 'Avial + 1 chapati'] },
  Bangalore: { br: ['Ragi mudde + sambar', 'Set dosa + sagu', 'Akki roti + chutney'], lu: ['Bisi bele bath (light)', 'Jolada roti + ennegayi', 'Ragi mudde + hurulikaalu saaru'], di: ['Ragi mudde + bassaru', 'Jolada roti + palak dal', 'Light bisi bele bath'] },
};

// ── protein data ─────────────────────────────────────────────────────────────
export const PROTEIN_SNACKS = [
  { t: 'Roasted Chana', d: '½ cup dry-roasted chana · ~10g protein · jeera water on the side' },
  { t: 'Moong Sprouts Chaat', d: '1 cup moong sprouts · ~14g protein · lemon + chilli + onion' },
  { t: 'Roasted Chana', d: '½ cup roasted chana · ~10g protein · unsweetened green tea' },
  { t: 'Sprouted Chana Salad', d: '1 cup sprouted chickpeas · ~15g protein · cucumber + lemon + pepper' },
  { t: 'Mixed Sprouts', d: '½ cup moong + chana sprouts · ~12g protein · amla on the side' },
  { t: 'Roasted Chana', d: '½ cup roasted chana · ~10g protein · tulsi-ginger herbal tea' },
  { t: 'Sprouts Bhel', d: '1 cup moong sprouts + onion + tomato + lemon · ~14g protein' },
];
export const AIR_FRY_DINNERS = [
  { t: 'Air Fry Chicken Breast', d: '150g air fry chicken (0 oil) · ~47g protein · side salad + 1 roti' },
  { t: 'Air Fry Salmon Fillet', d: '150g air fry salmon (5 min, 200°C) · ~37g protein · lemon + herbs + brown rice' },
  { t: 'Air Fry Chicken Tikka', d: '150g air fry chicken tikka (no oil marinade) · ~47g protein · mint chutney + 2 bajra rotis' },
  { t: 'Air Fry Salmon + Quinoa Bowl', d: '150g air fry salmon · ~37g protein · ½ cup brown rice + cucumber salad' },
  { t: 'Air Fry Chicken Thigh', d: '150g air fry boneless thigh (200°C, 18 min) · ~43g protein + spinach sabzi' },
  { t: 'Air Fry Salmon with Herbs', d: '150g air fry salmon + turmeric-lemon rub · ~37g protein + 1 jowar roti' },
  { t: 'Air Fry Chicken Breast + Dal', d: '150g air fry chicken · ~47g protein · moong dal + 1 roti' },
];
export const AIR_FRY_LUNCHES = [
  { t: 'Air Fry Chicken + Brown Rice', d: '150g air fry chicken breast · ~47g protein · ½ cup brown rice + raita' },
  { t: 'Air Fry Salmon + Dal', d: '150g air fry salmon · ~37g protein · moong dal + ½ cup brown rice' },
  { t: 'Air Fry Chicken Bowl', d: '150g air fry chicken + veggies · ~47g protein · jowar roti + salad' },
  { t: 'Air Fry Salmon + Millet', d: '150g air fry salmon · ~37g protein · ragi roti + green chutney' },
  { t: 'Air Fry Chicken + Palak Dal', d: '150g air fry chicken · ~47g protein · palak dal + brown rice' },
  { t: 'Air Fry Salmon + Rice', d: '150g air fry salmon · ~37g protein · ½ cup brown rice + rasam' },
  { t: 'Air Fry Chicken Thali', d: '150g air fry chicken · ~47g protein · dal + sabzi + 1 roti' },
];
export const PROTEIN_EST = {
  Vegetarian: [72, 74, 71, 75, 70, 76, 73],
  'Non-Vegetarian': [88, 92, 95, 85, 90, 89, 84],
  Vegan: [70, 73, 71, 74, 70, 75, 71],
};
export const PROTEIN_BREAKDOWN = {
  Vegetarian: [
    ['Oats/Daliya ~8g', 'Moong Dal ~18g', 'Chana Snack ~10g', 'Paneer/Tofu ~18g', 'Curd ~8g', 'Nuts/Seeds ~6g', '= ~68–78g'],
    ['Daliya ~8g', 'Rajma/Dal ~18g', 'Chana Snack ~10g', 'Dal ~18g', 'Curd ~8g', 'Seeds ~6g', '= ~68–78g'],
    ['Smoothie ~10g', 'Chana Dal ~20g', 'Sprouts ~14g', 'Khichdi ~15g', 'Seeds ~6g', 'Curd ~8g', '= ~73g'],
    ['Besan/Moong ~12g', 'Dal ~18g', 'Sprouts/Chana ~12g', 'Paneer ~18g', 'Curd ~8g', 'Nuts ~5g', '= ~73–75g'],
    ['Ragi ~7g', 'Chana Dal ~20g', 'Seeds ~6g', 'Dal ~18g', 'Chana ~10g', 'Khichdi ~12g', '= ~73g'],
    ['Idli ~6g', 'Chole ~15g', 'Chana ~10g', 'Dal ~18g', 'Curd ~11g', 'Seeds ~6g', '= ~66–76g'],
    ['Poha ~5g', 'Dal Thali ~20g', 'Sprouts ~14g', 'Dal ~18g', 'Chana ~10g', 'Curd ~8g', '= ~75g'],
  ],
  'Non-Vegetarian': [
    ['Eggs ~12g', 'Air Fry Chicken ~47g', 'Chana ~10g', 'Dal ~12g', 'Curd ~8g', 'Seeds ~5g', '= ~94g*'],
    ['Eggs ~12g', 'Chicken ~47g', 'Sprouts ~14g', 'Dal ~12g', 'Curd ~8g', 'Nuts ~5g', '= ~98g*'],
    ['Fish ~37g', 'Air Fry Salmon ~37g', 'Chana ~10g', 'Egg ~12g', 'Curd ~8g', 'Seeds ~5g', '= ~109g*'],
    ['Eggs ~12g', 'Chicken/Fish ~40g', 'Sprouts ~14g', 'Dal ~12g', 'Curd ~8g', 'Nuts ~5g', '= ~91g'],
    ['Eggs ~12g', 'Chicken ~47g', 'Chana ~10g', 'Dal ~12g', 'Curd ~8g', 'Seeds ~5g', '= ~94g'],
    ['Eggs ~12g', 'Fish ~37g', 'Sprouts ~14g', 'Dal ~12g', 'Curd ~8g', 'Nuts ~5g', '= ~88g'],
    ['Eggs ~12g', 'Chicken ~47g', 'Chana ~10g', 'Dal ~12g', 'Curd ~8g', 'Seeds ~5g', '= ~94g'],
  ],
  Vegan: [
    ['Tofu/Moong ~14g', 'Dal ~18g', 'Chana ~10g', 'Dal ~18g', 'Seeds ~8g', 'Sprouts ~6g', '= ~74g'],
    ['Tofu ~14g', 'Rajma ~18g', 'Sprouts ~14g', 'Dal ~18g', 'Chana ~10g', 'Seeds ~6g', '= ~80g'],
    ['Oats ~8g', 'Chana Dal ~20g', 'Seeds ~8g', 'Khichdi ~14g', 'Chana ~10g', 'Seeds ~6g', '= ~66–76g'],
    ['Moong ~12g', 'Dal ~18g', 'Sprouts ~14g', 'Dal ~18g', 'Chana ~10g', 'Seeds ~6g', '= ~78g'],
    ['Ragi ~7g', 'Chana Dal ~20g', 'Seeds ~8g', 'Dal ~18g', 'Chana ~10g', 'Seeds ~6g', '= ~69–75g'],
    ['Idli ~6g', 'Chole ~15g', 'Sprouts ~14g', 'Dal ~18g', 'Chana ~10g', 'Seeds ~6g', '= ~69–75g'],
    ['Tofu ~14g', 'Dal ~18g', 'Chana ~10g', 'Dal ~18g', 'Sprouts ~14g', 'Seeds ~6g', '= ~80g'],
  ],
};

const m = (t, d) => ({ t, d });
export const BASE_MEALS = {
  Vegetarian: [
    { theme: 'Detox & Reset 🌱', em: m('Methi + Lemon Water', 'Methi water + warm lemon + garlic clove'), br: m('Oats Upma', 'Rolled oats with carrot, peas, capsicum in olive oil'), mm: m('Amla + Walnuts', 'Fresh amla + 5 soaked walnuts + pumpkin seeds'), lu: m('Brown Rice + Moong Dal', 'Brown rice + moong dal tadka + cucumber-onion salad'), es: m('Roasted Chana', '½ cup roasted chana + warm jeera water'), di: m('Bajra Roti + Palak Sabzi', '2 bajra rotis + spinach-garlic sabzi') },
    { theme: 'Fibre Power 🫘', em: m('Methi + Amla Water', 'Methi water + amla juice + 8 curry leaves chewed'), br: m('Daliya Khichdi', 'Broken wheat khichdi with mixed veggies + small curd'), mm: m('Guava + Cinnamon Water', '1 whole guava + cinnamon water'), lu: m('Rajma + Jowar Roti', 'Rajma curry + 2 jowar rotis + raw veggie salad'), es: m('Makhana', '1 cup roasted makhana with turmeric'), di: m('Moong Dal Soup + Methi Roti', 'Light moong soup + 2 fenugreek rotis') },
    { theme: 'Omega-3 Focus 🫀', em: m('Garlic + Jeera Water', 'Crushed garlic in warm jeera water'), br: m('Walnut Smoothie', 'Banana + 4 walnuts + 200ml low-fat milk blended'), mm: m('Mixed Seeds', '1 tbsp each sunflower + pumpkin + flaxseeds'), lu: m('Chana Dal + Ragi Roti', 'Chana dal (GI 22) + 2 ragi rotis + small curd'), es: m('Sprouts Salad', 'Moong sprouts + lemon + pepper + onion + tomato'), di: m('Vegetable Khichdi', 'Moong dal + brown rice khichdi + ½ tsp ghee') },
    { theme: 'Anti-Inflammatory 🌸', em: m('Turmeric-Ginger Kadha', 'Turmeric + ginger + black pepper in water'), br: m('Moong Dal Chilla', '3 moong chillas with mint chutney'), mm: m('Papaya', '1 cup papaya — papain enzyme aids metabolism'), lu: m('Sambhar + Brown Rice', 'Mixed lentil sambhar + ½ cup brown rice + raita'), es: m('Green Tea + Almonds', 'Masala green tea + 4 almonds'), di: m('Paneer Bhurji + Rotis', 'Low-fat paneer bhurji + 2 flaxseed wheat rotis') },
    { theme: 'Millet Magic 🌾', em: m('Methi + Jamun Seed', 'Methi water + ½ tsp jamun seed powder'), br: m('Ragi Porridge', 'Ragi porridge with cinnamon, unsweetened'), mm: m('Amla-Flax Smoothie', 'Amla + flaxseeds + ginger blended'), lu: m('Toor Dal + Jowar Bhakri', 'Toor dal tadka + 2 jowar bhakris + raw onion'), es: m('Steamed Dhokla', '2 steamed dhokla — fermented, low GI'), di: m('Dalia + Buttermilk', 'Cracked wheat veg soup + jeera buttermilk') },
    { theme: 'Gut Health Day 🫙', em: m('Methi + Tulsi', 'Methi water + 5 tulsi leaves chewed'), br: m('Idli + Sambar', '3 steamed idlis (probiotic) + light sambar + chutney'), mm: m('Pomegranate', '½ pomegranate — polyphenols + anti-inflammatory'), lu: m('Chole + Brown Rice + Raita', 'Chickpea curry + ½ cup brown rice + cucumber raita'), es: m('Curd + Chia Seeds', 'Low-fat curd + 1 tbsp soaked chia seeds'), di: m('Lauki Soup + Roti', 'Bottle gourd soup + ginger + garlic + 1–2 rotis') },
    { theme: 'Renewal ✨', em: m('Super Detox Drink', 'Warm water + lemon + honey + cinnamon + turmeric'), br: m('Flaxseed Poha', 'Brown rice poha + curry leaves + peas + 1 tbsp flaxseeds'), mm: m('Mixed Seasonal Fruit', 'Berries + papaya + pomegranate — whole fruit only'), lu: m('Balanced Thali', 'Brown rice + dal + 2 sabzis + salad + 1 roti'), es: m('Chana + Tulsi Tea', 'Roasted chana + tulsi-ginger herbal tea'), di: m('Light Khichdi', 'Moong-veg khichdi + roasted papad') },
  ],
  'Non-Vegetarian': [
    { theme: 'Detox & Reset 🌱', em: m('Methi + Lemon Water', 'Methi water + warm lemon + crushed garlic'), br: m('Egg White Omelette', '2-egg white omelette + spinach + multigrain toast'), mm: m('Amla + Walnuts', 'Fresh amla + 5 walnuts + 2 tbsp pumpkin seeds'), lu: m('Grilled Fish + Brown Rice', '150g grilled rohu/surmai + ½ cup brown rice + salad'), es: m('Roasted Chana', '½ cup chana + jeera water'), di: m('Bajra Roti + Chicken Curry', '2 bajra rotis + skinless chicken curry, min oil') },
    { theme: 'Protein Power 💪', em: m('Methi + Amla Water', 'Methi water + amla juice + curry leaves'), br: m('Eggs + Daliya', '2 boiled eggs + broken wheat porridge with veggies'), mm: m('Guava + Pumpkin Seeds', '1 whole guava + 1 tbsp pumpkin seeds'), lu: m('Grilled Chicken + Jowar Roti', '150g chicken breast + 2 jowar rotis + salad'), es: m('Sprouts + Curd', 'Moong sprouts in curd — protein + probiotic'), di: m('Fish Soup + Methi Roti', 'Clear fish soup with veggies + 2 methi rotis') },
    { theme: 'Omega-3 Day 🫀', em: m('Garlic + Jeera Water', 'Crushed garlic in warm jeera water'), br: m('Mackerel + Roti', '100g grilled mackerel + 1 multigrain roti — best omega-3 fish'), mm: m('Seeds + Amla', 'Flaxseed + sunflower seeds + amla water'), lu: m('Egg Curry + Brown Rice', '2-egg curry (low oil) + ½ cup brown rice + raita'), es: m('Makhana + Green Tea', '1 cup makhana + unsweetened green tea'), di: m('Grilled Prawns + Khichdi', '100g grilled prawns + moong-veg khichdi') },
    { theme: 'Anti-Inflammatory 🌸', em: m('Turmeric-Ginger Decoction', 'Turmeric + ginger + black pepper in water'), br: m('Scrambled Eggs + Oats', '2-egg scramble with turmeric + oats upma'), mm: m('Papaya', '1 cup papaya — anti-inflammatory enzymes'), lu: m('Chicken Sambhar + Rice', 'Chicken in sambhar + ½ cup brown rice + raita'), es: m('Green Tea + Almonds', 'Ginger-cardamom green tea + 4 almonds'), di: m('Fish Tikka + Roti', '2 grilled fish tikka + 2 flaxseed rotis') },
    { theme: 'Millet Day 🌾', em: m('Methi + Jamun Seed', 'Methi water + ½ tsp jamun seed powder'), br: m('Ragi Dosa + Egg', '2 ragi dosas + 1 boiled egg + coconut chutney'), mm: m('Amla-Flax Smoothie', 'Amla + flaxseeds + ginger blended'), lu: m('Lean Keema + Jowar Bhakri', 'Chicken keema (min oil) + 2 jowar bhakris + salad'), es: m('Steamed Idli', '2 idlis + mint chutney — fermented probiotic'), di: m('Chicken Bone Broth + Dalia', 'Clear chicken broth + veg dalia') },
    { theme: 'Gut Health 🫙', em: m('Methi + Tulsi', 'Methi water + 5 tulsi leaves'), br: m('Egg Bhurji + Toast', '2-egg bhurji + spinach + 1 multigrain toast'), mm: m('Pomegranate + Curd', '½ pomegranate + curd — polyphenols + probiotic'), lu: m('Fish Curry + Brown Rice', 'Light tomato-base fish curry + ½ cup brown rice'), es: m('Chia Curd', 'Homemade curd + 1 tbsp soaked chia seeds'), di: m('Chicken Soup + Roti', 'Thin chicken-vegetable soup + 1 wheat roti') },
    { theme: 'Renewal & Strength ✨', em: m('Super Detox Drink', 'Warm water + lemon + honey + cinnamon + turmeric'), br: m('Flaxseed Poha + Egg', 'Brown rice poha + curry leaves + 1 boiled egg'), mm: m('Mixed Fruit', 'Berries + papaya + pomegranate — whole fruit only'), lu: m('Grilled Chicken Thali', 'Grilled chicken + dal + sabzi + salad + 1 roti'), es: m('Chana + Tulsi Tea', 'Roasted chana + tulsi-ginger tea'), di: m('Light Khichdi + Fish', 'Moong-veg khichdi + 80g steamed fish') },
  ],
  Vegan: [
    { theme: 'Detox & Reset 🌱', em: m('Methi + Lemon + Garlic', 'Methi water + warm lemon + garlic + turmeric'), br: m('Oats Upma (Dairy-free)', 'Oats upma with veggies in olive oil + green tea'), mm: m('Amla + Walnuts + Pumpkin Seeds', 'Fresh amla + walnuts + pumpkin seeds — zinc + omega-3'), lu: m('Brown Rice + Moong Dal', 'Brown rice + moong dal (mustard oil) + raw salad'), es: m('Roasted Chana + Jeera Water', '½ cup roasted chana + warm jeera water'), di: m('Bajra Roti + Palak Sabzi', '2 bajra rotis + spinach-garlic sabzi') },
    { theme: 'Plant Protein 🫘', em: m('Methi + Amla', 'Methi water + amla juice + curry leaves'), br: m('Tofu Scramble + Roti', 'Crumbled tofu scramble with turmeric + 1 multigrain roti'), mm: m('Guava + Mixed Seeds', '1 whole guava + sunflower + pumpkin seeds'), lu: m('Rajma + Jowar Roti', 'Rajma curry (no dairy) + 2 jowar rotis + salad'), es: m('Makhana', '1 cup roasted makhana with turmeric'), di: m('Moong Dal Soup + Methi Roti', 'Moong soup + 2 fenugreek rotis') },
    { theme: 'Omega-3 Focus 🫀', em: m('Garlic + Jeera Water', 'Crushed garlic in warm jeera water'), br: m('Chia Oat Bowl', 'Oats soaked in oat milk + 1 tbsp chia + banana + cinnamon'), mm: m('Mixed Seeds', '1 tbsp each flaxseed + chia + hemp seeds'), lu: m('Chana Dal + Ragi Roti', 'Chana dal (GI 22) + 2 ragi rotis'), es: m('Sprouts Salad', 'Moong + chana sprouts + lemon + pepper + onion'), di: m('Vegetable Khichdi', 'Moong + brown rice khichdi + ½ tsp coconut oil') },
    { theme: 'Anti-Inflammatory 🌸', em: m('Turmeric-Ginger Kadha', 'Turmeric + ginger + black pepper in water'), br: m('Moong Dal Chilla', '3 moong chillas with mint chutney — high protein'), mm: m('Papaya + Ginger', '1 cup papaya + pinch ginger powder'), lu: m('Vegan Sambhar + Brown Rice', 'Lentil sambhar (no ghee) + ½ cup brown rice'), es: m('Green Tea + Almonds', 'Masala green tea + 4 almonds'), di: m('Tofu Bhurji + Rotis', 'Tofu bhurji + turmeric + black pepper + 2 wheat rotis') },
    { theme: 'Millet Day 🌾', em: m('Methi + Jamun Seed', 'Methi water + ½ tsp jamun seed powder'), br: m('Ragi Porridge (Dairy-free)', 'Ragi in oat milk + cinnamon, no sugar'), mm: m('Amla-Flax Smoothie', 'Amla + flaxseeds + water + ginger blended'), lu: m('Toor Dal + Jowar Bhakri', 'Toor dal tadka + 2 jowar bhakris + raw onion'), es: m('Steamed Dhokla', '2 steamed dhokla — fermented, low GI'), di: m('Dalia Soup', 'Cracked wheat vegetable soup + roasted papad') },
    { theme: 'Gut Health 🫙', em: m('Methi + Tulsi', 'Methi water + 5 tulsi leaves'), br: m('Idli + Vegan Sambar', '3 idlis + vegan sambar (no ghee) + coconut chutney'), mm: m('Pomegranate', "½ pomegranate — nature's statin + anti-inflammatory"), lu: m('Chole + Brown Rice', 'Chickpeas (olive oil) + ½ cup brown rice + kachumber salad'), es: m('Coconut Yoghurt + Chia', 'Vegan coconut yoghurt + 1 tbsp soaked chia seeds'), di: m('Lauki Soup + Roti', 'Bottle gourd soup + garlic + ginger + 1–2 rotis') },
    { theme: 'Renewal ✨', em: m('Super Detox Drink', 'Warm water + lemon + maple syrup + cinnamon + turmeric'), br: m('Flaxseed Poha', 'Brown rice poha + curry leaves + peas + 1 tbsp flaxseeds'), mm: m('Mixed Fruit', 'Berries + papaya + pomegranate — whole fruit only'), lu: m('Vegan Thali', 'Brown rice + dal + 2 sabzis + salad + 1 roti'), es: m('Chana + Tulsi Tea', 'Roasted chana + tulsi-ginger herbal tea'), di: m('Light Khichdi', 'Moong-veg khichdi (no ghee) + roasted papad') },
  ],
};

// ── testosterone secrets (Male + Fertility) ─────────────────────────────────
export const T_SECRETS = [
  { num: '#1', emoji: '🫁', title: 'The Breath Hold', hook: 'Right after waking. Takes 90 seconds.', steps: ['Deep inhale → hold for 30 seconds', 'Mild hypoxia causes stress hormones to spike', 'LH (luteinising hormone) activates — the main switch for testosterone'], fact: 'Climbers living in low-oxygen environments have 60% higher testosterone than sea-level counterparts.', science: 'Hypoxia triggers HIF-1α → stimulates Leydig cells → testosterone surge.', color: '#5AC8FA' },
  { num: '#2', emoji: '🧊', title: 'Targeted Cold Exposure', hook: 'Not a full cold shower. Directly on the scrotum for 60 seconds.', steps: ['Run cold water directly on the scrotal area for 60 seconds', 'The sharp blood rush causes a vasodilatory rebound', 'Testicular temperature drops → T rises up to 3×'], fact: 'Norwegian research: targeted scrotal cooling works ~4× better than full-body cold immersion for testosterone response.', science: 'Sperm and testosterone production both require ~34–35°C (2°C below body temperature). Warming → then rapid cooling creates a powerful thermal stress response.', color: '#64D2FF' },
  { num: '#3', emoji: '💪', title: '20 Push-Ups with Static Pause', hook: "This isn't fitness — it's biochemistry.", steps: ['Do a push-up and hold the bottom position for 3 seconds', 'Complete 20 reps with the pause each time', 'The isometric tension at the bottom is the key — not the rep count'], fact: 'Isometric holds spike growth hormone and testosterone within minutes. Skip the pause = skip the hormonal effect.', science: 'Isometric muscle contractions at 70–80% of max effort trigger acute GH and testosterone release via hypothalamic signalling.', color: '#30D158' },
  { num: '#4', emoji: '🪞', title: 'The Alpha Face', hook: '30 seconds in the mirror. Sounds strange — the neuroscience is real.', steps: ['Stand in front of a mirror for 30 seconds', 'Tight jaw, direct eye contact, slight frown — hold it', 'Your brain interprets your own facial expression as environmental dominance'], fact: "Actors use this before intense scenes. Research on 'power posing' shows cortisol drops and testosterone rises within 2 minutes of adopting dominant postures and expressions.", science: "The brain's mirror neuron system and the hypothalamic-pituitary-adrenal axis respond to proprioceptive feedback — your own face signals status to your own brain.", color: '#BF5AF2' },
];

export const AFFIRMATIONS = [
  { text: 'You are in charge!', sub: 'Every choice you make today is a vote for the healthier you.', emoji: '👑', color: C.yellow },
  { text: "Glad you're taking care of yourself.", sub: "Self-care isn't selfish — it's the smartest thing you can do.", emoji: '🌟', color: C.green },
  { text: 'Small steps. Big results.', sub: 'Consistency beats perfection every single time.', emoji: '🚀', color: C.teal },
  { text: 'Your body is listening.', sub: 'Every meal, every step, every breath — it all counts.', emoji: '🫀', color: C.rose },
  { text: 'Progress, not perfection.', sub: "You showed up today. That's already a win.", emoji: '✨', color: C.purple },
  { text: "You're stronger than you think.", sub: "The fact that you're here proves it.", emoji: '💪', color: C.orange },
  { text: 'Healing is happening.', sub: 'Trust the process. The body knows how to heal.', emoji: '🌱', color: C.green },
  { text: 'Today is a fresh start.', sub: "Yesterday doesn't define your wellness journey — today does.", emoji: '🌅', color: C.yellow },
  { text: 'Fuel your greatness.', sub: 'What you eat today is building the you of tomorrow.', emoji: '⚡', color: C.teal },
  { text: 'You deserve to feel amazing.', sub: 'Not someday — starting right now, one good choice at a time.', emoji: '🌸', color: C.rose },
  { text: 'Your health is your wealth.', sub: 'No investment pays better dividends than the one in your body.', emoji: '💎', color: C.cyan },
  { text: 'Be patient with yourself.', sub: "Real change takes time. You're doing better than you know.", emoji: '🕊️', color: C.purple },
  { text: 'One day at a time.', sub: "You don't have to change everything today. Just today.", emoji: '🗓️', color: C.orange },
  { text: 'Mind. Body. Spirit — aligned.', sub: 'Wellness is a whole-person journey. Keep going.', emoji: '🧘', color: C.green },
  { text: 'You showed up. That matters.', sub: 'Opening this app is the first rep of your day.', emoji: '🏆', color: C.yellow },
];

// ── plan builder ─────────────────────────────────────────────────────────────
import { GOAL_DATA } from './wellnessGoals.js';
export { GOAL_DATA };

export function buildPlan(profile) {
  const { gender, diet, style, goals, region } = profile;
  const dietKey = diet || 'Vegetarian';
  const baseMeals = BASE_MEALS[dietKey] || BASE_MEALS.Vegetarian;
  const styleKey = style === 'Modern' ? 'Modern' : style === 'Ayurvedic' ? 'Ayurvedic' : 'Both';
  const rd = region && REGION_DISHES[region];

  const meals = baseMeals.map((day, i) => {
    const enhanced = { ...day, es: PROTEIN_SNACKS[i] };
    // light regional overlay on breakfast/lunch/dinner titles
    if (rd) {
      for (const slot of ['br', 'lu', 'di']) {
        const dish = rd[slot][i % rd[slot].length];
        enhanced[slot] = { t: dish, d: `${day[slot].d} — regional pick` };
      }
    }
    if (dietKey === 'Non-Vegetarian') {
      if (i % 2 === 0) {
        enhanced.di = AIR_FRY_DINNERS[i];
      } else {
        enhanced.lu = AIR_FRY_LUNCHES[i];
        enhanced.di = AIR_FRY_DINNERS[i];
      }
    }
    return enhanced;
  });

  const allRemedies = [], morningAdds = [], eatSet = new Set(), avoidSet = new Set(), allTips = [];
  goals.forEach((g) => {
    const gd = GOAL_DATA[g];
    if (!gd) return;
    const styleBlock = gd.remedies[styleKey] || gd.remedies.Both || {};
    const list = styleBlock[gender] || styleBlock.Male || [];
    list.forEach((r) => allRemedies.push({ ...r, goal: g, gc: gd.color }));
    (gd.morningAdd?.[gender] || gd.morningAdd?.Male || []).forEach((a) => morningAdds.push({ text: a, goal: g }));
    (gd.foodsToEat?.[gender] || gd.foodsToEat?.Male || []).forEach((f) => eatSet.add(f));
    const avoidList = Array.isArray(gd.foodsToAvoid) ? gd.foodsToAvoid : (gd.foodsToAvoid?.[gender] || gd.foodsToAvoid?.Male || []);
    avoidList.forEach((f) => avoidSet.add(f));
    (gd.tips?.[gender] || gd.tips?.Male || []).forEach((t) => allTips.push({ ...t, goal: g }));
  });
  return { meals, allRemedies, morningAdds, foodsToEat: [...eatSet], foodsToAvoid: [...avoidSet], allTips };
}

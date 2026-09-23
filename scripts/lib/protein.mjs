/**
 * Approximate protein (grams) for a home-style Indian menu item, from its text.
 *
 * The description is split into components ("2 bajra rotis", "150g chicken",
 * "½ cup brown rice", "Rajma curry"); every food named in a component is matched
 * against a table of typical home servings and scaled by any count, weight, cup
 * or tablespoon given. Values are round, everyday estimates (IFCT 2017 / USDA
 * ballpark). Meat and fish weights are read as raw weights. Shown in the app as
 * "≈ N g protein".
 */

// A rule: pattern, grams, unit, options.
//   "each"    grams per piece × a leading count ("3 idlis"), default `def` pieces
//   "100g"    grams per 100 g (raw) × a given weight ("150g chicken"), else `def` grams
//   "serving" grams per typical katori / bowl / glass; `cup` = grams per cup if a cup amount is given
//   "tbsp"    grams per tablespoon × a given amount, default `def` tbsp
// `absorb` removes words the dish already accounts for ("egg curry" → no extra "curry");
// `meat` marks meat/fish, whose thali portions are smaller.
const r = (re, g, unit = "serving", opts = {}) => ({ re, g, unit, ...opts });
const B = (s) => new RegExp(`\\b(?:${s})\\b`);

const GRAVY = "curry|kura|kuzhambu|kozhambu|kulambu|saalan|salan|stew|molee|pulusu|roast|fry|stir-fry|iguru|thoran|palya|varuval|gravy|tikka|mulagushyam|masala";

const RULES = [
  // ── Eggs, meat, fish ──────────────────────────────────────────────────────
  r(/(\d+)[- ]egg[- ]white|\begg[- ]whites?\b/, 3.6, "each", { def: 2, absorb: B("omelette|scramble") }),
  r(/(\d+)[- ]egg\b|\beggs?\b|\banda\b/, 6.3, "each", { def: 1, egg: true, absorb: B(`${GRAVY}|bhurji|scramble|omelette|stuffed|boiled`) }),
  r(B("chicken tangri|tangri"), 13, "each", { def: 2, meat: true, absorb: B(`chicken|grilled|${GRAVY}`) }),
  r(B("chicken keema|keema"), 20, "serving", { meat: true, absorb: B(`chicken|lean|matar|${GRAVY}`) }),
  r(/\b(?:boneless )?(?:chicken )?thigh\b/, 20, "100g", { def: 20, meat: true, absorb: B(`chicken|air fry|boneless|${GRAVY}`) }),
  r(B("chicken (?:bone )?broth|chicken(?:-vegetable)? (?:soup|broth)|chicken shorba|murgh shorba|murgi shorba|kodi soup|clear kodi soup"), 8, "serving", { meat: true }),
  r(B("chicken (?:pepper )?rasam|chicken saaru|kozhi rasam"), 9, "serving", { meat: true }),
  r(B("mutton saaru|mutton rasam|mutton broth"), 8, "serving", { meat: true }),
  r(B("chicken dal|kodi pappu"), 18, "serving", { meat: true }),
  r(B("chicken sambh?ar|kodi sambar"), 15, "serving", { meat: true, absorb: B("sambh?ar") }),
  r(B("(?:air fry |grilled )?chicken breast|air fry chicken|grilled chicken|grilled murgh|tandoori murgh|chicken tikka"), 23, "100g", { def: 23, meat: true, absorb: B(`chicken|grilled|air fry|${GRAVY}|veggies`) }),
  r(B("chicken|murgh|murgi|kodi|kozhi|kari"), 20, "serving", { meat: true, absorb: B(`${GRAVY}|nadan|nati|chettinad-lite|skinless|light|dry(?:-spiced)?|pepper|in`) }),
  r(B("salmon"), 20, "100g", { def: 20, meat: true, absorb: B("fillet|air fry") }),
  r(B("mackerel|karimeen|pearl spot|kane fish|kane"), 19, "100g", { def: 17, meat: true, absorb: B(`fish|grilled|${GRAVY}`) }),
  r(B("fish (?:pepper )?(?:soup|rasam)|meen rasam|fish saaru|clear fish soup"), 9, "serving", { meat: true, absorb: B("fish") }),
  r(B("fish tikka"), 8, "each", { def: 2, meat: true, absorb: B("grilled|fish") }),
  r(B("prawns?|royyala"), 20, "100g", { def: 18, meat: true, absorb: B(`${GRAVY}|dry|coconut|tamarind|grilled`) }),
  r(B("fish|meen|macchi|chepa|rohu|surmai"), 18, "100g", { def: 17, meat: true, absorb: B(`${GRAVY}|grilled|steamed|fish|light|tomato-base|tamarind|coconut|kerala|mustard base|min oil|rohu|surmai|meen`) }),

  // ── Dairy & soy ───────────────────────────────────────────────────────────
  r(B("paneer bhurji"), 18, "serving", { absorb: B("low-fat|paneer") }),
  r(B("palak paneer"), 14, "serving", { absorb: B("low-fat|palak") }),
  r(B("paneer"), 14, "serving"),
  r(B("tofu (?:scramble|bhurji)|crumbled tofu"), 12, "serving", { absorb: B("tofu|scramble|bhurji") }),
  r(B("tofu"), 9, "serving"),
  r(B("coconut (?:curd|yoghurt) rice|coconut yoghurt rice|thayir sadam \\(coconut curd\\)"), 3, "serving", { absorb: B("coconut|curd|yoghurt|rice") }),
  r(B("coconut (?:yoghurt|dahi|curd)"), 0.5, "serving"),
  r(B("curd rice|thayir sadam|mosaru chitranna"), 7, "serving", { absorb: B("curd|rice|mustard") }),
  r(/(\d+)\s*ml (?:low-fat )?milk|\blow-fat milk\b/, 3.4, "100g", { def: 7 }),
  r(B("oat milk|almond milk"), 1, "serving"),
  r(B("soy milk"), 6, "serving"),
  r(B("buttermilk curry|mor kuzhambu"), 3, "serving", { absorb: B("buttermilk|curry") }),
  r(B("buttermilk|majjiga|chaas"), 2, "serving"),
  r(B("raita"), 3, "serving", { absorb: B("cucumber") }),
  r(B("curd|dahi|perugu|thayir|mosaru|yoghurt|yogurt"), 4, "serving", { absorb: B("homemade|low-fat|spiced|plain") }),

  // ── Dals, legumes, sprouts ────────────────────────────────────────────────
  r(B("roasted chana|dry-roasted chana|chana"), 10, "serving", { cup: 20, only: /\b(?:roasted|chana \+|½ cup chana|0\.5 cup chana)\b|^(?:0\.5 cup )?chana$/ }),
  r(B("sprouted chickpeas|sprouted chana"), 9, "serving", { cup: 9 }),
  r(B("mixed sprouts"), 8, "serving", { cup: 8 }),
  r(B("moong sprouts|pesara sprouts|sprouts"), 7, "serving", { cup: 7, absorb: B("moong|pesara") }),
  r(B("peanut sundal"), 7, "serving"),
  r(B("sundal|kadle usli|kadle|boiled chickpeas|boiled chana|seasoned boiled chickpeas"), 7, "serving", { absorb: B("boiled|moong|seasoned|chickpeas") }),
  r(B("horse gram soup|hurulikaalu soup"), 7, "serving", { absorb: B("boiled|horse gram|hurulikaalu") }),
  r(B("horse gram rasam|kollu rasam|hurulikaalu saaru"), 5, "serving"),
  r(B("kollu chutney|horse gram chutney"), 2, "serving"),
  r(B("egg-stuffed pesarattu|egg pesarattu"), 9, "serving"),
  r(B("pesarattu|moong crepe|green moong crepe"), 9, "serving"),
  r(B("moong (?:dal )?chillas?|moong dal chilla"), 6, "each", { def: 3 }),
  r(B("besan cheelas?|besan chillas?"), 5, "each", { def: 2 }),
  r(B("pesara vada|moong vada"), 6, "serving", { absorb: B("baked") }),
  r(B("dhoklas?"), 3, "each", { def: 2, absorb: B("steamed") }),
  r(B("rajma"), 8, "serving", { absorb: B("curry") }),
  r(B("chole|chickpea curry|chickpeas|kadala|black chana|black chickpea"), 8, "serving", { absorb: B("curry") }),
  r(B("bassaru|bassar"), 6, "serving", { absorb: B("lentil-spinach|lentil|spinach") }),
  r(B("kootu"), 4, "serving"),
  r(B("sambh?ar"), 5, "serving", { absorb: B("mixed lentil|lentil|vegetable|veg|okra|vendakkai|andhra|vegan|light") }),
  r(B("moong (?:dal )?soup|pappu soup|pesara pappu soup"), 6, "serving"),
  r(B("moong (?:dal )?kanji|green moong porridge"), 8, "serving"),
  r(B("sabudana(?: khichdi)?"), 5, "serving", { absorb: B("khichdi|peanuts?") }),
  r(B("daliya khichdi|khichdi"), 9, "serving", { absorb: B("moong(?: dal)?|moong-veg|brown rice|rice|jowar|bajra|veg|veggies|daliya|broken wheat|light") }),
  r(B("pongal"), 7, "serving", { absorb: B("moong(?: dal)?|moong-veg|brown rice|rice|veg|ven|kara|savou?ry|light") }),
  r(B("bisi bele bath"), 8, "serving"),
  r(B("chana dal|senagala pappu"), 8, "serving"),
  r(B("dal|pappu|paruppu|lentils?|cherupayar|green moong|moong|toor|arhar|masoor"), 7, "serving", { absorb: B("dal|pappu|tadka|curry|thoran|moong|green moong|toor|arhar|sesame|nuvvulu|tomato|methi|palak|spinach|bottle gourd|sorakaya|small") }),
  r(B("rasam|saaru"), 1.5, "serving"),

  // ── Nuts & seeds ──────────────────────────────────────────────────────────
  r(B("peanuts?|groundnuts?"), 8, "serving", { cup: 34 }),
  r(B("almonds?"), 0.25, "each", { def: 5 }),
  r(B("walnuts?|akhrot"), 0.6, "each", { def: 4 }),
  r(B("pumpkin(?: seeds?)?"), 2.7, "tbsp", { def: 1, only: /pumpkin(?! erissery| curry)/ }),
  r(B("sunflower(?: seeds?)?"), 1.9, "tbsp", { def: 1 }),
  r(B("hemp(?: seeds?)?"), 3.2, "tbsp", { def: 1 }),
  r(B("chia(?: seeds?)?"), 2, "tbsp", { def: 1 }),
  r(B("flaxseed chutney"), 2, "serving"),
  r(B("flax(?:seeds?)?|ground flaxseed"), 1.8, "tbsp", { def: 1 }),
  r(B("til laddu|sesame laddu"), 2, "serving"),
  r(B("sesame(?: seeds?)?|nuvvulu|til"), 1.6, "tbsp", { def: 1 }),
  r(B("makhana"), 3, "serving", { cup: 3 }),

  // ── Grains & breads ───────────────────────────────────────────────────────
  r(B("rava idlis?"), 2.5, "each", { def: 2 }),
  r(B("idlis?"), 2, "each", { def: 2, absorb: B("steamed|stuffed") }),
  r(B("(?:ragi |set |egg )?dosas?"), 2.5, "each", { def: 1 }),
  r(B("idiyappam"), 1.5, "each", { def: 2 }),
  r(B("appams?"), 1.5, "each", { def: 2 }),
  r(B("kozhukattai|rice dumplings?"), 1.5, "each", { def: 2, absorb: B("steamed") }),
  r(B("akki rotis?|rice roti|rice flour flatbread"), 3.5, "each", { def: 1 }),
  r(B("(?:bajra|jowar|jonna|jolada|makki) (?:rotis?|bhakris?)|bhakris?"), 4, "each", { def: 1 }),
  r(B("(?:ragi|multigrain|methi|fenugreek|flaxseed wheat|flaxseed|wheat|small)? ?(?:rotis?|chapathis?|chapatis?|theplas?)"), 3, "each", { def: 1 }),
  r(B("multigrain toast|toast"), 3.5, "each", { def: 1 }),
  r(B("puttu"), 3.5, "serving", { absorb: B("steamed|ragi|finger millet|egg-stuffed") }),
  r(B("upma"), 5, "serving", { absorb: B("oats?|rolled oats|semolina|semolina/oats|veggies|mixed") }),
  r(B("oats|rolled oats|chia oat bowl"), 5, "serving"),
  r(B("ragi dalia|ragi porridge|ragi java|ragi kanji|ragi ambali|ragi|kambu(?: koozh)?|koozh|ambali|java|sankati|mudde|finger millet(?: balls| porridge)?"), 3, "serving", { absorb: B("porridge|balls|dalia|koozh|kanji|ambali|java|sankati|mudde|finger millet") }),
  r(B("daliya|dalia|broken wheat|cracked wheat"), 5, "serving", { absorb: B("porridge|soup|vegetable|veg") }),
  r(B("poha"), 3, "serving", { absorb: B("brown rice") }),
  r(B("rice kanji|kanji|rice porridge"), 3, "serving"),
  r(B("little millet(?: rice)?|samai(?: rice)?"), 3.5, "serving"),
  r(B("pulihora|tamarind rice"), 3, "serving"),
  r(B("kesari bath|rava kesari"), 2, "serving"),
  r(/\b(?:brown )?rice\b/, 2.5, "serving", { cup: 5 }),

  // ── Vegetables, fruit, sides ──────────────────────────────────────────────
  r(B("sarson ka saag|mustard greens saag|saag"), 3, "serving", { absorb: B("mustard greens|sarson") }),
  r(B("olan|erissery"), 3, "serving", { absorb: B("ash gourd-bean|pumpkin-beans|pumpkin") }),
  r(B("avial|aviyal"), 3, "serving", { absorb: B("mixed vegetable|mixed veg") }),
  r(B("palak|spinach|keerai|soppu|palakura|methi leaves|leafy greens?|leafy green|menthya soppu|masiyal"), 2, "serving", { absorb: B("fry|mash|sabzi|rasam|saaru|dal") }),
  r(B("thoran|palya|koora|sabzis?|stew|ennegayi|brinjal|curry|chembu|taro|lauki|bottle gourd|sorakaya|okra|vendakkai|veggies|vegetables?"), 2, "serving", { absorb: B("thoran|palya|koora|sabzis?|stew|ennegayi|brinjal|curry|chembu|taro|root|lauki|bottle gourd|sorakaya|okra|vendakkai|veggies|vegetables?|cabbage|beans|mixed|light|stuffed|small|coconut|thin|milk|peas") }),
  r(B("green peas|peas"), 2, "serving"),
  r(B("guava"), 1.5, "each", { def: 1 }),
  r(B("pomegranate"), 2, "serving"),
  r(B("banana chips"), 1, "serving"),
  r(B("banana|nendran"), 1, "serving"),
  r(B("papaya|berries|mixed fruit|fruit"), 0.7, "serving"),
  r(B("papad"), 2, "serving"),
  r(B("coconut chutney|kobbari(?: pachadi)?"), 1, "serving"),
  r(B("salad|kachumber"), 1, "serving"),
  r(B("methi water|methi seeds?|methi"), 0.5, "serving"),
  r(B("coconut water"), 1.5, "serving"),
];

const FRACTIONS = { "½": 0.5, "¼": 0.25, "¾": 0.75, "⅓": 0.33 };

function normalise(s) {
  return s
    .toLowerCase()
    .replace(/[½¼¾⅓]/g, (m) => ` ${FRACTIONS[m]} `)
    .replace(/(\d+(?:\.\d+)?)\s*[–-]\s*(\d+(?:\.\d+)?)(?=\s)/g, (_, a, b) => String((Number(a) + Number(b)) / 2))
    .replace(/\s+/g, " ")
    .trim();
}

/** Whole-text rewrites before splitting: merge one-dish phrases, drop notes and negations. */
function prepare(detail) {
  return normalise(detail)
    .replace(/~\s*\d+\s*g protein/g, " ")
    .replace(/\s[—–]\s.*$/, "") // " — traditional Andhra", " — high protein" …: notes, not food
    .replace(/\([^)]*\)/g, " ")
    .replace(/\b(?:no|without|skip|not)\s+[a-z/ -]+?(?=,|\s\+\s|\s·|$)/g, " ")
    .replace(/\s+or\s+[a-z ]+?(?=,|\s\+\s|\s·|\s—|$)/g, " ") // "makhana or peanuts" → the first choice
    .replace(/\b[a-z]+ garnish\b|\b\d* ?curry leaves\b/g, " ")
    .replace(/\bsabudana(?: khichdi)? \+ peanuts\b/g, "sabudana-peanut khichdi")
    .replace(/\bmoong \+ chana sprouts\b/g, "mixed sprouts")
    .replace(/\b(\d+(?:\.\d+)? cup )?moong \+ chana sprouts\b/g, "$1mixed sprouts")
    // "Moong dal + brown rice khichdi", "Bajra + moong dal khichdi": one dish
    .replace(/\b(?:moong(?: dal)?|bajra|jowar|brown rice|rice)\s\+\s(?=(?:moong(?: dal)?|bajra|jowar|brown rice|rice|veg)?[\s-]?(?:khichdi|pongal)\b)/g, "")
    .replace(/\begg[- ]stuffed\b/g, "egg")
    .replace(/\s(?:soaked )?in\s(?=(?:spiced |low-fat |homemade |warm )?(?:curd|dahi|perugu|oat milk|milk|coconut water)\b)/g, " + ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitComponents(text) {
  const parts = text
    .replace(/·/g, "+")
    .split(/\s\+\s|,\s|\swith\s|\sand\s|^\+\s/)
    .map((p) => p.replace(/^\+\s*/, "").trim())
    .filter(Boolean);
  // "1 tbsp each sunflower + pumpkin + flaxseeds": the amount applies to every part
  const each = text.match(/(\d+(?:\.\d+)?\s*tbsp)\s+each/);
  if (!each) return parts;
  return parts.map((p) => (/tbsp/.test(p) ? p.replace(/\s*each\b/, "") : `${each[1]} ${p}`));
}

const COUNT = /(?:^|\s)(\d+(?:\.\d+)?)(?:\s|-)(?!g\b|ml\b|cups?\b|tbsp\b|tsp\b|min\b)/;
const countOf = (t) => (t.match(COUNT) ? Number(t.match(COUNT)[1]) : null);
const gramsOf = (t) => (t.match(/(\d+)\s*g\b/) ? Number(t.match(/(\d+)\s*g\b/)[1]) : null);
const cupsOf = (t) => (t.match(/(\d+(?:\.\d+)?)\s*cups?\b/) ? Number(t.match(/(\d+(?:\.\d+)?)\s*cups?\b/)[1]) : null);
const tbspOf = (t) => (t.match(/(\d+(?:\.\d+)?)\s*tbsp\b/) ? Number(t.match(/(\d+(?:\.\d+)?)\s*tbsp\b/)[1]) : null);

function amount(rule, text, m, ctx) {
  const small = /\bsmall\b|\btiny\b/.test(text) ? 0.7 : 1;
  const thali = rule.meat && ctx.thali ? 0.7 : 1;
  switch (rule.unit) {
    case "100g": {
      const g = gramsOf(text);
      return g ? (rule.g * g) / 100 : (rule.def ?? rule.g) * thali;
    }
    case "tbsp":
      return rule.g * (tbspOf(text) ?? rule.def ?? 1);
    case "each": {
      let n = rule.egg && m[1] ? Number(m[1]) : countOf(text);
      if (n == null && rule.egg) n = /\beggs\b|bhurji|scramble|omelette|curry|roast|stew|pulusu/.test(text) ? 2 : 1;
      return rule.g * (n ?? rule.def ?? 1) * small * thali;
    }
    default: {
      const cups = rule.cup ? cupsOf(text) : null;
      if (cups != null) return rule.cup * cups;
      return rule.g * small * thali;
    }
  }
}

function componentProtein(raw, ctx) {
  let rest = ` ${raw} `;
  let total = 0;
  for (const rule of RULES) {
    if (rule.only && !rule.only.test(rest.trim())) continue;
    const m = rest.match(rule.re);
    if (!m) continue;
    total += amount(rule, rest, m, ctx);
    rest = rest.replace(new RegExp(rule.re.source, "g"), " ");
    if (rule.absorb) rest = rest.replace(new RegExp(rule.absorb.source, "g"), " ");
    if (!/[a-z]{3,}/.test(rest)) break;
  }
  return total;
}

const DRINK = /\b(?:water|tea|kadha|decoction|drink|juice)\b/;

export function estimateProtein(title, detail) {
  const t = normalise(title);
  if (/\bmixed (?:seasonal )?fruit\b/.test(t)) return 2;
  const ctx = { thali: /\b(?:thali|sadhya)\b/.test(t) };
  let total = 0;
  for (const part of splitComponents(prepare(detail))) total += componentProtein(part, ctx);
  // Nothing recognised in the description? Fall back to the dish name (never for drinks).
  if (total === 0 && !DRINK.test(t)) for (const part of splitComponents(prepare(title))) total += componentProtein(part, ctx);
  return Math.round(total);
}

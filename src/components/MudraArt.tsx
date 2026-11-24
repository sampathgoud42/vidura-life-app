import type { TechniqueId } from "../data/breathwork";

/**
 * Hand-drawn mudra art (AI images got the fingers wrong). Flat vector in the app's
 * style; gentle CSS motion only, which stops for reduced motion.
 */
type Art = "nasika" | "jnana" | "dhyana" | "shanmukhi" | "dirga";

const ART_FOR: Record<TechniqueId, Art> = {
  "nadi-shodhana": "nasika",
  "anulom-vilom": "nasika",
  kapalbhati: "jnana",
  bhastrika: "jnana",
  ujjayi: "jnana",
  coherent: "dhyana",
  bhramari: "shanmukhi",
  dirga: "dirga",
};

export function MudraArt({ id }: { id: TechniqueId }) {
  switch (ART_FOR[id]) {
    case "nasika":
      return <Nasika />;
    case "jnana":
      return <Jnana />;
    case "dhyana":
      return <Dhyana />;
    case "shanmukhi":
      return <Shanmukhi />;
    case "dirga":
      return <Dirga />;
  }
}

/**
 * Nasika mudra, right hand, palm toward you (as in a yoga manual): little and ring fingers
 * straight up, middle and index folded into the palm, thumb out. A glow moves between the
 * thumb tip (closes the right nostril) and the ring-finger tip (closes the left).
 */
function Nasika() {
  return (
    <svg
      className="mudra-art mudra-nasika"
      viewBox="0 0 200 200"
      role="img"
      aria-label="Nasika mudra, right hand: index and middle fingers folded into the palm, ring and little fingers straight, thumb out. The thumb closes the right nostril and the ring finger the left."
    >
      <rect width="200" height="200" rx="22" className="ma-bg" />
      <g className="ma-hand">
        <rect x="74" y="160" width="58" height="40" rx="6" className="ma-skin" />
        <rect x="68" y="178" width="70" height="22" rx="5" className="ma-sleeve" />
        <rect x="52" y="54" width="20" height="62" rx="10" className="ma-skin" />
        <rect x="73" y="32" width="22" height="80" rx="11" className="ma-skin" />
        <rect x="50" y="92" width="100" height="80" rx="26" className="ma-skin" />
        <rect x="96" y="82" width="24" height="26" rx="12" className="ma-skin" />
        <rect x="121" y="86" width="23" height="24" rx="11.5" className="ma-skin" />
        <rect x="98" y="116" width="20" height="16" rx="8" className="ma-fold" />
        <rect x="121" y="118" width="19" height="15" rx="7.5" className="ma-fold" />
        <rect x="140" y="96" width="22" height="60" rx="11" transform="rotate(32 151 156)" className="ma-skin" />
        <path d="M60 146 q30 10 66 -6" className="ma-crease" />
        <path d="M66 158 q22 6 46 0" className="ma-crease" />
      </g>
      <circle cx="84" cy="38" r="9" className="ma-press ma-press-a" />
      <circle cx="182" cy="106" r="9" className="ma-press ma-press-b" />
    </svg>
  );
}

/**
 * Jnana (Chin) mudra, right hand resting on the knee, palm up, seen from the front:
 * index fingertip touches the thumb tip in a ring; middle, ring and little fingers relaxed and straight.
 */
function Jnana() {
  return (
    <svg
      className="mudra-art mudra-jnana"
      viewBox="0 0 200 200"
      role="img"
      aria-label="Jnana mudra: the tip of the index finger touches the tip of the thumb to make a circle; the other three fingers stay straight and relaxed. Hands rest on the knees, palms up."
    >
      <rect width="200" height="200" rx="22" className="ma-bg" />
      {/* Knee */}
      <ellipse cx="100" cy="176" rx="96" ry="36" className="ma-knee" />
      <g className="ma-hand">
        <rect x="30" y="132" width="40" height="30" rx="6" className="ma-sleeve" transform="rotate(-8 50 147)" />
        {/* Palm, facing up */}
        <ellipse cx="96" cy="132" rx="40" ry="26" className="ma-skin" />
        {/* Middle, ring and little fingers: straight, fanned to the right */}
        <rect x="118" y="104" width="62" height="16" rx="8" transform="rotate(-14 118 112)" className="ma-skin" />
        <rect x="122" y="122" width="62" height="15" rx="7.5" className="ma-skin" />
        <rect x="120" y="138" width="54" height="14" rx="7" transform="rotate(12 120 145)" className="ma-skin" />
        {/* Index finger curling up to meet the thumb */}
        <path d="M108 112 C112 86 92 70 78 80" className="ma-finger-line" />
        <path d="M108 112 C112 86 92 70 78 80" className="ma-finger-curve" />
        {/* Thumb rising to meet it */}
        <path d="M70 124 C60 106 62 90 76 82" className="ma-finger-line" />
        <path d="M70 124 C60 106 62 90 76 82" className="ma-finger-curve" />
        <path d="M74 140 q22 8 44 -2" className="ma-crease" />
      </g>
      <circle cx="77" cy="81" r="9" className="ma-press ma-press-steady" />
    </svg>
  );
}

/**
 * Dhyana mudra: both hands resting in the lap, palms up, right hand on top of the left,
 * thumb tips lightly touching above them.
 */
function Dhyana() {
  return (
    <svg
      className="mudra-art mudra-dhyana"
      viewBox="0 0 200 200"
      role="img"
      aria-label="Dhyana mudra: hands rest in the lap, palms up, the right hand on top of the left, with the thumb tips lightly touching."
    >
      <rect width="200" height="200" rx="22" className="ma-bg" />
      {/* Lap */}
      <ellipse cx="100" cy="182" rx="104" ry="44" className="ma-knee" />
      <g className="ma-hand">
        {/* Sleeves */}
        <rect x="2" y="112" width="40" height="34" rx="8" className="ma-sleeve" />
        <rect x="158" y="112" width="40" height="34" rx="8" className="ma-sleeve" />
        {/* Left hand underneath: palm up, fingers pointing to the viewer's right */}
        <rect x="34" y="120" width="132" height="34" rx="17" className="ma-skin ma-under" />
        {/* Right hand on top: palm up, fingers pointing to the viewer's left */}
        <rect x="36" y="108" width="128" height="32" rx="16" className="ma-skin" />
        <path d="M58 118 h84" className="ma-crease" />
        <path d="M56 128 h88" className="ma-crease" />
        {/* Thumbs rising to touch in the middle, making an oval */}
        <path d="M66 112 C70 80 96 74 100 78" className="ma-finger-line" />
        <path d="M66 112 C70 80 96 74 100 78" className="ma-finger-curve" />
        <path d="M134 112 C130 80 104 74 100 78" className="ma-finger-line" />
        <path d="M134 112 C130 80 104 74 100 78" className="ma-finger-curve" />
      </g>
      <circle cx="100" cy="78" r="9" className="ma-press ma-press-steady" />
    </svg>
  );
}

/**
 * Shanmukhi mudra, front view: thumbs close the ear flaps, index fingers rest on the closed
 * eyes, middle fingers beside the nose, ring and little fingers above and below the lips.
 * Soft rings at the lips show the hum.
 */
function Shanmukhi() {
  const side = (flip: boolean) => (
    <g transform={flip ? "translate(200 0) scale(-1 1)" : undefined}>
      {/* Palm and wrist outside the cheek */}
      <rect x="2" y="78" width="34" height="96" rx="16" className="ma-skin" />
      {/* Index finger across the closed eye */}
      <rect x="22" y="66" width="60" height="12" rx="6" className="ma-skin" />
      {/* Middle finger beside the nose */}
      <rect x="22" y="96" width="68" height="12" rx="6" className="ma-skin" />
      {/* Ring finger above the lips, little finger below */}
      <rect x="24" y="120" width="64" height="11" rx="5.5" className="ma-skin" />
      <rect x="26" y="142" width="58" height="10" rx="5" className="ma-skin" />
      {/* Thumb pressing the ear flap closed */}
      <rect x="34" y="84" width="16" height="34" rx="8" className="ma-skin ma-thumb" />
    </g>
  );
  return (
    <svg
      className="mudra-art mudra-shanmukhi"
      viewBox="0 0 200 200"
      role="img"
      aria-label="Shanmukhi mudra: thumbs close the ears, index fingers rest on the closed eyes, middle fingers beside the nose, ring and little fingers around the lips."
    >
      <rect width="200" height="200" rx="22" className="ma-bg" />
      <rect x="70" y="160" width="60" height="40" rx="10" className="ma-neck" />
      <ellipse cx="100" cy="102" rx="56" ry="70" className="ma-face" />
      <ellipse cx="44" cy="96" rx="9" ry="15" className="ma-face" />
      <ellipse cx="156" cy="96" rx="9" ry="15" className="ma-face" />
      <path d="M68 60 q16 -10 30 0" className="ma-brow" />
      <path d="M102 60 q16 -10 30 0" className="ma-brow" />
      <path d="M100 96 L94 122 Q100 126 106 122 Z" className="ma-nose" />
      <path d="M90 136 q10 4 20 0" className="ma-lips" />
      <g className="ma-hum">
        <path d="M84 134 q16 10 32 0" className="ma-wave ma-wave-1" />
        <path d="M78 134 q22 16 44 0" className="ma-wave ma-wave-2" />
      </g>
      <g className="ma-hand">
        {side(false)}
        {side(true)}
      </g>
    </svg>
  );
}

/** Dirga: one hand on the belly, one on the chest; the belly fills first, then the chest. */
function Dirga() {
  return (
    <svg
      className="mudra-art mudra-dirga"
      viewBox="0 0 200 200"
      role="img"
      aria-label="Dirga breath: one hand rests on the belly and one on the chest. Breathe in to fill the belly first, then the ribs, then the chest."
    >
      <rect width="200" height="200" rx="22" className="ma-bg" />
      {/* Head and shoulders */}
      <circle cx="100" cy="30" r="22" className="ma-face" />
      <rect x="88" y="46" width="24" height="14" className="ma-face" />
      {/* Torso */}
      <path d="M44 72 Q48 56 72 56 L128 56 Q152 56 156 72 L150 200 L50 200 Z" className="ma-shirt" />
      {/* Chest and belly: the part that fills */}
      <ellipse cx="100" cy="92" rx="38" ry="18" className="ma-fill ma-fill-chest" />
      <ellipse cx="100" cy="158" rx="40" ry="24" className="ma-fill ma-fill-belly" />
      {/* Hand on the chest (from the viewer's left) */}
      <g className="ma-hand-chest">
        <rect x="16" y="88" width="46" height="18" rx="9" className="ma-sleeve" transform="rotate(-10 40 97)" />
        <rect x="56" y="84" width="74" height="20" rx="10" className="ma-skin" />
        <path d="M76 90 h48 M76 98 h48" className="ma-crease" />
      </g>
      {/* Hand on the belly (from the viewer's right) */}
      <g className="ma-hand-belly">
        <rect x="138" y="152" width="48" height="18" rx="9" className="ma-sleeve" transform="rotate(10 162 161)" />
        <rect x="70" y="148" width="76" height="20" rx="10" className="ma-skin" />
        <path d="M76 154 h48 M76 162 h48" className="ma-crease" />
      </g>
    </svg>
  );
}

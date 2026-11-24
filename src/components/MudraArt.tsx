import type { TechniqueId } from "../data/breathwork";

/**
 * Hand-drawn mudra art, because AI images get the fingers wrong.
 * Nasika mudra, right hand, palm toward you (as in a yoga manual): from the viewer's left,
 * little and ring fingers straight up, middle and index fingers folded into the palm,
 * thumb out to the side. A soft glow moves between the thumb tip (closes the right
 * nostril) and the ring-finger tip (closes the left). CSS motion only; still for reduced motion.
 */
export function MudraArt({ id }: { id: TechniqueId }) {
  if (id !== "nadi-shodhana" && id !== "anulom-vilom") return null;
  return (
    <svg
      className="mudra-art mudra-nasika"
      viewBox="0 0 200 200"
      role="img"
      aria-label="Nasika mudra, right hand: index and middle fingers folded into the palm, ring and little fingers straight, thumb out. The thumb closes the right nostril and the ring finger the left."
    >
      <rect width="200" height="200" rx="22" className="ma-bg" />
      <g className="ma-hand">
        {/* Wrist and sleeve */}
        <rect x="74" y="160" width="58" height="40" rx="6" className="ma-skin" />
        <rect x="68" y="178" width="70" height="22" rx="5" className="ma-sleeve" />
        {/* Little finger (viewer's left), then ring finger: straight up, side by side */}
        <rect x="52" y="54" width="20" height="62" rx="10" className="ma-skin" />
        <rect x="73" y="32" width="22" height="80" rx="11" className="ma-skin" />
        {/* Palm */}
        <rect x="50" y="92" width="100" height="80" rx="26" className="ma-skin" />
        {/* Middle and index fingers folded: knuckles at the top, tips curled onto the palm */}
        <rect x="96" y="82" width="24" height="26" rx="12" className="ma-skin" />
        <rect x="121" y="86" width="23" height="24" rx="11.5" className="ma-skin" />
        <rect x="98" y="116" width="20" height="16" rx="8" className="ma-fold" />
        <rect x="121" y="118" width="19" height="15" rx="7.5" className="ma-fold" />
        {/* Thumb, out to the viewer's right */}
        <rect x="140" y="96" width="22" height="60" rx="11" transform="rotate(32 151 156)" className="ma-skin" />
        {/* Palm creases */}
        <path d="M60 146 q30 10 66 -6" className="ma-crease" />
        <path d="M66 158 q22 6 46 0" className="ma-crease" />
      </g>
      {/* Where each finger presses: thumb → right nostril, ring finger → left nostril */}
      <circle cx="84" cy="38" r="9" className="ma-press ma-press-ring" />
      <circle cx="182" cy="106" r="9" className="ma-press ma-press-thumb" />
    </svg>
  );
}

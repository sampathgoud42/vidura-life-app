import { useReducedMotion } from "framer-motion";
import { HAND_POSE, type TechniqueId } from "../data/breathwork";
import { assetUrl } from "../lib/assets";
import { MudraArt } from "./MudraArt";

/**
 * Mudra and posture for a breathing technique. A short muted loop where we have one
 * (a still image when the user prefers reduced motion), then the how-to lines.
 */
export function HandPoseCard({ id, light = false }: { id: TechniqueId; light?: boolean }) {
  const pose = HAND_POSE[id];
  const reduced = useReducedMotion();
  const m = pose.media;
  const art = !m;
  return (
    <section className={`hand-pose ${light ? "hand-pose-light" : ""} ${m || art ? "has-media" : ""}`} aria-label="Hands and posture">
      {m && (
        <div className="hand-pose-media">
          {reduced ? (
            <img src={assetUrl(m.still)} alt={m.alt} loading="lazy" decoding="async" />
          ) : (
            <video
              src={assetUrl(m.video)}
              poster={assetUrl(m.still)}
              aria-label={m.alt}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              disablePictureInPicture
            />
          )}
        </div>
      )}
      {art && (
        <div className="hand-pose-media">
          <MudraArt id={id} />
        </div>
      )}
      <div className="hand-pose-text">
        <p className="hand-pose-h">
          <span aria-hidden="true">🙏</span> Hands: <strong>{pose.mudra}</strong>
        </p>
        <p className="hand-pose-p">{pose.mudraHow}</p>
        {pose.easier && <p className="hand-pose-p hand-pose-easier">{pose.easier}</p>}
        <p className="hand-pose-h">
          <span aria-hidden="true">🧘</span> Posture: <strong>{pose.posture}</strong>
        </p>
        <p className="hand-pose-p">{pose.postureHow}</p>
      </div>
    </section>
  );
}

import { HAND_POSE, type TechniqueId } from "../data/breathwork";
import { assetUrl } from "../lib/assets";
import { MudraArt } from "./MudraArt";

/**
 * Mudra and posture for a breathing technique: a calm full-body pose image, softly
 * blended into the card, then the how-to lines. Where the image can't show the hand
 * clearly, a small accurate hand drawing sits in the corner.
 */
export function HandPoseCard({ id, light = false }: { id: TechniqueId; light?: boolean }) {
  const pose = HAND_POSE[id];
  const img = pose.image;
  return (
    <section className={`hand-pose ${light ? "hand-pose-light" : ""} ${img ? "has-media" : ""}`} aria-label="Hands and posture">
      {img && (
        <figure className="hand-pose-media">
          <img
            src={assetUrl(img.src)}
            srcSet={`${assetUrl(img.src.replace(".webp", "-sm.webp"))} 480w, ${assetUrl(img.src)} 900w`}
            sizes="(min-width: 768px) 260px, 70vw"
            width={900}
            height={1125}
            alt={img.alt}
            loading="lazy"
            decoding="async"
          />
          {pose.inset && (
            <span className="hand-pose-inset" aria-hidden="true">
              <MudraArt id={id} />
            </span>
          )}
        </figure>
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

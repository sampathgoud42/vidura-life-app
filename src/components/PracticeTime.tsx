import { useEffect, useId, useState } from "react";
import { RECOMMENDED_AT, fromHHMM, loadBreathTimes, saveBreathTime, timeCaution, toHHMM, type Technique, type TechniqueId } from "../data/breathwork";
import { formatMinutes } from "../lib/time";
import { Info } from "./Icons";

/** The person's practice times, kept in sync across every open picker. */
export function useBreathTimes(): Partial<Record<TechniqueId, number>> {
  const [times, setTimes] = useState(loadBreathTimes);
  useEffect(() => {
    const on = () => setTimes(loadBreathTimes());
    window.addEventListener("vidura:breath-times", on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener("vidura:breath-times", on);
      window.removeEventListener("storage", on);
    };
  }, []);
  return times;
}

/** "Your practice time": a time picker, the recommended time, and a reset. */
export function PracticeTime({ t, light = false }: { t: Technique; light?: boolean }) {
  const times = useBreathTimes();
  const id = useId();
  const rec = RECOMMENDED_AT[t.id];
  const at = times[t.id] ?? rec;
  const custom = times[t.id] !== undefined;
  const caution = timeCaution(t, at);
  return (
    <div className={`practice-time ${light ? "is-light" : ""}`}>
      <label htmlFor={id} className="practice-time-label">
        Your practice time
      </label>
      <input
        id={id}
        type="time"
        className="practice-time-input"
        value={toHHMM(at)}
        onChange={(e) => {
          const m = fromHHMM(e.target.value);
          if (m !== null) saveBreathTime(t.id, m);
        }}
      />
      {custom ? (
        <button type="button" className="link-btn practice-reset" onClick={() => saveBreathTime(t.id, null)}>
          Reset to recommended ({formatMinutes(rec)})
        </button>
      ) : (
        <span className="practice-rec">Recommended</span>
      )}
      {caution && (
        <p className="practice-caution" role="note">
          <Info size={14} /> {caution}
        </p>
      )}
    </div>
  );
}

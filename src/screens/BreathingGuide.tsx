import { ArrowLeft, Info, Play } from "../components/Icons";
import { PracticeTime, useBreathTimes } from "../components/PracticeTime";
import { SmartImage } from "../components/SmartImage";
import { Display } from "../components/Typography";
import {
  BREATH_DISCLAIMER,
  BREATH_EVIDENCE_LABEL,
  BREATH_SAFETY_ALL,
  RECOMMENDED_AT,
  TABLE_ORDER,
  techniqueById,
  type Technique,
  type TechniqueId,
} from "../data/breathwork";
import { formatMinutes } from "../lib/time";

const ordered = TABLE_ORDER.map((id) => techniqueById(id)!);

/** Every technique: what it's for, when to do it (and when not to), the evidence, and a guided session. */
export function BreathingGuide({ onBack, onTry }: { onBack: () => void; onTry: (id: TechniqueId) => void }) {
  const times = useBreathTimes();
  const sources = [...new Map(ordered.flatMap((t) => t.sources).map((s) => [s.url, s])).values()];
  return (
    <div className="guide-screen breath-guide">
      <header className="screen-head guide-head">
        <button type="button" className="link-btn guide-back" onClick={onBack}>
          <ArrowLeft size={16} /> Back
        </button>
        <Display as="h1" className="t-title">
          <span aria-hidden="true">🌬️</span> Breathing guide
        </Display>
        <p className="lede">
          Eight techniques, what each is good for, the best time to practise, and when not to. Tap any of them for a guided session with voice, sound and
          music.
        </p>
      </header>

      <nav className="chip-row guide-toc" aria-label="Techniques">
        {ordered.map((t) => (
          <a key={t.id} className="chip" href={`#b-${t.id}`}>
            {t.name}
          </a>
        ))}
      </nav>

      <section className="guide-section glass" aria-labelledby="b-compare-h">
        <h2 id="b-compare-h" className="guide-h">
          Comparison and when to practise
        </h2>
        <div className="cond-table-wrap" tabIndex={0} role="region" aria-label="Breathing techniques compared">
          <table className="cond-table breath-table">
            <thead>
              <tr>
                <th scope="col">Technique</th>
                <th scope="col">Primary benefit</th>
                <th scope="col">Best time to practise</th>
              </tr>
            </thead>
            <tbody>
              {ordered.map((t) => (
                <tr key={t.id}>
                  <th scope="row">
                    <a href={`#b-${t.id}`}>{t.name}</a>
                  </th>
                  <td>{t.primary}</td>
                  <td>
                    {t.bestTime}
                    <span className="breath-your-time">{times[t.id] !== undefined ? "Your time" : "Suggested"}: {formatMinutes(times[t.id] ?? RECOMMENDED_AT[t.id])}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="breath-all-safety">
          <p className="breath-safety-h">
            <Info size={16} /> For every technique
          </p>
          <ul>
            {BREATH_SAFETY_ALL.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </section>

      {ordered.map((t) => (
        <TechniqueCard key={t.id} t={t} onTry={() => onTry(t.id)} />
      ))}

      <section className="guide-section" aria-labelledby="b-sources-h">
        <h2 id="b-sources-h" className="guide-h">
          References
        </h2>
        <ol className="cond-sources">
          {sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                {s.label}
              </a>
            </li>
          ))}
        </ol>
      </section>

      <p className="footnote">
        <Info size={14} /> {BREATH_DISCLAIMER}
      </p>
      <button type="button" className="link-btn guide-back guide-back-end" onClick={onBack}>
        <ArrowLeft size={16} /> Back
      </button>
    </div>
  );
}

function TechniqueCard({ t, onTry }: { t: Technique; onTry: () => void }) {
  return (
    <section id={`b-${t.id}`} className="guide-section glass breath-card" aria-labelledby={`b-${t.id}-h`}>
      <div className="breath-card-top">
        <SmartImage slot={t.image} className="breath-card-art" sizes="(min-width: 768px) 200px, 34vw" />
        <div className="breath-card-head">
          <h2 id={`b-${t.id}-h`} className="guide-h">
            <span aria-hidden="true">{t.emoji}</span> {t.name}
          </h2>
          <p className="breath-aka">{t.aka}</p>
          <span className={`ev-tag ev-${t.evidence}`}>{BREATH_EVIDENCE_LABEL[t.evidence]}</span>
          <button type="button" className="btn btn-primary btn-md breath-try" onClick={onTry} aria-label={`Start a guided ${t.name} session`}>
            <Play size={16} /> Try it{t.fast ? "" : ` · ${t.defaultMinutes} min`}
          </button>
        </div>
      </div>
      <p className="guide-p">{t.what}</p>

      <div className="breath-cols">
        <div>
          <h3 className="guide-h3">Benefits</h3>
          <ul className="breath-list">
            {t.benefits.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="guide-h3">How to do it</h3>
          <ol className="breath-list">
            {t.how.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ol>
        </div>
      </div>

      <h3 className="guide-h3">Best time</h3>
      <p className="guide-p">{t.bestTime}</p>
      <PracticeTime t={t} />

      <div className="breath-avoid">
        <h3 className="guide-h3">When NOT to do it</h3>
        <ul className="breath-list">
          {t.avoid.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </div>

      <p className="guide-p breath-evidence">
        <strong>The evidence:</strong> {t.evidenceNote}
      </p>
    </section>
  );
}

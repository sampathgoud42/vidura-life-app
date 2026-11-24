import { ArrowLeft, ArrowRight, Info } from "../components/Icons";
import { SmartImage } from "../components/SmartImage";
import { Display } from "../components/Typography";
import { DEFAULT_PREFS, type CategoryId } from "../data/content";
import { AGE_BANDS, RANGES_NOTE, audienceFromSex, numbersFor, personLabel, sexFromAudience, type AgeBandId, type Sex } from "../data/labRanges";
import { useApp } from "../state/AppState";
import { COUNTRIES, EVIDENCE_LABEL, GUIDE_DISCLAIMER, guidesFor, type ConditionGuide, type CauseStep, type Evidence } from "../data/conditionGuides";

const EV_CLASS: Record<Evidence, string> = { proven: "verdict verdict-recommended", likely: "verdict verdict-optional", experimental: "verdict verdict-mixed" };

const SECTIONS = [
  ["cause", "Root cause"],
  ["numbers", "Your numbers"],
  ["protocol", "What works"],
  ["costs", "Costs"],
  ["plan", "Smart plan"],
  ["food", "Food"],
  ["safety", "Safety"],
  ["sources", "References"],
] as const;

/** Links to every condition guide for the chosen focus areas. */
export function ConditionGuideLinks({ categories, onOpen }: { categories: readonly CategoryId[]; onOpen: (id: string) => void }) {
  const guides = categories.flatMap((c) => guidesFor(c));
  if (!guides.length) return null;
  return (
    <div className="guide-links">
      {guides.map((g) => (
        <button key={g.id} type="button" className="guide-link glass" onClick={() => onOpen(g.id)}>
          <span className="guide-link-emoji" aria-hidden="true">
            {g.emoji}
          </span>
          <span className="guide-link-text">
            <span className="guide-link-title">{g.title}: the evidence guide</span>
            <span className="guide-link-sub">Root cause, what works, costs in 5 countries, a smart plan, safety and references</span>
          </span>
          <ArrowRight size={18} />
        </button>
      ))}
    </div>
  );
}

/**
 * The root cause, drawn as a flow: what feeds the problem (top), then the chain from
 * mechanism to harm, with the treatments that act at each step tagged beside it.
 */
export function RootCauseDiagram({ drivers, chain }: { drivers: string[]; chain: CauseStep[] }) {
  return (
    <figure className="cause-diagram" aria-label="Root cause diagram">
      <div className="cause-drivers">
        <span className="cause-kicker">What feeds it</span>
        <ul>
          {drivers.map((d) => (
            <li key={d} className="cause-driver">
              {d}
            </li>
          ))}
        </ul>
      </div>
      <ol className="cause-chain">
        {chain.map((s, i) => (
          <li key={s.label} className={`cause-step${i === chain.length - 1 ? " is-outcome" : ""}`}>
            <span className="cause-arrow" aria-hidden="true">
              ↓
            </span>
            <div className="cause-row">
              <div className="cause-box">
                <span className="cause-num" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="cause-label">{s.label}</span>
                <span className="cause-detail">{s.detail}</span>
              </div>
              {s.actsHere?.length ? (
                <div className="cause-acts">
                  <span className="cause-acts-k">Acts here</span>
                  {s.actsHere.map((t) => (
                    <span key={t} className="cause-tag">
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </figure>
  );
}

/**
 * Reference ranges for this guide's key tests, personalised by sex (the Health notes
 * setting) and the optional age band, with a short "how to read it".
 */
export function YourNumbers({ guideId }: { guideId: string }) {
  const { profile, updateProfile } = useApp();
  const prefs = profile?.prefs ?? { ...DEFAULT_PREFS };
  const person = { sex: sexFromAudience(prefs.audience), age: prefs.age ?? null };
  const n = numbersFor(guideId, person);
  if (!n) return null;
  const setSex = (v: string) => updateProfile({ prefs: { ...prefs, audience: audienceFromSex(v === "male" || v === "female" ? (v as Sex) : null) } });
  const setAge = (v: string) => {
    const { age: _drop, ...rest } = prefs;
    updateProfile({ prefs: v ? { ...rest, age: v as AgeBandId } : rest });
  };
  return (
    <section id="c-numbers" className="guide-section glass" aria-labelledby="c-numbers-h">
      <h2 id="c-numbers-h" className="guide-h">
        Your numbers: how to read them
      </h2>
      <div className="num-person">
        <p className="num-for">{personLabel(person)}</p>
        <div className="num-pickers">
          <label className="num-pick">
            <span>Sex</span>
            <select value={person.sex ?? ""} onChange={(e) => setSex(e.target.value)}>
              <option value="">Not set</option>
              <option value="male">Man</option>
              <option value="female">Woman</option>
            </select>
          </label>
          <label className="num-pick">
            <span>Age</span>
            <select value={person.age ?? ""} onChange={(e) => setAge(e.target.value)}>
              <option value="">Not set</option>
              {AGE_BANDS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      {!person.sex || !person.age ? <p className="num-hint">Set your sex and age to see the ranges that apply to you. They're saved with your Make it yours settings.</p> : null}

      {n.tests.map((t) => (
        <div key={t.name} className="num-test">
          <h3 className="guide-h3">{t.name}</h3>
          <p className="num-how">{t.how}</p>
          <table className="num-table">
            <thead>
              <tr>
                <th scope="col">Result</th>
                <th scope="col">Range</th>
                <th scope="col">What it means</th>
              </tr>
            </thead>
            <tbody>
              {t.bands.map((b) => (
                <tr key={b.label + b.range} className={`num-row tone-${b.tone}`}>
                  <th scope="row">
                    <span className="num-dot" aria-hidden="true" />
                    {b.label}
                  </th>
                  <td className="num-range">{b.range}</td>
                  <td>{b.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {t.forYou && <p className="num-you">{t.forYou}</p>}
        </div>
      ))}

      <h3 className="guide-h3">How to read your report</h3>
      <ul className="cond-list">
        {n.read.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <p className="num-note">
        <Info size={14} /> {RANGES_NOTE}
      </p>
      <p className="num-src">
        Ranges from:{" "}
        {n.sources.map((src, i) => (
          <span key={src.url}>
            {i > 0 && " · "}
            <a href={src.url} target="_blank" rel="noopener noreferrer">
              {src.label}
            </a>
          </span>
        ))}
      </p>
    </section>
  );
}

export function ConditionGuideScreen({ guide, onBack }: { guide: ConditionGuide; onBack: () => void }) {
  const g = guide;
  const sections = SECTIONS.filter(([id]) => (id !== "food" || g.food) && (id !== "numbers" || numbersFor(g.id, { sex: null, age: null })));
  return (
    <div className="guide-screen cond-guide">
      <header className="screen-head guide-head">
        <button type="button" className="link-btn guide-back" onClick={onBack}>
          <ArrowLeft size={16} /> Back
        </button>
        <Display as="h1" className="t-title">
          <span aria-hidden="true">{g.emoji}</span> {g.title}
        </Display>
        <p className="lede">{g.bottomLine}</p>
      </header>

      <nav className="chip-row guide-toc" aria-label="On this page">
        {sections.map(([id, label]) => (
          <a key={id} className="chip" href={`#c-${id}`}>
            {label}
          </a>
        ))}
      </nav>

      <section id="c-cause" className="guide-section glass" aria-labelledby="c-cause-h">
        <h2 id="c-cause-h" className="guide-h">
          1. Root cause, explained
        </h2>
        <SmartImage slot={g.image} className="guide-hero cond-hero" sizes="(min-width: 1024px) 70vw, 100vw" />
        <p className="guide-p">{g.rootCause.summary}</p>
        <RootCauseDiagram drivers={g.rootCause.drivers} chain={g.rootCause.chain} />
        <h3 className="guide-h3">Where people waste money</h3>
        <ul className="myth-list">
          {g.gimmicks.map((m) => (
            <li key={m.name} className="myth glass">
              <p className="myth-myth">
                <span className="myth-tag">Gimmick</span> {m.name}
              </p>
              <p className="myth-fact">
                <span className="myth-tag fact">Why</span> {m.why}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <YourNumbers guideId={g.id} />

      <section id="c-protocol" className="guide-section" aria-labelledby="c-protocol-h">
        <h2 id="c-protocol-h" className="guide-h">
          2. What actually works
        </h2>
        <ul className="supp-list">
          {g.protocol.map((t) => (
            <li key={t.name} className="supp glass">
              <div className="supp-top">
                <p className="supp-name">{t.name}</p>
                <span className={EV_CLASS[t.evidence]}>{EVIDENCE_LABEL[t.evidence]}</span>
              </div>
              <p className="guide-p">{t.what}</p>
              <dl className="cond-dl">
                <div>
                  <dt>When you'll see results</dt>
                  <dd>{t.timeline}</dd>
                </div>
                <div>
                  <dt>Side effects</dt>
                  <dd>{t.sideEffects}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
        <p className="guide-p cond-exp">
          <span className={EV_CLASS.experimental}>Experimental</span> {g.experimental}
        </p>
      </section>

      <section id="c-costs" className="guide-section glass" aria-labelledby="c-costs-h">
        <h2 id="c-costs-h" className="guide-h">
          3. Costs in five countries
        </h2>
        <p className="guide-p">Rough estimates in US dollars, for comparison only. Check local prices before you buy.</p>
        <div className="cond-table-wrap" tabIndex={0} role="region" aria-label="Cost comparison table">
          <table className="cond-table">
            <thead>
              <tr>
                <th scope="col">Item</th>
                {COUNTRIES.map(([k, label]) => (
                  <th key={k} scope="col">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {g.costs.map((r) => (
                <tr key={r.item}>
                  <th scope="row">{r.item}</th>
                  {COUNTRIES.map(([k]) => (
                    <td key={k}>{r[k]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="guide-p">{g.costNote}</p>
      </section>

      <section id="c-plan" className="guide-section" aria-labelledby="c-plan-h">
        <h2 id="c-plan-h" className="guide-h">
          4. The smart plan
        </h2>
        <div className="cond-plan">
          <div className="glass cond-plan-col">
            <h3 className="guide-h3">Lowest cost</h3>
            <ol className="cond-list">
              {g.plan.budget.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </div>
          <div className="glass cond-plan-col">
            <h3 className="guide-h3">Least effort</h3>
            <ul className="cond-list">
              {g.plan.convenient.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {g.food && (
        <section id="c-food" className="guide-section" aria-labelledby="c-food-h">
          <h2 id="c-food-h" className="guide-h">
            Foods to eat and to avoid
          </h2>
          <div className="cond-plan">
            <div className="glass cond-plan-col">
              <h3 className="guide-h3">Eat often</h3>
              <ul className="cond-list">
                {g.food.eat.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="glass cond-plan-col">
              <h3 className="guide-h3">Avoid or limit</h3>
              <ul className="cond-list">
                {g.food.avoid.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
          <p className="guide-p">{g.food.note}</p>
        </section>
      )}

      <section id="c-safety" className="guide-section glass" aria-labelledby="c-safety-h">
        <h2 id="c-safety-h" className="guide-h">
          5. Safety checklist
        </h2>
        <ul className="cond-list cond-checks">
          {g.safety.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <h3 className="guide-h3">See a doctor promptly if you notice</h3>
        <ul className="cond-list cond-flags">
          {g.redFlags.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>

      <section id="c-sources" className="guide-section" aria-labelledby="c-sources-h">
        <h2 id="c-sources-h" className="guide-h">
          References
        </h2>
        <ol className="cond-sources">
          {g.sources.map((s) =>
            s.url ? (
              <li key={s.label}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.label}
                </a>
              </li>
            ) : (
              <li key={s.label}>{s.label}</li>
            ),
          )}
        </ol>
      </section>

      <p className="footnote">
        <Info size={14} /> {GUIDE_DISCLAIMER}
      </p>
      <button type="button" className="link-btn guide-back guide-back-end" onClick={onBack}>
        <ArrowLeft size={16} /> Back
      </button>
    </div>
  );
}

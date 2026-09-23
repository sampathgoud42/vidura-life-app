import { useEffect, useMemo, useState } from "react";
import { Segmented } from "../components/Controls";
import { CycleRing } from "../components/CycleRing";
import { ArrowLeft, Info, Lock } from "../components/Icons";
import { SmartImage } from "../components/SmartImage";
import { Display } from "../components/Typography";
import { FERTILITY, FOOD_GUIDES, VERDICT_LABEL, type CyclePhaseId, type GuideTip, type TrackingMethod } from "../data/content";
import { CYCLE_MAX, CYCLE_MIN, PERIOD_MAX, PERIOD_MIN, dayKey, estimateCycle, parseDay, validateCycle } from "../lib/cycle";
import { forgetCycle, loadCycle, saveCycle } from "../lib/storage";
import { useApp } from "../state/AppState";
import { FoodGuideCard } from "./TipsSections";

type Who = "women" | "men";
const WHO: { id: Who; label: string; emoji: string }[] = [
  { id: "women", label: "For women", emoji: "♀" },
  { id: "men", label: "For men", emoji: "♂" },
];

const dateFmt = new Intl.DateTimeFormat(undefined, { weekday: "short", day: "numeric", month: "short" });
const fmt = (d: Date) => dateFmt.format(d);
const phaseLabel = (id: CyclePhaseId) => FERTILITY.phases.find((p) => p.id === id)!.label;

const SECTIONS = [
  ["cycle", "Cycle"],
  ["timing", "Best time"],
  ["methods", "Tracking"],
  ["quality", "Health"],
  ["foods", "Foods"],
  ["myths", "Myths"],
  ["supplements", "Supplements"],
  ["doctor", "See a doctor"],
] as const;

/**
 * The fertility guide: cycle and fertile-window estimates, the best time to try,
 * tracking methods with pros and cons, egg / sperm health, foods, myths and facts,
 * over-the-counter supplements with honest evidence ratings, and when to see a doctor.
 */
export function FertilityGuide({ onBack }: { onBack: () => void }) {
  const { prefs } = useApp();
  const [who, setWho] = useState<Who>(prefs.audience === "men" ? "men" : "women");
  const food = FOOD_GUIDES.find((g) => g.category === "fertility")!;
  const myths = FERTILITY.myths.filter((m) => !m.audience || m.audience === who);

  return (
    <div className="guide-screen">
      <header className="screen-head guide-head">
        <button type="button" className="link-btn guide-back" onClick={onBack}>
          <ArrowLeft size={16} /> Back
        </button>
        <Display as="h1" className="t-title">
          Fertility guide
        </Display>
        <p className="lede">{FERTILITY.intro[who]}</p>
        <Segmented label="Show the guide for" options={WHO} value={who} onChange={setWho} className="guide-who" />
      </header>

      <SmartImage slot={FERTILITY.heroes[who]} className="guide-hero" priority sizes="(min-width: 1024px) 70vw, 100vw" />

      <nav className="chip-row guide-toc" aria-label="On this page">
        {SECTIONS.map(([id, label]) => (
          <a key={id} className="chip" href={`#g-${id}`}>
            {label}
          </a>
        ))}
      </nav>

      <section id="g-cycle" className="guide-section glass" aria-labelledby="g-cycle-h">
        <h2 id="g-cycle-h" className="guide-h">
          {who === "women" ? "Your cycle and fertile window" : "Your partner's cycle"}
        </h2>
        <p className="guide-p">
          {who === "women"
            ? "Enter the first day of your last period to see your likely fertile days."
            : "Fill this in together: it shows the days when trying counts most."}
        </p>
        <CycleTool />
      </section>

      <section id="g-timing" className="guide-section" aria-labelledby="g-timing-h">
        <h2 id="g-timing-h" className="guide-h">
          The best time to try
        </h2>
        <TipGrid tips={FERTILITY.timing} />
        <h3 className="guide-h3">Two ways to go about it</h3>
        <ProsCons items={FERTILITY.approaches} />
      </section>

      <section id="g-methods" className="guide-section" aria-labelledby="g-methods-h">
        <h2 id="g-methods-h" className="guide-h">
          Ways to spot ovulation: pros and cons
        </h2>
        <ProsCons items={FERTILITY.methods} />
      </section>

      <section id="g-quality" className="guide-section" aria-labelledby="g-quality-h">
        <h2 id="g-quality-h" className="guide-h">
          {FERTILITY.quality[who].title}
        </h2>
        <p className="guide-p">{FERTILITY.quality[who].lede}</p>
        <TipGrid tips={FERTILITY.quality[who].tips} />
        <h3 className="guide-h3">{who === "women" ? "Special tips for women" : "Special tips for men"}</h3>
        <TipGrid tips={FERTILITY.special[who]} />
      </section>

      <section id="g-foods" className="guide-section" aria-labelledby="g-foods-h">
        <h2 id="g-foods-h" className="guide-h">
          Foods to enjoy and to limit
        </h2>
        <FoodGuideCard guide={food} audience={who} diet={prefs.diet} title="" />
      </section>

      <section id="g-myths" className="guide-section" aria-labelledby="g-myths-h">
        <h2 id="g-myths-h" className="guide-h">
          Myths and facts
        </h2>
        <ul className="myth-list">
          {myths.map((m) => (
            <li key={m.myth} className="myth glass">
              <p className="myth-myth">
                <span className="myth-tag">Myth</span> {m.myth}
              </p>
              <p className="myth-fact">
                <span className="myth-tag fact">Fact</span> {m.fact}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section id="g-supplements" className="guide-section" aria-labelledby="g-supp-h">
        <h2 id="g-supp-h" className="guide-h">
          Over-the-counter supplements
        </h2>
        <p className="guide-p">
          {who === "men" ? FERTILITY.menNote : "What's worth taking, and what the evidence says about the rest."} Always check with your doctor before starting anything.
        </p>
        <ul className="supp-list">
          {FERTILITY.supplements[who].map((s) => (
            <li key={s.name} className={`supp glass supp-${s.verdict}`}>
              <div className="supp-top">
                <span className="supp-icon" aria-hidden="true">
                  {s.icon}
                </span>
                <p className="supp-name">{s.name}</p>
                <span className={`verdict verdict-${s.verdict}`}>{VERDICT_LABEL[s.verdict]}</span>
              </div>
              {s.dose && <p className="supp-dose">{s.dose}</p>}
              <p className="supp-body">{s.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="g-doctor" className="guide-section glass" aria-labelledby="g-doc-h">
        <h2 id="g-doc-h" className="guide-h">
          When to see a doctor
        </h2>
        <ul className="doctor-list">
          {FERTILITY.doctor.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </section>

      <section className="guide-section" aria-labelledby="g-src-h">
        <h2 id="g-src-h" className="guide-h">
          Sources
        </h2>
        <ul className="source-list">
          {FERTILITY.sources.map((s) => (
            <li key={s.label}>
              {s.url ? (
                <a href={s.url} target="_blank" rel="noreferrer noopener">
                  {s.label}
                </a>
              ) : (
                s.label
              )}
            </li>
          ))}
        </ul>
      </section>

      <p className="footnote">
        <Info size={14} /> {FERTILITY.disclaimer}
      </p>
      <button type="button" className="link-btn guide-back guide-back-end" onClick={onBack}>
        <ArrowLeft size={16} /> Back
      </button>
    </div>
  );
}

function TipGrid({ tips }: { tips: readonly GuideTip[] }) {
  return (
    <ul className="guide-tips">
      {tips.map((t) => (
        <li key={t.title} className="guide-tip glass">
          <span className="guide-tip-icon" aria-hidden="true">
            {t.icon}
          </span>
          <div>
            <p className="guide-tip-title">{t.title}</p>
            <p className="guide-tip-body">{t.body}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function ProsCons({ items }: { items: readonly TrackingMethod[] }) {
  return (
    <ul className="method-list">
      {items.map((m) => (
        <li key={m.name} className="method glass">
          <p className="method-name">
            <span aria-hidden="true">{m.icon}</span> {m.name}
          </p>
          <p className="method-how">{m.how}</p>
          <div className="method-cols">
            <div>
              <p className="method-label pro">Pros</p>
              <ul>
                {m.pros.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="method-label con">Cons</p>
              <ul>
                {m.cons.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function CycleTool() {
  const { now, storageOk } = useApp();
  const saved = useMemo(() => loadCycle(), []);
  const [lastStart, setLastStart] = useState(saved?.lastStart ?? "");
  const [cycleLength, setCycleLength] = useState(saved?.cycleLength ?? 28);
  const [periodLength, setPeriodLength] = useState(saved?.periodLength ?? 5);
  const [remember, setRemember] = useState(!!saved);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const minDate = dayKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 365));
  const check = lastStart ? validateCycle({ lastStart, cycleLength, periodLength }, today) : null;
  const est = check?.ok ? estimateCycle(check.value, today) : null;

  // Opt-in only: saved while "Remember" is on, removed as soon as it's switched off.
  useEffect(() => {
    if (!remember) forgetCycle();
    else if (check?.ok) saveCycle(check.value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remember, check?.ok && check.value.lastStart, cycleLength, periodLength]);

  const hint = check && !check.ok ? { date: "Please enter a valid date.", future: "That date is in the future.", old: "Please use a date within the last year." }[check.reason] : "";

  return (
    <div className="cycle-tool">
      <div className="cycle-fields">
        <label className="field">
          <span className="field-label">First day of your last period</span>
          <input
            type="date"
            className="text-input"
            value={lastStart}
            max={dayKey(today)}
            min={minDate}
            onChange={(e) => setLastStart(e.target.value)}
            aria-invalid={!!hint}
            aria-describedby="cycle-hint"
          />
        </label>
        <Stepper label="Usual cycle length" unit="days" value={cycleLength} min={CYCLE_MIN} max={CYCLE_MAX} onChange={setCycleLength} />
        <Stepper label="Period lasts" unit="days" value={periodLength} min={PERIOD_MIN} max={PERIOD_MAX} onChange={setPeriodLength} />
      </div>
      <p id="cycle-hint" className="field-hint" role="status" aria-live="polite">
        {hint}
      </p>

      {est ? (
        <div className="cycle-result" aria-live="polite">
          <CycleRing est={est} />
          <div className="cycle-facts">
            <p className="cycle-now">
              Today is day {est.day}: <strong>{phaseLabel(est.phase)}</strong>
            </p>
            <dl className="cycle-dl">
              <div>
                <dt>Fertile window</dt>
                <dd>
                  {fmt(est.fertileFrom)} to {fmt(est.fertileTo)}
                </dd>
              </div>
              <div>
                <dt>Ovulation (estimated)</dt>
                <dd>{fmt(est.ovulation)}</dd>
              </div>
              <div>
                <dt>Next period, about</dt>
                <dd>{fmt(est.nextPeriod)}</dd>
              </div>
            </dl>
            {est.projected && <p className="cycle-note">Projected forward from {fmt(parseDay(lastStart)!)}, assuming regular {est.cycleLength}-day cycles.</p>}
            <ul className="cycle-legend">
              {FERTILITY.phases.map((p) => (
                <li key={p.id} className={p.id === est.phase ? "is-now" : ""}>
                  <span className={`legend-dot cycle-${p.id}`} aria-hidden="true" />
                  <span>
                    <strong>{p.label}</strong> {p.note}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <p className="cycle-empty">Your estimate will appear here.</p>
      )}

      <label className="remember">
        <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
        <span>
          <Lock size={14} /> Remember these dates on this device only
          {!storageOk && " (this browser is blocking storage, so only until you close the tab)"}
        </span>
      </label>
      <p className="cycle-note">{FERTILITY.cycleNote}</p>
    </div>
  );
}

function Stepper({ label, unit, value, min, max, onChange }: { label: string; unit: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="field stepper" role="group" aria-label={label}>
      <span className="field-label">{label}</span>
      <div className="stepper-row">
        <button type="button" className="icon-btn" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`Fewer ${unit}`}>
          −
        </button>
        <output className="stepper-value" aria-live="polite">
          {value} {unit}
        </output>
        <button type="button" className="icon-btn" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`More ${unit}`}>
          +
        </button>
      </div>
    </div>
  );
}

import { SmartImage } from "../components/SmartImage";
import {
  ACTIVITIES,
  CATEGORIES,
  DAILY_RITUAL,
  HERB_NOTE,
  MORNING_ADDS,
  TRICKS,
  type AudienceId,
  type CategoryId,
  type DietId,
  type FoodGuide,
  type FoodItem,
  type RoutineStep,
} from "../data/content";
import { eligible } from "../lib/plan";
import type { Prefs } from "../lib/storage";
import { formatMinutes } from "../lib/time";

const catOf = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)!;
const forAudience = (a: AudienceId, itemAudience?: "women" | "men") => !itemAudience || a === "everyone" || itemAudience === a;
const audienceTag = (a: AudienceId, itemAudience?: "women" | "men") =>
  itemAudience && a === "everyone" ? <span className="for-tag">{itemAudience === "women" ? "For women" : "For men"}</span> : null;

function CategoryHeading({ id, children }: { id: CategoryId; children?: string }) {
  const c = catOf(id);
  return (
    <h3 className="cat-heading">
      <span aria-hidden="true">{c.emoji}</span> {children ?? c.label}
    </h3>
  );
}

// ── Tricks ───────────────────────────────────────────────────────────────────
const APPROACH_LABEL: Record<Prefs["approach"], string> = {
  both: "A little of each: everyday habits and Ayurvedic rituals",
  modern: "Modern: everyday habits",
  ayurvedic: "Ayurvedic: traditional rituals",
};

export function TricksSection({ cats, prefs }: { cats: readonly CategoryId[]; prefs: Prefs }) {
  return (
    <div className="tips-section">
      <p className="section-lede">
        Small tricks for your focus, picked for your approach. <strong>{APPROACH_LABEL[prefs.approach]}</strong>. You can change it in Settings.
      </p>
      {cats.map((cat) => {
        const list = TRICKS.filter((t) => t.category === cat && t.approach === prefs.approach && forAudience(prefs.audience, t.audience));
        if (!list.length) return null;
        return (
          <section key={cat} className="cat-block" aria-label={`${catOf(cat).label} tricks`}>
            <CategoryHeading id={cat} />
            <ul className="trick-grid">
              {list.map((t) => (
                <li key={t.id} className="trick glass">
                  <span className="trick-icon" aria-hidden="true">
                    {t.icon}
                  </span>
                  <div className="trick-copy">
                    <p className="trick-title">
                      {t.title} {audienceTag(prefs.audience, t.audience)}
                    </p>
                    <p className="trick-body">{t.body}</p>
                    {t.dietNote?.[prefs.diet] && <p className="trick-diet">{t.dietNote[prefs.diet]}</p>}
                    {(t.caution || t.herb) && <p className="trick-caution">{t.caution ?? HERB_NOTE}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

// ── Routines ─────────────────────────────────────────────────────────────────
const stepFits = (s: RoutineStep, prefs: Prefs) => forAudience(prefs.audience, s.audience) && (!s.ayurvedic || prefs.approach !== "modern");

function StepList({ steps, prefs, numbered = false }: { steps: readonly RoutineStep[]; prefs: Prefs; numbered?: boolean }) {
  const Tag = numbered ? "ol" : "ul";
  return (
    <Tag className={`routine-steps ${numbered ? "is-numbered" : ""}`}>
      {steps
        .filter((s) => stepFits(s, prefs))
        .map((s) => (
          <li key={s.text}>
            <span className="routine-icon" aria-hidden="true">
              {s.icon}
            </span>
            <span>
              {s.text} {audienceTag(prefs.audience, s.audience)}
              {s.herb && <span className="routine-herb"> Traditional herb: check with your doctor first.</span>}
            </span>
          </li>
        ))}
    </Tag>
  );
}

export function RoutinesSection({ cats, prefs }: { cats: readonly CategoryId[]; prefs: Prefs }) {
  return (
    <div className="tips-section">
      <section className="routine-card glass" aria-labelledby="ritual-h">
        <h3 id="ritual-h" className="cat-heading">
          <span aria-hidden="true">🌅</span> Every day, whatever your focus
        </h3>
        <StepList steps={DAILY_RITUAL} prefs={prefs} numbered />
      </section>
      {cats.map((cat) => {
        const day = ACTIVITIES.filter((a) => a.categories.includes(cat) && eligible(a, prefs)).sort((a, b) => a.window[0] - b.window[0]);
        const focusDay = ACTIVITIES.filter((a) => a.categories.length === 0 && a.focus?.[cat]).sort((a, b) => a.window[0] - b.window[0]);
        const merged = [...day, ...focusDay].sort((a, b) => a.window[0] - b.window[0]).slice(0, 9);
        return (
          <section key={cat} className="routine-card glass" aria-label={`${catOf(cat).label} routine`}>
            <CategoryHeading id={cat}>{`Your ${catOf(cat).label.toLowerCase()} routine`}</CategoryHeading>
            <p className="routine-sub">Morning add-ons</p>
            <StepList steps={MORNING_ADDS[cat]} prefs={prefs} />
            <p className="routine-sub">Through the day</p>
            <ol className="routine-day">
              {merged.map((a) => (
                <li key={a.id}>
                  <span className="routine-time">{formatMinutes(a.window[0] % 1440)}</span>
                  <span className="routine-what">
                    <strong>{a.title}</strong>
                    {a.focus?.[cat] && <span>{a.focus[cat]}</span>}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        );
      })}
    </div>
  );
}

// ── Foods ────────────────────────────────────────────────────────────────────
const itemFits = (i: FoodItem, audience: AudienceId, diet: DietId) => forAudience(audience, i.audience) && (!i.diets || i.diets.includes(diet));

function FoodList({ items, audience }: { items: readonly FoodItem[]; audience: AudienceId }) {
  return (
    <ul className="food-list">
      {items.map((i) => (
        <li key={i.name}>
          <span className="food-name">
            {i.name} {audienceTag(audience, i.audience)}
          </span>
          {i.note && <span className="food-note">{i.note}</span>}
          {i.protein ? (
            <span className="protein-chip">
              ≈ {i.protein} g protein{i.serving ? ` · ${i.serving}` : ""}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function FoodGuideCard({ guide, audience, diet, title }: { guide: FoodGuide; audience: AudienceId; diet: DietId; title?: string }) {
  const enjoy = guide.enjoy.filter((i) => itemFits(i, audience, diet));
  const limit = guide.limit.filter((i) => itemFits(i, audience, diet));
  return (
    <article className="food-guide" aria-label={title ?? `${catOf(guide.category).label} foods`}>
      {title !== "" && <CategoryHeading id={guide.category}>{title ?? `${catOf(guide.category).label}: foods`}</CategoryHeading>}
      <p className="food-intro">{guide.intro}</p>
      <div className="food-cols">
        <section className="food-col food-enjoy glass" aria-label="Foods to enjoy">
          <SmartImage slot={guide.enjoyImage} className="food-art" sizes="(min-width: 768px) 30vw, 92vw" />
          <h4 className="food-col-title">
            <span aria-hidden="true">✅</span> Enjoy often
          </h4>
          <FoodList items={enjoy} audience={audience} />
        </section>
        <section className="food-col food-limit glass" aria-label="Foods to go easy on">
          <SmartImage slot={guide.limitImage} className="food-art" sizes="(min-width: 768px) 30vw, 92vw" />
          <h4 className="food-col-title">
            <span aria-hidden="true">✋</span> Go easy on
          </h4>
          <FoodList items={limit} audience={audience} />
        </section>
      </div>
    </article>
  );
}

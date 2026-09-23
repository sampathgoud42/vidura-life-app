import { useMemo, useState } from "react";
import { BottomSheet } from "../components/BottomSheet";
import { Chip } from "../components/Controls";
import { Undo } from "../components/Icons";
import { MEAL_SLOTS, type CategoryId, type Meal, type MealSlot } from "../data/content";
import { haptics } from "../lib/device";
import { categoryShort, mealOptions, type MealOption, type OptionGroup } from "../lib/meals";
import type { Prefs } from "../lib/storage";

const GROUPS: { id: OptionGroup; title: string }[] = [
  { id: "yours", title: "More from your kitchen" },
  { id: "protein", title: "Protein picks" },
  { id: "kitchens", title: "From other kitchens" },
];

export function ProteinChip({ grams, delta }: { grams: number; delta?: number }) {
  if (grams < 1) return null;
  return (
    <span className="protein-chip" title="Approximate protein for a typical home serving">
      ≈ {grams} g protein
      {delta ? <b className={delta > 0 ? "up" : "down"}>{delta > 0 ? ` +${delta}` : ` ${delta}`}</b> : null}
    </span>
  );
}

/**
 * Change one meal on today's plate. Alternatives follow the person's diet and
 * kitchen, ranked for their focus areas; the planned meal can always be restored.
 */
export function MealSwapSheet({
  slot,
  current,
  planned,
  prefs,
  categories,
  onPick,
  onClose,
}: {
  slot: MealSlot | null;
  current: Meal | null;
  planned: Meal | null;
  prefs: Prefs;
  categories: readonly CategoryId[];
  onPick: (meal: Meal | null) => void;
  onClose: () => void;
}) {
  const [groupFilter, setGroupFilter] = useState<OptionGroup | "all">("all");
  const [more, setMore] = useState(false);
  const info = MEAL_SLOTS.find((s) => s.id === slot);
  const options = useMemo(() => (slot && current ? mealOptions(prefs, slot, current, categories) : []), [slot, current, prefs, categories]);
  const swapped = !!(current && planned && (current.title !== planned.title || current.detail !== planned.detail));

  const groups = GROUPS.map((g) => ({ ...g, items: options.filter((o) => o.group === g.id) })).filter((g) => g.items.length);
  const visible = groupFilter === "all" ? groups : groups.filter((g) => g.id === groupFilter);
  const limit = more ? 40 : 6;

  return (
    <BottomSheet open={!!slot} onClose={onClose} title={info ? `Change ${info.label.toLowerCase()}` : "Change meal"} className="swap-sheet">
      {current && (
        <div className="swap-current">
          <p className="eyebrow">{swapped ? "Today's choice" : "Planned for today"}</p>
          <p className="swap-current-title">{current.title}</p>
          <p className="swap-current-detail">{current.detail}</p>
          <ProteinChip grams={current.protein} />
          {swapped && planned && (
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                haptics.select();
                onPick(null);
              }}
            >
              <Undo size={16} /> Back to the plan: {planned.title}
            </button>
          )}
        </div>
      )}

      {groups.length > 1 && (
        <div className="chip-wrap swap-filters" role="group" aria-label="Show options from">
          <Chip selected={groupFilter === "all"} onClick={() => setGroupFilter("all")}>
            All ideas
          </Chip>
          {groups.map((g) => (
            <Chip key={g.id} selected={groupFilter === g.id} onClick={() => setGroupFilter(g.id)}>
              {g.title.replace("More from your kitchen", "Your kitchen").replace("From other kitchens", "Other kitchens")}
            </Chip>
          ))}
        </div>
      )}

      {visible.map((g) => (
        <section key={g.id} className="swap-group" aria-labelledby={`swap-${g.id}`}>
          <h3 id={`swap-${g.id}`} className="section-title">
            {g.title}
          </h3>
          <ul className="swap-list">
            {g.items.slice(0, limit).map((o) => (
              <SwapOption key={o.key} option={o} current={current} onPick={() => onPick(o.meal)} />
            ))}
          </ul>
        </section>
      ))}
      {!more && visible.some((g) => g.items.length > limit) && (
        <button type="button" className="link-btn swap-more" onClick={() => setMore(true)}>
          Show more ideas
        </button>
      )}
      <p className="swap-note">Protein figures are rough estimates for typical home portions. Meat and fish weights are raw.</p>
    </BottomSheet>
  );
}

function SwapOption({ option, current, onPick }: { option: MealOption; current: Meal | null; onPick: () => void }) {
  const delta = current ? option.meal.protein - current.protein : 0;
  return (
    <li>
      <button
        type="button"
        className="swap-option"
        onClick={() => {
          haptics.success();
          onPick();
        }}
      >
        <span className="swap-option-top">
          <span className="swap-option-title">{option.meal.title}</span>
          <span className="swap-option-from">{option.label}</span>
        </span>
        <span className="swap-option-detail">{option.meal.detail}</span>
        <span className="swap-option-meta">
          <ProteinChip grams={option.meal.protein} delta={Math.abs(delta) >= 2 ? delta : undefined} />
          {option.fits.slice(0, 2).map((c) => (
            <span key={c} className="fit-chip">
              {categoryShort(c).emoji} {categoryShort(c).short}
            </span>
          ))}
        </span>
      </button>
    </li>
  );
}

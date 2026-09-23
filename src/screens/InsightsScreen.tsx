import { motion, useReducedMotion } from "framer-motion";
import { GlassCard } from "../components/Controls";
import { Lock } from "../components/Icons";
import { RadialStat, StreakRing } from "../components/Rings";
import { SmartImage } from "../components/SmartImage";
import { Display } from "../components/Typography";
import { ACTIVITIES, CATEGORIES, PHASES } from "../data/content";
import { byCategory, byPhase, currentStreak, favouriteActivity, lastSevenDays, mostActivePhase } from "../lib/insights";
import { formatPhaseRange } from "../lib/time";
import { useApp } from "../state/AppState";

export function InsightsScreen() {
  const { log, now, profile, phase } = useApp();
  const reduced = useReducedMotion();
  const days = lastSevenDays(log, now);
  const streak = currentStreak(log, now);
  const week = days.reduce((s, d) => s + d.count, 0);
  const cats = byCategory(log);
  const phases = byPhase(log);
  const top = mostActivePhase(log);
  const fav = favouriteActivity(log);
  const favActivity = fav && ACTIVITIES.find((a) => a.id === fav.id);
  const mine = (profile?.categories ?? []).map((id) => CATEGORIES.find((c) => c.id === id)!);
  const maxCat = Math.max(1, ...mine.map((c) => cats.get(c.id) ?? 0));
  const maxPhase = Math.max(1, ...Object.values(phases));
  const topPhase = top && PHASES.find((p) => p.id === top);

  return (
    <div className="insights-screen">
      <header className="screen-head">
        <Display as="h1" className="t-title">
          Your rhythm
        </Display>
        <p className="lede">
          <Lock size={14} /> Worked out on this device from what you've marked done.
        </p>
      </header>

      <GlassCard className="insight-hero">
        <SmartImage slot={phase.hero} fill className="insight-hero-bg" sizes="(min-width: 1024px) 60vw, 100vw" />
        <div className="insight-hero-inner">
          <StreakRing days={days} streak={streak} size={176} stroke={12} showDays className="streak-ring-lg" />
          <div className="insight-hero-copy">
            <p className="display insight-big">
              {streak} <span>day{streak === 1 ? "" : "s"}</span>
            </p>
            <p className="insight-hero-sub">{streak ? "in a row. Keep it gentle." : log.length ? "Start a new streak today." : "Your streak starts with one small thing."}</p>
            <p className="insight-hero-week">
              {week} completion{week === 1 ? "" : "s"} in the last 7 days
            </p>
          </div>
        </div>
      </GlassCard>

      <div className="insight-grid">
        <GlassCard className="insight-card">
          <h2 className="section-title">By focus</h2>
          {mine.length ? (
            <div className="radial-grid">
              {mine.map((c) => (
                <RadialStat key={c.id} value={cats.get(c.id) ?? 0} max={maxCat} label={c.label} emoji={c.emoji} />
              ))}
            </div>
          ) : (
            <p className="empty">Choose a focus in Settings to see this.</p>
          )}
        </GlassCard>

        <GlassCard className="insight-card">
          <h2 className="section-title">Most active time of day</h2>
          <div className="phase-bars" role="img" aria-label={PHASES.map((p) => `${p.label}: ${phases[p.id]}`).join(", ")}>
            {PHASES.map((p, i) => (
              <div key={p.id} className={`phase-bar ${p.id === top ? "phase-bar-top" : ""}`}>
                <div className="phase-bar-track">
                  <motion.span
                    className="phase-bar-fill"
                    initial={reduced ? false : { scaleY: 0 }}
                    animate={{ scaleY: phases[p.id] / maxPhase || 0.02 }}
                    transition={{ duration: 0.9, delay: 0.06 * i, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <span className="phase-bar-label">{p.label}</span>
              </div>
            ))}
          </div>
          <p className="insight-note">
            {topPhase ? (
              <>
                You're most active in the <strong>{topPhase.label.toLowerCase()}</strong> ({formatPhaseRange(topPhase)}).
              </>
            ) : (
              "Mark an activity as done to see when you're most active."
            )}
          </p>
          {favActivity && fav && (
            <p className="insight-note">
              Most repeated: <strong>{favActivity.title}</strong> × {fav.count}
            </p>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

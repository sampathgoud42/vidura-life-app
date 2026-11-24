/**
 * Voice and music for guided breathing.
 *
 * Voice: short pre-recorded clips ("Breathe in", "Hold", "Breathe out", "Hum gently",
 * the numbers one to ten, a closing line) played on the second each breath phase or
 * count begins, so any inhale / hold / exhale pattern stays in sync with the orb.
 * Each clip's leading and trailing silence is trimmed after decoding.
 *
 * Music: one calm instrumental loop under the voice, faded in and out.
 *
 * Everything loads lazily the first time a breathing session opens, and the
 * AudioContext is resumed from a tap (browser autoplay rules).
 */

import type { VoiceClip } from "../data/breathwork";

export type Cue = "in" | "hold" | "out" | "hum" | "done";
export type ClipName = Cue | VoiceClip | `n${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}`;

const base = () => new URL("assets/audio/", document.baseURI).href;
const CLIPS: ClipName[] = [
  "in", "hold", "out", "hum", "done",
  "n1", "n2", "n3", "n4", "n5", "n6", "n7", "n8", "n9", "n10",
  "inleft", "inright", "outleft", "outright", "belly", "ribs", "chest", "rest", "ready", "kapal", "bellows", "last",
];
const MUSIC_FILE = "music/calm-loop.mp3";
const VOICE_GAIN = 1;
const MUSIC_GAIN = 0.16;

// ── Settings (remembered on this device) ───────────────────────────────────
const SETTINGS_KEY = "vidura.audio";
export interface AudioSettings {
  voice: boolean;
  music: boolean;
}
export function loadAudioSettings(): AudioSettings {
  try {
    const o = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    return { voice: o.voice !== false, music: o.music !== false };
  } catch {
    return { voice: true, music: true };
  }
}
export function saveAudioSettings(s: AudioSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

// ── Engine ──────────────────────────────────────────────────────────────────
interface Clip {
  buf: AudioBuffer;
  start: number;
  dur: number;
  /** Levels every clip to the same soft loudness. */
  gain: number;
}

/** Target loudness (RMS of the spoken part): soft enough to sit just above the music. */
const VOICE_RMS = 0.08;
const FADE_IN = 0.06;
const FADE_OUT = 0.14;

/** Gain that brings a clip's spoken part to VOICE_RMS, within sensible limits. */
function levelGain(buf: AudioBuffer, start: number, dur: number): number {
  const data = buf.getChannelData(0);
  const a = Math.floor(start * buf.sampleRate);
  const b = Math.min(data.length, a + Math.floor(dur * buf.sampleRate));
  let sum = 0;
  let n = 0;
  for (let i = a; i < b; i += 4) {
    // Only count frames with speech in them, so pauses don't drag the level down.
    const v = data[i];
    if (Math.abs(v) > 0.01) {
      sum += v * v;
      n++;
    }
  }
  const rms = n ? Math.sqrt(sum / n) : VOICE_RMS;
  return Math.max(0.1, Math.min(2.5, VOICE_RMS / rms));
}

function trimBounds(buf: AudioBuffer, threshold = 0.012): { start: number; dur: number } {
  const data = buf.getChannelData(0);
  let a = 0;
  let b = data.length - 1;
  while (a < b && Math.abs(data[a]) < threshold) a++;
  while (b > a && Math.abs(data[b]) < threshold) b--;
  const pad = Math.floor(buf.sampleRate * 0.03);
  a = Math.max(0, a - pad);
  b = Math.min(data.length - 1, b + pad);
  return { start: a / buf.sampleRate, dur: Math.max(0.05, (b - a) / buf.sampleRate) };
}

export class BreathAudio {
  private ctx: AudioContext | null = null;
  private clips = new Map<ClipName, Clip>();
  private voiceGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private musicEl: HTMLAudioElement | null = null;
  private loading: Promise<void> | null = null;
  private current: AudioBufferSourceNode | null = null;
  private disposed = false;
  private fxGain: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private tone: { src: AudioScheduledSourceNode[]; gain: GainNode; filter?: BiquadFilterNode; kind: "ocean" | "hum" } | null = null;

  /** Create the audio graph and start fetching. Call from (or right after) a tap. */
  init(): void {
    if (this.ctx || this.disposed) return;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    this.ctx = ctx;
    this.voiceGain = ctx.createGain();
    this.voiceGain.gain.value = VOICE_GAIN;
    this.voiceGain.connect(ctx.destination);
    this.musicGain = ctx.createGain();
    this.musicGain.gain.value = 0;
    this.musicGain.connect(ctx.destination);
    this.fxGain = ctx.createGain();
    this.fxGain.gain.value = 1;
    this.fxGain.connect(ctx.destination);

    const el = new Audio();
    el.src = base() + MUSIC_FILE;
    el.loop = true;
    el.preload = "metadata"; // the 5 MB loop streams only when music plays
    el.crossOrigin = "anonymous";
    this.musicEl = el;
    try {
      ctx.createMediaElementSource(el).connect(this.musicGain);
    } catch {
      el.volume = MUSIC_GAIN; // fallback: plain element volume
    }

    this.loading = Promise.all(
      CLIPS.map(async (name) => {
        try {
          const res = await fetch(base() + `voice/${name}.mp3`);
          const buf = await ctx.decodeAudioData(await res.arrayBuffer());
          const b = trimBounds(buf);
          this.clips.set(name, { buf, ...b, gain: levelGain(buf, b.start, b.dur) });
        } catch {
          /* a missing clip is skipped */
        }
      }),
    ).then(() => undefined);
  }

  /** Browsers start audio suspended until a user gesture; call on taps. */
  resume(): void {
    if (this.ctx?.state === "suspended") void this.ctx.resume();
  }

  get ready(): boolean {
    return this.clips.size > 0;
  }

  whenReady(): Promise<void> {
    return this.loading ?? Promise.resolve();
  }

  /** Speak one clip now, cutting off any clip still playing. Returns false if it could not play yet. */
  say(name: ClipName): boolean {
    const ctx = this.ctx;
    const clip = this.clips.get(name);
    if (!ctx || !clip || !this.voiceGain || ctx.state !== "running") return false;
    try {
      this.current?.stop();
    } catch {
      /* already stopped */
    }
    const src = ctx.createBufferSource();
    src.buffer = clip.buf;
    // Each clip gets its own soft fade-in and fade-out, at the levelled volume.
    const env = ctx.createGain();
    const t0 = ctx.currentTime + 0.01;
    const end = t0 + clip.dur;
    env.gain.setValueAtTime(0, t0);
    env.gain.linearRampToValueAtTime(clip.gain, t0 + Math.min(FADE_IN, clip.dur / 3));
    env.gain.setValueAtTime(clip.gain, Math.max(t0 + FADE_IN, end - FADE_OUT));
    env.gain.linearRampToValueAtTime(0, end);
    src.connect(env).connect(this.voiceGain);
    src.start(t0, clip.start, clip.dur);
    this.current = src;
    return true;
  }

  /** Length of a clip in seconds (0 if not loaded), so countdowns can wait for it. */
  duration(name: ClipName): number {
    return this.clips.get(name)?.dur ?? 0;
  }

  private noiseBuffer(ctx: AudioContext): AudioBuffer {
    if (this.noise) return this.noise;
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    // Brown-ish noise: softer and more breath-like than white noise.
    let last = 0;
    for (let i = 0; i < len; i++) {
      last = (last + 0.04 * (Math.random() * 2 - 1)) / 1.04;
      d[i] = last * 3.2;
    }
    this.noise = buf;
    return buf;
  }

  /** A soft pacing beat: a short breathy puff with a low thump. "in" is a little brighter. */
  beat(kind: "in" | "out"): void {
    const ctx = this.ctx;
    const out = this.fxGain;
    if (!ctx || !out || ctx.state !== "running") return;
    const t = ctx.currentTime + 0.005;
    const n = ctx.createBufferSource();
    n.buffer = this.noiseBuffer(ctx);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = kind === "in" ? 1500 : 850;
    bp.Q.value = 0.9;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.55, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    n.connect(bp).connect(g).connect(out);
    n.start(t, Math.random(), 0.2);
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(kind === "in" ? 180 : 120, t);
    o.frequency.exponentialRampToValueAtTime(kind === "in" ? 140 : 70, t + 0.12);
    const og = ctx.createGain();
    og.gain.setValueAtTime(0.0001, t);
    og.gain.exponentialRampToValueAtTime(0.25, t + 0.01);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
    o.connect(og).connect(out);
    o.start(t);
    o.stop(t + 0.16);
  }

  /** A soft two-note chime, for the start and end of rounds. */
  chime(): void {
    const ctx = this.ctx;
    const out = this.fxGain;
    if (!ctx || !out || ctx.state !== "running") return;
    const t = ctx.currentTime + 0.01;
    [528, 792].forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t + i * 0.12);
      g.gain.exponentialRampToValueAtTime(0.09, t + i * 0.12 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.12 + 2.2);
      o.connect(g).connect(out);
      o.start(t + i * 0.12);
      o.stop(t + i * 0.12 + 2.3);
    });
  }

  /**
   * A background tone that follows the breath: "ocean" (soft filtered noise, Ujjayi)
   * or "hum" (a low drone to hum along with, Bhramari). level 0–1, ramped over secs.
   */
  toneLevel(kind: "ocean" | "hum" | null, level: number, secs = 0.8, bright = 0.5): void {
    const ctx = this.ctx;
    const out = this.fxGain;
    if (!ctx || !out) return;
    if (this.tone && (kind === null || this.tone.kind !== kind)) {
      const old = this.tone;
      this.tone = null;
      const t = ctx.currentTime;
      old.gain.gain.cancelScheduledValues(t);
      old.gain.gain.setValueAtTime(old.gain.gain.value, t);
      old.gain.gain.linearRampToValueAtTime(0, t + 0.6);
      old.src.forEach((s) => {
        try {
          s.stop(t + 0.7);
        } catch {
          /* ignore */
        }
      });
    }
    if (!kind) return;
    if (!this.tone) {
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.connect(out);
      if (kind === "ocean") {
        const n = ctx.createBufferSource();
        n.buffer = this.noiseBuffer(ctx);
        n.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 600;
        filter.Q.value = 0.7;
        n.connect(filter).connect(gain);
        n.start();
        this.tone = { src: [n], gain, filter, kind };
      } else {
        const a = ctx.createOscillator();
        a.type = "sine";
        a.frequency.value = 136.1;
        const b = ctx.createOscillator();
        b.type = "triangle";
        b.frequency.value = 272.2;
        const bg = ctx.createGain();
        bg.gain.value = 0.25;
        a.connect(gain);
        b.connect(bg).connect(gain);
        a.start();
        b.start();
        this.tone = { src: [a, b], gain, kind };
      }
    }
    const t = ctx.currentTime;
    const peak = this.tone.kind === "ocean" ? 0.5 : 0.07;
    const g = this.tone.gain.gain;
    g.cancelScheduledValues(t);
    g.setValueAtTime(g.value, t);
    g.linearRampToValueAtTime(peak * Math.max(0, Math.min(1, level)), t + secs);
    if (this.tone.filter) {
      const f = this.tone.filter.frequency;
      f.cancelScheduledValues(t);
      f.setValueAtTime(f.value, t);
      f.linearRampToValueAtTime(350 + bright * 900, t + secs);
    }
  }

  /** Fade the music loop in (on) or out (off). */
  music(on: boolean): void {
    const ctx = this.ctx;
    const el = this.musicEl;
    const g = this.musicGain;
    if (!ctx || !el || !g) return;
    const t = ctx.currentTime;
    g.gain.cancelScheduledValues(t);
    g.gain.setValueAtTime(g.gain.value, t);
    if (on) {
      void el.play().catch(() => {});
      g.gain.linearRampToValueAtTime(MUSIC_GAIN, t + 2.5);
    } else {
      g.gain.linearRampToValueAtTime(0, t + 0.8);
      window.setTimeout(() => {
        if (g.gain.value < 0.01) el.pause();
      }, 900);
    }
  }

  dispose(): void {
    this.disposed = true;
    this.toneLevel(null, 0);
    try {
      this.current?.stop();
    } catch {
      /* ignore */
    }
    this.musicEl?.pause();
    if (this.musicEl) this.musicEl.src = "";
    void this.ctx?.close().catch(() => {});
    this.ctx = null;
  }
}

/**
 * What to say at a given second of a breath phase: the cue word on the first second,
 * then a countdown (e.g. a 4-second inhale: "Breathe in", "three", "two", "one").
 */
export function clipFor(phase: "in" | "hold" | "out", second: number, length: number, humming: boolean): ClipName | null {
  if (second === 0) return phase === "out" && humming ? "hum" : phase;
  const n = length - second;
  return n >= 1 && n <= 10 ? (`n${n}` as ClipName) : null;
}

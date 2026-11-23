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

export type Cue = "in" | "hold" | "out" | "hum" | "done";
export type ClipName = Cue | `n${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}`;

const base = () => new URL("assets/audio/", document.baseURI).href;
const CLIPS: ClipName[] = ["in", "hold", "out", "hum", "done", "n1", "n2", "n3", "n4", "n5", "n6", "n7", "n8", "n9", "n10"];
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
          this.clips.set(name, { buf, ...trimBounds(buf) });
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
    src.connect(this.voiceGain);
    src.start(ctx.currentTime + 0.01, clip.start, clip.dur);
    this.current = src;
    return true;
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

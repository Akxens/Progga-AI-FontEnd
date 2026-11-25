"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useEngine } from "./useEngine";

// Read-aloud for Ask Progga: one shared <audio> element plays Progga's replies
// in order. The first clip streams from the API (speaking starts fast); the
// rest of the queue downloads in the background so there are no gaps.

export const VOICE_RATES = [0.85, 1, 1.2] as const;
export type VoiceRate = (typeof VOICE_RATES)[number];

const ENABLED_KEY = "progga_voice";
const RATE_KEY = "progga_voice_rate";

// The TTS clips come out quiet (speech around -27 dBFS, peaks near -10), so
// they are boosted ~10 dB and run through a limiter that stops loud bits clipping.
const BOOST = 3.2;

// Progga is a kid: clips play slightly faster with pitch preservation off, which
// raises both pitch and the voice's "size" (formants) like a child's. The voice is
// asked to speak slowly (backend VOICE_STYLE), so the pace still sounds natural.
// How much depends on the voice engine (from /health); the recorded reactions use this.
const KID_LIFT = 1.12;

/** A message to read aloud, with optional detected language for per-language playback lift. */
export type SpeechItem = string | { id: string; lang?: "bn" | "en" };

interface VoiceCtx {
  /** the backend can speak (OpenAI key configured) */
  available: boolean;
  /** the student switched read-aloud on (off by default) */
  enabled: boolean;
  setEnabled: (v: boolean) => void;
  /** counts the student's own clicks on the switch (not the saved setting loading) */
  toggles: number;
  rate: VoiceRate;
  setRate: (r: VoiceRate) => void;
  /** message currently being spoken, or loading to be spoken */
  speakingId: string | null;
  loadingId: string | null;
  /** read these messages one after another (replaces anything queued), optionally after a short reaction sound */
  speak: (sessionId: string, items: SpeechItem[], lead?: string) => void;
  /** play short reaction sounds ("Mm-hmm!", "Hmm…") in order, if voice is on */
  react: (urls: string[]) => void;
  stop: () => void;
}

/** One clip to play: a message's speech (id set) or a reaction sound (id null). */
type Clip = { id: string | null; url: string; lang?: "bn" | "en" };

const Ctx = createContext<VoiceCtx | null>(null);
const MAX_BLOBS = 30;

// The browser keeps clips for a day: bump `v` with backend SPEECH_TEXT and include `vk` for live voice switches.
const speechUrl = (sessionId: string, messageId: string, vk: string) =>
  `/api/tutor/sessions/${sessionId}/messages/${messageId}/speech?v=options-1&vk=${encodeURIComponent(vk)}`;

function readStore<T>(key: string, parse: (v: string) => T | undefined, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    if (v === null) return fallback;
    return parse(v) ?? fallback;
  } catch {
    return fallback;
  }
}
function writeStore(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable: the setting just won't persist */
  }
}

export function VoiceProvider({ children, onError }: { children: React.ReactNode; onError?: () => void }) {
  const { voice: available, voiceLifts, voiceKey } = useEngine();
  const [enabled, setEnabledState] = useState(false);
  const [toggles, setToggles] = useState(0);
  const [rate, setRateState] = useState<VoiceRate>(1);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const audio = useRef<HTMLAudioElement | null>(null);
  const graph = useRef<AudioContext | null>(null);
  const queue = useRef<Clip[]>([]);
  const blobs = useRef(new Map<string, Promise<string | null>>());
  const rateRef = useRef<VoiceRate>(1);
  const liftsRef = useRef(voiceLifts);
  liftsRef.current = voiceLifts;
  const activeLiftRef = useRef(voiceLifts.bn);
  const vkRef = useRef(voiceKey);
  vkRef.current = voiceKey;
  const generation = useRef(0); // bumps on stop/replace so stale callbacks do nothing

  const clearBlobs = useCallback(() => {
    blobs.current.forEach((p) => void p.then((u) => u && URL.revokeObjectURL(u)));
    blobs.current.clear();
  }, []);

  useEffect(() => {
    clearBlobs();
  }, [voiceKey, clearBlobs]);

  useEffect(() => {
    setEnabledState(readStore(ENABLED_KEY, (v) => v === "1", false));
    const r = readStore(RATE_KEY, (v) => VOICE_RATES.find((x) => String(x) === v), 1 as VoiceRate);
    setRateState(r);
    rateRef.current = r;
  }, []);

  const player = useCallback(() => {
    if (!audio.current) {
      const el = new Audio();
      audio.current = el;
      try {
        const ctx = new AudioContext();
        const gain = ctx.createGain();
        gain.gain.value = BOOST;
        const limiter = ctx.createDynamicsCompressor();
        limiter.threshold.value = -6;
        limiter.knee.value = 4;
        limiter.ratio.value = 12;
        limiter.attack.value = 0.003;
        limiter.release.value = 0.2;
        ctx.createMediaElementSource(el).connect(gain).connect(limiter).connect(ctx.destination);
        graph.current = ctx;
      } catch {
        /* no Web Audio: plays at the clip's own volume */
      }
    }
    return audio.current;
  }, []);

  /** Downloads a clip in the background (used for everything after the first in the queue). */
  const prefetch = useCallback((url: string) => {
    if (blobs.current.has(url)) return;
    while (blobs.current.size >= MAX_BLOBS) {
      const oldestKey = blobs.current.keys().next().value;
      if (!oldestKey) break;
      const old = blobs.current.get(oldestKey);
      blobs.current.delete(oldestKey);
      void old?.then((u) => u && URL.revokeObjectURL(u));
    }
    blobs.current.set(
      url,
      fetch(url, { credentials: "include" })
        .then((r) => (r.ok ? r.blob() : null))
        .then((b) => (b ? URL.createObjectURL(b) : null))
        .catch(() => null),
    );
  }, []);

  const playNext = useCallback(async () => {
    const gen = generation.current;
    const next = queue.current.shift();
    if (!next) {
      setSpeakingId(null);
      setLoadingId(null);
      return;
    }
    // get the next couple of clips ready so there's no gap (not the whole chat at once)
    queue.current.slice(0, 2).forEach((q) => prefetch(q.url));

    const el = player();
    setSpeakingId(null);
    setLoadingId(next.id);
    const cached = blobs.current.has(next.url) ? await blobs.current.get(next.url) : null;
    if (gen !== generation.current) return;
    const lift = next.id ? (next.lang === "en" ? liftsRef.current.en : liftsRef.current.bn) : KID_LIFT;
    activeLiftRef.current = lift;
    el.src = cached ?? next.url;
    el.preservesPitch = false;
    el.playbackRate = next.id ? rateRef.current * lift : KID_LIFT; // reactions ignore the speed setting
    el.onplaying = () => gen === generation.current && (setSpeakingId(next.id), setLoadingId(null));
    el.onended = () => gen === generation.current && void playNext();
    el.onerror = () => {
      if (gen !== generation.current) return;
      onError?.();
      void playNext();
    };
    try {
      // browsers start the boost graph suspended until the page has been interacted with
      if (graph.current?.state === "suspended") await graph.current.resume();
      await el.play();
    } catch {
      // autoplay blocked or aborted: stop quietly, the student can press play
      if (gen === generation.current) {
        queue.current = [];
        setSpeakingId(null);
        setLoadingId(null);
      }
    }
  }, [player, prefetch, onError]);

  const stop = useCallback(() => {
    generation.current++;
    queue.current = [];
    const el = audio.current;
    if (el) {
      el.pause();
      el.removeAttribute("src");
      el.load();
    }
    setSpeakingId(null);
    setLoadingId(null);
  }, []);

  const speak = useCallback(
    (sessionId: string, items: SpeechItem[], lead?: string) => {
      if (!available || !items.length) return;
      stop();
      const clips: Clip[] = items.map((item) =>
        typeof item === "string"
          ? { id: item, url: speechUrl(sessionId, item, vkRef.current), lang: "bn" }
          : { id: item.id, url: speechUrl(sessionId, item.id, vkRef.current), lang: item.lang ?? "bn" },
      );
      queue.current = [...(lead ? [{ id: null, url: lead }] : []), ...clips];
      void playNext();
    },
    [available, stop, playNext],
  );

  const react = useCallback(
    (urls: string[]) => {
      if (!available || !enabled || !urls.length) return;
      stop();
      queue.current = urls.map((url) => ({ id: null, url }));
      void playNext();
    },
    [available, enabled, stop, playNext],
  );

  const setEnabled = useCallback(
    (v: boolean) => {
      setEnabledState(v);
      setToggles((n) => n + 1);
      writeStore(ENABLED_KEY, v ? "1" : "0");
      if (!v) stop();
    },
    [stop],
  );

  const setRate = useCallback((r: VoiceRate) => {
    setRateState(r);
    rateRef.current = r;
    writeStore(RATE_KEY, String(r));
    if (audio.current) audio.current.playbackRate = r * activeLiftRef.current;
  }, []);

  // stop talking when leaving Ask Progga; free downloaded clips
  useEffect(
    () => () => {
      generation.current++;
      audio.current?.pause();
      void graph.current?.close().catch(() => undefined);
      audio.current = null; // an element wired to a closed graph would stay silent
      graph.current = null;
      clearBlobs();
    },
    [clearBlobs],
  );

  const value = useMemo<VoiceCtx>(
    () => ({ available, enabled: available && enabled, setEnabled, toggles, rate, setRate, speakingId, loadingId, speak, react, stop }),
    [available, enabled, setEnabled, toggles, rate, setRate, speakingId, loadingId, speak, react, stop],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useVoice() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useVoice must be used inside VoiceProvider");
  return ctx;
}

/** For components used both inside and outside Ask Progga (e.g. guardian transcripts). */
export const useOptionalVoice = () => useContext(Ctx);

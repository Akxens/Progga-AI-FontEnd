"use client";

import clsx from "clsx";
import { KeyRound, Play, Save, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";
import { ErrorNote, PageLoader, Spinner } from "@/components/ui/primitives";
import { API_BASE, api, errorMessage, getAuthToken } from "@/lib/api";

type TtsProviderId = "elevenlabs" | "indicf5" | "openai" | "gemini" | "azure";
type Lang = "bn" | "en";

interface VoiceOption {
  id: string;
  label: string;
  note?: string;
}
interface TtsProviderInfo {
  id: TtsProviderId;
  label: string;
  configured: boolean;
  keyHint: string;
  model: string;
  bangla: string;
  voices: VoiceOption[];
  defaultVoice: string;
  lift: number;
}
interface VoiceChoice {
  provider: TtsProviderId;
  voice: string;
}
/** The Bangla (and default) voice, plus an optional different one for English replies. */
interface VoiceConfig extends VoiceChoice {
  en?: VoiceChoice;
}

const LANGS: { id: Lang; label: string }[] = [
  { id: "bn", label: "বাংলা" },
  { id: "en", label: "English" },
];
const choiceFor = (cfg: VoiceConfig, lang: Lang): VoiceChoice => (lang === "en" && cfg.en ? cfg.en : { provider: cfg.provider, voice: cfg.voice });
const sameChoice = (a: VoiceChoice, b: VoiceChoice) => a.provider === b.provider && a.voice === b.voice;

const PROVIDER_STYLE: Record<TtsProviderId, { icon: string; tint: string }> = {
  elevenlabs: { icon: "🎙️", tint: "from-coral-50 to-white" },
  indicf5: { icon: "🖥️", tint: "from-banana-50 to-white" },
  gemini: { icon: "✨", tint: "from-sky-50 to-white" },
  azure: { icon: "🔷", tint: "from-brand-50 to-white" },
  openai: { icon: "🟢", tint: "from-mint-50 to-white" },
};

const SAMPLES = {
  bn: "হাই! আমি প্রজ্ঞা। চলো একসাথে অঙ্কটা করি। $2x + 3 = 11$ হলে, প্রথমে দুই দিক থেকে ৩ বিয়োগ করি। দারুণ ভেবেছ!",
  en: "Hi! I'm Progga. Let's solve this together. If $2x + 3 = 11$, first we take 3 away from both sides. Nice thinking!",
};

/** Admin: pick the text-to-speech engine and voice Progga reads its replies with. */
export function VoiceSettings() {
  const { data, mutate } = useSWR<{ config: VoiceConfig; providers: TtsProviderInfo[] }>("/admin/voice");
  const { mutate: globalMutate } = useSWRConfig();
  const { toast, burst } = useCelebrate();
  const [draft, setDraft] = useState<VoiceConfig | null>(null);
  const [lang, setLang] = useState<Lang>("bn");
  const [sample, setSample] = useState(SAMPLES.bn);
  const [previewing, setPreviewing] = useState<"loading" | "playing" | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (data && !draft) setDraft(data.config);
  }, [data, draft]);
  useEffect(() => () => audio.current?.pause(), []);

  if (!data || !draft) return <PageLoader label="Loading voice settings…" />;

  const active = data.config;
  const info = (id: TtsProviderId) => data.providers.find((p) => p.id === id)!;
  const voiceName = (c: VoiceChoice) => info(c.provider).voices.find((v) => v.id === c.voice)?.label ?? c.voice;
  const liveLabel = (c: VoiceChoice) => `${info(c.provider).label} · ${voiceName(c)}`;
  // the language being edited, and what it speaks with in the draft and live
  const choice = choiceFor(draft, lang);
  const activeChoice = choiceFor(active, lang);
  const provider = info(choice.provider);
  const englishSame = !draft.en;
  const dirty = !sameChoice(choiceFor(draft, "bn"), choiceFor(active, "bn")) || !sameChoice(choiceFor(draft, "en"), choiceFor(active, "en")) || !draft.en !== !active.en;

  /** Changes the voice of the language being edited. */
  function setChoice(c: VoiceChoice) {
    if (!draft) return;
    setDraft(lang === "en" ? { ...draft, en: c } : { ...draft, ...c });
  }

  function switchLang(l: Lang) {
    stop();
    setError(null);
    setLang(l);
    setSample(SAMPLES[l]);
  }

  function stop() {
    audio.current?.pause();
    setPreviewing(null);
  }

  function pickProvider(p: TtsProviderInfo) {
    if (!p.configured) return;
    stop();
    setError(null);
    setChoice(p.id === activeChoice.provider ? activeChoice : { provider: p.id, voice: p.defaultVoice });
  }

  async function preview() {
    if (!draft) return;
    stop();
    setError(null);
    setPreviewing("loading");
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/admin/voice/preview`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ...choice, text: sample }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
        throw new Error(body?.error?.message ?? "Preview failed");
      }
      const url = URL.createObjectURL(await res.blob());
      const el = new Audio(url);
      audio.current = el;
      // play it the way students will hear it
      el.preservesPitch = false;
      el.playbackRate = provider.lift;
      el.onended = () => {
        setPreviewing(null);
        URL.revokeObjectURL(url);
      };
      await el.play();
      setPreviewing("playing");
    } catch (e) {
      setPreviewing(null);
      setError(errorMessage(e));
    }
  }

  async function save() {
    if (!draft) return;
    setSaving(true);
    setError(null);
    try {
      await api("/admin/voice", { method: "PUT", body: draft });
      await mutate();
      void globalMutate("/health");
      burst();
      toast(`Progga's voice is updated`, "🔊", "brand");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold">Progga&apos;s voice 🔊</h2>
        <p className="mt-1 max-w-2xl text-ink-soft">
          Choose the engine and voice that read Progga&apos;s replies aloud, separately for Bangla and English replies. Listen to a sample first; changes apply instantly for every student.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <p className="rounded-full bg-brand-50 px-3 py-1 text-sm font-bold text-brand-700">বাংলা: {liveLabel(choiceFor(active, "bn"))}</p>
          <p className="rounded-full bg-brand-50 px-3 py-1 text-sm font-bold text-brand-700">English: {liveLabel(choiceFor(active, "en"))}</p>
        </div>
      </div>

      <section>
        <h3 className="mb-3 text-xl font-extrabold">Language</h3>
        <div className="inline-flex rounded-full border border-line bg-white p-1">
          {LANGS.map((l) => (
            <button
              key={l.id}
              onClick={() => switchLang(l.id)}
              className={clsx("rounded-full px-5 py-2 text-sm font-extrabold transition-colors", lang === l.id ? "bg-ink text-white" : "text-ink-soft hover:text-ink")}
            >
              {l.label}
            </button>
          ))}
        </div>
        {lang === "en" && (
          <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-ink-soft">
            <input
              type="checkbox"
              checked={englishSame}
              onChange={(e) => {
                stop();
                if (e.target.checked) {
                  const { en: _en, ...rest } = draft;
                  setDraft(rest);
                } else setDraft({ ...draft, en: { provider: draft.provider, voice: draft.voice } });
              }}
            />
            Use the Bangla voice for English replies too
          </label>
        )}
      </section>

      <section>
        <h3 className="mb-3 text-xl font-extrabold">1 · Engine for {lang === "bn" ? "Bangla" : "English"} replies</h3>
        <div className={clsx("grid gap-3 sm:grid-cols-2 lg:grid-cols-3", lang === "en" && englishSame && "pointer-events-none opacity-50")}>
          {data.providers.map((p) => {
            const selected = choice.provider === p.id;
            return (
              <button
                key={p.id}
                onClick={() => pickProvider(p)}
                disabled={!p.configured}
                className={clsx(
                  "card relative bg-gradient-to-br p-4 text-left transition-all",
                  PROVIDER_STYLE[p.id].tint,
                  selected ? "border-2 border-brand-500 ring-4 ring-brand-100" : "hover:-translate-y-0.5 hover:shadow-lift",
                  !p.configured && "cursor-not-allowed opacity-55 hover:translate-y-0 hover:shadow-soft",
                )}
              >
                {activeChoice.provider === p.id && <span className="absolute right-3 top-3 rounded-full bg-mint-500 px-2 py-0.5 text-[10px] font-extrabold uppercase text-white">Live</span>}
                <span className="text-2xl">{PROVIDER_STYLE[p.id].icon}</span>
                <p className="mt-2 font-display text-lg font-extrabold leading-tight">{p.label}</p>
                <p className="mt-1 text-xs font-semibold text-ink-soft">বাংলা: {p.bangla}</p>
                <span className={clsx("mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-extrabold", p.configured ? "bg-mint-100 text-mint-700" : "bg-coral-100 text-coral-600")}>
                  <KeyRound size={11} /> {p.configured ? "Key found" : `Needs ${p.keyHint}`}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs font-semibold text-ink-muted">Engines without a key are disabled. Add the key to backend/.env and restart the API to enable them.</p>
      </section>

      <section className="card p-6">
        <h3 className="text-xl font-extrabold">2 · Voice</h3>
        <p className="mt-1 text-sm text-ink-soft">{provider.label} · model {provider.model}</p>
        <div className={clsx("mt-4 flex flex-wrap gap-2", lang === "en" && englishSame && "pointer-events-none opacity-50")}>
          {provider.voices.map((v) => {
            const on = choice.voice === v.id;
            return (
              <button
                key={v.id}
                onClick={() => {
                  stop();
                  setChoice({ ...choice, voice: v.id });
                }}
                className={clsx(
                  "rounded-2xl border-2 px-3 py-1.5 text-left text-sm transition-colors",
                  on ? "border-brand-500 bg-brand-50 text-brand-700" : "border-line bg-white hover:border-brand-200",
                )}
              >
                <span className="font-extrabold">{v.label}</span>
                {v.note && <span className="ml-1.5 text-xs font-semibold text-ink-muted">{v.note}</span>}
              </button>
            );
          })}
        </div>
      </section>

      <section className="card p-6">
        <h3 className="text-xl font-extrabold">3 · Listen & switch</h3>
        <label className="label mt-3" htmlFor="voice-sample">What Progga says</label>
        <textarea id="voice-sample" className="input min-h-24" maxLength={600} value={sample} onChange={(e) => setSample(e.target.value)} />
        <div className="mt-4 flex flex-wrap gap-3">
          <button onClick={previewing ? stop : preview} disabled={saving || !sample.trim()} className="btn-ghost">
            {previewing === "loading" ? <Spinner /> : previewing === "playing" ? <Square size={18} /> : <Play size={18} />}
            {previewing === "loading" ? "Recording…" : previewing === "playing" ? "Stop" : `Listen to ${voiceName(choice)}`}
          </button>
          <button onClick={save} disabled={!dirty || saving} className="btn-primary">
            {saving ? <Spinner /> : <Save size={18} />} {dirty ? "Save & switch" : "Already live"}
          </button>
        </div>
        <div className="mt-4">
          <ErrorNote message={error} />
        </div>
      </section>
    </div>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSWRConfig } from "swr";
import { ProggaBot, type BotMood } from "@/components/brand/ProggaBot";
import { ChatComposer, type ComposerHandle } from "@/components/chat/ChatComposer";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { useChatLayout } from "@/components/chat/ChatShell";
import { EnginePicker, PhotoButton, PhotoPreview } from "@/components/chat/ComposerTools";
import { ProggaMark } from "@/components/brand/Logo";
import { ChatMessage } from "@/components/tutor/ChatMessage";
import { ErrorNote } from "@/components/ui/primitives";
import { useT, type TKey } from "@/i18n";
import { errorMessage } from "@/lib/api";
import { paletteFor } from "@/lib/skins";
import { EXAMPLES, EXAMPLES_BN, previewAsMessage, startTutorSession } from "@/lib/tutor";
import type { PreviewMessage } from "@/lib/types";
import { useEngine, useEngineChoice } from "@/lib/useEngine";
import { useTypingPlaceholder } from "@/lib/useTypingPlaceholder";

const PLANNING_LINES: TKey[] = ["ask.plan1", "ask.plan2", "ask.plan3", "ask.plan4"];

function NewChat() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, refreshHistory } = useChatLayout();
  const { t, ui } = useT();
  const { mutate } = useSWRConfig();
  const { vision: defaultVision } = useEngine();
  const { current: engine } = useEngineChoice();
  // photos only for a model that can read them
  const vision = engine ? engine.vision : defaultVision;
  const composer = useRef<ComposerHandle>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // no subject picker: Progga works the subject out from the question (a lesson link can still pass one)
  const subject = params.get("subject") ?? "general";
  const wantPhoto = params.has("photo");
  const [question, setQuestion] = useState(() => params.get("q") ?? ""); // a question typed on the landing page
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [sent, setSent] = useState<{ text: string; photo: string | null } | null>(null);
  const [line, setLine] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<string | null>(null);
  // Progga's opening, word by word, while the AI is still writing it
  const [opening, setOpening] = useState<PreviewMessage[]>([]);
  const busy = !!sent && !blocked && !error;
  const abortRef = useRef<AbortController | null>(null);
  const previewRef = useRef<string | null>(null);

  const setPreviewUrl = (nextUrl: string | null) => {
    if (previewRef.current && previewRef.current !== nextUrl) URL.revokeObjectURL(previewRef.current);
    previewRef.current = nextUrl;
    setPreview(nextUrl);
  };

  useEffect(() => () => {
    abortRef.current?.abort();
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
  }, []);

  // "New question" from the sidebar → start fresh
  const fresh = params.get("new");
  useEffect(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setSent(null);
    setOpening([]);
    setQuestion(params.get("q") ?? "");
    setImage(null);
    setPreviewUrl(null);
    setBlocked(null);
    setError(null);
    composer.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fresh]);

  useEffect(() => {
    // only follow Progga's reply; the empty start screen should open at the top (matters on phones)
    if (opening.length) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [opening]);

  useEffect(() => {
    if (!busy) return;
    const timer = setInterval(() => setLine((l) => Math.min(l + 1, PLANNING_LINES.length - 1)), 1600);
    return () => clearInterval(timer);
  }, [busy]);

  function pickImage(f: File | undefined) {
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) return setError(t("ask.tooBig"));
    setError(null);
    setImage(f);
    setPreviewUrl(URL.createObjectURL(f));
  }

  async function submit(text = question) {
    const q = text.trim();
    if (!q && !image) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setSent({ text: q, photo: preview });
    setLine(0);
    setError(null);
    setBlocked(null);
    setQuestion("");
    setOpening([]);
    try {
      const res = await startTutorSession(q, subject, image, undefined, setOpening, ctrl.signal);
      if (ctrl.signal.aborted) return;
      if (res.blocked) {
        setOpening([]);
        setBlocked(res.message);
        return;
      }
      await mutate(`/tutor/sessions/${res.session.id}`, { session: res.session }, { revalidate: false });
      if (ctrl.signal.aborted) return;
      refreshHistory();
      router.push(`/tutor/${res.session.id}?speak=1`);
    } catch (err) {
      if (ctrl.signal.aborted) return;
      setOpening([]);
      setError(errorMessage(err));
      setQuestion(q);
    } finally {
      if (abortRef.current === ctrl) abortRef.current = null;
    }
  }

  // real example questions, taking turns across subjects
  const typingExamples = useMemo(() => {
    const lists = Object.values(ui === "bn" ? EXAMPLES_BN : EXAMPLES);
    const out: string[] = [];
    for (let i = 0; i < Math.max(...lists.map((l) => l.length)); i++) for (const l of lists) if (l[i] && !out.includes(l[i])) out.push(l[i]);
    return out;
  }, [ui]);
  // "Try one of these": a fresh set of four every 10s (a subject link keeps to its subject)
  const subjectExamples = subject !== "general" ? (ui === "bn" ? EXAMPLES_BN : EXAMPLES)[subject] : undefined;
  const pool = subjectExamples ?? typingExamples;
  const [round, setRound] = useState(0);
  const [hoverSuggestions, setHoverSuggestions] = useState(false);
  useEffect(() => {
    if (pool.length <= 4 || sent || hoverSuggestions) return; // don't swap a card out from under the pointer
    const timer = setInterval(() => setRound((r) => r + 1), 10_000);
    return () => clearInterval(timer);
  }, [pool.length, sent, hoverSuggestions]);
  const examples = Array.from({ length: Math.min(4, pool.length) }, (_, i) => pool[(round * 4 + i) % pool.length]);
  const typed = useTypingPlaceholder(typingExamples, !!question || busy);
  const mood: BotMood = busy ? "thinking" : blocked ? "oops" : question ? "asking" : "idle";
  const palette = user.skin?.palette ?? paletteFor(user.avatarSkin);

  return (
    <>
      <ChatHeader title={t("nav.ask")} subtitle={t("chatui.disclaimer")} />

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        {!sent ? (
          <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col items-center justify-center px-4 py-8 text-center sm:px-6">
            <ProggaBot size={120} mood={mood} palette={palette} />
            <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">{t("ask.title")}</h1>
            <p className="mt-2 max-w-xl text-ink-soft">{t("ask.body")}</p>

            <Link
              href="/tutor/learn"
              className="group mt-6 flex w-full items-center gap-3 rounded-2xl border-2 border-brand-200 bg-gradient-to-r from-brand-50 to-white p-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-brand-300"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-500 text-white">
                <BookOpen size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display font-extrabold">{t("learn.askCard")}</span>
                <span className="block text-sm text-ink-soft">{t("learn.askCardText")}</span>
              </span>
              <ArrowUpRight size={18} className="shrink-0 text-brand-500 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <p className="mb-2 mt-7 self-start text-xs font-extrabold uppercase tracking-wider text-ink-muted">{t("chatui.suggestions")}</p>
            <div className="grid w-full gap-2.5 sm:grid-cols-2" onMouseEnter={() => setHoverSuggestions(true)} onMouseLeave={() => setHoverSuggestions(false)}>
              {examples.map((ex, i) => (
                <motion.button
                  key={`${round}-${i}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.06, ease: "easeOut" }}
                  onClick={() => submit(ex)}
                  className="group flex items-center justify-between gap-3 rounded-2xl border border-line bg-white px-4 py-3 text-left text-[15px] font-medium shadow-soft transition-all hover:-translate-y-0.5 hover:border-brand-200"
                >
                  <span>{ex}</span>
                  <ArrowUpRight size={17} className="shrink-0 text-ink-muted transition-colors group-hover:text-brand-500" />
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-6 sm:px-6">
            <ChatMessage
              m={{ id: "q", role: "student", kind: "text", content: sent.text || "📷", stepIndex: null, meta: {}, createdAt: "" }}
            />
            {sent.photo && (
              <div className="flex justify-end">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sent.photo} alt={t("ask.photoAlt")} className="h-32 rounded-2xl border border-line object-cover" />
              </div>
            )}
            {busy && opening.map((p, i) => <ChatMessage key={i} m={previewAsMessage(p, i)} streaming={i === opening.length - 1} />)}
            {busy && !opening.length && (
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50">
                  <ProggaMark size={28} />
                </span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={line}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="rounded-2xl bg-brand-50 px-4 py-2.5 font-display font-bold text-brand-700"
                  >
                    {t(PLANNING_LINES[line])}
                  </motion.span>
                </AnimatePresence>
              </div>
            )}
            {blocked && <ChatMessage m={{ id: "b", role: "tutor", kind: "safety", content: blocked, stepIndex: null, meta: {}, createdAt: "" }} />}
            {error && <ErrorNote message={error} />}
          </div>
        )}
      </div>

      <ChatComposer
        ref={composer}
        value={question}
        onChange={setQuestion}
        onSubmit={() => submit()}
        placeholder={question || busy ? t("ask.placeholder") : `${typed}|`}
        label={t("ask.questionLabel")}
        busy={busy}
        disabled={busy}
        canSendEmpty={!!image}
        autoFocus
        attachment={preview && !busy ? <PhotoPreview src={preview} onRemove={() => { setImage(null); setPreviewUrl(null); }} /> : undefined}
        tools={
          <>
            {vision && <PhotoButton onPick={pickImage} disabled={busy} highlight={wantPhoto && !image} />}
            <EnginePicker disabled={busy} />
          </>
        }
      />
    </>
  );
}

export default function TutorHome() {
  return (
    <Suspense>
      <NewChat />
    </Suspense>
  );
}

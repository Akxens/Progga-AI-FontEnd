"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Clock, FlaskConical, GraduationCap, Hammer, Lightbulb, ListChecks, Sparkles, Database } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { ProggaBot } from "@/components/brand/ProggaBot";
import { ChatMessage } from "@/components/tutor/ChatMessage";
import { ErrorNote, PageLoader, SectionTitle, Spinner } from "@/components/ui/primitives";
import { useT, type TKey } from "@/i18n";
import { apiStream, errorMessage } from "@/lib/api";
import type { LabHome, LabProject, MyLabProject } from "@/lib/lab";
import { paletteFor } from "@/lib/skins";
import { previewAsMessage } from "@/lib/tutor";
import type { PreviewMessage, StartResult, Subject } from "@/lib/types";
import { storedEngine } from "@/lib/useEngine";
import { useMe } from "@/lib/useMe";

const PLANNING_LINES: TKey[] = ["lab.plan1", "lab.plan2", "lab.plan3", "lab.plan4"];
const SKILL_IDEAS = ["HTML", "CSS", "Percentages", "Fractions", "Electric circuits", "Flowcharts", "Photosynthesis", "Bar charts"];

type Pending = { title: string; body: Record<string, unknown> };

/**
 * Innovation Lab: learn a skill by building a real project. Progga plans the
 * milestones and the student builds it in the Ask Progga stepper.
 */
export default function LabPage() {
  const router = useRouter();
  const { user } = useMe();
  const { t, ui } = useT();
  const { mutate } = useSWRConfig();
  const { data } = useSWR<LabHome>("/lab");
  const [pending, setPending] = useState<Pending | null>(null);
  const [preview, setPreview] = useState<PreviewMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function start(p: Pending) {
    if (pending) return;
    setPending(p);
    setPreview([]);
    setError(null);
    try {
      const res = await apiStream<StartResult, PreviewMessage[]>("/lab/start", { body: { ...p.body, engine: storedEngine() } }, setPreview);
      if (res.blocked) {
        setError(res.message);
        setPending(null);
        return;
      }
      await mutate(`/tutor/sessions/${res.session.id}`, { session: res.session }, { revalidate: false });
      void mutate("/tutor/sessions");
      void mutate("/lab");
      router.push(`/tutor/${res.session.id}?speak=1`);
    } catch (e) {
      setError(errorMessage(e));
      setPending(null);
    }
  }

  if (!data || !user) return <PageLoader label={t("common.loading")} />;
  if (pending) return <Planning title={pending.title} preview={preview} palette={user.skin?.palette ?? paletteFor(user.avatarSkin)} />;

  const lang = ui === "bn" ? "bn" : "en";

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-600 via-indigo-600 to-sky-500 p-6 text-white sm:p-8">
        <div className="bg-dots absolute inset-0 opacity-20" />
        <div className="absolute -right-10 -top-16 h-64 w-64 rounded-full bg-fuchsia-400/30 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-extrabold">
              <FlaskConical size={16} /> {t("lab.eyebrow")}
            </p>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">{t("lab.title")}</h1>
            <p className="mt-2 max-w-xl text-indigo-100">{t("lab.body")}</p>
          </div>
          <ul className="grid gap-2.5 sm:grid-cols-3 lg:w-[26rem] lg:grid-cols-1">
            <How icon={Hammer} title={t("lab.howBuild")} text={t("lab.howBuildText")} />
            <How icon={ListChecks} title={t("lab.howSteps")} text={t("lab.howStepsText")} />
            <How icon={Database} title={t("lab.howData")} text={t("lab.howDataText")} />
          </ul>
        </div>
      </section>

      <ErrorNote message={error} />

      {data.mine.length > 0 && (
        <section>
          <SectionTitle eyebrow={t("lab.eyebrow")} title={t("lab.mine")} />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {data.mine.map((m) => (
              <MyProjectCard key={m.id} p={m} />
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionTitle eyebrow={t("lab.samples")} title={t("lab.samplesSub")} />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.projects.map((p) => (
            <ProjectCard key={p.id} p={p} lang={lang} onStart={() => void start({ title: p.title[lang], body: { projectId: p.id } })} />
          ))}
        </div>
      </section>

      <OwnProject grade={user.grade ?? 6} onStart={(title, body) => void start({ title, body })} />
    </div>
  );
}

function How({ icon: Icon, title, text }: { icon: typeof Hammer; title: string; text: string }) {
  return (
    <li className="flex items-start gap-3 rounded-2xl bg-white/12 p-3 ring-1 ring-white/15 backdrop-blur">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-indigo-600">
        <Icon size={18} strokeWidth={2.4} />
      </span>
      <span className="min-w-0">
        <span className="block font-display font-extrabold leading-tight">{title}</span>
        <span className="block text-sm text-indigo-100">{text}</span>
      </span>
    </li>
  );
}

function ProjectCard({ p, lang, onStart }: { p: LabProject; lang: "en" | "bn"; onStart: () => void }) {
  const { t, n } = useT();
  return (
    <article className="card group flex flex-col overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lift">
      <div className="relative h-2" style={{ background: p.color }} />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start gap-3">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-3xl" style={{ background: `${p.color}1f` }}>
            {p.emoji}
          </span>
          <div className="min-w-0">
            <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-extrabold" style={{ background: `${p.color}1f`, color: p.color }}>
              {p.skill[lang]}
            </span>
            <h3 className="mt-1 font-display text-lg font-extrabold leading-snug">{p.title[lang]}</h3>
          </div>
        </div>
        <p className="mt-3 text-sm text-ink-soft">{p.pitch[lang]}</p>

        <p className="mt-4 text-xs font-extrabold uppercase tracking-wider text-ink-muted">{t("lab.youllLearn")}</p>
        <ul className="mt-1.5 space-y-1">
          {p.learn[lang].map((l) => (
            <li key={l} className="flex items-start gap-2 text-sm font-semibold">
              <Sparkles size={14} className="mt-0.5 shrink-0" style={{ color: p.color }} /> {l}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-center gap-3 pt-5">
          <span className="flex items-center gap-1 text-xs font-bold text-ink-muted">
            <Clock size={13} /> {t("lab.minutes", { n: p.minutes })}
          </span>
          <span className="flex items-center gap-1 text-xs font-bold text-ink-muted">
            <GraduationCap size={14} /> {t("lab.fromClass", { n: n(p.minGrade) })}
          </span>
          <button onClick={onStart} className="btn-primary btn-sm ml-auto">
            {t("lab.start")} <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}

function MyProjectCard({ p }: { p: MyLabProject }) {
  const { t, n } = useT();
  const done = p.status === "solved";
  const progress = done ? 1 : p.totalSteps ? p.currentStep / p.totalSteps : 0;
  return (
    <Link href={`/tutor/${p.id}`} className="card flex items-center gap-3 p-4 transition-all hover:-translate-y-0.5 hover:shadow-lift">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-indigo-50 text-xl">🛠️</span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display font-bold">{p.title}</p>
        <p className="text-xs font-bold text-ink-muted">{done ? t("lab.done") : t("lab.stepOf", { a: n(Math.min(p.currentStep + 1, p.totalSteps)), b: n(p.totalSteps) })}</p>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-cream">
          <div className={clsx("h-full rounded-full", done ? "bg-mint-500" : "bg-indigo-500")} style={{ width: `${Math.max(4, progress * 100)}%` }} />
        </div>
      </div>
      <span className="shrink-0 text-sm font-extrabold text-indigo-600">{done ? t("lab.review") : t("lab.continue")}</span>
    </Link>
  );
}

function OwnProject({ grade, onStart }: { grade: number; onStart: (title: string, body: Record<string, unknown>) => void }) {
  const { t, ui } = useT();
  const [skill, setSkill] = useState("");
  const [idea, setIdea] = useState("");
  const [subject, setSubject] = useState("ict");
  const { data } = useSWR<{ subjects: Subject[] }>(`/subjects?grade=${grade}`);
  const subjects = data?.subjects ?? [];
  const ready = skill.trim().length >= 2 && idea.trim().length >= 4;

  // ICT is only taught from Class 6: fall back to the first subject the class has
  useEffect(() => {
    if (subjects.length && !subjects.some((s) => s.id === subject)) setSubject(subjects[0].id);
  }, [subjects, subject]);

  return (
    <section className="card overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div className="relative bg-gradient-to-br from-banana-100 to-banana-50 p-6 sm:p-7">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-banana-700 shadow-soft">
            <Lightbulb size={24} strokeWidth={2.4} />
          </span>
          <h2 className="mt-4 text-2xl font-extrabold">{t("lab.ownTitle")}</h2>
          <p className="mt-1.5 text-ink-soft">{t("lab.ownBody")}</p>
        </div>
        <form
          className="space-y-4 p-6 sm:p-7"
          onSubmit={(e) => {
            e.preventDefault();
            if (ready) onStart(idea.trim(), { idea: idea.trim(), skill: skill.trim(), subject });
          }}
        >
          <label className="block">
            <span className="label">{t("lab.skillLabel")}</span>
            <input className="input" maxLength={80} value={skill} onChange={(e) => setSkill(e.target.value)} placeholder={t("lab.skillPh")} />
          </label>
          <div className="-mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-ink-muted">{t("lab.skillChips")}:</span>
            {SKILL_IDEAS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSkill(s)}
                className={clsx(
                  "rounded-full border px-2.5 py-0.5 text-xs font-bold transition-colors",
                  skill === s ? "border-indigo-500 bg-indigo-500 text-white" : "border-line bg-white text-ink-soft hover:border-indigo-200 hover:text-indigo-700",
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <label className="block">
            <span className="label">{t("lab.ideaLabel")}</span>
            <textarea className="input resize-none" rows={2} maxLength={300} value={idea} onChange={(e) => setIdea(e.target.value)} placeholder={t("lab.ideaPh")} />
          </label>
          {subjects.length > 0 && (
            <div>
              <span className="label">{t("lab.subjectLabel")}</span>
              <div className="flex flex-wrap gap-2">
                {subjects.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSubject(s.id)}
                    aria-pressed={s.id === subject}
                    className={clsx(
                      "flex items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 text-sm font-bold transition-colors",
                      s.id === subject ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-line bg-white text-ink-soft hover:border-indigo-200",
                    )}
                  >
                    <span>{s.icon}</span> {ui === "bn" ? s.nameBn : s.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <button type="submit" disabled={!ready} className="btn-primary w-full sm:w-auto">
            <Sparkles size={18} /> {t("lab.startOwn")}
          </button>
        </form>
      </div>
    </section>
  );
}

/** While Progga plans the project: a thinking robot, then its opening word by word. */
function Planning({ title, preview, palette }: { title: string; preview: PreviewMessage[]; palette: ReturnType<typeof paletteFor> }) {
  const { t } = useT();
  const [line, setLine] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setLine((l) => Math.min(l + 1, PLANNING_LINES.length - 1)), 2200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="card p-6 text-center sm:p-8">
        <ProggaBot size={120} mood="thinking" palette={palette} />
        <p className="mt-3 text-sm font-extrabold uppercase tracking-wider text-indigo-600">{t("lab.planning")}</p>
        <h1 className="mt-1 text-2xl font-extrabold">{title}</h1>
        <AnimatePresence mode="wait">
          <motion.p
            key={line}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-indigo-50 px-4 py-2.5 font-display font-bold text-indigo-700"
          >
            <Spinner /> {t(PLANNING_LINES[line])}
          </motion.p>
        </AnimatePresence>
      </div>
      {preview.length > 0 && (
        <div className="mt-4 space-y-3">
          {preview.map((p, i) => (
            <ChatMessage key={i} m={previewAsMessage(p, i)} streaming={i === preview.length - 1} />
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { ArrowRight, ArrowUp, Camera, Check, MessageCircleQuestion, PlayCircle, ShieldCheck, Swords, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { ProggaBot } from "@/components/brand/ProggaBot";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useT, type TKey } from "@/i18n";
import { EXAMPLES, EXAMPLES_BN } from "@/lib/tutor";
import { useTypingPlaceholder } from "@/lib/useTypingPlaceholder";

/** Public landing page: quiet and minimal, built around one "ask anything" box. */
export default function Landing() {
  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-white text-ink">
      <Aurora />
      <Nav />
      <Hero />
      <HowItWorks />
      <Features />
      <Safety />
      <FinalCta />
      <Footer />
    </div>
  );
}

/** Soft blue lights drifting slowly behind the top of the page, fading into white below. */
function Aurora() {
  return (
    <div aria-hidden className="aurora pointer-events-none absolute inset-x-0 top-0 h-[calc(100dvh+6rem)] overflow-hidden">
      <span className="aurora-ribbon" />
      <span className="aurora-light aurora-a" />
      <span className="aurora-light aurora-b" />
      <span className="aurora-light aurora-c" />
      <span className="aurora-light aurora-d" />
      <span className="aurora-light aurora-e" />
      <span className="aurora-sweep" />
      <span className="aurora-grid" />
    </div>
  );
}

function Nav() {
  const { t } = useT();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header className={`sticky top-0 z-40 transition-colors ${scrolled ? "border-b border-line bg-white/85 backdrop-blur" : "border-b border-transparent bg-transparent"}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" aria-label="Progga AI">
          <Logo size={32} />
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <LanguageSwitcher compact />
          <Link href="/login" className="hidden rounded-full px-4 py-2 text-[15px] font-semibold text-ink-soft transition-colors hover:bg-ink/[0.04] hover:text-ink sm:inline-flex">
            {t("landing.login")}
          </Link>
          <Link href="/signup" className="rounded-full bg-ink px-4 py-2 text-[15px] font-semibold text-white transition-opacity hover:opacity-85">
            {t("landing.start")}
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const { t, ui } = useT();
  const router = useRouter();
  const [question, setQuestion] = useState("");

  // real example questions, taking turns across subjects
  const examples = useMemo(() => {
    const lists = Object.values(ui === "bn" ? EXAMPLES_BN : EXAMPLES);
    const out: string[] = [];
    for (let i = 0; i < Math.max(...lists.map((l) => l.length)); i++) for (const l of lists) if (l[i] && !out.includes(l[i])) out.push(l[i]);
    return out;
  }, [ui]);
  const typed = useTypingPlaceholder(examples, !!question);
  const [round, setRound] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setRound((r) => r + 1), 10_000);
    return () => clearInterval(timer);
  }, []);
  const chips = Array.from({ length: 3 }, (_, i) => examples[(round * 3 + i) % examples.length]);

  // the question rides along to Ask Progga (through sign-in if needed) and waits in the box there
  const ask = (q: string) => {
    const text = q.trim();
    router.push(text ? `/tutor?q=${encodeURIComponent(text)}` : "/tutor");
  };

  return (
    <section className="relative mx-auto flex min-h-[calc(100dvh-4rem)] max-w-3xl flex-col items-center justify-center px-4 pb-16 pt-10 text-center sm:px-6">
      <ProggaBot size={76} mood="happy" />
      <h1 className="mt-5 text-balance font-display text-4xl font-extrabold leading-[1.12] tracking-tight sm:text-5xl lg:text-[3.5rem]">
        {t("landing.titleA")} <span className="text-shimmer">{t("landing.think")}</span>
        {t("landing.titleB")}
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">{t("landing.heroBody")}</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(question);
        }}
        className="mt-9 flex w-full items-end gap-2 rounded-[28px] border border-line bg-white p-2 pl-5 shadow-[0_6px_30px_-12px_rgba(16,24,40,0.18)] transition-shadow focus-within:border-ink/20 focus-within:shadow-[0_10px_40px_-12px_rgba(16,24,40,0.25)]"
      >
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              ask(question);
            }
          }}
          rows={1}
          maxLength={2000}
          placeholder={question ? "" : `${typed}|`}
          aria-label={t("landing.askLabel")}
          className="max-h-40 min-h-[44px] flex-1 resize-none bg-transparent py-2.5 text-left text-[16px] leading-relaxed outline-none placeholder:text-ink-muted"
        />
        <button
          type="submit"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-white transition-opacity hover:opacity-85 disabled:opacity-30"
          disabled={!question.trim()}
          aria-label={t("landing.askSend")}
        >
          <ArrowUp size={20} strokeWidth={2.4} />
        </button>
      </form>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {chips.map((c, i) => (
          <motion.button
            key={`${round}-${i}`}
            type="button"
            onClick={() => ask(c)}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.06 }}
            className="max-w-full truncate rounded-full border border-line px-3.5 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:border-ink/20 hover:text-ink"
          >
            {c}
          </motion.button>
        ))}
      </div>

      <p className="mt-8 text-sm text-ink-muted">
        {t("landing.trust1")} · {t("landing.trust2")} · {t("landing.trust3")}
      </p>
    </section>
  );
}

function SectionHead({ eyebrow, title, body }: { eyebrow: TKey; title: TKey; body?: TKey }) {
  const { t } = useT();
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-semibold text-brand-600">{t(eyebrow)}</p>
      <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{t(title)}</h2>
      {body && <p className="mt-3 text-lg text-ink-soft">{t(body)}</p>}
    </div>
  );
}

function HowItWorks() {
  const { t } = useT();
  const steps: [TKey, TKey][] = [
    ["landing.how1t", "landing.how1d"],
    ["landing.how2t", "landing.how2d"],
    ["landing.how3t", "landing.how3d"],
    ["landing.how4t", "landing.how4d"],
  ];
  return (
    <section id="how" className="border-t border-line py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHead eyebrow="landing.howEyebrow" title="landing.compareTitle" body="landing.compareBody" />
        <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(([title, text], i) => (
            <li key={title}>
              <span className="font-display text-sm font-bold text-ink-muted">0{i + 1}</span>
              <h3 className="mt-2 text-lg font-bold">{t(title)}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">{t(text)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Features() {
  const { t } = useT();
  const features: { icon: typeof Camera; title: TKey; text: TKey }[] = [
    { icon: MessageCircleQuestion, title: "landing.f1t", text: "landing.f1d" },
    { icon: Camera, title: "landing.f2t", text: "landing.f2d" },
    { icon: PlayCircle, title: "landing.f3t", text: "landing.f3d" },
    { icon: Swords, title: "landing.f4t", text: "landing.f4d" },
    { icon: Users, title: "landing.f7t", text: "landing.f7d" },
    { icon: ShieldCheck, title: "landing.f8t", text: "landing.f8d" },
  ];
  return (
    <section id="features" className="bg-cream/50 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHead eyebrow="landing.featEyebrow" title="landing.featTitle" body="landing.levelsBody" />
        <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title}>
              <f.icon size={22} className="text-ink" strokeWidth={1.8} />
              <h3 className="mt-3 text-lg font-bold">{t(f.title)}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">{t(f.text)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Safety() {
  const { t } = useT();
  const items: [TKey, TKey][] = [
    ["landing.s1t", "landing.s1d"],
    ["landing.s2t", "landing.s2d"],
    ["landing.s4t", "landing.s4d"],
    ["landing.s6t", "landing.s6d"],
  ];
  return (
    <section id="safety" className="py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="text-sm font-semibold text-brand-600">{t("landing.safetyEyebrow")}</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{t("landing.safetyTitle")}</h2>
          <p className="mt-3 text-lg text-ink-soft">{t("landing.safetyBody")}</p>
        </div>
        <ul className="divide-y divide-line border-y border-line">
          {items.map(([title, text]) => (
            <li key={title} className="flex gap-3 py-5">
              <Check size={18} strokeWidth={2.5} className="mt-1 shrink-0 text-mint-600" />
              <div>
                <p className="font-bold">{t(title)}</p>
                <p className="mt-1 text-[15px] leading-relaxed text-ink-soft">{t(text)}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FinalCta() {
  const { t } = useT();
  return (
    <section id="parents" className="border-t border-line py-24">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
        <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{t("landing.parentsTitle")}</h2>
        <p className="mt-3 text-lg text-ink-soft">{t("landing.parentsBody")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-semibold text-white transition-opacity hover:opacity-85">
            {t("landing.cta")} <ArrowRight size={18} />
          </Link>
          <Link href="/signup?role=PARENT" className="inline-flex items-center rounded-full border border-line px-6 py-3 font-semibold text-ink transition-colors hover:border-ink/25">
            {t("landing.ctaParent")}
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const { t } = useT();
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-ink-muted sm:flex-row sm:px-6">
        <div className="flex items-center gap-3">
          <Logo size={26} />
          <span>© {new Date().getFullYear()} · {t("landing.footer")}</span>
        </div>
        <nav className="flex gap-5">
          <a href="#how" className="hover:text-ink">{t("landing.navHow")}</a>
          <a href="#features" className="hover:text-ink">{t("landing.navFeatures")}</a>
          <a href="#safety" className="hover:text-ink">{t("landing.navSafety")}</a>
          <Link href="/login" className="hover:text-ink">{t("landing.login")}</Link>
        </nav>
      </div>
    </footer>
  );
}

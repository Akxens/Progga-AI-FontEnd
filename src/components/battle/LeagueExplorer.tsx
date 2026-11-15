"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Users } from "lucide-react";
import { useEffect, useRef } from "react";
import useSWR, { preload } from "swr";
import { useFormat, useT } from "@/i18n";
import { fetcher } from "@/lib/api";
import type { LeagueFamily, LeagueRoster } from "@/lib/battle";
import { LEAGUE_COLOR, LeagueBadge, TrophyIcon } from "./art";
import { PlayerAvatar } from "./Versus";

const FAMILIES: LeagueFamily[] = ["unranked", "bronze", "silver", "gold", "crystal", "master", "champion", "titan", "legend"];
const MEDAL = ["bg-gradient-to-b from-banana-300 to-banana-500 text-ink", "bg-gradient-to-b from-slate-200 to-slate-400 text-ink", "bg-gradient-to-b from-orange-300 to-orange-500 text-white"];

const parseLeague = (id: string) => {
  const [family, div] = id.split("-");
  return { family: family as LeagueFamily, division: (Number(div) || 0) as 0 | 1 | 2 | 3 };
};

/**
 * "Who's in each league?" for the student's class: one tab per league, each
 * listing the students and practice rivals there, ranked by trophies.
 */
export function LeagueExplorer({ grade, myFamily, family, onFamily }: { grade: number; myFamily: LeagueFamily; family: LeagueFamily; onFamily: (f: LeagueFamily) => void }) {
  const { t, tx, n, ui } = useT();
  const { classNo } = useFormat();
  const { data } = useSWR<LeagueRoster>(`/battle/leagues/${family}`, { keepPreviousData: true });
  const tabRefs = useRef<Partial<Record<LeagueFamily, HTMLButtonElement | null>>>({});
  const color = LEAGUE_COLOR[family];
  const shown = data?.family === family ? data : undefined;
  const loading = !shown;

  // keep the chosen tab in view on narrow screens
  useEffect(() => {
    tabRefs.current[family]?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [family]);

  return (
    <section id="league-explorer" className="card scroll-mt-24 overflow-hidden">
      <div className="flex flex-wrap items-end justify-between gap-2 px-5 pt-5">
        <div>
          <h2 className="flex items-center gap-2 font-display text-xl font-extrabold">
            <Users size={20} className="text-brand-500" /> {t("battle.explorerTitle")}
          </h2>
          <p className="text-sm font-semibold text-ink-muted">{t("battle.explorerSub", { n: classNo(grade) })}</p>
        </div>
      </div>

      {/* league tabs */}
      <div className="mt-4 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]" role="tablist">
        {FAMILIES.map((f) => {
          const active = f === family;
          const c = LEAGUE_COLOR[f];
          return (
            <button
              key={f}
              ref={(el) => {
                tabRefs.current[f] = el;
              }}
              role="tab"
              aria-selected={active}
              onClick={() => onFamily(f)}
              // start loading a league as soon as the pointer or focus lands on its tab
              onMouseEnter={() => void preload(`/battle/leagues/${f}`, fetcher)}
              onFocus={() => void preload(`/battle/leagues/${f}`, fetcher)}
              className={clsx(
                "relative flex shrink-0 items-center gap-2 rounded-2xl border-2 py-1.5 pl-1.5 pr-3 font-display text-sm font-bold transition-all",
                active ? "shadow-soft" : "border-line bg-white text-ink-soft hover:-translate-y-0.5 hover:border-brand-200",
              )}
              style={active ? { borderColor: c, background: `${c}1f`, color: "var(--color-ink)" } : undefined}
            >
              <LeagueBadge family={f} division={1} size={30} />
              {tx(`battle.families.${f}`, f)}
              {data?.counts && (
                <span className={clsx("rounded-full px-1.5 py-0.5 text-[11px] font-extrabold", active ? "bg-white/80" : "bg-cream text-ink-muted")}>{n(data.counts[f])}</span>
              )}
              {f === myFamily && <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-banana-400 ring-2 ring-white" title={t("battle.explorerYours")} />}
            </button>
          );
        })}
      </div>

      {/* selected league banner */}
      <div className="relative mx-5 mt-4 overflow-hidden rounded-3xl px-5 py-4 text-white" style={{ background: `linear-gradient(120deg, ${color}, ${color}b3 55%, #1e1b4b)` }}>
        <div className="bg-dots absolute inset-0 opacity-20 [filter:invert(1)]" />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={family} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }} className="relative flex items-center gap-4">
            <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}>
              <LeagueBadge family={family} division={1} size={76} glow />
            </motion.div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-2xl font-extrabold leading-tight drop-shadow">{tx(`battle.families.${family}`, family)}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5 text-xs font-bold">
                {shown && (
                  <span className="flex items-center gap-1 rounded-full bg-black/20 px-2.5 py-1">
                    <TrophyIcon size={13} /> {family === "legend" ? t("battle.explorerRangeTop", { a: shown.min }) : t("battle.explorerRange", { a: shown.min, b: shown.max })}
                  </span>
                )}
                {shown && <span className="rounded-full bg-black/20 px-2.5 py-1">{t("battle.explorerPlayers", { n: shown.players.length })}</span>}
                {family === myFamily && <span className="rounded-full bg-banana-300 px-2.5 py-1 text-ink">⭐ {t("battle.explorerYours")}</span>}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* players */}
      <div className="px-5 pb-5 pt-3">
        {loading ? (
          <ul className="grid grid-cols-1 gap-x-6 md:grid-cols-2">
            {Array.from({ length: 8 }, (_, i) => (
              <li key={i} className="flex items-center gap-3 border-b border-line/70 py-2.5">
                <span className="h-8 w-8 animate-pulse rounded-full bg-cream" />
                <span className="h-9 w-9 animate-pulse rounded-full bg-cream" />
                <span className="h-4 flex-1 animate-pulse rounded-full bg-cream" />
              </li>
            ))}
          </ul>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.ol key={shown.family} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="grid grid-cols-1 gap-x-6 md:grid-cols-2">
              {shown.players.map((pl, i) => {
                const lg = parseLeague(pl.leagueId);
                return (
                  <motion.li
                    key={pl.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i, 12) * 0.025, duration: 0.25 }}
                    className={clsx("flex items-center gap-2 border-b border-line/70 px-1 py-2 sm:gap-3", pl.isMe && "rounded-2xl border-transparent bg-banana-50 ring-2 ring-banana-300")}
                  >
                    <span className={clsx("grid h-8 w-8 shrink-0 place-items-center rounded-full font-display text-sm font-black", MEDAL[pl.rank - 1] ?? "bg-cream text-ink-soft")}>{n(pl.rank)}</span>
                    <PlayerAvatar skin={pl.skin} size={38} ring={pl.isMe ? "ring-banana-300" : "ring-line"} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display font-bold leading-tight">
                        {ui === "bn" && pl.nameBn ? pl.nameBn : pl.name}
                        {pl.isMe && <span className="ml-1 text-xs font-extrabold text-banana-700">({t("battle.youAreHere")})</span>}
                      </p>
                      <p className="flex items-center gap-1 text-xs font-semibold text-ink-muted">
                        {t("common.levelN", { n: pl.level })}
                        {pl.isBot && (
                          <span title={t("battle.practiceRival")} aria-label={t("battle.practiceRival")} className="text-ink-muted/70">
                            · <Bot size={12} className="inline -translate-y-px" />
                          </span>
                        )}
                      </p>
                    </div>
                    {/* the banner already names the league; phones skip the per-row icon to make room for names */}
                    <LeagueBadge family={lg.family} division={lg.division} size={28} className="hidden sm:block" />
                    <span className="flex w-16 shrink-0 items-center justify-end gap-1 font-display font-extrabold tabular-nums">
                      <TrophyIcon size={15} /> {n(pl.trophies)}
                    </span>
                  </motion.li>
                );
              })}
            </motion.ol>
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}

"use client";

import clsx from "clsx";
import Link from "next/link";
import useSWR from "swr";
import { LeagueBadge, TrophyIcon } from "@/components/battle/art";
import { useLeagueName } from "@/components/battle/shared";
import { ProggaBot } from "@/components/brand/ProggaBot";
import { Avatar } from "@/components/profile/Avatar";
import { useFormat, useT } from "@/i18n";
import type { Standing } from "@/lib/battle";
import { useFeatures } from "@/lib/features";
import { paletteFor } from "@/lib/skins";
import type { User } from "@/lib/types";

/**
 * A student's game profile at a glance: nickname, level star + funny title,
 * XP bar, Kola coins, league badge and trophies.
 */
export function ProfileCard({ user, className }: { user: User; className?: string }) {
  const { t, tx, n } = useT();
  const { gradeLabel } = useFormat();
  const leagueName = useLeagueName();
  const { features } = useFeatures();
  const { data: standing } = useSWR<Standing>(features.battle && user.grade ? "/battle/standing" : null);
  const lvl = user.level!;
  const nickname = user.profile?.nickname?.trim();

  return (
    <section className={clsx("card overflow-hidden", className)}>
      <div className="relative bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 p-5 text-white sm:p-6">
        <div className="bg-dots absolute inset-0 opacity-20" />
        <div className="relative flex items-center gap-4">
          {user.photoUrl ? (
            <Avatar name={user.name} photoUrl={user.photoUrl} size={64} className="shrink-0 ring-4 ring-white/30" />
          ) : (
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/15 ring-4 ring-white/20">
              <ProggaBot size={52} float={false} palette={user.skin?.palette ?? paletteFor(user.avatarSkin)} />
            </span>
          )}
          <div className="min-w-0">
            <h2 className="truncate font-display text-2xl font-extrabold leading-tight sm:text-3xl">{nickname || user.name}</h2>
            <p className="truncate text-sm font-semibold text-brand-100">{[nickname && user.name, gradeLabel(user.grade)].filter(Boolean).join(" · ")}</p>
          </div>
        </div>

        {/* level star + XP bar */}
        <div className="relative mt-5 flex items-center gap-3">
          <LevelStar level={lvl.level} />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate font-display text-lg font-extrabold">{tx(`levelTitles.${lvl.title}`, lvl.title)}</span>
              <span className="shrink-0 text-sm font-bold tabular-nums text-brand-100">
                {lvl.maxed ? t("card.maxLevel") : `${n(lvl.xp - lvl.levelStartXp)} / ${n(lvl.nextLevelXp - lvl.levelStartXp)} XP`}
              </span>
            </div>
            <div className="mt-1.5 h-4 overflow-hidden rounded-full bg-black/25 ring-1 ring-white/20">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-300 via-cyan-300 to-emerald-300 shadow-[inset_0_-3px_0_rgba(0,0,0,0.15)] transition-[width] duration-700"
                style={{ width: `${Math.max(3, lvl.progress * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* coins · league · trophies */}
      <div className={clsx("grid divide-x divide-line", features.battle ? "grid-cols-3" : "grid-cols-1")}>
        <Tile href="/rewards" label={t("card.kola")}>
          <span className="text-2xl leading-none">🍌</span>
          <span className="font-display text-xl font-extrabold tabular-nums">{n(user.coins ?? 0)}</span>
        </Tile>
        {features.battle && (
          <>
        <Tile href="/battle" label={standing ? leagueName(standing.league.family, standing.league.division) : user.grade ? "…" : t("card.noClass")}>
          {standing ? (
            <LeagueBadge family={standing.league.family} division={standing.league.division} size={44} glow />
          ) : (
            <span className="h-11 w-11 animate-pulse rounded-full bg-cream" />
          )}
        </Tile>
        <Tile href="/battle" label={t("card.trophies")} title={standing ? t("card.best", { n: standing.bestTrophies }) : undefined}>
          <TrophyIcon size={26} />
          <span className="font-display text-xl font-extrabold tabular-nums">{standing ? n(standing.trophies) : "–"}</span>
        </Tile>
          </>
        )}
      </div>
    </section>
  );
}

function Tile({ href, label, title, children }: { href: string; label: string; title?: string; children: React.ReactNode }) {
  return (
    <Link href={href} title={title} className="flex min-w-0 flex-col items-center justify-center gap-1 px-2 py-4 text-center transition-colors hover:bg-cream">
      <span className="flex h-11 items-center gap-1.5">{children}</span>
      <span className="line-clamp-2 text-xs font-bold text-ink-muted">{label}</span>
    </Link>
  );
}

/** Blue XP star with the level number, trophy-road style. */
function LevelStar({ level }: { level: number }) {
  const { n } = useT();
  return (
    <span className="relative grid h-14 w-14 shrink-0 place-items-center">
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full drop-shadow-[0_3px_0_rgba(0,0,0,0.25)]" aria-hidden>
        <defs>
          <linearGradient id="lvl-star" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7dd3fc" />
            <stop offset="1" stopColor="#2563eb" />
          </linearGradient>
        </defs>
        <path
          d="M50 4 L62 34 L95 36 L69 57 L78 90 L50 72 L22 90 L31 57 L5 36 L38 34 Z"
          fill="url(#lvl-star)"
          stroke="#fff"
          strokeWidth="5"
          strokeLinejoin="round"
        />
      </svg>
      <span className="relative mt-1 font-display text-base font-extrabold text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">{n(level)}</span>
    </span>
  );
}

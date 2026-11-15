"use client";

import clsx from "clsx";
import { useId } from "react";
import type { LeagueFamily } from "@/lib/battle";

// League badges: the illustrated icons in /public/images/leagues (one per league
// and division, cut out and compressed from the source art). Unranked has no
// icon, so it gets a small drawn grey shield in the same spirit.

/** Each family's signature colour: glows, tints and progress bars. */
export const LEAGUE_COLOR: Record<LeagueFamily, string> = {
  unranked: "#94a3b8",
  bronze: "#e08a45",
  silver: "#a7b4c6",
  gold: "#f5b819",
  crystal: "#2ea0f2",
  master: "#a855f7",
  champion: "#ef4444",
  titan: "#3b82f6",
  legend: "#d946ef",
};

/** Path of a league icon; small badges load the lighter 128px file. */
export const leagueIcon = (family: Exclude<LeagueFamily, "unranked">, division: number, size: number) =>
  `/images/leagues/${family}-${division || 3}-${size > 64 ? 320 : 128}.webp`;

function UnrankedShield({ size }: { size: number }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden>
      <defs>
        <linearGradient id={`r${id}`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#f8fafc" />
          <stop offset="0.5" stopColor="#a8b3c2" />
          <stop offset="1" stopColor="#4b5565" />
        </linearGradient>
        <radialGradient id={`b${id}`} cx="0.4" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#cfd8e3" />
          <stop offset="1" stopColor="#5b6b80" />
        </radialGradient>
      </defs>
      <path d="M50 6 C57 10 68 13 82 14 Q88 14.5 88 20 V48 C88 71 72 87 50 96 C28 87 12 71 12 48 V20 Q12 14.5 18 14 C32 13 43 10 50 6 Z" fill={`url(#r${id})`} stroke="#334155" strokeOpacity="0.5" strokeWidth="1.6" />
      <path d="M50 16 C56 19 65 21 76 22 V48 C76 66 64 79 50 86 C36 79 24 66 24 48 V22 C35 21 44 19 50 16 Z" fill={`url(#b${id})`} />
      <circle cx="50" cy="50" r="13" fill="none" stroke="#e2e8f0" strokeWidth="7" />
      <path d="M26 22 C36 21 44 19 50 16 V40 C40 36 31 33 24 33 Z" fill="#fff" opacity="0.18" />
    </svg>
  );
}

export function LeagueBadge({
  family,
  division = 0,
  size = 64,
  className,
  glow = false,
  dim = false,
}: {
  family: LeagueFamily;
  division?: 0 | 1 | 2 | 3;
  size?: number;
  className?: string;
  glow?: boolean;
  dim?: boolean;
}) {
  const style = glow ? { filter: `drop-shadow(0 0 ${Math.max(4, size / 8)}px ${LEAGUE_COLOR[family]}aa)` } : undefined;
  // locked leagues stay in colour (so kids see what they're climbing towards), just softened
  const cls = clsx("shrink-0 select-none", dim && "opacity-70 saturate-[0.55]", className);
  if (family === "unranked") {
    return (
      <span className={cls} style={style}>
        <UnrankedShield size={size} />
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- tiny pre-sized static icons
    <img src={leagueIcon(family, division, size)} alt="" width={size} height={size} loading="lazy" decoding="async" draggable={false} className={cls} style={style} />
  );
}

/** Glossy gold cup. */
export function TrophyIcon({ size = 24, className }: { size?: number; className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={clsx("shrink-0 overflow-visible", className)} aria-hidden>
      <defs>
        <linearGradient id={`cyl${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#b86e00" />
          <stop offset="0.28" stopColor="#ffe88a" />
          <stop offset="0.5" stopColor="#ffc928" />
          <stop offset="1" stopColor="#9a5600" />
        </linearGradient>
        <linearGradient id={`base${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a4e12" />
          <stop offset="1" stopColor="#4a2306" />
        </linearGradient>
      </defs>
      <ellipse cx="32" cy="61" rx="18" ry="2.5" fill="#000" opacity="0.25" />
      <path d="M15 15 H8.5 C7 15 6 16 6 17.5 C6 26 11 31.5 18 32.5 M49 15 H55.5 C57 15 58 16 58 17.5 C58 26 53 31.5 46 32.5" fill="none" stroke="#7a4300" strokeWidth="6" strokeLinecap="round" />
      <path d="M15 15 H8.5 C7 15 6 16 6 17.5 C6 26 11 31.5 18 32.5 M49 15 H55.5 C57 15 58 16 58 17.5 C58 26 53 31.5 46 32.5" fill="none" stroke={`url(#cyl${id})`} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M27.5 41 H36.5 L35.5 48 H28.5 Z" fill={`url(#cyl${id})`} stroke="#7a4300" strokeWidth="1.4" />
      <path d="M21 47 H43 L45.5 52 H18.5 Z" fill={`url(#cyl${id})`} stroke="#7a4300" strokeWidth="1.4" strokeLinejoin="round" />
      <rect x="15" y="51.5" width="34" height="8.5" rx="2" fill={`url(#base${id})`} stroke="#3b1a04" strokeWidth="1.4" />
      <rect x="23" y="53.6" width="18" height="4" rx="1" fill="#ffd34d" opacity="0.85" />
      <path d="M14 9 H50 V22 C50 34 42 42 32 42 C22 42 14 34 14 22 Z" fill={`url(#cyl${id})`} stroke="#7a4300" strokeWidth="1.6" strokeLinejoin="round" />
      <ellipse cx="32" cy="9" rx="18" ry="3.6" fill="#8a4e00" stroke="#7a4300" strokeWidth="1.4" />
      <ellipse cx="32" cy="9.8" rx="14.5" ry="2.2" fill="#c27c00" />
      <path d="M14.4 9.6 A18 3.6 0 0 0 49.6 9.6" fill="none" stroke="#fff6c4" strokeWidth="1.2" />
      <path d="M32 17 L34.2 21.6 L39.2 22.3 L35.6 25.8 L36.5 30.8 L32 28.4 L27.5 30.8 L28.4 25.8 L24.8 22.3 L29.8 21.6 Z" fill="#fff8d6" stroke="#b86e00" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M19 13 C19 24 21 32 25.5 37.5 C20.5 36 17 29.5 17 21.5 V13 Z" fill="#fff" opacity="0.55" />
      <path d="M53 3 L53.8 5.2 L56 6 L53.8 6.8 L53 9 L52.2 6.8 L50 6 L52.2 5.2 Z" fill="#fff" />
    </svg>
  );
}

/** Crossed swords for the arena header and search screen. */
export function SwordsIcon({ size = 48, className }: { size?: number; className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={clsx("shrink-0 overflow-visible", className)} aria-hidden>
      <defs>
        <linearGradient id={`b${id}`} x1="0" y1="0" x2="1" y2="0.2">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#dbe6f3" />
          <stop offset="0.52" stopColor="#8aa0bb" />
          <stop offset="1" stopColor="#c7d4e4" />
        </linearGradient>
        <linearGradient id={`h${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff2a8" />
          <stop offset="0.5" stopColor="#ffc21a" />
          <stop offset="1" stopColor="#a35d00" />
        </linearGradient>
        <radialGradient id={`g${id}`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.3" stopColor="#ff7a93" />
          <stop offset="1" stopColor="#b0002a" />
        </radialGradient>
      </defs>
      {[0, 1].map((i) => (
        <g key={i} transform={i ? "scale(-1 1) translate(-100 0)" : undefined}>
          <path d="M12 6 L23 5 L73 61 L63 71 Z" fill={`url(#b${id})`} stroke="#253246" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M16 9 L22 8.5 L68 60" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity="0.9" />
          <path d="M56 76 L76 56 L83 63 L63 83 Z" fill={`url(#h${id})`} stroke="#6b3d00" strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx="69.5" cy="69.5" r="3.6" fill={`url(#g${id})`} stroke="#6b0018" strokeWidth="1.2" />
          <path d="M70 77 L80 87 L87 80 L77 70 Z" fill="#7c2d12" stroke="#3b1406" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M72.5 76.5 L80.5 84.5 M76.5 72.5 L84.5 80.5" stroke="#b45a2a" strokeWidth="1.4" />
          <circle cx="87" cy="89" r="5.5" fill={`url(#h${id})`} stroke="#6b3d00" strokeWidth="2" />
          <circle cx="85.5" cy="87.5" r="1.6" fill="#fff" opacity="0.85" />
        </g>
      ))}
    </svg>
  );
}

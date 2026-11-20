"use client";

import clsx from "clsx";
import { Bot, ChevronLeft, Crown, FlaskConical, Home, LogOut, PlayCircle, Swords, Trophy, UserRound, Zap } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Logo, ProggaMark } from "@/components/brand/Logo";
import { ProggaBot } from "@/components/brand/ProggaBot";
import { Avatar } from "@/components/profile/Avatar";
import { useT, type TKey } from "@/i18n";
import { useFeatures, type FeatureId, type Features } from "@/lib/features";
import { paletteFor } from "@/lib/skins";
import type { User } from "@/lib/types";
import { useLogout } from "@/lib/useMe";

// The student app's desktop menu, shared by the main shell and Ask Progga.

export interface NavItem {
  href: string;
  label: TKey;
  short?: TKey;
  icon: typeof Home;
  hot?: boolean;
  /** only shown while an admin has this feature switched on */
  feature?: FeatureId;
}

const NAV_GROUPS: { label: TKey; items: NavItem[] }[] = [
  {
    label: "nav.groupLearn",
    items: [
      { href: "/home", label: "nav.home", icon: Home },
      { href: "/tutor", label: "nav.ask", icon: Bot },
      { href: "/lessons", label: "nav.lessons", icon: PlayCircle },
      { href: "/lab", label: "nav.lab", short: "nav.labShort", icon: FlaskConical, feature: "lab" },
    ],
  },
  {
    label: "nav.groupPlay",
    items: [
      { href: "/arena", label: "nav.arena", icon: Zap },
      { href: "/battle", label: "nav.battle", short: "nav.battleShort", icon: Swords, hot: true, feature: "battle" },
    ],
  },
  {
    label: "nav.groupMe",
    items: [
      { href: "/rewards", label: "nav.rewards", icon: Trophy },
      { href: "/leaderboard", label: "nav.leaderboard", icon: Crown },
      { href: "/profile", label: "nav.profile", icon: UserRound },
    ],
  },
];
export const NAV = NAV_GROUPS.flatMap((g) => g.items);

/** Drops menu items whose feature an admin has hidden. */
export const visibleNav = (items: NavItem[], features: Features) => items.filter((i) => !i.feature || features[i.feature]);

const SIDEBAR_WIDE = "16rem";
const SIDEBAR_SLIM = "5rem";
const COLLAPSED_KEY = "progga_nav_collapsed";
/** Pages that want the room: the menu starts as a slim rail there (Battle Arena, Ask Progga). */
const AUTO_COLLAPSE = ["/battle", "/tutor"];

export const isUnder = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

/** Sets --sidebar-w so the page (and fixed bars, e.g. the profile save bar) stay clear of the menu. */
export const sidebarVars = (collapsed: boolean) => ({ "--sidebar-w": collapsed ? SIDEBAR_SLIM : SIDEBAR_WIDE }) as React.CSSProperties;

/**
 * Collapsed state of the desktop sidebar. The student's choice is remembered on
 * this device; Battle Arena and Ask Progga start collapsed regardless, and
 * opening it there only lasts until the next page.
 */
export function useSidebar(pathname: string) {
  const [pref, setPref] = useState(() => {
    try {
      return typeof window !== "undefined" && localStorage.getItem(COLLAPSED_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [override, setOverride] = useState<{ path: string; collapsed: boolean } | null>(null);
  const auto = AUTO_COLLAPSE.some((p) => isUnder(pathname, p));
  const collapsed = override?.path === pathname ? override.collapsed : auto || pref;

  const toggle = useCallback(() => {
    const next = !collapsed;
    if (auto) return setOverride({ path: pathname, collapsed: next });
    setOverride(null);
    setPref(next);
    try {
      localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
    } catch {
      // private mode: the choice just won't stick
    }
  }, [auto, collapsed, pathname]);

  // Ctrl/⌘ + B, like most editors (ignored while typing)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== "b" || e.shiftKey || e.altKey) return;
      if (e.target instanceof Element && e.target.closest("input, textarea, select, [contenteditable='true']")) return;
      e.preventDefault();
      toggle();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  return { collapsed, toggle };
}

export function Sidebar({ user, pathname, collapsed, toggle }: { user: User; pathname: string; collapsed: boolean; toggle: () => void }) {
  const { t } = useT();
  const { features } = useFeatures();
  const groups = NAV_GROUPS.map((g) => ({ ...g, items: visibleNav(g.items, features) })).filter((g) => g.items.length > 0);
  return (
    <aside
      style={{ width: "var(--sidebar-w)" }}
      className="fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-line bg-white/85 backdrop-blur transition-[width] duration-300 ease-out lg:flex"
    >
      <div className={clsx("flex h-[4.5rem] shrink-0 items-center border-b border-line/70", collapsed ? "justify-center" : "px-5")}>
        <Link href="/home" aria-label="Progga AI">
          {collapsed ? <ProggaMark size={38} /> : <Logo size={34} />}
        </Link>
      </div>

      {/* edge handle: always reachable, in both states */}
      <button
        onClick={toggle}
        aria-label={collapsed ? t("nav.expand") : t("nav.collapse")}
        aria-expanded={!collapsed}
        title={`${collapsed ? t("nav.expand") : t("nav.collapse")} (Ctrl+B)`}
        className="absolute -right-3.5 top-[3.5rem] z-10 grid h-7 w-7 place-items-center rounded-full border border-line bg-white text-ink-soft shadow-soft transition-colors hover:border-brand-300 hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-brand-400"
      >
        <ChevronLeft size={16} strokeWidth={2.8} className={clsx("transition-transform duration-300", collapsed && "rotate-180")} />
      </button>

      {/* tooltips stick out to the right, so the slim rail can't clip */}
      <nav className={clsx("flex-1 px-3 py-3", collapsed ? "overflow-visible" : "overflow-y-auto overflow-x-hidden")}>
        {groups.map((g, gi) => (
          <div key={g.label} className={clsx(gi > 0 && "mt-4")}>
            {collapsed ? (
              gi > 0 && <div className="mx-auto mb-3 h-px w-8 bg-line" />
            ) : (
              <p className="mb-1 px-3 text-[0.7rem] font-extrabold uppercase tracking-[0.14em] text-ink-muted">{t(g.label)}</p>
            )}
            <div className="flex flex-col gap-1">
              {g.items.map((item) => (
                <NavLink key={item.href} item={item} active={isUnder(pathname, item.href)} collapsed={collapsed} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <SidebarUser user={user} collapsed={collapsed} />
    </aside>
  );
}

function NavLink({ item, active, collapsed }: { item: NavItem; active: boolean; collapsed: boolean }) {
  const { t } = useT();
  const { href, label, icon: Icon, hot } = item;
  return (
    <Link
      href={href}
      aria-label={collapsed ? t(label) : undefined}
      aria-current={active ? "page" : undefined}
      className={clsx(
        "group relative flex items-center gap-3 rounded-2xl py-1.5 font-display text-[1.02rem] font-bold transition-colors",
        collapsed ? "justify-center px-0" : "px-2.5",
        active ? "bg-brand-50 text-brand-600" : "text-ink-soft hover:bg-cream hover:text-ink",
      )}
    >
      {active && <span className="absolute -left-3 top-1/2 h-7 w-1.5 -translate-y-1/2 rounded-r-full bg-brand-500" />}
      <span
        className={clsx(
          "relative grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-all",
          active
            ? "bg-brand-500 text-white shadow-[0_3px_0_0_var(--color-brand-700)]"
            : hot
              ? "bg-gradient-to-b from-orange-400 to-rose-500 text-white shadow-[0_3px_0_0_#9f1239] group-hover:-translate-y-0.5"
              : "bg-cream text-ink-soft group-hover:-translate-y-0.5 group-hover:bg-white group-hover:shadow-soft",
        )}
      >
        <Icon size={19} strokeWidth={2.4} />
        {hot && !active && collapsed && <span className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-rose-500 ring-2 ring-white" />}
      </span>
      {!collapsed && <span className="truncate whitespace-nowrap">{t(label)}</span>}
      {hot && !active && !collapsed && <span className="ml-auto h-2 w-2 shrink-0 animate-pulse rounded-full bg-rose-500" />}
      {collapsed && <Tip>{t(label)}</Tip>}
    </Link>
  );
}

/** Label that slides out beside a slim-rail icon on hover or keyboard focus. */
function Tip({ children }: { children: React.ReactNode }) {
  return (
    <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-4 -translate-x-1 -translate-y-1/2 whitespace-nowrap rounded-xl bg-ink px-3 py-1.5 font-display text-sm font-bold text-white opacity-0 shadow-lift transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100">
      {children}
    </span>
  );
}

function SidebarUser({ user, collapsed }: { user: User; collapsed: boolean }) {
  const { t, tx, n } = useT();
  const logout = useLogout();
  const lvl = user.level!;
  const face = user.photoUrl ? (
    <Avatar name={user.name} photoUrl={user.photoUrl} size={collapsed ? 44 : 46} className="ring-2 ring-white/40" />
  ) : (
    <ProggaBot size={collapsed ? 44 : 46} float={false} palette={user.skin?.palette ?? paletteFor(user.avatarSkin)} />
  );

  if (collapsed) {
    return (
      <div className="flex shrink-0 flex-col items-center gap-2 border-t border-line/70 py-4">
        <Link href="/profile" aria-label={t("nav.profile")} className="group relative rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-1">
          {face}
          <span className="absolute -bottom-1.5 -right-1.5 grid h-6 min-w-6 place-items-center rounded-full bg-banana-400 px-1 font-display text-[0.7rem] font-extrabold text-ink ring-2 ring-white">
            {n(lvl.level)}
          </span>
          <Tip>{user.profile?.nickname?.trim() || user.name}</Tip>
        </Link>
        <button onClick={logout} aria-label={t("common.logout")} className="group relative grid h-10 w-10 place-items-center rounded-xl text-ink-muted hover:bg-coral-50 hover:text-coral-600">
          <LogOut size={18} />
          <Tip>{t("common.logout")}</Tip>
        </button>
      </div>
    );
  }

  return (
    <div className="shrink-0 p-3">
      <div className="rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 p-3.5 text-white">
        <div className="flex items-center gap-3">
          <Link href="/profile" className="flex min-w-0 flex-1 items-center gap-3">
            {face}
            <div className="min-w-0">
              <p className="truncate font-display font-bold leading-tight">{user.profile?.nickname?.trim() || user.name}</p>
              <p className="truncate text-xs font-semibold text-brand-100">
                {t("common.levelN", { n: lvl.level })} · {tx(`levelTitles.${lvl.title}`, lvl.title)}
              </p>
            </div>
          </Link>
          <button onClick={logout} aria-label={t("common.logout")} title={t("common.logout")} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/15 hover:bg-white/25">
            <LogOut size={16} />
          </button>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/20">
          <div className="h-full rounded-full bg-gradient-to-r from-sky-300 to-emerald-300" style={{ width: `${Math.max(3, lvl.progress * 100)}%` }} />
        </div>
      </div>
    </div>
  );
}

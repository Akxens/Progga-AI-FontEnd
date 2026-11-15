"use client";

import clsx from "clsx";
import { ArrowLeftRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProggaBot } from "@/components/brand/ProggaBot";
import { Logo } from "@/components/brand/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { NAV, Sidebar, isUnder, sidebarVars, useSidebar } from "@/components/layout/Sidebar";
import { Avatar } from "@/components/profile/Avatar";
import { PageLoader } from "@/components/ui/primitives";
import { useSyncAccountLanguage, useT } from "@/i18n";
import { homeFor } from "@/lib/routes";
import { paletteFor } from "@/lib/skins";
import { firstName } from "@/lib/format";
import { useMe, useSwitchProfile } from "@/lib/useMe";
import type { User } from "@/lib/types";

const MOBILE_NAV = NAV.filter((n) => ["/home", "/tutor", "/lessons", "/lab", "/arena", "/battle", "/rewards"].includes(n.href));

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useMe();
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useT();
  const sidebar = useSidebar(pathname);
  useSyncAccountLanguage(user);

  useEffect(() => {
    if (user && user.role !== "STUDENT") router.replace(homeFor(user.role));
  }, [user, router]);

  if (isLoading || !user || user.role !== "STUDENT") return <PageLoader label={t("common.wakingUp")} />;

  return (
    <div className="min-h-dvh" style={sidebarVars(sidebar.collapsed)}>
      <Sidebar user={user} pathname={pathname} {...sidebar} />

      <div className="transition-[padding] duration-300 ease-out lg:pl-[var(--sidebar-w)]">
        {user.switchedFrom && <SwitchedBar kid={user.name} parent={user.switchedFrom.name} />}
        <TopBar user={user} />
        <main className="app-container pb-28 pt-6 lg:pb-12">{children}</main>
      </div>

      {/* Mobile tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-md justify-between">
          {MOBILE_NAV.map(({ href, label, short, icon: Icon }) => (
            <Link key={href} href={href} className={clsx("flex min-w-0 flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-bold", isUnder(pathname, href) ? "text-brand-600" : "text-ink-muted")}>
              <span className={clsx("grid h-8 w-12 place-items-center rounded-full transition-colors", isUnder(pathname, href) && "bg-brand-100")}>
                <Icon size={20} strokeWidth={2.4} />
              </span>
              <span className="max-w-full truncate px-0.5">{t(short ?? label)}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

// ── Top bar ──────────────────────────────────────────────

function TopBar({ user }: { user: User }) {
  const { t, tx, n } = useT();
  const lvl = user.level!;
  return (
    <header className="sticky top-0 z-20 border-b border-line/70 bg-cream/85 backdrop-blur">
      <div className="app-container flex items-center justify-between gap-2 py-3">
        <Link href="/home" className="lg:hidden">
          <Logo size={30} />
        </Link>
        <div className="hidden min-w-0 flex-1 items-center gap-3 lg:flex">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-500 font-display text-lg font-extrabold text-white shadow-[0_3px_0_0_var(--color-brand-700)]">
            {n(lvl.level)}
          </div>
          <div className="w-full max-w-xs">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-display font-bold">{tx(`levelTitles.${lvl.title}`, lvl.title)}</span>
              <span className="font-semibold text-ink-muted">
                {lvl.maxed ? t("card.maxLevel") : `${n(lvl.xp - lvl.levelStartXp)}/${n(lvl.nextLevelXp - lvl.levelStartXp)} XP`}
              </span>
            </div>
            <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-brand-100">
              <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-[width] duration-700" style={{ width: `${lvl.progress * 100}%` }} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Stat icon="🔥" value={n(user.streak ?? 0)} label={t("nav.dayStreak")} className="bg-coral-50 text-coral-600" />
          <Stat icon="🍌" value={n(user.coins ?? 0)} label={t("home.coins", { n: user.coins ?? 0 })} className="hidden bg-banana-100 text-banana-700 sm:flex" />
          <LanguageSwitcher compact />
          <Link href="/profile" className="ml-0.5 hidden sm:block" aria-label={t("nav.profile")}>
            <span className="relative block">
              {user.photoUrl ? (
                <Avatar name={user.name} photoUrl={user.photoUrl} size={44} className="border-2 border-line" />
              ) : (
                <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-2xl border-2 border-line bg-white">
                  <ProggaBot size={34} float={false} palette={user.skin?.palette ?? paletteFor(user.avatarSkin)} />
                </span>
              )}
              {(user.profileStatus?.percent ?? 100) < 100 && <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-banana-400 ring-2 ring-cream" />}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}

/** Shown while a parent has a kid's profile open on this device. */
function SwitchedBar({ kid, parent }: { kid: string; parent: string }) {
  const { t } = useT();
  const { back } = useSwitchProfile();
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex items-center justify-center gap-3 bg-banana-100 px-4 py-2 text-sm font-bold text-banana-700">
      <span className="truncate">{t("onboard.learningAs", { name: firstName(kid) })}</span>
      <button
        onClick={() => {
          setBusy(true);
          back().catch(() => setBusy(false));
        }}
        disabled={busy}
        className="flex shrink-0 items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-ink shadow-soft hover:bg-banana-50"
      >
        <ArrowLeftRight size={14} /> {t("onboard.backTo", { name: firstName(parent) })}
      </button>
    </div>
  );
}

function Stat({ icon, value, label, className }: { icon: string; value: string; label: string; className?: string }) {
  return (
    <span className={clsx("flex items-center gap-1.5 rounded-2xl px-3 py-2 font-display text-base font-extrabold", className)} title={`${value} ${label}`}>
      <span className="text-lg leading-none">{icon}</span>
      {value}
    </span>
  );
}

"use client";

import Link from "next/link";
import { LogOut, Menu, RefreshCw, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import { Logo } from "@/components/brand/Logo";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { useAdminMe } from "@/lib/admin/useAdmin";
import { useLogout } from "@/lib/useMe";

export interface TopbarProps {
  onMenuToggle: () => void;
}

export function Topbar({ onMenuToggle }: TopbarProps) {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const { user, me } = useAdminMe();
  const logout = useLogout();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await mutate(() => true, undefined, { revalidate: true });
      router.refresh();
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-white/95 px-4 backdrop-blur sm:px-6">
      {/* Left: Hamburger & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-soft hover:bg-slate-100 hover:text-ink lg:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        <Link href="/admin" className="flex items-center gap-2.5">
          <Logo size={30} />
          <div className="flex items-center gap-2">
            <span className="font-display font-extrabold text-sm tracking-tight text-ink hidden sm:inline">
              Progga
            </span>
            <span className="rounded-full bg-ink px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
              Control Centre
            </span>
          </div>
        </Link>
      </div>

      {/* Center: Workspace Switcher */}
      <div className="hidden md:flex items-center">
        <WorkspaceSwitcher />
      </div>

      {/* Right: Actions & User Info */}
      <div className="flex items-center gap-2.5">
        <div className="md:hidden">
          <WorkspaceSwitcher />
        </div>

        <button
          onClick={handleRefresh}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-line bg-white text-ink-soft hover:bg-slate-100 hover:text-ink transition-colors"
          title="Refresh data"
          aria-label="Refresh"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin text-brand-600" : ""} />
        </button>

        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-line text-xs">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold">
            <UserIcon size={14} />
          </div>
          <div className="max-w-[130px] truncate text-left">
            <p className="font-semibold text-ink truncate">{user?.name || "Staff"}</p>
            <p className="text-[10px] text-ink-muted truncate">{me?.role || "Admin"}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-soft hover:bg-coral-50 hover:text-coral-600 transition-colors shadow-soft"
          title="Sign out of Control Centre"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>
    </header>
  );
}

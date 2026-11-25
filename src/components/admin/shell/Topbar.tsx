"use client";

import Link from "next/link";
import { Bell, LogOut, Menu, RefreshCw, Search, User as UserIcon } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");

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
    <header className="sticky top-0 z-40 flex h-14 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur">
      {/* 1. Left Navbar Header Area: matches the exact width of the left navbar (w-64) */}
      <div className="flex h-full w-full lg:w-64 lg:shrink-0 items-center justify-between border-b lg:border-b-0 lg:border-r border-slate-200/90 px-4 sm:px-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            aria-label="Toggle navigation menu"
          >
            <Menu size={20} />
          </button>

          <Link href="/admin" className="flex items-center">
            <Logo size={30} />
          </Link>
        </div>

        {/* Mobile-only right profile actions */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-sky-700 font-bold">
            <UserIcon size={14} />
          </div>
        </div>
      </div>

      {/* 2. Main Top Navbar: spans across the remaining width (to the right of left navbar) */}
      <div className="hidden lg:flex flex-1 h-full items-center justify-between px-6">
        {/* Left of Top Nav: Progga CONTROL CENTRE */}
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="font-display font-extrabold text-sm tracking-tight text-slate-900">
            Progga
          </span>
          <span className="rounded-full bg-slate-950 px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white shadow-xs">
            Control Centre
          </span>
        </div>

        {/* Center of Top Nav: Global Search Bar */}
        <div className="flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search students, courses, or anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-10 py-1.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs font-medium placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-slate-100 rounded border border-slate-200">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right of Top Nav: Workspace Switcher, Refresh, Notifications, Profile & Sign Out */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Workspace Dropdown */}
          <WorkspaceSwitcher />

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
            title="Refresh data"
            aria-label="Refresh"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin text-sky-600" : ""} />
          </button>

          {/* Notification Bell with red alert dot */}
          <button
            type="button"
            className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
            title="Notifications"
          >
            <Bell size={14} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          {/* User Profile Badge */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 text-xs">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-sky-700 font-bold">
              <UserIcon size={14} />
            </div>
            <div className="text-left leading-tight">
              <p className="font-bold text-slate-900 truncate max-w-[100px]">
                {user?.name || "Staff"}
              </p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate">
                {me?.role || "SUPER_ADMIN"}
              </p>
            </div>
          </div>

          {/* Sign out */}
          <button
            onClick={logout}
            className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors shadow-2xs cursor-pointer"
            title="Sign out of Control Centre"
          >
            <LogOut size={13} />
            <span className="text-[11px]">Log out</span>
          </button>
        </div>
      </div>
    </header>
  );
}

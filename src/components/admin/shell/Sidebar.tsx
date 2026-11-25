"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { X } from "lucide-react";
import { ADMIN_NAV_GROUPS, type NavItem } from "@/lib/admin/nav";
import { useAdminMe } from "@/lib/admin/useAdmin";
import { Logo } from "@/components/brand/Logo";

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { hasPermission } = useAdminMe();

  const isItemActive = (item: NavItem) => {
    if (item.exact) return pathname === item.href;
    if (pathname === item.href) return true;
    if (item.href !== "/admin" && pathname.startsWith(item.href)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={clsx(
          "fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        )}
      >
        {/* Header (visible on mobile drawer) */}
        <div className="flex h-14 items-center justify-between border-b border-line px-5 lg:hidden">
          <Link href="/admin" onClick={onClose} className="flex items-center gap-2.5">
            <Logo size={28} />
            <span className="font-display font-extrabold text-sm tracking-tight text-ink">Control Centre</span>
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-ink-soft hover:bg-slate-100 hover:text-ink"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Navigation Groups */}
        <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          {ADMIN_NAV_GROUPS.map((group) => {
            const visibleItems = group.items.filter((item) => {
              if (!item.permissions || item.permissions.length === 0) return true;
              return hasPermission(...item.permissions);
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={group.group}>
                <div className="px-2.5 mb-1.5 text-[11px] font-extrabold uppercase tracking-wider text-ink-muted">
                  {group.group}
                </div>
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const active = isItemActive(item);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={clsx(
                          "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold transition-colors",
                          active
                            ? "bg-brand-50 text-brand-700 font-bold shadow-xs"
                            : "text-ink-soft hover:bg-slate-100 hover:text-ink",
                        )}
                      >
                        <Icon size={16} className={clsx("shrink-0", active ? "text-brand-600" : "text-ink-muted")} />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="border-t border-line p-3 text-center text-[10px] text-ink-muted">
          Progga Control Centre v1.0
        </div>
      </aside>
    </>
  );
}

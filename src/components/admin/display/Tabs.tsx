"use client";

import clsx from "clsx";
import { useAdminMe } from "@/lib/admin/useAdmin";

export interface TabItem {
  id: string;
  label: string;
  permission?: string;
  count?: number;
}

export interface TabsProps {
  tabs: TabItem[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  const { hasPermission } = useAdminMe();

  const visibleTabs = tabs.filter((t) => {
    if (!t.permission) return true;
    return hasPermission(t.permission);
  });

  if (visibleTabs.length === 0) return null;

  return (
    <div className={clsx("border-b border-line mb-6", className)}>
      <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
        {visibleTabs.map((tab) => {
          const isCurrent = tab.id === active;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={clsx(
                "flex items-center gap-2 whitespace-nowrap border-b-2 py-3 px-1 text-xs font-bold transition-colors cursor-pointer",
                isCurrent
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-ink-soft hover:border-line hover:text-ink",
              )}
              aria-current={isCurrent ? "page" : undefined}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={clsx(
                    "rounded-full px-2 py-0.5 text-[10px] font-extrabold",
                    isCurrent
                      ? "bg-brand-100 text-brand-800"
                      : "bg-slate-100 text-ink-muted",
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

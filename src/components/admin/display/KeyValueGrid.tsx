import type { ReactNode } from "react";
import clsx from "clsx";

export interface KeyValueItem {
  label: string;
  value: ReactNode;
}

export interface KeyValueGridProps {
  items: KeyValueItem[];
  columns?: 2 | 3;
  className?: string;
}

export function KeyValueGrid({ items, columns = 2, className }: KeyValueGridProps) {
  return (
    <dl
      className={clsx(
        "grid gap-4",
        columns === 3
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-1 sm:grid-cols-2",
        className,
      )}
    >
      {items.map((item, idx) => (
        <div key={idx} className="rounded-xl border border-line/60 bg-slate-50/50 p-3">
          <dt className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
            {item.label}
          </dt>
          <dd className="mt-1 text-xs font-semibold text-ink break-words">
            {item.value !== null && item.value !== undefined && item.value !== "" ? item.value : "—"}
          </dd>
        </div>
      ))}
    </dl>
  );
}

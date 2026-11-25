"use client";

import { Search, X } from "lucide-react";
import type { FilterSpec } from "./useList";

export interface FilterBarProps {
  filters?: FilterSpec[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onClear: () => void;
  search?: {
    placeholder?: string;
    value: string;
    onChange: (q: string) => void;
  };
  extraActions?: React.ReactNode;
}

export function FilterBar({
  filters = [],
  values,
  onChange,
  onClear,
  search,
  extraActions,
}: FilterBarProps) {
  const hasActiveFilters =
    Boolean(search?.value) ||
    Object.keys(values).some((k) => values[k] !== undefined && values[k] !== "" && values[k] !== null);

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white p-3 shadow-soft">
      {/* Search Input */}
      <div className="flex flex-1 flex-wrap items-center gap-2.5 min-w-[240px]">
        {search && (
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              placeholder={search.placeholder || "Search..."}
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
              className="w-full rounded-xl border border-line bg-slate-50 py-1.5 pl-9 pr-8 text-xs font-medium text-ink placeholder:text-ink-muted focus:border-brand-500 focus:bg-white focus:outline-hidden"
            />
            {search.value && (
              <button
                type="button"
                onClick={() => search.onChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}

        {/* Dynamic Filters */}
        {filters.map((f) => {
          const val = values[f.key] ?? "";
          if (f.type === "select" || f.type === "boolean") {
            return (
              <select
                key={f.key}
                value={val}
                onChange={(e) => onChange(f.key, e.target.value || null)}
                className="rounded-xl border border-line bg-slate-50 px-3 py-1.5 text-xs font-semibold text-ink focus:border-brand-500 focus:bg-white focus:outline-hidden"
              >
                <option value="">{f.label}: All</option>
                {f.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            );
          }

          if (f.type === "daterange") {
            const from = values.from ?? "";
            const to = values.to ?? "";
            return (
              <div key={f.key} className="flex items-center gap-1 text-xs">
                <input
                  type="date"
                  value={from}
                  onChange={(e) => onChange("from", e.target.value || null)}
                  className="rounded-xl border border-line bg-slate-50 px-2 py-1 text-xs font-medium text-ink focus:outline-hidden"
                  title="From date"
                />
                <span className="text-ink-muted">–</span>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => onChange("to", e.target.value || null)}
                  className="rounded-xl border border-line bg-slate-50 px-2 py-1 text-xs font-medium text-ink focus:outline-hidden"
                  title="To date"
                />
              </div>
            );
          }

          return null;
        })}

        {/* Clear All Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold text-coral-600 hover:bg-coral-50 transition-colors"
          >
            <X size={13} />
            <span>Clear filters</span>
          </button>
        )}
      </div>

      {extraActions && <div className="flex items-center gap-2">{extraActions}</div>}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { Columns, Check } from "lucide-react";
import clsx from "clsx";

export interface ColumnDef {
  key: string;
  header: string;
  hideable?: boolean;
}

export interface ColumnPickerProps {
  pageId: string;
  columns: ColumnDef[];
  hidden: string[];
  onChange: (hidden: string[]) => void;
}

export function ColumnPicker({ pageId, columns, hidden, onChange }: ColumnPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const storageKey = `progga.admin.cols.${pageId}`;

  // Load persisted hidden columns from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          onChange(parsed);
        }
      }
    } catch {
      // Ignore
    }
  }, [pageId, storageKey, onChange]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const toggleColumn = (key: string) => {
    let nextHidden: string[];
    if (hidden.includes(key)) {
      nextHidden = hidden.filter((k) => k !== key);
    } else {
      nextHidden = [...hidden, key];
    }
    onChange(nextHidden);
    try {
      localStorage.setItem(storageKey, JSON.stringify(nextHidden));
    } catch {
      // Ignore
    }
  };

  const hideableColumns = columns.filter((col) => col.hideable !== false);
  if (hideableColumns.length === 0) return null;

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-9 items-center gap-1.5 rounded-xl border border-line bg-white px-3 text-xs font-semibold text-ink-soft hover:bg-slate-50 hover:text-ink shadow-soft transition-colors"
        title="Customize columns"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Columns size={14} />
        <span>Columns</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-56 rounded-2xl border border-line bg-white p-2 shadow-xl">
          <div className="px-2 py-1 text-[11px] font-extrabold uppercase tracking-wider text-ink-muted">
            Toggle Columns
          </div>
          <div className="max-h-60 overflow-y-auto space-y-1 py-1">
            {hideableColumns.map((col) => {
              const isVisible = !hidden.includes(col.key);
              return (
                <button
                  key={col.key}
                  type="button"
                  onClick={() => toggleColumn(col.key)}
                  className={clsx(
                    "flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs transition-colors",
                    isVisible ? "text-ink font-semibold" : "text-ink-muted",
                  )}
                >
                  <span className="truncate">{col.header}</span>
                  <div
                    className={clsx(
                      "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                      isVisible ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-white",
                    )}
                  >
                    {isVisible && <Check size={11} strokeWidth={3} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

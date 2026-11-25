"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPage: (p: number) => void;
  onPageSize: (s: number) => void;
}

export function Pagination({ page, pageSize, total, onPage, onPageSize }: PaginationProps) {
  if (total <= 0) return null;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = Math.min(total, (safePage - 1) * pageSize + 1);
  const end = Math.min(total, safePage * pageSize);

  // Calculate sliding window of up to 5 page numbers
  const windowSize = 5;
  let windowStart = Math.max(1, safePage - Math.floor(windowSize / 2));
  let windowEnd = windowStart + windowSize - 1;
  if (windowEnd > totalPages) {
    windowEnd = totalPages;
    windowStart = Math.max(1, windowEnd - windowSize + 1);
  }

  const pageNumbers: number[] = [];
  for (let i = windowStart; i <= windowEnd; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80 dark:border-slate-800 px-4 py-3 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-500 dark:text-slate-400 rounded-b-2xl">
      <div className="flex items-center gap-3">
        <span>
          Showing <span className="font-extrabold text-slate-900 dark:text-white">{start}–{end}</span> of{" "}
          <span className="font-extrabold text-slate-900 dark:text-white">{total}</span>
        </span>

        <div className="flex items-center gap-1.5 ml-2">
          <span>Rows:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSize(Number(e.target.value))}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
          >
            {[10, 20, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPage(Math.max(1, safePage - 1))}
          disabled={safePage <= 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-slate-700 dark:text-slate-300 transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page Number Buttons */}
        {pageNumbers.map((p) => {
          const isActive = p === safePage;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPage(p)}
              className={`flex h-8 min-w-[32px] items-center justify-center rounded-lg px-2 text-xs font-bold transition-colors cursor-pointer ${
                isActive
                  ? "bg-sky-600 text-white shadow-xs"
                  : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
              }`}
            >
              {p}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPage(Math.min(totalPages, safePage + 1))}
          disabled={safePage >= totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-slate-700 dark:text-slate-300 transition-colors"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

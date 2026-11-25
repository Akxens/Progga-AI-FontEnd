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
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  // Calculate sliding window of up to 5 page numbers
  const windowSize = 5;
  let windowStart = Math.max(1, page - Math.floor(windowSize / 2));
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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-line px-4 py-3 bg-white text-xs font-semibold text-ink-soft rounded-b-2xl">
      <div className="flex items-center gap-3">
        <span>
          Showing <span className="font-extrabold text-ink">{start}–{end}</span> of{" "}
          <span className="font-extrabold text-ink">{total}</span>
        </span>

        <div className="flex items-center gap-1.5 ml-2">
          <span>Rows:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSize(Number(e.target.value))}
            className="rounded-lg border border-line bg-white px-2 py-1 text-xs font-bold text-ink focus:outline-hidden"
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none text-ink"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        {pageNumbers.map((p) => {
          const isActive = p === page;
          return (
            <button
              key={p}
              onClick={() => onPage(p)}
              className={`flex h-8 min-w-[32px] items-center justify-center rounded-lg px-2 text-xs font-bold transition-colors ${
                isActive
                  ? "bg-brand-600 text-white shadow-xs"
                  : "border border-line bg-white hover:bg-slate-50 text-ink"
              }`}
            >
              {p}
            </button>
          );
        })}

        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none text-ink"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

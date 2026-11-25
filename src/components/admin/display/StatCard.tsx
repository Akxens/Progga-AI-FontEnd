import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import clsx from "clsx";
import { formatBdt } from "@/lib/admin/format";

export interface StatCardProps {
  label: string;
  value: string | number | null | undefined;
  delta?: number | null;
  hint?: string;
  href?: string;
  loading?: boolean;
  format?: "number" | "bdt" | "pct";
}

export function StatCard({
  label,
  value,
  delta,
  hint,
  href,
  loading,
  format = "number",
}: StatCardProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-line bg-white p-5 animate-pulse shadow-soft">
        <div className="h-3.5 w-1/3 rounded bg-slate-200" />
        <div className="mt-3 h-7 w-1/2 rounded bg-slate-300" />
        <div className="mt-2 h-3 w-1/4 rounded bg-slate-100" />
      </div>
    );
  }

  let formattedValue: ReactNode = "—";
  if (value !== null && value !== undefined && value !== "") {
    if (format === "bdt") {
      formattedValue = formatBdt(value);
    } else if (format === "pct") {
      const num = typeof value === "number" ? value : Number.parseFloat(String(value));
      formattedValue = `${(num * (num <= 1 ? 100 : 1)).toFixed(1)}%`;
    } else {
      const num = typeof value === "number" ? value : Number(value);
      formattedValue = Number.isNaN(num) ? String(value) : num.toLocaleString();
    }
  } else {
    formattedValue = (
      <span className="text-ink-muted text-lg font-bold" title="Not enough data">
        N/A
      </span>
    );
  }

  const content = (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-soft transition-all hover:border-brand-300">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-ink-soft truncate">{label}</span>
        {delta !== undefined && delta !== null && (
          <span
            className={clsx(
              "flex items-center gap-0.5 text-[11px] font-bold rounded-md px-1.5 py-0.5",
              delta > 0
                ? "bg-mint-50 text-mint-700"
                : delta < 0
                  ? "bg-coral-50 text-coral-600"
                  : "bg-slate-100 text-ink-muted",
            )}
          >
            {delta > 0 ? (
              <ArrowUpRight size={13} />
            ) : delta < 0 ? (
              <ArrowDownRight size={13} />
            ) : null}
            {Math.abs(delta * (Math.abs(delta) <= 1 ? 100 : 1)).toFixed(1)}%
          </span>
        )}
      </div>

      <div className="mt-2 text-2xl font-extrabold tracking-tight text-ink">{formattedValue}</div>

      {hint && <p className="mt-1 text-[11px] text-ink-muted font-medium">{hint}</p>}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block group">
        {content}
      </Link>
    );
  }

  return content;
}

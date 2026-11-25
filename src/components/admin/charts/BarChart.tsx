"use client";

import { useState } from "react";
import { Table as TableIcon } from "lucide-react";
import { formatBdt } from "@/lib/admin/format";

export interface BarDatum {
  label: string;
  value: number | null;
  color?: string;
}

export interface BarChartProps {
  data: BarDatum[];
  horizontal?: boolean;
  yFormat?: "number" | "bdt" | "pct";
  height?: number;
}

export function BarChart({ data, horizontal = false, yFormat = "number", height = 240 }: BarChartProps) {
  const [showTable, setShowTable] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="py-12 text-center text-xs text-ink-muted">No data available</div>;
  }

  const values = data.map((d) => d.value ?? 0);
  const maxVal = Math.max(1, ...values);

  const formatValue = (v: number | null) => {
    if (v === null) return "—";
    if (yFormat === "bdt") return formatBdt(v);
    if (yFormat === "pct") return `${(v * 100).toFixed(0)}%`;
    return v.toLocaleString();
  };

  const defaultColor = "#0284c7"; // brand-600

  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-semibold text-ink-soft">{data.length} categories</span>
        <button
          type="button"
          onClick={() => setShowTable((prev) => !prev)}
          className="flex items-center gap-1 rounded-lg border border-line px-2.5 py-1 text-xs font-bold text-ink-soft hover:bg-slate-50 transition-colors"
        >
          <TableIcon size={13} />
          <span>{showTable ? "View chart" : "View as table"}</span>
        </button>
      </div>

      {showTable ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-ink">
            <thead className="border-b border-line bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2 text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.map((d) => (
                <tr key={d.label}>
                  <td className="px-3 py-2 font-medium">{d.label}</td>
                  <td className="px-3 py-2 text-right font-mono">{formatValue(d.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-2.5">
          {data.map((d, idx) => {
            const val = d.value ?? 0;
            const pct = Math.max(0, Math.min(100, (val / maxVal) * 100));
            const barColor = d.color || defaultColor;

            return (
              <div
                key={d.label}
                className="group flex flex-col gap-1 cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-ink truncate max-w-[200px]">{d.label}</span>
                  <span className="font-mono font-bold text-ink-soft">{formatValue(d.value)}</span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: barColor,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

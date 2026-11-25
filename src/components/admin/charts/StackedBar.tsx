"use client";

import { useState } from "react";
import { Table as TableIcon } from "lucide-react";

const STACK_COLORS = [
  "#0284c7", // brand-600
  "#10b981", // mint-500
  "#eab308", // banana-500
  "#ef4444", // coral-500
  "#0ea5e9", // sky-500
  "#64748b", // slate-500
];

export interface StackPart {
  name: string;
  value: number;
}

export interface StackedDatum {
  label: string;
  parts: StackPart[];
}

export interface StackedBarProps {
  data: StackedDatum[];
}

export function StackedBar({ data }: StackedBarProps) {
  const [showTable, setShowTable] = useState(false);

  if (!data || data.length === 0) {
    return <div className="py-12 text-center text-xs text-ink-muted">No data available</div>;
  }

  // Collect unique part names
  const partNames = Array.from(new Set(data.flatMap((d) => d.parts.map((p) => p.name))));

  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-soft">
      {/* Legend & Toggle */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
          {partNames.map((name, idx) => (
            <div key={name} className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: STACK_COLORS[idx % STACK_COLORS.length] }}
              />
              <span className="text-ink">{name}</span>
            </div>
          ))}
        </div>

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
                {partNames.map((p) => (
                  <th key={p} className="px-3 py-2 text-right">
                    {p}
                  </th>
                ))}
                <th className="px-3 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.map((d) => {
                const total = d.parts.reduce((sum, p) => sum + p.value, 0);
                return (
                  <tr key={d.label}>
                    <td className="px-3 py-2 font-medium">{d.label}</td>
                    {partNames.map((pName) => {
                      const pt = d.parts.find((p) => p.name === pName);
                      return (
                        <td key={pName} className="px-3 py-2 text-right font-mono">
                          {pt ? pt.value.toLocaleString() : "0"}
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 text-right font-mono font-bold">{total.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((d) => {
            const total = d.parts.reduce((sum, p) => sum + p.value, 0);
            return (
              <div key={d.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-ink truncate">{d.label}</span>
                  <span className="font-mono text-ink-soft">{total.toLocaleString()}</span>
                </div>
                <div className="flex h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                  {d.parts.map((part) => {
                    const pct = total > 0 ? (part.value / total) * 100 : 0;
                    if (pct <= 0) return null;
                    const pIdx = partNames.indexOf(part.name);
                    const color = STACK_COLORS[pIdx % STACK_COLORS.length];
                    return (
                      <div
                        key={part.name}
                        title={`${part.name}: ${part.value.toLocaleString()} (${pct.toFixed(1)}%)`}
                        style={{ width: `${pct}%`, backgroundColor: color }}
                        className="h-full transition-all"
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

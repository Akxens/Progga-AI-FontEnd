"use client";

import { useState } from "react";
import { Table as TableIcon } from "lucide-react";

const DONUT_COLORS = [
  "#0284c7", // brand-600
  "#10b981", // mint-500
  "#eab308", // banana-500
  "#ef4444", // coral-500
  "#0ea5e9", // sky-500
  "#64748b", // slate-500
];

export interface DonutDatum {
  label: string;
  value: number;
  color?: string;
}

export interface DonutProps {
  data: DonutDatum[];
  centerLabel?: string;
  size?: number;
}

export function Donut({ data, centerLabel, size = 180 }: DonutProps) {
  const [showTable, setShowTable] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="py-12 text-center text-xs text-ink-muted">No data available</div>;
  }

  const total = data.reduce((acc, d) => acc + d.value, 0);

  // Calculate SVG arc paths
  const radius = 70;
  const strokeWidth = 24;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;
  const segments = data.map((d, idx) => {
    const percent = total > 0 ? (d.value / total) * 100 : 0;
    const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += percent;

    return {
      label: d.label,
      value: d.value,
      percent,
      color: d.color || DONUT_COLORS[idx % DONUT_COLORS.length],
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-semibold text-ink-soft">Distribution</span>
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
                <th className="px-3 py-2 text-right">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {segments.map((s) => (
                <tr key={s.label}>
                  <td className="px-3 py-2 font-medium">{s.label}</td>
                  <td className="px-3 py-2 text-right font-mono">{s.value.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-mono font-bold">{s.percent.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
          {/* Donut SVG */}
          <div className="relative shrink-0" style={{ width: size, height: size }}>
            <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="#f1f5f9"
                strokeWidth={strokeWidth}
              />
              {segments.map((seg, idx) => (
                <circle
                  key={seg.label}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={hoveredIdx === idx ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              ))}
            </svg>

            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-lg font-extrabold text-ink tracking-tight font-mono">
                {hoveredIdx !== null ? segments[hoveredIdx].value.toLocaleString() : total.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">
                {hoveredIdx !== null ? segments[hoveredIdx].label : centerLabel || "Total"}
              </span>
            </div>
          </div>

          {/* Legend Items */}
          <div className="space-y-2 flex-1 max-w-xs">
            {segments.map((seg, idx) => (
              <div
                key={seg.label}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`flex items-center justify-between gap-3 text-xs p-1.5 rounded-lg transition-colors cursor-pointer ${
                  hoveredIdx === idx ? "bg-slate-50 font-bold" : "text-ink"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                  <span className="truncate">{seg.label}</span>
                </div>
                <div className="flex items-center gap-2 font-mono shrink-0">
                  <span>{seg.value.toLocaleString()}</span>
                  <span className="text-ink-muted font-normal text-[11px] w-12 text-right">
                    {seg.percent.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

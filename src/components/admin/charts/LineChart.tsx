"use client";

import { useId, useState } from "react";
import { Table as TableIcon } from "lucide-react";
import { formatBdt } from "@/lib/admin/format";

const SERIES_COLORS = [
  "#0284c7", // brand-600
  "#10b981", // mint-500
  "#eab308", // banana-500
  "#ef4444", // coral-500
  "#0ea5e9", // sky-500
  "#64748b", // slate-500
];

export interface Point {
  x: string;
  y: number | null;
}

export interface LineSeries {
  name: string;
  points: Point[];
  color?: string;
}

export interface LineChartProps {
  series: LineSeries[];
  yFormat?: "number" | "bdt" | "pct";
  height?: number;
}

export function LineChart({ series, yFormat = "number", height = 240 }: LineChartProps) {
  const [showTable, setShowTable] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<{
    seriesName: string;
    x: string;
    y: number;
    color: string;
  } | null>(null);

  const chartId = useId();

  if (!series || series.length === 0) {
    return <div className="py-12 text-center text-xs text-ink-muted">No data available</div>;
  }

  // Get all unique x labels in order
  const xLabels = Array.from(
    new Set(series.flatMap((s) => s.points.map((p) => p.x))),
  );

  if (xLabels.length === 0) {
    return <div className="py-12 text-center text-xs text-ink-muted">No data points</div>;
  }

  // Find min and max y values
  const allY = series.flatMap((s) => s.points.map((p) => p.y)).filter((y): y is number => y !== null);
  const minY = Math.min(0, ...allY);
  const maxY = Math.max(1, ...allY);
  const ySpan = maxY - minY || 1;

  // ViewBox layout
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;
  const viewBoxWidth = 600;
  const viewBoxHeight = height;

  const plotWidth = viewBoxWidth - paddingLeft - paddingRight;
  const plotHeight = viewBoxHeight - paddingTop - paddingBottom;

  const getXCoord = (index: number) => {
    if (xLabels.length <= 1) return paddingLeft + plotWidth / 2;
    return paddingLeft + (index / (xLabels.length - 1)) * plotWidth;
  };

  const getYCoord = (val: number) => {
    return paddingTop + plotHeight - ((val - minY) / ySpan) * plotHeight;
  };

  const formatYValue = (val: number) => {
    if (yFormat === "bdt") return formatBdt(val);
    if (yFormat === "pct") return `${(val * 100).toFixed(0)}%`;
    return val.toLocaleString();
  };

  // Build SVG polyline paths
  const seriesPaths = series.map((s, sIdx) => {
    const color = s.color || SERIES_COLORS[sIdx % SERIES_COLORS.length];
    const segments: string[] = [];
    let currentSegment: string[] = [];

    s.points.forEach((pt) => {
      const xIdx = xLabels.indexOf(pt.x);
      if (xIdx === -1 || pt.y === null) {
        if (currentSegment.length > 0) {
          segments.push(currentSegment.join(" "));
          currentSegment = [];
        }
      } else {
        const cx = getXCoord(xIdx);
        const cy = getYCoord(pt.y);
        currentSegment.push(`${cx},${cy}`);
      }
    });

    if (currentSegment.length > 0) {
      segments.push(currentSegment.join(" "));
    }

    return { name: s.name, color, segments, points: s.points };
  });

  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-soft">
      {/* Legend & Table Toggle Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
          {seriesPaths.map((sp) => (
            <div key={sp.name} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: sp.color }} />
              <span className="text-ink">{sp.name}</span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowTable((prev) => !prev)}
          className="flex items-center gap-1 rounded-lg border border-line px-2.5 py-1 text-xs font-bold text-ink-soft hover:bg-slate-50 transition-colors"
          aria-label={showTable ? "View as chart" : "View as accessible table"}
        >
          <TableIcon size={13} />
          <span>{showTable ? "View chart" : "View as table"}</span>
        </button>
      </div>

      {showTable ? (
        // Accessible Table Fallback
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-ink">
            <thead className="border-b border-line bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-3 py-2">Interval</th>
                {series.map((s) => (
                  <th key={s.name} className="px-3 py-2 text-right">
                    {s.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {xLabels.map((xl) => (
                <tr key={xl}>
                  <td className="px-3 py-2 font-medium">{xl}</td>
                  {series.map((s) => {
                    const pt = s.points.find((p) => p.x === xl);
                    return (
                      <td key={s.name} className="px-3 py-2 text-right font-mono">
                        {pt && pt.y !== null ? formatYValue(pt.y) : "—"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // Responsive SVG Line Chart
        <div className="relative">
          <svg
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
            className="w-full h-auto overflow-visible select-none"
            aria-label="Line chart visualization"
          >
            {/* Grid horizontal lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
              const val = minY + pct * ySpan;
              const y = getYCoord(val);
              return (
                <g key={pct}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={viewBoxWidth - paddingRight}
                    y2={y}
                    stroke="#f1f5f9"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={paddingLeft - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="fill-slate-400 text-[10px] font-mono"
                  >
                    {formatYValue(val)}
                  </text>
                </g>
              );
            })}

            {/* X axis labels (sparse if many) */}
            {xLabels.map((label, idx) => {
              const step = Math.ceil(xLabels.length / 8);
              if (idx % step !== 0 && idx !== xLabels.length - 1) return null;
              const x = getXCoord(idx);
              return (
                <text
                  key={idx}
                  x={x}
                  y={viewBoxHeight - 8}
                  textAnchor="middle"
                  className="fill-slate-400 text-[10px] font-sans"
                >
                  {label}
                </text>
              );
            })}

            {/* Polylines & Markers */}
            {seriesPaths.map((sp) => (
              <g key={sp.name}>
                {sp.segments.map((seg, segIdx) => (
                  <polyline
                    key={segIdx}
                    fill="none"
                    stroke={sp.color}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={seg}
                  />
                ))}

                {sp.points.map((pt, pIdx) => {
                  if (pt.y === null) return null;
                  const xIdx = xLabels.indexOf(pt.x);
                  if (xIdx === -1) return null;
                  const cx = getXCoord(xIdx);
                  const cy = getYCoord(pt.y);

                  return (
                    <circle
                      key={pIdx}
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill="#ffffff"
                      stroke={sp.color}
                      strokeWidth={2}
                      className="cursor-pointer hover:r-6 transition-all"
                      onMouseEnter={() =>
                        setHoveredPoint({
                          seriesName: sp.name,
                          x: pt.x,
                          y: pt.y!,
                          color: sp.color,
                        })
                      }
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  );
                })}
              </g>
            ))}
          </svg>

          {/* Interactive Hover Tooltip */}
          {hoveredPoint && (
            <div className="absolute top-2 right-2 rounded-xl border border-line bg-white/95 px-3 py-1.5 shadow-md backdrop-blur text-xs">
              <span className="font-bold" style={{ color: hoveredPoint.color }}>
                {hoveredPoint.seriesName}
              </span>
              <span className="text-ink-muted mx-1">·</span>
              <span className="text-ink-soft">{hoveredPoint.x}:</span>{" "}
              <strong className="text-ink font-mono">{formatYValue(hoveredPoint.y)}</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

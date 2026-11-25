export interface CohortRow {
  cohort: string;
  size: number;
  values: (number | null)[];
}

export interface CohortTableProps {
  rows: CohortRow[];
  periods: string[];
}

export function CohortTable({ rows, periods }: CohortTableProps) {
  if (!rows || rows.length === 0) {
    return <div className="py-12 text-center text-xs text-ink-muted">No cohort data available</div>;
  }

  // Helper to compute heat background based on retention % (0 to 1 or 0 to 100)
  const getHeatBg = (val: number | null) => {
    if (val === null) return "bg-transparent text-ink-muted";
    const pct = val <= 1 ? val * 100 : val;
    if (pct >= 80) return "bg-mint-500/25 text-mint-900 font-bold";
    if (pct >= 60) return "bg-mint-500/15 text-mint-800 font-semibold";
    if (pct >= 40) return "bg-brand-500/15 text-brand-800 font-medium";
    if (pct >= 20) return "bg-banana-500/15 text-banana-900 font-medium";
    if (pct > 0) return "bg-coral-500/10 text-coral-800";
    return "bg-slate-50 text-ink-muted";
  };

  const formatPct = (val: number | null) => {
    if (val === null) return "—";
    const pct = val <= 1 ? val * 100 : val;
    return `${pct.toFixed(1)}%`;
  };

  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-soft overflow-hidden">
      <div className="mb-4">
        <h3 className="text-xs font-bold text-ink">Retention Cohort Analysis</h3>
        <p className="mt-0.5 text-[11px] text-ink-soft">
          Percentage of students or subscriptions retained across subsequent periods.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-ink">
          <thead className="border-b border-line bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            <tr>
              <th className="px-3 py-2.5 whitespace-nowrap">Cohort</th>
              <th className="px-3 py-2.5 text-right whitespace-nowrap">Size</th>
              {periods.map((p) => (
                <th key={p} className="px-3 py-2.5 text-center whitespace-nowrap">
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line/70 font-mono">
            {rows.map((row) => (
              <tr key={row.cohort}>
                <td className="px-3 py-2 font-sans font-semibold text-ink whitespace-nowrap">
                  {row.cohort}
                </td>
                <td className="px-3 py-2 text-right font-medium text-ink-soft whitespace-nowrap">
                  {row.size.toLocaleString()}
                </td>
                {periods.map((_, pIdx) => {
                  const val = row.values[pIdx] ?? null;
                  return (
                    <td
                      key={pIdx}
                      className={`px-3 py-2 text-center text-xs transition-colors whitespace-nowrap ${getHeatBg(val)}`}
                    >
                      {formatPct(val)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

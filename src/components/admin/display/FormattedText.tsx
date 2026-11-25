import { AlertTriangle } from "lucide-react";
import { formatBdt, formatDate, formatDateTime, formatRelativeTime } from "@/lib/admin/format";

export function MoneyText({
  value,
}: {
  value: string | number | null | undefined;
  currency?: "BDT";
}) {
  return <span className="font-mono font-bold tracking-tight">{formatBdt(value)}</span>;
}

export function DateText({
  value,
  mode = "datetime",
}: {
  value: string | Date | null | undefined;
  mode?: "datetime" | "date" | "relative";
}) {
  if (!value) return <span className="text-ink-muted">—</span>;

  const isoString = typeof value === "string" ? value : value.toISOString();
  let text = "";
  if (mode === "date") text = formatDate(value);
  else if (mode === "relative") text = formatRelativeTime(value);
  else text = formatDateTime(value);

  return (
    <time dateTime={isoString} title={`UTC: ${isoString}`} className="whitespace-nowrap">
      {text}
    </time>
  );
}

export function NAValue({ reason = "Not enough data" }: { reason?: string }) {
  return (
    <span className="text-ink-muted text-xs font-semibold" title={reason}>
      N/A
    </span>
  );
}

export function SmallSampleFlag({ n, threshold = 30 }: { n: number; threshold?: number }) {
  if (n >= threshold) return null;

  return (
    <span
      className="inline-flex items-center gap-1 rounded-md bg-banana-50 px-2 py-0.5 text-[10px] font-bold text-banana-800 border border-banana-200"
      title="Sample size is too small for statistical certainty"
    >
      <AlertTriangle size={11} className="text-banana-700" />
      <span>Small sample (n={n})</span>
    </span>
  );
}

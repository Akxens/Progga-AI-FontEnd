import { formatDateTime } from "@/lib/admin/format";

export interface TimelineItem {
  at: string;
  actor?: string;
  title: string;
  body?: string;
}

export interface TimelineProps {
  items: TimelineItem[];
}

export function Timeline({ items }: TimelineProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:bottom-2 before:top-2 before:left-[9px] before:w-0.5 before:bg-line">
      {items.map((item, idx) => (
        <div key={idx} className="relative group">
          <div className="absolute -left-6 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-brand-600 ring-2 ring-brand-100" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <h4 className="text-xs font-bold text-ink">{item.title}</h4>
            <div className="flex items-center gap-2 text-[11px] text-ink-muted">
              {item.actor && <span>by {item.actor}</span>}
              <span>•</span>
              <time dateTime={item.at}>{formatDateTime(item.at)}</time>
            </div>
          </div>
          {item.body && (
            <p className="mt-1 text-xs text-ink-soft leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-line/60">
              {item.body}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

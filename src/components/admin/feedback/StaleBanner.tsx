import { AlertCircle, RefreshCw } from "lucide-react";
import { formatDateTime } from "@/lib/admin/format";

export interface StaleBannerProps {
  asOf?: string | null;
  onRetry?: () => void;
}

export function StaleBanner({ asOf, onRetry }: StaleBannerProps) {
  const formatted = asOf ? formatDateTime(asOf) : "recently";

  return (
    <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-banana-200 bg-banana-50 px-4 py-2.5 text-xs text-banana-800 shadow-2xs">
      <div className="flex items-center gap-2">
        <AlertCircle size={16} className="text-banana-700 shrink-0" />
        <span>
          Data may be out of date (last refresh <strong className="font-bold">{formatted}</strong>).
        </span>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-1 rounded-lg bg-white/80 px-2.5 py-1 text-xs font-bold text-banana-900 hover:bg-white transition-colors shadow-2xs"
        >
          <RefreshCw size={12} />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
}

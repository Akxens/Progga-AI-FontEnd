"use client";

import Link from "next/link";
import { AlertCircle, Lock, RefreshCw, Search, ShieldAlert } from "lucide-react";
import { Spinner } from "@/components/ui/primitives";

export interface PageStateProps {
  state: "loading" | "empty" | "error" | "unauthorized" | "notFound";
  title?: string;
  text?: string;
  onRetry?: () => void;
  correlationId?: string;
}

export function PageState({ state, title, text, onRetry, correlationId }: PageStateProps) {
  if (state === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Spinner size={32} />
        <p className="mt-3 text-xs font-semibold text-ink-muted">Loading data...</p>
      </div>
    );
  }

  if (state === "unauthorized") {
    return (
      <div className="mx-auto my-12 max-w-md rounded-3xl border border-line bg-white p-8 text-center shadow-soft">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-banana-50 text-banana-700">
          <Lock size={22} />
        </div>
        <h2 className="text-base font-extrabold text-ink">
          {title || "Access Restricted"}
        </h2>
        <p className="mt-1 text-xs text-ink-soft">
          {text || "You don't have access to this page in the current workspace."}
        </p>
        <div className="mt-5">
          <Link href="/admin/workspace" className="btn-primary btn-sm inline-flex">
            Switch Workspace
          </Link>
        </div>
      </div>
    );
  }

  if (state === "notFound") {
    return (
      <div className="mx-auto my-12 max-w-md rounded-3xl border border-line bg-white p-8 text-center shadow-soft">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-ink-soft">
          <Search size={22} />
        </div>
        <h2 className="text-base font-extrabold text-ink">{title || "Record Not Found"}</h2>
        <p className="mt-1 text-xs text-ink-soft">
          {text || "The requested resource could not be found or does not exist in this scope."}
        </p>
      </div>
    );
  }

  if (state === "error") {
    const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@progga.ai";
    return (
      <div className="mx-auto my-12 max-w-md rounded-3xl border border-coral-200 bg-white p-8 text-center shadow-soft">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-coral-50 text-coral-600">
          <AlertCircle size={22} />
        </div>
        <h2 className="text-base font-extrabold text-ink">{title || "Failed to Load"}</h2>
        <p className="mt-1 text-xs text-ink-soft">
          {text || "An unexpected error occurred while fetching data from the server."}
        </p>

        {correlationId && (
          <p className="mt-2 text-[11px] font-mono text-ink-muted">
            Ref: {correlationId}
          </p>
        )}

        <div className="mt-5 flex items-center justify-center gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="btn-primary btn-sm flex items-center gap-1.5"
            >
              <RefreshCw size={13} />
              <span>Retry</span>
            </button>
          )}

          <a
            href={`mailto:${supportEmail}?subject=Control%20Centre%20Error%20[${correlationId || "unknown"}]`}
            className="btn-ghost btn-sm border border-line text-xs font-semibold"
          >
            Contact Support
          </a>
        </div>
      </div>
    );
  }

  // Default empty state
  return (
    <div className="mx-auto my-12 max-w-md rounded-3xl border border-line bg-white p-8 text-center shadow-soft">
      <h2 className="text-base font-extrabold text-ink">{title || "No Items Found"}</h2>
      <p className="mt-1 text-xs text-ink-soft">{text || "There is no data to display here yet."}</p>
    </div>
  );
}

export function TableSkeleton({ rows = 6, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="w-full rounded-2xl border border-line bg-white p-4 space-y-3 animate-pulse shadow-soft">
      <div className="h-6 w-1/4 rounded-lg bg-slate-200 mb-4" />
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: columns }).map((_, c) => (
            <div key={c} className="h-4 flex-1 rounded bg-slate-100" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-line bg-white p-5 space-y-3 animate-pulse shadow-soft"
        >
          <div className="h-4 w-1/3 rounded bg-slate-200" />
          <div className="h-7 w-1/2 rounded bg-slate-300" />
          <div className="h-3 w-2/3 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

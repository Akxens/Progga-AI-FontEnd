import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  backHref?: string;
}

export function PageHeader({ title, subtitle, actions, backHref }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {backHref && (
          <Link
            href={backHref}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-white text-ink-soft hover:bg-slate-100 hover:text-ink transition-colors shadow-soft"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </Link>
        )}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-ink-soft">{subtitle}</p>}
        </div>
      </div>

      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}

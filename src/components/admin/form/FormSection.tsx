import type { ReactNode } from "react";

export interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  columns?: 1 | 2;
}

export function FormSection({ title, description, children, columns = 2 }: FormSectionProps) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 sm:p-6 shadow-soft">
      <div className="mb-5 border-b border-line/60 pb-3">
        <h2 className="text-sm font-extrabold text-ink">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-ink-soft">{description}</p>}
      </div>

      <div
        className={
          columns === 2
            ? "grid grid-cols-1 gap-5 lg:grid-cols-2"
            : "grid grid-cols-1 gap-5"
        }
      >
        {children}
      </div>
    </div>
  );
}

"use client";

import type { ReactNode } from "react";
import { Breadcrumbs, type BreadcrumbItem } from "../shell/Breadcrumbs";
import { ErrorNote, PageLoader, Spinner } from "@/components/ui/primitives";

export interface FormPageProps {
  title: string;
  mode: "create" | "edit";
  breadcrumbs?: BreadcrumbItem[];
  isLoading?: boolean;
  loadError?: string | null;
  sections: ReactNode;
  onCancel: () => void;
  onSubmit?: (e: React.FormEvent) => void;
  submitLabel?: string;
  submitting?: boolean;
  dirty?: boolean;
  footerExtra?: ReactNode;
}

export function FormPage({
  title,
  mode,
  breadcrumbs,
  isLoading,
  loadError,
  sections,
  onCancel,
  onSubmit,
  submitLabel,
  submitting,
  dirty,
  footerExtra,
}: FormPageProps) {
  if (isLoading) return <PageLoader />;

  const defaultSubmitText = mode === "create" ? "Create Record" : "Save Changes";

  return (
    <div className="pb-24">
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">{title}</h1>
          <p className="mt-0.5 text-xs font-semibold text-ink-soft">
            {mode === "create" ? "Add a new record to the system." : "Update existing record details."}
          </p>
        </div>
      </div>

      {loadError && (
        <div className="mb-6">
          <ErrorNote message={loadError} />
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {sections}

        {/* Sticky Action Footer */}
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-line bg-white/95 backdrop-blur px-6 py-3.5 shadow-lg lg:left-64">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4">
            <div>{footerExtra}</div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={submitting}
                className="btn-ghost btn-md border border-line text-xs font-bold"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting || (!dirty && mode === "edit")}
                className="btn-primary btn-md flex items-center justify-center gap-2 text-xs font-bold min-w-[120px]"
              >
                {submitting ? <Spinner size={16} /> : (submitLabel || defaultSubmitText)}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

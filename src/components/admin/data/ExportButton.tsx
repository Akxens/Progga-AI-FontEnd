"use client";

import { useEffect, useRef, useState } from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { adminApi } from "@/lib/admin/api";
import { useAdminMe } from "@/lib/admin/useAdmin";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";
import { Spinner } from "@/components/ui/primitives";

export interface ExportButtonProps {
  templateKey: string;
  filters?: Record<string, unknown>;
  formats?: ("csv" | "xlsx" | "pdf")[];
  permission?: string;
}

export function ExportButton({
  templateKey,
  filters = {},
  formats = ["csv", "xlsx", "pdf"],
  permission = "reports.view",
}: ExportButtonProps) {
  const { hasPermission } = useAdminMe();
  const { toast } = useCelebrate();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  if (permission && !hasPermission(permission)) {
    return null;
  }

  const triggerExport = async (format: "csv" | "xlsx" | "pdf") => {
    setBusy(true);
    setOpen(false);
    try {
      await adminApi("/admin/reports", {
        method: "POST",
        body: {
          templateKey,
          filters,
          format,
        },
      });
      toast("Export queued — you'll find it in Report Centre when ready.");
    } catch (err: any) {
      toast(`⚠️ Failed to queue export: ${err.message || "Server error"}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        type="button"
        disabled={busy}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-9 items-center gap-1.5 rounded-xl border border-line bg-white px-3 text-xs font-semibold text-ink-soft hover:bg-slate-50 hover:text-ink shadow-soft transition-colors disabled:opacity-50"
        title="Export data"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {busy ? <Spinner size={13} /> : <Download size={14} />}
        <span>Export</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-1.5 w-40 rounded-2xl border border-line bg-white p-1.5 shadow-xl">
          <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-ink-muted">
            Export Format
          </div>

          {formats.includes("csv") && (
            <button
              type="button"
              onClick={() => triggerExport("csv")}
              className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-ink hover:bg-slate-100 transition-colors"
            >
              <FileSpreadsheet size={14} className="text-mint-600" />
              <span>CSV (.csv)</span>
            </button>
          )}

          {formats.includes("xlsx") && (
            <button
              type="button"
              onClick={() => triggerExport("xlsx")}
              className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-ink hover:bg-slate-100 transition-colors"
            >
              <FileSpreadsheet size={14} className="text-brand-600" />
              <span>Excel (.xlsx)</span>
            </button>
          )}

          {formats.includes("pdf") && (
            <button
              type="button"
              onClick={() => triggerExport("pdf")}
              className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-ink hover:bg-slate-100 transition-colors"
            >
              <FileText size={14} className="text-coral-600" />
              <span>PDF (.pdf)</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

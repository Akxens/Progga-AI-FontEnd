"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AlertTriangle, X } from "lucide-react";
import clsx from "clsx";
import { Spinner } from "@/components/ui/primitives";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  body: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) {
        onClose();
      }
    };
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, busy, onClose]);

  if (!open) return null;

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      // Keep dialog open on error
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        onClick={() => !busy && onClose()}
        className="fixed inset-0 bg-ink/50 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md rounded-3xl border border-line bg-white p-6 shadow-2xl transition-all">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {tone === "danger" && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-coral-50 text-coral-600">
                <AlertTriangle size={20} />
              </div>
            )}
            <h2 className="text-base font-extrabold text-ink">{title}</h2>
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="rounded-lg p-1 text-ink-muted hover:bg-slate-100 hover:text-ink disabled:opacity-40"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-3 text-xs text-ink-soft leading-relaxed">{body}</div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="btn-ghost btn-sm border border-line text-xs font-semibold"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={handleConfirm}
            className={clsx(
              "btn-sm flex items-center gap-2 text-xs font-bold min-w-[90px] justify-center",
              tone === "danger"
                ? "bg-coral-600 hover:bg-coral-700 text-white shadow-soft"
                : "btn-primary",
            )}
          >
            {busy ? <Spinner size={14} /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

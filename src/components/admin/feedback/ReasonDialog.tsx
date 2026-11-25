"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AlertTriangle, X } from "lucide-react";
import clsx from "clsx";
import { Spinner } from "@/components/ui/primitives";

export interface ReasonDialogProps {
  open: boolean;
  title: string;
  body?: ReactNode;
  confirmLabel?: string;
  placeholder?: string;
  tone?: "default" | "danger";
  onConfirm: (reason: string) => Promise<void> | void;
  onClose: () => void;
}

export function ReasonDialog({
  open,
  title,
  body,
  confirmLabel = "Confirm Action",
  placeholder = "Explain why this sensitive action is being taken (5–500 characters)...",
  tone = "danger",
  onConfirm,
  onClose,
}: ReasonDialogProps) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setReason("");
      setError(null);
    }
  }, [open]);

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

  const valid = reason.trim().length >= 5 && reason.trim().length <= 500;

  const handleConfirm = async () => {
    if (!valid) {
      setError("Please provide a reason between 5 and 500 characters");
      return;
    }
    setBusy(true);
    try {
      await onConfirm(reason.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to submit reason");
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
      <div
        onClick={() => !busy && onClose()}
        className="fixed inset-0 bg-ink/50 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md rounded-3xl border border-line bg-white p-6 shadow-2xl transition-all">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-coral-50 text-coral-600">
              <AlertTriangle size={20} />
            </div>
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

        {body && <div className="mt-3 text-xs text-ink-soft leading-relaxed">{body}</div>}

        <div className="mt-4">
          <label className="block text-xs font-bold text-ink mb-1">
            Reason required for audit trail <span className="text-coral-600">*</span>
          </label>
          <textarea
            rows={3}
            autoFocus
            disabled={busy}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError(null);
            }}
            placeholder={placeholder}
            maxLength={500}
            className="w-full rounded-xl border border-line bg-white p-3 text-xs font-medium text-ink focus:border-brand-500 focus:outline-hidden resize-none"
          />
          <div className="flex items-center justify-between mt-1 text-[11px] text-ink-muted">
            <span>Min 5 characters</span>
            <span>{reason.length}/500</span>
          </div>

          {error && <p className="mt-1 text-xs font-semibold text-coral-600">{error}</p>}
        </div>

        <div className="mt-5 flex items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="btn-ghost btn-sm border border-line text-xs font-semibold"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={busy || !valid}
            onClick={handleConfirm}
            className={clsx(
              "btn-sm flex items-center gap-2 text-xs font-bold min-w-[100px] justify-center",
              tone === "danger"
                ? "bg-coral-600 hover:bg-coral-700 text-white shadow-soft"
                : "btn-primary",
              (!valid || busy) && "opacity-50 pointer-events-none",
            )}
          >
            {busy ? <Spinner size={14} /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

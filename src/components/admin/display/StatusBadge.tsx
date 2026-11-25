import clsx from "clsx";

const SUCCESS_STATUSES = new Set([
  "active",
  "published",
  "approved",
  "succeeded",
  "paid",
  "completed",
  "verified",
  "resolved",
  "eligible",
  "fulfilled",
  "achieved",
  "granted",
  "up",
]);

const INFO_STATUSES = new Set([
  "draft",
  "scheduled",
  "registered",
  "invited",
  "open",
  "queued",
  "running",
  "submitted",
  "in_review",
  "triaged",
  "in_progress",
]);

const WARNING_STATUSES = new Set([
  "pending",
  "pending_approval",
  "past_due",
  "partially_refunded",
  "escalated",
  "waiting_on_requester",
  "degraded",
  "linked_unverified",
  "expiring",
]);

const DANGER_STATUSES = new Set([
  "suspended",
  "failed",
  "rejected",
  "revoked",
  "critical",
  "down",
  "ineligible",
  "overdue",
  "violation",
  "consent_revoked",
]);

export interface StatusBadgeProps {
  status: string | null | undefined;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  if (!status) return null;

  const key = status.trim().toLowerCase();
  let toneClass = "bg-slate-100 text-ink-soft"; // neutral fallback

  if (SUCCESS_STATUSES.has(key)) {
    toneClass = "bg-mint-50 text-mint-700";
  } else if (INFO_STATUSES.has(key)) {
    toneClass = "bg-brand-50 text-brand-700";
  } else if (WARNING_STATUSES.has(key)) {
    toneClass = "bg-banana-50 text-banana-700";
  } else if (DANGER_STATUSES.has(key)) {
    toneClass = "bg-coral-50 text-coral-600";
  }

  // Label: replace underscores with spaces and capitalize words
  const label = status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold tracking-wide whitespace-nowrap",
        toneClass,
        className,
      )}
    >
      {label}
    </span>
  );
}

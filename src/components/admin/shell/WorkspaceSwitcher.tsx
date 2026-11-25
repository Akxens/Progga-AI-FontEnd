"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Layers } from "lucide-react";
import clsx from "clsx";
import { useActiveWorkspace, useAdminMe, useAdminStatus } from "@/lib/admin/useAdmin";

export function WorkspaceSwitcher() {
  const { status } = useAdminStatus();
  const { me } = useAdminMe();
  const { workspaceId, switchWorkspace } = useActiveWorkspace();
  const [open, setOpen] = useState(false);
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

  const assignments = status?.assignments || [];
  if (assignments.length === 0) return null;

  const currentAssignment =
    assignments.find((a) => a.id === workspaceId) ||
    assignments.find((a) => a.id === me?.assignment?.id) ||
    assignments[0];

  const currentLabel = currentAssignment
    ? `${currentAssignment.roleName} · ${currentAssignment.scopeLabel}`
    : "Select workspace";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-slate-50 transition-colors shadow-soft"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Layers size={14} className="text-brand-600" />
        <span className="max-w-[200px] truncate">{currentLabel}</span>
        <ChevronDown size={14} className={clsx("text-ink-muted transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-72 rounded-2xl border border-line bg-white p-1.5 shadow-xl">
          <div className="px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-ink-muted">
            Workspaces ({assignments.length})
          </div>
          <div className="max-h-60 overflow-y-auto space-y-1 py-1">
            {assignments.map((a) => {
              const isSelected = a.id === currentAssignment?.id;
              return (
                <button
                  key={a.id}
                  onClick={() => {
                    setOpen(false);
                    switchWorkspace(a.id);
                  }}
                  className={clsx(
                    "flex w-full items-start justify-between rounded-xl px-2.5 py-2 text-left text-xs transition-colors",
                    isSelected
                      ? "bg-brand-50 text-brand-700 font-bold"
                      : "text-ink-soft hover:bg-slate-100 hover:text-ink",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{a.roleName}</p>
                    <p className="truncate text-[11px] text-ink-muted">{a.scopeLabel}</p>
                  </div>
                  {isSelected && <Check size={14} className="ml-2 mt-0.5 shrink-0 text-brand-600" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

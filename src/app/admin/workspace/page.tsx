"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Building, CheckCircle2, Globe, Layers, Shield } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { PageLoader, Spinner } from "@/components/ui/primitives";
import { useActiveWorkspace, useAdminStatus } from "@/lib/admin/useAdmin";
import { formatDate } from "@/lib/admin/format";

export default function AdminWorkspacePage() {
  const router = useRouter();
  const { status, isLoading } = useAdminStatus();
  const { workspaceId, switchWorkspace } = useActiveWorkspace();

  const assignments = status?.assignments || [];

  // Auto-select if exactly 1 assignment and not selected
  useEffect(() => {
    if (!isLoading && assignments.length === 1 && !workspaceId) {
      switchWorkspace(assignments[0].id);
    }
  }, [isLoading, assignments, workspaceId, switchWorkspace]);

  if (isLoading) return <PageLoader />;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-slate-50">
      <div className="w-full max-w-xl">
        <div className="flex items-center justify-center gap-2 mb-6 text-center">
          <Logo size={36} />
          <span className="rounded-full bg-ink px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-white">
            Control Centre
          </span>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-ink">Select Workspace</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Choose the operational context and role scope for this session.
          </p>
        </div>

        {assignments.length === 0 ? (
          <div className="rounded-3xl border border-line bg-white p-8 text-center shadow-soft">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-coral-50 text-coral-600">
              <Shield size={24} />
            </div>
            <h2 className="text-lg font-bold text-ink">No Active Workspaces Found</h2>
            <p className="mt-1 text-xs text-ink-soft">
              Your staff account does not currently hold any active role assignments. Contact your system administrator to assign permissions.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map((a) => {
              const isSelected = a.id === workspaceId;
              let ScopeIcon = Layers;
              if (a.scopeType === "GLOBAL") ScopeIcon = Globe;
              else if (a.scopeType === "SCHOOL") ScopeIcon = Building;

              return (
                <button
                  key={a.id}
                  onClick={() => switchWorkspace(a.id)}
                  className="group relative flex w-full items-center justify-between rounded-2xl border border-line bg-white p-5 text-left transition-all hover:border-brand-300 hover:shadow-md shadow-soft"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                      <ScopeIcon size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-ink text-sm sm:text-base">{a.roleName}</span>
                        {isSelected && (
                          <span className="flex items-center gap-1 rounded-full bg-mint-50 px-2 py-0.5 text-[10px] font-bold text-mint-700">
                            <CheckCircle2 size={11} /> Current
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-ink-soft font-medium">Scope: {a.scopeLabel}</p>
                      {a.validUntil && (
                        <p className="mt-1 text-[11px] text-ink-muted">
                          Valid until {formatDate(a.validUntil)}
                        </p>
                      )}
                    </div>
                  </div>

                  <ArrowRight size={18} className="text-ink-muted group-hover:text-brand-600 group-hover:translate-x-1 transition-all shrink-0 ml-4" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

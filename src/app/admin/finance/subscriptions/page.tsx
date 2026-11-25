"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, XCircle, RefreshCw, Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/shell/PageHeader";
import { Breadcrumbs } from "@/components/admin/shell/Breadcrumbs";
import { DataTable, type Column, type Action } from "@/components/admin/data/DataTable";
import { FilterBar } from "@/components/admin/data/FilterBar";
import { Pagination } from "@/components/admin/data/Pagination";
import { StatusBadge } from "@/components/admin/display/StatusBadge";
import { MoneyText } from "@/components/admin/display/FormattedText";
import { useList, type FilterSpec } from "@/components/admin/data/useList";
import { adminApi } from "@/lib/admin/api";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";

interface SubscriptionRow {
  id: string;
  code: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  studentCode: string;
  grade?: number;
  planId: string;
  planCode: string;
  planName: string;
  planVersionNumber: number;
  priceAmount: number;
  currency: string;
  billingInterval: string;
  status: string;
  source: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  autoRenew: boolean;
  createdAt: string;
}

const filterSpecs: FilterSpec[] = [
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "active", label: "Active" },
      { value: "trialing", label: "Trialing" },
      { value: "cancelled", label: "Cancelled" },
      { value: "expired", label: "Expired" },
    ],
  },
  {
    key: "source",
    label: "Source",
    type: "select",
    options: [
      { value: "b2c_online", label: "B2C Online (Shurjopay)" },
      { value: "csr_grant", label: "CSR Grant (Sponsored)" },
      { value: "school_sponsored", label: "School Sponsored" },
      { value: "manual_admin", label: "Admin Grant" },
    ],
  },
];

export default function SubscriptionsListPage() {
  const router = useRouter();
  const { toast } = useCelebrate();
  const list = useList<SubscriptionRow>({
    endpoint: "/api/admin/subscriptions",
  });

  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelMode, setCancelMode] = useState<"immediate" | "period_end">("period_end");
  const [cancelReason, setCancelReason] = useState("");

  const handleRenew = async (id: string) => {
    try {
      await adminApi(`/api/admin/subscriptions/${id}/renew`, { method: "POST" });
      toast("Subscription renewed successfully!", "🎉", "mint");
      list.mutate();
    } catch (err: any) {
      toast(err.message || "Failed to renew subscription", "✕", "coral");
    }
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingId) return;
    try {
      await adminApi(`/api/admin/subscriptions/${cancellingId}/cancel`, {
        method: "POST",
        body: { mode: cancelMode, reason: cancelReason },
      });
      toast("Subscription cancellation recorded.", "✓", "mint");
      setCancellingId(null);
      setCancelReason("");
      list.mutate();
    } catch (err: any) {
      toast(err.message || "Failed to cancel subscription", "✕", "coral");
    }
  };

  const columns: Column<SubscriptionRow>[] = useMemo(
    () => [
      {
        key: "code",
        header: "Subscription",
        render: (row) => (
          <span className="font-mono text-xs font-semibold text-primary hover:underline">
            {row.code}
          </span>
        ),
      },
      {
        key: "student",
        header: "Student",
        render: (row) => (
          <div>
            <div className="font-medium text-foreground">{row.studentName}</div>
            <div className="text-xs font-mono text-muted-foreground">
              {row.studentCode || row.studentEmail || "—"}
            </div>
          </div>
        ),
      },
      {
        key: "plan",
        header: "Plan",
        render: (row) => (
          <div>
            <div className="font-medium text-foreground">{row.planName}</div>
            <div className="text-xs text-muted-foreground capitalize">
              v{row.planVersionNumber} · {row.billingInterval}
            </div>
          </div>
        ),
      },
      {
        key: "price",
        header: "Price",
        render: (row) => (
          <MoneyText value={row.priceAmount} />
        ),
      },
      {
        key: "period",
        header: "Active Period",
        render: (row) => (
          <span className="text-xs text-muted-foreground">
            {new Date(row.currentPeriodStart).toLocaleDateString()} –{" "}
            {new Date(row.currentPeriodEnd).toLocaleDateString()}
          </span>
        ),
      },
      {
        key: "source",
        header: "Source",
        render: (row) => (
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-medium capitalize">
            {row.source.replace(/_/g, " ")}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (row) => <StatusBadge status={row.status} />,
      },
    ],
    []
  );

  const rowActions = (row: SubscriptionRow): Action[] => [
    {
      label: "View Details",
      icon: Eye,
      onClick: () => router.push(`/admin/finance/subscriptions/${row.id}`),
    },
    {
      label: "Renew Period",
      icon: RefreshCw,
      onClick: () => handleRenew(row.id),
    },
    {
      label: "Cancel Subscription",
      icon: XCircle,
      tone: "danger",
      disabled: row.status === "cancelled" || row.status === "expired",
      onClick: () => {
        setCancellingId(row.id);
        setCancelReason("");
      },
    },
  ];

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "Subscriptions" },
        ]}
      />

      <PageHeader
        title="Student Subscriptions"
        subtitle="Manage active B2C subscriptions, sponsored access entitlements, renewal schedules, and cancellations"
        actions={
          <Link
            href="/admin/finance/subscriptions/grant"
            className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-white shadow-soft hover:bg-brand-600 transition-colors"
          >
            <Plus size={15} />
            <span>Grant Authorized Access</span>
          </Link>
        }
      />

      <FilterBar
        filters={filterSpecs}
        values={list.state.filters}
        onChange={list.setFilter}
        onClear={list.clearFilters}
        search={{
          placeholder: "Search subscriptions by code, student name, or student code...",
          value: list.state.search,
          onChange: list.setSearch,
        }}
      />

      <div className="rounded-2xl border border-line bg-white shadow-soft overflow-hidden">
        <DataTable
          columns={columns}
          rows={list.rows}
          rowKey={(r) => r.id}
          isLoading={list.isLoading}
          rowActions={rowActions}
          onRowClick={(row) => router.push(`/admin/finance/subscriptions/${row.id}`)}
          emptyState={{
            title: "No subscriptions found",
            text: "Subscriptions will appear when students purchase plans or receive grants.",
          }}
        />
      </div>

      <Pagination
        page={list.state.page}
        pageSize={list.state.pageSize}
        total={list.meta?.total ?? list.rows.length}
        onPage={list.setPage}
        onPageSize={list.setPageSize}
      />

      {/* Cancel Modal */}
      {cancellingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Cancel Subscription</h3>
            <p className="text-sm text-muted-foreground">
              Choose cancellation timing and provide a reason for the audit ledger.
            </p>
            <form onSubmit={handleCancelSubmit} className="space-y-3">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="mode"
                    value="period_end"
                    checked={cancelMode === "period_end"}
                    onChange={() => setCancelMode("period_end")}
                  />
                  <span>Cancel at period end (keep access until current cycle expires)</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="mode"
                    value="immediate"
                    checked={cancelMode === "immediate"}
                    onChange={() => setCancelMode("immediate")}
                  />
                  <span className="text-red-600 font-medium">Cancel immediately (revoke entitlement now)</span>
                </label>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground">Cancellation Reason</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Guardian requested cancellation due to relocation..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-xs bg-background"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancellingId(null)}
                  className="px-3 py-1.5 border rounded-lg text-xs hover:bg-accent"
                >
                  Keep Subscription
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700"
                >
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

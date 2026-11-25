"use client";

import { useMemo, useState } from "react";
import { RefreshCw, CheckCircle2, AlertTriangle, Layers, DollarSign } from "lucide-react";
import { PageHeader } from "@/components/admin/shell/PageHeader";
import { Breadcrumbs } from "@/components/admin/shell/Breadcrumbs";
import { DataTable, type Column } from "@/components/admin/data/DataTable";
import { Pagination } from "@/components/admin/data/Pagination";
import { StatCard } from "@/components/admin/display/StatCard";
import { StatusBadge } from "@/components/admin/display/StatusBadge";
import { MoneyText } from "@/components/admin/display/FormattedText";
import { useList } from "@/components/admin/data/useList";
import { adminApi } from "@/lib/admin/api";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";

interface ReconciliationRunRow {
  id: string;
  runAt: string;
  provider: string;
  totalTransactions: number;
  pendingTransactions: number;
  gatewayTotal: number;
  ledgerTotal: number;
  difference: number;
  status: string;
  unmatchedCount: number;
}

export default function ReconciliationPage() {
  const { toast } = useCelebrate();
  const [running, setRunning] = useState(false);

  const list = useList<ReconciliationRunRow>({
    endpoint: "/api/admin/finance/reconciliation/runs",
  });

  const latestRun = list.rows?.[0];

  const handleTriggerReconciliation = async () => {
    setRunning(true);
    try {
      await adminApi("/api/admin/finance/reconciliation/runs", { method: "POST" });
      toast("Reconciliation check completed successfully!", "🎉", "mint");
      list.mutate();
    } catch (err: any) {
      toast(err.message || "Reconciliation failed", "⚠️", "coral");
    } finally {
      setRunning(false);
    }
  };

  const columns: Column<ReconciliationRunRow>[] = useMemo(
    () => [
      {
        key: "id",
        header: "Run ID",
        render: (row) => <span className="font-mono text-xs font-semibold">{row.id}</span>,
      },
      {
        key: "provider",
        header: "Gateway Provider",
        render: (row) => <span className="uppercase text-xs font-medium">{row.provider}</span>,
      },
      {
        key: "gatewayTotal",
        header: "Gateway Settled",
        render: (row) => <MoneyText value={row.gatewayTotal} />,
      },
      {
        key: "ledgerTotal",
        header: "General Ledger",
        render: (row) => <MoneyText value={row.ledgerTotal} />,
      },
      {
        key: "difference",
        header: "Discrepancy",
        render: (row) => (
          <span
            className={
              row.difference <= 0.01
                ? "text-emerald-600 font-semibold text-xs"
                : "text-red-600 font-semibold text-xs"
            }
          >
            {row.difference <= 0.01 ? "৳0.00 (Balanced)" : `৳${row.difference.toFixed(2)}`}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: "runAt",
        header: "Executed At",
        render: (row) => (
          <span className="text-xs text-muted-foreground">
            {new Date(row.runAt).toLocaleString()}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Finance", href: "/admin/finance/subscriptions" },
          { label: "Reconciliation" },
        ]}
      />

      <PageHeader
        title="Gateway & Ledger Reconciliation"
        subtitle="Automated audit comparing Shurjopay settlement totals with General Ledger account 1000 debits"
        actions={
          <button
            onClick={handleTriggerReconciliation}
            disabled={running}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${running ? "animate-spin" : ""}`} />
            Run Reconciliation
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          label="Gateway Succeeded"
          value={latestRun?.gatewayTotal ?? 0}
          format="bdt"
        />
        <StatCard
          label="Ledger Total"
          value={latestRun?.ledgerTotal ?? 0}
          format="bdt"
        />
        <StatCard
          label="Variance"
          value={latestRun?.difference ? Number(latestRun.difference.toFixed(2)) : 0}
          format="bdt"
        />
        <StatCard
          label="Reconciliation Status"
          value={latestRun?.difference && latestRun.difference > 0.01 ? "Variance Detected" : "100% Balanced"}
          hint={latestRun?.difference && latestRun.difference > 0.01 ? "Check discrepancies" : "All accounts aligned"}
        />
      </div>

      <DataTable
        columns={columns}
        rows={list.rows}
        rowKey={(row) => row.id}
        isLoading={list.isLoading}
        emptyState={{
          title: "No reconciliation records",
          text: "Click 'Run Reconciliation' to perform a balance check.",
        }}
      />

      <Pagination
        page={list.state.page}
        pageSize={list.state.pageSize}
        total={list.meta?.total || 0}
        onPage={list.setPage}
        onPageSize={list.setPageSize}
      />
    </div>
  );
}

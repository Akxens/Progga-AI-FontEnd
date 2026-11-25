"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Undo, Eye } from "lucide-react";
import { PageHeader } from "@/components/admin/shell/PageHeader";
import { Breadcrumbs } from "@/components/admin/shell/Breadcrumbs";
import { DataTable, type Column } from "@/components/admin/data/DataTable";
import { Pagination } from "@/components/admin/data/Pagination";
import { StatusBadge } from "@/components/admin/display/StatusBadge";
import { MoneyText } from "@/components/admin/display/FormattedText";
import { useList } from "@/components/admin/data/useList";

interface RefundRow {
  id: string;
  code: string;
  transactionId: string;
  transactionCode: string;
  studentName: string;
  studentEmail?: string;
  amount: number;
  currency: string;
  status: string;
  reason: string;
  refundedAt: string;
}

export default function RefundsListPage() {
  const router = useRouter();
  const list = useList<RefundRow>({
    endpoint: "/api/admin/finance/refunds",
  });

  const columns: Column<RefundRow>[] = useMemo(
    () => [
      {
        key: "code",
        header: "Refund ID",
        render: (row) => (
          <span className="font-mono text-xs font-semibold text-primary">
            {row.code}
          </span>
        ),
      },
      {
        key: "transactionCode",
        header: "Original Txn",
        render: (row) => (
          <Link
            href={`/admin/finance/payments/${row.transactionId}`}
            className="font-mono text-xs text-primary hover:underline"
          >
            {row.transactionCode}
          </Link>
        ),
      },
      {
        key: "student",
        header: "Student",
        render: (row) => (
          <div>
            <div className="font-medium text-foreground">{row.studentName}</div>
            <div className="text-xs text-muted-foreground">{row.studentEmail || "—"}</div>
          </div>
        ),
      },
      {
        key: "amount",
        header: "Refund Amount",
        render: (row) => (
          <span className="font-semibold text-red-600">
            -<MoneyText value={row.amount} />
          </span>
        ),
      },
      {
        key: "reason",
        header: "Reason",
        render: (row) => (
          <span className="text-xs text-muted-foreground line-clamp-1">{row.reason}</span>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: "refundedAt",
        header: "Processed Date",
        render: (row) => (
          <span className="text-xs text-muted-foreground">
            {new Date(row.refundedAt).toLocaleString()}
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
          { label: "Refunds" },
        ]}
      />

      <PageHeader
        title="Customer Refunds & Reversals"
        subtitle="Manage customer refund requests, ledger reversal journals, and access entitlement adjustments"
        actions={
          <Link
            href="/admin/finance/refunds/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Request Refund
          </Link>
        }
      />

      <DataTable
        columns={columns}
        rows={list.rows}
        rowKey={(row) => row.id}
        isLoading={list.isLoading}
        emptyState={{
          title: "No refund transactions found",
          text: "Refunded transactions will appear here with reversing double-entry ledger journals.",
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

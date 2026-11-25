"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, RefreshCw } from "lucide-react";
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

interface PaymentRow {
  id: string;
  code: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  studentCode: string;
  amount: number;
  currency: string;
  provider: string;
  providerTxnId?: string;
  status: string;
  method?: string;
  subscriptionId?: string;
  planName: string;
  invoiceNumber?: string;
  initiatedAt: string;
  completedAt?: string;
}

const filterSpecs: FilterSpec[] = [
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "succeeded", label: "Succeeded" },
      { value: "pending", label: "Pending" },
      { value: "failed", label: "Failed" },
      { value: "refunded", label: "Refunded" },
    ],
  },
  {
    key: "provider",
    label: "Gateway Provider",
    type: "select",
    options: [
      { value: "shurjopay", label: "Shurjopay Bangladesh" },
      { value: "bkash", label: "bKash Direct" },
      { value: "nagad", label: "Nagad" },
    ],
  },
];

export default function PaymentsListPage() {
  const router = useRouter();
  const { toast } = useCelebrate();
  const list = useList<PaymentRow>({
    endpoint: "/api/admin/payments",
  });

  const handleVerify = async (id: string) => {
    try {
      await adminApi(`/api/admin/payments/${id}/verify`, { method: "POST" });
      toast("Payment verified with gateway!", "✓", "mint");
      list.mutate();
    } catch (err: any) {
      toast(err.message || "Verification failed", "⚠️", "coral");
    }
  };

  const columns: Column<PaymentRow>[] = useMemo(
    () => [
      {
        key: "code",
        header: "Transaction ID",
        render: (row) => (
          <span className="font-mono text-xs font-semibold text-primary hover:underline">
            {row.code}
          </span>
        ),
      },
      {
        key: "providerTxnId",
        header: "Gateway Ref",
        render: (row) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.providerTxnId || "—"}
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
        key: "amount",
        header: "Amount",
        render: (row) => (
          <span className="font-semibold">
            <MoneyText value={row.amount} />
          </span>
        ),
      },
      {
        key: "provider",
        header: "Provider / Method",
        render: (row) => (
          <div>
            <span className="text-xs uppercase font-medium text-foreground">{row.provider}</span>
            {row.method && <div className="text-xs text-muted-foreground capitalize">{row.method}</div>}
          </div>
        ),
      },
      {
        key: "invoiceNumber",
        header: "Invoice",
        render: (row) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.invoiceNumber || "—"}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: "initiatedAt",
        header: "Initiated",
        render: (row) => (
          <span className="text-xs text-muted-foreground">
            {new Date(row.initiatedAt).toLocaleString()}
          </span>
        ),
      },
    ],
    []
  );

  const getRowActions = (row: PaymentRow): Action[] => {
    const actions: Action[] = [
      {
        label: "View Details",
        icon: Eye,
        onClick: () => router.push(`/admin/finance/payments/${row.id}`),
      },
    ];

    if (row.status !== "succeeded") {
      actions.push({
        label: "Verify Gateway",
        icon: RefreshCw,
        onClick: () => handleVerify(row.id),
      });
    }

    return actions;
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Finance", href: "/admin/finance/subscriptions" },
          { label: "Payments" },
        ]}
      />

      <PageHeader
        title="Payment Transactions"
        subtitle="Live payment gateway records, verified Shurjopay checkout transactions, invoices, and settlement status"
      />

      <FilterBar
        filters={filterSpecs}
        values={list.state.filters}
        onChange={list.setFilter}
        onClear={list.clearFilters}
        search={{
          placeholder: "Search payments by txn ID, provider ref, or student...",
          value: list.state.search,
          onChange: list.setSearch,
        }}
      />

      <DataTable
        columns={columns}
        rows={list.rows}
        rowKey={(row) => row.id}
        isLoading={list.isLoading}
        rowActions={getRowActions}
        onRowClick={(row) => router.push(`/admin/finance/payments/${row.id}`)}
        emptyState={{
          title: "No payment transactions found",
          text: "Payments will appear here when students checkout online.",
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

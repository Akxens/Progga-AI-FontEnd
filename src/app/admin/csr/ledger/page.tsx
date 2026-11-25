"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Book, CheckCircle2, ShieldCheck, DollarSign } from "lucide-react";
import { PageHeader } from "@/components/admin/shell/PageHeader";
import { Breadcrumbs } from "@/components/admin/shell/Breadcrumbs";
import { DataTable, type Column } from "@/components/admin/data/DataTable";
import { Pagination } from "@/components/admin/data/Pagination";
import { MoneyText } from "@/components/admin/display/FormattedText";
import { useList } from "@/components/admin/data/useList";

interface JournalRow {
  id: string;
  code: string;
  legalEntityId: string;
  entryType: string;
  description: string;
  postedAt: string;
  totalAmount: number;
  isBalanced: boolean;
  entries: {
    id: string;
    accountCode: string;
    direction: "debit" | "credit";
    amount: number;
    description: string;
  }[];
}

export default function CSRLedgerPage() {
  const list = useList<JournalRow>({
    endpoint: "/api/admin/csr/ledger",
  });

  const columns: Column<JournalRow>[] = useMemo(
    () => [
      {
        key: "code",
        header: "Journal Ref",
        render: (row) => (
          <span className="font-mono text-xs font-semibold text-primary">
            {row.code}
          </span>
        ),
      },
      {
        key: "description",
        header: "Description / Purpose",
        render: (row) => (
          <div>
            <div className="text-xs font-medium text-foreground">{row.description}</div>
            <span className="text-xs font-mono text-muted-foreground uppercase">{row.entryType}</span>
          </div>
        ),
      },
      {
        key: "entries",
        header: "Ledger Postings (Double-Entry)",
        render: (row) => (
          <div className="space-y-1 py-1">
            {row.entries.map((e) => (
              <div key={e.id} className="text-xs flex items-center gap-2 font-mono">
                <span className="w-16 font-semibold">{e.accountCode}</span>
                <span
                  className={`w-12 uppercase font-medium ${
                    e.direction === "debit" ? "text-emerald-600" : "text-blue-600"
                  }`}
                >
                  {e.direction}
                </span>
                <span>৳{Number(e.amount).toFixed(2)}</span>
              </div>
            ))}
          </div>
        ),
      },
      {
        key: "totalAmount",
        header: "Total",
        render: (row) => (
          <span className="font-semibold text-xs">
            <MoneyText value={row.totalAmount} />
          </span>
        ),
      },
      {
        key: "status",
        header: "Audit Check",
        render: (row) => (
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              row.isBalanced ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            }`}
          >
            {row.isBalanced ? "Balanced" : "Discrepancy"}
          </span>
        ),
      },
      {
        key: "postedAt",
        header: "Posted Date",
        render: (row) => (
          <span className="text-xs text-muted-foreground">
            {new Date(row.postedAt).toLocaleString()}
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
          { label: "CSR & Foundation", href: "/admin/csr" },
          { label: "General Ledger" },
        ]}
      />

      <PageHeader
        title="Progga Foundation General Ledger"
        subtitle="Audited, balanced double-entry accounting records strictly segregated from Progga Ltd commercial revenues."
      />

      <DataTable
        columns={columns}
        rows={list.rows}
        rowKey={(row) => row.id}
        isLoading={list.isLoading}
        emptyState={{
          title: "No Foundation ledger entries",
          text: "Ledger entries post automatically when grant receipts are deposited or sponsorships allocated.",
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

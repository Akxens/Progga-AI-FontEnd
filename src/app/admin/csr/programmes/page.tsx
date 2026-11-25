"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Eye, Edit2, Award } from "lucide-react";
import { PageHeader } from "@/components/admin/shell/PageHeader";
import { Breadcrumbs } from "@/components/admin/shell/Breadcrumbs";
import { DataTable, type Column, type Action } from "@/components/admin/data/DataTable";
import { FilterBar } from "@/components/admin/data/FilterBar";
import { Pagination } from "@/components/admin/data/Pagination";
import { StatusBadge } from "@/components/admin/display/StatusBadge";
import { MoneyText } from "@/components/admin/display/FormattedText";
import { useList, type FilterSpec } from "@/components/admin/data/useList";

interface ProgrammeRow {
  id: string;
  code: string;
  name: string;
  partnerId: string;
  partnerName: string;
  partnerCode: string;
  agreementRef: string;
  grantAmount: number;
  seatCapacity: number;
  activeSeatsCount: number;
  allocatedAmount: number;
  fundedRatePerSeatMonth: number;
  startDate: string;
  endDate: string;
  status: string;
  beneficiariesCount: number;
  createdAt: string;
}

const filterSpecs: FilterSpec[] = [
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "draft", label: "Draft" },
      { value: "active", label: "Active" },
      { value: "completed", label: "Completed" },
      { value: "suspended", label: "Suspended" },
    ],
  },
];

export default function ProgrammesListPage() {
  const router = useRouter();
  const list = useList<ProgrammeRow>({
    endpoint: "/api/admin/csr/programmes",
  });

  const columns: Column<ProgrammeRow>[] = useMemo(
    () => [
      {
        key: "code",
        header: "Programme ID",
        render: (row) => (
          <span className="font-mono text-xs font-semibold text-primary hover:underline">
            {row.code}
          </span>
        ),
      },
      {
        key: "name",
        header: "Programme Title",
        render: (row) => (
          <div>
            <div className="font-semibold text-foreground">{row.name}</div>
            <div className="text-xs text-muted-foreground">
              Partner: {row.partnerName} ({row.agreementRef})
            </div>
          </div>
        ),
      },
      {
        key: "grantAmount",
        header: "Budget",
        render: (row) => (
          <span className="font-semibold">
            <MoneyText value={row.grantAmount} />
          </span>
        ),
      },
      {
        key: "seats",
        header: "Seat Quota",
        render: (row) => (
          <div>
            <span className="text-xs font-semibold text-foreground">
              {row.activeSeatsCount} / {row.seatCapacity} seats
            </span>
            <div className="w-24 bg-muted rounded-full h-1.5 mt-1 overflow-hidden">
              <div
                className="bg-primary h-full"
                style={{
                  width: `${Math.min(100, Math.round((row.activeSeatsCount / (row.seatCapacity || 1)) * 100))}%`,
                }}
              />
            </div>
          </div>
        ),
      },
      {
        key: "allocatedAmount",
        header: "Allocated",
        render: (row) => (
          <span className="text-xs font-mono font-medium">
            <MoneyText value={row.allocatedAmount} />
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: "timeline",
        header: "Timeline",
        render: (row) => (
          <span className="text-xs text-muted-foreground">
            {new Date(row.startDate).toLocaleDateString()} - {new Date(row.endDate).toLocaleDateString()}
          </span>
        ),
      },
    ],
    []
  );

  const getRowActions = (row: ProgrammeRow): Action[] => [
    {
      label: "View Programme",
      icon: Eye,
      onClick: () => router.push(`/admin/csr/programmes/${row.id}`),
    },
    {
      label: "Edit Settings",
      icon: Edit2,
      onClick: () => router.push(`/admin/csr/programmes/${row.id}/edit`),
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "CSR & Foundation", href: "/admin/csr" },
          { label: "Programmes" },
        ]}
      />

      <PageHeader
        title="CSR Impact Programmes"
        subtitle="Sponsorship delivery frameworks with authorized budget lines, seat allocations, and milestone tracking."
        actions={
          <Link
            href="/admin/csr/programmes/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Programme
          </Link>
        }
      />

      <FilterBar
        filters={filterSpecs}
        values={list.state.filters}
        onChange={list.setFilter}
        onClear={list.clearFilters}
        search={{
          placeholder: "Search programmes by name, code or partner...",
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
        onRowClick={(row) => router.push(`/admin/csr/programmes/${row.id}`)}
        emptyState={{
          title: "No CSR programmes found",
          text: "Create a programme tied to an active partner grant agreement to fund student seats.",
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

"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Eye, Edit2 } from "lucide-react";
import { PageHeader } from "@/components/admin/shell/PageHeader";
import { Breadcrumbs } from "@/components/admin/shell/Breadcrumbs";
import { DataTable, type Column, type Action } from "@/components/admin/data/DataTable";
import { FilterBar } from "@/components/admin/data/FilterBar";
import { Pagination } from "@/components/admin/data/Pagination";
import { StatusBadge } from "@/components/admin/display/StatusBadge";
import { MoneyText } from "@/components/admin/display/FormattedText";
import { useList, type FilterSpec } from "@/components/admin/data/useList";

interface PartnerRow {
  id: string;
  code: string;
  name: string;
  type: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  reportingSchedule: string;
  status: string;
  agreementsCount: number;
  programmesCount: number;
  totalCommitted: number;
  createdAt: string;
}

const filterSpecs: FilterSpec[] = [
  {
    key: "type",
    label: "Partner Type",
    type: "select",
    options: [
      { value: "corporate", label: "Corporate Sponsor" },
      { value: "ngo", label: "NGO / Foundation" },
      { value: "government", label: "Government Ministry" },
      { value: "individual", label: "Individual Donor" },
    ],
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "active", label: "Active" },
      { value: "archived", label: "Archived" },
    ],
  },
];

export default function PartnersListPage() {
  const router = useRouter();
  const list = useList<PartnerRow>({
    endpoint: "/api/admin/csr/partners",
  });

  const columns: Column<PartnerRow>[] = useMemo(
    () => [
      {
        key: "code",
        header: "Partner ID",
        render: (row) => (
          <span className="font-mono text-xs font-semibold text-primary hover:underline">
            {row.code}
          </span>
        ),
      },
      {
        key: "name",
        header: "Partner Organization",
        render: (row) => (
          <div>
            <div className="font-semibold text-foreground">{row.name}</div>
            <div className="text-xs text-muted-foreground capitalize">{row.type}</div>
          </div>
        ),
      },
      {
        key: "contact",
        header: "Primary Contact",
        render: (row) => (
          <div>
            <div className="text-xs font-medium text-foreground">{row.contactName}</div>
            <div className="text-xs text-muted-foreground">{row.contactEmail}</div>
          </div>
        ),
      },
      {
        key: "totalCommitted",
        header: "Total Committed",
        render: (row) => (
          <span className="font-semibold">
            <MoneyText value={row.totalCommitted} />
          </span>
        ),
      },
      {
        key: "programmesCount",
        header: "Programmes",
        render: (row) => (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted">
            {row.programmesCount} active
          </span>
        ),
      },
      {
        key: "reportingSchedule",
        header: "Reporting",
        render: (row) => (
          <span className="text-xs capitalize text-muted-foreground">
            {row.reportingSchedule}
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

  const getRowActions = (row: PartnerRow): Action[] => [
    {
      label: "View Agreements",
      icon: Eye,
      onClick: () => router.push(`/admin/csr/partners/${row.id}`),
    },
    {
      label: "Edit Profile",
      icon: Edit2,
      onClick: () => router.push(`/admin/csr/partners/${row.id}/edit`),
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "CSR & Foundation", href: "/admin/csr" },
          { label: "Partners" },
        ]}
      />

      <PageHeader
        title="CSR Partners & Institutional Donors"
        subtitle="Manage corporate social responsibility partners, philanthropic trusts, and active grant commitments."
        actions={
          <Link
            href="/admin/csr/partners/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Register Partner
          </Link>
        }
      />

      <FilterBar
        filters={filterSpecs}
        values={list.state.filters}
        onChange={list.setFilter}
        onClear={list.clearFilters}
        search={{
          placeholder: "Search partners by name, code or contact...",
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
        onRowClick={(row) => router.push(`/admin/csr/partners/${row.id}`)}
        emptyState={{
          title: "No CSR partners registered",
          text: "Register corporate partners to attach grant agreements and launch sponsored programmes.",
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

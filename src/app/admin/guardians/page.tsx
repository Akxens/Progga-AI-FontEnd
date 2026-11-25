"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { PageHeader } from "@/components/admin/shell/PageHeader";
import { Breadcrumbs } from "@/components/admin/shell/Breadcrumbs";
import { DataTable, type Column, type Action } from "@/components/admin/data/DataTable";
import { FilterBar } from "@/components/admin/data/FilterBar";
import { Pagination } from "@/components/admin/data/Pagination";
import { StatusBadge } from "@/components/admin/display/StatusBadge";
import { useList, type FilterSpec } from "@/components/admin/data/useList";

interface GuardianRow {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  studentCount: number;
  verified: boolean;
  hasConsent: boolean;
  accountStatus: string;
  createdAt: string;
}

const filterSpecs: FilterSpec[] = [
  {
    key: "verified",
    label: "Verification",
    type: "select",
    options: [
      { value: "true", label: "Verified" },
      { value: "false", label: "Unverified" },
    ],
  },
];

export default function GuardiansListPage() {
  const router = useRouter();
  const list = useList<GuardianRow>({
    endpoint: "/api/admin/guardians",
    defaultSort: "-createdAt",
    defaultPageSize: 20,
    filters: filterSpecs,
  });

  const columns: Column<GuardianRow>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Guardian",
        render: (row) => (
          <div>
            <Link
              href={`/admin/guardians/${row.id}`}
              className="font-semibold text-brand-600 hover:underline"
            >
              {row.name || "Guardian"}
            </Link>
            <div className="text-[11px] text-ink-muted">{row.phone || row.email || "No contact"}</div>
          </div>
        ),
      },
      {
        key: "students",
        header: "Linked Students",
        render: (row) => (
          <span className="font-semibold text-ink">
            {row.studentCount} {row.studentCount === 1 ? "student" : "students"}
          </span>
        ),
      },
      {
        key: "verification",
        header: "Identity Status",
        render: (row) => (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
              row.verified ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
            }`}
          >
            {row.verified ? "Verified" : "Pending Verification"}
          </span>
        ),
      },
      {
        key: "consent",
        header: "Consent Status",
        render: (row) => (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
              row.hasConsent ? "bg-brand-50 text-brand-700" : "bg-slate-100 text-ink-muted"
            }`}
          >
            {row.hasConsent ? "Consent Granted" : "No Consent"}
          </span>
        ),
      },
      {
        key: "status",
        header: "Account",
        render: (row) => <StatusBadge status={row.accountStatus || "active"} />,
      },
      {
        key: "createdAt",
        header: "Joined",
        render: (row) => (
          <span className="text-xs text-ink-muted">
            {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—"}
          </span>
        ),
      },
    ],
    []
  );

  const rowActions = (row: GuardianRow): Action[] => [
    {
      label: "View Guardian Profile",
      icon: Eye,
      onClick: () => router.push(`/admin/guardians/${row.id}`),
    },
  ];

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/admin" }, { label: "Guardians" }]} />

      <PageHeader
        title="Guardians & Parental Consent"
        subtitle="Manage verified parents, child links, and statutory paper/digital consent declarations"
      />

      <FilterBar
        filters={filterSpecs}
        values={list.state.filters}
        onChange={list.setFilter}
        onClear={list.clearFilters}
        search={{
          placeholder: "Search guardians by name, phone or email...",
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
          onRowClick={(r) => router.push(`/admin/guardians/${r.id}`)}
          rowActions={rowActions}
          emptyState={{
            title: "No guardians found",
            text: "No parent or guardian accounts match your search criteria.",
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
    </div>
  );
}

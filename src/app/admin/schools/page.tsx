"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Eye, Edit3, School as SchoolIcon } from "lucide-react";
import { PageHeader } from "@/components/admin/shell/PageHeader";
import { Breadcrumbs } from "@/components/admin/shell/Breadcrumbs";
import { DataTable, type Column, type Action } from "@/components/admin/data/DataTable";
import { FilterBar } from "@/components/admin/data/FilterBar";
import { Pagination } from "@/components/admin/data/Pagination";
import { StatusBadge } from "@/components/admin/display/StatusBadge";
import { useList, type FilterSpec } from "@/components/admin/data/useList";

interface SchoolRow {
  id: string;
  code: string;
  name: string;
  eiin?: string;
  division?: string;
  district?: string;
  type?: string;
  onboardingStage?: string;
  status: string;
  studentCount?: number;
  teacherCount?: number;
}

const filterSpecs: FilterSpec[] = [
  {
    key: "division",
    label: "Division",
    type: "select",
    options: [
      { value: "Dhaka", label: "Dhaka" },
      { value: "Chittagong", label: "Chittagong" },
      { value: "Rajshahi", label: "Rajshahi" },
      { value: "Khulna", label: "Khulna" },
      { value: "Barishal", label: "Barishal" },
      { value: "Sylhet", label: "Sylhet" },
      { value: "Rangpur", label: "Rangpur" },
      { value: "Mymensingh", label: "Mymensingh" },
    ],
  },
  {
    key: "type",
    label: "Type",
    type: "select",
    options: [
      { value: "government", label: "Government" },
      { value: "private_mpo", label: "Private (MPO)" },
      { value: "private_non_mpo", label: "Private (Non-MPO)" },
      { value: "madrasah", label: "Madrasah" },
    ],
  },
];

export default function SchoolsListPage() {
  const router = useRouter();
  const list = useList<SchoolRow>({
    endpoint: "/api/admin/schools",
    defaultSort: "name",
    defaultPageSize: 20,
    filters: filterSpecs,
  });

  const columns: Column<SchoolRow>[] = useMemo(
    () => [
      {
        key: "code",
        header: "School Code",
        render: (row) => (
          <Link
            href={`/admin/schools/${row.id}`}
            className="font-mono text-xs font-bold text-brand-600 hover:underline"
          >
            {row.code || "SCH-—"}
          </Link>
        ),
      },
      {
        key: "name",
        header: "Institution Name",
        render: (row) => (
          <div>
            <div className="font-semibold text-ink">{row.name}</div>
            <div className="text-[11px] text-ink-muted">EIIN: {row.eiin || "Not provided"}</div>
          </div>
        ),
      },
      {
        key: "location",
        header: "Location",
        render: (row) => (
          <span className="text-xs text-ink-soft">
            {row.district ? `${row.district}, ${row.division}` : row.division || "—"}
          </span>
        ),
      },
      {
        key: "type",
        header: "Type",
        render: (row) => (
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-ink-soft capitalize">
            {row.type?.replace("_", " ") || "Government"}
          </span>
        ),
      },
      {
        key: "stage",
        header: "Onboarding Stage",
        render: (row) => (
          <span className="inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700 capitalize">
            {row.onboardingStage?.replace(/_/g, " ") || "Initial Registration"}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (row) => <StatusBadge status={row.status || "active"} />,
      },
    ],
    []
  );

  const rowActions = (row: SchoolRow): Action[] => [
    {
      label: "View School Profile",
      icon: Eye,
      onClick: () => router.push(`/admin/schools/${row.id}`),
    },
    {
      label: "Edit Details",
      icon: Edit3,
      onClick: () => router.push(`/admin/schools/${row.id}/edit`),
    },
  ];

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/admin" }, { label: "Schools" }]} />

      <PageHeader
        title="Partner Schools & Campuses"
        subtitle="Manage participating educational institutions, EIIN registrations, and onboarding progression"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/activation"
              className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2 text-xs font-bold text-ink shadow-soft hover:bg-slate-50 transition-colors"
            >
              <SchoolIcon size={15} />
              <span>Campus Activation</span>
            </Link>
            <Link
              href="/admin/schools/new"
              className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-white shadow-soft hover:bg-brand-600 transition-colors"
            >
              <Plus size={15} />
              <span>Register School</span>
            </Link>
          </div>
        }
      />

      <FilterBar
        filters={filterSpecs}
        values={list.state.filters}
        onChange={list.setFilter}
        onClear={list.clearFilters}
        search={{
          placeholder: "Search schools by name, EIIN, code or district...",
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
          onRowClick={(r) => router.push(`/admin/schools/${r.id}`)}
          rowActions={rowActions}
          emptyState={{
            title: "No schools found",
            text: "No educational institutions match your search criteria.",
            action: (
              <Link
                href="/admin/schools/new"
                className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:underline"
              >
                + Register first school
              </Link>
            ),
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

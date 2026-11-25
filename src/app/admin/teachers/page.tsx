"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, Eye, Edit3, Award } from "lucide-react";
import { PageHeader } from "@/components/admin/shell/PageHeader";
import { Breadcrumbs } from "@/components/admin/shell/Breadcrumbs";
import { DataTable, type Column, type Action } from "@/components/admin/data/DataTable";
import { FilterBar } from "@/components/admin/data/FilterBar";
import { Pagination } from "@/components/admin/data/Pagination";
import { StatusBadge } from "@/components/admin/display/StatusBadge";
import { useList, type FilterSpec } from "@/components/admin/data/useList";

interface TeacherRow {
  id: string;
  code: string;
  name: string;
  email?: string;
  phone?: string;
  designation?: string;
  schoolName?: string;
  subjects?: string[];
  accountStatus: string;
  verified: boolean;
}

const filterSpecs: FilterSpec[] = [
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "active", label: "Active" },
      { value: "suspended", label: "Suspended" },
    ],
  },
];

export default function TeachersListPage() {
  const router = useRouter();
  const list = useList<TeacherRow>({
    endpoint: "/api/admin/teachers",
    defaultSort: "name",
    defaultPageSize: 20,
    filters: filterSpecs,
  });

  const columns: Column<TeacherRow>[] = useMemo(
    () => [
      {
        key: "code",
        header: "Staff ID",
        render: (row) => (
          <Link
            href={`/admin/teachers/${row.id}`}
            className="font-mono text-xs font-bold text-brand-600 hover:underline"
          >
            {row.code || "TCH-—"}
          </Link>
        ),
      },
      {
        key: "name",
        header: "Teacher Name",
        render: (row) => (
          <div>
            <div className="font-semibold text-ink">{row.name}</div>
            <div className="text-[11px] text-ink-muted">{row.designation || "Educator"}</div>
          </div>
        ),
      },
      {
        key: "contact",
        header: "Contact",
        render: (row) => (
          <div className="text-xs text-ink-soft">
            <div>{row.phone || "—"}</div>
            <div className="text-[11px] text-ink-muted">{row.email || ""}</div>
          </div>
        ),
      },
      {
        key: "school",
        header: "School Affiliation",
        render: (row) => <span className="text-xs font-medium text-ink-soft">{row.schoolName || "Independent"}</span>,
      },
      {
        key: "subjects",
        header: "Subjects",
        render: (row) => (
          <div className="flex flex-wrap gap-1">
            {(row.subjects || []).slice(0, 2).map((s, idx) => (
              <span key={idx} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-ink-soft">
                {s}
              </span>
            ))}
            {(row.subjects?.length ?? 0) > 2 && (
              <span className="text-[10px] text-ink-muted">+{row.subjects!.length - 2}</span>
            )}
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (row) => <StatusBadge status={row.accountStatus || "active"} />,
      },
    ],
    []
  );

  const rowActions = (row: TeacherRow): Action[] => [
    {
      label: "View Profile",
      icon: Eye,
      onClick: () => router.push(`/admin/teachers/${row.id}`),
    },
    {
      label: "Edit Details",
      icon: Edit3,
      onClick: () => router.push(`/admin/teachers/${row.id}/edit`),
    },
  ];

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/admin" }, { label: "Teachers" }]} />

      <PageHeader
        title="Teachers Directory"
        subtitle="Manage registered educators, teaching assignments, and professional training cohorts"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/training"
              className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2 text-xs font-bold text-ink shadow-soft hover:bg-slate-50 transition-colors"
            >
              <Award size={15} />
              <span>Training Programmes</span>
            </Link>
            <Link
              href="/admin/teachers/new"
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
            >
              <UserPlus size={15} />
              <span>Add Teacher</span>
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
          placeholder: "Search teachers by name, staff code, phone or email...",
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
          onRowClick={(r) => router.push(`/admin/teachers/${r.id}`)}
          rowActions={rowActions}
          emptyState={{
            title: "No teachers found",
            text: "No educator records match the active search and filter criteria.",
            action: (
              <Link
                href="/admin/teachers/new"
                className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:underline"
              >
                + Register first teacher
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

"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Eye } from "lucide-react";
import { PageHeader } from "@/components/admin/shell/PageHeader";
import { Breadcrumbs } from "@/components/admin/shell/Breadcrumbs";
import { DataTable, type Column, type Action } from "@/components/admin/data/DataTable";
import { FilterBar } from "@/components/admin/data/FilterBar";
import { Pagination } from "@/components/admin/data/Pagination";
import { StatusBadge } from "@/components/admin/display/StatusBadge";
import { useList, type FilterSpec } from "@/components/admin/data/useList";

interface ProgrammeRow {
  id: string;
  code: string;
  title: string;
  category: string;
  targetAudience?: string;
  durationHours: number;
  cohortCount?: number;
  enrolledCount?: number;
  status: string;
}

const filterSpecs: FilterSpec[] = [
  {
    key: "category",
    label: "Category",
    type: "select",
    options: [
      { value: "AI_PEDAGOGY", label: "AI & Modern Pedagogy" },
      { value: "STEM_CURRICULUM", label: "STEM Curriculum" },
      { value: "ASSESSMENT", label: "Assessment" },
    ],
  },
];

export default function TrainingListPage() {
  const router = useRouter();
  const list = useList<ProgrammeRow>({
    endpoint: "/api/admin/training/programmes",
    defaultSort: "-createdAt",
    defaultPageSize: 20,
    filters: filterSpecs,
  });

  const columns: Column<ProgrammeRow>[] = useMemo(
    () => [
      {
        key: "code",
        header: "Programme Code",
        render: (row) => (
          <Link
            href={`/admin/training/${row.id}`}
            className="font-mono text-xs font-bold text-brand-600 hover:underline"
          >
            {row.code || "TRN-—"}
          </Link>
        ),
      },
      {
        key: "title",
        header: "Programme Title",
        render: (row) => (
          <div>
            <div className="font-semibold text-ink">{row.title}</div>
            <div className="text-[11px] text-ink-muted">{row.targetAudience || "Teachers"}</div>
          </div>
        ),
      },
      {
        key: "category",
        header: "Category",
        render: (row) => (
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-ink-soft">
            {row.category}
          </span>
        ),
      },
      {
        key: "duration",
        header: "Duration",
        render: (row) => <span className="font-medium text-ink">{row.durationHours} hrs</span>,
      },
      {
        key: "cohorts",
        header: "Active Cohorts",
        render: (row) => <span className="text-xs font-semibold text-ink-soft">{row.cohortCount ?? 1}</span>,
      },
      {
        key: "status",
        header: "Status",
        render: (row) => <StatusBadge status={row.status || "active"} />,
      },
    ],
    []
  );

  const rowActions = (row: ProgrammeRow): Action[] => [
    {
      label: "View Programme Details",
      icon: Eye,
      onClick: () => router.push(`/admin/training/${row.id}`),
    },
  ];

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/admin" }, { label: "Teacher Training" }]} />

      <PageHeader
        title="Teacher Training & Certification"
        subtitle="Manage professional development curricula, training cohorts, and CRT-* certificate issuance"
        actions={
          <Link
            href="/admin/training/new"
            className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-white shadow-soft hover:bg-brand-600 transition-colors"
          >
            <Plus size={15} />
            <span>New Programme</span>
          </Link>
        }
      />

      <FilterBar
        filters={filterSpecs}
        values={list.state.filters}
        onChange={list.setFilter}
        onClear={list.clearFilters}
        search={{
          placeholder: "Search training programmes by title or code...",
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
          onRowClick={(r) => router.push(`/admin/training/${r.id}`)}
          rowActions={rowActions}
          emptyState={{
            title: "No training programmes found",
            text: "No professional development programmes currently match the filter selection.",
            action: (
              <Link
                href="/admin/training/new"
                className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:underline"
              >
                + Create first programme
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

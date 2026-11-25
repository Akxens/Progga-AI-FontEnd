"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import { PageHeader } from "@/components/admin/shell/PageHeader";
import { Breadcrumbs } from "@/components/admin/shell/Breadcrumbs";
import { DataTable, type Column } from "@/components/admin/data/DataTable";
import { FilterBar } from "@/components/admin/data/FilterBar";
import { Pagination } from "@/components/admin/data/Pagination";
import { useList, type FilterSpec } from "@/components/admin/data/useList";

interface SessionRow {
  id: string;
  studentId: string;
  studentName?: string;
  studentCode?: string;
  mode: string;
  subject?: string;
  durationSeconds?: number;
  questionsCount?: number;
  startedAt: string;
}

const filterSpecs: FilterSpec[] = [
  {
    key: "mode",
    label: "Session Mode",
    type: "select",
    options: [
      { value: "tutor", label: "Interactive AI Tutor" },
      { value: "quiz", label: "Diagnostic Quiz" },
      { value: "battle", label: "Live Battle League" },
    ],
  },
];

export default function SessionsListPage() {
  const list = useList<SessionRow>({
    endpoint: "/api/admin/sessions",
    defaultSort: "-startedAt",
    defaultPageSize: 25,
    filters: filterSpecs,
  });

  const columns: Column<SessionRow>[] = useMemo(
    () => [
      {
        key: "id",
        header: "Session ID",
        render: (row) => <span className="font-mono text-xs text-ink-muted">{row.id.slice(0, 8)}...</span>,
      },
      {
        key: "student",
        header: "Student",
        render: (row) => (
          <div>
            <Link
              href={`/admin/students/${row.studentId}`}
              className="font-semibold text-brand-600 hover:underline"
            >
              {row.studentName || "Student"}
            </Link>
            <div className="font-mono text-[11px] text-ink-muted">{row.studentCode || "—"}</div>
          </div>
        ),
      },
      {
        key: "mode",
        header: "Learning Mode",
        render: (row) => (
          <span className="inline-flex items-center rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 capitalize">
            {row.mode}
          </span>
        ),
      },
      {
        key: "subject",
        header: "Subject / Topic",
        render: (row) => <span className="text-xs text-ink-soft">{row.subject || "General Inquiry"}</span>,
      },
      {
        key: "duration",
        header: "Duration",
        render: (row) => (
          <span className="font-medium text-ink">
            {row.durationSeconds ? `${Math.round(row.durationSeconds / 60)} min` : "1 min"}
          </span>
        ),
      },
      {
        key: "questions",
        header: "Interactions",
        render: (row) => <span className="text-xs text-ink-soft">{row.questionsCount ?? 1} turns</span>,
      },
      {
        key: "startedAt",
        header: "Timestamp",
        render: (row) => (
          <span className="text-xs text-ink-muted">
            {row.startedAt ? new Date(row.startedAt).toLocaleString() : "—"}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/admin" }, { label: "Learning Sessions" }]} />

      <PageHeader
        title="Learning Sessions Log"
        subtitle="Live and historical student engagement sessions across AI tutor, quiz, and battle modes"
      />

      <FilterBar
        filters={filterSpecs}
        values={list.state.filters}
        onChange={list.setFilter}
        onClear={list.clearFilters}
        search={{
          placeholder: "Search by student name or session ID...",
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
          emptyState={{
            title: "No sessions recorded",
            text: "No student engagement sessions match the current filter selection.",
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

"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Layers } from "lucide-react";
import { PageHeader } from "@/components/admin/shell/PageHeader";
import { Breadcrumbs } from "@/components/admin/shell/Breadcrumbs";
import { DataTable, type Column } from "@/components/admin/data/DataTable";
import { FilterBar } from "@/components/admin/data/FilterBar";
import { Pagination } from "@/components/admin/data/Pagination";
import { StatusBadge } from "@/components/admin/display/StatusBadge";
import { useList, type FilterSpec } from "@/components/admin/data/useList";

interface CurriculumRow {
  id: string;
  code: string;
  name: string;
  grade: number;
  description?: string;
  status: string;
  updatedAt: string;
}

const filterSpecs: FilterSpec[] = [
  {
    key: "grade",
    label: "Class",
    type: "select",
    options: [
      { value: "6", label: "Class 6" },
      { value: "7", label: "Class 7" },
      { value: "8", label: "Class 8" },
      { value: "9", label: "Class 9" },
      { value: "10", label: "Class 10" },
      { value: "11", label: "Class 11" },
      { value: "12", label: "Class 12" },
    ],
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "active", label: "Active" },
      { value: "draft", label: "Draft" },
      { value: "archived", label: "Archived" },
    ],
  },
];

export default function CurriculumListPage() {
  const list = useList<CurriculumRow>({
    endpoint: "/api/admin/academics/curriculum",
  });

  const columns: Column<CurriculumRow>[] = useMemo(
    () => [
      {
        key: "code",
        header: "Curriculum Code",
        render: (row) => (
          <span className="font-mono text-xs font-semibold text-primary">
            {row.code}
          </span>
        ),
      },
      {
        key: "name",
        header: "Curriculum Title",
        render: (row) => (
          <div>
            <div className="font-medium text-foreground">{row.name}</div>
            {row.description && (
              <div className="text-xs text-muted-foreground line-clamp-1">{row.description}</div>
            )}
          </div>
        ),
      },
      {
        key: "grade",
        header: "Grade / Class",
        render: (row) => <span>Class {row.grade}</span>,
      },
      {
        key: "status",
        header: "Status",
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: "updatedAt",
        header: "Last Revised",
        render: (row) => (
          <span className="text-xs text-muted-foreground">
            {new Date(row.updatedAt).toLocaleDateString()}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "Curriculum Versions" },
        ]}
      />

      <PageHeader
        title="NCTB Curriculum Taxonomy"
        subtitle="National Curriculum and Textbook Board version taxonomy, chapters mapping, and learning objectives"
        actions={
          <Link
            href="/admin/courses"
            className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-4 py-2 text-xs font-bold text-ink shadow-soft hover:bg-slate-50 transition-colors"
          >
            <Layers size={15} />
            <span>View Courses</span>
          </Link>
        }
      />

      <FilterBar
        filters={filterSpecs}
        values={list.state.filters}
        onChange={list.setFilter}
        onClear={list.clearFilters}
        search={{
          placeholder: "Search curriculum by code or title...",
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
            title: "No curriculum versions found",
            text: "Curriculum standards are aligned with NCTB 2026 textbooks.",
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

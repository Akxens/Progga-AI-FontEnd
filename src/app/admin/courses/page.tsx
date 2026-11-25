"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Edit3, Eye, Archive, CheckCircle } from "lucide-react";
import { PageHeader } from "@/components/admin/shell/PageHeader";
import { Breadcrumbs } from "@/components/admin/shell/Breadcrumbs";
import { DataTable, type Column, type Action } from "@/components/admin/data/DataTable";
import { FilterBar } from "@/components/admin/data/FilterBar";
import { Pagination } from "@/components/admin/data/Pagination";
import { StatusBadge } from "@/components/admin/display/StatusBadge";
import { useList, type FilterSpec } from "@/components/admin/data/useList";
import { adminApi } from "@/lib/admin/api";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";

interface CourseRow {
  id: string;
  code: string;
  title: string;
  titleBn?: string;
  grade: number;
  subject?: { id: string; name: string };
  chaptersCount?: number;
  lessonsCount?: number;
  version?: number;
  status: string;
  createdAt: string;
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
      { value: "11", label: "Class 11 (HSC)" },
      { value: "12", label: "Class 12 (HSC)" },
    ],
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "published", label: "Published" },
      { value: "draft", label: "Draft" },
      { value: "in_review", label: "In Review" },
      { value: "archived", label: "Archived" },
    ],
  },
];

export default function CoursesListPage() {
  const router = useRouter();
  const { toast } = useCelebrate();
  const list = useList<CourseRow>({
    endpoint: "/api/admin/academics/courses",
  });

  const handleArchive = async (id: string) => {
    if (!confirm("Are you sure you want to archive this course? Enrolled students will still keep their learning progress.")) return;
    try {
      await adminApi(`/api/admin/academics/courses/${id}/archive`, { method: "POST" });
      toast("Course archived", "✓", "mint");
      list.mutate();
    } catch (err: any) {
      toast(err.message || "Failed to archive course", "✕", "coral");
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await adminApi(`/api/admin/academics/courses/${id}/publish`, { method: "POST" });
      toast("Course published to catalog!", "🎉", "mint");
      list.mutate();
    } catch (err: any) {
      toast(err.message || "Failed to publish course", "✕", "coral");
    }
  };

  const columns: Column<CourseRow>[] = useMemo(
    () => [
      {
        key: "code",
        header: "Course ID",
        render: (row) => (
          <span className="font-mono text-xs font-semibold text-primary hover:underline">
            {row.code || `CRS-${row.id.slice(-6)}`}
          </span>
        ),
      },
      {
        key: "title",
        header: "Title",
        render: (row) => (
          <div>
            <div className="font-medium text-foreground">{row.title}</div>
            {row.titleBn && <div className="text-xs text-muted-foreground">{row.titleBn}</div>}
          </div>
        ),
      },
      {
        key: "grade",
        header: "Class",
        render: (row) => <span>Class {row.grade}</span>,
      },
      {
        key: "subject",
        header: "Subject",
        render: (row) => <span className="capitalize">{row.subject?.name || "General"}</span>,
      },
      {
        key: "structure",
        header: "Chapters / Lessons",
        render: (row) => (
          <span className="text-xs text-muted-foreground">
            {row.chaptersCount ?? 0} chapters · {row.lessonsCount ?? 0} lessons
          </span>
        ),
      },
      {
        key: "version",
        header: "Version",
        render: (row) => <span className="font-mono text-xs">v{row.version || 1}</span>,
      },
      {
        key: "status",
        header: "Status",
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: "createdAt",
        header: "Created",
        render: (row) => (
          <span className="text-xs text-muted-foreground">
            {new Date(row.createdAt).toLocaleDateString()}
          </span>
        ),
      },
    ],
    []
  );

  const rowActions = (row: CourseRow): Action[] => [
    {
      label: "Open Editor",
      icon: Eye,
      onClick: () => router.push(`/admin/courses/${row.id}`),
    },
    {
      label: "Edit Details",
      icon: Edit3,
      onClick: () => router.push(`/admin/courses/${row.id}/edit`),
    },
    {
      label: "Publish",
      icon: CheckCircle,
      disabled: row.status === "published",
      onClick: () => handlePublish(row.id),
    },
    {
      label: "Archive",
      icon: Archive,
      tone: "danger",
      disabled: row.status === "archived",
      onClick: () => handleArchive(row.id),
    },
  ];

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "Courses" },
        ]}
      />

      <PageHeader
        title="Courses & Syllabus"
        subtitle="Manage NCTB curriculum-aligned course trees, chapters, video lessons, and publishing states"
        actions={
          <Link
            href="/admin/courses/new"
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
          >
            <Plus size={15} />
            <span>New Course</span>
          </Link>
        }
      />

      <FilterBar
        filters={filterSpecs}
        values={list.state.filters}
        onChange={list.setFilter}
        onClear={list.clearFilters}
        search={{
          placeholder: "Search courses by title or code...",
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
          onRowClick={(row) => router.push(`/admin/courses/${row.id}`)}
          rowActions={rowActions}
          emptyState={{
            title: "No courses found",
            text: "Create a new course or adjust your filter query.",
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

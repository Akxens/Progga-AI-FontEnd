"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, Eye, Edit3, ShieldAlert, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/admin/shell/PageHeader";
import { Breadcrumbs } from "@/components/admin/shell/Breadcrumbs";
import { DataTable, type Column, type Action } from "@/components/admin/data/DataTable";
import { FilterBar } from "@/components/admin/data/FilterBar";
import { Pagination } from "@/components/admin/data/Pagination";
import { StatusBadge } from "@/components/admin/display/StatusBadge";
import { useList, type FilterSpec } from "@/components/admin/data/useList";
import { adminApi } from "@/lib/admin/api";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";

interface StudentRow {
  id: string;
  code: string;
  name: string;
  email?: string;
  phone?: string;
  grade?: string;
  schoolName?: string;
  guardianCount?: number;
  accountStatus: string;
  createdAt: string;
}

const filterSpecs: FilterSpec[] = [
  {
    key: "grade",
    label: "Grade",
    type: "select",
    options: [
      { value: "Class 6", label: "Class 6" },
      { value: "Class 7", label: "Class 7" },
      { value: "Class 8", label: "Class 8" },
      { value: "Class 9", label: "Class 9" },
      { value: "Class 10", label: "Class 10" },
      { value: "HSC 1st", label: "HSC 1st Year" },
      { value: "HSC 2nd", label: "HSC 2nd Year" },
    ],
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "active", label: "Active" },
      { value: "suspended", label: "Suspended" },
      { value: "closed", label: "Closed" },
    ],
  },
];

export default function StudentsListPage() {
  const router = useRouter();
  const { toast } = useCelebrate();
  const list = useList<StudentRow>({
    endpoint: "/api/admin/students",
    defaultSort: "-createdAt",
    defaultPageSize: 10,
    filters: filterSpecs,
  });

  const columns: Column<StudentRow>[] = useMemo(
    () => [
      {
        key: "code",
        header: "Code",
        render: (row) => (
          <Link
            href={`/admin/students/${row.id}`}
            className="font-mono text-xs font-bold text-brand-600 hover:underline"
          >
            {row.code || "—"}
          </Link>
        ),
      },
      {
        key: "name",
        header: "Student",
        render: (row) => (
          <div>
            <div className="font-semibold text-ink">{row.name}</div>
            <div className="text-[11px] text-ink-muted">{row.phone || row.email || "No contact"}</div>
          </div>
        ),
      },
      {
        key: "grade",
        header: "Grade / Class",
        render: (row) => <span className="font-medium text-ink-soft">{row.grade || "—"}</span>,
      },
      {
        key: "school",
        header: "School",
        render: (row) => <span className="text-ink-soft">{row.schoolName || "Independent"}</span>,
      },
      {
        key: "guardian",
        header: "Guardian",
        render: (row) => (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
              row.guardianCount && row.guardianCount > 0
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {row.guardianCount && row.guardianCount > 0 ? "Linked" : "Unlinked"}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (row) => <StatusBadge status={row.accountStatus} />,
      },
    ],
    []
  );

  const handleToggleSuspend = async (row: StudentRow) => {
    const isSuspended = row.accountStatus === "suspended";
    const action = isSuspended ? "reactivate" : "suspend";
    try {
      await adminApi(`/api/admin/students/${row.id}/${action}`, { method: "POST" });
      toast(`Student ${action}d successfully`, "✅", "mint");
      list.mutate();
    } catch (err: any) {
      toast(err.message || `Failed to ${action} student`, "⚠️", "coral");
    }
  };

  const rowActions = (row: StudentRow): Action[] => [
    {
      label: "View Profile",
      icon: Eye,
      onClick: () => router.push(`/admin/students/${row.id}`),
    },
    {
      label: "Edit Details",
      icon: Edit3,
      onClick: () => router.push(`/admin/students/${row.id}/edit`),
    },
    {
      label: row.accountStatus === "suspended" ? "Reactivate" : "Suspend Student",
      icon: row.accountStatus === "suspended" ? CheckCircle2 : ShieldAlert,
      tone: row.accountStatus === "suspended" ? "default" : "danger",
      onClick: () => handleToggleSuspend(row),
    },
  ];

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/admin" }, { label: "Students" }]} />

      <PageHeader
        title="Students Directory"
        subtitle="Manage enrolled students, academic affiliations, guardians and accounts"
        actions={
          <Link
            href="/admin/students/new"
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
          >
            <UserPlus size={15} />
            <span>Add Student</span>
          </Link>
        }
      />

      <FilterBar
        filters={filterSpecs}
        values={list.state.filters}
        onChange={list.setFilter}
        onClear={list.clearFilters}
        search={{
          placeholder: "Search by student name, code, phone or email...",
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
          onRowClick={(r) => router.push(`/admin/students/${r.id}`)}
          rowActions={rowActions}
          emptyState={{
            title: "No students found",
            text: "No student records match the active search and filter criteria.",
            action: (
              <Link
                href="/admin/students/new"
                className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:underline"
              >
                + Register first student
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

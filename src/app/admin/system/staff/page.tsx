"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, UserCheck, Shield } from "lucide-react";
import { PageHeader } from "@/components/admin/shell/PageHeader";
import { Breadcrumbs } from "@/components/admin/shell/Breadcrumbs";
import { DataTable, type Column } from "@/components/admin/data/DataTable";
import { Pagination } from "@/components/admin/data/Pagination";
import { StatusBadge } from "@/components/admin/display/StatusBadge";
import { useList } from "@/components/admin/data/useList";

interface StaffRow {
  id: string;
  name: string;
  email: string;
  role: string;
  accountStatus: string;
  mfaEnabled: boolean;
  department?: string;
  roleAssignments?: any[];
  createdAt: string;
}

export default function StaffDirectoryPage() {
  const router = useRouter();
  const list = useList<StaffRow>({
    endpoint: "/api/admin/system/users",
  });

  const columns: Column<StaffRow>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Staff Member",
        render: (row) => (
          <div>
            <div className="font-semibold text-foreground">{row.name}</div>
            <div className="text-xs text-muted-foreground">{row.email}</div>
          </div>
        ),
      },
      {
        key: "department",
        header: "Department",
        render: (row) => (
          <span className="text-xs text-foreground capitalize">
            {row.department || "Operations"}
          </span>
        ),
      },
      {
        key: "role",
        header: "Primary Role",
        render: (row) => (
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted font-medium">
            {row.role}
          </span>
        ),
      },
      {
        key: "mfa",
        header: "MFA Security",
        render: (row) => (
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              row.mfaEnabled
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {row.mfaEnabled ? "MFA Active" : "Pending Setup"}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (row) => <StatusBadge status={row.accountStatus} />,
      },
      {
        key: "createdAt",
        header: "Enrolled",
        render: (row) => (
          <span className="text-xs text-muted-foreground">
            {new Date(row.createdAt).toLocaleDateString()}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "System", href: "/admin/system/config" },
          { label: "Staff & Users" },
        ]}
      />

      <PageHeader
        title="Staff Profiles & Portal Access"
        subtitle="Manage Control Centre administrators, role assignments, department scopes, and MFA enforcement."
      />

      <DataTable
        columns={columns}
        rows={list.rows}
        rowKey={(row) => row.id}
        isLoading={list.isLoading}
        emptyState={{
          title: "No staff users found",
          text: "Authorized portal operators will appear in this directory.",
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

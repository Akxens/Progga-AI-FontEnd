"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Shield, KeyRound, Lock } from "lucide-react";
import { PageHeader } from "@/components/admin/shell/PageHeader";
import { Breadcrumbs } from "@/components/admin/shell/Breadcrumbs";
import { DataTable, type Column } from "@/components/admin/data/DataTable";
import { Pagination } from "@/components/admin/data/Pagination";
import { StatusBadge } from "@/components/admin/display/StatusBadge";
import { useList } from "@/components/admin/data/useList";

interface RoleRow {
  id: string;
  key: string;
  name: string;
  description: string;
  scopeType: string;
  isSystem: boolean;
  status: string;
  permissions: string[];
  createdAt: string;
}

export default function RolesDirectoryPage() {
  const list = useList<RoleRow>({
    endpoint: "/api/admin/system/roles",
  });

  const columns: Column<RoleRow>[] = useMemo(
    () => [
      {
        key: "key",
        header: "Role Key",
        render: (row) => (
          <span className="font-mono text-xs font-semibold text-primary">
            {row.key}
          </span>
        ),
      },
      {
        key: "name",
        header: "Role Name",
        render: (row) => (
          <div>
            <div className="font-semibold text-foreground">{row.name}</div>
            <div className="text-xs text-muted-foreground">{row.description}</div>
          </div>
        ),
      },
      {
        key: "scopeType",
        header: "Allowable Scope",
        render: (row) => (
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted">
            {row.scopeType}
          </span>
        ),
      },
      {
        key: "permissions",
        header: "Permissions Count",
        render: (row) => (
          <span className="text-xs font-medium text-foreground">
            {row.permissions?.length || 0} granular privileges
          </span>
        ),
      },
      {
        key: "system",
        header: "Type",
        render: (row) => (
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              row.isSystem ? "bg-slate-100 text-slate-700" : "bg-blue-50 text-blue-700"
            }`}
          >
            {row.isSystem ? "System Native" : "Custom Bundle"}
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

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "System", href: "/admin/system/config" },
          { label: "Roles & RBAC" },
        ]}
      />

      <PageHeader
        title="Roles & RBAC Permission Sets"
        subtitle="Inspect system role definitions, scope allowances (GLOBAL, LEGAL_ENTITY, SCHOOL, PROGRAMME), and permission bundles."
      />

      <DataTable
        columns={columns}
        rows={list.rows}
        rowKey={(row) => row.id}
        isLoading={list.isLoading}
        emptyState={{
          title: "No roles found",
          text: "System RBAC roles will appear here.",
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

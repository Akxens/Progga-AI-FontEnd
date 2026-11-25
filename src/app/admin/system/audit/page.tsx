"use client";

import { useMemo } from "react";
import Link from "next/link";
import { History, Shield, Lock, Activity } from "lucide-react";
import { PageHeader } from "@/components/admin/shell/PageHeader";
import { Breadcrumbs } from "@/components/admin/shell/Breadcrumbs";
import { DataTable, type Column } from "@/components/admin/data/DataTable";
import { Pagination } from "@/components/admin/data/Pagination";
import { useList } from "@/components/admin/data/useList";

interface AuditLogRow {
  id: string;
  actorUserId?: string;
  action: string;
  entityType: string;
  entityId: string;
  reason?: string;
  ip?: string;
  createdAt: string;
}

export default function AuditLogPage() {
  const list = useList<AuditLogRow>({
    endpoint: "/api/admin/system/audit",
  });

  const columns: Column<AuditLogRow>[] = useMemo(
    () => [
      {
        key: "action",
        header: "Action / Operation",
        render: (row) => (
          <div>
            <span className="font-semibold text-xs uppercase px-2 py-0.5 rounded bg-muted text-foreground">
              {row.action}
            </span>
          </div>
        ),
      },
      {
        key: "entity",
        header: "Target Entity",
        render: (row) => (
          <div>
            <span className="font-semibold text-xs text-foreground">{row.entityType}</span>
            <div className="font-mono text-xs text-muted-foreground">{row.entityId}</div>
          </div>
        ),
      },
      {
        key: "actor",
        header: "Actor (Staff User)",
        render: (row) => (
          <span className="font-mono text-xs text-foreground">
            {row.actorUserId || "System Daemon"}
          </span>
        ),
      },
      {
        key: "reason",
        header: "Audit Reason / Diff",
        render: (row) => (
          <span className="text-xs text-muted-foreground line-clamp-1">
            {row.reason || "Standard mutation"}
          </span>
        ),
      },
      {
        key: "ip",
        header: "IP Address",
        render: (row) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.ip || "—"}
          </span>
        ),
      },
      {
        key: "createdAt",
        header: "Timestamp",
        render: (row) => (
          <span className="text-xs text-muted-foreground">
            {new Date(row.createdAt).toLocaleString()}
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
          { label: "Audit Log" },
        ]}
      />

      <PageHeader
        title="Tamper-Evident Audit Stream"
        subtitle="Immutable append-only record of every state mutation, administrative override, and financial posting across all workspaces."
      />

      <DataTable
        columns={columns}
        rows={list.rows}
        rowKey={(row) => row.id}
        isLoading={list.isLoading}
        emptyState={{
          title: "No audit events recorded",
          text: "Administrative operations will append audit rows here in real time.",
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

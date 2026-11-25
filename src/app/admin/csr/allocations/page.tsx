"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ShieldCheck, Undo2, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/admin/shell/PageHeader";
import { Breadcrumbs } from "@/components/admin/shell/Breadcrumbs";
import { DataTable, type Column, type Action } from "@/components/admin/data/DataTable";
import { Pagination } from "@/components/admin/data/Pagination";
import { StatusBadge } from "@/components/admin/display/StatusBadge";
import { MoneyText } from "@/components/admin/display/FormattedText";
import { Modal } from "@/components/ui/Modal";
import { useList, type FilterSpec } from "@/components/admin/data/useList";
import { adminApi } from "@/lib/admin/api";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";

interface AllocationRow {
  id: string;
  code: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  programmeId: string;
  programmeName: string;
  programmeCode: string;
  coverageFrom: string;
  coverageTo: string;
  fundedRate: number;
  allocatedAmount: number;
  status: string;
  revokedAt?: string;
  revokedReason?: string;
  createdAt: string;
}

const filterSpecs: FilterSpec[] = [
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "active", label: "Active" },
      { value: "revoked", label: "Revoked" },
      { value: "expired", label: "Expired" },
    ],
  },
];

export default function AllocationsListPage() {
  const { toast } = useCelebrate();
  const list = useList<AllocationRow>({
    endpoint: "/api/admin/csr/allocations",
  });

  const [revokeModalItem, setRevokeModalItem] = useState<AllocationRow | null>(null);
  const [revokeReason, setRevokeReason] = useState("");

  const handleRevoke = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revokeModalItem) return;
    try {
      await adminApi(`/api/admin/csr/allocations/${revokeModalItem.id}/revoke`, {
        method: "POST",
        body: JSON.stringify({ reason: revokeReason.trim() }),
      });
      toast("Sponsorship revoked and access terms reverted!", "✓", "mint");
      setRevokeModalItem(null);
      setRevokeReason("");
      list.mutate();
    } catch (err: any) {
      toast(err.message || "Failed to revoke", "⚠️", "coral");
    }
  };

  const columns: Column<AllocationRow>[] = useMemo(
    () => [
      {
        key: "code",
        header: "Allocation ID",
        render: (row) => (
          <span className="font-mono text-xs font-semibold text-primary">
            {row.code}
          </span>
        ),
      },
      {
        key: "student",
        header: "Beneficiary",
        render: (row) => (
          <div>
            <div className="font-semibold text-foreground">{row.studentName}</div>
            <div className="text-xs font-mono text-muted-foreground">{row.studentCode}</div>
          </div>
        ),
      },
      {
        key: "programme",
        header: "Programme",
        render: (row) => (
          <div>
            <div className="text-xs font-medium text-foreground">{row.programmeName}</div>
            <span className="font-mono text-xs text-muted-foreground">{row.programmeCode}</span>
          </div>
        ),
      },
      {
        key: "dates",
        header: "Coverage Term",
        render: (row) => (
          <span className="text-xs text-muted-foreground">
            {new Date(row.coverageFrom).toLocaleDateString()} - {new Date(row.coverageTo).toLocaleDateString()}
          </span>
        ),
      },
      {
        key: "fundedRate",
        header: "Rate / Month",
        render: (row) => (
          <span className="text-xs">
            <MoneyText value={row.fundedRate} />
          </span>
        ),
      },
      {
        key: "allocatedAmount",
        header: "Allocated",
        render: (row) => (
          <span className="font-semibold">
            <MoneyText value={row.allocatedAmount} />
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

  const getRowActions = (row: AllocationRow): Action[] => {
    if (row.status !== "active") return [];
    return [
      {
        label: "Revoke Sponsorship",
        icon: Undo2,
        tone: "danger",
        onClick: () => {
          setRevokeModalItem(row);
          setRevokeReason("");
        },
      },
    ];
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "CSR & Foundation", href: "/admin/csr" },
          { label: "Allocations" },
        ]}
      />

      <PageHeader
        title="Sponsorship Coverage Allocations"
        subtitle="Active and completed subsidized seat allocations, prorated grant debits, and Entitlement status."
      />

      <DataTable
        columns={columns}
        rows={list.rows}
        rowKey={(row) => row.id}
        isLoading={list.isLoading}
        rowActions={getRowActions}
        emptyState={{
          title: "No allocations recorded",
          text: "Allocate sponsorship coverage from the Beneficiaries directory.",
        }}
      />

      <Pagination
        page={list.state.page}
        pageSize={list.state.pageSize}
        total={list.meta?.total || 0}
        onPage={list.setPage}
        onPageSize={list.setPageSize}
      />

      {/* Revoke Modal */}
      {revokeModalItem && (
        <Modal
          open={Boolean(revokeModalItem)}
          onClose={() => setRevokeModalItem(null)}
          title={`Revoke Coverage: ${revokeModalItem.code}`}
        >
          <form onSubmit={handleRevoke} className="space-y-4 pt-2">
            <p className="text-xs text-muted-foreground">
              Revoking coverage for <strong>{revokeModalItem.studentName}</strong> will immediately terminate the{" "}
              <code>PREMIUM_SPONSORED</code> tier and revert the student to standard Free quota.
            </p>

            <div>
              <label className="text-xs font-semibold block mb-1">Reason for Revocation</label>
              <textarea
                required
                rows={2}
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="e.g. Student transferred school out of programme catchment area..."
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setRevokeModalItem(null)}
                className="px-3 py-1.5 border rounded-lg text-xs font-medium hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700"
              >
                Confirm Revocation
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, CheckCircle2, ShieldCheck, UserCheck, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/admin/shell/PageHeader";
import { Breadcrumbs } from "@/components/admin/shell/Breadcrumbs";
import { DataTable, type Column, type Action } from "@/components/admin/data/DataTable";
import { FilterBar } from "@/components/admin/data/FilterBar";
import { Pagination } from "@/components/admin/data/Pagination";
import { StatusBadge } from "@/components/admin/display/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { useList, type FilterSpec } from "@/components/admin/data/useList";
import { adminApi } from "@/lib/admin/api";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";

interface BeneficiaryRow {
  id: string;
  programmeId: string;
  programmeName: string;
  programmeCode: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  grade: number;
  schoolName: string;
  district: string;
  eligibilityState: string;
  ineligibleReason?: string;
  verifiedAt?: string;
  status: string;
  activeSponsorship?: any;
  createdAt: string;
}

const filterSpecs: FilterSpec[] = [
  {
    key: "eligibilityState",
    label: "Eligibility",
    type: "select",
    options: [
      { value: "eligible", label: "Eligible" },
      { value: "ineligible", label: "Ineligible" },
      { value: "pending", label: "Pending Verification" },
    ],
  },
];

export default function BeneficiariesListPage() {
  const { toast } = useCelebrate();
  const list = useList<BeneficiaryRow>({
    endpoint: "/api/admin/csr/beneficiaries",
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<BeneficiaryRow | null>(null);

  const [addForm, setAddForm] = useState({ programmeId: "", studentId: "" });
  const [allocateForm, setAllocateForm] = useState({
    coverageFrom: new Date().toISOString().slice(0, 10),
    coverageTo: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  });

  const handleVerify = async (id: string) => {
    try {
      await adminApi(`/api/admin/csr/beneficiaries/${id}/verify`, { method: "POST" });
      toast("Student verified as eligible beneficiary!", "✓", "mint");
      list.mutate();
    } catch (err: any) {
      toast(err.message || "Failed to verify", "⚠️", "coral");
    }
  };

  const handleAddBeneficiary = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi("/api/admin/csr/beneficiaries", {
        method: "POST",
        body: JSON.stringify({
          programmeId: addForm.programmeId.trim(),
          studentId: addForm.studentId.trim(),
        }),
      });
      toast("Beneficiary enrolled in programme!", "🎉", "mint");
      setShowAddModal(false);
      setAddForm({ programmeId: "", studentId: "" });
      list.mutate();
    } catch (err: any) {
      toast(err.message || "Failed to enroll", "⚠️", "coral");
    }
  };

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBeneficiary) return;
    try {
      await adminApi("/api/admin/csr/allocations", {
        method: "POST",
        body: JSON.stringify({
          beneficiaryId: selectedBeneficiary.id,
          programmeId: selectedBeneficiary.programmeId,
          coverageFrom: allocateForm.coverageFrom,
          coverageTo: allocateForm.coverageTo,
        }),
      });
      toast("Sponsorship allocated and Pro entitlement activated!", "🎉", "mint");
      setShowAllocateModal(false);
      setSelectedBeneficiary(null);
      list.mutate();
    } catch (err: any) {
      toast(err.message || "Failed to allocate sponsorship", "⚠️", "coral");
    }
  };

  const columns: Column<BeneficiaryRow>[] = useMemo(
    () => [
      {
        key: "student",
        header: "Student",
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
        key: "demographics",
        header: "Grade & Location",
        render: (row) => (
          <div>
            <span className="text-xs font-medium text-foreground">Grade {row.grade}</span>
            <div className="text-xs text-muted-foreground">{row.schoolName} ({row.district})</div>
          </div>
        ),
      },
      {
        key: "eligibility",
        header: "Eligibility (BR-CSR-02)",
        render: (row) => (
          <div>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                row.eligibilityState === "eligible"
                  ? "bg-emerald-50 text-emerald-700"
                  : row.eligibilityState === "ineligible"
                  ? "bg-red-50 text-red-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {row.eligibilityState}
            </span>
            {row.ineligibleReason && (
              <div className="text-xs text-red-600 mt-0.5 capitalize">
                {row.ineligibleReason.replace(/_/g, " ")}
              </div>
            )}
          </div>
        ),
      },
      {
        key: "sponsorship",
        header: "Active Sponsorship",
        render: (row) => (
          <div>
            {row.activeSponsorship ? (
              <div>
                <span className="text-xs font-mono font-medium text-emerald-600">
                  {row.activeSponsorship.code}
                </span>
                <div className="text-xs text-muted-foreground">
                  Until {new Date(row.activeSponsorship.coverageTo).toLocaleDateString()}
                </div>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground italic">No active coverage</span>
            )}
          </div>
        ),
      },
    ],
    []
  );

  const getRowActions = (row: BeneficiaryRow): Action[] => {
    const actions: Action[] = [];

    if (row.eligibilityState !== "eligible") {
      actions.push({
        label: "Verify Eligible",
        icon: UserCheck,
        onClick: () => handleVerify(row.id),
      });
    }

    if (row.eligibilityState === "eligible" && !row.activeSponsorship) {
      actions.push({
        label: "Grant Sponsorship",
        icon: ShieldCheck,
        onClick: () => {
          setSelectedBeneficiary(row);
          setShowAllocateModal(true);
        },
      });
    }

    return actions;
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "CSR & Foundation", href: "/admin/csr" },
          { label: "Beneficiaries" },
        ]}
      />

      <PageHeader
        title="Programme Beneficiaries & Eligibility"
        subtitle="Manage sponsored student selection, automated eligibility checks (BR-CSR-02), and coverage allocation."
        actions={
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Enroll Student
          </button>
        }
      />

      <FilterBar
        filters={filterSpecs}
        values={list.state.filters}
        onChange={list.setFilter}
        onClear={list.clearFilters}
        search={{
          placeholder: "Search by student name, code, or phone...",
          value: list.state.search,
          onChange: list.setSearch,
        }}
      />

      <DataTable
        columns={columns}
        rows={list.rows}
        rowKey={(row) => row.id}
        isLoading={list.isLoading}
        rowActions={getRowActions}
        emptyState={{
          title: "No beneficiaries enrolled",
          text: "Enroll students into an active CSR programme to begin verification and subsidized access.",
        }}
      />

      <Pagination
        page={list.state.page}
        pageSize={list.state.pageSize}
        total={list.meta?.total || 0}
        onPage={list.setPage}
        onPageSize={list.setPageSize}
      />

      {/* Enroll Beneficiary Modal */}
      {showAddModal && (
        <Modal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Enroll Student as Programme Beneficiary"
        >
          <form onSubmit={handleAddBeneficiary} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold block mb-1">Programme ID</label>
              <input
                type="text"
                required
                value={addForm.programmeId}
                onChange={(e) => setAddForm({ ...addForm, programmeId: e.target.value })}
                placeholder="e.g. prg_cm3... or paste Programme ID"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1">Student User ID</label>
              <input
                type="text"
                required
                value={addForm.studentId}
                onChange={(e) => setAddForm({ ...addForm, studentId: e.target.value })}
                placeholder="e.g. user_cm3... or paste Student User ID"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Automated eligibility (grade, district, account status) will be evaluated immediately upon enrollment.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 border rounded-lg text-xs font-medium hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90"
              >
                Enroll & Check Eligibility
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Allocate Sponsorship Coverage Modal */}
      {showAllocateModal && selectedBeneficiary && (
        <Modal
          open={showAllocateModal}
          onClose={() => {
            setShowAllocateModal(false);
            setSelectedBeneficiary(null);
          }}
          title={`Allocate Sponsorship: ${selectedBeneficiary.studentName}`}
        >
          <form onSubmit={handleAllocate} className="space-y-4 pt-2">
            <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-1">
              <div>
                <strong>Student:</strong> {selectedBeneficiary.studentName} ({selectedBeneficiary.studentCode})
              </div>
              <div>
                <strong>Programme:</strong> {selectedBeneficiary.programmeName}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold block mb-1">Coverage Start Date</label>
                <input
                  type="date"
                  required
                  value={allocateForm.coverageFrom}
                  onChange={(e) => setAllocateForm({ ...allocateForm, coverageFrom: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Coverage End Date</label>
                <input
                  type="date"
                  required
                  value={allocateForm.coverageTo}
                  onChange={(e) => setAllocateForm({ ...allocateForm, coverageTo: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Allocation will calculate prorated funded cost against programme grant balance, activate{" "}
              <code>PREMIUM_SPONSORED</code> entitlement, and post double-entry Foundation general ledger journal lines.
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => {
                  setShowAllocateModal(false);
                  setSelectedBeneficiary(null);
                }}
                className="px-3 py-1.5 border rounded-lg text-xs font-medium hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90"
              >
                Confirm Allocation
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

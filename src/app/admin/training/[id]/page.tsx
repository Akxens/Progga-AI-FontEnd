"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Plus,
} from "lucide-react";
import { PageHeader } from "@/components/admin/shell/PageHeader";
import { Breadcrumbs } from "@/components/admin/shell/Breadcrumbs";
import { KeyValueGrid, type KeyValueItem } from "@/components/admin/display/KeyValueGrid";
import { DataTable, type Column } from "@/components/admin/data/DataTable";
import { StatusBadge } from "@/components/admin/display/StatusBadge";
import { PageLoader } from "@/components/ui/primitives";
import { adminApi } from "@/lib/admin/api";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";

export default function TrainingDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { toast } = useCelebrate();

  const [programme, setProgramme] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cohortModalOpen, setCohortModalOpen] = useState(false);
  const [submittingCohort, setSubmittingCohort] = useState(false);
  const [cohortForm, setCohortForm] = useState({
    name: "Cohort 1 - Batch Nov 2026",
    trainerName: "",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    location: "Online (Interactive Zoom / Live)",
    mode: "hybrid",
    capacity: 50,
  });

  const fetchProgramme = async () => {
    try {
      const res = await adminApi<any>(`/api/admin/training/programmes/${id}`);
      setProgramme(res?.data || res);
    } catch (err: any) {
      toast(err.message || "Failed to load programme", "⚠️", "coral");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProgramme();
  }, [id]);

  if (loading) return <PageLoader />;
  if (!programme) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-lg font-bold text-ink">Programme not found</h2>
        <Link href="/admin/training" className="mt-2 text-xs text-brand-600 hover:underline">
          Return to training catalogue
        </Link>
      </div>
    );
  }

  const handleCreateCohort = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingCohort(true);
    try {
      await adminApi(`/api/admin/training/programmes/${id}/cohorts`, {
        method: "POST",
        body: cohortForm,
      });
      toast("Training cohort added successfully", "✅", "mint");
      setCohortModalOpen(false);
      fetchProgramme();
    } catch (err: any) {
      toast(err.message || "Failed to add cohort", "⚠️", "coral");
    } finally {
      setSubmittingCohort(false);
    }
  };

  const overviewItems: KeyValueItem[] = [
    { label: "Programme Code", value: programme.code || "—" },
    { label: "Title", value: programme.title || "—" },
    { label: "Category", value: programme.category || "—" },
    { label: "Target Audience", value: programme.targetAudience || "Teachers" },
    { label: "Instructional Hours", value: `${programme.durationHours || 12} Hours` },
    { label: "Min Attendance Required", value: `${programme.minAttendancePct ?? 80}%` },
    { label: "Min Assessment Score", value: `${programme.minAssessmentScore ?? 70}%` },
    { label: "Programme Status", value: programme.status || "active" },
  ];

  const cohortColumns: Column<any>[] = [
    {
      key: "name",
      header: "Cohort Name",
      render: (c) => (
        <div>
          <div className="font-semibold text-ink">{c.name}</div>
          <div className="text-[11px] text-ink-muted">Trainer: {c.trainerName || "Faculty Instructor"}</div>
        </div>
      ),
    },
    {
      key: "dates",
      header: "Dates",
      render: (c) => (
        <span className="text-xs text-ink-soft">
          {new Date(c.startDate).toLocaleDateString()} — {new Date(c.endDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "mode",
      header: "Delivery Mode",
      render: (c) => (
        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-ink-soft capitalize">
          {c.mode || "hybrid"}
        </span>
      ),
    },
    {
      key: "capacity",
      header: "Capacity / Enrolled",
      render: (c) => (
        <span className="font-medium text-ink">
          {c.enrolments?.length ?? 0} / {c.capacity ?? 50}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (c) => <StatusBadge status={c.status || "active"} />,
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "Teacher Training", href: "/admin/training" },
          { label: programme.title || "Programme Detail" },
        ]}
      />

      <PageHeader
        title={programme.title}
        subtitle={`${programme.code} • ${programme.durationHours} Hours • ${programme.targetAudience || "Educators"}`}
        actions={
          <button
            onClick={() => setCohortModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-white shadow-soft hover:bg-brand-600 transition-colors"
          >
            <Plus size={15} />
            <span>Add Cohort</span>
          </button>
        }
      />

      <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
        <h3 className="mb-4 text-sm font-extrabold text-ink">Curriculum Specifications</h3>
        <KeyValueGrid items={overviewItems} columns={2} />
      </div>

      <div className="rounded-2xl border border-line bg-white shadow-soft overflow-hidden">
        <div className="border-b border-line px-6 py-4">
          <h3 className="text-sm font-extrabold text-ink">Training Cohorts</h3>
          <p className="text-xs text-ink-muted">Scheduled batches, trainer leads and participant capacity</p>
        </div>
        <DataTable
          columns={cohortColumns}
          rows={programme.cohorts || []}
          rowKey={(c) => c.id}
          emptyState={{
            title: "No cohorts scheduled",
            text: "No training cohorts have been scheduled for this programme yet.",
          }}
        />
      </div>

      {/* Add Cohort Modal */}
      {cohortModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-line animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-extrabold text-ink">Schedule New Training Cohort</h3>
            <p className="mt-1 text-xs text-ink-muted">
              Add a new batch for teacher enrolments and workshop delivery.
            </p>

            <form onSubmit={handleCreateCohort} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-ink">Cohort Batch Name *</label>
                <input
                  type="text"
                  required
                  value={cohortForm.name}
                  onChange={(e) => setCohortForm({ ...cohortForm, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-xs font-medium text-ink focus:border-brand-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink">Lead Trainer Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Kazi Shafiqul Islam"
                  value={cohortForm.trainerName}
                  onChange={(e) => setCohortForm({ ...cohortForm, trainerName: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-xs font-medium text-ink focus:border-brand-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-ink">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={cohortForm.startDate}
                    onChange={(e) => setCohortForm({ ...cohortForm, startDate: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-xs font-medium text-ink focus:border-brand-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink">End Date *</label>
                  <input
                    type="date"
                    required
                    value={cohortForm.endDate}
                    onChange={(e) => setCohortForm({ ...cohortForm, endDate: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-xs font-medium text-ink focus:border-brand-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-ink">Delivery Mode</label>
                  <select
                    value={cohortForm.mode}
                    onChange={(e) => setCohortForm({ ...cohortForm, mode: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-xs font-medium text-ink focus:border-brand-500 focus:outline-hidden"
                  >
                    <option value="online">Online (Zoom/Live)</option>
                    <option value="in_person">In-Person Campus</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink">Capacity</label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={cohortForm.capacity}
                    onChange={(e) => setCohortForm({ ...cohortForm, capacity: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-xs font-medium text-ink focus:border-brand-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCohortModalOpen(false)}
                  className="rounded-xl border border-line px-4 py-2 text-xs font-bold text-ink-soft hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCohort}
                  className="rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-white hover:bg-brand-600 disabled:opacity-50"
                >
                  {submittingCohort ? "Saving..." : "Create Cohort"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

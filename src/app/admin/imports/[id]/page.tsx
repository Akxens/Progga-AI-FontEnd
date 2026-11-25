"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "@/components/admin/shell/PageHeader";
import { Breadcrumbs } from "@/components/admin/shell/Breadcrumbs";
import { KeyValueGrid, type KeyValueItem } from "@/components/admin/display/KeyValueGrid";
import { StatCard } from "@/components/admin/display/StatCard";
import { StatusBadge } from "@/components/admin/display/StatusBadge";
import { DataTable, type Column } from "@/components/admin/data/DataTable";
import { PageLoader } from "@/components/ui/primitives";
import { adminApi } from "@/lib/admin/api";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";

export default function ImportDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { toast } = useCelebrate();

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(false);

  const fetchJob = async () => {
    try {
      const res = await adminApi<any>(`/api/admin/imports/${id}`);
      setJob(res?.data || res);
    } catch (err: any) {
      toast(err.message || "Failed to load import job", "⚠️", "coral");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchJob();
  }, [id]);

  if (loading) return <PageLoader />;
  if (!job) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-lg font-bold text-ink">Import job not found</h2>
        <Link href="/admin/imports" className="mt-2 text-xs text-brand-600 hover:underline">
          Return to imports directory
        </Link>
      </div>
    );
  }

  const handleApprove = async () => {
    setActionInProgress(true);
    try {
      await adminApi(`/api/admin/imports/${id}/approve`, { method: "POST" });
      toast("Import approved! Records successfully committed to database", "✅", "mint");
      fetchJob();
    } catch (err: any) {
      toast(err.message || "Failed to approve import", "⚠️", "coral");
    } finally {
      setActionInProgress(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    setActionInProgress(true);
    try {
      await adminApi(`/api/admin/imports/${id}/reject`, {
        method: "POST",
        body: { reason },
      });
      toast("Import job rejected", "✨", "banana");
      fetchJob();
    } catch (err: any) {
      toast(err.message || "Failed to reject import", "⚠️", "coral");
    } finally {
      setActionInProgress(false);
    }
  };

  const overviewItems: KeyValueItem[] = [
    { label: "Job Tracking Code", value: job.code || "—" },
    { label: "Dataset Entity Type", value: job.type || "STUDENT" },
    { label: "Original Filename", value: job.filename || "data.csv" },
    { label: "Uploaded By", value: job.uploadedBy?.name || "Staff Member" },
    { label: "Approval Status", value: job.status || "ready" },
    { label: "Approver", value: job.approvedBy?.name || (job.status === "approved" ? "Authorized Officer" : "Pending") },
    { label: "Created At", value: job.createdAt ? new Date(job.createdAt).toLocaleString() : "—" },
    { label: "Completed At", value: job.completedAt ? new Date(job.completedAt).toLocaleString() : "—" },
  ];

  const errorColumns: Column<any>[] = [
    {
      key: "row",
      header: "Row #",
      width: "80px",
      render: (e) => <span className="font-mono text-xs font-bold text-coral-600">#{e.rowNumber}</span>,
    },
    {
      key: "field",
      header: "Column / Field",
      width: "140px",
      render: (e) => <span className="font-mono text-xs text-ink-soft">{e.field || "general"}</span>,
    },
    {
      key: "message",
      header: "Validation Error",
      render: (e) => <span className="font-medium text-coral-700 text-xs">{e.message}</span>,
    },
    {
      key: "value",
      header: "Provided Value",
      render: (e) => <span className="font-mono text-[11px] text-ink-muted">{String(e.value ?? "empty")}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "CSV Imports", href: "/admin/imports" },
          { label: job.code || "Job Review" },
        ]}
      />

      <PageHeader
        title={`Import Job: ${job.code}`}
        subtitle={`${job.type} dataset from ${job.filename} • ${job.totalRows} rows parsed`}
        actions={<StatusBadge status={job.status || "ready"} />}
      />

      {/* Maker-Checker Approval Panel */}
      {job.status === "ready" && (
        <div className="rounded-2xl border-2 border-brand-500/30 bg-brand-50/40 p-6 shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-brand-600" />
                <h3 className="text-sm font-extrabold text-ink">Two-Person Maker-Checker Authorization Required</h3>
              </div>
              <p className="mt-1 text-xs text-ink-soft">
                This job has passed syntax and validation checks. An independent staff member must approve
                this job to atomically commit all {job.validRows} valid records into the database.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={handleReject}
                disabled={actionInProgress}
                className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2 text-xs font-bold text-coral-600 shadow-soft hover:bg-coral-50 disabled:opacity-50 transition-colors"
              >
                <XCircle size={15} />
                <span>Reject</span>
              </button>

              <button
                onClick={handleApprove}
                disabled={actionInProgress || job.validRows === 0}
                className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-white shadow-soft hover:bg-brand-600 disabled:opacity-50 transition-colors"
              >
                <CheckCircle2 size={15} />
                <span>{actionInProgress ? "Committing..." : `Approve & Ingest ${job.validRows} Records`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary StatCards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Parsed Rows" value={job.totalRows ?? 0} />
        <StatCard label="Valid Records" value={job.validRows ?? 0} />
        <StatCard label="Invalid Rows" value={job.invalidRows ?? 0} />
        <StatCard label="Committed to DB" value={job.processedRows ?? (job.status === "completed" ? job.validRows : 0)} />
      </div>

      <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
        <h3 className="mb-4 text-sm font-extrabold text-ink">Ingestion Job Metadata</h3>
        <KeyValueGrid items={overviewItems} columns={2} />
      </div>

      {/* Errors Table */}
      {(job.invalidRows > 0 || (job.errors && job.errors.length > 0)) && (
        <div className="rounded-2xl border border-coral-200 bg-white shadow-soft overflow-hidden">
          <div className="border-b border-coral-100 bg-coral-50/40 px-6 py-4">
            <h3 className="text-sm font-extrabold text-coral-900">Validation Failures & Row Errors</h3>
            <p className="text-xs text-coral-700">These rows will be skipped during ingestion or must be fixed</p>
          </div>
          <DataTable
            columns={errorColumns}
            rows={job.errors || []}
            rowKey={(e) => `${e.rowNumber}_${e.field}`}
            emptyState={{
              title: "No validation errors",
              text: "All rows in this CSV dataset passed validation.",
            }}
          />
        </div>
      )}
    </div>
  );
}

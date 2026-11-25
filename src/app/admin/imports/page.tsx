"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Upload, Eye } from "lucide-react";
import { PageHeader } from "@/components/admin/shell/PageHeader";
import { Breadcrumbs } from "@/components/admin/shell/Breadcrumbs";
import { DataTable, type Column, type Action } from "@/components/admin/data/DataTable";
import { FilterBar } from "@/components/admin/data/FilterBar";
import { Pagination } from "@/components/admin/data/Pagination";
import { StatusBadge } from "@/components/admin/display/StatusBadge";
import { useList, type FilterSpec } from "@/components/admin/data/useList";
import { adminApi } from "@/lib/admin/api";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";

interface ImportRow {
  id: string;
  code: string;
  type: string;
  filename: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  status: string;
  uploaderName?: string;
  createdAt: string;
}

const filterSpecs: FilterSpec[] = [
  {
    key: "type",
    label: "Import Type",
    type: "select",
    options: [
      { value: "STUDENT", label: "Students Roster" },
      { value: "TEACHER", label: "Teachers Roster" },
      { value: "SCHOOL", label: "Schools Directory" },
    ],
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "ready", label: "Ready for Approval" },
      { value: "completed", label: "Completed" },
      { value: "rejected", label: "Rejected" },
      { value: "failed", label: "Failed" },
    ],
  },
];

export default function ImportsListPage() {
  const router = useRouter();
  const { toast } = useCelebrate();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState<{
    type: "STUDENT" | "TEACHER" | "SCHOOL";
    file: File | null;
  }>({
    type: "STUDENT",
    file: null,
  });

  const list = useList<ImportRow>({
    endpoint: "/api/admin/imports",
    defaultSort: "-createdAt",
    defaultPageSize: 20,
    filters: filterSpecs,
  });

  const columns: Column<ImportRow>[] = useMemo(
    () => [
      {
        key: "code",
        header: "Job Code",
        render: (row) => (
          <Link
            href={`/admin/imports/${row.id}`}
            className="font-mono text-xs font-bold text-brand-600 hover:underline"
          >
            {row.code || "IMP-—"}
          </Link>
        ),
      },
      {
        key: "type",
        header: "Dataset Type",
        render: (row) => (
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-ink-soft">
            {row.type}
          </span>
        ),
      },
      {
        key: "file",
        header: "CSV File",
        render: (row) => (
          <div>
            <div className="font-semibold text-ink">{row.filename}</div>
            <div className="text-[11px] text-ink-muted">By {row.uploaderName || "Staff"}</div>
          </div>
        ),
      },
      {
        key: "counts",
        header: "Validation Summary",
        render: (row) => (
          <div className="text-xs">
            <span className="font-semibold text-ink">{row.totalRows} rows</span>
            <span className="ml-1 text-emerald-600 font-medium">({row.validRows} valid</span>
            {row.invalidRows > 0 && (
              <span className="ml-1 text-coral-600 font-medium">• {row.invalidRows} errors)</span>
            )}
            {row.invalidRows === 0 && <span className="text-emerald-600">)</span>}
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: "createdAt",
        header: "Uploaded",
        render: (row) => (
          <span className="text-xs text-ink-muted">
            {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—"}
          </span>
        ),
      },
    ],
    []
  );

  const rowActions = (row: ImportRow): Action[] => [
    {
      label: "Review Job Details",
      icon: Eye,
      onClick: () => router.push(`/admin/imports/${row.id}`),
    },
  ];

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.file) {
      toast("Please select a CSV file to upload", "⚠️", "coral");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("type", uploadForm.type);
      formData.append("file", uploadForm.file);

      const res = await adminApi<any>("/api/admin/imports", {
        method: "POST",
        form: formData,
      });

      toast("CSV uploaded and validated successfully", "✅", "mint");
      setUploadModalOpen(false);
      const jobId = res?.data?.id || res?.id;
      if (jobId) {
        router.push(`/admin/imports/${jobId}`);
      } else {
        list.mutate();
      }
    } catch (err: any) {
      toast(err.message || "Failed to upload CSV", "⚠️", "coral");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/admin" }, { label: "CSV Imports" }]} />

      <PageHeader
        title="Bulk Imports & Roster Ingestion"
        subtitle="Upload and validate bulk CSV datasets with two-person Maker-Checker authorization"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl border border-line bg-white p-1 text-xs shadow-soft">
              <span className="px-2 text-ink-muted">Templates:</span>
              <a
                href="/api/admin/imports/templates/students"
                className="rounded-lg px-2 py-1 font-semibold text-brand-600 hover:bg-slate-50"
              >
                Students
              </a>
              <a
                href="/api/admin/imports/templates/teachers"
                className="rounded-lg px-2 py-1 font-semibold text-brand-600 hover:bg-slate-50"
              >
                Teachers
              </a>
              <a
                href="/api/admin/imports/templates/schools"
                className="rounded-lg px-2 py-1 font-semibold text-brand-600 hover:bg-slate-50"
              >
                Schools
              </a>
            </div>

            <button
              onClick={() => setUploadModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-white shadow-soft hover:bg-brand-600 transition-colors"
            >
              <Upload size={15} />
              <span>Upload CSV</span>
            </button>
          </div>
        }
      />

      <FilterBar
        filters={filterSpecs}
        values={list.state.filters}
        onChange={list.setFilter}
        onClear={list.clearFilters}
        search={{
          placeholder: "Search imports by job code or filename...",
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
          onRowClick={(r) => router.push(`/admin/imports/${r.id}`)}
          rowActions={rowActions}
          emptyState={{
            title: "No import jobs found",
            text: "No CSV datasets have been uploaded or matched with the active filter.",
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

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-line animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-extrabold text-ink">Upload Bulk Data CSV</h3>
            <p className="mt-1 text-xs text-ink-muted">
              Select the data entity type and RFC-4180 formatted CSV file for validation.
            </p>

            <form onSubmit={handleUploadSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink">Entity Type *</label>
                <select
                  value={uploadForm.type}
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, type: e.target.value as any })
                  }
                  className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-xs font-medium text-ink focus:border-brand-500 focus:outline-hidden"
                >
                  <option value="STUDENT">Students Roster</option>
                  <option value="TEACHER">Teachers Directory</option>
                  <option value="SCHOOL">Partner Schools Registry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink">Select CSV File *</label>
                <input
                  type="file"
                  required
                  accept=".csv,text/csv"
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, file: e.target.files?.[0] || null })
                  }
                  className="mt-1 w-full rounded-xl border border-line bg-slate-50 px-3 py-2 text-xs font-medium text-ink file:mr-2 file:rounded-lg file:border-0 file:bg-brand-500 file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-white"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="rounded-xl border border-line px-4 py-2 text-xs font-bold text-ink-soft hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-white hover:bg-brand-600 disabled:opacity-50"
                >
                  {uploading ? "Validating CSV..." : "Upload & Validate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

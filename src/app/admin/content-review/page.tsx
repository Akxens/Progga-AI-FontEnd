"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, XCircle, Layers } from "lucide-react";
import { PageHeader } from "@/components/admin/shell/PageHeader";
import { Breadcrumbs } from "@/components/admin/shell/Breadcrumbs";
import { DataTable, type Column, type Action } from "@/components/admin/data/DataTable";
import { FilterBar } from "@/components/admin/data/FilterBar";
import { Pagination } from "@/components/admin/data/Pagination";
import { StatusBadge } from "@/components/admin/display/StatusBadge";
import { useList, type FilterSpec } from "@/components/admin/data/useList";
import { adminApi } from "@/lib/admin/api";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";

interface ReviewRow {
  id: string;
  targetType: "COURSE" | "LESSON";
  targetId: string;
  submittedById: string;
  status: string;
  reviewNotes?: string;
  createdAt: string;
}

const filterSpecs: FilterSpec[] = [
  {
    key: "status",
    label: "Review Status",
    type: "select",
    options: [
      { value: "pending", label: "Pending Review" },
      { value: "approved", label: "Approved" },
      { value: "rejected", label: "Rejected" },
      { value: "all", label: "All Items" },
    ],
  },
];

export default function ContentReviewQueuePage() {
  const { toast } = useCelebrate();
  const list = useList<ReviewRow>({
    endpoint: "/api/admin/academics/review",
  });

  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");

  const handleApprove = async (id: string) => {
    try {
      await adminApi(`/api/admin/academics/review/${id}/approve`, {
        method: "POST",
        body: { reviewNotes: "Approved by academic reviewer" },
      });
      toast("Content review approved! Live version updated.", "🎉", "mint");
      list.mutate();
    } catch (err: any) {
      toast(err.message || "Failed to approve review", "✕", "coral");
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingId) return;
    try {
      await adminApi(`/api/admin/academics/review/${rejectingId}/reject`, {
        method: "POST",
        body: { reviewNotes: rejectNotes.trim() },
      });
      toast("Content review returned with feedback.", "✓", "mint");
      setRejectingId(null);
      setRejectNotes("");
      list.mutate();
    } catch (err: any) {
      toast(err.message || "Failed to reject review", "✕", "coral");
    }
  };

  const columns: Column<ReviewRow>[] = useMemo(
    () => [
      {
        key: "targetType",
        header: "Content Type",
        render: (row) => (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-muted text-foreground uppercase tracking-wide">
            <Layers className="w-3.5 h-3.5 text-primary" />
            {row.targetType}
          </span>
        ),
      },
      {
        key: "targetId",
        header: "Target ID",
        render: (row) => (
          <span className="font-mono text-xs text-muted-foreground">{row.targetId}</span>
        ),
      },
      {
        key: "status",
        header: "Review Status",
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: "reviewNotes",
        header: "Review Notes",
        render: (row) => (
          <span className="text-xs text-muted-foreground line-clamp-1">
            {row.reviewNotes || "Awaiting editorial review"}
          </span>
        ),
      },
      {
        key: "createdAt",
        header: "Submitted At",
        render: (row) => (
          <span className="text-xs text-muted-foreground">
            {new Date(row.createdAt).toLocaleString()}
          </span>
        ),
      },
    ],
    []
  );

  const rowActions = (row: ReviewRow): Action[] => [
    {
      label: "Approve & Publish",
      icon: CheckCircle2,
      disabled: row.status !== "pending",
      onClick: () => handleApprove(row.id),
    },
    {
      label: "Reject / Feedback",
      icon: XCircle,
      tone: "danger",
      disabled: row.status !== "pending",
      onClick: () => {
        setRejectingId(row.id);
        setRejectNotes("");
      },
    },
  ];

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "Content Review Queue" },
        ]}
      />

      <PageHeader
        title="Content Review Queue"
        subtitle="Editorial verification queue for draft course revisions, video lessons, and curriculum changes"
      />

      <FilterBar
        filters={filterSpecs}
        values={list.state.filters}
        onChange={list.setFilter}
        onClear={list.clearFilters}
        search={{
          placeholder: "Search reviews...",
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
          rowActions={rowActions}
          emptyState={{
            title: "No items in review",
            text: "All academic content changes have been approved or processed.",
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

      {/* Reject Feedback Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Reject / Editorial Feedback</h3>
            <p className="text-sm text-muted-foreground">
              Provide actionable guidance explaining why this syllabus item cannot be published yet.
            </p>
            <form onSubmit={handleReject} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-foreground">Feedback Notes</label>
                <textarea
                  required
                  rows={4}
                  placeholder="e.g. Lesson 3 video link is broken, please replace with updated NCTB recording."
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-background"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingId(null)}
                  className="px-3 py-1.5 border rounded-lg text-sm hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

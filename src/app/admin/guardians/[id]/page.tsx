"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ShieldCheck,
  UserCheck,
  FileText,
  Mail,
  UserPlus,
  CheckCircle2,
  XCircle,
  FileCheck,
} from "lucide-react";
import { PageHeader } from "@/components/admin/shell/PageHeader";
import { Breadcrumbs } from "@/components/admin/shell/Breadcrumbs";
import { KeyValueGrid, type KeyValueItem } from "@/components/admin/display/KeyValueGrid";
import { DataTable, type Column } from "@/components/admin/data/DataTable";
import { PageLoader } from "@/components/ui/primitives";
import { adminApi } from "@/lib/admin/api";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";

export default function GuardianDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { toast } = useCelebrate();

  const [guardian, setGuardian] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paperModalOpen, setPaperModalOpen] = useState(false);
  const [submittingConsent, setSubmittingConsent] = useState(false);
  const [paperForm, setPaperForm] = useState({
    studentId: "",
    policyVersionId: "",
    documentRef: "",
    notes: "",
  });

  const fetchGuardian = async () => {
    try {
      const res = await adminApi<any>(`/api/admin/guardians/${id}`);
      setGuardian(res?.data || res);
    } catch (err: any) {
      toast(err.message || "Failed to load guardian", "⚠️", "coral");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchGuardian();
  }, [id]);

  if (loading) return <PageLoader />;
  if (!guardian) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-lg font-bold text-ink">Guardian not found</h2>
        <Link href="/admin/guardians" className="mt-2 text-xs text-brand-600 hover:underline">
          Return to directory
        </Link>
      </div>
    );
  }

  const handleVerifyLink = async (linkId: string, verify: boolean) => {
    try {
      await adminApi(`/api/admin/guardians/links/${linkId}/${verify ? "verify" : "revoke"}`, {
        method: "POST",
      });
      toast(verify ? "Student link verified" : "Student link revoked", "✅", "mint");
      fetchGuardian();
    } catch (err: any) {
      toast(err.message || "Failed to update link", "⚠️", "coral");
    }
  };

  const handleRecordPaperConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paperForm.studentId || !paperForm.documentRef) {
      toast("Student and Document Reference are required", "⚠️", "coral");
      return;
    }
    setSubmittingConsent(true);
    try {
      await adminApi("/api/admin/guardians/paper-consent", {
        method: "POST",
        body: {
          guardianId: id,
          studentId: paperForm.studentId,
          documentRef: paperForm.documentRef,
          notes: paperForm.notes,
        },
      });
      toast("Paper consent recorded successfully", "✅", "mint");
      setPaperModalOpen(false);
      fetchGuardian();
    } catch (err: any) {
      toast(err.message || "Failed to record paper consent", "⚠️", "coral");
    } finally {
      setSubmittingConsent(false);
    }
  };

  const overviewItems: KeyValueItem[] = [
    { label: "Full Name", value: guardian.name || "—" },
    { label: "Phone Number", value: guardian.phone || "—" },
    { label: "Email Address", value: guardian.email || "—" },
    { label: "Verification Status", value: guardian.verified ? "Verified via OTP" : "Pending OTP" },
    { label: "Account Status", value: guardian.accountStatus || "active" },
    { label: "Joined Date", value: guardian.createdAt ? new Date(guardian.createdAt).toLocaleDateString() : "—" },
  ];

  const studentColumns: Column<any>[] = [
    {
      key: "code",
      header: "Student Code",
      render: (link) => (
        <Link
          href={`/admin/students/${link.studentId}`}
          className="font-mono text-xs font-bold text-brand-600 hover:underline"
        >
          {link.student?.code || link.studentCode || "STU-—"}
        </Link>
      ),
    },
    {
      key: "name",
      header: "Child Name",
      render: (link) => <span className="font-semibold text-ink">{link.student?.name || link.studentName || "Student"}</span>,
    },
    {
      key: "relationship",
      header: "Relationship",
      render: (link) => <span className="text-xs text-ink-soft">{link.relationship || "Parent"}</span>,
    },
    {
      key: "verified",
      header: "Status",
      render: (link) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
            link.verified ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
          }`}
        >
          {link.verified ? "Verified Link" : "Pending Verification"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (link) => (
        <div className="flex items-center justify-end gap-2">
          {!link.verified ? (
            <button
              onClick={() => handleVerifyLink(link.id, true)}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
            >
              <CheckCircle2 size={13} />
              <span>Verify</span>
            </button>
          ) : (
            <button
              onClick={() => handleVerifyLink(link.id, false)}
              className="inline-flex items-center gap-1 rounded-lg bg-coral-50 px-2 py-1 text-xs font-semibold text-coral-700 hover:bg-coral-100"
            >
              <XCircle size={13} />
              <span>Revoke</span>
            </button>
          )}
        </div>
      ),
    },
  ];

  const consentColumns: Column<any>[] = [
    {
      key: "title",
      header: "Consent Policy",
      render: (c) => <span className="font-semibold text-ink">{c.policyTitle || "Children Online Safety & Data Consent"}</span>,
    },
    {
      key: "method",
      header: "Submission Method",
      render: (c) => (
        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-ink-soft capitalize">
          {c.method || "digital"}
        </span>
      ),
    },
    {
      key: "ref",
      header: "Physical Document Ref",
      render: (c) => <span className="font-mono text-xs text-ink-muted">{c.documentRef || "N/A (Digital e-sign)"}</span>,
    },
    {
      key: "date",
      header: "Consent Given",
      render: (c) => <span className="text-xs text-ink-muted">{c.createdAt ? new Date(c.createdAt).toLocaleString() : "—"}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "Guardians", href: "/admin/guardians" },
          { label: guardian.name || "Guardian Detail" },
        ]}
      />

      <PageHeader
        title={guardian.name}
        subtitle={`${guardian.phone || guardian.email || "No direct contact"} • ${guardian.verified ? "Verified Identity" : "Unverified"}`}
        actions={
          <button
            onClick={() => setPaperModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-white shadow-soft hover:bg-brand-600 transition-colors"
          >
            <FileCheck size={15} />
            <span>Record Paper Consent</span>
          </button>
        }
      />

      <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
        <h3 className="mb-4 text-sm font-extrabold text-ink">Guardian Profile Information</h3>
        <KeyValueGrid items={overviewItems} columns={2} />
      </div>

      <div className="rounded-2xl border border-line bg-white shadow-soft overflow-hidden">
        <div className="border-b border-line px-6 py-4">
          <h3 className="text-sm font-extrabold text-ink">Linked Students & Children</h3>
          <p className="text-xs text-ink-muted">Students associated with this parent account</p>
        </div>
        <DataTable
          columns={studentColumns}
          rows={guardian.guardianOf || []}
          rowKey={(l) => l.id}
          emptyState={{
            title: "No students linked",
            text: "This guardian has no verified or pending student links.",
          }}
        />
      </div>

      <div className="rounded-2xl border border-line bg-white shadow-soft overflow-hidden">
        <div className="border-b border-line px-6 py-4">
          <h3 className="text-sm font-extrabold text-ink">Parental Consent Records</h3>
          <p className="text-xs text-ink-muted">Statutory safety and data processing permissions</p>
        </div>
        <DataTable
          columns={consentColumns}
          rows={guardian.consents || []}
          rowKey={(c) => c.id || Math.random().toString()}
          emptyState={{
            title: "No consents recorded",
            text: "No paper or digital consent records currently registered for this guardian.",
          }}
        />
      </div>

      {/* Record Paper Consent Modal */}
      {paperModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-line animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-extrabold text-ink">Record Physical Paper Consent</h3>
            <p className="mt-1 text-xs text-ink-muted">
              Enter signed physical parental consent form details for archiving and audit trail.
            </p>

            <form onSubmit={handleRecordPaperConsent} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-ink">Select Linked Student *</label>
                <select
                  required
                  value={paperForm.studentId}
                  onChange={(e) => setPaperForm({ ...paperForm, studentId: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-xs font-medium text-ink focus:border-brand-500 focus:outline-hidden"
                >
                  <option value="">Select student...</option>
                  {(guardian.guardianOf || []).map((l: any) => (
                    <option key={l.studentId} value={l.studentId}>
                      {l.student?.name || l.studentName || l.studentId} ({l.student?.code || "STU"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink">Document Reference Code / Binder ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DOC-CONSENT-2026-084"
                  value={paperForm.documentRef}
                  onChange={(e) => setPaperForm({ ...paperForm, documentRef: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-xs font-medium text-ink focus:border-brand-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink">Archival Notes</label>
                <textarea
                  rows={2}
                  placeholder="Optional notes regarding physical verification..."
                  value={paperForm.notes}
                  onChange={(e) => setPaperForm({ ...paperForm, notes: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-xs font-medium text-ink focus:border-brand-500 focus:outline-hidden"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPaperModalOpen(false)}
                  className="rounded-xl border border-line px-4 py-2 text-xs font-bold text-ink-soft hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingConsent}
                  className="rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-white hover:bg-brand-600 disabled:opacity-50"
                >
                  {submittingConsent ? "Recording..." : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

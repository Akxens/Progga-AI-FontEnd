"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  User,
  Edit3,
  ShieldAlert,
  CheckCircle2,
  BookOpen,
  Clock,
  Award,
  Users,
  History,
} from "lucide-react";
import { PageHeader } from "@/components/admin/shell/PageHeader";
import { Breadcrumbs } from "@/components/admin/shell/Breadcrumbs";
import { Tabs } from "@/components/admin/display/Tabs";
import { StatCard } from "@/components/admin/display/StatCard";
import { KeyValueGrid, type KeyValueItem } from "@/components/admin/display/KeyValueGrid";
import { StatusBadge } from "@/components/admin/display/StatusBadge";
import { DataTable, type Column } from "@/components/admin/data/DataTable";
import { PageLoader } from "@/components/ui/primitives";
import { adminApi } from "@/lib/admin/api";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";

export default function StudentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { toast } = useCelebrate();

  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchStudent = async () => {
    try {
      const res = await adminApi<any>(`/api/admin/students/${id}`);
      setStudent(res?.data || res);
    } catch (err: any) {
      toast(err.message || "Failed to load student details", "⚠️", "coral");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchStudent();
  }, [id]);

  if (loading) return <PageLoader />;
  if (!student) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-lg font-bold text-ink">Student not found</h2>
        <Link href="/admin/students" className="mt-2 text-xs text-brand-600 hover:underline">
          Return to directory
        </Link>
      </div>
    );
  }

  const handleToggleSuspend = async () => {
    const isSuspended = student.accountStatus === "suspended";
    const action = isSuspended ? "reactivate" : "suspend";
    try {
      await adminApi(`/api/admin/students/${id}/${action}`, { method: "POST" });
      toast(`Student ${action}d successfully`, "✅", "mint");
      fetchStudent();
    } catch (err: any) {
      toast(err.message || `Failed to ${action} student`, "⚠️", "coral");
    }
  };

  const overviewItems: KeyValueItem[] = [
    { label: "Institutional Code", value: student.code || "—" },
    { label: "Full Name", value: student.name || "—" },
    { label: "Phone Number", value: student.phone || "—" },
    { label: "Email Address", value: student.email || "—" },
    { label: "Academic Grade", value: student.grade || "—" },
    { label: "Affiliated School", value: student.school?.name || "Independent Student" },
    { label: "Section / Roll", value: `${student.section || "A"} / ${student.rollNumber || "—"}` },
    { label: "Medium", value: student.medium || "Bangla" },
    { label: "Emergency Contact", value: student.emergencyContact || "—" },
    { label: "Guardian Link Code", value: student.linkCode || "—" },
    { label: "Registered On", value: student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "—" },
  ];

  const sessionColumns: Column<any>[] = [
    {
      key: "id",
      header: "Session ID",
      render: (s) => <span className="font-mono text-xs text-ink-muted">{s.id?.slice(0, 8)}...</span>,
    },
    {
      key: "mode",
      header: "Mode / Subject",
      render: (s) => (
        <div>
          <div className="font-semibold text-ink">{s.mode || "Interactive Tutor"}</div>
          <div className="text-[11px] text-ink-muted">{s.subject || "General"}</div>
        </div>
      ),
    },
    {
      key: "duration",
      header: "Duration",
      render: (s) => <span className="text-ink-soft">{s.durationSeconds ? `${Math.round(s.durationSeconds / 60)}m` : "—"}</span>,
    },
    {
      key: "questions",
      header: "Questions",
      render: (s) => <span className="font-medium text-ink">{s.questionsCount ?? 0}</span>,
    },
    {
      key: "startedAt",
      header: "Date & Time",
      render: (s) => <span className="text-xs text-ink-muted">{s.startedAt ? new Date(s.startedAt).toLocaleString() : "—"}</span>,
    },
  ];

  const guardianColumns: Column<any>[] = [
    {
      key: "name",
      header: "Guardian Name",
      render: (g) => <div className="font-semibold text-ink">{g.guardian?.name || "Parent"}</div>,
    },
    {
      key: "contact",
      header: "Contact",
      render: (g) => <div className="text-xs text-ink-muted">{g.guardian?.phone || g.guardian?.email || "—"}</div>,
    },
    {
      key: "relationship",
      header: "Relationship",
      render: (g) => <span className="text-xs font-medium text-ink-soft">{g.relationship || "Guardian"}</span>,
    },
    {
      key: "verified",
      header: "Status",
      render: (g) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
            g.verified ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
          }`}
        >
          {g.verified ? "Verified" : "Pending"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "Students", href: "/admin/students" },
          { label: student.name || "Student Profile" },
        ]}
      />

      <PageHeader
        title={student.name}
        subtitle={`${student.code || "STU-NEW"} • ${student.grade || "Unassigned"} • ${student.school?.name || "Independent"}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={student.accountStatus || "active"} />
            <Link
              href={`/admin/students/${id}/edit`}
              className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-1.5 text-xs font-bold text-ink shadow-soft hover:bg-slate-50 transition-colors"
            >
              <Edit3 size={14} />
              <span>Edit</span>
            </Link>
            <button
              onClick={handleToggleSuspend}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-white shadow-soft transition-colors ${
                student.accountStatus === "suspended"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-coral-600 hover:bg-coral-700"
              }`}
            >
              {student.accountStatus === "suspended" ? <CheckCircle2 size={14} /> : <ShieldAlert size={14} />}
              <span>{student.accountStatus === "suspended" ? "Reactivate" : "Suspend"}</span>
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Learning Sessions" value={student.stats?.sessionsCount ?? 0} />
        <StatCard
          label="Minutes Learned"
          value={Math.round((student.stats?.totalSeconds ?? 0) / 60)}
        />
        <StatCard label="Quizzes Completed" value={student.stats?.quizzesCount ?? 0} />
        <StatCard label="Linked Guardians" value={student.guardianCount ?? (student.guardedBy?.length ?? 0)} />
      </div>

      <Tabs
        active={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: "overview", label: "Overview" },
          { id: "sessions", label: "Sessions" },
          { id: "guardians", label: "Guardians" },
          { id: "learning", label: "Curriculum Progress" },
          { id: "history", label: "Audit Trail" },
        ]}
      />

      {activeTab === "overview" && (
        <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
          <h3 className="mb-4 text-sm font-extrabold text-ink">Institutional & Profile Details</h3>
          <KeyValueGrid items={overviewItems} columns={2} />
        </div>
      )}

      {activeTab === "sessions" && (
        <div className="rounded-2xl border border-line bg-white shadow-soft overflow-hidden">
          <DataTable
            columns={sessionColumns}
            rows={student.sessions || []}
            rowKey={(s) => s.id}
            emptyState={{
              title: "No sessions recorded",
              text: "This student has not participated in foreground tutor or learning sessions yet.",
            }}
          />
        </div>
      )}

      {activeTab === "guardians" && (
        <div className="rounded-2xl border border-line bg-white shadow-soft overflow-hidden">
          <DataTable
            columns={guardianColumns}
            rows={student.guardedBy || []}
            rowKey={(g) => g.id}
            emptyState={{
              title: "No guardians linked",
              text: "This student has no registered or linked parent accounts.",
            }}
          />
        </div>
      )}

      {activeTab === "learning" && (
        <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
          <h3 className="text-sm font-extrabold text-ink">Learning Curriculum & Mastery</h3>
          <p className="mt-1 text-xs text-ink-muted">
            Track mastery across curriculum chapters, completed problem sets and diagnostic quizzes.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-line bg-slate-50 p-4">
              <div className="text-xs font-semibold text-ink-soft">Current Grade Enrolment</div>
              <div className="mt-1 text-lg font-bold text-ink">{student.grade || "Standard NCTB Grade"}</div>
            </div>
            <div className="rounded-xl border border-line bg-slate-50 p-4">
              <div className="text-xs font-semibold text-ink-soft">Battle League & XP</div>
              <div className="mt-1 text-lg font-bold text-ink">{student.xp ?? 0} XP</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
          <h3 className="text-sm font-extrabold text-ink">Security & Account Audit Trail</h3>
          <p className="mt-1 text-xs text-ink-muted">Recent account status changes, consents, and logins.</p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between border-b border-line pb-2 text-xs">
              <span className="font-medium text-ink">Account Created</span>
              <span className="text-ink-muted">{student.createdAt ? new Date(student.createdAt).toLocaleString() : "—"}</span>
            </div>
            {student.updatedAt && (
              <div className="flex items-center justify-between border-b border-line pb-2 text-xs">
                <span className="font-medium text-ink">Last Updated</span>
                <span className="text-ink-muted">{new Date(student.updatedAt).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

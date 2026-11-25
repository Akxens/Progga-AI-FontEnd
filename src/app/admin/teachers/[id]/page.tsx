"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  User,
  Edit3,
  Award,
  Download,
} from "lucide-react";
import { PageHeader } from "@/components/admin/shell/PageHeader";
import { Breadcrumbs } from "@/components/admin/shell/Breadcrumbs";
import { Tabs } from "@/components/admin/display/Tabs";
import { KeyValueGrid, type KeyValueItem } from "@/components/admin/display/KeyValueGrid";
import { StatusBadge } from "@/components/admin/display/StatusBadge";
import { DataTable, type Column } from "@/components/admin/data/DataTable";
import { PageLoader } from "@/components/ui/primitives";
import { adminApi } from "@/lib/admin/api";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";

export default function TeacherDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { toast } = useCelebrate();

  const [teacher, setTeacher] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  const fetchTeacher = async () => {
    try {
      const res = await adminApi<any>(`/api/admin/teachers/${id}`);
      setTeacher(res?.data || res);
    } catch (err: any) {
      toast(err.message || "Failed to load teacher", "⚠️", "coral");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchTeacher();
  }, [id]);

  if (loading) return <PageLoader />;
  if (!teacher) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-lg font-bold text-ink">Teacher not found</h2>
        <Link href="/admin/teachers" className="mt-2 text-xs text-brand-600 hover:underline">
          Return to directory
        </Link>
      </div>
    );
  }

  const profileItems: KeyValueItem[] = [
    { label: "Staff ID", value: teacher.code || "—" },
    { label: "Full Name", value: teacher.name || "—" },
    { label: "Designation", value: teacher.designation || "Assistant Teacher" },
    { label: "Phone Number", value: teacher.phone || "—" },
    { label: "Email Address", value: teacher.email || "—" },
    { label: "Affiliated School", value: teacher.school?.name || "Independent" },
    {
      label: "Assigned Subjects",
      value: Array.isArray(teacher.subjects) ? teacher.subjects.join(", ") : teacher.subjects || "—",
    },
    { label: "Qualifications", value: teacher.qualifications || "—" },
    { label: "Account Status", value: teacher.accountStatus || "active" },
    { label: "Registered On", value: teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString() : "—" },
  ];

  const trainingColumns: Column<any>[] = [
    {
      key: "programme",
      header: "Programme / Cohort",
      render: (e) => (
        <div>
          <div className="font-semibold text-ink">{e.cohort?.programme?.title || "Teacher Training"}</div>
          <div className="text-[11px] text-ink-muted">{e.cohort?.name || "General Cohort"}</div>
        </div>
      ),
    },
    {
      key: "attendance",
      header: "Attendance",
      render: (e) => <span className="font-medium text-ink">{e.attendancePct ?? 0}%</span>,
    },
    {
      key: "score",
      header: "Assessment",
      render: (e) => <span className="font-medium text-ink">{e.assessmentScore != null ? `${e.assessmentScore}%` : "Pending"}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (e) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${
            e.status === "completed"
              ? "bg-emerald-50 text-emerald-700"
              : e.status === "in_progress"
              ? "bg-brand-50 text-brand-700"
              : "bg-slate-100 text-ink-muted"
          }`}
        >
          {e.status}
        </span>
      ),
    },
    {
      key: "certificate",
      header: "Certificate",
      align: "right",
      render: (e) => {
        if (!e.certificateCode) return <span className="text-xs text-ink-muted">—</span>;
        return (
          <a
            href={`/api/admin/training/enrolments/${e.id}/certificate`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:underline"
          >
            <Download size={13} />
            <span>{e.certificateCode}</span>
          </a>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "Teachers", href: "/admin/teachers" },
          { label: teacher.name || "Teacher Profile" },
        ]}
      />

      <PageHeader
        title={teacher.name}
        subtitle={`${teacher.code || "TCH-NEW"} • ${teacher.designation || "Educator"} • ${teacher.school?.name || "Independent"}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={teacher.accountStatus || "active"} />
            <Link
              href={`/admin/teachers/${id}/edit`}
              className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-1.5 text-xs font-bold text-ink shadow-soft hover:bg-slate-50 transition-colors"
            >
              <Edit3 size={14} />
              <span>Edit</span>
            </Link>
          </div>
        }
      />

      <Tabs
        active={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: "profile", label: "Profile & Affiliation" },
          { id: "training", label: "Training & Certifications" },
        ]}
      />

      {activeTab === "profile" && (
        <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
          <h3 className="mb-4 text-sm font-extrabold text-ink">Educator Credentials & Information</h3>
          <KeyValueGrid items={profileItems} columns={2} />
        </div>
      )}

      {activeTab === "training" && (
        <div className="rounded-2xl border border-line bg-white shadow-soft overflow-hidden">
          <div className="border-b border-line px-6 py-4">
            <h3 className="text-sm font-extrabold text-ink">Professional Development Enrolments</h3>
            <p className="text-xs text-ink-muted">Teacher cohorts, completion metrics and issued CRT-* credentials</p>
          </div>
          <DataTable
            columns={trainingColumns}
            rows={teacher.trainingEnrolments || []}
            rowKey={(e) => e.id}
            emptyState={{
              title: "No training enrolments",
              text: "This teacher has not been enrolled into any training programme cohorts yet.",
            }}
          />
        </div>
      )}
    </div>
  );
}

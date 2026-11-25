"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Edit3,
  Users,
  GraduationCap,
  Calendar,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/admin/shell/PageHeader";
import { Breadcrumbs } from "@/components/admin/shell/Breadcrumbs";
import { KeyValueGrid, type KeyValueItem } from "@/components/admin/display/KeyValueGrid";
import { StatusBadge } from "@/components/admin/display/StatusBadge";
import { StatCard } from "@/components/admin/display/StatCard";
import { PageLoader } from "@/components/ui/primitives";
import { adminApi } from "@/lib/admin/api";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";

const ONBOARDING_STAGES = [
  { key: "lead", label: "Lead" },
  { key: "contact_established", label: "Contact" },
  { key: "mou_signed", label: "MoU Signed" },
  { key: "roster_uploaded", label: "Rosters" },
  { key: "teachers_trained", label: "Teachers Trained" },
  { key: "guardian_process_confirmed", label: "Guardian Consent" },
  { key: "orientation_completed", label: "Orientation" },
  { key: "fully_active", label: "Fully Active" },
];

export default function SchoolDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { toast } = useCelebrate();

  const [school, setSchool] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);

  const fetchSchool = async () => {
    try {
      const res = await adminApi<any>(`/api/admin/schools/${id}`);
      setSchool(res?.data || res);
    } catch (err: any) {
      toast(err.message || "Failed to load school details", "⚠️", "coral");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchSchool();
  }, [id]);

  if (loading) return <PageLoader />;
  if (!school) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-lg font-bold text-ink">School not found</h2>
        <Link href="/admin/schools" className="mt-2 text-xs text-brand-600 hover:underline">
          Return to directory
        </Link>
      </div>
    );
  }

  const currentStageIndex = Math.max(
    0,
    ONBOARDING_STAGES.findIndex((s) => s.key === (school.onboardingStage || "lead"))
  );
  const nextStage = ONBOARDING_STAGES[currentStageIndex + 1];

  const handleAdvanceStage = async () => {
    if (!nextStage) return;
    setAdvancing(true);
    try {
      await adminApi(`/api/admin/schools/${id}/stage`, {
        method: "POST",
        body: { targetStage: nextStage.key },
      });
      toast(`Advanced onboarding stage to ${nextStage.label}`, "✅", "mint");
      fetchSchool();
    } catch (err: any) {
      toast(err.message || "Failed to advance stage", "⚠️", "coral");
    } finally {
      setAdvancing(false);
    }
  };

  const overviewItems: KeyValueItem[] = [
    { label: "Institutional Code", value: school.code || "—" },
    { label: "Official EIIN", value: school.eiin || "—" },
    { label: "Full Name", value: school.name || "—" },
    { label: "Division & District", value: `${school.district || "—"}, ${school.division || "—"}` },
    { label: "Upazila / Thana", value: school.upazila || "—" },
    { label: "Address", value: school.address || "—" },
    { label: "Institution Type", value: school.type?.replace("_", " ") || "Government" },
    { label: "Contact Phone", value: school.contactPhone || "—" },
    { label: "Contact Email", value: school.contactEmail || "—" },
    { label: "Current Stage", value: ONBOARDING_STAGES[currentStageIndex]?.label || "Lead" },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "Schools", href: "/admin/schools" },
          { label: school.name || "School Detail" },
        ]}
      />

      <PageHeader
        title={school.name}
        subtitle={`${school.code || "SCH-NEW"} • EIIN: ${school.eiin || "Unassigned"} • ${school.district || ""}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={school.status || "active"} />
            <Link
              href={`/admin/schools/${id}/edit`}
              className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-1.5 text-xs font-bold text-ink shadow-soft hover:bg-slate-50 transition-colors"
            >
              <Edit3 size={14} />
              <span>Edit</span>
            </Link>
          </div>
        }
      />

      {/* 8-Stage Onboarding Stepper */}
      <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-ink">Institutional Onboarding Stepper (WF-ORG-01)</h3>
            <p className="text-xs text-ink-muted">
              Current milestone:{" "}
              <strong className="text-brand-600">{ONBOARDING_STAGES[currentStageIndex]?.label}</strong>
            </p>
          </div>
          {nextStage && (
            <button
              onClick={handleAdvanceStage}
              disabled={advancing}
              className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-3 py-1.5 text-xs font-bold text-white shadow-soft hover:bg-brand-600 disabled:opacity-50"
            >
              <span>Advance to {nextStage.label}</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
          {ONBOARDING_STAGES.map((s, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            return (
              <div
                key={s.key}
                className={`flex flex-col items-center justify-center rounded-xl p-2.5 text-center text-xs transition-colors ${
                  isCurrent
                    ? "border-2 border-brand-500 bg-brand-50/70 font-bold text-brand-700"
                    : isCompleted
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border border-line bg-slate-50 text-ink-muted opacity-60"
                }`}
              >
                <div className="text-[10px] font-semibold text-ink-muted">Step {idx + 1}</div>
                <div className="mt-0.5 truncate">{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Enrolled Students" value={school.studentCount ?? 0} />
        <StatCard label="Teaching Staff" value={school.teacherCount ?? 0} />
        <StatCard label="Campus AI Clubs" value={school.aiClubs?.length ?? 1} />
        <StatCard label="Activation Events" value={school.activationEvents?.length ?? 0} />
      </div>

      <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
        <h3 className="mb-4 text-sm font-extrabold text-ink">Campus Profile & Demographics</h3>
        <KeyValueGrid items={overviewItems} columns={2} />
      </div>
    </div>
  );
}

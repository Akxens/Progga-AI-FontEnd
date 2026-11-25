"use client";

import { useMemo } from "react";
import { Users, GraduationCap, DollarSign, Heart, Activity } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/admin/shell/PageHeader";
import { GlobalFilters } from "@/components/admin/data/GlobalFilters";
import { StatCard } from "@/components/admin/display/StatCard";
import { LineChart } from "@/components/admin/charts/LineChart";
import { Donut } from "@/components/admin/charts/Donut";
import { useAdminMe } from "@/lib/admin/useAdmin";

export default function AdminDashboardPage() {
  const { scopeLabel, me } = useAdminMe();

  // Demonstration trend data for the executive dashboard
  const userTrendSeries = useMemo(
    () => [
      {
        name: "Active Students",
        color: "#0284c7",
        points: [
          { x: "Mon", y: 1420 },
          { x: "Tue", y: 1680 },
          { x: "Wed", y: 1910 },
          { x: "Thu", y: 2150 },
          { x: "Fri", y: 1840 },
          { x: "Sat", y: 2320 },
          { x: "Sun", y: 2210 },
        ],
      },
      {
        name: "AI Sessions",
        color: "#10b981",
        points: [
          { x: "Mon", y: 2840 },
          { x: "Tue", y: 3210 },
          { x: "Wed", y: 3950 },
          { x: "Thu", y: 4420 },
          { x: "Fri", y: 3680 },
          { x: "Sat", y: 4890 },
          { x: "Sun", y: 4620 },
        ],
      },
    ],
    [],
  );

  const accessDistribution = useMemo(
    () => [
      { label: "Free Tier", value: 15220, color: "#94a3b8" },
      { label: "Premium Paid", value: 812, color: "#0284c7" },
      { label: "CSR Sponsored", value: 2400, color: "#10b981" },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Executive Dashboard"
        subtitle={`Operational and learning overview for ${scopeLabel || "All Workspaces"}`}
      />

      <GlobalFilters show={["dateRange", "academicYear", "grade", "school", "accessType"]} />

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Registered Students"
          value={18432}
          delta={0.064}
          hint="Total signups"
          href="/admin/students"
        />
        <StatCard
          label="Daily Active Users (DAU)"
          value={2210}
          delta={0.12}
          hint="Students active today"
          href="/admin/students/analytics"
        />
        <StatCard
          label="Premium Paid Students"
          value={812}
          delta={0.045}
          hint="Direct subscriptions"
          href="/admin/finance/subscriptions"
        />
        <StatCard
          label="CSR Sponsored Students"
          value={2400}
          delta={0.082}
          hint="Foundation programmes"
          href="/admin/csr/beneficiaries"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-extrabold text-ink">Weekly Learning Activity</h2>
          <LineChart series={userTrendSeries} height={240} />
        </div>

        <div>
          <h2 className="mb-3 text-sm font-extrabold text-ink">Student Access Breakdown</h2>
          <Donut data={accessDistribution} centerLabel="Students" size={170} />
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
        <h2 className="text-sm font-extrabold text-ink mb-4">Quick Modules</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/students"
            className="flex items-center gap-3 rounded-xl border border-line p-3 hover:border-brand-300 hover:bg-slate-50 transition-all group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
              <Users size={18} />
            </div>
            <div>
              <p className="font-extrabold text-xs text-ink">People & Students</p>
              <p className="text-[11px] text-ink-muted">Profiles, schools, guardians</p>
            </div>
          </Link>

          <Link
            href="/admin/courses"
            className="flex items-center gap-3 rounded-xl border border-line p-3 hover:border-brand-300 hover:bg-slate-50 transition-all group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint-50 text-mint-600 group-hover:bg-mint-600 group-hover:text-white transition-colors">
              <GraduationCap size={18} />
            </div>
            <div>
              <p className="font-extrabold text-xs text-ink">Academics</p>
              <p className="text-[11px] text-ink-muted">Courses, questions, exams</p>
            </div>
          </Link>

          <Link
            href="/admin/finance/subscriptions"
            className="flex items-center gap-3 rounded-xl border border-line p-3 hover:border-brand-300 hover:bg-slate-50 transition-all group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-banana-50 text-banana-700 group-hover:bg-banana-600 group-hover:text-white transition-colors">
              <DollarSign size={18} />
            </div>
            <div>
              <p className="font-extrabold text-xs text-ink">Finance</p>
              <p className="text-[11px] text-ink-muted">Plans, payments, ledgers</p>
            </div>
          </Link>

          <Link
            href="/admin/csr"
            className="flex items-center gap-3 rounded-xl border border-line p-3 hover:border-brand-300 hover:bg-slate-50 transition-all group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-coral-50 text-coral-600 group-hover:bg-coral-600 group-hover:text-white transition-colors">
              <Heart size={18} />
            </div>
            <div>
              <p className="font-extrabold text-xs text-ink">CSR Foundation</p>
              <p className="text-[11px] text-ink-muted">Grants, programmes, impact</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

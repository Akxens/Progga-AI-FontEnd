"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HandHeart, Users, Building2, DollarSign, Award, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/admin/shell/PageHeader";
import { Breadcrumbs } from "@/components/admin/shell/Breadcrumbs";
import { StatCard } from "@/components/admin/display/StatCard";
import { adminApi } from "@/lib/admin/api";

export default function CSROverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi<any>("/api/admin/csr/overview")
      .then((res) => setData(res?.data || res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "CSR & Foundation" }]} />

      <PageHeader
        title="Progga Foundation & CSR Overview"
        subtitle="Manage philanthropic donor partnerships, corporate CSR grant agreements, and subsidized student access."
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/csr/partners/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
            >
              Register Partner
            </Link>
            <Link
              href="/admin/csr/programmes/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-line bg-card text-xs font-semibold rounded-lg hover:bg-muted transition-colors shadow-sm"
            >
              New Programme
            </Link>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Grant Commitments"
          value={data?.totalCommitted || 0}
          format="bdt"
          hint="From all active agreements"
        />
        <StatCard
          label="Grant Funds Received"
          value={data?.totalReceived || 0}
          format="bdt"
          hint="Audited Foundation bank receipts"
        />
        <StatCard
          label="Committed to Student Access"
          value={data?.totalAllocated || 0}
          format="bdt"
          hint="Active sponsorship coverage"
        />
        <StatCard
          label="Active Sponsored Seats"
          value={data?.activeSponsoredStudents || 0}
          format="number"
          hint={`${data?.eligibleBeneficiariesCount || 0} eligible candidates`}
        />
      </div>

      {/* Quick Nav Navigation Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/csr/partners"
          className="border rounded-xl p-5 bg-card hover:border-primary/50 transition-colors group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 bg-primary/10 text-primary rounded-lg">
                <Building2 className="w-5 h-5" />
              </span>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h3 className="font-semibold text-base mb-1">CSR Partners</h3>
            <p className="text-xs text-muted-foreground">
              Corporate donors, NGOs, and grant agreements with reporting terms.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t text-xs font-semibold text-primary">
            {data?.partnersCount || 0} Partners Enrolled →
          </div>
        </Link>

        <Link
          href="/admin/csr/programmes"
          className="border rounded-xl p-5 bg-card hover:border-primary/50 transition-colors group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <Award className="w-5 h-5" />
              </span>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
            </div>
            <h3 className="font-semibold text-base mb-1">Impact Programmes</h3>
            <p className="text-xs text-muted-foreground">
              Authorized budget lines, seat quotas, milestones, and targeting.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t text-xs font-semibold text-emerald-600">
            {data?.activeProgrammesCount || 0} Active Programmes →
          </div>
        </Link>

        <Link
          href="/admin/csr/beneficiaries"
          className="border rounded-xl p-5 bg-card hover:border-primary/50 transition-colors group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Users className="w-5 h-5" />
              </span>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-600 transition-colors" />
            </div>
            <h3 className="font-semibold text-base mb-1">Beneficiaries & Allocations</h3>
            <p className="text-xs text-muted-foreground">
              Student roster verification, sponsorship proration, and Entitlement activation.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t text-xs font-semibold text-blue-600">
            {data?.totalBeneficiariesCount || 0} Beneficiaries Managed →
          </div>
        </Link>
      </div>

      {/* Additional Foundation Links */}
      <div className="flex items-center gap-3 pt-2">
        <Link
          href="/admin/csr/allocations"
          className="text-xs text-primary font-medium hover:underline"
        >
          View Active Sponsorship Allocations →
        </Link>
        <span className="text-muted-foreground">•</span>
        <Link
          href="/admin/csr/ledger"
          className="text-xs text-primary font-medium hover:underline"
        >
          Audited Foundation General Ledger →
        </Link>
      </div>
    </div>
  );
}

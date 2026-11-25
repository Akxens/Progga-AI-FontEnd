"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Award, DollarSign, Users, Calendar, ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/admin/shell/Breadcrumbs";
import { StatusBadge } from "@/components/admin/display/StatusBadge";
import { KeyValueGrid } from "@/components/admin/display/KeyValueGrid";
import { MoneyText } from "@/components/admin/display/FormattedText";
import { adminApi } from "@/lib/admin/api";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";

export default function ProgrammeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { toast } = useCelebrate();

  const [programme, setProgramme] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadProgramme = () => {
    setLoading(true);
    adminApi<any>(`/api/admin/csr/programmes/${id}`)
      .then((res) => setProgramme(res?.data || res))
      .catch((err) => toast(err.message || "Failed to load programme", "⚠️", "coral"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProgramme();
  }, [id]);

  const handleActivate = async () => {
    try {
      await adminApi(`/api/admin/csr/programmes/${id}/activate`, { method: "POST" });
      toast("Programme activated successfully!", "🎉", "mint");
      loadProgramme();
    } catch (err: any) {
      toast(err.message || "Failed to activate programme", "⚠️", "coral");
    }
  };

  if (loading || !programme) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-48 bg-muted rounded" />
        <div className="h-10 w-96 bg-muted rounded" />
        <div className="h-64 bg-card rounded-xl border p-6" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "CSR & Foundation", href: "/admin/csr" },
          { label: "Programmes", href: "/admin/csr/programmes" },
          { label: programme.name },
        ]}
      />

      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{programme.name}</h1>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted font-medium">
              {programme.code}
            </span>
            <StatusBadge status={programme.status} />
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Partner:{" "}
            <Link
              href={`/admin/csr/partners/${programme.partnerId}`}
              className="font-semibold text-primary hover:underline"
            >
              {programme.partner?.name}
            </Link>{" "}
            • Ref: <span className="font-mono text-foreground">{programme.agreementRef}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {programme.status === "draft" && (
            <button
              onClick={handleActivate}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Activate Programme
            </button>
          )}
          <Link
            href={`/admin/csr/programmes/${programme.id}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-line rounded-lg text-xs font-semibold hover:bg-muted transition-colors shadow-sm"
          >
            Edit Settings
          </Link>
        </div>
      </div>

      {/* Programme Specifications */}
      <div className="border rounded-xl p-6 bg-card space-y-4">
        <h2 className="text-base font-semibold">Programme Governance & Quota (BR-CSR-01)</h2>
        <KeyValueGrid
          items={[
            { label: "Programme ID Code", value: programme.code },
            { label: "Programme Name", value: programme.name },
            { label: "Sponsor Partner", value: programme.partner?.name },
            { label: "Grant Agreement Ref", value: programme.agreementRef },
            {
              label: "Authorized Budget",
              value: <MoneyText value={Number(programme.grantAmount)} />,
            },
            {
              label: "Funded Rate / Seat-Month",
              value: <MoneyText value={Number(programme.fundedRatePerSeatMonth)} />,
            },
            { label: "Student Seat Capacity", value: `${programme.seatCapacity} seats` },
            {
              label: "Currently Active Allocated",
              value: `${programme.activeSeatsCount || 0} seats (${Math.round(
                ((programme.activeSeatsCount || 0) / (programme.seatCapacity || 1)) * 100
              )}% utilized)`,
            },
            {
              label: "Allocated Amount",
              value: <MoneyText value={programme.allocatedAmount || 0} />,
            },
            {
              label: "Grant Receipts Deposited",
              value: <MoneyText value={programme.totalReceived || 0} />,
            },
            {
              label: "Timeline",
              value: `${new Date(programme.startDate).toLocaleDateString()} - ${new Date(
                programme.endDate
              ).toLocaleDateString()}`,
            },
            {
              label: "Target Grades",
              value: programme.eligibleGrades?.length > 0 ? programme.eligibleGrades.join(", ") : "All Grades",
            },
            {
              label: "Target Districts",
              value: programme.districts?.length > 0 ? programme.districts.join(", ") : "All Districts",
            },
            { label: "Eligibility Criteria", value: programme.eligibilityNotes || "Standard criteria" },
          ]}
        />
      </div>

      {/* Line Item Budget Breakdown */}
      <div className="border rounded-xl p-6 bg-card space-y-4">
        <h2 className="text-base font-semibold flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" />
          Line-Item Budget Breakdown (Audited)
        </h2>

        {(!programme.budgetLines || programme.budgetLines.length === 0) ? (
          <p className="text-sm text-muted-foreground italic py-4">No budget lines configured.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold border-b">
                <tr>
                  <th className="py-2.5 px-4">Expense Category</th>
                  <th className="py-2.5 px-4">Description</th>
                  <th className="py-2.5 px-4 text-right">Allocated Budget</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {programme.budgetLines.map((bl: any) => (
                  <tr key={bl.id} className="hover:bg-muted/20">
                    <td className="py-3 px-4 capitalize font-medium text-foreground">
                      {bl.category.replace(/_/g, " ")}
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {bl.description || "—"}
                    </td>
                    <td className="py-3 px-4 font-semibold text-right">
                      <MoneyText value={Number(bl.amount)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Direct links to beneficiaries & receipts */}
      <div className="flex items-center gap-3 pt-2">
        <Link
          href={`/admin/csr/beneficiaries?programmeId=${programme.id}`}
          className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
        >
          View Programme Beneficiaries ({programme._count?.beneficiaries || 0}) <ArrowRight className="w-3 h-3" />
        </Link>
        <span className="text-muted-foreground">•</span>
        <Link
          href={`/admin/csr/allocations?programmeId=${programme.id}`}
          className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
        >
          View Sponsorship Allocations ({programme.activeSeatsCount || 0}) <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

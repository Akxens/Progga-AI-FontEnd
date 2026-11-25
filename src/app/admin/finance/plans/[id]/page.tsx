"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit3, Plus, Archive, History } from "lucide-react";
import { Breadcrumbs } from "@/components/admin/shell/Breadcrumbs";
import { PageHeader } from "@/components/admin/shell/PageHeader";
import { StatusBadge } from "@/components/admin/display/StatusBadge";
import { KeyValueGrid } from "@/components/admin/display/KeyValueGrid";
import { MoneyText } from "@/components/admin/display/FormattedText";
import { adminApi } from "@/lib/admin/api";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";

export default function PlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useCelebrate();

  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [newPrice, setNewPrice] = useState("499");
  const [newInterval, setNewInterval] = useState("month");
  const [newTutorLimit, setNewTutorLimit] = useState("100");
  const [newVoiceMins, setNewVoiceMins] = useState("30");

  const loadPlan = () => {
    setLoading(true);
    adminApi<any>(`/api/admin/plans/${id}`)
      .then((res) => {
        const p = res?.data || res;
        setPlan(p);
      })
      .catch((err) => toast(err.message || "Failed to load plan", "✕", "coral"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPlan();
  }, [id]);

  const handleRetire = async () => {
    if (!confirm("Retire this plan? It will no longer be available for new subscriptions.")) return;
    try {
      await adminApi(`/api/admin/plans/${id}/retire`, { method: "POST" });
      toast("Plan archived", "✓", "mint");
      loadPlan();
    } catch (err: any) {
      toast(err.message || "Failed to retire plan", "✕", "coral");
    }
  };

  const handleCreateVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi(`/api/admin/plans/${id}/versions`, {
        method: "POST",
        body: {
          priceAmount: Number(newPrice),
          billingInterval: newInterval,
          quotas: {
            dailyTutorLimit: Number(newTutorLimit),
            voiceMinutesPerDay: Number(newVoiceMins),
            battleEnabled: true,
          },
          status: "active",
        },
      });
      toast("New plan version created!", "🎉", "mint");
      setIsVersionModalOpen(false);
      loadPlan();
    } catch (err: any) {
      toast(err.message || "Failed to create version", "✕", "coral");
    }
  };

  if (loading || !plan) {
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
          { label: "Dashboard", href: "/admin" },
          { label: "Plans", href: "/admin/finance/plans" },
          { label: plan.name },
        ]}
      />

      <PageHeader
        title={plan.name}
        subtitle={`${plan.accessType} · ${plan.code}`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/finance/plans/${id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold hover:bg-accent transition-colors"
            >
              <Edit3 size={14} />
              <span>Edit Plan</span>
            </Link>
            <button
              onClick={() => setIsVersionModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-700 rounded-lg text-xs font-bold hover:bg-brand-100 transition-colors"
            >
              <Plus size={14} />
              <span>New Version</span>
            </button>
            <button
              onClick={handleRetire}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-amber-300 bg-amber-50 text-amber-800 rounded-lg text-xs font-semibold hover:bg-amber-100 transition-colors"
            >
              <Archive size={14} />
              <span>Retire Plan</span>
            </button>
          </div>
        }
      />

      {/* Overview section */}
      <div className="border rounded-xl p-6 bg-card space-y-4">
        <h2 className="text-base font-semibold">Plan Specification</h2>
        <KeyValueGrid
          items={[
            { label: "Plan Code", value: plan.code },
            { label: "Plan Name", value: plan.name },
            { label: "Entitlement Type", value: plan.accessType },
            { label: "Status", value: <StatusBadge status={plan.status} /> },
            { label: "Description", value: plan.description || "—" },
            { label: "Created At", value: new Date(plan.createdAt).toLocaleString() },
            { label: "Last Updated", value: new Date(plan.updatedAt).toLocaleString() },
          ]}
        />
      </div>

      {/* Versions history table */}
      <div className="border rounded-xl p-6 bg-card space-y-4">
        <h2 className="text-base font-semibold flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          Version History & Pricing Rules
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold border-b">
              <tr>
                <th className="py-2.5 px-4">Version</th>
                <th className="py-2.5 px-4">Price</th>
                <th className="py-2.5 px-4">Billing Interval</th>
                <th className="py-2.5 px-4">Daily Tutor Limit</th>
                <th className="py-2.5 px-4">Voice Minutes</th>
                <th className="py-2.5 px-4">Active Subs</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Effective Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {plan.versions?.map((v: any) => (
                <tr key={v.id} className="hover:bg-muted/20">
                  <td className="py-3 px-4 font-mono font-medium">v{v.versionNumber}</td>
                  <td className="py-3 px-4 font-semibold">
                    <MoneyText value={Number(v.priceAmount)} />
                  </td>
                  <td className="py-3 px-4 capitalize">{v.billingInterval}</td>
                  <td className="py-3 px-4">{v.quotas?.dailyTutorLimit ?? 25} turns/day</td>
                  <td className="py-3 px-4">{v.quotas?.voiceMinutesPerDay ?? 0} min</td>
                  <td className="py-3 px-4 font-medium">{v.subscriptionsCount ?? 0}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={v.status} />
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">
                    {new Date(v.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Version Modal */}
      {isVersionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-semibold">Create New Plan Version</h3>
            <p className="text-xs text-muted-foreground">
              Existing active subscriptions will continue with their current terms.
            </p>
            <form onSubmit={handleCreateVersion} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-foreground">Price (BDT)</label>
                <input
                  type="number"
                  min="0"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  required
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-xs bg-background"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground">Billing Interval</label>
                <select
                  value={newInterval}
                  onChange={(e) => setNewInterval(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-xs bg-background"
                >
                  <option value="month">Monthly (30 days)</option>
                  <option value="year">Yearly (365 days)</option>
                  <option value="one_time">One-time Pass</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground">Daily Questions</label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    value={newTutorLimit}
                    onChange={(e) => setNewTutorLimit(e.target.value)}
                    required
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-xs bg-background"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">Voice Minutes/day</label>
                  <input
                    type="number"
                    min="0"
                    max="600"
                    value={newVoiceMins}
                    onChange={(e) => setNewVoiceMins(e.target.value)}
                    required
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-xs bg-background"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsVersionModalOpen(false)}
                  className="px-3 py-1.5 border rounded-lg text-xs hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-brand-500 text-white text-xs font-bold rounded-lg"
                >
                  Activate Version
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

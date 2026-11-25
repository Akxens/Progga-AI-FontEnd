"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, RefreshCw, XCircle, User, ShieldCheck } from "lucide-react";
import { Breadcrumbs } from "@/components/admin/shell/Breadcrumbs";
import { StatusBadge } from "@/components/admin/display/StatusBadge";
import { KeyValueGrid } from "@/components/admin/display/KeyValueGrid";
import { MoneyText } from "@/components/admin/display/FormattedText";
import { adminApi } from "@/lib/admin/api";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";

export default function SubscriptionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useCelebrate();

  const [sub, setSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadSub = () => {
    setLoading(true);
    adminApi<any>(`/api/admin/subscriptions/${id}`)
      .then((res) => {
        const s = res?.data || res;
        setSub(s);
      })
      .catch((err) => toast(err.message || "Failed to load subscription", "⚠️", "coral"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSub();
  }, [id]);

  const handleRenew = async () => {
    try {
      await adminApi(`/api/admin/subscriptions/${id}/renew`, { method: "POST" });
      toast("Subscription extended for next cycle!", "🎉", "mint");
      loadSub();
    } catch (err: any) {
      toast(err.message || "Failed to renew", "⚠️", "coral");
    }
  };

  if (loading || !sub) {
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
          { label: "Finance", href: "/admin/finance/subscriptions" },
          { label: "Subscriptions", href: "/admin/finance/subscriptions" },
          { label: sub.code },
        ]}
      />

      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{sub.code}</h1>
            <StatusBadge status={sub.status} />
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-medium capitalize">
              {sub.source.replace(/_/g, " ")}
            </span>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Student: <span className="font-semibold text-foreground">{sub.user?.name}</span> ({sub.user?.email || sub.user?.phone || sub.studentId})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRenew}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Renew Period
          </button>
        </div>
      </div>

      {/* Subscription Terms KeyValueGrid */}
      <div className="border rounded-xl p-6 bg-card space-y-4">
        <h2 className="text-base font-semibold">Subscription Terms & Snapshot</h2>
        <KeyValueGrid
          items={[
            { label: "Subscription Code", value: sub.code },
            { label: "Student Name", value: sub.user?.name },
            { label: "Student Email / Phone", value: sub.user?.email || sub.user?.phone || "—" },
            { label: "Plan Name", value: sub.planVersion?.plan?.name || "Standard Plan" },
            { label: "Version Number", value: `v${sub.planVersion?.versionNumber || 1}` },
            {
              label: "Contracted Price",
              value: <MoneyText value={sub.planVersion?.priceAmount || 0} />,
            },
            { label: "Billing Interval", value: sub.planVersion?.billingInterval || "month" },
            { label: "Source", value: sub.source },
            { label: "Current Period Start", value: new Date(sub.currentPeriodStart).toLocaleString() },
            { label: "Current Period End", value: new Date(sub.currentPeriodEnd).toLocaleString() },
            { label: "Cancels at Period End", value: sub.cancelAtPeriodEnd ? "Yes" : "No" },
            { label: "Auto Renew", value: sub.autoRenew ? "Enabled" : "Disabled" },
            { label: "Created At", value: new Date(sub.createdAt).toLocaleString() },
          ]}
        />
      </div>

      {/* Linked Payments Table */}
      <div className="border rounded-xl p-6 bg-card space-y-4">
        <h2 className="text-base font-semibold flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-primary" />
          Associated Payments & Transactions
        </h2>

        {(!sub.payments || sub.payments.length === 0) ? (
          <p className="text-sm text-muted-foreground italic py-4">
            No gateway transactions recorded for this subscription (grant or sponsored).
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold border-b">
                <tr>
                  <th className="py-2.5 px-4">Transaction Code</th>
                  <th className="py-2.5 px-4">Amount</th>
                  <th className="py-2.5 px-4">Provider</th>
                  <th className="py-2.5 px-4">Method</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sub.payments.map((p: any) => (
                  <tr key={p.id} className="hover:bg-muted/20">
                    <td className="py-3 px-4 font-mono font-medium">{p.code}</td>
                    <td className="py-3 px-4 font-semibold">
                      <MoneyText value={p.amount} />
                    </td>
                    <td className="py-3 px-4 uppercase text-xs">{p.provider}</td>
                    <td className="py-3 px-4 capitalize text-xs">{p.method || "—"}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {new Date(p.initiatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

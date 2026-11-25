"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, AlertTriangle, ShieldAlert, ArrowRight, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/admin/shell/PageHeader";
import { Breadcrumbs } from "@/components/admin/shell/Breadcrumbs";
import { StatusBadge } from "@/components/admin/display/StatusBadge";
import { adminApi } from "@/lib/admin/api";

export default function WorkQueuePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadQueue = () => {
    setLoading(true);
    adminApi<any>("/api/admin/work-queue")
      .then((res) => setData(res?.data || res))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadQueue();
  }, []);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Work Queue" }]} />

      <PageHeader
        title="Administrative Work Queue"
        subtitle="Aggregated pending maker-checker approvals, content moderation reviews, safety alerts, and settlement checks."
        actions={
          <button
            onClick={loadQueue}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-line rounded-lg text-xs font-semibold hover:bg-muted transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Queue
          </button>
        }
      />

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="border rounded-xl p-4 bg-card">
          <div className="text-xs text-muted-foreground font-medium">Pending Approvals</div>
          <div className="text-2xl font-bold mt-1 text-primary">{data?.counts?.approvals ?? 0}</div>
        </div>
        <div className="border rounded-xl p-4 bg-card">
          <div className="text-xs text-muted-foreground font-medium">Content Reviews</div>
          <div className="text-2xl font-bold mt-1 text-foreground">{data?.counts?.contentReviews ?? 0}</div>
        </div>
        <div className="border rounded-xl p-4 bg-card">
          <div className="text-xs text-muted-foreground font-medium">Safety Flags</div>
          <div className="text-2xl font-bold mt-1 text-amber-600">{data?.counts?.safetyAlerts ?? 0}</div>
        </div>
        <div className="border rounded-xl p-4 bg-card">
          <div className="text-xs text-muted-foreground font-medium">Payment Checks</div>
          <div className="text-2xl font-bold mt-1 text-blue-600">{data?.counts?.payments ?? 0}</div>
        </div>
      </div>

      {/* Unified Queue Items */}
      <div className="border rounded-xl bg-card overflow-hidden">
        <div className="p-4 border-b font-semibold text-sm flex items-center justify-between">
          <span>Active Queue Tasks ({data?.totalPending || 0})</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Loading work items...</div>
        ) : !data?.items || data.items.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h3 className="font-semibold text-base">All Queues Clear!</h3>
            <p className="text-xs text-muted-foreground">
              No pending approvals, moderation reviews, or flagged safety items require attention.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {data.items.map((item: any) => (
              <div
                key={item.id}
                className="p-4 hover:bg-muted/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium uppercase tracking-wide ${
                        item.priority === "urgent"
                          ? "bg-red-50 text-red-700"
                          : item.priority === "high"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {item.type.replace(/_/g, " ")}
                    </span>
                    <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                  <div className="text-xs text-muted-foreground/80 flex items-center gap-2">
                    <span>By: {item.requestedBy}</span>
                    <span>•</span>
                    <span>{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <Link
                  href={item.actionUrl}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-xs font-semibold self-start sm:self-center transition-colors shrink-0"
                >
                  Review Item <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

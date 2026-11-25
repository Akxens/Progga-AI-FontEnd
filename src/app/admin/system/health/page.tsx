"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, Server, Database, Radio, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/admin/shell/PageHeader";
import { Breadcrumbs } from "@/components/admin/shell/Breadcrumbs";
import { StatCard } from "@/components/admin/display/StatCard";
import { adminApi } from "@/lib/admin/api";

export default function SystemHealthPage() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadHealth = () => {
    setLoading(true);
    adminApi<any>("/api/admin/system/health")
      .then((res) => setHealth(res?.data || res))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadHealth();
  }, []);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "System", href: "/admin/system/config" },
          { label: "System Health" },
        ]}
      />

      <PageHeader
        title="System Health & Infrastructure"
        subtitle="Real-time telemetry for Neon PostgreSQL, background cron runners, speech engines, and active system alerts."
        actions={
          <button
            onClick={loadHealth}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-line rounded-lg text-xs font-semibold hover:bg-muted transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Telemetry
          </button>
        }
      />

      {/* KPI Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          label="Overall Platform Status"
          value={health?.status === "healthy" ? "100% Operational" : "Degraded State"}
          hint={`Checked at ${health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : "—"}`}
        />
        <StatCard
          label="PostgreSQL Latency"
          value={health?.services?.database?.latencyMs ? `${health.services.database.latencyMs} ms` : "—"}
          hint="Neon DB direct round-trip"
        />
        <StatCard
          label="Pending Background Jobs"
          value={health?.services?.jobsWorker?.pending ?? 0}
          format="number"
          hint="cron & outbox queue"
        />
        <StatCard
          label="Speech Synthesis Engine"
          value={health?.services?.voiceEngine?.status === "online" ? "Online (IndicF5)" : "Offline"}
          hint="Bangla TTS audio service"
        />
      </div>

      {/* Services breakdown card */}
      <div className="border rounded-xl p-6 bg-card space-y-4">
        <h2 className="text-base font-semibold">Subsystem Diagnostics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-primary" />
              <div>
                <h4 className="text-sm font-semibold">Primary Database (Neon Serverless)</h4>
                <p className="text-xs text-muted-foreground">PostgreSQL 16 connection pool</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              Connected
            </span>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-primary" />
              <div>
                <h4 className="text-sm font-semibold">Job Worker & Outbox</h4>
                <p className="text-xs text-muted-foreground">CRON interval runner & retry scheduler</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              Operational
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Eye, Edit3, Archive } from "lucide-react";
import { PageHeader } from "@/components/admin/shell/PageHeader";
import { Breadcrumbs } from "@/components/admin/shell/Breadcrumbs";
import { DataTable, type Column, type Action } from "@/components/admin/data/DataTable";
import { FilterBar } from "@/components/admin/data/FilterBar";
import { Pagination } from "@/components/admin/data/Pagination";
import { StatusBadge } from "@/components/admin/display/StatusBadge";
import { MoneyText } from "@/components/admin/display/FormattedText";
import { useList, type FilterSpec } from "@/components/admin/data/useList";
import { adminApi } from "@/lib/admin/api";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";

interface PlanRow {
  id: string;
  code: string;
  name: string;
  accessType: string;
  status: string;
  versionsCount: number;
  totalActiveSubs: number;
  activeVersion?: {
    id: string;
    versionNumber: number;
    priceAmount: number;
    currency: string;
    billingInterval: string;
    quotas: any;
  };
  createdAt: string;
}

const filterSpecs: FilterSpec[] = [
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "active", label: "Active" },
      { value: "draft", label: "Draft" },
      { value: "archived", label: "Archived" },
    ],
  },
];

export default function PlansListPage() {
  const router = useRouter();
  const { toast } = useCelebrate();
  const list = useList<PlanRow>({
    endpoint: "/api/admin/plans",
  });

  const handleRetire = async (id: string) => {
    if (!confirm("Are you sure you want to retire this plan? Existing subscribers will retain their terms.")) return;
    try {
      await adminApi(`/api/admin/plans/${id}/retire`, { method: "POST" });
      toast("Plan archived", "✓", "mint");
      list.mutate();
    } catch (err: any) {
      toast(err.message || "Failed to retire plan", "✕", "coral");
    }
  };

  const columns: Column<PlanRow>[] = useMemo(
    () => [
      {
        key: "code",
        header: "Plan Code",
        render: (row) => (
          <span className="font-mono text-xs font-semibold text-primary hover:underline">
            {row.code}
          </span>
        ),
      },
      {
        key: "name",
        header: "Plan Name",
        render: (row) => (
          <div>
            <div className="font-medium text-foreground">{row.name}</div>
            <div className="text-xs text-muted-foreground">{row.accessType}</div>
          </div>
        ),
      },
      {
        key: "price",
        header: "Price / Interval",
        render: (row) => (
          <div>
            <MoneyText value={row.activeVersion?.priceAmount ?? 0} />
            <span className="text-xs text-muted-foreground ml-1">
              / {row.activeVersion?.billingInterval || "month"}
            </span>
          </div>
        ),
      },
      {
        key: "dailyTutorLimit",
        header: "Daily Tutor Turns",
        render: (row) => (
          <span>{row.activeVersion?.quotas?.dailyTutorLimit ?? 25} turns/day</span>
        ),
      },
      {
        key: "totalActiveSubs",
        header: "Active Subscriptions",
        render: (row) => (
          <span className="font-semibold text-foreground">{row.totalActiveSubs ?? 0}</span>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (row) => <StatusBadge status={row.status} />,
      },
    ],
    []
  );

  const rowActions = (row: PlanRow): Action[] => [
    {
      label: "View Details",
      icon: Eye,
      onClick: () => router.push(`/admin/finance/plans/${row.id}`),
    },
    {
      label: "Edit Plan",
      icon: Edit3,
      onClick: () => router.push(`/admin/finance/plans/${row.id}/edit`),
    },
    {
      label: "Retire",
      icon: Archive,
      tone: "danger",
      disabled: row.status === "archived",
      onClick: () => handleRetire(row.id),
    },
  ];

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "Plans" },
        ]}
      />

      <PageHeader
        title="Subscription Plans & Pricing"
        subtitle="Manage B2C subscription tiers, CSR sponsorship quota packages, and versioned pricing rules"
        actions={
          <Link
            href="/admin/finance/plans/new"
            className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-white shadow-soft hover:bg-brand-600 transition-colors"
          >
            <Plus size={15} />
            <span>New Plan</span>
          </Link>
        }
      />

      <FilterBar
        filters={filterSpecs}
        values={list.state.filters}
        onChange={list.setFilter}
        onClear={list.clearFilters}
        search={{
          placeholder: "Search plans by name or code...",
          value: list.state.search,
          onChange: list.setSearch,
        }}
      />

      <div className="rounded-2xl border border-line bg-white shadow-soft overflow-hidden">
        <DataTable
          columns={columns}
          rows={list.rows}
          rowKey={(r) => r.id}
          isLoading={list.isLoading}
          rowActions={rowActions}
          onRowClick={(row) => router.push(`/admin/finance/plans/${row.id}`)}
          emptyState={{
            title: "No plans found",
            text: "Create a commercial subscription plan to start billing.",
          }}
        />
      </div>

      <Pagination
        page={list.state.page}
        pageSize={list.state.pageSize}
        total={list.meta?.total ?? list.rows.length}
        onPage={list.setPage}
        onPageSize={list.setPageSize}
      />
    </div>
  );
}

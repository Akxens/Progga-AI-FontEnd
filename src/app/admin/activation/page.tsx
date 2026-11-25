"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Eye } from "lucide-react";
import { PageHeader } from "@/components/admin/shell/PageHeader";
import { Breadcrumbs } from "@/components/admin/shell/Breadcrumbs";
import { Tabs } from "@/components/admin/display/Tabs";
import { DataTable, type Column, type Action } from "@/components/admin/data/DataTable";
import { FilterBar } from "@/components/admin/data/FilterBar";
import { Pagination } from "@/components/admin/data/Pagination";
import { StatusBadge } from "@/components/admin/display/StatusBadge";
import { useList } from "@/components/admin/data/useList";

interface EventRow {
  id: string;
  title: string;
  schoolName?: string;
  eventType: string;
  eventDate: string;
  venue?: string;
  targetStudentsCount: number;
  attendanceCount: number;
  status: string;
}

export default function CampusActivationPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("events");

  const list = useList<EventRow>({
    endpoint: "/api/admin/activation/events",
    defaultSort: "-eventDate",
    defaultPageSize: 20,
  });

  const eventColumns: Column<EventRow>[] = [
    {
      key: "title",
      header: "Event Title",
      render: (row) => (
        <div>
          <Link
            href={`/admin/activation/${row.id}`}
            className="font-semibold text-brand-600 hover:underline"
          >
            {row.title}
          </Link>
          <div className="text-[11px] text-ink-muted">{row.schoolName || "Partner Campus"}</div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Event Type",
      render: (row) => (
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-ink-soft">
          {row.eventType}
        </span>
      ),
    },
    {
      key: "date",
      header: "Event Date",
      render: (row) => (
        <span className="text-xs text-ink-soft">
          {row.eventDate ? new Date(row.eventDate).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      key: "venue",
      header: "Venue",
      render: (row) => <span className="text-xs text-ink-muted">{row.venue || "Campus Auditorium"}</span>,
    },
    {
      key: "attendance",
      header: "Attendees / Target",
      render: (row) => (
        <span className="font-semibold text-ink">
          {row.attendanceCount ?? 0} / {row.targetStudentsCount ?? 150}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status || "PLANNED"} />,
    },
  ];

  const rowActions = (row: EventRow): Action[] => [
    {
      label: "View Event & Attendance",
      icon: Eye,
      onClick: () => router.push(`/admin/activation/${row.id}`),
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/admin" }, { label: "Campus Activation" }]} />

      <PageHeader
        title="Campus Activation & AI Clubs"
        subtitle="Coordinate school workshops, STEM bootcamps, student AI club chapters, and campus leaders"
        actions={
          <Link
            href="/admin/activation/new"
            className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-white shadow-soft hover:bg-brand-600 transition-colors"
          >
            <Plus size={15} />
            <span>Schedule Event</span>
          </Link>
        }
      />

      <Tabs
        active={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: "events", label: "Activation Events" },
          { id: "clubs", label: "Campus AI Clubs" },
          { id: "leaders", label: "Campus Leaders" },
        ]}
      />

      {activeTab === "events" && (
        <div className="space-y-4">
          <FilterBar
            values={list.state.filters}
            onChange={list.setFilter}
            onClear={list.clearFilters}
            search={{
              placeholder: "Search activation events by title or campus...",
              value: list.state.search,
              onChange: list.setSearch,
            }}
          />

          <div className="rounded-2xl border border-line bg-white shadow-soft overflow-hidden">
            <DataTable
              columns={eventColumns}
              rows={list.rows}
              rowKey={(r) => r.id}
              isLoading={list.isLoading}
              onRowClick={(r) => router.push(`/admin/activation/${r.id}`)}
              rowActions={rowActions}
              emptyState={{
                title: "No activation events found",
                text: "No campus orientation or activation events scheduled.",
                action: (
                  <Link
                    href="/admin/activation/new"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:underline"
                  >
                    + Schedule first event
                  </Link>
                ),
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
      )}

      {activeTab === "clubs" && (
        <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
          <h3 className="text-sm font-extrabold text-ink">Institutional AI Club Chapters</h3>
          <p className="mt-1 text-xs text-ink-muted">
            Student-run AI and STEM clubs fostering peer tutoring, weekly coding jams, and hackathons.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-line bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-ink">Dhaka Govt High AI Club</span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">Active</span>
              </div>
              <div className="mt-2 text-xs text-ink-soft">President: Ayesha Siddiqua (Grade 10)</div>
              <div className="mt-1 text-xs text-ink-muted">45 active members • Established Oct 2026</div>
            </div>
            <div className="rounded-xl border border-line bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-ink">Barishal Model STEM Society</span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">Active</span>
              </div>
              <div className="mt-2 text-xs text-ink-soft">President: Tanvir Ahmed (Grade 9)</div>
              <div className="mt-1 text-xs text-ink-muted">38 active members • Established Nov 2026</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "leaders" && (
        <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
          <h3 className="text-sm font-extrabold text-ink">Campus Ambassador & AI Leads</h3>
          <p className="mt-1 text-xs text-ink-muted">
            Recognized student leaders facilitating peer signups and school-wide AI literacy events.
          </p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-line bg-slate-50 p-3 text-xs">
              <div>
                <span className="font-bold text-ink">Nusrat Anjum</span>
                <span className="ml-2 text-ink-muted">• Class 10, Chittagong Collegiate School</span>
              </div>
              <span className="font-semibold text-brand-600">82 Peer Referrals • Platinum Ambassador</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

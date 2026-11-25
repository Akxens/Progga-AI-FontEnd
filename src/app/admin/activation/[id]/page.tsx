"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  UserPlus,
} from "lucide-react";
import { PageHeader } from "@/components/admin/shell/PageHeader";
import { Breadcrumbs } from "@/components/admin/shell/Breadcrumbs";
import { KeyValueGrid, type KeyValueItem } from "@/components/admin/display/KeyValueGrid";
import { DataTable, type Column } from "@/components/admin/data/DataTable";
import { StatusBadge } from "@/components/admin/display/StatusBadge";
import { PageLoader } from "@/components/ui/primitives";
import { adminApi } from "@/lib/admin/api";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";

export default function ActivationEventDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { toast } = useCelebrate();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [attendModalOpen, setAttendModalOpen] = useState(false);
  const [submittingAttendance, setSubmittingAttendance] = useState(false);
  const [attendForm, setAttendForm] = useState({
    participantType: "STUDENT",
    name: "",
    phone: "",
    verified: true,
  });

  const fetchEvent = async () => {
    try {
      const res = await adminApi<any>(`/api/admin/activation/events/${id}`);
      setEvent(res?.data || res);
    } catch (err: any) {
      toast(err.message || "Failed to load activation event", "⚠️", "coral");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchEvent();
  }, [id]);

  if (loading) return <PageLoader />;
  if (!event) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-lg font-bold text-ink">Activation event not found</h2>
        <Link href="/admin/activation" className="mt-2 text-xs text-brand-600 hover:underline">
          Return to campus activation
        </Link>
      </div>
    );
  }

  const handleAddAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attendForm.name.trim()) {
      toast("Participant name is required", "⚠️", "coral");
      return;
    }

    setSubmittingAttendance(true);
    try {
      const res = await adminApi<any>(`/api/admin/activation/events/${id}/attendance`, {
        method: "POST",
        body: {
          items: [attendForm],
        },
      });
      const added = res?.data?.addedCount ?? 1;
      const duplicates = res?.data?.duplicateCount ?? 0;
      if (duplicates > 0) {
        toast(`${added} participant recorded, ${duplicates} duplicate ignored (BR-ACT-01)`, "✨", "banana");
      } else {
        toast("Attendance recorded successfully", "✅", "mint");
      }
      setAttendModalOpen(false);
      setAttendForm({ participantType: "STUDENT", name: "", phone: "", verified: true });
      fetchEvent();
    } catch (err: any) {
      toast(err.message || "Failed to record attendance", "⚠️", "coral");
    } finally {
      setSubmittingAttendance(false);
    }
  };

  const overviewItems: KeyValueItem[] = [
    { label: "Event Title", value: event.title || "—" },
    { label: "Partner School", value: event.school?.name || "Independent Campus" },
    { label: "Event Type", value: event.eventType || "WORKSHOP" },
    { label: "Event Date", value: event.eventDate ? new Date(event.eventDate).toLocaleDateString() : "—" },
    { label: "Campus Venue", value: event.venue || "Auditorium" },
    { label: "Capacity Target", value: `${event.targetStudentsCount || 150} Participants` },
    { label: "Actual Attendance", value: `${event.attendances?.length ?? 0} Recorded` },
    { label: "Event Status", value: event.status || "PLANNED" },
  ];

  const attendanceColumns: Column<any>[] = [
    {
      key: "name",
      header: "Participant Name",
      render: (a) => (
        <div>
          <div className="font-semibold text-ink">{a.name}</div>
          <div className="text-[11px] text-ink-muted">{a.phone || "No phone"}</div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Role / Type",
      render: (a) => (
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-ink-soft">
          {a.participantType}
        </span>
      ),
    },
    {
      key: "verified",
      header: "Status",
      render: (a) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
            a.verified ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
          }`}
        >
          {a.verified ? "Verified Present" : "Unverified"}
        </span>
      ),
    },
    {
      key: "time",
      header: "Checked In",
      render: (a) => <span className="text-xs text-ink-muted">{a.createdAt ? new Date(a.createdAt).toLocaleTimeString() : "—"}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "Campus Activation", href: "/admin/activation" },
          { label: event.title || "Event Detail" },
        ]}
      />

      <PageHeader
        title={event.title}
        subtitle={`${event.school?.name || "Campus"} • ${event.venue || "Auditorium"} • ${event.eventType}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={event.status || "PLANNED"} />
            <button
              onClick={() => setAttendModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-3 py-1.5 text-xs font-bold text-white shadow-soft hover:bg-brand-600 transition-colors"
            >
              <UserPlus size={14} />
              <span>Record Attendance</span>
            </button>
          </div>
        }
      />

      <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
        <h3 className="mb-4 text-sm font-extrabold text-ink">Activation Event Logistics</h3>
        <KeyValueGrid items={overviewItems} columns={2} />
      </div>

      <div className="rounded-2xl border border-line bg-white shadow-soft overflow-hidden">
        <div className="border-b border-line px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-ink">Attendee Verification Roster</h3>
            <p className="text-xs text-ink-muted">Enforces BR-ACT-01 check-in deduplication</p>
          </div>
          <span className="text-xs font-bold text-brand-600">
            {event.attendances?.length ?? 0} Checked In
          </span>
        </div>
        <DataTable
          columns={attendanceColumns}
          rows={event.attendances || []}
          rowKey={(a) => a.id || Math.random().toString()}
          emptyState={{
            title: "No attendance recorded",
            text: "No attendees have been checked in for this activation event yet.",
          }}
        />
      </div>

      {/* Add Attendance Modal */}
      {attendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-line animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-extrabold text-ink">Check-In Event Attendee</h3>
            <p className="mt-1 text-xs text-ink-muted">
              Record participant presence. Duplicates for the same user or phone are automatically deduplicated.
            </p>

            <form onSubmit={handleAddAttendance} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-ink">Participant Role *</label>
                <select
                  value={attendForm.participantType}
                  onChange={(e) => setAttendForm({ ...attendForm, participantType: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-xs font-medium text-ink focus:border-brand-500 focus:outline-hidden"
                >
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="GUARDIAN">Parent / Guardian</option>
                  <option value="GUEST">Institutional Guest</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tanvir Ahmed"
                  value={attendForm.name}
                  onChange={(e) => setAttendForm({ ...attendForm, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-xs font-medium text-ink focus:border-brand-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink">Phone Number</label>
                <input
                  type="text"
                  placeholder="01XXXXXXXXX"
                  value={attendForm.phone}
                  onChange={(e) => setAttendForm({ ...attendForm, phone: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-xs font-medium text-ink focus:border-brand-500 focus:outline-hidden"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAttendModalOpen(false)}
                  className="rounded-xl border border-line px-4 py-2 text-xs font-bold text-ink-soft hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAttendance}
                  className="rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-white hover:bg-brand-600 disabled:opacity-50"
                >
                  {submittingAttendance ? "Saving..." : "Record Check-In"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormPage } from "@/components/admin/form/FormPage";
import { FormSection } from "@/components/admin/form/FormSection";
import { Field } from "@/components/admin/form/Field";
import { TextField, SelectField, AsyncSelect, TextareaField, NumberField } from "@/components/admin/form/Inputs";
import { adminApi } from "@/lib/admin/api";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";

export interface ActivationEventFormProps {
  mode: "create" | "edit";
  id?: string;
}

export function ActivationEventForm({ mode, id }: ActivationEventFormProps) {
  const router = useRouter();
  const { toast } = useCelebrate();
  const [loading, setLoading] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    schoolId: "",
    eventType: "WORKSHOP",
    eventDate: new Date().toISOString().slice(0, 10),
    venue: "Main Auditorium",
    targetStudentsCount: 150,
    status: "PLANNED",
    notes: "",
  });

  useEffect(() => {
    if (mode === "edit" && id) {
      adminApi<any>(`/api/admin/activation/events/${id}`)
        .then((res) => {
          const e = res?.data || res;
          setFormData({
            title: e.title || "",
            schoolId: e.schoolId || "",
            eventType: e.eventType || "WORKSHOP",
            eventDate: e.eventDate ? new Date(e.eventDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
            venue: e.venue || "",
            targetStudentsCount: e.targetStudentsCount ?? 150,
            status: e.status || "PLANNED",
            notes: e.notes || "",
          });
        })
        .catch((err) => setError(err.message || "Failed to load activation event"))
        .finally(() => setLoading(false));
    }
  }, [mode, id]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast("Event title is required", "⚠️", "coral");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "create") {
        await adminApi("/api/admin/activation/events", {
          method: "POST",
          body: formData,
        });
        toast("Activation event scheduled successfully", "✅", "mint");
        router.push("/admin/activation");
      } else {
        await adminApi(`/api/admin/activation/events/${id}`, {
          method: "PATCH",
          body: formData,
        });
        toast("Activation event updated successfully", "✅", "mint");
        router.push(`/admin/activation/${id}`);
      }
    } catch (err: any) {
      toast(err.message || "Failed to save activation event", "⚠️", "coral");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormPage
        title={mode === "create" ? "Schedule Campus Activation Event" : "Edit Activation Event"}
        mode={mode}
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Campus Activation", href: "/admin/activation" },
          { label: mode === "create" ? "New" : "Edit" },
        ]}
        isLoading={loading}
        loadError={error}
        onCancel={() => router.back()}
        submitting={submitting}
        sections={
          <div className="space-y-6">
            <FormSection title="Event Logistics" description="Type of activation, partner campus and date">
              <Field label="Event Title" name="title" required>
                <TextField
                  name="title"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="e.g. Progga AI Literacy & STEM Day 2026"
                />
              </Field>

              <Field label="Partner School" name="schoolId">
                <AsyncSelect
                  lookup="schools"
                  value={formData.schoolId}
                  onChange={(val) => handleChange("schoolId", val)}
                  placeholder="Search and select host school..."
                />
              </Field>

              <Field label="Event Type" name="eventType">
                <SelectField
                  name="eventType"
                  value={formData.eventType}
                  onChange={(val) => handleChange("eventType", val)}
                  options={[
                    { value: "WORKSHOP", label: "AI Workshop" },
                    { value: "BOOTCAMP", label: "STEM Bootcamp" },
                    { value: "ORIENTATION", label: "Campus Orientation & AI Club Launch" },
                    { value: "COMPETITION", label: "Battle League Hackathon" },
                  ]}
                />
              </Field>

              <Field label="Date of Event" name="eventDate" required>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => handleChange("eventDate", e.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-xs font-medium text-ink focus:border-brand-500 focus:outline-hidden"
                />
              </Field>

              <Field label="Campus Venue / Auditorium" name="venue">
                <TextField
                  name="venue"
                  value={formData.venue}
                  onChange={(e) => handleChange("venue", e.target.value)}
                  placeholder="e.g. Main Auditorium / Physics Lab"
                />
              </Field>

              <Field label="Target Participant Capacity" name="targetStudentsCount">
                <NumberField
                  name="targetStudentsCount"
                  value={formData.targetStudentsCount}
                  onChange={(val) => handleChange("targetStudentsCount", Number(val))}
                  min={10}
                  max={2000}
                />
              </Field>

              <Field label="Status" name="status">
                <SelectField
                  name="status"
                  value={formData.status}
                  onChange={(val) => handleChange("status", val)}
                  options={[
                    { value: "PLANNED", label: "Planned" },
                    { value: "CONFIRMED", label: "Confirmed" },
                    { value: "COMPLETED", label: "Completed" },
                    { value: "CANCELLED", label: "Cancelled" },
                  ]}
                />
              </Field>

              <div className="col-span-full">
                <Field label="Operational Notes" name="notes">
                  <TextareaField
                    name="notes"
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    rows={2}
                    placeholder="Facilitator leads, equipment requirements, student cohorts..."
                  />
                </Field>
              </div>
            </FormSection>
          </div>
        }
      />
    </form>
  );
}

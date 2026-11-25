"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormPage } from "@/components/admin/form/FormPage";
import { FormSection } from "@/components/admin/form/FormSection";
import { Field } from "@/components/admin/form/Field";
import { TextField, SelectField, TextareaField } from "@/components/admin/form/Inputs";
import { adminApi } from "@/lib/admin/api";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";

export default function GrantAccessPage() {
  const router = useRouter();
  const { toast } = useCelebrate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    studentId: "",
    accessType: "PREMIUM_SPONSORED",
    source: "manual_admin",
    days: "30",
    reason: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await adminApi("/api/admin/entitlements/grants", {
        method: "POST",
        body: JSON.stringify({
          studentId: formData.studentId.trim(),
          accessType: formData.accessType,
          source: formData.source,
          days: Number(formData.days),
          reason: formData.reason.trim(),
        }),
      });

      toast("Authorized access granted and entitlement activated!", "🎉", "mint");
      router.push("/admin/finance/subscriptions");
    } catch (err: any) {
      setError(err.message || "Failed to grant access");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormPage
      title="Grant Authorized Access"
      mode="create"
      breadcrumbs={[
        { label: "Finance", href: "/admin/finance/subscriptions" },
        { label: "Subscriptions", href: "/admin/finance/subscriptions" },
        { label: "Grant Access" },
      ]}
      loadError={error}
      onCancel={() => router.push("/admin/finance/subscriptions")}
      onSubmit={handleSubmit}
      submitLabel="Grant Access"
      submitting={submitting}
      sections={
        <FormSection
          title="Student & Entitlement Tier"
          description="Select the recipient student account and grant access parameters"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field name="studentId" label="Student User ID" required>
              <TextField
                name="studentId"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                placeholder="e.g. user_cm3... or paste student ID"
              />
            </Field>

            <Field name="accessType" label="Access Level" required>
              <SelectField
                name="accessType"
                value={formData.accessType}
                onChange={(val) => setFormData({ ...formData, accessType: val })}
                options={[
                  { value: "PREMIUM_SPONSORED", label: "PREMIUM_SPONSORED (100 turns/day, 30 voice mins)" },
                  { value: "PREMIUM_PAID", label: "PREMIUM_PAID (Commercial Pro Privileges)" },
                ]}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Field name="source" label="Grant Source" required>
              <SelectField
                name="source"
                value={formData.source}
                onChange={(val) => setFormData({ ...formData, source: val })}
                options={[
                  { value: "manual_admin", label: "Administrative Grant / Compensation" },
                  { value: "csr_grant", label: "CSR Partner Programme" },
                  { value: "school_sponsored", label: "School Pilot Programme" },
                ]}
              />
            </Field>

            <Field name="days" label="Duration" required>
              <SelectField
                name="days"
                value={formData.days}
                onChange={(val) => setFormData({ ...formData, days: val })}
                options={[
                  { value: "30", label: "1 Month (30 Days)" },
                  { value: "60", label: "2 Months (60 Days)" },
                  { value: "90", label: "3 Months (90 Days)" },
                  { value: "180", label: "6 Months (180 Days)" },
                  { value: "365", label: "1 Year (365 Days)" },
                ]}
              />
            </Field>
          </div>

          <div className="mt-4">
            <Field name="reason" label="Justification / Audit Reason" required>
              <TextareaField
                name="reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="e.g. Approved goodwill grant for school STEM olympiad winner..."
                rows={3}
              />
            </Field>
          </div>
        </FormSection>
      }
    />
  );
}

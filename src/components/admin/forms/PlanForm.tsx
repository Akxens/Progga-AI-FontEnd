"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormPage } from "@/components/admin/form/FormPage";
import { FormSection } from "@/components/admin/form/FormSection";
import { Field } from "@/components/admin/form/Field";
import { TextField, SelectField, TextareaField } from "@/components/admin/form/Inputs";
import { adminApi } from "@/lib/admin/api";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";

export interface PlanFormProps {
  mode: "create" | "edit";
  id?: string;
}

export function PlanForm({ mode, id }: PlanFormProps) {
  const router = useRouter();
  const { toast } = useCelebrate();
  const [loading, setLoading] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    accessType: "PREMIUM_PAID",
    priceAmount: "499",
    billingInterval: "month",
    trialDays: "0",
    dailyTutorLimit: "100",
    voiceMinutesPerDay: "30",
    battleEnabled: true,
    status: "active",
  });

  useEffect(() => {
    if (mode === "edit" && id) {
      adminApi<any>(`/api/admin/plans/${id}`)
        .then((res) => {
          const p = res?.data || res;
          const v = p.versions?.[0] || {};
          const q = v.quotas || {};
          setFormData({
            name: p.name || "",
            description: p.description || "",
            accessType: p.accessType || "PREMIUM_PAID",
            priceAmount: String(v.priceAmount ?? 499),
            billingInterval: v.billingInterval || "month",
            trialDays: String(v.trialDays ?? 0),
            dailyTutorLimit: String(q.dailyTutorLimit ?? 100),
            voiceMinutesPerDay: String(q.voiceMinutesPerDay ?? 30),
            battleEnabled: q.battleEnabled !== false,
            status: p.status || "active",
          });
        })
        .catch((err) => setError(err.message || "Failed to load plan"))
        .finally(() => setLoading(false));
    }
  }, [mode, id]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast("Plan name is required", "⚠️", "coral");
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      accessType: formData.accessType,
      priceAmount: Number(formData.priceAmount),
      billingInterval: formData.billingInterval,
      trialDays: Number(formData.trialDays),
      quotas: {
        dailyTutorLimit: Number(formData.dailyTutorLimit),
        voiceMinutesPerDay: Number(formData.voiceMinutesPerDay),
        battleEnabled: formData.battleEnabled,
      },
      status: formData.status,
    };

    try {
      if (mode === "create") {
        const res = await adminApi<any>("/api/admin/plans", {
          method: "POST",
          body: payload,
        });
        const createdId = res?.data?.id || res?.id;
        toast("Plan created successfully!", "🎉", "mint");
        if (createdId) {
          router.push(`/admin/finance/plans/${createdId}`);
        } else {
          router.push("/admin/finance/plans");
        }
      } else {
        await adminApi(`/api/admin/plans/${id}`, {
          method: "PATCH",
          body: {
            name: formData.name.trim(),
            description: formData.description.trim(),
            status: formData.status,
          },
        });
        toast("Plan updated successfully!", "✓", "mint");
        router.push(`/admin/finance/plans/${id}`);
      }
    } catch (err: any) {
      toast(err.message || "Failed to save plan", "⚠️", "coral");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormPage
        title={mode === "create" ? "New Subscription Plan" : "Edit Plan"}
        mode={mode}
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Plans", href: "/admin/finance/plans" },
          { label: mode === "create" ? "New" : "Edit" },
        ]}
        isLoading={loading}
        loadError={error}
        onCancel={() => router.push("/admin/finance/plans")}
        submitting={submitting}
        submitLabel={mode === "create" ? "Create Plan" : "Save Changes"}
        sections={
          <div className="space-y-6">
            <FormSection title="Plan Details" description="Core tier naming and access entitlement category">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Plan Name" name="name" required>
                  <TextField
                    name="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g. Pro Monthly Standard"
                  />
                </Field>

                <Field label="Access Entitlement Type" name="accessType" required>
                  <SelectField
                    name="accessType"
                    value={formData.accessType}
                    onChange={(val) => handleChange("accessType", val)}
                    options={[
                      { value: "PREMIUM_PAID", label: "PREMIUM_PAID (Commercial B2C Subscription)" },
                      { value: "PREMIUM_SPONSORED", label: "PREMIUM_SPONSORED (CSR / School Sponsored)" },
                      { value: "FREE", label: "FREE (Standard Free Tier)" },
                    ]}
                    disabled={mode === "edit"}
                  />
                </Field>
              </div>

              <div className="mt-4">
                <Field label="Description" name="description">
                  <TextareaField
                    name="description"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Plan benefits, targeted student segment, and features..."
                    rows={2}
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection title="Pricing & Quota Limits" description="Version 1 pricing and student AI allowances">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Price (BDT)" name="priceAmount" required>
                  <TextField
                    name="priceAmount"
                    value={formData.priceAmount}
                    onChange={(e) => handleChange("priceAmount", e.target.value)}
                    disabled={mode === "edit" || formData.accessType === "FREE"}
                  />
                </Field>

                <Field label="Billing Interval" name="billingInterval" required>
                  <SelectField
                    name="billingInterval"
                    value={formData.billingInterval}
                    onChange={(val) => handleChange("billingInterval", val)}
                    options={[
                      { value: "month", label: "Monthly (30 days)" },
                      { value: "year", label: "Yearly (365 days)" },
                      { value: "one_time", label: "One-time Pass" },
                    ]}
                    disabled={mode === "edit"}
                  />
                </Field>

                <Field label="Trial Days" name="trialDays">
                  <TextField
                    name="trialDays"
                    value={formData.trialDays}
                    onChange={(e) => handleChange("trialDays", e.target.value)}
                    disabled={mode === "edit"}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Field label="Daily AI Tutor Questions" name="dailyTutorLimit" required>
                  <TextField
                    name="dailyTutorLimit"
                    value={formData.dailyTutorLimit}
                    onChange={(e) => handleChange("dailyTutorLimit", e.target.value)}
                    disabled={mode === "edit"}
                  />
                </Field>

                <Field label="Daily Voice Minutes" name="voiceMinutesPerDay">
                  <TextField
                    name="voiceMinutesPerDay"
                    value={formData.voiceMinutesPerDay}
                    onChange={(e) => handleChange("voiceMinutesPerDay", e.target.value)}
                    disabled={mode === "edit"}
                  />
                </Field>
              </div>

              <div className="mt-4">
                <Field label="Status" name="status">
                  <SelectField
                    name="status"
                    value={formData.status}
                    onChange={(val) => handleChange("status", val)}
                    options={[
                      { value: "active", label: "Active (Available for checkout)" },
                      { value: "draft", label: "Draft (Testing / not public)" },
                      { value: "archived", label: "Archived (Retired)" },
                    ]}
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

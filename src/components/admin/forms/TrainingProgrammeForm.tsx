"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormPage } from "@/components/admin/form/FormPage";
import { FormSection } from "@/components/admin/form/FormSection";
import { Field } from "@/components/admin/form/Field";
import { TextField, SelectField, TextareaField, NumberField } from "@/components/admin/form/Inputs";
import { adminApi } from "@/lib/admin/api";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";

export interface TrainingProgrammeFormProps {
  mode: "create" | "edit";
  id?: string;
}

export function TrainingProgrammeForm({ mode, id }: TrainingProgrammeFormProps) {
  const router = useRouter();
  const { toast } = useCelebrate();
  const [loading, setLoading] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
    category: "AI_PEDAGOGY",
    targetAudience: "Secondary STEM Teachers",
    durationHours: 12,
    minAttendancePct: 80,
    minAssessmentScore: 70,
    status: "active",
  });

  useEffect(() => {
    if (mode === "edit" && id) {
      adminApi<any>(`/api/admin/training/programmes/${id}`)
        .then((res) => {
          const p = res?.data || res;
          setFormData({
            code: p.code || "",
            title: p.title || "",
            description: p.description || "",
            category: p.category || "AI_PEDAGOGY",
            targetAudience: p.targetAudience || "",
            durationHours: p.durationHours ?? 12,
            minAttendancePct: p.minAttendancePct ?? 80,
            minAssessmentScore: p.minAssessmentScore ?? 70,
            status: p.status || "active",
          });
        })
        .catch((err) => setError(err.message || "Failed to load programme"))
        .finally(() => setLoading(false));
    }
  }, [mode, id]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast("Programme title is required", "⚠️", "coral");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "create") {
        await adminApi("/api/admin/training/programmes", {
          method: "POST",
          body: formData,
        });
        toast("Training programme created successfully", "✅", "mint");
        router.push("/admin/training");
      } else {
        await adminApi(`/api/admin/training/programmes/${id}`, {
          method: "PATCH",
          body: formData,
        });
        toast("Training programme updated successfully", "✅", "mint");
        router.push(`/admin/training/${id}`);
      }
    } catch (err: any) {
      toast(err.message || "Failed to save programme", "⚠️", "coral");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormPage
        title={mode === "create" ? "New Training Programme" : "Edit Training Programme"}
        mode={mode}
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Teacher Training", href: "/admin/training" },
          { label: mode === "create" ? "New" : "Edit" },
        ]}
        isLoading={loading}
        loadError={error}
        onCancel={() => router.back()}
        submitting={submitting}
        sections={
          <div className="space-y-6">
            <FormSection title="Programme Details" description="Curriculum title, category and target audience">
              <Field label="Programme Code" name="code" hint="Leave blank to generate TRN-YYYY-###">
                <TextField
                  name="code"
                  value={formData.code}
                  onChange={(e) => handleChange("code", e.target.value)}
                  placeholder="e.g. TRN-2026-AI01"
                />
              </Field>

              <Field label="Programme Title" name="title" required>
                <TextField
                  name="title"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="e.g. AI Pedagogical Integration for Secondary STEM"
                />
              </Field>

              <Field label="Category" name="category">
                <SelectField
                  name="category"
                  value={formData.category}
                  onChange={(val) => handleChange("category", val)}
                  options={[
                    { value: "AI_PEDAGOGY", label: "AI & Modern Pedagogy" },
                    { value: "STEM_CURRICULUM", label: "STEM Curriculum Mastery" },
                    { value: "ASSESSMENT", label: "Formative & Diagnostic Assessment" },
                    { value: "INCLUSIVE_ED", label: "Inclusive & Special Education" },
                  ]}
                />
              </Field>

              <Field label="Target Audience" name="targetAudience">
                <TextField
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={(e) => handleChange("targetAudience", e.target.value)}
                  placeholder="e.g. Secondary STEM Teachers"
                />
              </Field>

              <div className="col-span-full">
                <Field label="Description & Learning Outcomes" name="description">
                  <TextareaField
                    name="description"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    rows={3}
                    placeholder="Summary of modules, practical workshops and pedagogical outcomes..."
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection title="Certification Criteria" description="Requirements to issue CRT-* certificate">
              <Field label="Total Duration (Hours)" name="durationHours">
                <NumberField
                  name="durationHours"
                  value={formData.durationHours}
                  onChange={(val) => handleChange("durationHours", Number(val))}
                  min={1}
                  max={200}
                />
              </Field>

              <Field label="Minimum Attendance (%)" name="minAttendancePct">
                <NumberField
                  name="minAttendancePct"
                  value={formData.minAttendancePct}
                  onChange={(val) => handleChange("minAttendancePct", Number(val))}
                  min={50}
                  max={100}
                />
              </Field>

              <Field label="Minimum Assessment Score (%)" name="minAssessmentScore">
                <NumberField
                  name="minAssessmentScore"
                  value={formData.minAssessmentScore}
                  onChange={(val) => handleChange("minAssessmentScore", Number(val))}
                  min={40}
                  max={100}
                />
              </Field>

              <Field label="Status" name="status">
                <SelectField
                  name="status"
                  value={formData.status}
                  onChange={(val) => handleChange("status", val)}
                  options={[
                    { value: "active", label: "Active" },
                    { value: "draft", label: "Draft" },
                    { value: "archived", label: "Archived" },
                  ]}
                />
              </Field>
            </FormSection>
          </div>
        }
      />
    </form>
  );
}

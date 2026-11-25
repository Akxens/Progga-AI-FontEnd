"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormPage } from "@/components/admin/form/FormPage";
import { FormSection } from "@/components/admin/form/FormSection";
import { Field } from "@/components/admin/form/Field";
import { TextField, SelectField, AsyncSelect } from "@/components/admin/form/Inputs";
import { adminApi } from "@/lib/admin/api";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";

export interface StudentFormProps {
  mode: "create" | "edit";
  id?: string;
}

export function StudentForm({ mode, id }: StudentFormProps) {
  const router = useRouter();
  const { toast } = useCelebrate();
  const [loading, setLoading] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    grade: "Grade 8",
    schoolId: "",
    section: "A",
    rollNumber: "",
    emergencyContact: "",
    medium: "bangla",
    accountStatus: "active",
    password: "",
  });

  useEffect(() => {
    if (mode === "edit" && id) {
      adminApi<any>(`/api/admin/students/${id}`)
        .then((res) => {
          const s = res?.data || res;
          setFormData({
            name: s.name || s.user?.name || "",
            email: s.email || s.user?.email || "",
            phone: s.phone || s.user?.phone || "",
            grade: s.grade || s.user?.grade || "Grade 8",
            schoolId: s.schoolId || s.school?.id || "",
            section: s.section || "A",
            rollNumber: s.rollNumber || "",
            emergencyContact: s.emergencyContact || "",
            medium: s.medium || "bangla",
            accountStatus: s.accountStatus || s.user?.accountStatus || "active",
            password: "",
          });
        })
        .catch((err) => setError(err.message || "Failed to load student"))
        .finally(() => setLoading(false));
    }
  }, [mode, id]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast("Student name is required", "⚠️", "coral");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "create") {
        await adminApi("/api/admin/students", {
          method: "POST",
          body: formData,
        });
        toast("Student created successfully", "✅", "mint");
        router.push("/admin/students");
      } else {
        await adminApi(`/api/admin/students/${id}`, {
          method: "PATCH",
          body: formData,
        });
        toast("Student updated successfully", "✅", "mint");
        router.push(`/admin/students/${id}`);
      }
    } catch (err: any) {
      toast(err.message || "Failed to save student", "⚠️", "coral");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormPage
        title={mode === "create" ? "Add New Student" : "Edit Student Details"}
        mode={mode}
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Students", href: "/admin/students" },
          { label: mode === "create" ? "New" : "Edit" },
        ]}
        isLoading={loading}
        loadError={error}
        onCancel={() => router.back()}
        submitting={submitting}
        sections={
          <div className="space-y-6">
            <FormSection title="Basic Information" description="Personal details and login access">
              <Field label="Full Name" name="name" required>
                <TextField
                  name="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g. Ayesha Siddiqua"
                />
              </Field>

              <Field label="Phone Number" name="phone">
                <TextField
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="017XXXXXXXX"
                />
              </Field>

              <Field label="Email Address" name="email">
                <TextField
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="student@example.com"
                />
              </Field>

              {mode === "create" && (
                <Field label="Temporary Password" name="password" hint="Leave blank to generate temporary code">
                  <TextField
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder="••••••••"
                  />
                </Field>
              )}
            </FormSection>

            <FormSection title="Academic & Institutional" description="Class, curriculum and school affiliation">
              <Field label="Grade / Class" name="grade" required>
                <SelectField
                  name="grade"
                  value={formData.grade}
                  onChange={(val) => handleChange("grade", val)}
                  options={[
                    { value: "Class 6", label: "Class 6" },
                    { value: "Class 7", label: "Class 7" },
                    { value: "Class 8", label: "Class 8" },
                    { value: "Class 9", label: "Class 9" },
                    { value: "Class 10", label: "Class 10" },
                    { value: "HSC 1st", label: "HSC 1st Year" },
                    { value: "HSC 2nd", label: "HSC 2nd Year" },
                  ]}
                />
              </Field>

              <Field label="Medium of Instruction" name="medium">
                <SelectField
                  name="medium"
                  value={formData.medium}
                  onChange={(val) => handleChange("medium", val)}
                  options={[
                    { value: "bangla", label: "Bangla Version" },
                    { value: "english_version", label: "English Version" },
                    { value: "english_medium", label: "English Medium" },
                  ]}
                />
              </Field>

              <Field label="School (Optional)" name="schoolId">
                <AsyncSelect
                  lookup="schools"
                  value={formData.schoolId}
                  onChange={(val) => handleChange("schoolId", val)}
                  placeholder="Search and select affiliated school..."
                />
              </Field>

              <Field label="Section" name="section">
                <TextField
                  name="section"
                  value={formData.section}
                  onChange={(e) => handleChange("section", e.target.value)}
                  placeholder="e.g. Padma / A"
                />
              </Field>

              <Field label="Roll Number" name="rollNumber">
                <TextField
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={(e) => handleChange("rollNumber", e.target.value)}
                  placeholder="e.g. 104"
                />
              </Field>

              <Field label="Emergency Contact Phone" name="emergencyContact">
                <TextField
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleChange("emergencyContact", e.target.value)}
                  placeholder="01XXXXXXXXX"
                />
              </Field>
            </FormSection>
          </div>
        }
      />
    </form>
  );
}

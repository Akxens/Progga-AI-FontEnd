"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormPage } from "@/components/admin/form/FormPage";
import { FormSection } from "@/components/admin/form/FormSection";
import { Field } from "@/components/admin/form/Field";
import { TextField, SelectField, AsyncSelect } from "@/components/admin/form/Inputs";
import { adminApi } from "@/lib/admin/api";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";

export interface TeacherFormProps {
  mode: "create" | "edit";
  id?: string;
}

export function TeacherForm({ mode, id }: TeacherFormProps) {
  const router = useRouter();
  const { toast } = useCelebrate();
  const [loading, setLoading] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    schoolId: "",
    designation: "Assistant Teacher",
    subjects: "Mathematics, ICT",
    qualifications: "B.Sc (Hons) in Mathematics",
    accountStatus: "active",
  });

  useEffect(() => {
    if (mode === "edit" && id) {
      adminApi<any>(`/api/admin/teachers/${id}`)
        .then((res) => {
          const t = res?.data || res;
          setFormData({
            name: t.name || t.user?.name || "",
            email: t.email || t.user?.email || "",
            phone: t.phone || t.user?.phone || "",
            schoolId: t.schoolId || t.school?.id || "",
            designation: t.designation || "Assistant Teacher",
            subjects: Array.isArray(t.subjects) ? t.subjects.join(", ") : t.subjects || "",
            qualifications: t.qualifications || "",
            accountStatus: t.accountStatus || t.user?.accountStatus || "active",
          });
        })
        .catch((err) => setError(err.message || "Failed to load teacher"))
        .finally(() => setLoading(false));
    }
  }, [mode, id]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast("Teacher name is required", "⚠️", "coral");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        subjects: formData.subjects.split(",").map((s) => s.trim()).filter(Boolean),
      };

      if (mode === "create") {
        await adminApi("/api/admin/teachers", {
          method: "POST",
          body: payload,
        });
        toast("Teacher registered successfully", "✅", "mint");
        router.push("/admin/teachers");
      } else {
        await adminApi(`/api/admin/teachers/${id}`, {
          method: "PATCH",
          body: payload,
        });
        toast("Teacher updated successfully", "✅", "mint");
        router.push(`/admin/teachers/${id}`);
      }
    } catch (err: any) {
      toast(err.message || "Failed to save teacher", "⚠️", "coral");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormPage
        title={mode === "create" ? "Register New Teacher" : "Edit Teacher Profile"}
        mode={mode}
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Teachers", href: "/admin/teachers" },
          { label: mode === "create" ? "New" : "Edit" },
        ]}
        isLoading={loading}
        loadError={error}
        onCancel={() => router.back()}
        submitting={submitting}
        sections={
          <div className="space-y-6">
            <FormSection title="Teacher Personal Information" description="Contact info and institutional credentials">
              <Field label="Full Name" name="name" required>
                <TextField
                  name="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g. Nusrat Jahan"
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
                  placeholder="teacher@school.edu.bd"
                />
              </Field>

              <Field label="Account Status" name="accountStatus">
                <SelectField
                  name="accountStatus"
                  value={formData.accountStatus}
                  onChange={(val) => handleChange("accountStatus", val)}
                  options={[
                    { value: "active", label: "Active" },
                    { value: "suspended", label: "Suspended" },
                  ]}
                />
              </Field>
            </FormSection>

            <FormSection title="Institutional Affiliation" description="School and pedagogical assignments">
              <Field label="Affiliated School" name="schoolId">
                <AsyncSelect
                  lookup="schools"
                  value={formData.schoolId}
                  onChange={(val) => handleChange("schoolId", val)}
                  placeholder="Search and select affiliated school..."
                />
              </Field>

              <Field label="Designation" name="designation">
                <TextField
                  name="designation"
                  value={formData.designation}
                  onChange={(e) => handleChange("designation", e.target.value)}
                  placeholder="e.g. Senior Teacher / Assistant Teacher"
                />
              </Field>

              <Field label="Subjects Taught (comma-separated)" name="subjects">
                <TextField
                  name="subjects"
                  value={formData.subjects}
                  onChange={(e) => handleChange("subjects", e.target.value)}
                  placeholder="e.g. Physics, Higher Mathematics, ICT"
                />
              </Field>

              <Field label="Qualifications" name="qualifications">
                <TextField
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={(e) => handleChange("qualifications", e.target.value)}
                  placeholder="e.g. M.Sc in Physics, B.Ed"
                />
              </Field>
            </FormSection>
          </div>
        }
      />
    </form>
  );
}

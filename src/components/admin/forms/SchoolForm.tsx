"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormPage } from "@/components/admin/form/FormPage";
import { FormSection } from "@/components/admin/form/FormSection";
import { Field } from "@/components/admin/form/Field";
import { TextField, SelectField, TextareaField } from "@/components/admin/form/Inputs";
import { adminApi } from "@/lib/admin/api";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";

export interface SchoolFormProps {
  mode: "create" | "edit";
  id?: string;
}

export function SchoolForm({ mode, id }: SchoolFormProps) {
  const router = useRouter();
  const { toast } = useCelebrate();
  const [loading, setLoading] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    eiin: "",
    code: "",
    division: "Dhaka",
    district: "Dhaka",
    upazila: "Dhanmondi",
    address: "",
    type: "government",
    medium: "bangla",
    contactPhone: "",
    contactEmail: "",
    status: "active",
  });

  useEffect(() => {
    if (mode === "edit" && id) {
      adminApi<any>(`/api/admin/schools/${id}`)
        .then((res) => {
          const s = res?.data || res;
          setFormData({
            name: s.name || "",
            eiin: s.eiin || "",
            code: s.code || "",
            division: s.division || "Dhaka",
            district: s.district || "Dhaka",
            upazila: s.upazila || "",
            address: s.address || "",
            type: s.type || "government",
            medium: s.medium || "bangla",
            contactPhone: s.contactPhone || "",
            contactEmail: s.contactEmail || "",
            status: s.status || "active",
          });
        })
        .catch((err) => setError(err.message || "Failed to load school"))
        .finally(() => setLoading(false));
    }
  }, [mode, id]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast("School name is required", "⚠️", "coral");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "create") {
        await adminApi("/api/admin/schools", {
          method: "POST",
          body: formData,
        });
        toast("School registered successfully", "✅", "mint");
        router.push("/admin/schools");
      } else {
        await adminApi(`/api/admin/schools/${id}`, {
          method: "PATCH",
          body: formData,
        });
        toast("School updated successfully", "✅", "mint");
        router.push(`/admin/schools/${id}`);
      }
    } catch (err: any) {
      toast(err.message || "Failed to save school", "⚠️", "coral");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormPage
        title={mode === "create" ? "Register Partner School" : "Edit School Details"}
        mode={mode}
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Schools", href: "/admin/schools" },
          { label: mode === "create" ? "New" : "Edit" },
        ]}
        isLoading={loading}
        loadError={error}
        onCancel={() => router.back()}
        submitting={submitting}
        sections={
          <div className="space-y-6">
            <FormSection title="Institutional Identity" description="Official EIIN, institutional code and naming">
              <Field label="School / College Name" name="name" required>
                <TextField
                  name="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g. Dhaka Government High School"
                />
              </Field>

              <Field label="Official EIIN" name="eiin" hint="6-digit Ministry of Education institutional number">
                <TextField
                  name="eiin"
                  value={formData.eiin}
                  onChange={(e) => handleChange("eiin", e.target.value)}
                  placeholder="e.g. 108420"
                />
              </Field>

              <Field label="School Code" name="code" hint="Leave blank to auto-generate SCH-YYYY-###">
                <TextField
                  name="code"
                  value={formData.code}
                  onChange={(e) => handleChange("code", e.target.value)}
                  placeholder="e.g. SCH-2026-001"
                />
              </Field>

              <Field label="Institution Type" name="type">
                <SelectField
                  name="type"
                  value={formData.type}
                  onChange={(val) => handleChange("type", val)}
                  options={[
                    { value: "government", label: "Government" },
                    { value: "private_mpo", label: "Private (MPO)" },
                    { value: "private_non_mpo", label: "Private (Non-MPO)" },
                    { value: "madrasah", label: "Madrasah" },
                    { value: "english_medium", label: "English Medium" },
                  ]}
                />
              </Field>
            </FormSection>

            <FormSection title="Location & Administrative Jurisdiction" description="Geographical division, district and upazila">
              <Field label="Division" name="division">
                <SelectField
                  name="division"
                  value={formData.division}
                  onChange={(val) => handleChange("division", val)}
                  options={[
                    { value: "Dhaka", label: "Dhaka" },
                    { value: "Chittagong", label: "Chittagong" },
                    { value: "Rajshahi", label: "Rajshahi" },
                    { value: "Khulna", label: "Khulna" },
                    { value: "Barishal", label: "Barishal" },
                    { value: "Sylhet", label: "Sylhet" },
                    { value: "Rangpur", label: "Rangpur" },
                    { value: "Mymensingh", label: "Mymensingh" },
                  ]}
                />
              </Field>

              <Field label="District" name="district">
                <TextField
                  name="district"
                  value={formData.district}
                  onChange={(e) => handleChange("district", e.target.value)}
                  placeholder="e.g. Dhaka"
                />
              </Field>

              <Field label="Upazila / Thana" name="upazila">
                <TextField
                  name="upazila"
                  value={formData.upazila}
                  onChange={(e) => handleChange("upazila", e.target.value)}
                  placeholder="e.g. Dhanmondi"
                />
              </Field>

              <Field label="Contact Phone" name="contactPhone">
                <TextField
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) => handleChange("contactPhone", e.target.value)}
                  placeholder="02-XXXXXXXX / 017XXXXXXXX"
                />
              </Field>

              <div className="col-span-full">
                <Field label="Campus Physical Address" name="address">
                  <TextareaField
                    name="address"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    rows={2}
                    placeholder="Full campus street address..."
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

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormPage } from "@/components/admin/form/FormPage";
import { FormSection } from "@/components/admin/form/FormSection";
import { Field } from "@/components/admin/form/Field";
import { TextField, SelectField, TextareaField } from "@/components/admin/form/Inputs";
import { adminApi } from "@/lib/admin/api";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";

interface PartnerFormProps {
  initialData?: any;
  mode: "create" | "edit";
  partnerId?: string;
}

export function PartnerForm({ initialData, mode, partnerId }: PartnerFormProps) {
  const router = useRouter();
  const { toast } = useCelebrate();
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    type: initialData?.type || "corporate",
    contactName: initialData?.contactName || "",
    contactEmail: initialData?.contactEmail || "",
    contactPhone: initialData?.contactPhone || "",
    address: initialData?.address || "",
    reportingSchedule: initialData?.reportingSchedule || "quarterly",
    donorRestrictions: initialData?.donorRestrictions || "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        type: initialData.type || "corporate",
        contactName: initialData.contactName || "",
        contactEmail: initialData.contactEmail || "",
        contactPhone: initialData.contactPhone || "",
        address: initialData.address || "",
        reportingSchedule: initialData.reportingSchedule || "quarterly",
        donorRestrictions: initialData.donorRestrictions || "",
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setLoadError(null);

    try {
      if (mode === "create") {
        const res = await adminApi<any>("/api/admin/csr/partners", {
          method: "POST",
          body: JSON.stringify(formData),
        });
        toast("CSR Partner registered successfully!", "🎉", "mint");
        router.push(`/admin/csr/partners/${res.data?.id || res.id}`);
      } else {
        await adminApi(`/api/admin/csr/partners/${partnerId}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
        toast("Partner profile updated!", "✓", "mint");
        router.push(`/admin/csr/partners/${partnerId}`);
      }
    } catch (err: any) {
      setLoadError(err.message || "Failed to save partner");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormPage
      title={mode === "create" ? "Register CSR Partner" : `Edit Partner: ${formData.name}`}
      mode={mode}
      breadcrumbs={[
        { label: "CSR & Foundation", href: "/admin/csr" },
        { label: "Partners", href: "/admin/csr/partners" },
        { label: mode === "create" ? "New Partner" : formData.name },
      ]}
      loadError={loadError}
      onCancel={() => router.push("/admin/csr/partners")}
      onSubmit={handleSubmit}
      submitLabel={mode === "create" ? "Register Partner" : "Save Changes"}
      submitting={submitting}
      sections={
        <>
          <FormSection
            title="Partner Organization & Contact"
            description="Identify the donor organisation, government entity or institutional CSR sponsor."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field name="name" label="Partner / Organization Name" required>
                <TextField
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Grameenphone CSR Division"
                />
              </Field>

              <Field name="type" label="Organization Type" required>
                <SelectField
                  name="type"
                  value={formData.type}
                  onChange={(val) => setFormData({ ...formData, type: val })}
                  options={[
                    { value: "corporate", label: "Corporate Sponsor" },
                    { value: "ngo", label: "NGO / INGO Foundation" },
                    { value: "government", label: "Government Ministry / Dept" },
                    { value: "individual", label: "High Net Worth Individual" },
                    { value: "other", label: "Other Philanthropic Trust" },
                  ]}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <Field name="contactName" label="Primary Contact Person" required>
                <TextField
                  name="contactName"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  placeholder="e.g. Tanvir Ahmed"
                />
              </Field>

              <Field name="contactEmail" label="Contact Email" required>
                <TextField
                  name="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="csr@partner.org"
                />
              </Field>

              <Field name="contactPhone" label="Contact Phone">
                <TextField
                  name="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="+8801700000000"
                />
              </Field>
            </div>

            <div className="mt-4">
              <Field name="address" label="Official Address">
                <TextField
                  name="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Corporate HQ / Office address"
                />
              </Field>
            </div>
          </FormSection>

          <FormSection
            title="Governance & Reporting Terms"
            description="Donor audit frequency and specific compliance or geographic restrictions."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field name="reportingSchedule" label="Impact Reporting Schedule" required>
                <SelectField
                  name="reportingSchedule"
                  value={formData.reportingSchedule}
                  onChange={(val) => setFormData({ ...formData, reportingSchedule: val })}
                  options={[
                    { value: "monthly", label: "Monthly Progress Updates" },
                    { value: "quarterly", label: "Quarterly Impact Audit" },
                    { value: "semi_annual", label: "Semi-Annual Evaluation" },
                    { value: "annual", label: "Annual Full Grant Review" },
                  ]}
                />
              </Field>
            </div>

            <div className="mt-4">
              <Field name="donorRestrictions" label="Special Donor Conditions / Earmarks">
                <TextareaField
                  name="donorRestrictions"
                  value={formData.donorRestrictions}
                  onChange={(e) => setFormData({ ...formData, donorRestrictions: e.target.value })}
                  placeholder="e.g. Restricted to female students in Rangpur division; funds cannot be applied to administrative overhead..."
                  rows={3}
                />
              </Field>
            </div>
          </FormSection>
        </>
      }
    />
  );
}

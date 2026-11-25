"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { FormPage } from "@/components/admin/form/FormPage";
import { FormSection } from "@/components/admin/form/FormSection";
import { Field } from "@/components/admin/form/Field";
import { TextField, SelectField, TextareaField } from "@/components/admin/form/Inputs";
import { adminApi } from "@/lib/admin/api";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";

interface ProgrammeFormProps {
  initialData?: any;
  mode: "create" | "edit";
  programmeId?: string;
}

export function ProgrammeForm({ initialData, mode, programmeId }: ProgrammeFormProps) {
  const router = useRouter();
  const { toast } = useCelebrate();
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [partners, setPartners] = useState<{ id: string; name: string }[]>([]);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    partnerId: initialData?.partnerId || "",
    agreementRef: initialData?.agreementRef || "",
    grantAmount: initialData?.grantAmount ? String(initialData.grantAmount) : "500000",
    startDate: initialData?.startDate
      ? new Date(initialData.startDate).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    endDate: initialData?.endDate
      ? new Date(initialData.endDate).toISOString().slice(0, 10)
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    seatCapacity: initialData?.seatCapacity ? String(initialData.seatCapacity) : "500",
    fundedRatePerSeatMonth: initialData?.fundedRatePerSeatMonth
      ? String(initialData.fundedRatePerSeatMonth)
      : "500",
    divisions: (initialData?.divisions || []).join(", "),
    districts: (initialData?.districts || []).join(", "),
    eligibleGrades: (initialData?.eligibleGrades || [6, 7, 8, 9, 10]).join(", "),
    eligibilityNotes: initialData?.eligibilityNotes || "",
  });

  const [budgetLines, setBudgetLines] = useState<
    { category: string; description: string; amount: string }[]
  >(
    initialData?.budgetLines?.length > 0
      ? initialData.budgetLines.map((bl: any) => ({
          category: bl.category,
          description: bl.description || "",
          amount: String(bl.amount),
        }))
      : [
          { category: "student_access", description: "Direct sponsored Pro seat licenses", amount: "400000" },
          { category: "teacher_training", description: "Teacher AI pedagogy workshops", amount: "50000" },
          { category: "monitoring", description: "Impact audit & telemetry", amount: "50000" },
        ]
  );

  useEffect(() => {
    adminApi<any>("/api/admin/csr/partners?pageSize=100")
      .then((res) => {
        const rows = res?.data?.rows || res?.rows || [];
        setPartners(rows.map((p: any) => ({ id: p.id, name: `${p.name} (${p.code})` })));
        if (!formData.partnerId && rows.length > 0) {
          setFormData((prev) => ({ ...prev, partnerId: rows[0].id }));
        }
      })
      .catch(() => {});
  }, []);

  const totalBudget = budgetLines.reduce((acc, bl) => acc + (parseFloat(bl.amount) || 0), 0);
  const targetGrantAmount = parseFloat(formData.grantAmount) || 0;
  const isBudgetBalanced = Math.abs(totalBudget - targetGrantAmount) <= 0.01;

  const handleAddBudgetLine = () => {
    setBudgetLines([
      ...budgetLines,
      { category: "operations", description: "", amount: "0" },
    ]);
  };

  const handleRemoveBudgetLine = (idx: number) => {
    if (budgetLines.length <= 1) return;
    setBudgetLines(budgetLines.filter((_, i) => i !== idx));
  };

  const handleBudgetChange = (idx: number, field: string, val: string) => {
    const updated = [...budgetLines];
    updated[idx] = { ...updated[idx], [field]: val };
    setBudgetLines(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setLoadError(null);

    if (!isBudgetBalanced) {
      setLoadError(
        `BR-CSR-01: Sum of budget lines (৳${totalBudget.toFixed(2)}) must exactly equal grantAmount (৳${targetGrantAmount.toFixed(2)})`
      );
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        partnerId: formData.partnerId,
        agreementRef: formData.agreementRef.trim(),
        grantAmount: parseFloat(formData.grantAmount),
        startDate: formData.startDate,
        endDate: formData.endDate,
        seatCapacity: parseInt(formData.seatCapacity, 10),
        fundedRatePerSeatMonth: parseFloat(formData.fundedRatePerSeatMonth),
        divisions: formData.divisions ? formData.divisions.split(",").map((s: string) => s.trim()) : [],
        districts: formData.districts ? formData.districts.split(",").map((s: string) => s.trim()) : [],
        eligibleGrades: formData.eligibleGrades
          ? formData.eligibleGrades.split(",").map((s: string) => parseInt(s.trim(), 10)).filter((n: number) => !isNaN(n))
          : [],
        eligibilityNotes: formData.eligibilityNotes.trim(),
        budgetLines: budgetLines.map((bl) => ({
          category: bl.category,
          description: bl.description,
          amount: parseFloat(bl.amount) || 0,
        })),
      };

      if (mode === "create") {
        const res = await adminApi<any>("/api/admin/csr/programmes", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast("CSR Programme created successfully!", "🎉", "mint");
        router.push(`/admin/csr/programmes/${res.data?.id || res.id}`);
      } else {
        await adminApi(`/api/admin/csr/programmes/${programmeId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast("Programme updated!", "✓", "mint");
        router.push(`/admin/csr/programmes/${programmeId}`);
      }
    } catch (err: any) {
      setLoadError(err.message || "Failed to save programme");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormPage
      title={mode === "create" ? "Create CSR Programme" : `Edit Programme: ${formData.name}`}
      mode={mode}
      breadcrumbs={[
        { label: "CSR & Foundation", href: "/admin/csr" },
        { label: "Programmes", href: "/admin/csr/programmes" },
        { label: mode === "create" ? "New Programme" : formData.name },
      ]}
      loadError={loadError}
      onCancel={() => router.push("/admin/csr/programmes")}
      onSubmit={handleSubmit}
      submitLabel={mode === "create" ? "Create Programme" : "Save Changes"}
      submitting={submitting}
      sections={
        <>
          <FormSection
            title="Programme Specification & Sponsor"
            description="Link the programme to an authorized partner grant agreement and define coverage scope."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field name="name" label="Programme Title" required>
                <TextField
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. GP Northern Digital Academy 2026"
                />
              </Field>

              <Field name="partnerId" label="CSR Partner" required>
                <SelectField
                  name="partnerId"
                  value={formData.partnerId}
                  onChange={(val) => setFormData({ ...formData, partnerId: val })}
                  options={partners.map((p) => ({ value: p.id, label: p.name }))}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <Field name="agreementRef" label="Grant Agreement Reference" required>
                <TextField
                  name="agreementRef"
                  value={formData.agreementRef}
                  onChange={(e) => setFormData({ ...formData, agreementRef: e.target.value })}
                  placeholder="e.g. AGR-GP-2026-01"
                />
              </Field>

              <Field name="grantAmount" label="Total Authorized Budget (BDT)" required>
                <TextField
                  name="grantAmount"
                  value={formData.grantAmount}
                  onChange={(e) => setFormData({ ...formData, grantAmount: e.target.value })}
                  placeholder="500000"
                />
              </Field>

              <Field name="fundedRatePerSeatMonth" label="Funded Rate / Seat-Month (BDT)" required>
                <TextField
                  name="fundedRatePerSeatMonth"
                  value={formData.fundedRatePerSeatMonth}
                  onChange={(e) => setFormData({ ...formData, fundedRatePerSeatMonth: e.target.value })}
                  placeholder="500"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <Field name="seatCapacity" label="Student Seat Capacity" required>
                <TextField
                  name="seatCapacity"
                  value={formData.seatCapacity}
                  onChange={(e) => setFormData({ ...formData, seatCapacity: e.target.value })}
                  placeholder="500"
                />
              </Field>

              <Field name="startDate" label="Start Date" required>
                <TextField
                  name="startDate"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </Field>

              <Field name="endDate" label="End Date" required>
                <TextField
                  name="endDate"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </Field>
            </div>
          </FormSection>

          <FormSection
            title="Eligibility & Geographic Targeting (BR-CSR-02)"
            description="Define student grade restrictions and targeted districts."
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field name="eligibleGrades" label="Target Grades (Comma-separated)">
                <TextField
                  name="eligibleGrades"
                  value={formData.eligibleGrades}
                  onChange={(e) => setFormData({ ...formData, eligibleGrades: e.target.value })}
                  placeholder="6, 7, 8, 9, 10"
                />
              </Field>

              <Field name="divisions" label="Divisions (Optional)">
                <TextField
                  name="divisions"
                  value={formData.divisions}
                  onChange={(e) => setFormData({ ...formData, divisions: e.target.value })}
                  placeholder="Rangpur, Rajshahi"
                />
              </Field>

              <Field name="districts" label="Districts (Optional)">
                <TextField
                  name="districts"
                  value={formData.districts}
                  onChange={(e) => setFormData({ ...formData, districts: e.target.value })}
                  placeholder="Kurigram, Gaibandha"
                />
              </Field>
            </div>

            <div className="mt-4">
              <Field name="eligibilityNotes" label="Selection Criteria & Notes">
                <TextareaField
                  name="eligibilityNotes"
                  value={formData.eligibilityNotes}
                  onChange={(e) => setFormData({ ...formData, eligibilityNotes: e.target.value })}
                  placeholder="Selection prioritizes students in rural government high schools with monthly guardian income below ৳15,000..."
                  rows={2}
                />
              </Field>
            </div>
          </FormSection>

          <FormSection
            title="Line-Item Budget Breakdown (BR-CSR-01)"
            description="The sum of all budget line items must match the authorized programme budget."
          >
            <div className="space-y-3">
              {budgetLines.map((bl, idx) => (
                <div key={idx} className="flex flex-col md:flex-row items-center gap-3 p-3 border rounded-xl bg-card">
                  <div className="w-full md:w-1/4">
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Category</label>
                    <SelectField
                      name={`category_${idx}`}
                      value={bl.category}
                      onChange={(val) => handleBudgetChange(idx, "category", val)}
                      options={[
                        { value: "student_access", label: "Student Pro Access Licenses" },
                        { value: "teacher_training", label: "Teacher Training Workshops" },
                        { value: "devices", label: "School Classroom Hardware" },
                        { value: "events", label: "Activation & Olympiad Events" },
                        { value: "operations", label: "Local Field Operations" },
                        { value: "monitoring", label: "Independent Impact Audit" },
                        { value: "other", label: "Other Allowable Expense" },
                      ]}
                    />
                  </div>

                  <div className="w-full md:w-1/2">
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Description</label>
                    <TextField
                      name={`desc_${idx}`}
                      value={bl.description}
                      onChange={(e) => handleBudgetChange(idx, "description", e.target.value)}
                      placeholder="Line item description"
                    />
                  </div>

                  <div className="w-full md:w-1/4 flex items-center gap-2">
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Amount (BDT)</label>
                      <TextField
                        name={`amt_${idx}`}
                        value={bl.amount}
                        onChange={(e) => handleBudgetChange(idx, "amount", e.target.value)}
                        placeholder="50000"
                      />
                    </div>
                    {budgetLines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveBudgetLine(idx)}
                        className="mt-5 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleAddBudgetLine}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-medium hover:bg-muted transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Budget Line
                </button>

                <div className="text-right">
                  <div className="text-sm font-semibold">
                    Budget Total: ৳{totalBudget.toLocaleString()} / ৳{targetGrantAmount.toLocaleString()}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      isBudgetBalanced ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {isBudgetBalanced
                      ? "✓ Budget matches authorized grant amount"
                      : `Discrepancy: ৳${Math.abs(totalBudget - targetGrantAmount).toLocaleString()}`}
                  </span>
                </div>
              </div>
            </div>
          </FormSection>
        </>
      }
    />
  );
}

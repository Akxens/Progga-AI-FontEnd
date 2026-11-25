"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { FormPage } from "@/components/admin/form/FormPage";
import { FormSection } from "@/components/admin/form/FormSection";
import { Field } from "@/components/admin/form/Field";
import { TextField, SelectField, TextareaField } from "@/components/admin/form/Inputs";
import { adminApi } from "@/lib/admin/api";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";

function RefundFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTxnId = searchParams.get("transactionId") || "";

  const { toast } = useCelebrate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    transactionId: initialTxnId,
    amount: "499",
    reasonCode: "customer_request",
    reason: "",
    entitlementAction: "keep_until_period_end",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await adminApi("/api/admin/finance/refunds", {
        method: "POST",
        body: JSON.stringify({
          transactionId: formData.transactionId.trim(),
          amount: Number(formData.amount),
          reasonCode: formData.reasonCode,
          reason: formData.reason.trim(),
          entitlementAction: formData.entitlementAction,
        }),
      });

      toast("Refund processed and reversing ledger journal posted!", "🎉", "mint");
      router.push("/admin/finance/refunds");
    } catch (err: any) {
      setError(err.message || "Failed to process refund");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormPage
      title="Request Customer Refund"
      mode="create"
      breadcrumbs={[
        { label: "Finance", href: "/admin/finance/subscriptions" },
        { label: "Refunds", href: "/admin/finance/refunds" },
        { label: "New Refund" },
      ]}
      loadError={error}
      onCancel={() => router.push("/admin/finance/refunds")}
      onSubmit={handleSubmit}
      submitLabel="Process Refund"
      submitting={submitting}
      sections={
        <FormSection
          title="Transaction & Amount"
          description="Specify the transaction to be refunded and payout amount"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field name="transactionId" label="Payment Transaction ID" required>
              <TextField
                name="transactionId"
                value={formData.transactionId}
                onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                placeholder="e.g. txn_cm3... or paste transaction ID"
              />
            </Field>

            <Field name="amount" label="Refund Amount (BDT)" required>
              <TextField
                name="amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Field name="reasonCode" label="Reason Code" required>
              <SelectField
                name="reasonCode"
                value={formData.reasonCode}
                onChange={(val) => setFormData({ ...formData, reasonCode: val })}
                options={[
                  { value: "customer_request", label: "Customer Dissatisfaction / Request" },
                  { value: "billing_error", label: "Billing / Overcharge Error" },
                  { value: "duplicate_charge", label: "Duplicate Gateway Charge" },
                  { value: "service_issue", label: "Service Unavailability / Downtime" },
                ]}
              />
            </Field>

            <Field name="entitlementAction" label="Entitlement Action" required>
              <SelectField
                name="entitlementAction"
                value={formData.entitlementAction}
                onChange={(val) => setFormData({ ...formData, entitlementAction: val })}
                options={[
                  { value: "keep_until_period_end", label: "Keep Pro access until current cycle ends" },
                  { value: "revoke_immediate", label: "Revoke Pro access immediately (Revert to Free)" },
                ]}
              />
            </Field>
          </div>

          <div className="mt-4">
            <Field name="reason" label="Detailed Explanation / Audit Justification" required>
              <TextareaField
                name="reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="e.g. Guardian requested refund within 24 hours of accidental subscription..."
                rows={3}
              />
            </Field>
          </div>
        </FormSection>
      }
    />
  );
}

export default function NewRefundPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading refund form...</div>}>
      <RefundFormContent />
    </Suspense>
  );
}

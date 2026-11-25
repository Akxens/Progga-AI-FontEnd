"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DollarSign, RefreshCw, Undo, Book, FileText, CheckCircle2 } from "lucide-react";
import { Breadcrumbs } from "@/components/admin/shell/Breadcrumbs";
import { StatusBadge } from "@/components/admin/display/StatusBadge";
import { KeyValueGrid } from "@/components/admin/display/KeyValueGrid";
import { MoneyText } from "@/components/admin/display/FormattedText";
import { adminApi } from "@/lib/admin/api";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";

export default function PaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useCelebrate();

  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadPayment = () => {
    setLoading(true);
    adminApi<any>(`/api/admin/payments/${id}`)
      .then((res) => {
        const p = res?.data || res;
        setPayment(p);
      })
      .catch((err) => toast(err.message || "Failed to load payment", "⚠️", "coral"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPayment();
  }, [id]);

  const handleVerify = async () => {
    try {
      await adminApi(`/api/admin/payments/${id}/verify`, { method: "POST" });
      toast("Payment re-verified with gateway provider!", "✓", "mint");
      loadPayment();
    } catch (err: any) {
      toast(err.message || "Verification failed", "⚠️", "coral");
    }
  };

  if (loading || !payment) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-48 bg-muted rounded" />
        <div className="h-10 w-96 bg-muted rounded" />
        <div className="h-64 bg-card rounded-xl border p-6" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Finance", href: "/admin/finance/subscriptions" },
          { label: "Payments", href: "/admin/finance/payments" },
          { label: payment.code },
        ]}
      />

      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{payment.code}</h1>
            <StatusBadge status={payment.status} />
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-medium uppercase tracking-wide">
              {payment.provider}
            </span>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Student: <span className="font-semibold text-foreground">{payment.user?.name}</span> ({payment.user?.email || payment.user?.phone || payment.studentId})
          </p>
        </div>

        <div className="flex items-center gap-2">
          {payment.status !== "succeeded" && (
            <button
              onClick={handleVerify}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Re-verify Gateway
            </button>
          )}

          {payment.status === "succeeded" && (
            <Link
              href={`/admin/finance/refunds/new?transactionId=${payment.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-red-200 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
            >
              <Undo className="w-4 h-4" />
              Request Refund
            </Link>
          )}
        </div>
      </div>

      {/* Payment Specification KeyValueGrid */}
      <div className="border rounded-xl p-6 bg-card space-y-4">
        <h2 className="text-base font-semibold">Payment Details</h2>
        <KeyValueGrid
          items={[
            { label: "Transaction Code", value: payment.code },
            { label: "Provider Reference", value: payment.providerTxnId || "—" },
            { label: "Student Name", value: payment.user?.name },
            { label: "Student Email / Phone", value: payment.user?.email || payment.user?.phone || "—" },
            {
              label: "Transaction Amount",
              value: <MoneyText value={payment.amount} />,
            },
            { label: "Payment Gateway", value: payment.provider.toUpperCase() },
            { label: "Payment Method", value: payment.method || "Online Card / MFS" },
            { label: "Status", value: <StatusBadge status={payment.status} /> },
            { label: "Tax Invoice Number", value: payment.invoice?.invoiceNumber || "—" },
            { label: "Initiated At", value: new Date(payment.initiatedAt).toLocaleString() },
            {
              label: "Settled At",
              value: payment.completedAt ? new Date(payment.completedAt).toLocaleString() : "Pending",
            },
          ]}
        />
      </div>

      {/* Double-Entry Ledger Postings Section */}
      <div className="border rounded-xl p-6 bg-card space-y-4">
        <h2 className="text-base font-semibold flex items-center gap-2">
          <Book className="w-4 h-4 text-primary" />
          General Ledger Double-Entry Postings (Audited)
        </h2>

        {(!payment.journals || payment.journals.length === 0) ? (
          <p className="text-sm text-muted-foreground italic py-4">
            No ledger journal lines posted yet. Journal postings are generated automatically when payments succeed.
          </p>
        ) : (
          <div className="space-y-4">
            {payment.journals.map((journal: any) => (
              <div key={journal.id} className="border rounded-lg p-4 space-y-2 bg-muted/20">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-mono font-semibold text-foreground">{journal.code}</span>
                  <span>{new Date(journal.postedAt).toLocaleString()}</span>
                </div>
                <p className="text-sm font-medium">{journal.description}</p>
                <div className="overflow-x-auto mt-2">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/60 font-semibold border-b">
                      <tr>
                        <th className="py-2 px-3">Account Code</th>
                        <th className="py-2 px-3">Direction</th>
                        <th className="py-2 px-3">Amount</th>
                        <th className="py-2 px-3">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {journal.entries?.map((e: any) => (
                        <tr key={e.id}>
                          <td className="py-2 px-3 font-mono">
                            {e.accountCode === "1000"
                              ? "1000 (Cash / Gateway Settlement)"
                              : e.accountCode === "4000"
                              ? "4000 (B2C Subscription Revenue)"
                              : e.accountCode}
                          </td>
                          <td className="py-2 px-3 font-semibold uppercase">
                            <span
                              className={
                                e.direction === "debit" ? "text-emerald-600" : "text-blue-600"
                              }
                            >
                              {e.direction}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-medium">৳{Number(e.amount).toFixed(2)}</td>
                          <td className="py-2 px-3 text-muted-foreground">{e.description || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

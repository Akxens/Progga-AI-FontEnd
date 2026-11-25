"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Building2, FileText, CheckCircle2, Award, Calendar } from "lucide-react";
import { Breadcrumbs } from "@/components/admin/shell/Breadcrumbs";
import { StatusBadge } from "@/components/admin/display/StatusBadge";
import { KeyValueGrid } from "@/components/admin/display/KeyValueGrid";
import { MoneyText } from "@/components/admin/display/FormattedText";
import { Modal } from "@/components/ui/Modal";
import { adminApi } from "@/lib/admin/api";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";

export default function PartnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { toast } = useCelebrate();

  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [agreementForm, setAgreementForm] = useState({
    agreementRef: "",
    amountCommitted: "1000000",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    restrictions: "",
    allowsInterEntityPurchase: false,
  });

  const loadPartner = () => {
    setLoading(true);
    adminApi<any>(`/api/admin/csr/partners/${id}`)
      .then((res) => setPartner(res?.data || res))
      .catch((err) => toast(err.message || "Failed to load partner", "⚠️", "coral"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPartner();
  }, [id]);

  const handleCreateAgreement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi(`/api/admin/csr/partners/${id}/agreements`, {
        method: "POST",
        body: JSON.stringify({
          agreementRef: agreementForm.agreementRef.trim(),
          amountCommitted: Number(agreementForm.amountCommitted),
          startDate: agreementForm.startDate,
          endDate: agreementForm.endDate,
          restrictions: agreementForm.restrictions.trim(),
          allowsInterEntityPurchase: agreementForm.allowsInterEntityPurchase,
        }),
      });

      toast("Grant Agreement version recorded!", "🎉", "mint");
      setShowAgreementModal(false);
      setAgreementForm({
        agreementRef: "",
        amountCommitted: "1000000",
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        restrictions: "",
        allowsInterEntityPurchase: false,
      });
      loadPartner();
    } catch (err: any) {
      toast(err.message || "Failed to create agreement", "⚠️", "coral");
    }
  };

  if (loading || !partner) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-48 bg-muted rounded" />
        <div className="h-10 w-96 bg-muted rounded" />
        <div className="h-64 bg-card rounded-xl border p-6" />
      </div>
    );
  }

  const activeAgreements = partner.agreements?.filter((a: any) => a.status === "active") || [];
  const totalCommitted = activeAgreements.reduce((sum: number, a: any) => sum + Number(a.amountCommitted), 0);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "CSR & Foundation", href: "/admin/csr" },
          { label: "Partners", href: "/admin/csr/partners" },
          { label: partner.name },
        ]}
      />

      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{partner.name}</h1>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted font-medium">
              {partner.code}
            </span>
            <StatusBadge status={partner.status} />
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Type: <span className="font-semibold text-foreground capitalize">{partner.type}</span> • Primary:{" "}
            <span className="font-medium text-foreground">{partner.contactName}</span> ({partner.contactEmail})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/admin/csr/partners/${partner.id}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-line rounded-lg text-xs font-semibold hover:bg-muted transition-colors shadow-sm"
          >
            Edit Partner
          </Link>
          <button
            onClick={() => setShowAgreementModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Grant Agreement
          </button>
        </div>
      </div>

      {/* Partner Terms */}
      <div className="border rounded-xl p-6 bg-card space-y-4">
        <h2 className="text-base font-semibold">Partner Profile & Terms</h2>
        <KeyValueGrid
          items={[
            { label: "Partner ID Code", value: partner.code },
            { label: "Organization Name", value: partner.name },
            { label: "Type", value: partner.type.toUpperCase() },
            { label: "Contact Name", value: partner.contactName },
            { label: "Contact Email", value: partner.contactEmail },
            { label: "Contact Phone", value: partner.contactPhone || "—" },
            { label: "Official Address", value: partner.address || "—" },
            { label: "Audit / Report Frequency", value: partner.reportingSchedule.toUpperCase() },
            {
              label: "Total Active Commitment",
              value: <MoneyText value={totalCommitted} />,
            },
            { label: "Earmarks & Restrictions", value: partner.donorRestrictions || "None specified" },
            { label: "Registered At", value: new Date(partner.createdAt).toLocaleDateString() },
          ]}
        />
      </div>

      {/* Grant Agreements List */}
      <div className="border rounded-xl p-6 bg-card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Grant Agreements & Amendments
          </h2>
          <span className="text-xs text-muted-foreground">
            {partner.agreements?.length || 0} contracts on file
          </span>
        </div>

        {!partner.agreements || partner.agreements.length === 0 ? (
          <p className="text-sm text-muted-foreground italic py-4">
            No grant agreements registered yet. Click &apos;Add Grant Agreement&apos; to commit funds.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold border-b">
                <tr>
                  <th className="py-2.5 px-4">Agreement Ref</th>
                  <th className="py-2.5 px-4">Version</th>
                  <th className="py-2.5 px-4">Committed Amount</th>
                  <th className="py-2.5 px-4">Start Date</th>
                  <th className="py-2.5 px-4">End Date</th>
                  <th className="py-2.5 px-4">Inter-Entity</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {partner.agreements.map((ag: any) => (
                  <tr key={ag.id} className="hover:bg-muted/20">
                    <td className="py-3 px-4 font-mono font-medium">{ag.agreementRef}</td>
                    <td className="py-3 px-4 text-xs font-semibold">v{ag.versionNo}</td>
                    <td className="py-3 px-4 font-semibold">
                      <MoneyText value={Number(ag.amountCommitted)} />
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {new Date(ag.startDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {new Date(ag.endDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {ag.allowsInterEntityPurchase ? (
                        <span className="text-emerald-600 font-medium">Permitted</span>
                      ) : (
                        <span className="text-muted-foreground">Prohibited</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={ag.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Agreement Modal */}
      {showAgreementModal && (
        <Modal
          open={showAgreementModal}
          onClose={() => setShowAgreementModal(false)}
          title="Add Partner Grant Agreement"
        >
          <form onSubmit={handleCreateAgreement} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold block mb-1">Agreement Reference Code</label>
              <input
                type="text"
                required
                value={agreementForm.agreementRef}
                onChange={(e) => setAgreementForm({ ...agreementForm, agreementRef: e.target.value })}
                placeholder="e.g. AGR-GP-2026-01"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold block mb-1">Amount Committed (BDT)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={agreementForm.amountCommitted}
                  onChange={(e) => setAgreementForm({ ...agreementForm, amountCommitted: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Allows Inter-Entity Purchase</label>
                <select
                  value={agreementForm.allowsInterEntityPurchase ? "true" : "false"}
                  onChange={(e) =>
                    setAgreementForm({
                      ...agreementForm,
                      allowsInterEntityPurchase: e.target.value === "true",
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="false">No (Foundation Internal Only)</option>
                  <option value="true">Yes (Commercial Purchase Allowed)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold block mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  value={agreementForm.startDate}
                  onChange={(e) => setAgreementForm({ ...agreementForm, startDate: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">End Date</label>
                <input
                  type="date"
                  required
                  value={agreementForm.endDate}
                  onChange={(e) => setAgreementForm({ ...agreementForm, endDate: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1">Donor Restrictions / Audit Mandates</label>
              <textarea
                rows={2}
                value={agreementForm.restrictions}
                onChange={(e) => setAgreementForm({ ...agreementForm, restrictions: e.target.value })}
                placeholder="Specific grant conditions..."
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowAgreementModal(false)}
                className="px-3 py-1.5 border rounded-lg text-xs font-medium hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90"
              >
                Save Agreement Version
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

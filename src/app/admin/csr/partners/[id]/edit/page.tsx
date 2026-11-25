"use client";

import { use, useEffect, useState } from "react";
import { PartnerForm } from "@/components/admin/forms/PartnerForm";
import { adminApi } from "@/lib/admin/api";

export default function EditPartnerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi<any>(`/api/admin/csr/partners/${id}`)
      .then((res) => setPartner(res?.data || res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !partner) {
    return (
      <div className="p-8 space-y-4 animate-pulse">
        <div className="h-6 w-48 bg-muted rounded" />
        <div className="h-10 w-96 bg-muted rounded" />
        <div className="h-64 bg-card rounded-xl border p-6" />
      </div>
    );
  }

  return <PartnerForm mode="edit" partnerId={id} initialData={partner} />;
}

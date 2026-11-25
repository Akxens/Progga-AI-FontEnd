"use client";

import { use, useEffect, useState } from "react";
import { ProgrammeForm } from "@/components/admin/forms/ProgrammeForm";
import { adminApi } from "@/lib/admin/api";

export default function EditProgrammePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [programme, setProgramme] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi<any>(`/api/admin/csr/programmes/${id}`)
      .then((res) => setProgramme(res?.data || res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !programme) {
    return (
      <div className="p-8 space-y-4 animate-pulse">
        <div className="h-6 w-48 bg-muted rounded" />
        <div className="h-10 w-96 bg-muted rounded" />
        <div className="h-64 bg-card rounded-xl border p-6" />
      </div>
    );
  }

  return <ProgrammeForm mode="edit" programmeId={id} initialData={programme} />;
}

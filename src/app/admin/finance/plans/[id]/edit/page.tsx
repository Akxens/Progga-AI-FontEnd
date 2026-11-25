"use client";

import { use } from "react";
import { PlanForm } from "@/components/admin/forms/PlanForm";

export default function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <PlanForm mode="edit" id={id} />;
}

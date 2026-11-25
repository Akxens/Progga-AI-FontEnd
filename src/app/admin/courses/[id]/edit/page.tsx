"use client";

import { use } from "react";
import { CourseForm } from "@/components/admin/forms/CourseForm";

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <CourseForm mode="edit" id={id} />;
}

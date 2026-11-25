import { SchoolForm } from "@/components/admin/forms/SchoolForm";

export default async function EditSchoolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SchoolForm mode="edit" id={id} />;
}

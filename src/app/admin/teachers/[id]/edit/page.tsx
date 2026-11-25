import { TeacherForm } from "@/components/admin/forms/TeacherForm";

export default async function EditTeacherPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TeacherForm mode="edit" id={id} />;
}

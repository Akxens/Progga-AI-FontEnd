import { StudentForm } from "@/components/admin/forms/StudentForm";

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StudentForm mode="edit" id={id} />;
}

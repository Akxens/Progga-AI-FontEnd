"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormPage } from "@/components/admin/form/FormPage";
import { FormSection } from "@/components/admin/form/FormSection";
import { Field } from "@/components/admin/form/Field";
import { TextField, SelectField, TextareaField } from "@/components/admin/form/Inputs";
import { adminApi } from "@/lib/admin/api";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";

export interface CourseFormProps {
  mode: "create" | "edit";
  id?: string;
}

export function CourseForm({ mode, id }: CourseFormProps) {
  const router = useRouter();
  const { toast } = useCelebrate();
  const [loading, setLoading] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    titleBn: "",
    grade: "9",
    subjectId: "physics",
    book: "",
    description: "",
    status: "draft",
  });

  useEffect(() => {
    if (mode === "edit" && id) {
      adminApi<any>(`/api/admin/academics/courses/${id}`)
        .then((res) => {
          const c = res?.data || res;
          setFormData({
            title: c.title || "",
            titleBn: c.titleBn || "",
            grade: String(c.grade || 9),
            subjectId: c.subjectId || "physics",
            book: c.book || "",
            description: c.description || "",
            status: c.status || "draft",
          });
        })
        .catch((err) => setError(err.message || "Failed to load course"))
        .finally(() => setLoading(false));
    }
  }, [mode, id]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast("Course title is required", "⚠️", "coral");
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      title: formData.title.trim(),
      titleBn: formData.titleBn.trim(),
      grade: Number(formData.grade),
      subjectId: formData.subjectId,
      book: formData.book.trim(),
      description: formData.description.trim(),
      status: formData.status,
    };

    try {
      if (mode === "create") {
        const res = await adminApi<any>("/api/admin/academics/courses", {
          method: "POST",
          body: payload,
        });
        const createdId = res?.data?.id || res?.id;
        toast("Course created successfully!", "🎉", "mint");
        if (createdId) {
          router.push(`/admin/courses/${createdId}`);
        } else {
          router.push("/admin/courses");
        }
      } else {
        await adminApi(`/api/admin/academics/courses/${id}`, {
          method: "PATCH",
          body: payload,
        });
        toast("Course updated successfully!", "✓", "mint");
        router.push(`/admin/courses/${id}`);
      }
    } catch (err: any) {
      toast(err.message || "Failed to save course", "⚠️", "coral");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormPage
        title={mode === "create" ? "New Course" : "Edit Course"}
        mode={mode}
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Courses", href: "/admin/courses" },
          { label: mode === "create" ? "New" : "Edit" },
        ]}
        isLoading={loading}
        loadError={error}
        onCancel={() => router.push("/admin/courses")}
        submitting={submitting}
        submitLabel={mode === "create" ? "Create Course" : "Save Changes"}
        sections={
          <div className="space-y-6">
            <FormSection title="Course Information" description="Basic NCTB syllabus metadata and class grade">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Title (English)" name="title" required>
                  <TextField
                    name="title"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="e.g. Physics Class 9"
                  />
                </Field>
                <Field label="Title (Bangla)" name="titleBn">
                  <TextField
                    name="titleBn"
                    value={formData.titleBn}
                    onChange={(e) => handleChange("titleBn", e.target.value)}
                    placeholder="যেমন: পদার্থবিজ্ঞান নবম শ্রেণি"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Field label="Class / Grade" name="grade" required>
                  <SelectField
                    name="grade"
                    value={formData.grade}
                    onChange={(val) => handleChange("grade", val)}
                    options={[
                      { value: "3", label: "Class 3" },
                      { value: "4", label: "Class 4" },
                      { value: "5", label: "Class 5" },
                      { value: "6", label: "Class 6" },
                      { value: "7", label: "Class 7" },
                      { value: "8", label: "Class 8" },
                      { value: "9", label: "Class 9" },
                      { value: "10", label: "Class 10" },
                      { value: "11", label: "Class 11 (HSC)" },
                      { value: "12", label: "Class 12 (HSC)" },
                    ]}
                    disabled={mode === "edit"}
                  />
                </Field>

                <Field label="Subject" name="subjectId" required>
                  <SelectField
                    name="subjectId"
                    value={formData.subjectId}
                    onChange={(val) => handleChange("subjectId", val)}
                    options={[
                      { value: "physics", label: "Physics (পদার্থবিজ্ঞান)" },
                      { value: "chemistry", label: "Chemistry (রসায়ন)" },
                      { value: "math", label: "General Math (গণিত)" },
                      { value: "higher-math", label: "Higher Math (উচ্চতর গণিত)" },
                      { value: "biology", label: "Biology (জীববিজ্ঞান)" },
                      { value: "ict", label: "ICT (তথ্য ও যোগাযোগ প্রযুক্তি)" },
                      { value: "english", label: "English (ইংরেজি)" },
                      { value: "bangla", label: "Bangla (বাংলা)" },
                    ]}
                    disabled={mode === "edit"}
                  />
                </Field>
              </div>

              <div className="mt-4">
                <Field label="NCTB Textbook Reference" name="book" required>
                  <TextField
                    name="book"
                    value={formData.book}
                    onChange={(e) => handleChange("book", e.target.value)}
                    placeholder="e.g. NCTB Physics (Class 9-10), 2026 Edition"
                  />
                </Field>
              </div>

              <div className="mt-4">
                <Field label="Description" name="description">
                  <TextareaField
                    name="description"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Overview of the course, learning objectives, and scope..."
                    rows={3}
                  />
                </Field>
              </div>

              <div className="mt-4">
                <Field label="Publishing Status" name="status">
                  <SelectField
                    name="status"
                    value={formData.status}
                    onChange={(val) => handleChange("status", val)}
                    options={[
                      { value: "draft", label: "Draft (Hidden from students)" },
                      { value: "published", label: "Published (Active in student catalog)" },
                      { value: "archived", label: "Archived (Existing students keep progress)" },
                    ]}
                  />
                </Field>
              </div>
            </FormSection>
          </div>
        }
      />
    </form>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Home,
  Save,
  X,
  Layers,
  GraduationCap,
  Sparkles,
  FileText,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import { adminApi } from "@/lib/admin/api";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";
import { Spinner } from "@/components/ui/primitives";

export interface CourseFormProps {
  mode: "create" | "edit";
  id?: string;
}

// Custom 3D Academic Artwork for Form Banner
function NewCourseIllustration() {
  return (
    <div className="absolute right-0 top-0 bottom-0 w-[360px] pointer-events-none hidden md:block overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 70% 50%, rgba(56, 189, 248, 0.2) 0%, rgba(147, 197, 253, 0.1) 45%, rgba(255, 255, 255, 0) 75%)",
        }}
      />
      <svg
        className="absolute right-4 top-1/2 -translate-y-1/2 w-[320px] h-[170px] drop-shadow-lg"
        viewBox="0 0 320 170"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="bookBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="goldTassel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>

        {/* Ambient glow */}
        <circle cx="200" cy="85" r="60" fill="#38bdf8" opacity="0.2" />

        {/* 3D Stacked Academic Books */}
        <g transform="translate(130, 60)">
          {/* Bottom Book */}
          <path d="M 0 45 L 80 75 L 120 50 L 40 20 Z" fill="#64748b" opacity="0.4" />
          <path d="M 0 45 L 80 75 L 80 62 L 0 32 Z" fill="#475569" />
          <path d="M 0 32 L 80 62 L 120 37 L 40 07 Z" fill="#3b82f6" />

          {/* Middle Book */}
          <path d="M 10 24 L 90 54 L 130 29 L 50 -1 Z" fill="#0284c7" />
          <path d="M 10 32 L 90 62 L 90 54 L 10 24 Z" fill="#0369a1" />

          {/* Top Book */}
          <path d="M 20 12 L 100 42 L 140 17 L 60 -13 Z" fill="url(#bookBlueGrad)" stroke="#38bdf8" strokeWidth="0.8" />
          <path d="M 20 20 L 100 50 L 100 42 L 20 12 Z" fill="#0369a1" />
        </g>

        {/* Floating Graduation Cap */}
        <g transform="translate(180, 10)">
          {/* Diamond cap top */}
          <path
            d="M 50 15 L 100 35 L 50 55 L 0 35 Z"
            fill="url(#capGrad)"
            stroke="#475569"
            strokeWidth="1"
          />
          {/* Cap skull cap under base */}
          <path
            d="M 30 45 L 50 52 L 70 45 L 68 58 C 68 66 32 66 32 58 Z"
            fill="#0f172a"
          />
          {/* Golden Button & Tassel */}
          <circle cx="50" cy="35" r="3" fill="url(#goldTassel)" />
          <path
            d="M 50 35 C 35 40 20 48 18 65"
            stroke="url(#goldTassel)"
            strokeWidth="1.8"
            fill="none"
          />
          <circle cx="18" cy="65" r="2.5" fill="url(#goldTassel)" />
        </g>
      </svg>
    </div>
  );
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
    grade: "10",
    subjectId: "math",
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
            grade: String(c.grade || 10),
            subjectId: c.subjectId || "math",
            book: c.book || "",
            description: c.description || "",
            status: c.status || "draft",
          });
        })
        .catch((err) => setError(err.message || "Failed to load course details"))
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

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 bg-slate-100 dark:bg-slate-800 rounded-2xl border" />
        <div className="h-96 bg-slate-100 dark:bg-slate-800 rounded-2xl border" />
      </div>
    );
  }

  const subjects = [
    { value: "math", label: "General Mathematics (সাধারণ গণিত)", icon: "📐" },
    { value: "higher-math", label: "Higher Mathematics (উচ্চতর গণিত)", icon: "∫" },
    { value: "physics", label: "Physics (পদার্থবিজ্ঞান)", icon: "⚛️" },
    { value: "chemistry", label: "Chemistry (রসায়ন)", icon: "🧪" },
    { value: "biology", label: "Biology (জীববিজ্ঞান)", icon: "🧬" },
    { value: "ict", label: "ICT (তথ্য ও যোগাযোগ প্রযুক্তি)", icon: "💻" },
    { value: "english", label: "English (ইংরেজি)", icon: "📖" },
    { value: "bangla", label: "Bangla (বাংলা)", icon: "🇧🇩" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-20">
      {/* Header Banner matching Course Detail */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
        <NewCourseIllustration />

        <div className="relative z-10 max-w-2xl space-y-3">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Home size={13} className="text-slate-400" />
            <Link href="/admin" className="hover:text-slate-800 dark:hover:text-slate-200">
              Admin
            </Link>
            <span>›</span>
            <Link href="/admin/courses" className="hover:text-slate-800 dark:hover:text-slate-200">
              Courses
            </Link>
            <span>›</span>
            <span className="text-slate-700 dark:text-slate-300 font-semibold">
              {mode === "create" ? "New Course" : "Edit Metadata"}
            </span>
          </div>

          {/* Title & Subtitle */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {mode === "create" ? "Create New Course" : `Edit ${formData.title || "Course"}`}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
              Configure course syllabus, curriculum details, grade level and publishing state.
            </p>
          </div>

          {/* Badges Row */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/80">
              <BookOpen size={12} className="text-sky-600" />
              NCTB Curriculum
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <Layers size={12} className="text-slate-500" />
              Class {formData.grade}
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 capitalize">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {formData.status}
            </span>
          </div>
        </div>

        {/* Top Right Action Buttons */}
        <div className="relative z-10 flex items-center gap-2 mt-5 sm:mt-0 sm:absolute sm:top-6 sm:right-6">
          <button
            type="button"
            onClick={() => router.push(mode === "create" ? "/admin/courses" : `/admin/courses/${id}`)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors shadow-xs"
          >
            <X size={13} />
            <span>Cancel</span>
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
          >
            {submitting ? <Spinner size={14} /> : <Save size={13} />}
            <span>{mode === "create" ? "Create Course" : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Main Form Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Course Info & Academic Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Course Info */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <BookOpen className="w-4 h-4 text-sky-600" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Course Identification & Titles
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Course Title (English) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. General Mathematics"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Course Title (Bangla)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: সাধারণ গণিত"
                  value={formData.titleBn}
                  onChange={(e) => handleChange("titleBn", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Class / Grade Level <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.grade}
                  disabled={mode === "edit"}
                  onChange={(e) => handleChange("grade", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                >
                  <option value="6">Class 6 (৬ষ্ঠ শ্রেণি)</option>
                  <option value="7">Class 7 (৭ম শ্রেণি)</option>
                  <option value="8">Class 8 (৮ম শ্রেণি)</option>
                  <option value="9">Class 9 (৯ম শ্রেণি)</option>
                  <option value="10">Class 10 (১০ম শ্রেণি)</option>
                  <option value="11">Class 11 (একাদশ - HSC)</option>
                  <option value="12">Class 12 (দ্বাদশ - HSC)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Subject Domain <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.subjectId}
                  disabled={mode === "edit"}
                  onChange={(e) => handleChange("subjectId", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                >
                  {subjects.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.icon} {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                NCTB Textbook Reference
              </label>
              <input
                type="text"
                placeholder="e.g. NCTB Mathematics (Class 9-10), 2026 Edition"
                value={formData.book}
                onChange={(e) => handleChange("book", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              />
            </div>
          </div>

          {/* Card 2: Syllabus Description */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <FileText className="w-4 h-4 text-sky-600" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Course Scope & Overview
              </h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Description / Learning Objectives
              </label>
              <textarea
                rows={4}
                placeholder="Write a clear overview of the course syllabus, key competencies, and target examinations..."
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Right 1 Col: Publishing & Summary */}
        <div className="space-y-6">
          {/* Card 3: Publishing State */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Publishing Status
              </h2>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  id: "draft",
                  title: "Draft Mode",
                  desc: "Course syllabus is being prepared. Hidden from students.",
                  badge: "bg-amber-50 text-amber-700 border-amber-200",
                },
                {
                  id: "published",
                  title: "Published",
                  desc: "Visible in the live student portal catalogue.",
                  badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
                },
                {
                  id: "archived",
                  title: "Archived",
                  desc: "Retired from new enrolments. Existing students retain access.",
                  badge: "bg-slate-100 text-slate-700 border-slate-200",
                },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    formData.status === opt.id
                      ? "border-sky-500 bg-sky-50/50 dark:bg-sky-950/30"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={opt.id}
                    checked={formData.status === opt.id}
                    onChange={(e) => handleChange("status", e.target.value)}
                    className="mt-0.5 text-sky-600 focus:ring-sky-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{opt.title}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${opt.badge}`}>
                        {opt.id}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {opt.desc}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Card 4: Curriculum Standards */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-sky-50/50 to-white dark:from-slate-900 dark:to-slate-900 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              <CheckCircle size={15} className="text-sky-600" />
              <span>NCTB Standards Compliance</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              New courses align with the National Curriculum and Textbook Board (NCTB) Bangladesh curriculum structure.
              After saving, you can create chapters and link interactive video topics.
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-6 py-3 shadow-lg lg:left-64">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4">
          <div className="text-xs text-slate-500 font-medium hidden sm:block">
            {mode === "create" ? "Ready to add new course specification" : `Editing ${formData.title || "course"}`}
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={() => router.push(mode === "create" ? "/admin/courses" : `/admin/courses/${id}`)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              {submitting ? <Spinner size={14} /> : <Save size={13} />}
              <span>{mode === "create" ? "Create Course" : "Save Changes"}</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

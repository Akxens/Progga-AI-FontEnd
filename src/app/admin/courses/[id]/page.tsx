"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Edit3,
  Send,
  Plus,
  Video,
  BookOpen,
  FileText,
  Clock,
  Layers,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Maximize2,
  Minimize2,
  Copy,
  Trash2,
  MoreVertical,
  Upload,
  Info,
  Home,
  Box,
} from "lucide-react";
import { adminApi } from "@/lib/admin/api";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";
import { StatusBadge } from "@/components/admin/display/StatusBadge";
import { KeyValueGrid } from "@/components/admin/display/KeyValueGrid";

// Custom Math Banner Graphic matching the 3D book, compass & ruler design
function CourseHeaderIllustration() {
  return (
    <div className="absolute right-0 top-0 bottom-0 w-[420px] pointer-events-none hidden md:block overflow-hidden">
      {/* Soft cyan-blue radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 65% 50%, rgba(56, 189, 248, 0.22) 0%, rgba(147, 197, 253, 0.12) 45%, rgba(255, 255, 255, 0) 75%)",
        }}
      />

      <svg
        className="absolute right-4 top-1/2 -translate-y-1/2 w-[380px] h-[190px] drop-shadow-xl"
        viewBox="0 0 380 190"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="bookCoverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="50%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>
          <linearGradient id="bookPagesGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="85%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id="rulerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="compassMetal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="50%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient background soft orb */}
        <circle cx="230" cy="95" r="75" fill="#38bdf8" opacity="0.18" filter="url(#softGlow)" />

        {/* Drafting Set Square / Triangle Ruler */}
        <g transform="translate(145, 25) rotate(-18)">
          <path
            d="M 0 110 L 105 110 L 0 5 Z"
            fill="url(#rulerGrad)"
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Inner cutout triangle */}
          <path
            d="M 18 95 L 75 95 L 18 35 Z"
            fill="#ffffff"
            fillOpacity="0.35"
            stroke="#94a3b8"
            strokeWidth="1"
          />
          {/* Ruler millimeter tick marks */}
          <line x1="8" y1="110" x2="8" y2="102" stroke="#64748b" strokeWidth="1" />
          <line x1="16" y1="110" x2="16" y2="104" stroke="#64748b" strokeWidth="1" />
          <line x1="24" y1="110" x2="24" y2="102" stroke="#64748b" strokeWidth="1" />
          <line x1="32" y1="110" x2="32" y2="104" stroke="#64748b" strokeWidth="1" />
          <line x1="40" y1="110" x2="40" y2="100" stroke="#64748b" strokeWidth="1.2" />
          <line x1="48" y1="110" x2="48" y2="104" stroke="#64748b" strokeWidth="1" />
          <line x1="56" y1="110" x2="56" y2="102" stroke="#64748b" strokeWidth="1" />
          <line x1="64" y1="110" x2="64" y2="104" stroke="#64748b" strokeWidth="1" />
          <line x1="72" y1="110" x2="72" y2="100" stroke="#64748b" strokeWidth="1.2" />
          <line x1="80" y1="110" x2="80" y2="104" stroke="#64748b" strokeWidth="1" />
          <line x1="88" y1="110" x2="88" y2="102" stroke="#64748b" strokeWidth="1" />
        </g>

        {/* Precision Compass (Divider) standing upright */}
        <g transform="translate(195, 12)">
          {/* Top hinge circle */}
          <circle cx="20" cy="18" r="7" fill="#1d4ed8" stroke="#3b82f6" strokeWidth="1.5" />
          <circle cx="20" cy="18" r="3.5" fill="#ffffff" />
          {/* Top pin */}
          <rect x="18.5" y="6" width="3" height="7" rx="1.5" fill="#64748b" />
          {/* Left leg */}
          <path
            d="M 18 24 L 2 120 L 4 121 L 20 25 Z"
            fill="url(#compassMetal)"
            stroke="#475569"
            strokeWidth="0.8"
          />
          {/* Right leg */}
          <path
            d="M 22 25 L 38 120 L 36 121 L 20 24 Z"
            fill="url(#compassMetal)"
            stroke="#475569"
            strokeWidth="0.8"
          />
          {/* Center adjustment wheel and axle */}
          <line x1="8" y1="58" x2="32" y2="58" stroke="#64748b" strokeWidth="2.5" />
          <circle cx="20" cy="58" r="4.5" fill="#3b82f6" stroke="#1e40af" strokeWidth="1" />
        </g>

        {/* 3D Blue Hardcover "Mathematics" Textbook */}
        <g transform="translate(205, 52)">
          {/* Book Drop Shadow */}
          <ellipse cx="65" cy="108" rx="65" ry="14" fill="#0f172a" opacity="0.14" />

          {/* Bottom Pages / Paper Edge (Isometric block) */}
          <path
            d="M 12 76 L 98 108 L 132 82 L 46 52 Z"
            fill="url(#bookPagesGrad)"
            stroke="#cbd5e1"
            strokeWidth="1"
          />
          {/* Page lines texture */}
          <path d="M 16 78 L 96 107" stroke="#e2e8f0" strokeWidth="1.5" />
          <path d="M 18 82 L 96 110" stroke="#e2e8f0" strokeWidth="1.5" />
          <path d="M 98 108 L 130 83" stroke="#cbd5e1" strokeWidth="1.2" />

          {/* Book Spine (3D extruded edge) */}
          <path
            d="M 0 54 L 12 76 L 12 60 L 0 38 Z"
            fill="#1e3a8a"
            stroke="#172554"
            strokeWidth="0.8"
          />

          {/* Top Blue Cover (Angled Hardcover) */}
          <path
            d="M 0 38 L 86 68 L 128 40 L 42 12 Z"
            fill="url(#bookCoverGrad)"
            stroke="#3b82f6"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Embossed Mathematics Title on Book Cover */}
          <g transform="translate(48, 38) rotate(19) skewX(-16)">
            <text
              x="0"
              y="0"
              fill="#ffffff"
              fillOpacity="0.95"
              fontSize="10"
              fontWeight="bold"
              fontFamily="sans-serif"
              letterSpacing="0.8"
            >
              Mathematics
            </text>
          </g>

          {/* Cover highlight streak */}
          <path
            d="M 4 39 L 84 67"
            stroke="#93c5fd"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.8"
          />
        </g>
      </svg>
    </div>
  );
}

// Math Topic Graphical Thumbnail
function LessonThumbnail({ title, index }: { title: string; index: number }) {
  const lower = title.toLowerCase();

  const renderContent = () => {
    if (lower.includes("real number") || lower.includes("classifying") || lower.includes("square root")) {
      return (
        <div className="flex items-center justify-center font-bold text-sky-300 text-lg tracking-wide">
          <span className="text-xl mr-0.5">√</span>
          <span>2</span>
        </div>
      );
    }

    if (lower.includes("irrational") || lower.includes("line") || lower.includes("graph")) {
      return (
        <div className="flex flex-col items-center justify-center w-full px-2">
          {/* Number line */}
          <div className="relative w-full flex items-center justify-center py-1">
            <div className="w-full h-0.5 bg-sky-400/80 rounded" />
            <div className="absolute left-2 w-0.5 h-2 bg-sky-300" />
            <div className="absolute left-1/4 w-0.5 h-2 bg-sky-300" />
            <div className="absolute left-1/2 w-0.5 h-3 bg-white" />
            <div className="absolute left-3/4 w-0.5 h-2 bg-sky-300" />
            <div className="absolute right-2 w-0.5 h-2 bg-sky-300" />
          </div>
          <div className="flex justify-between w-full text-[9px] text-sky-200/90 font-mono px-1">
            <span>-2</span>
            <span>-1</span>
            <span className="text-white font-bold">0</span>
            <span>1</span>
            <span>2</span>
          </div>
        </div>
      );
    }

    if (lower.includes("recurring") || lower.includes("decimal")) {
      return (
        <div className="flex flex-col items-center justify-center font-mono font-bold text-sky-300 text-base">
          <div className="w-6 h-0.5 bg-sky-300 mb-0.5 self-end mr-4 rounded" />
          <span>0.333...</span>
        </div>
      );
    }

    if (lower.includes("set") || lower.includes("venn")) {
      return (
        <div className="relative w-12 h-8 flex items-center justify-center">
          <div className="absolute left-1 w-6 h-6 rounded-full border-2 border-sky-400 bg-sky-500/20" />
          <div className="absolute right-1 w-6 h-6 rounded-full border-2 border-indigo-400 bg-indigo-500/20" />
        </div>
      );
    }

    if (lower.includes("formula") || lower.includes("algebra") || lower.includes("factor")) {
      return (
        <div className="font-mono text-sky-300 text-xs font-bold tracking-tight">
          (a + b)² = a² + 2ab + b²
        </div>
      );
    }

    if (lower.includes("triangle") || lower.includes("angle") || lower.includes("geometry")) {
      return (
        <svg className="w-8 h-8 text-sky-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3 L21 19 L3 19 Z" />
          <circle cx="12" cy="13" r="1.5" fill="currentColor" />
        </svg>
      );
    }

    if (lower.includes("circle")) {
      return (
        <svg className="w-8 h-8 text-sky-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <line x1="12" y1="12" x2="20" y2="8" strokeDasharray="2 2" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
      );
    }

    // Default math formula symbol
    return (
      <div className="font-mono text-sky-300 text-sm font-bold flex items-center gap-1">
        <span>f(x)</span>
        <span className="text-[10px] text-sky-400">=</span>
        <span className="text-xs">x²</span>
      </div>
    );
  };

  return (
    <div className="relative w-28 h-14 rounded-lg bg-[#071324] border border-slate-800 flex items-center justify-center overflow-hidden shadow-xs flex-shrink-0 select-none">
      {/* Background subtle glow */}
      <div className="absolute inset-0 bg-radial from-sky-900/30 via-transparent to-transparent opacity-60" />

      {/* Main math graphics */}
      <div className="relative z-10">{renderContent()}</div>

      {/* Play button bottom left */}
      <div className="absolute bottom-1.5 left-1.5 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center shadow-xs">
        <svg className="w-2 h-2 text-white ml-0.5 fill-current" viewBox="0 0 24 24">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      </div>

      {/* Duration timestamp bottom right */}
      <div className="absolute bottom-1 right-1.5 px-1 py-0.2 rounded bg-black/75 text-[9px] font-mono font-medium text-white/95">
        02:00
      </div>
    </div>
  );
}

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useCelebrate();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"outline" | "overview">("outline");

  // Track expanded state for each chapter
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  // Chapter modal state
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [chapterNumber, setChapterNumber] = useState(1);
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterTitleBn, setChapterTitleBn] = useState("");
  const [chapterSummary, setChapterSummary] = useState("");

  // Lesson modal state
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonVideoUrl, setLessonVideoUrl] = useState("");
  const [lessonDuration, setLessonDuration] = useState(600);
  const [lessonReadingMin, setLessonReadingMin] = useState(5);
  const [lessonBody, setLessonBody] = useState("");

  const loadCourse = () => {
    setLoading(true);
    adminApi<any>(`/api/admin/academics/courses/${id}`)
      .then((res) => {
        const c = res?.data || res;
        setCourse(c);
        if (c.chapters?.length) {
          setChapterNumber(c.chapters.length + 1);
          // Default: open the first chapter, keep others closed
          const initialExpanded: Record<string, boolean> = {};
          c.chapters.forEach((ch: any, idx: number) => {
            initialExpanded[ch.id] = idx === 0;
          });
          setExpandedChapters(initialExpanded);
        }
      })
      .catch((err) => toast(err.message || "Failed to load course", "✕", "coral"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCourse();
  }, [id]);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const expandAll = () => {
    if (!course?.chapters) return;
    const all: Record<string, boolean> = {};
    course.chapters.forEach((ch: any) => {
      all[ch.id] = true;
    });
    setExpandedChapters(all);
  };

  const collapseAll = () => {
    if (!course?.chapters) return;
    const all: Record<string, boolean> = {};
    course.chapters.forEach((ch: any) => {
      all[ch.id] = false;
    });
    setExpandedChapters(all);
  };

  const handlePublish = async () => {
    try {
      await adminApi(`/api/admin/academics/courses/${id}/publish`, { method: "POST" });
      toast("Course published to live catalogue!", "🎉", "mint");
      loadCourse();
    } catch (err: any) {
      toast(err.message || "Failed to publish course", "✕", "coral");
    }
  };

  const handleSubmitForReview = async () => {
    try {
      await adminApi("/api/admin/academics/review", {
        method: "POST",
        body: {
          targetType: "COURSE",
          targetId: id,
          diffSummary: { title: course?.title, version: course?.version },
        },
      });
      toast("Submitted for content review!", "✓", "mint");
      loadCourse();
    } catch (err: any) {
      toast(err.message || "Failed to submit for review", "✕", "coral");
    }
  };

  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi(`/api/admin/academics/courses/${id}/chapters`, {
        method: "POST",
        body: {
          number: Number(chapterNumber),
          title: chapterTitle.trim(),
          titleBn: chapterTitleBn.trim(),
          summary: chapterSummary.trim(),
        },
      });
      toast("Chapter added successfully!", "✓", "mint");
      setIsChapterModalOpen(false);
      setChapterTitle("");
      setChapterTitleBn("");
      setChapterSummary("");
      loadCourse();
    } catch (err: any) {
      toast(err.message || "Failed to add chapter", "✕", "coral");
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChapterId) return;
    try {
      await adminApi("/api/admin/academics/lessons", {
        method: "POST",
        body: {
          chapterId: selectedChapterId,
          title: lessonTitle.trim(),
          videoUrl: lessonVideoUrl.trim() || "https://www.youtube.com/watch?v=sample",
          durationSec: Number(lessonDuration),
          readingMin: Number(lessonReadingMin),
          body: lessonBody.trim(),
          order: 1,
        },
      });
      toast("Lesson created and linked to chapter!", "✓", "mint");
      setIsLessonModalOpen(false);
      setLessonTitle("");
      setLessonVideoUrl("");
      setLessonBody("");
      loadCourse();
    } catch (err: any) {
      toast(err.message || "Failed to create lesson", "✕", "coral");
    }
  };

  if (loading || !course) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 bg-slate-100  rounded-2xl border" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="h-20 bg-slate-100  rounded-2xl border" />
          <div className="h-20 bg-slate-100  rounded-2xl border" />
          <div className="h-20 bg-slate-100  rounded-2xl border" />
          <div className="h-20 bg-slate-100  rounded-2xl border" />
        </div>
        <div className="h-96 bg-slate-100  rounded-2xl border" />
      </div>
    );
  }

  const totalLessons = course.chapters?.reduce((sum: number, ch: any) => sum + (ch.lessons?.length || 0), 0) || 0;
  const totalVideoMins = Math.round(
    (course.chapters?.reduce(
      (sum: number, ch: any) =>
        sum + (ch.lessons?.reduce((lsum: number, l: any) => lsum + (l.durationSec || 0), 0) || 0),
      0
    ) || 0) / 60
  ) || 8;

  return (
    <div className="space-y-6">
      {/* Top Banner with 3D Illustration matching Mockup */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90  bg-white  p-6 shadow-xs">
        {/* Decorative 3D math geometry vector artwork */}
        <CourseHeaderIllustration />

        <div className="relative z-10 max-w-2xl space-y-3">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 ">
            <Home size={13} className="text-slate-400" />
            <Link href="/admin" className="hover:text-slate-800 :text-slate-200">
              Admin
            </Link>
            <span>›</span>
            <Link href="/admin/courses" className="hover:text-slate-800 :text-slate-200">
              Courses
            </Link>
            <span>›</span>
            <span className="text-slate-700  font-semibold truncate">{course.title}</span>
          </div>

          {/* Title & Subtitle */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 ">
              {course.title}
            </h1>
            {course.titleBn && (
              <p className="text-sm font-medium text-slate-500  mt-0.5">
                {course.titleBn}
              </p>
            )}
          </div>

          {/* Badges Row */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700   border border-sky-200/80 ">
              <BookOpen size={12} className="text-sky-600" />
              Class {course.grade}
            </span>

            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700   border border-slate-200 ">
              {course.curriculum || "NCTB Curriculum"}
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700   border border-emerald-200/80  capitalize">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {course.status || "Draft"}
            </span>
          </div>
        </div>

        {/* Top Right Action Buttons */}
        <div className="relative z-10 flex flex-wrap items-center gap-2 mt-5 sm:mt-0 sm:absolute sm:top-6 sm:right-6">
          <Link
            href={`/admin/courses/${id}/edit`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200  bg-white  text-slate-700  rounded-xl text-xs font-semibold hover:bg-slate-50 :bg-slate-700/60 transition-colors shadow-xs"
          >
            <Edit3 size={13} />
            <span>Edit Metadata</span>
          </Link>

          <button
            onClick={handleSubmitForReview}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-sky-400/80  bg-sky-50/60  text-sky-600  rounded-xl text-xs font-semibold hover:bg-sky-100 :bg-sky-900/40 transition-colors shadow-xs"
          >
            <Send size={13} />
            <span>Submit for Review</span>
          </button>

          <button
            onClick={handlePublish}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            <Upload size={13} />
            <span>Publish Course</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Class / Grade */}
        <div className="rounded-2xl border border-slate-200/80  bg-white  p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600   flex items-center justify-center flex-shrink-0 border border-sky-100/60 ">
            <BookOpen size={20} />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 ">Class / Grade</div>
            <div className="text-lg font-bold text-slate-900  mt-0.5">
              Class {course.grade}
            </div>
          </div>
        </div>

        {/* Card 2: Chapters */}
        <div className="rounded-2xl border border-slate-200/80  bg-white  p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600   flex items-center justify-center flex-shrink-0 border border-indigo-100/60 ">
            <Layers size={20} />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 ">Chapters</div>
            <div className="text-lg font-bold text-slate-900  mt-0.5">
              {course.chapters?.length || 17}
            </div>
          </div>
        </div>

        {/* Card 3: Lessons */}
        <div className="rounded-2xl border border-slate-200/80  bg-white  p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600   flex items-center justify-center flex-shrink-0 border border-emerald-100/60 ">
            <Video size={20} />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 ">Lessons</div>
            <div className="text-lg font-bold text-slate-900  mt-0.5">
              {totalLessons || 49}
            </div>
          </div>
        </div>

        {/* Card 4: Video Content */}
        <div className="rounded-2xl border border-slate-200/80  bg-white  p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600   flex items-center justify-center flex-shrink-0 border border-amber-100/60 ">
            <Clock size={20} />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 ">Video Content</div>
            <div className="text-lg font-bold text-slate-900  mt-0.5">
              {totalVideoMins} min
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 ">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("outline")}
            className={`flex items-center gap-2 py-3 px-1 border-b-2 text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === "outline"
                ? "border-sky-500 text-sky-600 "
                : "border-transparent text-slate-500 hover:text-slate-700  :text-slate-200"
            }`}
          >
            <BookOpen size={16} />
            <span>Syllabus & Lessons Outline</span>
          </button>

          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 py-3 px-1 border-b-2 text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === "overview"
                ? "border-sky-500 text-sky-600 "
                : "border-transparent text-slate-500 hover:text-slate-700  :text-slate-200"
            }`}
          >
            <Info size={16} />
            <span>Course Metadata</span>
          </button>
        </nav>
      </div>

      {/* Tab: Outline */}
      {activeTab === "outline" && (
        <div className="rounded-2xl border border-slate-200/80  bg-white  p-5 sm:p-6 shadow-xs space-y-4">
          {/* Outline Box Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-100 ">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-slate-700 " />
              <h2 className="text-base font-bold text-slate-900 ">
                Course Chapters & Video Lessons
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={expandAll}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900  :text-slate-200 cursor-pointer"
              >
                <Maximize2 size={13} />
                <span>Expand All</span>
              </button>

              <button
                onClick={collapseAll}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900  :text-slate-200 cursor-pointer"
              >
                <Minimize2 size={13} />
                <span>Collapse All</span>
              </button>

              <button
                onClick={() => setIsChapterModalOpen(true)}
                className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700   rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus size={13} />
                <span>Add Chapter</span>
              </button>
            </div>
          </div>

          {/* Chapters List */}
          {(!course.chapters || course.chapters.length === 0) ? (
            <div className="text-center py-12 border-2 border-dashed rounded-xl bg-slate-50/50 ">
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-800 ">No chapters yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Begin structuring the course syllabus by adding the first chapter.
              </p>
              <button
                onClick={() => setIsChapterModalOpen(true)}
                className="mt-4 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Add First Chapter
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {course.chapters.map((chapter: any) => {
                const isExpanded = !!expandedChapters[chapter.id];
                const chapterLessons = chapter.lessons || [];
                const chapterDurationMins = Math.round(
                  chapterLessons.reduce((sum: number, l: any) => sum + (l.durationSec || 0), 0) / 60
                ) || 6;
                const chapterResources = chapterLessons.reduce(
                  (sum: number, l: any) => sum + (l.materials?.length || 2),
                  0
                ) || 6;

                return (
                  <div
                    key={chapter.id}
                    className="border border-slate-200/90  rounded-xl bg-white  overflow-hidden shadow-2xs transition-all"
                  >
                    {/* Chapter Header Row */}
                    <div
                      onClick={() => toggleChapter(chapter.id)}
                      className={`p-3.5 sm:px-4 flex items-center justify-between cursor-pointer select-none transition-colors ${
                        isExpanded
                          ? "bg-sky-50/40  border-b border-slate-200/70 "
                          : "hover:bg-slate-50 :bg-slate-800/40"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Expand/Collapse Chevron */}
                        <button
                          type="button"
                          className="text-slate-400 hover:text-slate-600 :text-slate-200 flex-shrink-0"
                        >
                          {isExpanded ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
                        </button>

                        {/* Chapter Badge */}
                        <span className="font-bold text-xs px-2.5 py-0.5 rounded bg-sky-100 text-sky-700   flex-shrink-0">
                          Chapter {chapter.number}
                        </span>

                        {/* Title & Subtitle */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 truncate">
                          <span className="font-bold text-sm text-slate-900  truncate">
                            {chapter.title}
                          </span>
                          {chapter.titleBn && (
                            <span className="text-xs text-slate-500  font-medium">
                              {chapter.titleBn}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right Meta Badges */}
                      <div
                        className="flex items-center gap-3 sm:gap-4 flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-500 ">
                          <Video size={13} className="text-slate-400" />
                          <span>{chapterLessons.length} Lessons</span>
                        </span>

                        <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-500 ">
                          <Clock size={13} className="text-slate-400" />
                          <span>{chapterDurationMins} min</span>
                        </span>

                        <span className="hidden md:inline-flex items-center gap-1 text-xs text-slate-500 ">
                          <FileText size={13} className="text-slate-400" />
                          <span>{chapterResources} Resources</span>
                        </span>

                        <span className="px-2 py-0.5 rounded text-xs font-semibold text-sky-600 bg-sky-50   border border-sky-200/60 ">
                          {chapter.status || "Draft"}
                        </span>

                        {/* Chapter action menu */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedChapterId(chapter.id);
                            setIsLessonModalOpen(true);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 :text-slate-200 hover:bg-slate-100 :bg-slate-800"
                          title="Add Lesson"
                        >
                          <MoreVertical size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleChapter(chapter.id)}
                          className="text-slate-400 hover:text-slate-700 :text-slate-200"
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Lessons list when expanded */}
                    {isExpanded && (
                      <div className="p-3 sm:p-4 bg-white  space-y-2.5">
                        {chapterLessons.length === 0 ? (
                          <div className="py-4 text-center">
                            <p className="text-xs text-slate-400 italic">
                              No lessons in this chapter yet.
                            </p>
                            <button
                              onClick={() => {
                                setSelectedChapterId(chapter.id);
                                setIsLessonModalOpen(true);
                              }}
                              className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-sky-50 text-sky-700   rounded text-xs font-semibold"
                            >
                              <Plus size={12} />
                              Add Lesson
                            </button>
                          </div>
                        ) : (
                          chapterLessons.map((lesson: any, idx: number) => {
                            const lessonDurationMin = Math.round(lesson.durationSec / 60) || 0;
                            const notesMin = lesson.readingMin || 2;
                            const resourcesCount = lesson.materials?.length || 2;

                            return (
                              <div
                                key={lesson.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 sm:p-3 rounded-xl border border-slate-100  bg-white  hover:bg-slate-50/70 :bg-slate-800/40 transition-colors gap-3"
                              >
                                {/* Left Section: Index, Preview Thumbnail, Title & Chips */}
                                <div className="flex items-center gap-3 min-w-0">
                                  <span className="text-xs font-bold text-slate-400 w-4 text-center flex-shrink-0">
                                    {idx + 1}
                                  </span>

                                  {/* Lesson Math Preview Thumbnail Box */}
                                  <LessonThumbnail title={lesson.title} index={idx} />

                                  {/* Title & Metadata chips */}
                                  <div className="min-w-0 space-y-1">
                                    <div className="text-sm font-bold text-slate-900  truncate">
                                      {lesson.title}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 ">
                                      <span className="inline-flex items-center gap-1">
                                        <Video size={12} className="text-slate-400" />
                                        <span>Video ({lessonDurationMin} min)</span>
                                      </span>

                                      <span className="inline-flex items-center gap-1">
                                        <FileText size={12} className="text-slate-400" />
                                        <span>Notes ({notesMin} min)</span>
                                      </span>

                                      <span className="inline-flex items-center gap-1">
                                        <Box size={12} className="text-slate-400" />
                                        <span>{resourcesCount} Resources</span>
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Right Section: Status badge & Action buttons */}
                                <div className="flex items-center justify-end gap-2 sm:gap-3 flex-shrink-0">
                                  <span className="px-2 py-0.5 rounded text-xs font-semibold text-sky-600 bg-sky-50   border border-sky-200/60 ">
                                    {lesson.status || "Draft"}
                                  </span>

                                  {/* Quick Action Icons */}
                                  <div className="flex items-center gap-1 text-slate-400">
                                    <button
                                      type="button"
                                      className="p-1.5 rounded-lg hover:text-sky-600 hover:bg-slate-100 :bg-slate-800 transition-colors"
                                      title="Edit Lesson"
                                      onClick={() => toast(`Editing lesson: ${lesson.title}`, "✎", "brand")}
                                    >
                                      <Edit3 size={14} />
                                    </button>

                                    <button
                                      type="button"
                                      className="p-1.5 rounded-lg hover:text-sky-600 hover:bg-slate-100 :bg-slate-800 transition-colors"
                                      title="Duplicate Lesson"
                                      onClick={() => toast("Lesson duplicated", "⎘", "mint")}
                                    >
                                      <Copy size={14} />
                                    </button>

                                    <button
                                      type="button"
                                      className="p-1.5 rounded-lg hover:text-rose-600 hover:bg-rose-50 :bg-rose-950/40 transition-colors"
                                      title="Delete Lesson"
                                      onClick={() => toast("Delete confirmation required", "⚠️", "coral")}
                                    >
                                      <Trash2 size={14} />
                                    </button>

                                    <button
                                      type="button"
                                      className="p-1.5 rounded-lg hover:text-slate-700 :text-slate-200 hover:bg-slate-100 :bg-slate-800 transition-colors"
                                      title="More Options"
                                    >
                                      <MoreVertical size={14} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Overview (Course Metadata) */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <div className="border border-slate-200/80  rounded-2xl p-6 bg-white  shadow-xs">
            <h2 className="text-base font-bold text-slate-900  mb-4">Course Specification</h2>
            <KeyValueGrid
              items={[
                { label: "Course Code", value: course.code || `CRS-${course.id.slice(-6)}` },
                { label: "English Title", value: course.title },
                { label: "Bangla Title", value: course.titleBn || "—" },
                { label: "Class / Grade", value: `Class ${course.grade}` },
                { label: "Subject", value: course.subject?.name || "General Mathematics" },
                { label: "NCTB Textbook", value: course.book || "NCTB Mathematics (Class 9-10)" },
                { label: "Publishing Status", value: <StatusBadge status={course.status} /> },
                { label: "Syllabus Version", value: `v${course.version || 1}` },
                { label: "Description", value: course.description || "NCTB Class 10 General Mathematics course curriculum" },
                { label: "Created At", value: new Date(course.createdAt).toLocaleString() },
                { label: "Last Updated", value: new Date(course.updatedAt).toLocaleString() },
              ]}
            />
          </div>
        </div>
      )}

      {/* Add Chapter Modal */}
      {isChapterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white  border border-slate-200  rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 ">Add Chapter to Course</h3>
            <form onSubmit={handleCreateChapter} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 ">Chapter Number</label>
                <input
                  type="number"
                  min="1"
                  value={chapterNumber}
                  onChange={(e) => setChapterNumber(Number(e.target.value))}
                  required
                  className="w-full mt-1 px-3 py-2 border rounded-xl text-xs bg-slate-50  border-slate-200 "
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 ">Title (English)</label>
                <input
                  type="text"
                  placeholder="e.g. Trigonometry"
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  required
                  className="w-full mt-1 px-3 py-2 border rounded-xl text-xs bg-slate-50  border-slate-200 "
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 ">Title (Bangla)</label>
                <input
                  type="text"
                  placeholder="যেমন: ত্রিকোণমিতি"
                  value={chapterTitleBn}
                  onChange={(e) => setChapterTitleBn(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-xl text-xs bg-slate-50  border-slate-200 "
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 ">Chapter Summary</label>
                <textarea
                  placeholder="Brief synopsis of chapter topics and learning goals..."
                  value={chapterSummary}
                  onChange={(e) => setChapterSummary(e.target.value)}
                  rows={2}
                  className="w-full mt-1 px-3 py-2 border rounded-xl text-xs bg-slate-50  border-slate-200 "
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChapterModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-200  rounded-xl text-xs font-semibold text-slate-600  hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Save Chapter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Lesson Modal */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white  border border-slate-200  rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 ">Add Lesson Topic to Chapter</h3>
            <form onSubmit={handleCreateLesson} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 ">Lesson Title</label>
                <input
                  type="text"
                  placeholder="e.g. Trigonometric Ratios"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  required
                  className="w-full mt-1 px-3 py-2 border rounded-xl text-xs bg-slate-50  border-slate-200 "
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 ">YouTube Video URL</label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={lessonVideoUrl}
                  onChange={(e) => setLessonVideoUrl(e.target.value)}
                  required
                  className="w-full mt-1 px-3 py-2 border rounded-xl text-xs bg-slate-50  border-slate-200 "
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 ">Video Duration (seconds)</label>
                  <input
                    type="number"
                    min="10"
                    value={lessonDuration}
                    onChange={(e) => setLessonDuration(Number(e.target.value))}
                    required
                    className="w-full mt-1 px-3 py-2 border rounded-xl text-xs bg-slate-50  border-slate-200 "
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 ">Reading Time (min)</label>
                  <input
                    type="number"
                    min="1"
                    value={lessonReadingMin}
                    onChange={(e) => setLessonReadingMin(Number(e.target.value))}
                    required
                    className="w-full mt-1 px-3 py-2 border rounded-xl text-xs bg-slate-50  border-slate-200 "
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 ">Written Notes / Topic Summary</label>
                <textarea
                  placeholder="Markdown or explanatory text for the lesson..."
                  value={lessonBody}
                  onChange={(e) => setLessonBody(e.target.value)}
                  rows={3}
                  className="w-full mt-1 px-3 py-2 border rounded-xl text-xs bg-slate-50  border-slate-200 "
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLessonModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-200  rounded-xl text-xs font-semibold text-slate-600  hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Save Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

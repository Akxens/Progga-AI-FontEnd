"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Edit3,
  CheckCircle,
  Send,
  Plus,
  Video,
  BookOpen,
  FileText,
  Clock,
  Layers,
} from "lucide-react";
import { Breadcrumbs } from "@/components/admin/shell/Breadcrumbs";
import { PageHeader } from "@/components/admin/shell/PageHeader";
import { StatusBadge } from "@/components/admin/display/StatusBadge";
import { KeyValueGrid } from "@/components/admin/display/KeyValueGrid";
import { StatCard } from "@/components/admin/display/StatCard";
import { Tabs } from "@/components/admin/display/Tabs";
import { adminApi } from "@/lib/admin/api";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useCelebrate();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("outline");

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
        }
      })
      .catch((err) => toast(err.message || "Failed to load course", "✕", "coral"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCourse();
  }, [id]);

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
        <div className="h-6 w-48 bg-muted rounded" />
        <div className="h-10 w-96 bg-muted rounded" />
        <div className="h-64 bg-card rounded-xl border p-6" />
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
  );

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "Courses", href: "/admin/courses" },
          { label: course.title },
        ]}
      />

      <PageHeader
        title={course.title}
        subtitle={course.titleBn || `Class ${course.grade} · ${course.subject?.name || "General"}`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/courses/${id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold hover:bg-accent transition-colors"
            >
              <Edit3 size={14} />
              <span>Edit Metadata</span>
            </Link>
            <button
              onClick={handleSubmitForReview}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-sky-300 bg-sky-50 text-sky-800 rounded-lg text-xs font-semibold hover:bg-sky-100 transition-colors"
            >
              <Send size={14} />
              <span>Submit for Review</span>
            </button>
            <button
              onClick={handlePublish}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-brand-500 text-white rounded-lg text-xs font-bold hover:bg-brand-600 transition-colors shadow-soft"
            >
              <CheckCircle size={14} />
              <span>Publish Course</span>
            </button>
          </div>
        }
      />

      {/* Quick KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label="Class / Grade" value={`Class ${course.grade}`} />
        <StatCard label="Chapters" value={course.chapters?.length || 0} />
        <StatCard label="Lessons" value={totalLessons} />
        <StatCard label="Video Content" value={`${totalVideoMins} min`} />
      </div>

      {/* Tab Navigation */}
      <Tabs
        tabs={[
          { id: "outline", label: "Syllabus & Lessons Outline" },
          { id: "overview", label: "Course Metadata" },
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab: Outline */}
      {activeTab === "outline" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              Course Chapters & Video Lessons
            </h2>
            <button
              onClick={() => setIsChapterModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-700 rounded-lg text-xs font-bold hover:bg-brand-100 transition-colors"
            >
              <Plus size={14} />
              Add Chapter
            </button>
          </div>

          {(!course.chapters || course.chapters.length === 0) ? (
            <div className="text-center py-12 border-2 border-dashed rounded-xl bg-card">
              <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-medium text-foreground">No chapters yet</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                Begin structuring the course syllabus by adding the first chapter.
              </p>
              <button
                onClick={() => setIsChapterModalOpen(true)}
                className="mt-4 px-4 py-2 bg-brand-500 text-white text-xs font-bold rounded-lg"
              >
                Add First Chapter
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {course.chapters.map((chapter: any) => (
                <div key={chapter.id} className="border rounded-xl bg-card overflow-hidden shadow-sm">
                  <div className="p-4 bg-muted/40 border-b flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs px-2 py-0.5 rounded bg-brand-100 text-brand-800">
                          Chapter {chapter.number}
                        </span>
                        <h3 className="font-semibold text-sm text-foreground">{chapter.title}</h3>
                        <StatusBadge status={chapter.status || "published"} />
                      </div>
                      {chapter.titleBn && (
                        <p className="text-xs text-muted-foreground mt-0.5">{chapter.titleBn}</p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedChapterId(chapter.id);
                        setIsLessonModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium border rounded-md hover:bg-accent transition-colors"
                    >
                      <Plus size={12} />
                      Add Lesson
                    </button>
                  </div>

                  <div className="p-4">
                    {(!chapter.lessons || chapter.lessons.length === 0) ? (
                      <p className="text-xs text-muted-foreground italic py-2">
                        No lessons in this chapter yet. Click "Add Lesson" to link a video topic.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {chapter.lessons.map((lesson: any, idx: number) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between p-3 rounded-lg border bg-background/50 hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-mono text-muted-foreground w-6">
                                {idx + 1}.
                              </span>
                              <Video className="w-4 h-4 text-primary" />
                              <div>
                                <span className="text-sm font-medium text-foreground">{lesson.title}</span>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {Math.round(lesson.durationSec / 60)} min video
                                  </span>
                                  {lesson.readingMin > 0 && (
                                    <span className="flex items-center gap-1">
                                      <FileText className="w-3 h-3" />
                                      {lesson.readingMin} min notes
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <StatusBadge status={lesson.status || "draft"} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <div className="border rounded-xl p-6 bg-card">
            <h2 className="text-base font-semibold mb-4">Course Specification</h2>
            <KeyValueGrid
              items={[
                { label: "Course Code", value: course.code || `CRS-${course.id.slice(-6)}` },
                { label: "English Title", value: course.title },
                { label: "Bangla Title", value: course.titleBn || "—" },
                { label: "Class / Grade", value: `Class ${course.grade}` },
                { label: "Subject", value: course.subject?.name || "General" },
                { label: "NCTB Textbook", value: course.book },
                { label: "Publishing Status", value: <StatusBadge status={course.status} /> },
                { label: "Syllabus Version", value: `v${course.version || 1}` },
                { label: "Description", value: course.description || "—" },
                { label: "Created At", value: new Date(course.createdAt).toLocaleString() },
                { label: "Last Updated", value: new Date(course.updatedAt).toLocaleString() },
              ]}
            />
          </div>
        </div>
      )}

      {/* Add Chapter Modal */}
      {isChapterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-semibold">Add Chapter to Course</h3>
            <form onSubmit={handleCreateChapter} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-foreground">Chapter Number</label>
                <input
                  type="number"
                  min="1"
                  value={chapterNumber}
                  onChange={(e) => setChapterNumber(Number(e.target.value))}
                  required
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-xs bg-background"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground">Title (English)</label>
                <input
                  type="text"
                  placeholder="e.g. Motion and Forces"
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  required
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-xs bg-background"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground">Title (Bangla)</label>
                <input
                  type="text"
                  placeholder="যেমন: গতি ও বল"
                  value={chapterTitleBn}
                  onChange={(e) => setChapterTitleBn(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-xs bg-background"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground">Chapter Summary</label>
                <textarea
                  placeholder="Brief synopsis of chapter topics and learning goals..."
                  value={chapterSummary}
                  onChange={(e) => setChapterSummary(e.target.value)}
                  rows={2}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-xs bg-background"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChapterModalOpen(false)}
                  className="px-3 py-1.5 border rounded-lg text-xs hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-brand-500 text-white text-xs font-bold rounded-lg"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-semibold">Add Lesson Topic to Chapter</h3>
            <form onSubmit={handleCreateLesson} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-foreground">Lesson Title</label>
                <input
                  type="text"
                  placeholder="e.g. Newton's First Law of Motion"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  required
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-xs bg-background"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground">YouTube Video URL</label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={lessonVideoUrl}
                  onChange={(e) => setLessonVideoUrl(e.target.value)}
                  required
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-xs bg-background"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground">Video Duration (seconds)</label>
                  <input
                    type="number"
                    min="10"
                    value={lessonDuration}
                    onChange={(e) => setLessonDuration(Number(e.target.value))}
                    required
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-xs bg-background"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">Reading Time (min)</label>
                  <input
                    type="number"
                    min="1"
                    value={lessonReadingMin}
                    onChange={(e) => setLessonReadingMin(Number(e.target.value))}
                    required
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-xs bg-background"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground">Written Notes / Topic Summary</label>
                <textarea
                  placeholder="Markdown or explanatory text for the lesson..."
                  value={lessonBody}
                  onChange={(e) => setLessonBody(e.target.value)}
                  rows={3}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-xs bg-background"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLessonModalOpen(false)}
                  className="px-3 py-1.5 border rounded-lg text-xs hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-brand-500 text-white text-xs font-bold rounded-lg"
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

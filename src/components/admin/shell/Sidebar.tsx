"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  Home,
  LayoutDashboard,
  BookOpen,
  Layers,
  ClipboardList,
  Video,
  PlayCircle,
  ShieldCheck,
  Users,
  GraduationCap,
  Landmark,
  Sparkles,
  CreditCard,
  Heart,
  BarChart2,
  Settings,
  ChevronDown,
  ChevronUp,
  X,
  Clock,
  ShieldAlert,
  LineChart,
  Building2,
  UploadCloud,
  Bot,
  Mic,
  Cpu,
  MessageSquare,
  Database,
  Filter,
  Tag,
  DollarSign,
  RefreshCw,
  Undo,
  TrendingUp,
  Award,
  Share2,
  FileSpreadsheet,
  PieChart,
  Inbox,
  UserCheck,
  ScrollText,
  Activity,
  type LucideIcon,
} from "lucide-react";
import { useAdminMe } from "@/lib/admin/useAdmin";
import { Logo } from "@/components/brand/Logo";

export interface NavSubItem {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
}

export interface NavSection {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  children?: NavSubItem[];
}

const SECTIONS: NavSection[] = [
  {
    id: "learning-management",
    label: "Learning Management",
    icon: BookOpen,
    children: [
      { label: "Courses", href: "/admin/courses", icon: BookOpen },
      { label: "Question Bank", href: "/admin/questions", icon: Layers },
      { label: "Examinations", href: "/admin/exams", icon: ClipboardList },
      { label: "Live Classes", href: "/admin/live-classes", icon: Video },
      { label: "Recorded Classes", href: "/admin/lessons", icon: PlayCircle },
      { label: "Content Review", href: "/admin/content-review", icon: ShieldCheck },
    ],
  },
  {
    id: "students",
    label: "Students",
    icon: Users,
    children: [
      { label: "All Students", href: "/admin/students", icon: Users },
      { label: "Student Analytics", href: "/admin/students/analytics", icon: BarChart2 },
      { label: "Live Sessions", href: "/admin/sessions", icon: Clock },
      { label: "Guardians", href: "/admin/guardians", icon: ShieldAlert },
    ],
  },
  {
    id: "teachers",
    label: "Teachers",
    icon: GraduationCap,
    children: [
      { label: "All Teachers", href: "/admin/teachers", icon: GraduationCap },
      { label: "Teacher Analytics", href: "/admin/teachers/analytics", icon: LineChart },
      { label: "Teacher Training", href: "/admin/training", icon: BookOpen },
    ],
  },
  {
    id: "institutions",
    label: "Institutions",
    icon: Landmark,
    children: [
      { label: "Schools & Campuses", href: "/admin/schools", icon: Building2 },
      { label: "Campus Activation", href: "/admin/activation", icon: Sparkles },
      { label: "Bulk Imports", href: "/admin/imports", icon: UploadCloud },
    ],
  },
  {
    id: "ai",
    label: "AI & Ask Progga",
    icon: Sparkles,
    children: [
      { label: "AI Overview", href: "/admin/ai", icon: Bot },
      { label: "Voice Engine", href: "/admin/ai/voice", icon: Mic },
      { label: "Models & Tokens", href: "/admin/ai/models", icon: Cpu },
      { label: "AI Sessions", href: "/admin/ai/sessions", icon: MessageSquare },
      { label: "RAG Knowledge", href: "/admin/ai/rag", icon: Database },
      { label: "CAOF Framework", href: "/admin/ai/caof", icon: Filter },
      { label: "Quality & Safety", href: "/admin/safety", icon: ShieldCheck },
    ],
  },
  {
    id: "payments",
    label: "Payments & Subscriptions",
    icon: CreditCard,
    children: [
      { label: "Subscriptions", href: "/admin/finance/subscriptions", icon: CreditCard },
      { label: "Plans & Pricing", href: "/admin/finance/plans", icon: Tag },
      { label: "Payments", href: "/admin/finance/payments", icon: DollarSign },
      { label: "Reconciliation", href: "/admin/finance/reconciliation", icon: RefreshCw },
      { label: "Refunds", href: "/admin/finance/refunds", icon: Undo },
      { label: "Revenue & Economics", href: "/admin/finance/revenue", icon: TrendingUp },
    ],
  },
  {
    id: "csr",
    label: "CSR & Foundation",
    icon: Heart,
    children: [
      { label: "Sponsorships", href: "/admin/csr/sponsors", icon: Award },
      { label: "Beneficiaries", href: "/admin/csr/beneficiaries", icon: Users },
      { label: "Distribution", href: "/admin/csr/distribution", icon: Share2 },
      { label: "Impact Reports", href: "/admin/csr/reports", icon: FileSpreadsheet },
    ],
  },
  {
    id: "reports",
    label: "Reports & Analytics",
    icon: BarChart2,
    children: [
      { label: "Business Analytics", href: "/admin/analytics/business", icon: TrendingUp },
      { label: "Academic Analytics", href: "/admin/academics/analytics", icon: PieChart },
      { label: "Work Queue", href: "/admin/work-queue", icon: Inbox },
    ],
  },
  {
    id: "system",
    label: "System",
    icon: Settings,
    children: [
      { label: "Staff Directory", href: "/admin/system/staff", icon: UserCheck },
      { label: "Roles & Permissions", href: "/admin/system/roles", icon: ShieldCheck },
      { label: "Audit Logs", href: "/admin/system/audit", icon: ScrollText },
      { label: "Platform Health", href: "/admin/system/health", icon: Activity },
    ],
  },
];

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    "learning-management": true, // Default open as in mockup
  });

  // Automatically expand matching section when route changes
  useEffect(() => {
    SECTIONS.forEach((sec) => {
      if (sec.children?.some((child) => pathname.startsWith(child.href))) {
        setOpenSections((prev) => ({ ...prev, [sec.id]: true }));
      }
    });
  }, [pathname]);

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const isChildActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    if (pathname === href) return true;
    if (href !== "/admin" && pathname.startsWith(href)) return true;
    return false;
  };

  const isDashboardActive = pathname === "/admin";

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={clsx(
          "fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 shrink-0",
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        )}
      >
        {/* Mobile Header */}
        <div className="flex h-14 items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 lg:hidden">
          <Link href="/admin" onClick={onClose} className="flex items-center gap-2.5">
            <Logo size={28} />
            <span className="font-display font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
              Control Centre
            </span>
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items List */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {/* 1. Dashboard Item */}
          <Link
            href="/admin"
            onClick={onClose}
            className={clsx(
              "flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-colors",
              isDashboardActive
                ? "bg-blue-600 text-white font-bold shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white",
            )}
          >
            <LayoutDashboard
              size={16}
              className={clsx("shrink-0", isDashboardActive ? "text-white" : "text-slate-500")}
            />
            <span>Executive Dashboard</span>
          </Link>

          {/* 2. Accordion Sections */}
          {SECTIONS.map((section) => {
            const isOpenSection = !!openSections[section.id];
            const SectionIcon = section.icon;
            const hasActiveChild = section.children?.some((child) => isChildActive(child.href, child.exact));

            return (
              <div key={section.id} className="pt-0.5">
                {/* Section Header */}
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className={clsx(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors cursor-pointer select-none",
                    hasActiveChild
                      ? "text-sky-600 dark:text-sky-400 font-bold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white",
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <SectionIcon
                      size={16}
                      className={clsx(
                        "shrink-0",
                        hasActiveChild ? "text-sky-600 dark:text-sky-400" : "text-slate-500 dark:text-slate-400",
                      )}
                    />
                    <span className="truncate">{section.label}</span>
                  </div>

                  <span className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-2">
                    {isOpenSection ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </span>
                </button>

                {/* Sub-items (expanded) */}
                {isOpenSection && section.children && (
                  <div className="mt-0.5 space-y-0.5 pl-2">
                    {section.children.map((child) => {
                      const active = isChildActive(child.href, child.exact);
                      const ChildIcon = child.icon;

                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={onClose}
                          className={clsx(
                            "flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs transition-colors",
                            active
                              ? "bg-sky-100/70 text-sky-600 dark:bg-sky-950/60 dark:text-sky-300 font-bold shadow-2xs"
                              : "text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white",
                          )}
                        >
                          <ChildIcon
                            size={15}
                            className={clsx(
                              "shrink-0",
                              active ? "text-sky-600 dark:text-sky-400" : "text-slate-400",
                            )}
                          />
                          <span className="truncate">{child.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

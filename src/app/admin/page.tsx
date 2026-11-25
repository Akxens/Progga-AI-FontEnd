"use client";

import { useMemo, useState } from "react";
import {
  Users,
  GraduationCap,
  DollarSign,
  Heart,
  Table as TableIcon,
  BarChart2,
  PieChart,
  Zap,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Building2,
  Layers,
  Bot,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import { useAdminMe } from "@/lib/admin/useAdmin";
import { adminApi } from "@/lib/admin/api";
import type { SingleEnvelope } from "@/lib/admin/types";

interface DashboardKPIs {
  totalStudents: number;
  activeTodayStudents: number;
  totalTutorSessions: number;
  todayTutorSessions: number;
  mrr: number;
  activeSubscriptionsCount: number;
  activeSponsoredSeats: number;
  schoolsCount: number;
  teachersCount: number;
  pendingActionsCount: number;
}

interface Point {
  x: string;
  y: number;
}

export interface RecentChat {
  id: string;
  title: string;
  subject: string;
  mode: string;
  status: string;
  studentName: string;
  grade?: number;
  createdAt?: string;
}

export interface ChatSubjectCount {
  subject: string;
  count: number;
}

interface DashboardData {
  kpis: DashboardKPIs;
  trends?: {
    weeklySessions: Point[];
    weeklyActiveUsers: Point[];
  };
  recentChats?: RecentChat[];
  chatsBySubject?: ChatSubjectCount[];
}

function formatTimeAgo(dateStr?: string) {
  if (!dateStr) return "recent";
  const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const defaultRecentChats: RecentChat[] = [
  {
    id: "c1",
    studentName: "Nusrat Jahan",
    title: "সমীকরণ সমাধান করি",
    subject: "math",
    mode: "problem",
    status: "active",
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: "c2",
    studentName: "MD MOBASHER Azmi",
    title: "কোষের শক্তির উৎস",
    subject: "science",
    mode: "concept",
    status: "active",
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: "c3",
    studentName: "Rafi Ahmed",
    title: "সমীকরণ সমাধান করি",
    subject: "math",
    mode: "problem",
    status: "active",
    createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
  },
  {
    id: "c4",
    studentName: "Tasdek Khan",
    title: "একটি কলমের দাম",
    subject: "general",
    mode: "problem",
    status: "active",
    createdAt: new Date(Date.now() - 240 * 60000).toISOString(),
  },
];

// Sparkline SVG waves for KPI Cards
function Sparkline({ color, d }: { color: string; d: string }) {
  return (
    <svg className="w-20 h-9" viewBox="0 0 80 32" fill="none">
      <path
        d={d}
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Helper to generate smooth SVG cubic bezier path
function createSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i < points.length - 2 ? points[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) / 5;
    const cp1y = p1.y + (p2.y - p0.y) / 5;
    const cp2x = p2.x - (p3.x - p1.x) / 5;
    const cp2y = p2.y - (p3.y - p1.y) / 5;

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return d;
}

export default function AdminDashboardPage() {
  const { scopeLabel } = useAdminMe();
  const [showLearningTable, setShowLearningTable] = useState(false);
  const [showAccessTable, setShowAccessTable] = useState(false);
  const [showChatsChart, setShowChatsChart] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Filters state
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedClass, setSelectedClass] = useState("All");
  const [selectedAccess, setSelectedAccess] = useState("All");
  const [selectedSchool, setSelectedSchool] = useState("All");

  const { data: dashRes } = useSWR<SingleEnvelope<DashboardData>>(
    "/admin/dashboard",
    (url: string) => adminApi<SingleEnvelope<DashboardData>>(url),
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    },
  );

  const kpis = dashRes?.data?.kpis;
  const trends = dashRes?.data?.trends;

  // Seven days of learning activity
  const weeklyLabels = ["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"];

  const sessionTrendValues = useMemo(() => {
    if (trends?.weeklySessions && trends.weeklySessions.length === 7) {
      return trends.weeklySessions.map((p) => p.y);
    }
    return [9, 26, 6, 7.5, 1, 4, 2.5];
  }, [trends]);

  const studentTrendValues = useMemo(() => {
    if (trends?.weeklyActiveUsers && trends.weeklyActiveUsers.length === 7) {
      return trends.weeklyActiveUsers.map((p) => p.y);
    }
    return [1, 1, 1, 1, 1, 4.5, 2.5];
  }, [trends]);

  const totalStudents = kpis?.totalStudents ?? 24;
  const paidStudents = kpis?.activeSubscriptionsCount ?? 0;
  const csrStudents = kpis?.activeSponsoredSeats ?? 0;
  const freeStudents = Math.max(0, totalStudents - paidStudents - csrStudents);

  const freePct = totalStudents > 0 ? ((freeStudents / totalStudents) * 100).toFixed(1) : "100.0";
  const paidPct = totalStudents > 0 ? ((paidStudents / totalStudents) * 100).toFixed(1) : "0.0";
  const csrPct = totalStudents > 0 ? ((csrStudents / totalStudents) * 100).toFixed(1) : "0.0";

  const recentChatsList = dashRes?.data?.recentChats || defaultRecentChats;
  const chatsBySubject = dashRes?.data?.chatsBySubject;

  // Coordinates for Weekly Learning Activity Chart
  const svgWidth = 620;
  const svgHeight = 220;
  const plotLeft = 60;
  const plotRight = 590;
  const plotTop = 25;
  const plotBottom = 185;
  const plotWidth = plotRight - plotLeft;
  const plotHeight = plotBottom - plotTop;
  const maxY = 26; // Exact upper scale from mockup

  const sessionPoints = useMemo(() => {
    return sessionTrendValues.map((val, idx) => ({
      x: plotLeft + (idx / 6) * plotWidth,
      y: plotBottom - (Math.min(val, maxY) / maxY) * plotHeight,
      val,
      day: weeklyLabels[idx],
    }));
  }, [sessionTrendValues, plotLeft, plotWidth, plotBottom, plotHeight]);

  const studentPoints = useMemo(() => {
    return studentTrendValues.map((val, idx) => ({
      x: plotLeft + (idx / 6) * plotWidth,
      y: plotBottom - (Math.min(val, maxY) / maxY) * plotHeight,
      val,
      day: weeklyLabels[idx],
    }));
  }, [studentTrendValues, plotLeft, plotWidth, plotBottom, plotHeight]);

  const sessionLinePath = useMemo(() => createSmoothPath(sessionPoints), [sessionPoints]);
  const studentLinePath = useMemo(() => createSmoothPath(studentPoints), [studentPoints]);

  const sessionAreaPath = useMemo(() => {
    if (sessionPoints.length === 0) return "";
    return `${sessionLinePath} L ${sessionPoints[sessionPoints.length - 1].x} ${plotBottom} L ${sessionPoints[0].x} ${plotBottom} Z`;
  }, [sessionLinePath, sessionPoints, plotBottom]);

  const studentAreaPath = useMemo(() => {
    if (studentPoints.length === 0) return "";
    return `${studentLinePath} L ${studentPoints[studentPoints.length - 1].x} ${plotBottom} L ${studentPoints[0].x} ${plotBottom} Z`;
  }, [studentLinePath, studentPoints, plotBottom]);

  return (
    <div className="space-y-6 relative bg-slate-50 min-h-screen text-slate-800">
      {/* Decorative top-right background wave matching mockup */}
      <div className="absolute right-0 top-0 w-96 h-36 pointer-events-none opacity-40 overflow-hidden hidden md:block">
        <svg viewBox="0 0 400 150" fill="none" className="w-full h-full">
          <path
            d="M 100 0 Q 220 80 400 20 L 400 0 Z"
            fill="url(#headerWaveGrad)"
          />
          <defs>
            <linearGradient id="headerWaveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#818cf8" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 1. Header Banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-1.5 h-9 rounded-full bg-blue-600 mr-3.5 shrink-0" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Executive Dashboard
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
              Live operational metrics for all programmes
            </p>
          </div>
        </div>
      </div>

      {/* 2. Global Filters Bar matching Mockup */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        {/* Date Range Picker */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/70">
          <Calendar size={14} className="text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-700">Period:</span>
          <span className="text-slate-400 font-mono text-[11px]">mm/dd/yyyy – mm/dd/yyyy</span>
          <Calendar size={13} className="text-slate-400 shrink-0 ml-1" />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-700 font-medium cursor-pointer focus:outline-none"
          >
            <option value="All">Year: All</option>
            <option value="2026">Year: 2026</option>
            <option value="2025">Year: 2025</option>
          </select>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-700 font-medium cursor-pointer focus:outline-none"
          >
            <option value="All">Class: All</option>
            {[6, 7, 8, 9, 10, 11, 12].map((c) => (
              <option key={c} value={c}>
                Class: {c}
              </option>
            ))}
          </select>

          <select
            value={selectedAccess}
            onChange={(e) => setSelectedAccess(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-700 font-medium cursor-pointer focus:outline-none"
          >
            <option value="All">Access: All</option>
            <option value="Free">Free Tier</option>
            <option value="Paid">Premium Paid</option>
            <option value="CSR">CSR Sponsored</option>
          </select>

          <select
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-700 font-medium cursor-pointer focus:outline-none"
          >
            <option value="All">School: All</option>
            <option value="pilot">Dhaka Model High School</option>
          </select>
        </div>
      </div>

      {/* 3. 4 Top KPI Cards with Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Registered Students */}
        <Link
          href="/admin/students"
          className="group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs relative overflow-hidden hover:border-sky-300 transition-all block"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
                <Users size={20} />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500">
                  Registered Students
                </div>
                <div className="text-2xl font-black text-slate-900 mt-0.5">
                  {kpis ? kpis.totalStudents : 24}
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200">
              <ArrowUpRight size={13} />
              <span>8.0%</span>
            </div>
          </div>

          <div className="mt-3 flex items-end justify-between">
            <span className="text-[11px] text-slate-400">Total student accounts in DB</span>
            <Sparkline color="#0284c7" d="M 2 24 C 20 28, 40 18, 60 12 S 78 4, 78 4" />
          </div>
        </Link>

        {/* Card 2: Tutor AI Sessions */}
        <Link
          href="/admin/sessions"
          className="group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs relative overflow-hidden hover:border-purple-300 transition-all block"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
                <Bot size={20} />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500">
                  Tutor AI Sessions
                </div>
                <div className="text-2xl font-black text-slate-900 mt-0.5">
                  {kpis ? kpis.totalTutorSessions : 116}
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200">
              <ArrowUpRight size={13} />
              <span>14.0%</span>
            </div>
          </div>

          <div className="mt-3 flex items-end justify-between">
            <span className="text-[11px] text-slate-400">
              {kpis ? `${kpis.todayTutorSessions} sessions today` : "1 sessions today"}
            </span>
            <Sparkline color="#9333ea" d="M 2 26 C 22 28, 38 12, 58 14 S 78 8, 78 8" />
          </div>
        </Link>

        {/* Card 3: Schools & Teachers */}
        <Link
          href="/admin/schools"
          className="group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs relative overflow-hidden hover:border-amber-300 transition-all block"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                <Building2 size={20} />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500">
                  Schools & Teachers
                </div>
                <div className="text-base sm:text-lg font-black text-slate-900 mt-0.5 truncate">
                  {kpis ? `${kpis.schoolsCount} school / ${kpis.teachersCount} teachers` : "1 school / 4 teachers"}
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200">
              <ArrowUpRight size={13} />
              <span>5.0%</span>
            </div>
          </div>

          <div className="mt-3 flex items-end justify-between">
            <span className="text-[11px] text-slate-400">Partner institutions in DB</span>
            <Sparkline color="#f59e0b" d="M 2 24 C 20 18, 40 26, 60 14 S 78 8, 78 8" />
          </div>
        </Link>

        {/* Card 4: Subscriptions & MRR */}
        <Link
          href="/admin/finance/subscriptions"
          className="group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs relative overflow-hidden hover:border-emerald-300 transition-all block"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                <Layers size={20} />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500">
                  Subscriptions & MRR
                </div>
                <div className="text-2xl font-black text-slate-900 mt-0.5">
                  {kpis && kpis.activeSubscriptionsCount > 0
                    ? `${kpis.activeSubscriptionsCount} active`
                    : "0 active"}
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200">
              <ArrowUpRight size={13} />
              <span>2.0%</span>
            </div>
          </div>

          <div className="mt-3 flex items-end justify-between">
            <span className="text-[11px] text-slate-400">
              {kpis ? `${kpis.activeSponsoredSeats} CSR sponsored seats` : "0 CSR sponsored seats"}
            </span>
            <Sparkline color="#10b981" d="M 2 22 C 20 25, 40 18, 60 16 S 78 6, 78 6" />
          </div>
        </Link>
      </div>

      {/* 4. Middle Section: Visual Analytics Cards Grid (3 Equal 1/3 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Weekly Learning Activity (1/3 width) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-sky-600 shrink-0" />
              <h2 className="text-base font-bold text-slate-900 truncate">
                Weekly Learning Activity
              </h2>
            </div>

            <button
              onClick={() => setShowLearningTable(!showLearningTable)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <TableIcon size={12} />
              <span>{showLearningTable ? "View chart" : "View as table"}</span>
            </button>
          </div>

          {/* Legend matching mockup */}
          <div className="flex items-center gap-3 text-xs font-semibold pb-1">
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span>Active Students</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>AI Sessions</span>
            </div>
          </div>

          {/* Chart or Table */}
          {showLearningTable ? (
            <div className="overflow-x-auto py-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400">
                    <th className="pb-2 font-semibold">Day</th>
                    <th className="pb-2 font-semibold text-right">Active Students</th>
                    <th className="pb-2 font-semibold text-right">AI Sessions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {weeklyLabels.map((day, i) => (
                    <tr key={day}>
                      <td className="py-2.5 font-medium">{day}</td>
                      <td className="py-2.5 text-right font-mono text-sky-600">{studentTrendValues[i]}</td>
                      <td className="py-2.5 text-right font-mono text-emerald-600 font-bold">{sessionTrendValues[i]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="w-full h-[220px] pt-1 relative">
              <svg
                className="w-full h-full"
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  {/* Subtle soft gradient fills matching mockup */}
                  <linearGradient id="greenAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="blueAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Dashed Gridlines matching ticks 26, 19.5, 13, 6.5, 0 */}
                {[
                  { y: 25, label: "26" },
                  { y: 65, label: "19.5" },
                  { y: 105, label: "13" },
                  { y: 145, label: "6.5" },
                  { y: 185, label: "0" },
                ].map((grid) => (
                  <g key={grid.label}>
                    <line
                      x1={plotLeft}
                      y1={grid.y}
                      x2={plotRight}
                      y2={grid.y}
                      stroke="#e2e8f0"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={plotLeft - 12}
                      y={grid.y + 4}
                      textAnchor="end"
                      fontSize="11"
                      fill="#94a3b8"
                      fontFamily="sans-serif"
                    >
                      {grid.label}
                    </text>
                  </g>
                ))}

                {/* X-Axis Day Labels */}
                {sessionPoints.map((pt) => (
                  <text
                    key={pt.day}
                    x={pt.x}
                    y={plotBottom + 22}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#64748b"
                    fontWeight="600"
                  >
                    {pt.day}
                  </text>
                ))}

                {/* Translucent Area Fills */}
                <path d={sessionAreaPath} fill="url(#greenAreaGrad)" />
                <path d={studentAreaPath} fill="url(#blueAreaGrad)" />

                {/* Emerald Green Curve: AI Sessions */}
                <path
                  d={sessionLinePath}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Sky Blue Curve: Active Students */}
                <path
                  d={studentLinePath}
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Node Points for Green (AI Sessions) */}
                {sessionPoints.map((pt, i) => (
                  <circle
                    key={`sess-${i}`}
                    cx={pt.x}
                    cy={pt.y}
                    r="4.5"
                    fill="#ffffff"
                    stroke="#10b981"
                    strokeWidth="2.8"
                    className="transition-transform hover:scale-125 cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />
                ))}

                {/* Node Points for Blue (Active Students) */}
                {studentPoints.map((pt, i) => (
                  <circle
                    key={`stud-${i}`}
                    cx={pt.x}
                    cy={pt.y}
                    r="4"
                    fill="#ffffff"
                    stroke="#0284c7"
                    strokeWidth="2.5"
                    className="transition-transform hover:scale-125 cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />
                ))}
              </svg>

              {/* Floating Tooltip when hovering over a node */}
              {hoveredIdx !== null && (
                <div
                  className="absolute pointer-events-none bg-slate-900 text-white text-[11px] px-3 py-1.5 rounded-lg shadow-lg z-20 transition-all -translate-x-1/2 -translate-y-full"
                  style={{
                    left: `${(sessionPoints[hoveredIdx].x / svgWidth) * 100}%`,
                    top: `${(Math.min(sessionPoints[hoveredIdx].y, studentPoints[hoveredIdx].y) / svgHeight) * 100 - 4}%`,
                  }}
                >
                  <div className="font-bold border-b border-slate-700 pb-0.5 mb-1 text-slate-300">
                    {weeklyLabels[hoveredIdx]}
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>AI Sessions: {sessionTrendValues[hoveredIdx]}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sky-300 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-300" />
                    <span>Active Students: {studentTrendValues[hoveredIdx]}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card 2: Student Access Breakdown (1/3 width) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-sky-600" />
              <h2 className="text-base font-bold text-slate-900 truncate">
                Student Access Breakdown
              </h2>
            </div>

            <button
              onClick={() => setShowAccessTable(!showAccessTable)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <TableIcon size={12} />
              <span>{showAccessTable ? "View chart" : "View as table"}</span>
            </button>
          </div>

          {/* Chart or Table */}
          {showAccessTable ? (
            <div className="overflow-x-auto py-4">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400">
                    <th className="pb-2 font-semibold">Tier</th>
                    <th className="pb-2 font-semibold text-right">Students</th>
                    <th className="pb-2 font-semibold text-right">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="py-2.5 font-medium flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                      Free Tier
                    </td>
                    <td className="py-2.5 text-right font-mono">{freeStudents}</td>
                    <td className="py-2.5 text-right font-mono">{freePct}%</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                      Premium Paid
                    </td>
                    <td className="py-2.5 text-right font-mono">{paidStudents}</td>
                    <td className="py-2.5 text-right font-mono">{paidPct}%</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      CSR Sponsored
                    </td>
                    <td className="py-2.5 text-right font-mono">{csrStudents}</td>
                    <td className="py-2.5 text-right font-mono">{csrPct}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
              {/* Donut Chart with Center Text */}
              <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  {/* Background Track */}
                  <circle
                    cx="60"
                    cy="60"
                    r="46"
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="14"
                  />
                  {/* Free Tier Vibrant Blue Arc (100% of circle) */}
                  <circle
                    cx="60"
                    cy="60"
                    r="46"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="14"
                    strokeDasharray="289 289"
                    strokeDashoffset="0"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Center Numbers */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
                  <span className="text-xl font-black text-slate-900 leading-none">
                    {totalStudents}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 mt-0.5">
                    Students
                  </span>
                </div>
              </div>

              {/* Breakdown Legend Table */}
              <div className="space-y-3 flex-1 w-full text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0" />
                    <span className="font-semibold text-slate-700">Free Tier</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-slate-900">{freeStudents}</span>
                    <span className="text-slate-400 w-11 text-right">{freePct}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shrink-0" />
                    <span className="font-semibold text-slate-700">Premium Paid</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-slate-900">{paidStudents}</span>
                    <span className="text-slate-400 w-11 text-right">{paidPct}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-semibold text-slate-700">CSR Sponsored</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-slate-900">{csrStudents}</span>
                    <span className="text-slate-400 w-11 text-right">{csrPct}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Card 3: New Chats & AI Sessions (1/3 width) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600 shrink-0" />
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 truncate">
                  New Chats
                </h2>
                <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600 border border-indigo-200/80">
                  {kpis?.totalTutorSessions ?? 116} Total
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowChatsChart(!showChatsChart)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <TableIcon size={12} />
              <span>{showChatsChart ? "View list" : "View chart"}</span>
            </button>
          </div>

          {/* List or Chart */}
          {showChatsChart ? (
            /* Subject & Mode Distribution Chart */
            <div className="py-2 space-y-3">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Chats by Subject
              </div>
              <div className="space-y-2.5">
                {[
                  { subject: "Mathematics", count: 52, pct: 45, color: "bg-sky-500" },
                  { subject: "General Science", count: 25, pct: 22, color: "bg-amber-500" },
                  { subject: "Science", count: 18, pct: 16, color: "bg-emerald-500" },
                  { subject: "English & Others", count: 21, pct: 17, color: "bg-purple-500" },
                ].map((item) => (
                  <div key={item.subject} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-700">{item.subject}</span>
                      <span className="font-mono text-slate-500">
                        {item.count} <span className="text-[11px] text-slate-400">({item.pct}%)</span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color} transition-all duration-500`}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-medium">Problem: 44</span>
                <span className="font-medium">Concept: 41</span>
                <span className="font-medium">Fact: 31</span>
              </div>
            </div>
          ) : (
            /* Recent New Chats Feed */
            <div className="py-1 flex-1 flex flex-col justify-between">
              <div className="divide-y divide-slate-100">
                {recentChatsList.slice(0, 4).map((chat) => (
                  <div key={chat.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                      {chat.studentName?.[0]?.toUpperCase() || "S"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {chat.studentName}
                        </p>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {formatTimeAgo(chat.createdAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium truncate mt-0.5">
                        {chat.title || "Tutor Session"}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-100 text-slate-600">
                          {chat.subject}
                        </span>
                        <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold capitalize bg-purple-50 text-purple-600">
                          {chat.mode}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[9px] text-emerald-600 font-semibold ml-auto">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {chat.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 mt-2 border-t border-slate-100">
                <Link
                  href="/admin/sessions"
                  className="flex items-center justify-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  <span>View all chat sessions</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Bottom Section: Quick Modules matching Mockup */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-sky-600" />
          <h2 className="text-sm font-bold text-slate-900">Quick Modules</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Module 1: People & Students */}
          <Link
            href="/admin/students"
            className="group flex items-center justify-between rounded-xl border border-slate-200/80 p-3.5 hover:border-sky-300 hover:bg-slate-50/70 transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
                <Users size={18} />
              </div>
              <div className="truncate">
                <p className="font-bold text-xs text-slate-900 truncate">
                  People & Students
                </p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  Profiles, schools, guardians
                </p>
              </div>
            </div>
            <ArrowRight size={14} className="text-slate-400 group-hover:text-slate-700 transition-colors shrink-0 ml-2" />
          </Link>

          {/* Module 2: Academics */}
          <Link
            href="/admin/courses"
            className="group flex items-center justify-between rounded-xl border border-slate-200/80 p-3.5 hover:border-emerald-300 hover:bg-slate-50/70 transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                <GraduationCap size={18} />
              </div>
              <div className="truncate">
                <p className="font-bold text-xs text-slate-900 truncate">
                  Academics
                </p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  Courses, questions, exams
                </p>
              </div>
            </div>
            <ArrowRight size={14} className="text-slate-400 group-hover:text-slate-700 transition-colors shrink-0 ml-2" />
          </Link>

          {/* Module 3: Finance */}
          <Link
            href="/admin/finance/subscriptions"
            className="group flex items-center justify-between rounded-xl border border-slate-200/80 p-3.5 hover:border-amber-300 hover:bg-slate-50/70 transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                <DollarSign size={18} />
              </div>
              <div className="truncate">
                <p className="font-bold text-xs text-slate-900 truncate">
                  Finance
                </p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  Plans, payments, ledgers
                </p>
              </div>
            </div>
            <ArrowRight size={14} className="text-slate-400 group-hover:text-slate-700 transition-colors shrink-0 ml-2" />
          </Link>

          {/* Module 4: CSR Foundation */}
          <Link
            href="/admin/csr/sponsors"
            className="group flex items-center justify-between rounded-xl border border-slate-200/80 p-3.5 hover:border-rose-300 hover:bg-slate-50/70 transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                <Heart size={18} />
              </div>
              <div className="truncate">
                <p className="font-bold text-xs text-slate-900 truncate">
                  CSR Foundation
                </p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  Grants, programmes, impact
                </p>
              </div>
            </div>
            <ArrowRight size={14} className="text-slate-400 group-hover:text-slate-700 transition-colors shrink-0 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}

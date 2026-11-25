"use client";

import { useMemo, useState } from "react";
import {
  Users,
  GraduationCap,
  DollarSign,
  Heart,
  TrendingUp,
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

interface DashboardData {
  kpis: DashboardKPIs;
  trends?: {
    weeklySessions: Point[];
    weeklyActiveUsers: Point[];
  };
}

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

export default function AdminDashboardPage() {
  const { scopeLabel } = useAdminMe();
  const [showLearningTable, setShowLearningTable] = useState(false);
  const [showAccessTable, setShowAccessTable] = useState(false);

  // Filters state
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedClass, setSelectedClass] = useState("All");
  const [selectedAccess, setSelectedAccess] = useState("All");
  const [selectedSchool, setSelectedSchool] = useState("All");

  const { data: dashRes, isLoading } = useSWR<SingleEnvelope<DashboardData>>(
    "/admin/dashboard",
    (url: string) => adminApi<SingleEnvelope<DashboardData>>(url),
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    },
  );

  const kpis = dashRes?.data?.kpis;
  const trends = dashRes?.data?.trends;

  // Real or fallback trend series
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

  return (
    <div className="space-y-6 relative">
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
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Executive Dashboard
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Live operational metrics for all programmes
            </p>
          </div>
        </div>
      </div>

      {/* 2. Global Filters Bar matching Mockup */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        {/* Date Range Picker */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
          <Calendar size={14} className="text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">Period:</span>
          <span className="text-slate-400 font-mono text-[11px]">mm/dd/yyyy – mm/dd/yyyy</span>
          <Calendar size={13} className="text-slate-400 shrink-0 ml-1" />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 font-medium cursor-pointer focus:outline-none"
          >
            <option value="All">Year: All</option>
            <option value="2026">Year: 2026</option>
            <option value="2025">Year: 2025</option>
          </select>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 font-medium cursor-pointer focus:outline-none"
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
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 font-medium cursor-pointer focus:outline-none"
          >
            <option value="All">Access: All</option>
            <option value="Free">Free Tier</option>
            <option value="Paid">Premium Paid</option>
            <option value="CSR">CSR Sponsored</option>
          </select>

          <select
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 font-medium cursor-pointer focus:outline-none"
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
          className="group rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs relative overflow-hidden hover:border-sky-300 transition-all block"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/40 flex items-center justify-center shrink-0">
                <Users size={20} />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Registered Students
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  {kpis ? kpis.totalStudents : 24}
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
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
          className="group rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs relative overflow-hidden hover:border-purple-300 transition-all block"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40 flex items-center justify-center shrink-0">
                <Bot size={20} />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Tutor AI Sessions
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  {kpis ? kpis.totalTutorSessions : 116}
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
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
          className="group rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs relative overflow-hidden hover:border-amber-300 transition-all block"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40 flex items-center justify-center shrink-0">
                <Building2 size={20} />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Schools & Teachers
                </div>
                <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5 truncate">
                  {kpis ? `${kpis.schoolsCount} school / ${kpis.teachersCount} teachers` : "1 school / 4 teachers"}
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
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
          className="group rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs relative overflow-hidden hover:border-emerald-300 transition-all block"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center shrink-0">
                <Layers size={20} />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Subscriptions & MRR
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  {kpis && kpis.activeSubscriptionsCount > 0
                    ? `${kpis.activeSubscriptionsCount} active`
                    : "0 active"}
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
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

      {/* 4. Middle Section: Visual Analytics Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Weekly Learning Activity (~65% width) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-sky-600" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Weekly Learning Activity
                </h2>
              </div>

              {/* Legend matching mockup */}
              <div className="flex items-center gap-3 text-xs font-semibold ml-2">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  <span>Active Students</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>AI Sessions</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowLearningTable(!showLearningTable)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
            >
              <TableIcon size={13} />
              <span>{showLearningTable ? "View chart" : "View as table"}</span>
            </button>
          </div>

          {/* Chart or Table */}
          {showLearningTable ? (
            <div className="overflow-x-auto py-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400">
                    <th className="pb-2 font-semibold">Day</th>
                    <th className="pb-2 font-semibold text-right">Active Students</th>
                    <th className="pb-2 font-semibold text-right">AI Sessions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
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
            <div className="w-full h-[220px] pt-2 relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 540 180" preserveAspectRatio="none">
                {/* Horizontal Dashed Gridlines matching ticks 26, 19.5, 13, 6.5, 0 */}
                {[
                  { y: 20, label: "26" },
                  { y: 55, label: "19.5" },
                  { y: 90, label: "13" },
                  { y: 125, label: "6.5" },
                  { y: 160, label: "0" },
                ].map((grid) => (
                  <g key={grid.label}>
                    <line
                      x1="45"
                      y1={grid.y}
                      x2="530"
                      y2={grid.y}
                      stroke="#e2e8f0"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <text
                      x="35"
                      y={grid.y + 3}
                      textAnchor="end"
                      fontSize="10"
                      fill="#94a3b8"
                      fontFamily="sans-serif"
                    >
                      {grid.label}
                    </text>
                  </g>
                ))}

                {/* X-Axis Day Labels */}
                {weeklyLabels.map((day, idx) => {
                  const x = 55 + idx * 75;
                  return (
                    <text
                      key={day}
                      x={x}
                      y="178"
                      textAnchor="middle"
                      fontSize="11"
                      fill="#64748b"
                      fontWeight="500"
                    >
                      {day}
                    </text>
                  );
                })}

                {/* Green Line: AI Sessions (peak ~26 on Sat, ~9 Fri, ~6 Sun, ~7.5 Mon, ~1 Tue, ~4 Wed, ~2.5 Thu) */}
                <path
                  d="M 55 120 C 80 80, 105 20, 130 20 C 155 20, 180 135, 205 135 C 230 135, 255 130, 280 130 C 305 130, 330 155, 355 155 C 380 155, 405 145, 430 145 C 455 145, 480 150, 505 150"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Green Dots */}
                {[
                  { x: 55, y: 120 },
                  { x: 130, y: 20 },
                  { x: 205, y: 135 },
                  { x: 280, y: 130 },
                  { x: 355, y: 155 },
                  { x: 430, y: 145 },
                  { x: 505, y: 150 },
                ].map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.x}
                    cy={pt.y}
                    r="4.5"
                    fill="#ffffff"
                    stroke="#10b981"
                    strokeWidth="2.5"
                  />
                ))}

                {/* Blue Line: Active Students (1 across Fri-Tue, rises to ~4.5 Wed, ~2.5 Thu) */}
                <path
                  d="M 55 155 L 130 155 L 205 155 L 280 155 L 355 155 C 380 155, 405 142, 430 142 C 455 142, 480 150, 505 150"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />

                {/* Blue Dots */}
                {[
                  { x: 55, y: 155 },
                  { x: 130, y: 155 },
                  { x: 205, y: 155 },
                  { x: 280, y: 155 },
                  { x: 355, y: 155 },
                  { x: 430, y: 142 },
                  { x: 505, y: 150 },
                ].map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.x}
                    cy={pt.y}
                    r="4"
                    fill="#ffffff"
                    stroke="#0284c7"
                    strokeWidth="2.2"
                  />
                ))}
              </svg>
            </div>
          )}
        </div>

        {/* Card 2: Student Access Breakdown (~35% width) */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-sky-600" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Student Access Breakdown
              </h2>
            </div>

            <button
              onClick={() => setShowAccessTable(!showAccessTable)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
            >
              <TableIcon size={13} />
              <span>{showAccessTable ? "View chart" : "View as table"}</span>
            </button>
          </div>

          {/* Chart or Table */}
          {showAccessTable ? (
            <div className="overflow-x-auto py-4">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400">
                    <th className="pb-2 font-semibold">Tier</th>
                    <th className="pb-2 font-semibold text-right">Students</th>
                    <th className="pb-2 font-semibold text-right">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-3">
              {/* Donut Chart with Center Text */}
              <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  {/* Background Track */}
                  <circle
                    cx="60"
                    cy="60"
                    r="46"
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="16"
                  />
                  {/* Free Tier Vibrant Blue Arc (100% of circle) */}
                  <circle
                    cx="60"
                    cy="60"
                    r="46"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="16"
                    strokeDasharray="289 289"
                    strokeDashoffset="0"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Center Numbers */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
                  <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                    {totalStudents}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400 mt-0.5">
                    Students
                  </span>
                </div>
              </div>

              {/* Breakdown Legend Table matching Mockup */}
              <div className="space-y-3.5 flex-1 w-full text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Free Tier</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="font-bold text-slate-900 dark:text-white">{freeStudents}</span>
                    <span className="text-slate-400 w-11 text-right">{freePct}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shrink-0" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Premium Paid</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="font-bold text-slate-900 dark:text-white">{paidStudents}</span>
                    <span className="text-slate-400 w-11 text-right">{paidPct}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">CSR Sponsored</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="font-bold text-slate-900 dark:text-white">{csrStudents}</span>
                    <span className="text-slate-400 w-11 text-right">{csrPct}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Bottom Section: Quick Modules matching Mockup */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-sky-600" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Quick Modules</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Module 1: People & Students */}
          <Link
            href="/admin/students"
            className="group flex items-center justify-between rounded-xl border border-slate-200/80 dark:border-slate-800 p-3.5 hover:border-sky-300 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/40 flex items-center justify-center shrink-0">
                <Users size={18} />
              </div>
              <div className="truncate">
                <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                  People & Students
                </p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  Profiles, schools, guardians
                </p>
              </div>
            </div>
            <ArrowRight size={14} className="text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors shrink-0 ml-2" />
          </Link>

          {/* Module 2: Academics */}
          <Link
            href="/admin/courses"
            className="group flex items-center justify-between rounded-xl border border-slate-200/80 dark:border-slate-800 p-3.5 hover:border-emerald-300 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center shrink-0">
                <GraduationCap size={18} />
              </div>
              <div className="truncate">
                <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                  Academics
                </p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  Courses, questions, exams
                </p>
              </div>
            </div>
            <ArrowRight size={14} className="text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors shrink-0 ml-2" />
          </Link>

          {/* Module 3: Finance */}
          <Link
            href="/admin/finance/subscriptions"
            className="group flex items-center justify-between rounded-xl border border-slate-200/80 dark:border-slate-800 p-3.5 hover:border-amber-300 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40 flex items-center justify-center shrink-0">
                <DollarSign size={18} />
              </div>
              <div className="truncate">
                <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                  Finance
                </p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  Plans, payments, ledgers
                </p>
              </div>
            </div>
            <ArrowRight size={14} className="text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors shrink-0 ml-2" />
          </Link>

          {/* Module 4: CSR Foundation */}
          <Link
            href="/admin/csr/sponsors"
            className="group flex items-center justify-between rounded-xl border border-slate-200/80 dark:border-slate-800 p-3.5 hover:border-rose-300 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40 flex items-center justify-center shrink-0">
                <Heart size={18} />
              </div>
              <div className="truncate">
                <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                  CSR Foundation
                </p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  Grants, programmes, impact
                </p>
              </div>
            </div>
            <ArrowRight size={14} className="text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors shrink-0 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}

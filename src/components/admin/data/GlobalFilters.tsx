"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { useAdminMe } from "@/lib/admin/useAdmin";
import { AsyncSelect } from "../form/Inputs";

export type GlobalFilterKey =
  | "dateRange"
  | "academicYear"
  | "grade"
  | "school"
  | "accessType"
  | "programme"
  | "partner";

export interface GlobalFiltersProps {
  show: GlobalFilterKey[];
}

export function GlobalFilters({ show }: GlobalFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { scope } = useAdminMe();

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const sp = new URLSearchParams(searchParams.toString());
      if (!value) {
        sp.delete(key);
      } else {
        sp.set(key, value);
      }
      sp.set("page", "1"); // reset page on filter change
      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const academicYear = searchParams.get("academicYear") || "";
  const grade = searchParams.get("grade") || "";
  const schoolId = searchParams.get("schoolId") || "";
  const accessType = searchParams.get("accessType") || "";
  const programmeId = searchParams.get("programmeId") || "";
  const partnerId = searchParams.get("partnerId") || "";

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2.5 rounded-2xl border border-line bg-white p-3 shadow-soft text-xs">
      {/* Date Range */}
      {show.includes("dateRange") && (
        <div className="flex items-center gap-1">
          <span className="font-bold text-ink-soft text-[11px] uppercase mr-1">Period:</span>
          <input
            type="date"
            value={from}
            onChange={(e) => updateParam("from", e.target.value || null)}
            className="rounded-xl border border-line bg-slate-50 px-2.5 py-1 text-xs font-semibold text-ink focus:outline-hidden"
            title="Start date"
          />
          <span className="text-ink-muted">–</span>
          <input
            type="date"
            value={to}
            onChange={(e) => updateParam("to", e.target.value || null)}
            className="rounded-xl border border-line bg-slate-50 px-2.5 py-1 text-xs font-semibold text-ink focus:outline-hidden"
            title="End date"
          />
        </div>
      )}

      {/* Academic Year */}
      {show.includes("academicYear") && (
        <select
          value={academicYear}
          onChange={(e) => updateParam("academicYear", e.target.value || null)}
          className="rounded-xl border border-line bg-slate-50 px-3 py-1 text-xs font-semibold text-ink focus:outline-hidden"
        >
          <option value="">Year: All</option>
          <option value="2026">2026</option>
          <option value="2025">2025</option>
          <option value="2024">2024</option>
        </select>
      )}

      {/* Grade / Class */}
      {show.includes("grade") && (
        <select
          value={grade}
          onChange={(e) => updateParam("grade", e.target.value || null)}
          className="rounded-xl border border-line bg-slate-50 px-3 py-1 text-xs font-semibold text-ink focus:outline-hidden"
        >
          <option value="">Class: All</option>
          {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
            <option key={g} value={g}>
              Class {g}
            </option>
          ))}
        </select>
      )}

      {/* Access Type */}
      {show.includes("accessType") && (
        <select
          value={accessType}
          onChange={(e) => updateParam("accessType", e.target.value || null)}
          className="rounded-xl border border-line bg-slate-50 px-3 py-1 text-xs font-semibold text-ink focus:outline-hidden"
        >
          <option value="">Access: All</option>
          <option value="FREE">Free</option>
          <option value="PREMIUM_PAID">Premium Paid</option>
          <option value="PREMIUM_SPONSORED">Premium Sponsored (CSR)</option>
        </select>
      )}

      {/* School (hidden when workspace scope is SCHOOL) */}
      {show.includes("school") && scope?.type !== "SCHOOL" && (
        <div className="w-48">
          <AsyncSelect
            lookup="schools"
            value={schoolId}
            onChange={(val) => updateParam("schoolId", val || null)}
            placeholder="School: All"
          />
        </div>
      )}

      {/* Programme (hidden when PROGRAMME scope) */}
      {show.includes("programme") && scope?.type !== "PROGRAMME" && (
        <div className="w-44">
          <AsyncSelect
            lookup="programmes"
            value={programmeId}
            onChange={(val) => updateParam("programmeId", val || null)}
            placeholder="Programme: All"
          />
        </div>
      )}

      {/* Partner (only for GLOBAL / LEGAL_ENTITY scopes) */}
      {show.includes("partner") && (scope?.type === "GLOBAL" || scope?.type === "LEGAL_ENTITY") && (
        <div className="w-44">
          <AsyncSelect
            lookup="partners"
            value={partnerId}
            onChange={(val) => updateParam("partnerId", val || null)}
            placeholder="Partner: All"
          />
        </div>
      )}
    </div>
  );
}

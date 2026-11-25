"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { adminApi, getStoredWorkspaceId } from "@/lib/admin/api";
import type { ListEnvelope, ListMeta } from "@/lib/admin/types";

export interface FilterSpec {
  key: string;
  label: string;
  type: "select" | "multiselect" | "daterange" | "async-select" | "number-range" | "boolean";
  options?: { value: string; label: string }[];
  lookup?: string;
}

export interface UseListOptions {
  endpoint: string;
  defaultSort?: string;
  defaultPageSize?: number;
  filters?: FilterSpec[];
}

export function useList<TRow = any>({
  endpoint,
  defaultSort = "-createdAt",
  defaultPageSize = 25,
}: UseListOptions) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse state from URL params
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Number(searchParams.get("pageSize")) || defaultPageSize;
  const sort = searchParams.get("sort") || defaultSort;
  const search = searchParams.get("search") || "";

  // Collect other query params as custom filters
  const filters = useMemo(() => {
    const f: Record<string, string | string[]> = {};
    searchParams.forEach((val, key) => {
      if (!["page", "pageSize", "sort", "search"].includes(key)) {
        if (f[key]) {
          if (Array.isArray(f[key])) {
            (f[key] as string[]).push(val);
          } else {
            f[key] = [f[key] as string, val];
          }
        } else {
          f[key] = val;
        }
      }
    });
    return f;
  }, [searchParams]);

  // Update query params in URL without full page reload
  const updateUrl = useCallback(
    (updates: Record<string, string | number | string[] | null | undefined>) => {
      const sp = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v === null || v === undefined || v === "") {
          sp.delete(k);
        } else if (Array.isArray(v)) {
          sp.delete(k);
          v.forEach((val) => sp.append(k, val));
        } else {
          sp.set(k, String(v));
        }
      }
      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const setPage = useCallback((p: number) => updateUrl({ page: p }), [updateUrl]);
  const setPageSize = useCallback((s: number) => updateUrl({ pageSize: s, page: 1 }), [updateUrl]);

  const setSort = useCallback(
    (field: string) => {
      let nextSort = field;
      if (sort === field) {
        nextSort = `-${field}`;
      } else if (sort === `-${field}`) {
        nextSort = defaultSort;
      }
      updateUrl({ sort: nextSort, page: 1 });
    },
    [sort, defaultSort, updateUrl],
  );

  // Debounced search state
  const [localSearch, setLocalSearch] = useState(search);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  const setSearch = useCallback(
    (q: string) => {
      setLocalSearch(q);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        updateUrl({ search: q ? q : null, page: 1 });
      }, 300);
    },
    [updateUrl],
  );

  const setFilter = useCallback(
    (key: string, value: string | string[] | null) => {
      updateUrl({ [key]: value, page: 1 });
    },
    [updateUrl],
  );

  const clearFilters = useCallback(() => {
    const sp = new URLSearchParams();
    if (defaultSort) sp.set("sort", defaultSort);
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [defaultSort, pathname, router]);

  const queryString = searchParams.toString();
  const ws = getStoredWorkspaceId();

  // SWR key contains endpoint, query string, and current workspace
  const swrKey = [endpoint, queryString, ws || "default"];

  const { data, error, isLoading, mutate } = useSWR<ListEnvelope<TRow>>(
    swrKey,
    () => {
      const pathWithQuery = queryString ? `${endpoint}?${queryString}` : endpoint;
      return adminApi<ListEnvelope<TRow>>(pathWithQuery);
    },
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    },
  );

  // Stale detection: if asOf timestamp older than 15 min
  const asOf = (data?.meta as any)?.asOf;
  const stale = Boolean(asOf && Date.now() - new Date(asOf).getTime() > 15 * 60 * 1000);

  return {
    rows: data?.data || [],
    meta: data?.meta,
    isLoading,
    error: error || null,
    stale,
    state: {
      page,
      pageSize,
      sort,
      search: localSearch,
      filters,
    },
    setPage,
    setPageSize,
    setSort,
    setSearch,
    setFilter,
    clearFilters,
    queryString,
    mutate,
  };
}

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
  defaultPageSize = 10,
}: UseListOptions) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read URL params as baseline
  const urlPage = Math.max(1, Number(searchParams.get("page")) || 1);
  const urlPageSize = Number(searchParams.get("pageSize")) || defaultPageSize;
  const urlSort = searchParams.get("sort") || defaultSort;
  const urlSearch = searchParams.get("search") || searchParams.get("q") || "";

  // Local state ensures immediate re-render and reliable reactive state
  const [page, setPageState] = useState<number>(urlPage);
  const [pageSize, setPageSizeState] = useState<number>(urlPageSize);
  const [sort, setSortState] = useState<string>(urlSort);
  const [localSearch, setLocalSearch] = useState<string>(urlSearch);

  // Sync state whenever URL searchParams change
  useEffect(() => {
    setPageState(urlPage);
  }, [urlPage]);

  useEffect(() => {
    setPageSizeState(urlPageSize);
  }, [urlPageSize]);

  useEffect(() => {
    setSortState(urlSort);
  }, [urlSort]);

  useEffect(() => {
    setLocalSearch(urlSearch);
  }, [urlSearch]);

  // Collect other query params as custom filters
  const filters = useMemo(() => {
    const f: Record<string, string | string[]> = {};
    searchParams.forEach((val, key) => {
      if (!["page", "pageSize", "sort", "search", "q"].includes(key)) {
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

  const setPage = useCallback(
    (p: number) => {
      const targetPage = Math.max(1, p);
      setPageState(targetPage);
      updateUrl({ page: targetPage });
    },
    [updateUrl],
  );

  const setPageSize = useCallback(
    (s: number) => {
      const targetSize = Math.max(1, s);
      setPageSizeState(targetSize);
      setPageState(1);
      updateUrl({ pageSize: targetSize, page: 1 });
    },
    [updateUrl],
  );

  const setSort = useCallback(
    (field: string) => {
      let nextSort = field;
      if (sort === field) {
        nextSort = `-${field}`;
      } else if (sort === `-${field}`) {
        nextSort = defaultSort;
      }
      setSortState(nextSort);
      setPageState(1);
      updateUrl({ sort: nextSort, page: 1 });
    },
    [sort, defaultSort, updateUrl],
  );

  // Debounced search
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const setSearch = useCallback(
    (q: string) => {
      setLocalSearch(q);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        setPageState(1);
        updateUrl({ search: q ? q : null, q: q ? q : null, page: 1 });
      }, 300);
    },
    [updateUrl],
  );

  const setFilter = useCallback(
    (key: string, value: string | string[] | null) => {
      setPageState(1);
      updateUrl({ [key]: value, page: 1 });
    },
    [updateUrl],
  );

  const clearFilters = useCallback(() => {
    setPageState(1);
    setLocalSearch("");
    const sp = new URLSearchParams();
    if (defaultSort) sp.set("sort", defaultSort);
    sp.set("page", "1");
    sp.set("pageSize", String(pageSize));
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [defaultSort, pageSize, pathname, router]);

  // Construct query params that are ALWAYS passed to the backend
  const queryParams = new URLSearchParams();
  queryParams.set("page", String(page));
  queryParams.set("pageSize", String(pageSize));
  if (sort) queryParams.set("sort", sort);
  if (localSearch) {
    queryParams.set("q", localSearch);
    queryParams.set("search", localSearch);
  }

  // Append custom filters
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      if (Array.isArray(v)) {
        v.forEach((val) => queryParams.append(k, val));
      } else {
        queryParams.set(k, String(v));
      }
    }
  });

  const queryString = queryParams.toString();
  const ws = getStoredWorkspaceId();

  // SWR key contains endpoint, query string (with page/pageSize), and current workspace
  const swrKey = [endpoint, queryString, ws || "default"];

  const { data, error, isLoading, mutate } = useSWR<ListEnvelope<TRow>>(
    swrKey,
    () => {
      const pathWithQuery = `${endpoint}?${queryString}`;
      return adminApi<ListEnvelope<TRow>>(pathWithQuery);
    },
    {
      revalidateOnFocus: true,
      dedupingInterval: 2000,
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

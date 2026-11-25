"use client";

import { useCallback, useEffect, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { useRouter } from "next/navigation";
import {
  adminApi,
  getStoredWorkspaceId,
  setStoredWorkspaceId,
  clearStoredWorkspaceId,
} from "./api";
import type { AdminAuthStatus, AdminMeResponse, SingleEnvelope } from "./types";

/**
 * Hook to retrieve staff auth status and role assignments
 */
export function useAdminStatus() {
  const { data, error, isLoading, mutate } = useSWR<SingleEnvelope<AdminAuthStatus>>(
    "/admin/auth/status",
    (url: string) => adminApi<SingleEnvelope<AdminAuthStatus>>(url),
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    },
  );

  return {
    status: data?.data,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Hook managing the active workspace ID in localStorage and server state
 */
export function useActiveWorkspace() {
  const router = useRouter();
  const { mutate: globalMutate } = useSWRConfig();
  const [workspaceId, setWorkspaceIdState] = useState<string | null>(null);

  useEffect(() => {
    setWorkspaceIdState(getStoredWorkspaceId());
  }, []);

  const switchWorkspace = useCallback(
    async (id: string) => {
      setStoredWorkspaceId(id);
      setWorkspaceIdState(id);
      try {
        await adminApi("/admin/auth/select-workspace", {
          method: "POST",
          body: { assignmentId: id },
        });
      } catch {
        // Continue even if preference save fails
      }
      // Drop all cached responses so clean permissions apply immediately
      await globalMutate(() => true, undefined, { revalidate: false });
      router.replace("/admin");
      router.refresh();
    },
    [globalMutate, router],
  );

  const clearWorkspace = useCallback(async () => {
    clearStoredWorkspaceId();
    setWorkspaceIdState(null);
    await globalMutate(() => true, undefined, { revalidate: false });
  }, [globalMutate]);

  return {
    workspaceId,
    switchWorkspace,
    clearWorkspace,
  };
}

/**
 * Hook retrieving the authenticated admin staff profile, active role and permissions.
 */
export function useAdminMe() {
  const [ws, setWs] = useState<string | null>(null);

  useEffect(() => {
    setWs(getStoredWorkspaceId());
  }, []);

  const { data, error, isLoading, mutate } = useSWR<SingleEnvelope<AdminMeResponse>>(
    ws ? ["/admin/me", ws] : ["/admin/me", "default"],
    ([url]: [string, string]) => adminApi<SingleEnvelope<AdminMeResponse>>(url),
    {
      revalidateOnFocus: true,
      dedupingInterval: 10000,
    },
  );

  const me = data?.data;
  const permissions = new Set(me?.permissions || []);

  const hasPermission = useCallback(
    (...codes: string[]): boolean => {
      if (!me) return false;
      // Super admin bypass
      if (me.role === "SUPER_ADMIN" || permissions.has("*")) return true;
      return codes.some((code) => permissions.has(code));
    },
    [me, permissions],
  );

  return {
    me,
    user: me?.user,
    assignment: me?.assignment,
    role: me?.role,
    scope: me?.scope,
    scopeLabel: me?.scopeLabel,
    permissions,
    hasPermission,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Convenience hook to check permission anywhere in UI
 */
export function usePermission(...codes: string[]): boolean {
  const { hasPermission } = useAdminMe();
  return hasPermission(...codes);
}

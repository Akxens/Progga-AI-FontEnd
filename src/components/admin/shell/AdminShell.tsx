"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useAdminStatus, useActiveWorkspace } from "@/lib/admin/useAdmin";
import { useMe } from "@/lib/useMe";
import { PageLoader } from "@/components/ui/primitives";

export interface AdminShellProps {
  children: ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading: userLoading } = useMe();
  const { status, isLoading: statusLoading } = useAdminStatus();
  const { workspaceId, switchWorkspace } = useActiveWorkspace();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // 1. Check user login
    if (userLoading || statusLoading) return;

    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    // 2. Check portal access
    if (status && !status.isPortalUser) {
      if (user.role === "STUDENT") {
        router.replace("/home");
      } else {
        router.replace("/guardian");
      }
      return;
    }

    // Allow workspace selection page to load without redirect loops
    if (pathname.startsWith("/admin/workspace")) {
      return;
    }

    if (!status) return;

    // Check workspace selection
    const assignments = status.assignments || [];
    if (assignments.length === 0) {
      router.replace("/admin/workspace");
      return;
    }

    // Auto-select if user has exactly one assignment and none is currently active
    if (!workspaceId && assignments.length === 1) {
      switchWorkspace(assignments[0].id);
      return;
    }

    // If workspace is set, check it's valid for this user
    if (workspaceId && !assignments.some((a) => a.id === workspaceId)) {
      router.replace("/admin/workspace");
      return;
    }

    if (!workspaceId) {
      router.replace("/admin/workspace");
      return;
    }
  }, [user, userLoading, status, statusLoading, workspaceId, pathname, router, switchWorkspace]);

  // Loading state
  if (userLoading || statusLoading) {
    return <PageLoader />;
  }

  // If outside main portal flow (MFA / Workspace pages), render clean container
  if (pathname.startsWith("/admin/mfa") || pathname.startsWith("/admin/workspace")) {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  // When fully gated, render standard admin layout
  return (
    <div className="flex min-h-screen bg-slate-50 text-ink">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar onMenuToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

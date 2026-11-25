import { API_BASE, ApiError } from "../api";

export const ADMIN_WORKSPACE_KEY = "progga.admin.workspace";

export interface AdminApiOptions {
  method?: string;
  body?: unknown;
  form?: FormData;
  signal?: AbortSignal;
  idempotent?: boolean;
  workspaceId?: string;
}

export function getStoredWorkspaceId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(ADMIN_WORKSPACE_KEY);
  } catch {
    return null;
  }
}

export function setStoredWorkspaceId(workspaceId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ADMIN_WORKSPACE_KEY, workspaceId);
  } catch {
    // Ignore storage quota / privacy mode exceptions
  }
}

export function clearStoredWorkspaceId(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ADMIN_WORKSPACE_KEY);
  } catch {
    // Ignore
  }
}

const offline = () =>
  new ApiError(0, "Can't reach Progga Control Centre right now. Check your internet connection.", "network");

/**
 * Typed client for Progga Control Centre admin endpoints (prefixed with `/api`).
 * Attaches X-Workspace and optional Idempotency-Key automatically.
 */
export async function adminApi<T>(path: string, opts: AdminApiOptions = {}): Promise<T> {
  const cleanPath = path.startsWith("/api/") ? path.slice(4) : path === "/api" ? "" : path;
  const normalizedPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
  const url = `${API_BASE}${normalizedPath}`;

  const headers: Record<string, string> = opts.form
    ? {}
    : { "Content-Type": "application/json" };

  const ws = opts.workspaceId || getStoredWorkspaceId();
  if (ws) {
    headers["X-Workspace"] = ws;
  }

  if (opts.idempotent) {
    try {
      headers["Idempotency-Key"] = crypto.randomUUID();
    } catch {
      headers["Idempotency-Key"] = `idemp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    }
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: opts.method ?? (opts.body || opts.form ? "POST" : "GET"),
      credentials: "include",
      signal: opts.signal,
      headers,
      body: opts.form ?? (opts.body !== undefined ? JSON.stringify(opts.body) : undefined),
    });
  } catch (err) {
    if (opts.signal?.aborted) throw err;
    throw offline();
  }

  const text = await res.text();
  let json: any = {};
  if (text && text.trim().length > 0) {
    try {
      json = JSON.parse(text);
    } catch {
      if (!res.ok) {
        throw new ApiError(res.status, res.statusText || "Server error", "server_error");
      }
      throw new ApiError(res.status, "Invalid response from server", "invalid_response");
    }
  }

  if (!res.ok) {
    const err = json?.error ?? {};
    const apiError = new ApiError(
      res.status,
      err.message ?? "Something went wrong",
      err.code ?? "error",
      err.details,
    );

    // Global redirects for admin session gates
    if (typeof window !== "undefined") {
      if (res.status === 401 && err.code === "mfa_required") {
        if (!window.location.pathname.startsWith("/admin/mfa")) {
          window.location.href = "/admin/mfa?mode=verify";
        }
      } else if (res.status === 403 && (err.code === "workspace_invalid" || err.code === "no_workspace")) {
        if (!window.location.pathname.startsWith("/admin/workspace") && !window.location.pathname.startsWith("/admin/mfa")) {
          window.location.href = "/admin/workspace";
        }
      }
    }

    throw apiError;
  }

  // If the endpoint wrapped in { data }, unwrap or return as requested
  return json as T;
}

/**
 * Standard fetcher for SWR targeting admin endpoints
 */
export const adminFetcher = <T>(path: string) => adminApi<T>(path);

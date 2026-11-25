export type ScopeType = "GLOBAL" | "LEGAL_ENTITY" | "SCHOOL" | "PROGRAMME" | "PARTNER";

export interface AdminUser {
  id: string;
  role: string;
  name?: string;
  email?: string | null;
  phone?: string | null;
}

export interface StaffProfile {
  title: string;
  department: string;
  mfaEnrolled: boolean;
  mustChangePassword: boolean;
}

export interface RoleAssignment {
  id: string;
  roleKey: string;
  roleName: string;
  scopeType: ScopeType;
  scopeId: string | null;
  scopeLabel: string;
  validUntil?: string | null;
}

export interface AdminMeResponse {
  user: AdminUser;
  assignment: RoleAssignment;
  role: string;
  permissions: string[];
  scope: {
    type: ScopeType;
    id: string | null;
  };
  scopeLabel: string;
  staffProfile?: StaffProfile;
  activeWorkspace?: {
    assignmentId: string;
    roleKey: string;
    roleName: string;
    scopeType: ScopeType;
    scopeId: string | null;
    permissions: string[];
  };
}

export interface AdminAuthStatus {
  isPortalUser: boolean;
  mustChangePassword: boolean;
  mfaEnrolled: boolean;
  mfaVerified: boolean;
  assignments: RoleAssignment[];
  lastAssignmentId?: string | null;
}

export interface ListMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  [key: string]: unknown;
}

export interface ListEnvelope<T> {
  data: T[];
  meta?: ListMeta;
}

export interface SingleEnvelope<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface LookupItem {
  value: string;
  label: string;
  meta?: Record<string, unknown>;
}

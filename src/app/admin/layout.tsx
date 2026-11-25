import { AdminShell } from "@/components/admin/shell/AdminShell";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}

import { AdminUsersProvider } from "@/components/AdminUsersProvider";
import AdminShell from "@/components/AdminShell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminUsersProvider>
      <AdminShell>{children}</AdminShell>
    </AdminUsersProvider>
  );
}

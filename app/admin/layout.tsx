import { AdminUsersProvider } from "@/components/AdminUsersProvider";
import { AdminNotificationsProvider } from "@/components/AdminNotificationsProvider";
import AdminShell from "@/components/AdminShell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminUsersProvider>
      <AdminNotificationsProvider>
        <AdminShell>{children}</AdminShell>
      </AdminNotificationsProvider>
    </AdminUsersProvider>
  );
}
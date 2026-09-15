"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminNotifications } from "@/components/AdminNotificationsProvider";

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isUsers = pathname.startsWith("/admin/users") || pathname === "/admin";
  const isSupport = pathname.startsWith("/admin/support");
  const isSettings = pathname.startsWith("/admin/settings");
  const isNotifications = pathname.startsWith("/admin/notifications");
  const { unreadCount } = useAdminNotifications();

  return (
    <div className="min-h-screen bg-ink text-paper flex flex-col">
      <header className="border-b border-line px-5 md:px-10 py-4 flex items-center justify-between sticky top-0 bg-ink z-40">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-2.5 text-[17px]">
            <span className="relative w-4 h-4 border-[1.5px] border-gold inline-block">
              <span className="absolute inset-1 bg-gold" />
            </span>
            Vaulted
            <span className="font-mono text-[11px] text-paper-dim border border-line px-2 py-0.5 ml-1">
              ADMIN
            </span>
          </Link>
          <nav className="hidden sm:flex gap-1 ml-4">
            <Link
              href="/admin"
              className={`text-[13.5px] px-3 py-1.5 ${
                isUsers ? "text-paper bg-slate" : "text-paper-dim hover:text-paper"
              }`}
            >
              Users
            </Link>
            <Link
              href="/admin/support"
              className={`text-[13.5px] px-3 py-1.5 ${
                isSupport ? "text-paper bg-slate" : "text-paper-dim hover:text-paper"
              }`}
            >
              Support
            </Link>
            <Link
              href="/admin/notifications"
              className={`text-[13.5px] px-3 py-1.5 flex items-center gap-1.5 ${
                isNotifications ? "text-paper bg-slate" : "text-paper-dim hover:text-paper"
              }`}
            >
              Notifications
              {unreadCount > 0 && (
                <span className="bg-gold text-ink text-[10px] font-mono w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
            <Link
              href="/admin/settings"
              className={`text-[13.5px] px-3 py-1.5 ${
                isSettings ? "text-paper bg-slate" : "text-paper-dim hover:text-paper"
              }`}
            >
              Settings
            </Link>
          </nav>
        </div>
        <Link href="/login" className="text-[13px] text-paper-dim">
          Log out
        </Link>
      </header>

      <main className="flex-1 px-5 md:px-10 py-8">{children}</main>
    </div>
  );
}
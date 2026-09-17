"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "@/components/SignOutButton";
import NotificationBell from "@/components/NotificationBell";

const navigation = [
  { label: "Overview", href: "/admin", active: (path: string) => path === "/admin" },
  { label: "Users", href: "/admin/users", active: (path: string) => path.startsWith("/admin/users") },
  { label: "Notifications", href: "/admin/notifications", active: (path: string) => path.startsWith("/admin/notifications") },
  { label: "Support", href: "/admin/support", active: (path: string) => path.startsWith("/admin/support") },
  { label: "Settings", href: "/admin/settings", active: (path: string) => path.startsWith("/admin/settings") },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return <div className="min-h-screen bg-ink text-paper flex flex-col"><header className="border-b border-line px-4 md:px-10 py-3 md:py-4 sticky top-0 bg-ink z-40"><div className="flex items-center justify-between gap-3"><Link href="/admin" className="flex items-center gap-2.5 text-[17px] shrink-0"><span className="relative w-4 h-4 border-[1.5px] border-gold inline-block"><span className="absolute inset-1 bg-gold" /></span>Vaulted<span className="font-mono text-[11px] text-paper-dim border border-line px-2 py-0.5 ml-1">ADMIN</span></Link><div className="flex items-center gap-3 shrink-0"><NotificationBell admin /><SignOutButton className="text-[13px] text-paper-dim" /></div></div><nav className="flex gap-1 overflow-x-auto -mx-1 px-1 mt-3 md:mt-4">{navigation.map((item) => <Link key={item.href} href={item.href} className={`text-[13.5px] px-3 py-1.5 whitespace-nowrap ${item.active(pathname) ? "text-paper bg-slate" : "text-paper-dim hover:text-paper"}`}>{item.label}</Link>)}</nav></header><main className="flex-1 px-4 sm:px-5 md:px-10 py-6 md:py-8">{children}</main></div>;
}

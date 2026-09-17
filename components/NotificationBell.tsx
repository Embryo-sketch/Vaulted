"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function NotificationBell({ admin = false }: { admin?: boolean }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const href = admin ? "/admin/notifications" : "/dashboard/notifications";

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function loadCount() {
      let query = supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .is("read_at", null);
      query = admin ? query.eq("audience", "admin") : query.eq("audience", "user");
      const { count } = await query;
      if (active) setUnreadCount(count ?? 0);
    }

    void loadCount();
    const channel = supabase
      .channel(`notification-badge-${admin ? "admin" : "user"}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, loadCount)
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [admin]);

  return (
    <Link
      href={href}
      aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
      className="relative flex items-center justify-center w-9 h-9 border border-line text-paper-dim hover:text-paper hover:border-gold transition-colors"
    >
      <svg viewBox="0 0 24 24" className="w-[17px] h-[17px]" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {unreadCount > 0 && (
        <span className="absolute -right-1.5 -top-1.5 min-w-4 h-4 px-1 rounded-full bg-gold text-ink text-[9px] leading-4 text-center font-mono">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}

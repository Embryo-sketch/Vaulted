"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Notification = {
  id: string;
  audience: "admin" | "user";
  category: string;
  title: string;
  body: string;
  href: string | null;
  subject_user_id: string | null;
  read_at: string | null;
  created_at: string;
};

const categoryStyles: Record<string, string> = {
  signup: "text-paper border-line",
  kyc: "text-gold border-gold",
  deposit: "text-gold border-gold",
  "deposit-approval": "text-gold border-gold",
  support: "text-moss border-moss",
  verification: "text-paper border-line",
};

function formatTime(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function NotificationsPage({ admin = false }: { admin?: boolean }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let active = true;
    async function load() {
      let query = supabase.from("notifications").select("id, audience, category, title, body, href, subject_user_id, read_at, created_at").order("created_at", { ascending: false });
      query = query.eq("audience", admin ? "admin" : "user");
      const { data, error: loadError } = await query;
      if (!active) return;
      if (loadError) setError(loadError.message);
      else setNotifications((data ?? []) as Notification[]);
      setLoading(false);
    }
    void load();
    const channel = supabase.channel(`notification-feed-${admin ? "admin" : "user"}`).on(
      "postgres_changes",
      { event: "*", schema: "public", table: "notifications" },
      load,
    ).subscribe();
    return () => { active = false; void supabase.removeChannel(channel); };
  }, [admin]);

  const unreadCount = notifications.filter((notification) => !notification.read_at).length;
  async function markRead(id: string) {
    setNotifications((items) => items.map((item) => item.id === id ? { ...item, read_at: item.read_at ?? new Date().toISOString() } : item));
    const { error: updateError } = await createClient().from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
    if (updateError) setError(updateError.message);
  }
  async function markAllRead() {
    const unreadIds = notifications.filter((item) => !item.read_at).map((item) => item.id);
    if (!unreadIds.length) return;
    setNotifications((items) => items.map((item) => ({ ...item, read_at: item.read_at ?? new Date().toISOString() })));
    const { error: updateError } = await createClient().from("notifications").update({ read_at: new Date().toISOString() }).in("id", unreadIds);
    if (updateError) setError(updateError.message);
  }

  return <div>
    <div className="flex items-start justify-between gap-4 mb-8">
      <div><h1 className="font-serif text-[22px] md:text-[26px] font-medium">Notifications</h1><p className="text-paper-dim text-[13.5px] mt-1">{unreadCount ? `${unreadCount} unread` : "You’re all caught up"}</p></div>
      {unreadCount > 0 && <button onClick={() => void markAllRead()} className="text-[13px] text-paper-dim border-b border-paper-dim shrink-0">Mark all as read</button>}
    </div>
    {error && <p className="mb-4 text-rust text-[13px]">{error}</p>}
    {loading ? <p className="text-paper-dim">Loading notifications…</p> : notifications.length === 0 ? <div className="border border-line border-dashed px-6 py-10 text-center text-paper-dim">No notifications yet.</div> : <div className="border-t border-line max-w-[720px]">{notifications.map((notification) => {
      const href = notification.href ?? (admin && notification.subject_user_id ? `/admin/users/${notification.subject_user_id}` : null);
      const content = <div className={`flex items-start gap-4 py-4 border-b border-line transition-colors hover:bg-slate/40 ${notification.read_at ? "" : "bg-slate/20"}`}><span className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${notification.read_at ? "bg-transparent" : "bg-gold"}`} /><div className="flex-1 min-w-0"><div className="flex items-center gap-2.5 flex-wrap mb-1"><span className={`text-[10.5px] font-mono px-1.5 py-0.5 border ${categoryStyles[notification.category] ?? "text-paper border-line"}`}>{notification.category.toUpperCase()}</span><span className="text-[14px] text-paper">{notification.title}</span></div><p className="text-[13px] text-paper-dim">{notification.body}</p></div><span className="text-[11px] font-mono text-paper-dim shrink-0 text-right">{formatTime(notification.created_at)}</span></div>;
      return href ? <Link key={notification.id} href={href} onClick={() => void markRead(notification.id)} className="block px-1 -mx-1">{content}</Link> : <button key={notification.id} onClick={() => void markRead(notification.id)} className="block w-full text-left px-1 -mx-1">{content}</button>;
    })}</div>}
  </div>;
}

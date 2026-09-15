"use client";

import Link from "next/link";
import { useAdminNotifications } from "@/components/AdminNotificationsProvider";
import type { NotificationType } from "@/lib/admin-notifications-data";

const typeColor: Record<NotificationType, string> = {
  signup: "text-paper border-line",
  support: "text-gold border-gold",
  verification: "text-moss border-moss",
  payment: "text-paper border-line",
};

const typeLabel: Record<NotificationType, string> = {
  signup: "SIGNUP",
  support: "SUPPORT",
  verification: "VERIFICATION",
  payment: "PAYMENT",
};

export default function AdminNotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useAdminNotifications();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-[22px] md:text-[26px] font-medium">
            Notifications
          </h1>
          <p className="text-paper-dim text-[13.5px] mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread`
              : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-[13px] text-paper-dim border-b border-paper-dim shrink-0"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="border border-line border-dashed px-6 py-10 text-center">
          <div className="text-[14.5px] text-paper-dim">
            No notifications yet.
          </div>
        </div>
      ) : (
        <div className="border-t border-line max-w-[680px]">
          {notifications.map((n) => {
            const content = (
              <div
                className={`flex items-start gap-4 py-4 border-b border-line transition-colors hover:bg-slate/40 ${
                  !n.read ? "bg-slate/20" : ""
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${
                    n.read ? "bg-transparent" : "bg-gold"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap mb-1">
                    <span
                      className={`text-[10.5px] font-mono px-1.5 py-0.5 border ${typeColor[n.type]}`}
                    >
                      {typeLabel[n.type]}
                    </span>
                    <span className="text-[14px] text-paper">{n.title}</span>
                  </div>
                  <div className="text-[13px] text-paper-dim">
                    {n.description}
                  </div>
                </div>
                <span className="text-[11.5px] font-mono text-paper-dim shrink-0">
                  {n.time}
                </span>
              </div>
            );

            return n.href ? (
              <Link
                key={n.id}
                href={n.href}
                onClick={() => markAsRead(n.id)}
                className="block px-1 -mx-1"
              >
                {content}
              </Link>
            ) : (
              <button
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className="block w-full text-left px-1 -mx-1"
              >
                {content}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
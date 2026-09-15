export type NotificationType = "signup" | "support" | "verification" | "payment";

export type AdminNotification = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  read: boolean;
  href?: string; // where clicking it should take you
};

export const INITIAL_NOTIFICATIONS: AdminNotification[] = [
  {
    id: "n1",
    type: "support",
    title: "New support message",
    description: "Amara Obi asked about a pending growth adjustment.",
    time: "12m ago",
    read: false,
    href: "/admin/support",
  },
  {
    id: "n2",
    type: "verification",
    title: "Verification pending",
    description: "Liam Fitzgerald signed up and is awaiting verification.",
    time: "1h ago",
    read: false,
    href: "/admin/users/u7",
  },
  {
    id: "n3",
    type: "signup",
    title: "New account created",
    description: "Priya Nair created an account.",
    time: "3h ago",
    read: false,
    href: "/admin/users/u3",
  },
  {
    id: "n4",
    type: "support",
    title: "New support message",
    description: "Tomás Alvarez asked about moving funds between tiers.",
    time: "Yesterday",
    read: true,
    href: "/admin/support",
  },
  {
    id: "n5",
    type: "payment",
    title: "Large deposit received",
    description: "Tomás Alvarez deposited 1.8 BTC.",
    time: "2 days ago",
    read: true,
    href: "/admin/users/u4",
  },
];
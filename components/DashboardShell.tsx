"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import PageFadeIn from "@/components/PageFadeIn";
import SignOutButton from "@/components/SignOutButton";
import { createClient } from "@/lib/supabase/client";
import AccountVerificationNotice from "@/components/AccountVerificationNotice";
import NotificationBell from "@/components/NotificationBell";
import SessionTimeout from "@/components/SessionTimeout";

function getInitials(name: string, email: string): string {
  const trimmed = name.trim();
  if (trimmed) {
    const parts = trimmed.split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = name.trim().split(/\s+/)[0];
  return firstName ? `${timeOfDay}, ${firstName}` : timeOfDay;
}

type NavIconName = "overview" | "invest" | "investments" | "deposit" | "transactions" | "notifications" | "about" | "faq" | "profile" | "settings";

const navItems: { label: string; href: string; icon: NavIconName }[] = [
  { label: "Overview", href: "/dashboard", icon: "overview" },
  { label: "Invest", href: "/dashboard/invest", icon: "invest" },
  { label: "Investments", href: "/dashboard/investments", icon: "investments" },
  { label: "Deposit", href: "/dashboard/deposit", icon: "deposit" },
  { label: "Transactions", href: "/dashboard/transactions", icon: "transactions" },
  { label: "Notifications", href: "/dashboard/notifications", icon: "notifications" },
  { label: "About Us", href: "/dashboard/about", icon: "about" },
  { label: "FAQ", href: "/dashboard/faq", icon: "faq" },
];

const accountItems: { label: string; href: string; icon: NavIconName }[] = [
  { label: "Profile", href: "/dashboard/profile", icon: "profile" },
  { label: "Settings", href: "/dashboard/settings", icon: "settings" },
];

function NavIcon({ name }: { name: NavIconName }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths: Record<NavIconName, ReactNode> = {
    overview: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></>,
    invest: <><path d="M4 17 10 11l4 3 6-7" /><path d="M15 7h5v5" /></>,
    investments: <><path d="M4 7.5 12 4l8 3.5-8 3.5-8-3.5Z" /><path d="m4 12 8 3.5 8-3.5M4 16.5 12 20l8-3.5" /></>,
    deposit: <><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 20h14" /></>,
    transactions: <><path d="M6 3h12v18H6z" /><path d="M9 8h6M9 12h6M9 16h3" /></>,
    notifications: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    about: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
    faq: <><circle cx="12" cy="12" r="9" /><path d="M9.7 9a2.4 2.4 0 1 1 4.2 1.6c-1.3 1-1.9 1.5-1.9 3M12 17h.01" /></>,
    profile: <><circle cx="12" cy="8" r="3" /><path d="M5 20a7 7 0 0 1 14 0" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.1 2.1-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-3v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-2.1-2.1.1-.1A1.7 1.7 0 0 0 7 15a1.7 1.7 0 0 0-1.5-1H5.3v-3h.2A1.7 1.7 0 0 0 7 10a1.7 1.7 0 0 0-.3-1.9l-.1-.1 2.1-2.1.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.2h3v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 2.1 2.1-.1.1A1.7 1.7 0 0 0 19.4 10a1.7 1.7 0 0 0 1.5 1h.2v3h-.2a1.7 1.7 0 0 0-1.5 1Z" /></>,
  };
  return <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true" {...common}>{paths[name]}</svg>;
}

function SidebarContent({
  pathname,
  onNavigate,
  fullName,
  email,
}: {
  pathname: string;
  onNavigate?: () => void;
  fullName: string;
  email: string;
}) {
  const initials = getInitials(fullName, email);
  return (
    <>
      {/* Top: logo + nav — scrolls independently if it ever overflows */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[18px] px-7 mb-12 pt-1"
          onClick={onNavigate}
        >
          <span className="relative w-4 h-4 border-[1.5px] border-gold inline-block">
            <span className="absolute inset-1 bg-gold" />
          </span>
          Vaulted
        </Link>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onNavigate}
                className={`px-7 py-2.5 text-[14.5px] border-l-2 flex items-center gap-3 ${
                  active
                    ? "border-gold text-paper bg-slate"
                    : "border-transparent text-paper-dim hover:text-paper"
                }`}
              >
                <NavIcon name={item.icon} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom: profile + account links — always pinned, never scrolls */}
      <div className="px-7 shrink-0 pt-5 border-t border-line">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-slate-2 border border-line flex items-center justify-center font-mono text-[12px] text-gold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-[13.5px] truncate">{fullName || "Unnamed user"}</div>
            <div className="text-[11.5px] text-paper-dim truncate">{email}</div>
          </div>
        </div>

        <div className="flex flex-col gap-0.5">
          {accountItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onNavigate}
                className={`text-[13px] py-1.5 flex items-center gap-2.5 ${
                  active ? "text-paper" : "text-paper-dim hover:text-paper"
                }`}
              >
                <NavIcon name={item.icon} />
                {item.label}
              </Link>
            );
          })}
          <SignOutButton
            className="w-full text-[13px] py-1.5 text-paper-dim hover:text-paper"
          />
        </div>
      </div>
    </>
  );
}

export default function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [identity, setIdentity] = useState({ fullName: "", email: "" });
  const greeting = getGreeting(identity.fullName);

  useEffect(() => {
    async function loadIdentity() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .single();
      setIdentity({
        fullName: profile?.full_name ?? "",
        email: profile?.email ?? user.email ?? "",
      });
    }
    void loadIdentity();
  }, []);

  return (
    <div className="min-h-screen bg-ink text-paper flex">
      <SessionTimeout />
      <AccountVerificationNotice />
      {/* Desktop sidebar — sticky to the viewport, independent of page scroll */}
      <aside className="w-[220px] shrink-0 border-r border-line hidden md:flex flex-col sticky top-0 h-screen py-8">
        <SidebarContent pathname={pathname} fullName={identity.fullName} email={identity.email} />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-ink/80"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="relative w-[240px] bg-ink border-r border-line flex flex-col py-8 h-full">
            <SidebarContent
              pathname={pathname}
              onNavigate={() => setDrawerOpen(false)}
              fullName={identity.fullName}
              email={identity.email}
            />
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="border-b border-line px-4 md:px-10 py-3 md:py-4 flex items-center justify-between gap-3 sticky top-0 bg-ink z-40">
          <div className="flex flex-1 items-center gap-3 min-w-0">
            <button
              className="md:hidden flex flex-col gap-[4px] p-1.5 shrink-0"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <span className="block w-4 h-[1.5px] bg-paper" />
              <span className="block w-4 h-[1.5px] bg-paper" />
              <span className="block w-4 h-[1.5px] bg-paper" />
            </button>
            <div className="md:hidden min-w-0 overflow-hidden" aria-label={greeting}>
              <div className="animate-mobile-greeting inline-flex w-max whitespace-nowrap font-serif text-[22px] text-paper">
                <span className="pr-10">{greeting}</span>
                <span className="pr-10" aria-hidden="true">{greeting}</span>
              </div>
            </div>
            <p className="hidden md:block font-serif text-[26px] text-paper truncate">
              {greeting}
            </p>
          </div>
          <div className="flex items-center gap-5 shrink-0">
            <NotificationBell />
            <Link
              href="/dashboard/deposit"
              className="bg-gold text-ink text-[13px] md:text-[13.5px] font-medium px-3.5 md:px-4 py-2"
            >
              Deposit
            </Link>
          </div>
        </header>

        <main className="flex-1 px-4 md:px-10 py-6 md:py-8">
          <PageFadeIn>{children}</PageFadeIn>
        </main>
      </div>
    </div>
  );
}

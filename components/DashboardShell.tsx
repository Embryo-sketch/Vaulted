"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Overview", href: "/dashboard" },
  { label: "Deposit", href: "/dashboard/deposit" },
  { label: "Transactions", href: "/dashboard/transactions" },
  { label: "About Us", href: "/dashboard/about" },
  { label: "FAQ", href: "/dashboard/faq" },
];

const accountItems = [
  { label: "Profile", href: "/dashboard/profile" },
  { label: "Settings", href: "/dashboard/settings" },
];

function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
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
                className={`px-7 py-2.5 text-[14.5px] border-l-2 ${
                  active
                    ? "border-gold text-paper bg-slate"
                    : "border-transparent text-paper-dim hover:text-paper"
                }`}
              >
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
            JD
          </div>
          <div className="min-w-0">
            <div className="text-[13.5px] truncate">Jane Doe</div>
            <div className="text-[11.5px] text-paper-dim truncate">
              jane@example.com
            </div>
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
                className={`text-[13px] py-1.5 ${
                  active ? "text-paper" : "text-paper-dim hover:text-paper"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/login"
            className="text-[13px] py-1.5 text-paper-dim hover:text-paper"
            onClick={onNavigate}
          >
            Log out
          </Link>
        </div>
      </div>
    </>
  );
}

export default function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ink text-paper flex">
      {/* Desktop sidebar — sticky to the viewport, independent of page scroll */}
      <aside className="w-[220px] shrink-0 border-r border-line hidden md:flex flex-col sticky top-0 h-screen py-8">
        <SidebarContent pathname={pathname} />
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
            />
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="border-b border-line px-4 md:px-10 py-4 md:py-5 flex items-center justify-between gap-3 sticky top-0 bg-ink z-40">
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="md:hidden flex flex-col gap-[4px] p-1.5 shrink-0"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <span className="block w-4 h-[1.5px] bg-paper" />
              <span className="block w-4 h-[1.5px] bg-paper" />
              <span className="block w-4 h-[1.5px] bg-paper" />
            </button>
            <div className="font-mono text-[11px] md:text-[12.5px] text-paper-dim overflow-hidden whitespace-nowrap w-full md:w-auto">
              <span className="inline-flex md:hidden gap-12 animate-topbar-marquee">
                <span>YOUR HOLDINGS ARE MANAGED AUTOMATICALLY</span>
                <span>YOUR HOLDINGS ARE MANAGED AUTOMATICALLY</span>
              </span>
              <span className="hidden md:inline">
                YOUR HOLDINGS ARE MANAGED AUTOMATICALLY
              </span>
            </div>
          </div>
          <div className="flex items-center gap-5 shrink-0">
            <Link
              href="/dashboard/deposit"
              className="bg-gold text-ink text-[13px] md:text-[13.5px] font-medium px-3.5 md:px-4 py-2"
            >
              Deposit
            </Link>
          </div>
        </header>

        <main className="flex-1 px-4 md:px-10 py-6 md:py-8">{children}</main>
      </div>
    </div>
  );
}
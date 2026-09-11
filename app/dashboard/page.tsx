"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import PortfolioCard from "@/components/PortfolioCard";
import HoldingsTable from "@/components/HoldingsTable";
import { TransactionListItem } from "@/components/TransactionRow";
import Skeleton from "@/components/Skeleton";
import { getHoldingsWithValues, getPortfolioTotal } from "@/lib/crypto-data";
import { getRecentTransactions } from "@/lib/transactions-data";
import { formatCurrency } from "@/lib/format";

const AVAILABLE_CASH = 12204.0;
const PORTFOLIO_CHANGE_PERCENT = 2.34;

function OverviewSkeleton() {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-4 md:gap-6 mb-10">
        <div className="bg-slate border border-line px-6 md:px-7 py-6 md:py-7">
          <Skeleton className="h-3.5 w-32 mb-4" />
          <Skeleton className="h-9 w-44 mb-6" />
          <Skeleton className="h-14 w-full" />
        </div>
        <div className="bg-slate border border-line px-7 py-7 flex flex-col justify-between">
          <div>
            <Skeleton className="h-3.5 w-28 mb-4" />
            <Skeleton className="h-7 w-32" />
          </div>
          <div className="flex gap-3 mt-6">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
        </div>
      </div>

      <div className="mb-10">
        <Skeleton className="h-5 w-24 mb-4" />
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>

      <div>
        <Skeleton className="h-5 w-40 mb-4" />
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 550);
    return () => clearTimeout(t);
  }, []);

  const holdings = getHoldingsWithValues();
  const total = getPortfolioTotal();
  const recentTransactions = getRecentTransactions(4);

  if (loading) {
    return (
      <DashboardShell>
        <OverviewSkeleton />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      {/* Portfolio summary */}
      <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-4 md:gap-6 mb-10">
        <PortfolioCard total={total} changePercent={PORTFOLIO_CHANGE_PERCENT} />

        <div className="bg-slate border border-line px-7 py-7 flex flex-col justify-between">
          <div>
            <div className="text-[14px] text-paper-dim mb-2">
              Available cash
            </div>
            <div className="font-mono text-[26px]">
              {formatCurrency(AVAILABLE_CASH)}
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <a
              href="/dashboard/deposit"
              className="flex-1 text-center bg-gold text-ink text-[13.5px] font-medium py-2.5"
            >
              Deposit
            </a>
            <a
              href="/dashboard/withdraw"
              className="flex-1 text-center border border-line text-paper text-[13.5px] py-2.5"
            >
              Withdraw
            </a>
          </div>
        </div>
      </div>

      {/* Holdings */}
      <div className="mb-10">
        <HoldingsTable holdings={holdings} />
      </div>

      {/* Recent transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-[20px] font-medium">
            Recent transactions
          </h2>
          <a
            href="/dashboard/transactions"
            className="text-[13.5px] text-paper-dim border-b border-paper-dim"
          >
            View all
          </a>
        </div>

        <div className="border-t border-line">
          {recentTransactions.map((tx) => (
            <TransactionListItem key={tx.id} tx={tx} />
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
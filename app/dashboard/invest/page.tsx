"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import {
  INVESTMENT_TIERS,
  getTierForAmount,
  formatTierRange,
} from "@/lib/investment-tiers";
import { formatCurrency } from "@/lib/format";

export default function InvestPage() {
  const router = useRouter();
  const [customAmount, setCustomAmount] = useState("");

  const parsedAmount = useMemo(() => {
    const n = parseFloat(customAmount.replace(/,/g, ""));
    return isNaN(n) ? null : n;
  }, [customAmount]);

  const matchedTier = parsedAmount !== null ? getTierForAmount(parsedAmount) : undefined;
  const belowMinimum = parsedAmount !== null && parsedAmount < INVESTMENT_TIERS[0].min;

  return (
    <DashboardShell>
      <h1 className="font-serif text-[22px] md:text-[26px] font-medium mb-2">
        Invest
      </h1>
      <p className="text-paper-dim text-[14.5px] mb-8 max-w-[56ch]">
        Choose a deposit tier below, or enter a custom amount to see the rate
        that applies. Rates are annualized and paid out on your balance over
        time.
      </p>

      {/* Tier cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {INVESTMENT_TIERS.map((tier) => (
          <div
            key={tier.id}
            className="bg-slate border border-line hover:border-gold transition-colors px-6 py-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-serif text-[18px]">{tier.name}</span>
                <span className="font-mono text-[20px] text-gold">
                  {tier.apr}%
                </span>
              </div>
              <div className="font-mono text-[12.5px] text-paper-dim mb-3">
                {formatTierRange(tier)}
              </div>
              <p className="text-[13.5px] text-paper-dim leading-relaxed">
                {tier.description}
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-line flex items-center justify-between">
              <span className="text-[11.5px] text-paper-dim">
                Annual percentage rate
              </span>
              <button
                onClick={() => router.push("/dashboard/deposit")}
                className="text-[12.5px] text-ink bg-gold px-3 py-1.5 font-medium"
              >
                Deposit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Flexible amount */}
      <div className="bg-slate border border-line px-6 md:px-8 py-7 max-w-[520px]">
        <h2 className="font-serif text-[18px] font-medium mb-1">
          Flexible amount
        </h2>
        <p className="text-paper-dim text-[13.5px] mb-5">
          Enter any amount to see which tier and rate it falls under.
        </p>

        <label className="block text-[13px] text-paper-dim mb-2">
          Deposit amount (USD)
        </label>
        <div className="flex items-center bg-slate-2 border border-line px-4 py-3 mb-4">
          <span className="text-paper-dim text-[14.5px] mr-1">$</span>
          <input
            type="text"
            inputMode="decimal"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="e.g. 2500"
            className="bg-transparent text-paper placeholder:text-paper-dim text-[14.5px] focus:outline-none w-full"
          />
        </div>

        {parsedAmount !== null && belowMinimum && (
          <div className="text-[13.5px] text-rust mb-4">
            Minimum deposit for a tier is {formatCurrency(INVESTMENT_TIERS[0].min)}.
          </div>
        )}

        {parsedAmount !== null && matchedTier && (
          <div className="border-t border-line pt-4 mb-5 flex items-center justify-between">
            <div>
              <div className="text-[13px] text-paper-dim">
                {matchedTier.name} tier
              </div>
              <div className="font-mono text-[13px] text-paper-dim mt-0.5">
                {formatTierRange(matchedTier)}
              </div>
            </div>
            <div className="font-mono text-[26px] text-gold">
              {matchedTier.apr}%
            </div>
          </div>
        )}

        <button
          disabled={!matchedTier}
          onClick={() => router.push("/dashboard/deposit")}
          className="bg-gold text-ink font-medium text-[14px] px-5 py-2.5 w-full disabled:opacity-40"
        >
          {matchedTier
            ? `Deposit at ${matchedTier.apr}% APR`
            : "Enter an amount to continue"}
        </button>
      </div>
    </DashboardShell>
  );
}
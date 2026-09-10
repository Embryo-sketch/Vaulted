"use client";

import { useState } from "react";
import { TransactionTableRow } from "@/components/TransactionRow";
import { TRANSACTIONS, type TransactionType } from "@/lib/transactions-data";

const filters: ("All" | TransactionType)[] = ["All", "Deposit", "Growth", "Withdraw"];

export default function TransactionsTable() {
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("All");

  const visible =
    activeFilter === "All"
      ? TRANSACTIONS
      : TRANSACTIONS.filter((tx) => tx.type === activeFilter);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="font-serif text-[22px] md:text-[26px] font-medium">
          Transactions
        </h1>
        <div className="flex gap-2 overflow-x-auto">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`text-[13px] px-3.5 py-1.5 border shrink-0 ${
                activeFilter === f
                  ? "bg-gold text-ink border-gold font-medium"
                  : "border-line text-paper-dim"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="border border-line border-dashed px-6 py-10 text-center">
          <div className="text-[14.5px] text-paper-dim">
            No {activeFilter.toLowerCase()} transactions yet.
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <table className="w-full border-collapse min-w-[560px]">
            <thead>
              <tr>
                <th className="text-left font-mono text-[12px] text-paper-dim font-normal pb-3 border-b border-line">
                  Date
                </th>
                <th className="text-left font-mono text-[12px] text-paper-dim font-normal pb-3 border-b border-line">
                  Type
                </th>
                <th className="text-right font-mono text-[12px] text-paper-dim font-normal pb-3 border-b border-line">
                  Amount
                </th>
                <th className="text-right font-mono text-[12px] text-paper-dim font-normal pb-3 border-b border-line">
                  Value
                </th>
                <th className="text-right font-mono text-[12px] text-paper-dim font-normal pb-3 border-b border-line">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((tx) => (
                <TransactionTableRow key={tx.id} tx={tx} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
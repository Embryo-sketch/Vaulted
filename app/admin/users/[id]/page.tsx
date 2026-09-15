"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAdminUsers } from "@/components/AdminUsersProvider";
import type { AdminUser } from "@/lib/admin-users-data";
import { getUserTransactions } from "@/lib/admin-transactions-data";
import { TransactionTableRow } from "@/components/TransactionRow";
import { formatCurrency } from "@/lib/format";

type PaymentLogEntry = {
  id: string;
  type: "Deposit" | "Growth adjustment" | "Withdrawal";
  amount: number;
  note: string;
  timestamp: string;
};

const statusOptions: AdminUser["status"][] = ["Verified", "Pending", "Suspended"];

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { getUser, updateUser, deleteUser } = useAdminUsers();
  const user = getUser(id);
  const userTransactions = getUserTransactions(id);

  // All hooks run unconditionally, on every render, regardless of
  // whether `user` was found — the "not found" branch happens after.
  const [status, setStatus] = useState<AdminUser["status"]>(user?.status ?? "Pending");
  const [portfolioValue, setPortfolioValue] = useState((user?.portfolioValue ?? 0).toString());
  const [availableCash, setAvailableCash] = useState((user?.availableCash ?? 0).toString());
  const [saved, setSaved] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentType, setPaymentType] = useState<PaymentLogEntry["type"]>("Deposit");
  const [paymentNote, setPaymentNote] = useState("");
  const [log, setLog] = useState<PaymentLogEntry[]>([]);

  if (!user) {
    return (
      <div>
        <Link href="/admin" className="text-[13.5px] text-paper-dim mb-6 inline-block">
          ← Back to users
        </Link>
        <div className="border border-line border-dashed px-6 py-10 text-center">
          <div className="text-[14.5px] text-paper-dim">
            No user found with id &quot;{id}&quot;.
          </div>
        </div>
      </div>
    );
  }

  function handleSaveDetails() {
    updateUser(id, {
      status,
      portfolioValue: parseFloat(portfolioValue) || 0,
      availableCash: parseFloat(availableCash) || 0,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleApplyPayment() {
    const amount = parseFloat(paymentAmount.replace(/,/g, ""));
    if (isNaN(amount) || amount === 0) return;

    const signedAmount = paymentType === "Withdrawal" ? -Math.abs(amount) : Math.abs(amount);
    const newValue = parseFloat(portfolioValue) + signedAmount;

    setPortfolioValue(newValue.toString());
    updateUser(id, { portfolioValue: newValue });

    setLog((prev) => [
      {
        id: Date.now().toString(),
        type: paymentType,
        amount: signedAmount,
        note: paymentNote || "—",
        timestamp: "Just now",
      },
      ...prev,
    ]);

    setPaymentAmount("");
    setPaymentNote("");
  }

  function handleDeleteUser() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    deleteUser(id);
    router.push("/admin");
  }

  return (
    <div>
      <Link href="/admin" className="text-[13.5px] text-paper-dim mb-6 inline-block">
        ← Back to users
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-2 border border-line flex items-center justify-center font-mono text-[15px] text-gold shrink-0">
            {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <h1 className="font-serif text-[20px] md:text-[24px] font-medium">
              {user.name}
            </h1>
            <div className="font-mono text-[12.5px] text-paper-dim">{user.email}</div>
          </div>
        </div>
        <button
          onClick={handleDeleteUser}
          onBlur={() => setConfirmingDelete(false)}
          className={`text-[13px] px-3.5 py-1.5 shrink-0 ${
            confirmingDelete
              ? "bg-rust text-paper border border-rust"
              : "border border-rust text-rust"
          }`}
        >
          {confirmingDelete ? "Confirm delete" : "Delete user"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-[900px]">
        {/* Account details */}
        <section>
          <h2 className="font-mono text-[12.5px] text-gold mb-5">
            ACCOUNT DETAILS
          </h2>
          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-[13px] text-paper-dim mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AdminUser["status"])}
                className="w-full bg-slate border border-line text-paper px-4 py-3 text-[14.5px] focus:outline-none focus:border-gold"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[13px] text-paper-dim mb-2">
                Portfolio value (USD)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={portfolioValue}
                onChange={(e) => setPortfolioValue(e.target.value)}
                className="w-full bg-slate border border-line text-paper px-4 py-3 text-[14.5px] font-mono focus:outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="block text-[13px] text-paper-dim mb-2">
                Available cash (USD)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={availableCash}
                onChange={(e) => setAvailableCash(e.target.value)}
                className="w-full bg-slate border border-line text-paper px-4 py-3 text-[14.5px] font-mono focus:outline-none focus:border-gold"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveDetails}
                className="bg-gold text-ink font-medium text-[14px] px-5 py-2.5"
              >
                Save changes
              </button>
              {saved && <span className="text-[13px] text-moss">Saved</span>}
            </div>
          </div>
        </section>

        {/* Record a payment */}
        <section>
          <h2 className="font-mono text-[12.5px] text-gold mb-5">
            RECORD A PAYMENT
          </h2>
          <div className="bg-slate border border-line px-6 py-6 mb-5">
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[13px] text-paper-dim mb-2">
                  Type
                </label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value as PaymentLogEntry["type"])}
                  className="w-full bg-slate-2 border border-line text-paper px-4 py-2.5 text-[14px] focus:outline-none focus:border-gold"
                >
                  <option>Deposit</option>
                  <option>Growth adjustment</option>
                  <option>Withdrawal</option>
                </select>
              </div>
              <div>
                <label className="block text-[13px] text-paper-dim mb-2">
                  Amount (USD)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full bg-slate-2 border border-line text-paper placeholder:text-paper-dim px-4 py-2.5 text-[14px] font-mono focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-[13px] text-paper-dim mb-2">
                  Note (optional)
                </label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="e.g. Manual BTC deposit credit"
                  className="w-full bg-slate-2 border border-line text-paper placeholder:text-paper-dim px-4 py-2.5 text-[14px] focus:outline-none focus:border-gold"
                />
              </div>
              <button
                onClick={handleApplyPayment}
                disabled={!paymentAmount}
                className="bg-gold text-ink font-medium text-[14px] px-5 py-2.5 disabled:opacity-40"
              >
                Apply to portfolio value
              </button>
            </div>
          </div>

          <div className="text-[12px] font-mono text-paper-dim mb-3">
            THIS SESSION&apos;S LOG
          </div>
          {log.length === 0 ? (
            <div className="text-[13px] text-paper-dim border border-line border-dashed px-4 py-4">
              No adjustments applied yet.
            </div>
          ) : (
            <div className="border-t border-line">
              {log.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between py-3 border-b border-line text-[13.5px]"
                >
                  <div>
                    <div>{entry.type}</div>
                    <div className="text-[11.5px] text-paper-dim mt-0.5">
                      {entry.note}
                    </div>
                  </div>
                  <span
                    className={`font-mono text-[13.5px] ${
                      entry.amount < 0 ? "text-rust" : "text-moss"
                    }`}
                  >
                    {entry.amount < 0 ? "-" : "+"}
                    {formatCurrency(Math.abs(entry.amount))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Transaction history */}
      <div className="mt-10 max-w-[900px]">
        <h2 className="font-mono text-[12.5px] text-gold mb-5">
          TRANSACTION HISTORY
        </h2>
        {userTransactions.length === 0 ? (
          <div className="border border-line border-dashed px-6 py-8 text-center">
            <div className="text-[14.5px] text-paper-dim">
              This user has no transactions yet.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5 px-5 md:mx-0 md:px-0">
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
                {userTransactions.map((tx) => (
                  <TransactionTableRow key={tx.id} tx={tx} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
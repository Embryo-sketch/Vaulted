"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import CryptoIcon from "@/components/CryptoIcon";
import { formatCurrency } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";

type Transaction = {
  id: string;
  type: string;
  amount: number;
  note: string | null;
  crypto_currency: string | null;
  crypto_amount: number | null;
  created_at: string;
};

type ManualDepositRequest = {
  id: string;
  amount: number;
  note: string | null;
  status: "Pending" | "Rejected" | "Approved" | "Cancelled";
  rejection_reason: string | null;
  created_at: string;
};

type Activity = {
  id: string;
  kind: "transaction" | "manual-deposit";
  title: string;
  amount: number;
  note: string | null;
  status: "Completed" | "Pending" | "Rejected";
  cryptoCurrency: string | null;
  cryptoAmount: number | null;
  createdAt: string;
};

function statusClass(status: Activity["status"]) {
  if (status === "Completed") return "text-moss border-moss";
  if (status === "Rejected") return "text-rust border-rust";
  return "text-gold border-gold";
}

export default function TransactionsPage() {
  const [items, setItems] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: transactions, error: transactionError }, { data: manualRequests, error: manualRequestError }] = await Promise.all([
        supabase
          .from("transactions")
          .select("id, type, amount, note, crypto_currency, crypto_amount, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("manual_deposit_requests")
          .select("id, amount, note, status, rejection_reason, created_at")
          .eq("user_id", user.id)
          .in("status", ["Pending", "Rejected"])
          .order("created_at", { ascending: false }),
      ]);

      if (!active) return;
      if (transactionError || manualRequestError) {
        setError(transactionError?.message ?? manualRequestError?.message ?? "Unable to load transactions.");
        setLoading(false);
        return;
      }

      const completed = ((transactions ?? []) as Transaction[]).map((transaction): Activity => ({
        id: `transaction-${transaction.id}`,
        kind: "transaction",
        title: transaction.crypto_currency ? `${transaction.type} · ${transaction.crypto_currency}` : transaction.type,
        amount: Number(transaction.amount),
        note: transaction.note,
        status: "Completed",
        cryptoCurrency: transaction.crypto_currency,
        cryptoAmount: transaction.crypto_amount,
        createdAt: transaction.created_at,
      }));
      const awaitingReview = ((manualRequests ?? []) as ManualDepositRequest[]).map((request): Activity => ({
        id: `manual-${request.id}`,
        kind: "manual-deposit",
        title: "Manual deposit",
        amount: Number(request.amount),
        note: request.status === "Rejected"
          ? `Rejected: ${request.rejection_reason ?? "No reason provided."}`
          : request.note ?? "Awaiting approval",
        status: request.status === "Rejected" ? "Rejected" : "Pending",
        cryptoCurrency: null,
        cryptoAmount: null,
        createdAt: request.created_at,
      }));

      setItems([...completed, ...awaitingReview].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, []);

  return (
    <DashboardShell>
      <div className="max-w-[1000px]">
        <h1 className="font-serif text-[22px] md:text-[26px] font-medium">Transactions</h1>
        <p className="text-paper-dim text-[14px] mt-2 mb-8">Completed, pending, and rejected account activity.</p>
        {error && <p className="mb-5 text-rust text-[14px]">{error}</p>}
        {loading ? <p className="text-paper-dim">Loading transactions…</p> : items.length === 0 ? <div className="border border-dashed border-line px-6 py-10 text-center text-paper-dim">No transactions yet.</div> : (
          <div className="border-t border-line">
            <div className="hidden md:grid grid-cols-[150px_1fr_150px_140px] gap-5 py-3 border-b border-line font-mono text-[12px] text-paper-dim">
              <span>Date</span><span>Type</span><span>Status</span><span className="text-right">Amount</span>
            </div>
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-[150px_1fr_150px_140px] gap-2 md:gap-5 py-4 border-b border-line text-[14px]">
                <span className="font-mono text-paper-dim text-[13px]">{new Date(item.createdAt).toLocaleDateString()}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {item.cryptoCurrency && <CryptoIcon sym={item.cryptoCurrency} size={20} />}
                    <span>{item.title}</span>
                  </div>
                  {item.cryptoCurrency && item.cryptoAmount !== null && <p className="font-mono text-[12px] text-paper-dim mt-1">{item.cryptoAmount} {item.cryptoCurrency}</p>}
                  {item.note && <p className={`text-[12.5px] mt-1 ${item.status === "Rejected" ? "text-rust" : "text-paper-dim"}`}>{item.note}</p>}
                </div>
                <span className={`font-mono text-[11px] border px-2 py-1 self-start w-fit ${statusClass(item.status)}`}>{item.status.toUpperCase()}</span>
                <span className="font-mono md:text-right">{formatCurrency(item.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

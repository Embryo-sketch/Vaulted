"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import CryptoIcon from "@/components/CryptoIcon";
import { formatCurrency } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";

type Transaction = { id: string; type: "Deposit" | "Growth" | "Withdraw"; amount: number; note: string | null; crypto_currency: string | null; crypto_amount: number | null; created_at: string };

function labelFor(transaction: Transaction) {
  if (transaction.crypto_currency) return "Crypto deposit";
  if (transaction.type === "Deposit") return "Manual cash deposit";
  if (transaction.type === "Growth") return "Growth adjustment";
  return "Withdrawal";
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function loadTransactions() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("transactions").select("id, type, amount, note, crypto_currency, crypto_amount, created_at").eq("user_id", user.id).order("created_at", { ascending: false });
        setTransactions((data ?? []) as Transaction[]);
      }
      setLoading(false);
    }
    void loadTransactions();
  }, []);

  return <DashboardShell><h1 className="font-serif text-[22px] md:text-[26px] font-medium mb-8">Transactions</h1>{loading ? <p className="text-paper-dim">Loading transactions…</p> : transactions.length === 0 ? <div className="border border-line border-dashed px-6 py-10 text-center text-paper-dim">No transactions yet.</div> : <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0"><table className="w-full min-w-[680px] border-collapse"><thead><tr>{["Date", "Transaction", "Asset / note", "Amount", "USD value"].map((heading, index) => <th key={heading} className={`font-mono text-[12px] text-paper-dim font-normal pb-3 border-b border-line ${index > 2 ? "text-right" : "text-left"}`}>{heading}</th>)}</tr></thead><tbody>{transactions.map((transaction) => {
    const crypto = transaction.crypto_currency;
    const signedUsd = transaction.type === "Withdraw" ? -Math.abs(Number(transaction.amount)) : Number(transaction.amount);
    return <tr key={transaction.id} className="hover:bg-slate/40"><td className="py-4 border-b border-line font-mono text-[13px] text-paper-dim">{new Date(transaction.created_at).toLocaleDateString()}</td><td className="py-4 border-b border-line"><span className={transaction.type === "Withdraw" ? "text-rust" : transaction.type === "Growth" ? "text-moss" : "text-paper"}>{labelFor(transaction)}</span></td><td className="py-4 border-b border-line text-paper-dim">{crypto ? <div className="flex items-center gap-2.5"><CryptoIcon sym={crypto} size={22} /><span className="font-mono text-paper">{crypto}</span></div> : transaction.note ?? "—"}</td><td className="py-4 border-b border-line font-mono text-right">{crypto ? `${Number(transaction.crypto_amount)} ${crypto}` : "—"}</td><td className={`py-4 border-b border-line font-mono text-right ${signedUsd < 0 ? "text-rust" : ""}`}>{signedUsd < 0 ? "−" : "+"}{formatCurrency(Math.abs(signedUsd))}</td></tr>;
  })}</tbody></table></div>}</DashboardShell>;
}

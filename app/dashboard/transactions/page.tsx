"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { formatCurrency } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";

type Transaction = { id: string; type: string; amount: number; note: string | null; created_at: string };

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { async function loadTransactions() { const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser(); if (user) { const { data } = await supabase.from("transactions").select("id, type, amount, note, created_at").eq("user_id", user.id).order("created_at", { ascending: false }); setTransactions(data ?? []); } setLoading(false); } void loadTransactions(); }, []);
  return <DashboardShell><h1 className="font-serif text-[22px] md:text-[26px] font-medium mb-8">Transactions</h1>{loading ? <p className="text-paper-dim">Loading transactions…</p> : transactions.length === 0 ? <div className="border border-line border-dashed px-6 py-10 text-center text-paper-dim">No transactions yet.</div> : <div className="overflow-x-auto"><table className="w-full border-collapse min-w-[560px]"><thead><tr>{["Date", "Type", "Note", "Amount"].map((heading) => <th key={heading} className="text-left font-mono text-[12px] text-paper-dim font-normal pb-3 border-b border-line">{heading}</th>)}</tr></thead><tbody>{transactions.map((transaction) => <tr key={transaction.id} className="hover:bg-slate/40"><td className="py-4 border-b border-line font-mono text-[13px] text-paper-dim">{new Date(transaction.created_at).toLocaleDateString()}</td><td className="py-4 border-b border-line">{transaction.type}</td><td className="py-4 border-b border-line text-paper-dim">{transaction.note ?? "—"}</td><td className="py-4 border-b border-line font-mono text-right">{formatCurrency(transaction.amount)}</td></tr>)}</tbody></table></div>}</DashboardShell>;
}

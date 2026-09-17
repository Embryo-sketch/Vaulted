"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import PortfolioCard from "@/components/PortfolioCard";
import Skeleton from "@/components/Skeleton";
import CryptoIcon from "@/components/CryptoIcon";
import { formatCurrency } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";

type Profile = { portfolio_value: number; available_cash: number };
type Transaction = { id: string; type: string; amount: number; note: string | null; created_at: string };
type Holding = { crypto_currency: string; crypto_amount: number; usd_value: number };

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAccount() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [{ data: account, error: profileError }, { data: activity, error: transactionError }, { data: userHoldings, error: holdingsError }] = await Promise.all([
        supabase.from("profiles").select("portfolio_value, available_cash").eq("id", user.id).single(),
        supabase.from("transactions").select("id, type, amount, note, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(4),
        supabase.from("holdings").select("crypto_currency, crypto_amount, usd_value").eq("user_id", user.id).order("updated_at", { ascending: false }),
      ]);
      if (profileError || transactionError || holdingsError) {
        setError(profileError?.message ?? transactionError?.message ?? holdingsError?.message ?? "Unable to load your account.");
        return;
      }
      setProfile(account);
      setTransactions(activity ?? []);
      setHoldings(userHoldings ?? []);
    }
    void loadAccount();
  }, []);

  return <DashboardShell>
    {!profile && !error ? <Skeleton className="h-64 w-full" /> : <>
      {error && <p className="mb-6 text-[14px] text-rust">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-4 md:gap-6 mb-10">
        <PortfolioCard total={profile?.portfolio_value ?? 0} changePercent={0} />
        <div className="bg-slate border border-line px-7 py-7 flex flex-col justify-between"><div><div className="text-[14px] text-paper-dim mb-2">Available cash</div><div className="font-mono text-[26px]">{formatCurrency(profile?.available_cash ?? 0)}</div></div><div className="flex gap-3 mt-6"><a href="/dashboard/deposit" className="flex-1 text-center bg-gold text-ink text-[13.5px] font-medium py-2.5">Deposit</a><a href="/dashboard/withdraw" className="flex-1 text-center border border-line text-paper text-[13.5px] py-2.5">Withdraw</a></div></div>
      </div>
      <section className="mb-10"><h2 className="font-serif text-[20px] font-medium mb-4">Holdings</h2>{holdings.length === 0 ? <div className="border border-line border-dashed px-6 py-8 text-paper-dim text-[14px]">No holdings have been recorded yet.</div> : <div className="overflow-x-auto"><table className="w-full min-w-[440px] border-collapse"><thead><tr><th className="text-left font-mono text-[12px] text-paper-dim font-normal pb-3 border-b border-line">Asset</th><th className="text-right font-mono text-[12px] text-paper-dim font-normal pb-3 border-b border-line">Amount</th><th className="text-right font-mono text-[12px] text-paper-dim font-normal pb-3 border-b border-line">USD value</th></tr></thead><tbody>{holdings.map((holding) => <tr key={holding.crypto_currency}><td className="py-4 border-b border-line"><div className="flex items-center gap-3"><CryptoIcon sym={holding.crypto_currency} size={26} /><span>{holding.crypto_currency}</span></div></td><td className="text-right py-4 border-b border-line font-mono">{Number(holding.crypto_amount)} {holding.crypto_currency}</td><td className="text-right py-4 border-b border-line font-mono">{formatCurrency(holding.usd_value)}</td></tr>)}</tbody></table></div>}</section>
      <section><div className="flex items-center justify-between mb-4"><h2 className="font-serif text-[20px] font-medium">Recent transactions</h2><a href="/dashboard/transactions" className="text-[13.5px] text-paper-dim border-b border-paper-dim">View all</a></div>{transactions.length === 0 ? <div className="border border-line border-dashed px-6 py-8 text-paper-dim text-[14px]">No transactions yet.</div> : <div className="border-t border-line">{transactions.map((transaction) => <div key={transaction.id} className="flex justify-between gap-4 py-4 border-b border-line text-[14px]"><div><span>{transaction.type}</span>{transaction.note && <span className="text-paper-dim"> — {transaction.note}</span>}</div><span className="font-mono">{formatCurrency(transaction.amount)}</span></div>)}</div>}</section>
    </>}
  </DashboardShell>;
}

"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import { INVESTMENT_TIERS } from "@/lib/investment-tiers";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/format";

function CashInvestContent() {
  const query = useSearchParams();
  const tier = INVESTMENT_TIERS.find((item) => item.id === query.get("tier")) ?? INVESTMENT_TIERS[0];
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadBalance() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("available_cash").eq("id", user.id).single();
      setBalance(data?.available_cash ?? 0);
    }
    void loadBalance();
  }, []);

  async function invest() {
    const value = Number(amount);
    if (!value || value !== tier.min) {
      setMessage(value > tier.min ? "Select higher tier for this amount." : `This tier requires exactly ${formatCurrency(tier.min)}.`);
      return;
    }
    if (value > balance) {
      setMessage("Your available cash balance is not enough for this investment.");
      return;
    }
    const { error } = await createClient().rpc("invest_with_cash", {
      investment_tier: tier.id,
      investment_amount: value,
    });
    setMessage(error ? error.message : "Investment submitted successfully.");
    if (!error) setBalance((current) => current - value);
  }

  return <DashboardShell><div className="max-w-[540px]">
    <p className="text-gold font-mono text-[12px]">{tier.name.toUpperCase()} · {formatCurrency(tier.min)}</p>
    <h1 className="font-serif text-[26px] mt-2">Invest with cash</h1>
    <div className="bg-slate border border-line p-6 mt-6">
      <p className="text-paper-dim">Available cash</p>
      <p className="font-mono text-[28px] mt-1">{formatCurrency(balance)}</p>
      <label className="block text-paper-dim text-[13px] mt-6 mb-2">Investment amount</label>
      <input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" placeholder="0.00" className="w-full bg-slate-2 border border-line p-3" />
      <p className="text-paper-dim text-[12px] mt-2">This tier requires exactly {formatCurrency(tier.min)}.</p>
      {message && <p className="mt-4 text-gold text-[13px]">{message}</p>}
      <button onClick={() => void invest()} className="mt-5 bg-gold text-ink px-5 py-3">Invest</button>
    </div>
  </div></DashboardShell>;
}

export default function CashInvestPage() {
  return <Suspense fallback={<DashboardShell><p className="text-paper-dim">Loading investment options…</p></DashboardShell>}>
    <CashInvestContent />
  </Suspense>;
}

"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import DashboardShell from "@/components/DashboardShell";
import CryptoIcon from "@/components/CryptoIcon";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/format";

type Investment = {
  id: string; tier: string; source: "cash" | "crypto" | "mixed"; amount: number;
  crypto_currency: string | null; crypto_amount: number | null; created_at: string; updated_at: string;
};

function sourceLabel(source: Investment["source"]) {
  if (source === "cash") return "available cash";
  if (source === "crypto") return "crypto holdings";
  return "cash and crypto holdings";
}

export default function InvestmentsPage() {
  const [items, setItems] = useState<Investment[]>([]);
  const [closeTier, setCloseTier] = useState<string | null>(null);

  useEffect(() => {
    async function loadInvestments() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("investments")
        .select("id, tier, source, amount, crypto_currency, crypto_amount, created_at, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      setItems((data ?? []) as Investment[]);
    }
    void loadInvestments();
  }, []);

  return <DashboardShell>
    <h1 className="font-serif text-[26px]">Investments</h1>
    <p className="text-paper-dim mt-2 mb-8">Your active investments by tier.</p>
    {!items.length ? <div className="border border-dashed border-line p-8 text-paper-dim">No investments yet.</div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((investment) => <div key={investment.id} className="bg-slate border border-line p-6">
        <div className="flex justify-between gap-4"><h2 className="font-serif text-[21px] capitalize">{investment.tier}</h2><span className="font-mono text-gold">{formatCurrency(investment.amount)}</span></div>
        <p className="text-paper-dim text-[13px] mt-3">Invested with {sourceLabel(investment.source)}</p>
        {investment.crypto_currency && <div className="flex items-center gap-2 mt-3"><CryptoIcon sym={investment.crypto_currency} size={20} /><span className="font-mono text-[13px]">{investment.crypto_amount} {investment.crypto_currency}</span></div>}
        <div className="flex items-center justify-between gap-3 mt-5"><p className="text-paper-dim text-[12px]">Updated {new Date(investment.updated_at ?? investment.created_at).toLocaleDateString()}</p><button onClick={() => setCloseTier(investment.tier)} className="text-gold text-[13px] border-b border-gold">Close investment</button></div>
      </div>)}
    </div>}
    {closeTier && createPortal(<div className="fixed inset-0 z-[70] bg-ink/80 flex items-center justify-center p-4"><div className="w-full max-w-[400px] bg-slate border border-gold p-6 text-center"><h2 className="font-serif text-[24px]">Close {closeTier} investment</h2><p className="text-paper-dim mt-3">Contact your broker.</p><button onClick={() => setCloseTier(null)} className="mt-6 bg-gold text-ink px-5 py-3">Understood</button></div></div>, document.body)}
  </DashboardShell>;
}

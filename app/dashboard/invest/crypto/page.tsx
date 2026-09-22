"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import CryptoIcon from "@/components/CryptoIcon";
import { INVESTMENT_TIERS } from "@/lib/investment-tiers";
import { createClient } from "@/lib/supabase/client";

type Holding = { crypto_currency: string; crypto_amount: number; usd_value: number };

const coinIds: Record<string, string> = {
  BTC: "bitcoin", ETH: "ethereum", SOL: "solana", AVAX: "avalanche-2",
  USDT: "tether", USDC: "usd-coin", BNB: "binancecoin", XRP: "ripple",
  DOGE: "dogecoin", ADA: "cardano", DOT: "polkadot", LINK: "chainlink",
};

export default function CryptoInvestPage() {
  const params = useSearchParams();
  const tier = INVESTMENT_TIERS.find((item) => item.id === params.get("tier")) ?? INVESTMENT_TIERS[0];
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [selected, setSelected] = useState<Holding | null>(null);
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadHoldings() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("holdings").select("crypto_currency, crypto_amount, usd_value").eq("user_id", user.id);
      setHoldings(data ?? []);
    }
    void loadHoldings();
  }, []);

  useEffect(() => {
    if (!selected) return;
    const fallback = selected.usd_value / selected.crypto_amount;
    const coinId = coinIds[selected.crypto_currency];
    if (!coinId) {
      Promise.resolve(fallback).then(setPrice);
      return;
    }
    const loadLivePrice = () => {
      fetch(`/api/markets?ids=${coinId}`)
        .then((response) => response.json())
        .then((data) => setPrice(data?.[0]?.current_price ?? fallback))
        .catch(() => setPrice(fallback));
    };
    loadLivePrice();
    const timer = window.setInterval(loadLivePrice, 45_000);
    return () => window.clearInterval(timer);
  }, [selected]);

  const usdValue = Number(amount || 0) * price;

  async function submit() {
    if (!selected) return;
    if (!Number(amount) || Math.abs(usdValue - tier.min) > 0.01) {
      setMessage(usdValue > tier.min ? "Select higher tier for this amount." : `This tier requires exactly $${tier.min.toLocaleString()}.`);
      return;
    }
    if (Number(amount) > selected.crypto_amount) { setMessage("This amount is greater than your available holding."); return; }
    const { error } = await createClient().rpc("invest_with_crypto", {
      investment_tier: tier.id, investment_crypto: selected.crypto_currency,
      investment_crypto_amount: Number(amount), investment_usd_amount: usdValue,
    });
    setMessage(error ? error.message : "Investment created successfully.");
    if (!error) {
      setHoldings((items) => items.map((item) => item.crypto_currency === selected.crypto_currency ? { ...item, crypto_amount: item.crypto_amount - Number(amount) } : item));
      setSelected(null); setAmount("");
    }
  }

  return <DashboardShell><div className="max-w-[650px]">
    <p className="font-mono text-gold text-[12px]">{tier.name.toUpperCase()} · ${tier.min.toLocaleString()}</p>
    <h1 className="font-serif text-[26px] mt-2">Invest with crypto</h1>
    <p className="text-paper-dim mt-2">Select a holding. Quotes update from the live market every 45 seconds.</p>
    <div className="mt-6 border-t border-line">
      {holdings.map((holding) => <button key={holding.crypto_currency} onClick={() => { setSelected(holding); setAmount(""); setMessage(""); }} className="w-full flex items-center justify-between p-4 border-b border-line hover:bg-slate text-left">
        <span className="flex items-center gap-3"><CryptoIcon sym={holding.crypto_currency} />{holding.crypto_currency}</span>
        <span className="font-mono">{holding.crypto_amount} {holding.crypto_currency}</span>
      </button>)}
      {!holdings.length && <p className="p-5 text-paper-dim">No crypto holdings are available to invest.</p>}
    </div>
    {selected && createPortal(<div className="fixed inset-0 z-[70] bg-ink/80 flex items-center justify-center p-4"><div className="bg-slate border border-gold p-6 w-full max-w-[440px]">
      <button className="float-right text-paper-dim" onClick={() => setSelected(null)} aria-label="Close">×</button>
      <h2 className="font-serif text-[23px]">Invest {selected.crypto_currency}</h2>
      <p className="text-paper-dim text-[13px] mt-2">Available: {selected.crypto_amount} {selected.crypto_currency}</p>
      <p className="font-mono text-gold text-[13px] mt-2">Live price: ${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
      <label className="block mt-5 text-paper-dim text-[13px]">Crypto amount</label>
      <input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" className="mt-2 w-full bg-slate-2 border border-line p-3" placeholder={`Amount in ${selected.crypto_currency}`} />
      <button onClick={() => setAmount((tier.min / price).toFixed(8))} disabled={!price} className="mt-3 text-gold text-[13px] underline disabled:opacity-40">Use the amount for exactly ${tier.min.toLocaleString()}</button>
      <p className="font-mono text-gold mt-3">≈ ${usdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD</p>
      <p className="text-paper-dim text-[12px]">This tier requires exactly ${tier.min.toLocaleString()}.</p>
      {message && <p className="text-gold text-[13px] mt-3">{message}</p>}
      <button onClick={() => void submit()} className="mt-5 bg-gold text-ink px-5 py-3">Invest</button>
    </div></div>, document.body)}
  </div></DashboardShell>;
}

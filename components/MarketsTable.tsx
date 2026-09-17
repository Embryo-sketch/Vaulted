"use client";

import { useEffect, useState } from "react";
import CryptoIcon from "@/components/CryptoIcon";

type MarketAsset = { id: string; symbol: string; name: string; current_price: number; price_change_percentage_24h: number | null; price_change_percentage_7d_in_currency: number | null; market_cap: number; };

function money(value: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: value >= 1 ? 2 : 4 }).format(value); }
function cap(value: number) { return new Intl.NumberFormat("en-US", { notation: "compact", style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value); }
function change(value: number | null) { if (value === null || Number.isNaN(value)) return "—"; return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`; }

export default function MarketsTable() {
  const [assets, setAssets] = useState<MarketAsset[]>([]);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await fetch("/api/markets", { cache: "no-store" });
        if (!response.ok) throw new Error("Market data unavailable");
        const data = await response.json() as MarketAsset[];
        if (active) { setAssets(data); setUpdatedAt(new Date()); setUnavailable(false); }
      } catch { if (active) setUnavailable(true); }
    }
    void load();
    const interval = window.setInterval(() => void load(), 60_000);
    return () => { active = false; window.clearInterval(interval); };
  }, []);
  return <div className="max-w-[1180px] mx-auto px-5 md:px-8"><section className="pb-16 md:pb-24"><div className="grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-8 md:gap-12 items-end mb-10 md:mb-14 border-b border-line pb-8 md:pb-10"><div><div className="flex items-center gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-moss animate-pulse" /><span className="font-mono text-[12.5px] text-gold">LIVE MARKET PRICES</span></div><h2 className="font-serif font-medium text-[30px] md:text-[36px] leading-tight mt-3.5">Priced transparently, refreshed every minute.</h2></div><p className="text-paper-dim text-[15.5px] leading-relaxed max-w-[42ch]">Current market prices for a sample of assets your deposits can be held and grown in. Prices are supplied by CoinGecko.</p></div><div className="flex justify-end min-h-5 mb-2 text-[11px] font-mono text-paper-dim">{updatedAt ? `LAST UPDATED ${updatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : unavailable ? "LIVE PRICES TEMPORARILY UNAVAILABLE" : "LOADING LIVE PRICES…"}</div><div className="overflow-x-auto -mx-5 px-5 md:mx-0 md:px-0"><table className="w-full border-collapse min-w-[560px]"><thead><tr>{["Asset", "Price", "24h", "7d", "Market cap"].map((heading, index) => <th key={heading} className={`font-mono text-[12px] text-paper-dim font-normal pb-3.5 border-b border-line ${index ? "text-right" : "text-left"}`}>{heading}</th>)}</tr></thead><tbody>{assets.map((asset) => { const oneDay = asset.price_change_percentage_24h; const sevenDay = asset.price_change_percentage_7d_in_currency; return <tr key={asset.id} className="hover:bg-slate/40 transition-colors"><td className="py-5 border-b border-line text-[15px]"><div className="flex items-center gap-3.5"><CryptoIcon sym={asset.symbol.toUpperCase()} size={28} /><div><div>{asset.name}</div><div className="text-[12.5px] text-paper-dim font-mono">{asset.symbol.toUpperCase()}</div></div></div></td><td className="text-right py-5 border-b border-line font-mono text-[14.5px]">{money(asset.current_price)}</td><td className={`text-right py-5 border-b border-line font-mono text-[14.5px] ${oneDay !== null && oneDay < 0 ? "text-rust" : "text-moss"}`}>{change(oneDay)}</td><td className={`text-right py-5 border-b border-line font-mono text-[14.5px] ${sevenDay !== null && sevenDay < 0 ? "text-rust" : "text-moss"}`}>{change(sevenDay)}</td><td className="text-right py-5 border-b border-line font-mono text-[14.5px]">{cap(asset.market_cap)}</td></tr>; })}</tbody></table>{assets.length === 0 && <div className="py-10 text-center text-paper-dim text-[14px]">{unavailable ? "Live market prices are temporarily unavailable. Please try again shortly." : "Loading market prices…"}</div>}</div></section></div>;
}

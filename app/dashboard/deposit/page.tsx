"use client";

import { useState } from "react";
import DashboardShell from "@/components/DashboardShell";

type Wallet = {
  sym: string;
  name: string;
  network: string;
  address: string;
};

const wallets: Wallet[] = [
  { sym: "BTC", name: "Bitcoin", network: "Bitcoin network", address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh" },
  { sym: "ETH", name: "Ethereum", network: "ERC-20", address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976" },
  { sym: "USDT", name: "Tether", network: "ERC-20", address: "0x4E2b2e2a258f6f2E9c1c2b7C4D1a9f3B8E9dC5F1" },
  { sym: "USDC", name: "USD Coin", network: "ERC-20", address: "0x9F8b3A1c7D2e4F5a6B7c8D9e0F1a2B3c4D5e6F70" },
  { sym: "SOL", name: "Solana", network: "Solana network", address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU" },
  { sym: "BNB", name: "BNB", network: "BEP-20", address: "bnb136ns6lfw4zs5hg4n85vdthaad7hq5m4gtkgf23" },
  { sym: "XRP", name: "XRP", network: "XRP Ledger", address: "rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh" },
  { sym: "ADA", name: "Cardano", network: "Cardano network", address: "addr1qxy2lpan99fcnhhwvrn9pfp5tv2wgqwvv0f2ncxu4qx4pk" },
  { sym: "DOGE", name: "Dogecoin", network: "Dogecoin network", address: "D8vFz4p1L37jdg1jXHYSbLJyzXFYzYqR3d" },
  { sym: "MATIC", name: "Polygon", network: "Polygon network", address: "0x2C1b3F4a5D6e7F8091A2b3C4d5E6f70819A2b3C" },
];

export default function DepositPage() {
  const [selected, setSelected] = useState<Wallet | null>(null);
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (!selected) return;
    navigator.clipboard.writeText(selected.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  // Step 2: address detail view
  if (selected) {
    return (
      <DashboardShell>
        <button
          onClick={() => {
            setSelected(null);
            setCopied(false);
          }}
          className="text-[13.5px] text-paper-dim mb-6 flex items-center gap-1.5"
        >
          ← Back to wallets
        </button>

        <div className="bg-slate border border-line px-5 md:px-8 py-6 md:py-8 max-w-[560px]">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-moss" />
            <span className="font-mono text-[12px] text-paper-dim">
              {selected.network.toUpperCase()} · YOUR VAULTED ADDRESS
            </span>
          </div>

          {/* QR placeholder */}
          <div className="w-[160px] h-[160px] bg-paper flex items-center justify-center mb-6">
            <svg viewBox="0 0 100 100" width="130" height="130">
              <rect x="4" y="4" width="28" height="28" fill="#0B1220" />
              <rect x="12" y="12" width="12" height="12" fill="#EDE8DD" />
              <rect x="68" y="4" width="28" height="28" fill="#0B1220" />
              <rect x="76" y="12" width="12" height="12" fill="#EDE8DD" />
              <rect x="4" y="68" width="28" height="28" fill="#0B1220" />
              <rect x="12" y="76" width="12" height="12" fill="#EDE8DD" />
              <rect x="40" y="4" width="8" height="8" fill="#0B1220" />
              <rect x="52" y="4" width="8" height="8" fill="#0B1220" />
              <rect x="40" y="16" width="8" height="8" fill="#0B1220" />
              <rect x="40" y="40" width="8" height="8" fill="#0B1220" />
              <rect x="52" y="40" width="8" height="8" fill="#0B1220" />
              <rect x="64" y="40" width="8" height="8" fill="#0B1220" />
              <rect x="40" y="52" width="8" height="8" fill="#0B1220" />
              <rect x="76" y="52" width="8" height="8" fill="#0B1220" />
              <rect x="40" y="64" width="8" height="8" fill="#0B1220" />
              <rect x="52" y="76" width="8" height="8" fill="#0B1220" />
              <rect x="64" y="76" width="8" height="8" fill="#0B1220" />
              <rect x="76" y="88" width="8" height="8" fill="#0B1220" />
              <rect x="52" y="88" width="8" height="8" fill="#0B1220" />
            </svg>
          </div>

          <div className="text-[13px] text-paper-dim mb-2">
            {selected.name} deposit address
          </div>
          <div className="flex items-center gap-3 bg-slate-2 border border-line px-4 py-3 mb-4">
            <span className="font-mono text-[13px] text-paper break-all">
              {selected.address}
            </span>
          </div>

          <button
            onClick={handleCopy}
            className="bg-gold text-ink font-medium text-[14px] px-5 py-2.5 w-full"
          >
            {copied ? "Copied!" : "Copy address"}
          </button>

          <div className="mt-6 pt-6 border-t border-line text-[12.5px] text-paper-dim leading-relaxed">
            Only send {selected.name} ({selected.sym}) on the {selected.network}{" "}
            to this address. Sending any other asset or using the wrong
            network may result in permanent loss of funds.
          </div>
        </div>
      </DashboardShell>
    );
  }

  // Step 1: wallet selection grid
  return (
    <DashboardShell>
      <h1 className="font-serif text-[22px] md:text-[26px] font-medium mb-2">
        Deposit
      </h1>
      <p className="text-paper-dim text-[14.5px] mb-8 max-w-[52ch]">
        Choose an asset below to view your dedicated deposit address for it.
        Deposits are detected automatically once sent.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {wallets.map((w) => (
          <button
            key={w.sym}
            onClick={() => setSelected(w)}
            className="flex items-center gap-3 bg-slate border border-line hover:border-gold px-4 py-4 text-left transition-colors"
          >
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-mono text-[11px] bg-slate-2 text-gold border border-line shrink-0">
              {w.sym}
            </div>
            <div className="min-w-0">
              <div className="text-[14px] text-paper truncate">{w.name}</div>
              <div className="text-[11.5px] text-paper-dim font-mono truncate">
                {w.network}
              </div>
            </div>
          </button>
        ))}
      </div>
    </DashboardShell>
  );
}
"use client";

import { useState } from "react";
import DashboardShell from "@/components/DashboardShell";

type FaqItem = {
  q: string;
  a: string;
};

const faqs: FaqItem[] = [
  {
    q: "How do I deposit funds?",
    a: "Go to the Deposit page, choose the asset you want to send, and you'll get a dedicated address for it. Send from any wallet or exchange — deposits are detected automatically once they arrive.",
  },
  {
    q: "How does my balance grow?",
    a: "Once deposited, your assets are managed on your behalf. There's no trading or active management required from you — check the Overview page any time to see your current balance and recent growth.",
  },
  {
    q: "How do I withdraw?",
    a: "Withdrawals are handled directly by your assigned broker to keep funds secure. Visit the Withdraw page for their contact details and reach out with your account information and the amount you'd like to withdraw.",
  },
  {
    q: "Is my money safe?",
    a: "Yes. Over 95% of client assets are held in offline, air-gapped cold storage. Holdings are independently insured, and we publish proof of reserves monthly.",
  },
  {
    q: "What assets can I deposit?",
    a: "Vaulted currently supports Bitcoin, Ethereum, Solana, Avalanche, USDT, USDC, BNB, XRP, Dogecoin, Cardano, Polygon, Polkadot, and Chainlink. Check the Deposit page for the full list.",
  },
  {
    q: "Are there any fees?",
    a: "Deposits are free. Any applicable fees will always be shown clearly before you take an action — nothing is deducted without you seeing it first.",
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <DashboardShell>
      <h1 className="font-serif text-[22px] md:text-[26px] font-medium mb-2">
        Frequently asked questions
      </h1>
      <p className="text-paper-dim text-[14.5px] mb-8 max-w-[52ch]">
        Can&apos;t find what you&apos;re looking for? Use the chat icon in
        the corner to reach support directly.
      </p>

      <div className="max-w-[680px] border-t border-line">
        {faqs.map((item, i) => {
          const open = openIndex === i;
          return (
            <div key={item.q} className="border-b border-line">
              <button
                onClick={() => setOpenIndex(open ? null : i)}
                className="w-full flex items-center justify-between text-left py-5 gap-4"
              >
                <span className="text-[15px] text-paper">{item.q}</span>
                <span
                  className={`font-mono text-gold text-[18px] shrink-0 transition-transform ${
                    open ? "rotate-45" : ""
                  }`}
                >
                  +
                </span>
              </button>
              {open && (
                <p className="text-paper-dim text-[14px] leading-relaxed pb-5 pr-8">
                  {item.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </DashboardShell>
  );
}
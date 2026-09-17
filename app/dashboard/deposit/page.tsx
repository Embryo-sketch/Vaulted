"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import CryptoIcon from "@/components/CryptoIcon";
import { createClient } from "@/lib/supabase/client";
import { getAsset, type Asset } from "@/lib/crypto-data";
import { DEPOSIT_ADDRESSES } from "@/lib/deposit-addresses";

type DepositableAsset = Asset & { address: string };

// Build the depositable wallet list from the two data sources:
// crypto-data.ts (name, network) + deposit-addresses.ts (address).
// Adding a symbol to DEPOSIT_ADDRESSES automatically adds a wallet here,
// as long as that symbol also exists in ASSETS.
const wallets: DepositableAsset[] = Object.keys(DEPOSIT_ADDRESSES)
  .map((sym) => {
    const asset = getAsset(sym);
    const address = DEPOSIT_ADDRESSES[sym];
    return asset ? { ...asset, address } : null;
  })
  .filter((w): w is DepositableAsset => w !== null);

export default function DepositPage() {
  const [selected, setSelected] = useState<DepositableAsset | null>(null);
  const [copied, setCopied] = useState(false);

  const [claimAmount, setClaimAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkVerification() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("status").eq("id", user.id).single();
      setVerified(data?.status === "Verified");
    }
    void checkVerification();
  }, []);

  function handleCopy() {
    if (!selected) return;
    navigator.clipboard.writeText(selected.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  async function handleSubmitClaim() {
    if (!verified) {
      setError("Your account must be verified before you can submit a deposit claim.");
      return;
    }
    if (!selected) return;
    const amount = Number(claimAmount);
    if (!amount || amount <= 0) {
      setError("Enter the amount you sent.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const { error: rpcError } = await createClient().rpc("submit_deposit_request", {
      crypto_currency: selected.sym,
      claimed_amount: amount,
      tx_hash: txHash || null,
    });

    setSubmitting(false);

    if (rpcError) {
      setError(rpcError.message);
      return;
    }

    setSubmitted(true);
    setClaimAmount("");
    setTxHash("");
  }

  if (verified === false) {
    return <DashboardShell><div className="max-w-[560px] bg-slate border border-gold px-6 py-8"><div className="font-mono text-gold text-[12px] mb-3">ACCOUNT NOT VERIFIED</div><h1 className="font-serif text-[24px] mb-3">Deposits are unavailable</h1><p className="text-paper-dim text-[14px] leading-relaxed">An administrator must verify your account before you can make transactions or submit deposit claims.</p></div></DashboardShell>;
  }

  function reset() {
    setSelected(null);
    setCopied(false);
    setSubmitted(false);
    setError(null);
    setClaimAmount("");
    setTxHash("");
  }

  // Step 2: address detail view
  if (selected) {
    return (
      <DashboardShell>
        <button onClick={reset} className="text-[13.5px] text-paper-dim mb-6 flex items-center gap-1.5">
          ← Back to wallets
        </button>

        <div className="bg-slate border border-line px-5 md:px-8 py-6 md:py-8 max-w-[560px]">
          <div className="flex items-center gap-3 mb-6">
            <CryptoIcon sym={selected.sym} size={32} />
            <div>
              <div className="text-[15px] text-paper">{selected.name}</div>
              <div className="font-mono text-[11.5px] text-paper-dim">
                {selected.network.toUpperCase()}
              </div>
            </div>
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

          <div className="text-[13px] text-paper-dim mb-2">{selected.name} deposit address</div>
          <div className="flex items-center gap-3 bg-slate-2 border border-line px-4 py-3 mb-4">
            <span className="font-mono text-[13px] text-paper break-all">{selected.address}</span>
          </div>

          <button onClick={handleCopy} className="bg-gold text-ink font-medium text-[14px] px-5 py-2.5 w-full">
            {copied ? "Copied!" : "Copy address"}
          </button>

          <div className="mt-6 pt-6 border-t border-line text-[12.5px] text-paper-dim leading-relaxed">
            Only send {selected.name} ({selected.sym}) on the {selected.network} to this
            address. Sending any other asset or using the wrong network may result in
            permanent loss of funds.
          </div>

          <div className="mt-6 pt-6 border-t border-line">
            <div className="font-mono text-gold text-[13px] mb-4">I&apos;VE SENT A DEPOSIT</div>

            {submitted ? (
              <div className="border border-moss p-4">
                <p className="text-moss text-[13.5px]">
                  Deposit claim submitted. We&apos;ll confirm it once we see it on-chain and
                  credit your account.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-3 text-[12.5px] text-paper-dim underline"
                >
                  Submit another
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    value={claimAmount}
                    onChange={(event) => setClaimAmount(event.target.value)}
                    placeholder={`Amount sent (${selected.sym})`}
                    className="bg-slate-2 border border-line p-3"
                  />
                  <input
                    value={txHash}
                    onChange={(event) => setTxHash(event.target.value)}
                    placeholder="Transaction hash (optional)"
                    className="bg-slate-2 border border-line p-3"
                  />
                </div>
                {error && <p className="mt-3 text-rust text-[13px]">{error}</p>}
                <button
                  onClick={handleSubmitClaim}
                  disabled={submitting}
                  className="mt-4 bg-gold text-ink px-5 py-2.5 disabled:opacity-40"
                >
                  {submitting ? "Submitting…" : "Submit deposit claim"}
                </button>
              </>
            )}
          </div>
        </div>
      </DashboardShell>
    );
  }

  // Step 1: wallet selection grid
  return (
    <DashboardShell>
      <h1 className="font-serif text-[22px] md:text-[26px] font-medium mb-2">Deposit</h1>
      <p className="text-paper-dim text-[14.5px] mb-8 max-w-[52ch]">
        Choose an asset below to view your dedicated deposit address for it. Once you&apos;ve
        sent funds, submit a deposit claim so we can confirm it and credit your account.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {wallets.map((w) => (
          <button
            key={w.sym}
            onClick={() => setSelected(w)}
            className="flex items-center gap-3 bg-slate border border-line hover:border-gold px-4 py-4 text-left transition-colors"
          >
            <CryptoIcon sym={w.sym} size={32} />
            <div className="min-w-0">
              <div className="text-[14px] text-paper truncate">{w.name}</div>
              <div className="text-[11.5px] text-paper-dim font-mono truncate">{w.network}</div>
            </div>
          </button>
        ))}
      </div>
    </DashboardShell>
  );
}

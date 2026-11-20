"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { formatCurrency } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";

type Account = { available_cash: number; status: "Verified" | "Pending" | "Suspended" };
const blankForm = { amount: "", accountHolderName: "", bankName: "", accountNumber: "", routingNumber: "", iban: "", swiftBic: "", country: "", note: "" };

export default function WithdrawPage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [privateKey, setPrivateKey] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState(blankForm);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [{ data: profile }, { data: access, error }] = await Promise.all([
        supabase.from("profiles").select("available_cash, status").eq("id", user.id).single(),
        supabase.rpc("get_my_withdrawal_access"),
      ]);
      setAccount(profile as Account | null);
      if (error) setMessage(error.message);
      else setAuthorized(Boolean(access));
    }
    void load();
  }, []);

  async function verifyKey() {
    if (!privateKey.trim()) { setMessage("Enter the withdrawal private key provided by Vaulted Financial."); return; }
    setVerifying(true);
    const { data, error } = await createClient().rpc("verify_withdrawal_private_key", { provided_key: privateKey });
    setVerifying(false);
    if (error) setMessage(error.message);
    else if (!data) setMessage("That withdrawal private key is not valid.");
    else { setAuthorized(true); setPrivateKey(""); setMessage("Secure withdrawal access has been enabled for your account."); }
  }

  async function submitRequest() {
    const amount = Number(form.amount);
    if (!amount || amount <= 0) { setMessage("Enter a valid withdrawal amount."); return; }
    setSubmitting(true);
    const { error } = await createClient().rpc("create_secure_withdrawal_request", {
      provided_key: null, request_amount: amount, request_account_holder_name: form.accountHolderName,
      request_bank_name: form.bankName, request_account_number: form.accountNumber || null,
      request_routing_number: form.routingNumber || null, request_iban: form.iban || null,
      request_swift_bic: form.swiftBic || null, request_country: form.country || null, request_note: form.note || null,
    });
    setSubmitting(false);
    if (error) setMessage(error.message);
    else { setShowForm(false); setForm(blankForm); setMessage("Your secure withdrawal request has been sent to Vaulted Financial for review."); }
  }

  const blocked = account?.status === "Suspended";
  return <DashboardShell><div className="max-w-[680px]">
    <h1 className="font-serif text-[22px] md:text-[26px] font-medium mb-6">Withdraw</h1>
    <div className="bg-slate border border-line px-6 md:px-8 py-8 md:py-10">
      <div className="w-10 h-10 border border-gold flex items-center justify-center mb-6"><span className="font-mono text-gold text-[16px]">$</span></div>
      <h2 className="font-serif text-[20px] font-medium mb-3">Contact your broker to withdraw</h2>
      <p className="text-paper-dim text-[14.5px] leading-relaxed">For your protection, secure withdrawal requests require the private key issued by Vaulted Financial. This is an account authorization key—not a crypto wallet private key.</p>
      {account && <div className="mt-6 pt-5 border-t border-line flex justify-between gap-4 text-[14px]"><span className="text-paper-dim">Available cash for withdrawal</span><span className="font-mono">{formatCurrency(account.available_cash)}</span></div>}
      {message && <p className="mt-5 text-[13.5px] text-paper-dim">{message}</p>}
      {blocked ? <p className="mt-6 border border-rust text-rust px-4 py-3 text-[14px]">Your account is currently blocked for review. Please contact Vaulted Financial.</p> : !authorized ? <div className="mt-6 pt-6 border-t border-line"><label className="block text-[13px] text-paper-dim mb-2">Enter private key for secure withdrawal</label><div className="flex flex-col sm:flex-row gap-3"><input value={privateKey} onChange={(event) => setPrivateKey(event.target.value.toUpperCase())} autoComplete="off" placeholder="Vaulted withdrawal private key" className="flex-1 bg-slate-2 border border-line p-3 font-mono tracking-wide" /><button onClick={() => void verifyKey()} disabled={verifying} className="bg-gold text-ink px-5 py-3 disabled:opacity-40">{verifying ? "Verifying…" : "Enable withdrawal"}</button></div></div> : <div className="mt-6 pt-6 border-t border-line"><p className="text-moss text-[13.5px] mb-4">Secure withdrawal access is enabled for this account.</p><button onClick={() => setShowForm(true)} className="bg-gold text-ink px-5 py-3">Withdraw securely</button></div>}
    </div>
    {showForm && <div className="fixed inset-0 z-[70] bg-ink/85 overflow-y-auto p-4 flex items-center justify-center"><div className="w-full max-w-[620px] bg-slate border border-gold p-5 md:p-7 my-6"><div className="flex justify-between gap-4 mb-5"><div><h2 className="font-serif text-[22px]">Secure withdrawal request</h2><p className="text-paper-dim text-[13px] mt-1">Funds are reviewed by Vaulted Financial before processing.</p></div><button onClick={() => setShowForm(false)} className="text-paper-dim text-[20px]" aria-label="Close">×</button></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} inputMode="decimal" placeholder="Amount (USD)" className="bg-slate-2 border border-line p-3" /><input value={form.accountHolderName} onChange={(e) => setForm({ ...form, accountHolderName: e.target.value })} placeholder="Account holder name" className="bg-slate-2 border border-line p-3" /><input value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} placeholder="Bank name" className="bg-slate-2 border border-line p-3" /><input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="Country" className="bg-slate-2 border border-line p-3" /><input value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} placeholder="Account number" className="bg-slate-2 border border-line p-3" /><input value={form.routingNumber} onChange={(e) => setForm({ ...form, routingNumber: e.target.value })} placeholder="Routing number (if applicable)" className="bg-slate-2 border border-line p-3" /><input value={form.iban} onChange={(e) => setForm({ ...form, iban: e.target.value.toUpperCase() })} placeholder="IBAN (international transfers)" className="bg-slate-2 border border-line p-3 sm:col-span-2" /><input value={form.swiftBic} onChange={(e) => setForm({ ...form, swiftBic: e.target.value.toUpperCase() })} placeholder="SWIFT / BIC (if applicable)" className="bg-slate-2 border border-line p-3" /><input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Note (optional)" className="bg-slate-2 border border-line p-3" /></div><div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-3"><button onClick={() => setShowForm(false)} className="border border-line px-5 py-3">Cancel</button><button onClick={() => void submitRequest()} disabled={submitting} className="bg-gold text-ink px-5 py-3 disabled:opacity-40">{submitting ? "Submitting…" : "Submit withdrawal request"}</button></div></div></div>}
  </div></DashboardShell>;
}

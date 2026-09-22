"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/format";

type Profile = {
  full_name: string;
  email: string;
  status: "Verified" | "Pending" | "Suspended";
  portfolio_value: number;
  available_cash: number;
};

type Transaction = {
  id: string;
  type: string;
  amount: number;
  note: string | null;
  crypto_currency: string | null;
  crypto_amount: number | null;
  created_at: string;
};

type DepositRequest = {
  id: string;
  crypto_currency: string;
  claimed_amount: number;
  tx_hash: string | null;
  status: "Pending" | "Confirmed" | "Rejected";
  created_at: string;
};

type KycSubmission = {
  full_name: string;
  date_of_birth: string;
  house_address: string;
  phone_number: string;
  id_document_path: string;
  status: "Submitted" | "Approved" | "Rejected";
};
type Investment = { id: string; tier: string; source: string; amount: number; crypto_currency: string | null; crypto_amount: number | null; created_at: string; updated_at: string };
type ManualDepositApproval = { id: string; amount: number; note: string | null; status: "Pending" | "Approved" | "Cancelled"; created_at: string };
type VaultedFinancialBankDetails = { account_number: string; routing_number: string; updated_at: string };

const STATUS_OPTIONS: Profile["status"][] = ["Pending", "Verified", "Suspended"];

function statusColor(status: string) {
  if (status === "Verified" || status === "Confirmed") return "text-moss border-moss";
  if (status === "Suspended" || status === "Rejected") return "text-rust border-rust";
  return "text-gold border-gold";
}

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
  const [kycSubmission, setKycSubmission] = useState<KycSubmission | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [manualDepositApprovals, setManualDepositApprovals] = useState<ManualDepositApproval[]>([]);
  const [bankDetails, setBankDetails] = useState<VaultedFinancialBankDetails | null>(null);

  const [amount, setAmount] = useState("");
  const [type, setType] = useState("Deposit");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const [statusDraft, setStatusDraft] = useState<Profile["status"]>("Pending");
  const [savingStatus, setSavingStatus] = useState(false);

  const [reviewAmounts, setReviewAmounts] = useState<Record<string, string>>({});
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [approvalCodes, setApprovalCodes] = useState<Record<string, string>>({});
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [investmentPercentages, setInvestmentPercentages] = useState<Record<string, string>>({});
  const [adjustingInvestmentId, setAdjustingInvestmentId] = useState<string | null>(null);
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [savingBankDetails, setSavingBankDetails] = useState(false);

  async function load() {
    const supabase = createClient();
    const [{ data: user }, { data: history }, { data: kyc }, { data: requests }, { data: investmentData }, { data: approvalData }, { data: bankData, error: bankError }] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, email, status, portfolio_value, available_cash")
        .eq("id", id)
        .single(),
      supabase
        .from("transactions")
        .select("id, type, amount, note, crypto_currency, crypto_amount, created_at")
        .eq("user_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("kyc_submissions")
        .select("full_name, date_of_birth, house_address, phone_number, id_document_path, status")
        .eq("user_id", id)
        .maybeSingle(),
      supabase
        .from("deposit_requests")
        .select("id, crypto_currency, claimed_amount, tx_hash, status, created_at")
        .eq("user_id", id)
        .order("created_at", { ascending: false }),
      supabase.from("investments").select("id, tier, source, amount, crypto_currency, crypto_amount, created_at, updated_at").eq("user_id", id).order("updated_at", { ascending: false }),
      supabase.from("manual_deposit_requests").select("id, amount, note, status, created_at").eq("user_id", id).order("created_at", { ascending: false }),
      supabase.rpc("get_admin_user_bank_details", { target_user_id: id }).maybeSingle(),
    ]);

    setProfile(user);
    if (user) setStatusDraft(user.status);
    setTransactions(history ?? []);
    setDepositRequests(requests ?? []);
    setKycSubmission(kyc);
    setInvestments(investmentData ?? []);
    setManualDepositApprovals(approvalData ?? []);
    const storedBankDetails = bankData as VaultedFinancialBankDetails | null;
    if (bankError) setMessage(bankError.message);
    setBankDetails(storedBankDetails);
    setBankAccountNumber(storedBankDetails?.account_number ?? "");
    setRoutingNumber(storedBankDetails?.routing_number ?? "");
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function record() {
    const value = Number(amount);
    if (!value || value <= 0) return;
    const supabase = createClient();
    const { error } = type === "Deposit"
      ? await supabase.rpc("create_manual_deposit_request", { target_user_id: id, request_amount: value, request_note: note })
      : await supabase.rpc("record_admin_transaction", { target_user_id: id, transaction_type: type, transaction_amount: value, transaction_note: note });
    if (error) setMessage(error.message);
    else {
      setMessage(type === "Deposit" ? "Pending deposit request sent to the user." : "Transaction recorded.");
      setAmount("");
      setNote("");
      await load();
    }
  }

  async function approveManualDeposit(requestId: string) {
    const code = approvalCodes[requestId]?.trim();
    if (!code) {
      setMessage("Enter the user's one-time approval code.");
      return;
    }
    setApprovingId(requestId);
    const { error } = await createClient().rpc("approve_manual_deposit_request", {
      request_id: requestId,
      submitted_code: code,
    });
    setApprovingId(null);
    if (error) setMessage(error.message);
    else {
      setMessage("Manual deposit approved and credited.");
      setApprovalCodes((codes) => ({ ...codes, [requestId]: "" }));
      await load();
    }
  }

  async function adjustInvestment(investmentId: string) {
    const percentage = Number(investmentPercentages[investmentId]);
    if (!percentage) {
      setMessage("Enter a percentage greater or less than zero.");
      return;
    }
    setAdjustingInvestmentId(investmentId);
    const { error } = await createClient().rpc("adjust_user_investment_percentage", {
      target_user_id: id,
      target_investment_id: investmentId,
      adjustment_percentage: percentage,
    });
    setAdjustingInvestmentId(null);
    if (error) setMessage(error.message);
    else {
      setMessage("Investment value updated.");
      setInvestmentPercentages((percentages) => ({ ...percentages, [investmentId]: "" }));
      await load();
    }
  }

  async function saveBankDetails() {
    setSavingBankDetails(true);
    const { error } = await createClient().rpc("save_admin_user_bank_details", {
      target_user_id: id,
      new_account_number: bankAccountNumber,
      new_routing_number: routingNumber,
    });
    setSavingBankDetails(false);
    if (error) setMessage(error.message);
    else {
      setMessage("Vaulted Financial bank details saved.");
      await load();
    }
  }

  async function saveStatus() {
    if (!profile || statusDraft === profile.status) return;
    setSavingStatus(true);
    const { error } = await createClient()
      .from("profiles")
      .update({ status: statusDraft })
      .eq("id", id);
    setSavingStatus(false);
    if (error) setMessage(error.message);
    else {
      if (kycSubmission && statusDraft === "Verified") {
        const { error: kycError } = await createClient()
          .from("kyc_submissions")
          .update({ status: "Approved", updated_at: new Date().toISOString() })
          .eq("user_id", id);
        if (kycError) {
          setMessage(kycError.message);
          return;
        }
        setKycSubmission({ ...kycSubmission, status: "Approved" });
      }
      setProfile({ ...profile, status: statusDraft });
      setMessage("Verification status updated.");
    }
  }

  async function openIdDocument() {
    if (!kycSubmission) return;
    const { data, error } = await createClient().storage
      .from("kyc-documents")
      .createSignedUrl(kycSubmission.id_document_path, 60);
    if (error || !data) {
      setMessage(error?.message ?? "Unable to open the ID document.");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  async function reviewRequest(requestId: string, decision: "Confirmed" | "Rejected") {
    setReviewingId(requestId);
    const usdAmount = decision === "Confirmed" ? Number(reviewAmounts[requestId]) : null;

    if (decision === "Confirmed" && (!usdAmount || usdAmount <= 0)) {
      setMessage("Enter a valid USD amount before confirming.");
      setReviewingId(null);
      return;
    }

    const { error } = await createClient().rpc("review_deposit_request", {
      request_id: requestId,
      decision,
      usd_amount: usdAmount,
      review_note: null,
    });

    setReviewingId(null);
    if (error) setMessage(error.message);
    else {
      setMessage(decision === "Confirmed" ? "Deposit confirmed and credited." : "Deposit request rejected.");
      await load();
    }
  }

  const pendingRequests = depositRequests.filter((r) => r.status === "Pending");
  const reviewedRequests = depositRequests.filter((r) => r.status !== "Pending");

  return (
    <div className="max-w-[900px]">
      <Link href="/admin" className="text-paper-dim text-[13px]">
        ← Back to users
      </Link>

      {!profile ? (
        <p className="mt-8 text-paper-dim">Loading user…</p>
      ) : (
        <>
          <div className="mt-6 mb-8">
            <h1 className="font-serif text-[24px]">{profile.full_name || "Unnamed user"}</h1>
            <p className="text-paper-dim">{profile.email}</p>
            <p className="mt-3 font-mono">
              Portfolio: {formatCurrency(profile.portfolio_value)} · Cash:{" "}
              {formatCurrency(profile.available_cash)}
            </p>
          </div>

          {message && <p className="mb-6 text-paper-dim text-[13.5px]">{message}</p>}

          <section className="bg-slate border border-line p-6 mb-10">
            <h2 className="font-mono text-gold text-[13px] mb-4">KYC SUBMISSION</h2>
            {!kycSubmission ? <p className="text-paper-dim text-[13.5px]">No KYC submission yet.</p> : <div className="text-[14px] flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><p><span className="text-paper-dim">Name: </span>{kycSubmission.full_name}</p><p><span className="text-paper-dim">Date of birth: </span>{kycSubmission.date_of_birth}</p><p><span className="text-paper-dim">Phone: </span>{kycSubmission.phone_number}</p><p><span className="text-paper-dim">KYC status: </span>{kycSubmission.status}</p></div>
              <p><span className="text-paper-dim">Address: </span>{kycSubmission.house_address}</p>
              <button onClick={openIdDocument} className="border border-gold text-gold px-3 py-2 text-[13px] self-start">Open submitted ID</button>
            </div>}
          </section>

          <section className="bg-slate border border-line p-6 mb-10">
            <h2 className="font-mono text-gold text-[13px] mb-4">INVESTMENTS</h2>
            {investments.length === 0 ? <p className="text-paper-dim">No investments yet.</p> : <div className="space-y-4">{investments.map((investment) => <div key={investment.id} className="border-b border-line pb-4 last:border-0"><div className="flex flex-wrap justify-between gap-3"><div><span className="capitalize">{investment.tier}</span><span className="text-paper-dim"> · {investment.source}</span>{investment.crypto_currency && <span className="text-paper-dim"> · {investment.crypto_amount} {investment.crypto_currency}</span>}<p className="text-[12px] text-paper-dim mt-1">Updated {new Date(investment.updated_at ?? investment.created_at).toLocaleString()}</p></div><span className="font-mono text-gold">{formatCurrency(investment.amount)}</span></div><div className="mt-3 flex flex-wrap items-center gap-3"><input type="number" step="0.01" value={investmentPercentages[investment.id] ?? ""} onChange={(event) => setInvestmentPercentages((percentages) => ({ ...percentages, [investment.id]: event.target.value }))} placeholder="Percentage e.g. 5 or -5" className="bg-slate-2 border border-line p-3 w-56" /><button onClick={() => void adjustInvestment(investment.id)} disabled={adjustingInvestmentId === investment.id} className="border border-gold text-gold px-4 py-2.5 disabled:opacity-40">{adjustingInvestmentId === investment.id ? "Updating…" : "Apply adjustment"}</button></div></div>)}</div>}
          </section>

          <section className="bg-slate border border-line p-6 mb-10">
            <h2 className="font-mono text-gold text-[13px] mb-2">VAULTED FINANCIAL BANK DETAILS</h2>
            <p className="text-paper-dim text-[13px] mb-4">Assign the Vaulted Financial account and routing numbers for this user. These details are visible only to administrators.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[13px] text-paper-dim mb-2">Account number</label>
                <input value={bankAccountNumber} onChange={(event) => setBankAccountNumber(event.target.value.replace(/[^0-9\\s]/g, ""))} inputMode="numeric" autoComplete="off" placeholder="Account number" className="w-full bg-slate-2 border border-line p-3 font-mono" />
              </div>
              <div>
                <label className="block text-[13px] text-paper-dim mb-2">Routing number</label>
                <input value={routingNumber} onChange={(event) => setRoutingNumber(event.target.value.replace(/[^0-9\\s]/g, ""))} inputMode="numeric" autoComplete="off" placeholder="9-digit routing number" className="w-full bg-slate-2 border border-line p-3 font-mono" />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button onClick={() => void saveBankDetails()} disabled={savingBankDetails} className="bg-gold text-ink px-5 py-2.5 disabled:opacity-40">{savingBankDetails ? "Saving…" : "Save bank details"}</button>
              {bankDetails && <span className="text-paper-dim text-[12px]">Last updated {new Date(bankDetails.updated_at).toLocaleString()}</span>}
            </div>
          </section>

          <section className="bg-slate border border-line p-6 mb-10">
            <h2 className="font-mono text-gold text-[13px] mb-4">VERIFICATION STATUS</h2>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={statusDraft}
                onChange={(event) => setStatusDraft(event.target.value as Profile["status"])}
                className={`bg-slate-2 border p-3 ${statusColor(statusDraft)}`}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button
                onClick={saveStatus}
                disabled={savingStatus || statusDraft === profile.status}
                className="bg-gold text-ink px-5 py-2.5 disabled:opacity-40"
              >
                {savingStatus ? "Saving…" : "Save status"}
              </button>
            </div>
          </section>

          <section className="bg-slate border border-line p-6 mb-10">
            <h2 className="font-mono text-gold text-[13px] mb-4">PENDING DEPOSIT REQUESTS</h2>

            {pendingRequests.length === 0 ? (
              <p className="text-paper-dim">No pending deposit requests.</p>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((req) => (
                  <div key={req.id} className="border border-line p-4">
                    <p className="text-paper">
                      Claims to have sent{" "}
                      <span className="text-gold font-mono">
                        {req.claimed_amount} {req.crypto_currency}
                      </span>
                    </p>
                    {req.tx_hash && (
                      <p className="mt-1 text-[12.5px] text-paper-dim break-all font-mono">
                        Tx hash: {req.tx_hash}
                      </p>
                    )}
                    <p className="mt-1 text-[12px] text-paper-dim">
                      Submitted {new Date(req.created_at).toLocaleString()}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="USD amount to credit"
                        value={reviewAmounts[req.id] ?? ""}
                        onChange={(event) =>
                          setReviewAmounts((prev) => ({ ...prev, [req.id]: event.target.value }))
                        }
                        className="bg-slate-2 border border-line p-3 w-48"
                      />
                      <button
                        onClick={() => reviewRequest(req.id, "Confirmed")}
                        disabled={reviewingId === req.id}
                        className="bg-moss text-ink px-4 py-2.5 disabled:opacity-40"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => reviewRequest(req.id, "Rejected")}
                        disabled={reviewingId === req.id}
                        className="border border-rust text-rust px-4 py-2.5 disabled:opacity-40"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {reviewedRequests.length > 0 && (
              <div className="mt-6 pt-6 border-t border-line space-y-2">
                {reviewedRequests.map((req) => (
                  <div key={req.id} className="flex justify-between text-[13.5px]">
                    <span className="text-paper-dim">
                      {req.claimed_amount} {req.crypto_currency}
                    </span>
                    <span className={`font-mono text-[12px] px-2 py-1 border ${statusColor(req.status)}`}>
                      {req.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="bg-slate border border-line p-6 mb-10">
            <h2 className="font-mono text-gold text-[13px] mb-2">MANUAL DEPOSIT APPROVALS</h2>
            <p className="text-paper-dim text-[13px] mb-4">Deposit requests created here stay pending until you enter the user&apos;s one-time code.</p>
            {manualDepositApprovals.length === 0 ? <p className="text-paper-dim">No manual deposit requests yet.</p> : <div className="space-y-4">{manualDepositApprovals.map((request) => <div key={request.id} className="border border-line p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-mono text-gold">{formatCurrency(request.amount)}</p>{request.note && <p className="text-paper-dim text-[13px] mt-1">{request.note}</p>}<p className="text-paper-dim text-[12px] mt-1">Created {new Date(request.created_at).toLocaleString()}</p></div><span className={`font-mono text-[12px] px-2 py-1 border ${statusColor(request.status === "Approved" ? "Confirmed" : request.status)}`}>{request.status.toUpperCase()}</span></div>{request.status === "Pending" && <div className="mt-4 flex flex-wrap gap-3"><input value={approvalCodes[request.id] ?? ""} onChange={(event) => setApprovalCodes((codes) => ({ ...codes, [request.id]: event.target.value }))} inputMode="numeric" maxLength={6} placeholder="One-time code" className="bg-slate-2 border border-line p-3 w-48" /><button onClick={() => void approveManualDeposit(request.id)} disabled={approvingId === request.id} className="bg-gold text-ink px-4 py-2.5 disabled:opacity-40">{approvingId === request.id ? "Approving…" : "Approve deposit"}</button></div>}</div>)}</div>}
          </section>

          <section className="bg-slate border border-line p-6 mb-10">
            <h2 className="font-mono text-gold text-[13px] mb-2">RECORD A TRANSACTION</h2>
            <p className="text-paper-dim text-[13px] mb-4">Cash deposits create a pending request; growth and withdrawals are applied immediately.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select
                value={type}
                onChange={(event) => setType(event.target.value)}
                className="bg-slate-2 border border-line p-3"
              >
                <option value="Deposit">Cash deposit</option>
                <option>Growth</option>
                <option>Withdraw</option>
              </select>
              <input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="Amount (USD)"
                className="bg-slate-2 border border-line p-3"
              />
              <input
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Note (optional)"
                className="bg-slate-2 border border-line p-3"
              />
            </div>
            <button onClick={record} className="mt-4 bg-gold text-ink px-5 py-2.5">
              Record transaction
            </button>
          </section>

          <h2 className="font-serif text-[20px] mb-4">Transaction history</h2>
          {transactions.length === 0 ? (
            <p className="text-paper-dim">No transactions yet.</p>
          ) : (
            <div className="border-t border-line">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex justify-between py-4 border-b border-line">
                  <div>
                    {tx.type}
                    {tx.crypto_currency && (
                      <span className="text-paper-dim">
                        {" "}
                        — {tx.crypto_amount} {tx.crypto_currency}
                      </span>
                    )}
                    {tx.note && <span className="text-paper-dim"> — {tx.note}</span>}
                  </div>
                  <span className="font-mono">{formatCurrency(tx.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

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
type Investment = { id: string; tier: string; source: string; amount: number; crypto_currency: string | null; crypto_amount: number | null; created_at: string };

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

  const [amount, setAmount] = useState("");
  const [type, setType] = useState("Deposit");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const [statusDraft, setStatusDraft] = useState<Profile["status"]>("Pending");
  const [savingStatus, setSavingStatus] = useState(false);

  const [reviewAmounts, setReviewAmounts] = useState<Record<string, string>>({});
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  async function load() {
    const supabase = createClient();
    const [{ data: user }, { data: history }, { data: kyc }, { data: requests }, { data: investmentData }] = await Promise.all([
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
      supabase.from("investments").select("id, tier, source, amount, crypto_currency, crypto_amount, created_at").eq("user_id", id).order("created_at", { ascending: false }),
    ]);

    setProfile(user);
    if (user) setStatusDraft(user.status);
    setTransactions(history ?? []);
    setDepositRequests(requests ?? []);
    setKycSubmission(kyc);
    setInvestments(investmentData ?? []);
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
    const { error } = await createClient().rpc("record_admin_transaction", {
      target_user_id: id,
      transaction_type: type,
      transaction_amount: value,
      transaction_note: note,
    });
    if (error) setMessage(error.message);
    else {
      setMessage("Transaction recorded.");
      setAmount("");
      setNote("");
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
            {investments.length === 0 ? <p className="text-paper-dim">No investments yet.</p> : <div className="space-y-3">{investments.map((investment) => <div key={investment.id} className="flex flex-wrap justify-between gap-3 border-b border-line pb-3 last:border-0"><div><span className="capitalize">{investment.tier}</span><span className="text-paper-dim"> · {investment.source}</span>{investment.crypto_currency && <span className="text-paper-dim"> · {investment.crypto_amount} {investment.crypto_currency}</span>}<p className="text-[12px] text-paper-dim mt-1">{new Date(investment.created_at).toLocaleString()}</p></div><span className="font-mono text-gold">{formatCurrency(investment.amount)}</span></div>)}</div>}
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
            <h2 className="font-mono text-gold text-[13px] mb-4">RECORD A TRANSACTION</h2>
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

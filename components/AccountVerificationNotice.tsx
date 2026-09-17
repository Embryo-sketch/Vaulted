"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AccountVerificationNotice() {
  const [status, setStatus] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    async function loadStatus() {
      if (window.sessionStorage.getItem("vaulted-show-verification-notice") !== "true") {
        return;
      }
      window.sessionStorage.removeItem("vaulted-show-verification-notice");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("status").eq("id", user.id).single();
      setStatus(data?.status ?? "Pending");
    }
    void loadStatus();
  }, []);

  if (dismissed || !status || status === "Verified") return null;
  const suspended = status === "Suspended";
  return <div className="fixed inset-0 z-[70] bg-ink/80 flex items-center justify-center p-5">
    <div className="w-full max-w-[420px] bg-slate border border-gold p-6 md:p-8 shadow-xl">
      <div className="font-mono text-gold text-[12px] mb-3">ACCOUNT STATUS</div>
      <h2 className="font-serif text-[24px] mb-3">{suspended ? "Account suspended" : "Account not verified"}</h2>
      <p className="text-paper-dim text-[14px] leading-relaxed">{suspended ? "Your account is currently unavailable. Please contact support for help." : "Your account is awaiting verification. You cannot submit deposits or make transactions until an administrator verifies your account."}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        {!suspended && <Link href="/dashboard/settings#kyc" onClick={() => setDismissed(true)} className="bg-gold text-ink font-medium px-5 py-2.5 text-[14px]">Verify now</Link>}
        <button onClick={() => setDismissed(true)} className="border border-line text-paper px-5 py-2.5 text-[14px]">{suspended ? "I understand" : "Not now"}</button>
      </div>
    </div>
  </div>;
}

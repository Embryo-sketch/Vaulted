"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { createClient } from "@/lib/supabase/client";

type Broker = { broker_name: string; broker_email: string; broker_phone: string; support_hours: string };

export default function WithdrawPage() {
  const [broker, setBroker] = useState<Broker | null>(null);
  useEffect(() => { async function load() { const { data } = await createClient().from("broker_contact_settings").select("broker_name, broker_email, broker_phone, support_hours").eq("id", true).single(); setBroker(data); } void load(); }, []);
  return <DashboardShell><div className="max-w-[520px]"><h1 className="font-serif text-[22px] md:text-[26px] font-medium mb-6">Withdraw</h1><div className="bg-slate border border-line px-6 md:px-8 py-8 md:py-10"><div className="w-10 h-10 border border-gold flex items-center justify-center mb-6"><span className="font-mono text-gold text-[16px]">!</span></div><h2 className="font-serif text-[20px] font-medium mb-3">Contact your broker to withdraw</h2><p className="text-paper-dim text-[14.5px] leading-relaxed mb-6">Withdrawals are handled directly by your assigned broker. Reach out with your account details and the amount you&apos;d like to withdraw.</p>{broker && (broker.broker_name || broker.broker_email || broker.broker_phone || broker.support_hours) ? <div className="border-t border-line pt-6 flex flex-col gap-4">{broker.broker_name && <div className="flex justify-between gap-4 text-[13.5px]"><span className="text-paper-dim">Broker</span><span>{broker.broker_name}</span></div>}{broker.broker_email && <div className="flex justify-between gap-4 text-[13.5px]"><span className="text-paper-dim">Broker email</span><a className="font-mono text-gold break-all text-right" href={`mailto:${broker.broker_email}`}>{broker.broker_email}</a></div>}{broker.broker_phone && <div className="flex justify-between gap-4 text-[13.5px]"><span className="text-paper-dim">Broker phone</span><span className="font-mono text-right">{broker.broker_phone}</span></div>}{broker.support_hours && <div className="flex justify-between gap-4 text-[13.5px]"><span className="text-paper-dim">Support hours</span><span className="font-mono text-right">{broker.support_hours}</span></div>}</div> : <p className="border-t border-line pt-6 text-paper-dim text-[13.5px]">Broker contact information will be available here shortly.</p>}</div></div></DashboardShell>;
}

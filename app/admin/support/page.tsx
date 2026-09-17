"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Profile = { id: string; full_name: string; email: string };
type Message = { id: string; user_id: string; sender: "user" | "admin"; body: string };

export default function AdminSupportPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeUserId, setActiveUserId] = useState("");
  const [reply, setReply] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const supabase = createClient();
    const [{ data: users, error: usersError }, { data: chat, error: chatError }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email"),
      supabase.from("support_messages").select("id, user_id, sender, body").order("created_at"),
    ]);
    if (usersError || chatError) setError(usersError?.message ?? chatError?.message ?? "Unable to load support.");
    else {
      const loadedMessages = chat ?? [];
      setProfiles((users ?? []).filter((user) => loadedMessages.some((message) => message.user_id === user.id)));
      setMessages(loadedMessages);
      setActiveUserId((current) => current || loadedMessages[0]?.user_id || "");
    }
  }

  useEffect(() => { const timer = setTimeout(() => { void load(); }, 0); return () => clearTimeout(timer); }, []);
  const active = profiles.find((profile) => profile.id === activeUserId);
  const activeMessages = messages.filter((message) => message.user_id === activeUserId);

  async function send() {
    const body = reply.trim();
    if (!body || !activeUserId) return;
    const { error: sendError } = await createClient().from("support_messages").insert({ user_id: activeUserId, sender: "admin", body });
    if (sendError) setError(sendError.message);
    else { setReply(""); await load(); }
  }

  return <div>
    <h1 className="font-serif text-[22px] md:text-[26px] font-medium mb-2">Support</h1>
    <p className="text-paper-dim text-[14.5px] mb-8">Messages sent from the customer chat box.</p>
    {error && <p className="mb-4 text-rust">{error}</p>}
    <div className="border border-line grid grid-cols-1 md:grid-cols-[260px_1fr] md:h-[560px]">
      <div className="border-b md:border-b-0 md:border-r border-line overflow-x-auto md:overflow-y-auto">
        {profiles.length === 0 ? <p className="p-5 text-paper-dim text-[13px]">No support messages yet.</p> : profiles.map((profile) => {
          const last = messages.filter((message) => message.user_id === profile.id).at(-1);
          return <button key={profile.id} onClick={() => setActiveUserId(profile.id)} className={`w-full text-left px-5 py-4 border-b border-line ${activeUserId === profile.id ? "bg-slate" : "hover:bg-slate/40"}`}><div>{profile.full_name || "Unnamed user"}</div><div className="text-[12px] text-paper-dim truncate">{last?.body}</div></button>;
        })}
      </div>
      <div className="flex flex-col min-h-[400px] md:min-h-0">
        {active ? <><div className="border-b border-line px-5 py-4"><div>{active.full_name || "Unnamed user"}</div><div className="text-[12px] text-paper-dim">{active.email}</div></div><div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">{activeMessages.map((message) => <div key={message.id} className={`max-w-[75%] px-3.5 py-2.5 text-[13.5px] ${message.sender === "user" ? "bg-slate-2 border border-line self-start" : "bg-gold text-ink self-end"}`}>{message.body}</div>)}</div><div className="border-t border-line p-3 flex gap-2"><input value={reply} onChange={(event) => setReply(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void send(); }} placeholder="Type a reply..." className="flex-1 bg-slate border border-line text-paper px-3 py-2"/><button onClick={() => void send()} className="bg-gold text-ink px-4">Send</button></div></> : <div className="flex-1 flex items-center justify-center text-paper-dim">Select a conversation.</div>}
      </div>
    </div>
  </div>;
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Message = { id: string; sender: "user" | "admin"; body: string };

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function loadMessages() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id ?? null);
    if (!user) return;
    const { data, error: loadError } = await supabase.from("support_messages").select("id, sender, body").eq("user_id", user.id).order("created_at");
    if (loadError) setError(loadError.message);
    else setMessages(data ?? []);
  }

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => { void loadMessages(); }, 0);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, open]);

  async function send() {
    const body = input.trim();
    if (!body || !userId) return;
    setError(null);
    const { error: sendError } = await createClient().from("support_messages").insert({ user_id: userId, sender: "user", body });
    if (sendError) setError(sendError.message);
    else { setInput(""); await loadMessages(); }
  }

  return <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3">
    {open && <div className="bg-slate border border-line w-[92vw] max-w-[340px] h-[440px] flex flex-col shadow-lg">
      <div className="border-b border-line px-5 py-4 flex justify-between"><div><div className="text-[14.5px] text-paper">Vaulted Support</div><div className="font-mono text-[11px] text-paper-dim mt-1">Messages are answered by our team</div></div><button onClick={() => setOpen(false)} className="text-paper-dim">×</button></div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {!userId ? <div className="text-paper-dim text-[13.5px]">Please <Link href="/login" className="text-gold underline">log in</Link> to message support.</div> : messages.length === 0 ? <div className="text-paper-dim text-[13.5px]">Send a message and our team will reply here.</div> : messages.map((message) => <div key={message.id} className={`max-w-[85%] px-3.5 py-2.5 text-[13.5px] ${message.sender === "admin" ? "bg-slate-2 border border-line text-paper self-start" : "bg-gold text-ink self-end"}`}>{message.body}</div>)}
        {error && <p className="text-rust text-[12px]">{error}</p>}
      </div>
      <div className="border-t border-line p-3 flex gap-2"><input disabled={!userId} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void send(); }} placeholder={userId ? "Type a message..." : "Log in to chat"} className="flex-1 bg-slate-2 border border-line text-paper px-3 py-2"/><button disabled={!userId || !input.trim()} onClick={() => void send()} className="bg-gold text-ink px-3 disabled:opacity-40">Send</button></div>
    </div>}
    <button onClick={() => setOpen(!open)} aria-label="Open chat" className="w-12 h-12 rounded-full bg-gold text-ink flex items-center justify-center shadow-lg">{open ? "×" : "◯"}</button>
  </div>;
}

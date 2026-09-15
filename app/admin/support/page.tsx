"use client";

import { useState } from "react";
import { SUPPORT_CONVERSATIONS, type SupportConversation } from "@/lib/admin-support-data";

export default function AdminSupportPage() {
  const [conversations, setConversations] = useState<SupportConversation[]>(
    SUPPORT_CONVERSATIONS
  );
  const [activeUserId, setActiveUserId] = useState<string>(
    SUPPORT_CONVERSATIONS[0]?.userId ?? ""
  );
  const [reply, setReply] = useState("");

  const active = conversations.find((c) => c.userId === activeUserId);

  function handleSend() {
    const text = reply.trim();
    if (!text || !active) return;

    setConversations((prev) =>
      prev.map((c) =>
        c.userId === activeUserId
          ? {
              ...c,
              messages: [
                ...c.messages,
                {
                  id: Date.now().toString(),
                  from: "admin" as const,
                  text,
                  time: "Just now",
                },
              ],
            }
          : c
      )
    );
    setReply("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div>
      <h1 className="font-serif text-[22px] md:text-[26px] font-medium mb-2">
        Support
      </h1>
      <p className="text-paper-dim text-[14.5px] mb-8">
        Conversations started by users from the chat widget appear here.
      </p>

      <div className="border border-line grid grid-cols-1 md:grid-cols-[260px_1fr] h-[560px]">
        {/* Conversation list */}
        <div className="border-b md:border-b-0 md:border-r border-line overflow-y-auto max-h-[220px] md:max-h-none">
          {conversations.map((c) => {
            const last = c.messages[c.messages.length - 1];
            const isActive = c.userId === activeUserId;
            return (
              <button
                key={c.userId}
                onClick={() => setActiveUserId(c.userId)}
                className={`w-full text-left px-5 py-4 border-b border-line transition-colors ${
                  isActive ? "bg-slate" : "hover:bg-slate/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-paper">{c.userName}</span>
                  <span className="text-[11px] font-mono text-paper-dim">
                    {last?.time}
                  </span>
                </div>
                <div className="text-[12.5px] text-paper-dim mt-1 truncate">
                  {last?.from === "admin" ? "You: " : ""}
                  {last?.text}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active thread */}
        <div className="flex flex-col min-h-0">
          {active ? (
            <>
              <div className="border-b border-line px-5 py-4 shrink-0">
                <div className="text-[14.5px] text-paper">{active.userName}</div>
                <div className="text-[12px] font-mono text-paper-dim">
                  {active.userEmail}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
                {active.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[75%] px-3.5 py-2.5 text-[13.5px] leading-relaxed ${
                      m.from === "user"
                        ? "bg-slate-2 border border-line text-paper self-start"
                        : "bg-gold text-ink self-end"
                    }`}
                  >
                    {m.text}
                    <div
                      className={`text-[10.5px] mt-1.5 font-mono ${
                        m.from === "user" ? "text-paper-dim" : "text-ink/60"
                      }`}
                    >
                      {m.time}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-line p-3 flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a reply..."
                  className="flex-1 bg-slate border border-line text-paper placeholder:text-paper-dim px-3.5 py-2.5 text-[13.5px] focus:outline-none focus:border-gold"
                />
                <button
                  onClick={handleSend}
                  className="bg-gold text-ink px-4 py-2.5 text-[13.5px] font-medium shrink-0"
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-paper-dim text-[14px]">
              No conversation selected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
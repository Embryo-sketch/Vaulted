"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  id: number;
  from: "agent" | "user";
  text: string;
};

const initialMessages: Message[] = [
  {
    id: 1,
    from: "agent",
    text: "Hi, welcome to Vaulted! I'm here to help with deposits, withdrawals, or anything else. What can I help with?",
  },
];

const autoReplies = [
  "Thanks for reaching out — one of our team will follow up shortly. In the meantime, is there anything else I can help with?",
  "Got it, I've noted that down. A specialist will get back to you on this shortly.",
  "Thanks! Your message has been logged. We typically respond within a few minutes during support hours (Mon–Fri, 9am–6pm).",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing, open]);

  function handleSend() {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = { id: Date.now(), from: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const reply =
        autoReplies[Math.floor(Math.random() * autoReplies.length)];
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, from: "agent", text: reply },
      ]);
      setTyping(false);
    }, 1400);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3">
      {open && (
        <div className="bg-slate border border-line w-[92vw] max-w-[340px] h-[440px] flex flex-col shadow-lg">
          {/* Header */}
          <div className="border-b border-line px-5 py-4 flex items-center justify-between shrink-0">
            <div>
              <div className="text-[14.5px] text-paper">Vaulted Support</div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-moss" />
                <span className="font-mono text-[11px] text-paper-dim">
                  Online
                </span>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="text-paper-dim"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[85%] px-3.5 py-2.5 text-[13.5px] leading-relaxed ${
                  m.from === "agent"
                    ? "bg-slate-2 border border-line text-paper self-start"
                    : "bg-gold text-ink self-end"
                }`}
              >
                {m.text}
              </div>
            ))}
            {typing && (
              <div className="bg-slate-2 border border-line text-paper-dim self-start px-3.5 py-2.5 text-[13px] font-mono">
                typing…
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-line p-3 flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 bg-slate-2 border border-line text-paper placeholder:text-paper-dim px-3.5 py-2.5 text-[13.5px] focus:outline-none focus:border-gold"
            />
            <button
              onClick={handleSend}
              aria-label="Send message"
              className="bg-gold text-ink w-9 h-9 flex items-center justify-center shrink-0"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        aria-label="Open chat"
        className="w-12 h-12 rounded-full bg-gold text-ink flex items-center justify-center shadow-lg"
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        )}
      </button>
    </div>
  );
}
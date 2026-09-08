"use client";

import { useState } from "react";
import Link from "next/link";

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-line relative">
      <nav className="max-w-[1180px] mx-auto px-5 md:px-8 flex items-center justify-between py-4 md:py-[22px]">
        <Link href="/" className="flex items-center gap-2.5 text-[17px] md:text-[19px] tracking-tight">
          <span className="relative w-5 h-5 border-[1.5px] border-gold inline-block">
            <span className="absolute inset-1 bg-gold" />
          </span>
          Vaulted
        </Link>

        <div className="hidden md:flex gap-9 text-[14.5px] text-paper-dim">
          <a href="#" className="hover:text-paper transition-colors">Markets</a>
          <a href="#" className="hover:text-paper transition-colors">How it works</a>
          <a href="#" className="hover:text-paper transition-colors">Security</a>
          <a href="#" className="hover:text-paper transition-colors">Pricing</a>
        </div>

        <div className="hidden md:flex items-center gap-5">
          <Link href="/login" className="text-[14.5px] text-paper-dim">Log in</Link>
          <Link
            href="/signup"
            className="bg-gold text-ink text-[14.5px] font-medium px-5 py-2.5 border border-gold"
          >
            Open account
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden flex flex-col gap-[5px] p-2 -mr-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span
            className={`block w-5 h-[1.5px] bg-paper transition-transform ${
              open ? "rotate-45 translate-y-[6.5px]" : ""
            }`}
          />
          <span
            className={`block w-5 h-[1.5px] bg-paper transition-opacity ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-5 h-[1.5px] bg-paper transition-transform ${
              open ? "-rotate-45 -translate-y-[6.5px]" : ""
            }`}
          />
        </button>
      </nav>

      {/* Mobile menu panel */}
      {open && (
        <div className="md:hidden border-t border-line bg-ink px-5 py-6 flex flex-col gap-1">
          <a href="#" className="py-3 text-[15px] text-paper-dim border-b border-line" onClick={() => setOpen(false)}>Markets</a>
          <a href="#" className="py-3 text-[15px] text-paper-dim border-b border-line" onClick={() => setOpen(false)}>How it works</a>
          <a href="#" className="py-3 text-[15px] text-paper-dim border-b border-line" onClick={() => setOpen(false)}>Security</a>
          <a href="#" className="py-3 text-[15px] text-paper-dim border-b border-line" onClick={() => setOpen(false)}>Pricing</a>

          <div className="flex flex-col gap-3 mt-5">
            <Link
              href="/login"
              className="text-center border border-line text-paper text-[14.5px] py-3"
              onClick={() => setOpen(false)}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-center bg-gold text-ink text-[14.5px] font-medium py-3"
              onClick={() => setOpen(false)}
            >
              Open account
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
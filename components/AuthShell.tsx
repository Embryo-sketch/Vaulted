import { ReactNode } from "react";
import Link from "next/link";

export default function AuthShell({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-ink text-paper flex">
      {/* Left: form */}
      <div className="flex-1 flex flex-col justify-center px-6 md:px-20 py-10 md:py-16">
        <div className="max-w-[420px] w-full mx-auto md:mx-0">
          <Link href="/" className="flex items-center gap-2.5 text-[19px] mb-14">
            <span className="relative w-5 h-5 border-[1.5px] border-gold inline-block">
              <span className="absolute inset-1 bg-gold" />
            </span>
            Vaulted
          </Link>

          <div className="font-mono text-[12.5px] text-gold mb-3">
            {eyebrow}
          </div>
          <h1 className="font-serif font-medium text-[32px] leading-tight mb-9">
            {title}
          </h1>

          {children}
        </div>
      </div>

      {/* Right: visual panel, hidden on mobile */}
      <div className="hidden md:flex flex-1 border-l border-line bg-slate items-center justify-center relative overflow-hidden">
        <div className="max-w-[360px] w-full px-10">
          <div className="text-[14px] text-paper-dim mb-2">
            Total value custodied
          </div>
          <div className="font-mono text-[34px] mb-6">$4.1B</div>
          <svg
            width="100%"
            height="90"
            viewBox="0 0 320 90"
            preserveAspectRatio="none"
            className="mb-8"
          >
            <polyline
              points="0,70 20,66 40,68 60,55 80,58 100,42 120,48 140,30 160,34 180,18 200,24 220,10 240,16 260,4 280,9 300,2 320,6"
              fill="none"
              stroke="#C6A15B"
              strokeWidth="1.5"
            />
          </svg>
          <div className="border-t border-line pt-6 flex flex-col gap-4">
            <div className="flex justify-between text-[13.5px]">
              <span className="text-paper-dim">Cold-storage ratio</span>
              <span className="font-mono">99.98%</span>
            </div>
            <div className="flex justify-between text-[13.5px]">
              <span className="text-paper-dim">Accounts funded</span>
              <span className="font-mono">210K</span>
            </div>
            <div className="flex justify-between text-[13.5px]">
              <span className="text-paper-dim">Assets supported</span>
              <span className="font-mono">40+</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import Link from "next/link";
import CountUp from "@/components/CountUp";
import { INVESTMENT_TIERS, formatTierRange } from "@/lib/investment-tiers";

// A short preview of the tiers — full list lives on /dashboard/invest
const previewTiers = [INVESTMENT_TIERS[0], INVESTMENT_TIERS[1], INVESTMENT_TIERS[4]];

export default function Hero() {
  return (
    <div className="max-w-[1180px] mx-auto px-5 md:px-8">
      <section className="grid grid-cols-1 md:grid-cols-[1.05fr_0.85fr] gap-12 md:gap-16 items-start pt-12 md:pt-24 pb-0">
        {/* Left: copy */}
        <div>
          <div className="flex items-center gap-3 mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-moss" />
            <span className="font-mono text-[13px] text-paper-dim">
              RATES FROM 4.5% TO 12.8% APR
            </span>
          </div>

          <h1 className="font-serif font-medium text-[42px] md:text-[60px] leading-[1.05] tracking-tight text-paper/[0.92]">
            Deposit once,
            <br />
            let it <em className="italic text-gold font-normal">grow</em>.
          </h1>

          <p className="mt-6 text-[17px] leading-relaxed text-paper-dim max-w-[44ch]">
            Choose a tier or a flexible amount, send your deposit to a
            dedicated address, and your balance grows automatically from
            there — no trading, no timing the market.
          </p>

          <div className="mt-9 flex items-center gap-7 flex-wrap">
            <Link
              href="/signup"
              className="bg-gold text-ink px-6 py-3.5 text-[15px] font-medium"
            >
              Open an account
            </Link>
            <a
              href="#"
              className="text-[14.5px] border-b border-paper-dim pb-0.5"
            >
              See investment tiers
            </a>
          </div>

          <div className="flex gap-6 md:gap-10 mt-10 md:mt-14 pt-6 md:pt-7 border-t border-line flex-wrap">
            <div>
              <div className="font-mono text-[22px] text-paper">
                <CountUp end={4.1} decimals={1} prefix="$" suffix="B" />
              </div>
              <div className="text-[12.5px] text-paper-dim mt-1">
                Assets under custody
              </div>
            </div>
            <div>
              <div className="font-mono text-[22px] text-paper">
                <CountUp end={210} decimals={0} suffix="K" />
              </div>
              <div className="text-[12.5px] text-paper-dim mt-1">
                Accounts funded
              </div>
            </div>
            <div>
              <div className="font-mono text-[22px] text-paper">
                <CountUp end={99.98} decimals={2} suffix="%" />
              </div>
              <div className="text-[12.5px] text-paper-dim mt-1">
                Cold-storage ratio
              </div>
            </div>
          </div>
        </div>

        {/* Right: investment tiers preview */}
        <div className="bg-slate border border-line">
          <div className="px-6 py-[18px] border-b border-line">
            <div className="text-[14px] text-paper-dim">Investment tiers</div>
          </div>

          <div className="border-t border-line">
            {previewTiers.map((tier, i) => (
              <div
                key={tier.id}
                className={`flex justify-between items-center px-6 py-[15px] ${
                  i < previewTiers.length - 1 ? "border-b border-line" : ""
                }`}
              >
                <div>
                  <div className="text-[14.5px]">{tier.name}</div>
                  <div className="text-[12px] text-paper-dim font-mono mt-0.5">
                    {formatTierRange(tier)}
                  </div>
                </div>
                <div className="font-mono text-[19px] text-gold">
                  {tier.apr}%
                </div>
              </div>
            ))}
          </div>

          <div className="px-6 py-4 border-t border-line">
            <Link
              href="/signup"
              className="text-[13px] text-paper-dim border-b border-paper-dim"
            >
              View all tiers
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
import Link from "next/link";
import { INVESTMENT_TIERS, formatTierRange } from "@/lib/investment-tiers";

export default function InvestmentTiersSection() {
  return (
    <div id="invest" className="max-w-[1180px] mx-auto px-5 md:px-8 scroll-mt-20">
      <section className="py-24">
        <div className="grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-12 items-end mb-14 border-b border-line pb-10">
          <div>
            <div className="font-mono text-[12.5px] text-gold">
              INVESTMENT TIERS
            </div>
            <h2 className="font-serif font-medium text-[36px] leading-tight mt-3.5">
              A rate for every deposit size.
            </h2>
          </div>
          <p className="text-paper-dim text-[15.5px] leading-relaxed max-w-[42ch]">
            Rates are annualized and apply automatically based on your
            deposit — no need to pick or negotiate anything.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {INVESTMENT_TIERS.map((tier) => (
            <div
              key={tier.id}
              className="bg-slate border border-line hover:border-gold transition-colors px-5 py-6 flex flex-col justify-between"
            >
              <div>
                <div className="text-[15px] font-serif mb-3">{tier.name}</div>
                <div className="font-mono text-[26px] text-gold mb-3">
                  {tier.apr}%
                </div>
                <div className="font-mono text-[11.5px] text-paper-dim">
                  {formatTierRange(tier)}
                </div>
              </div>
              <Link
                href="/signup"
                className="text-[12.5px] text-paper-dim border-b border-paper-dim mt-6 self-start"
              >
                Get started
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
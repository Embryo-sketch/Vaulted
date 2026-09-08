import Link from "next/link";

type Holding = {
  sym: string;
  name: string;
  amount: string;
  value: string;
  change: string;
  up: boolean;
};

const holdings: Holding[] = [
  { sym: "BTC", name: "Bitcoin", amount: "0.912 BTC", value: "$55,818", change: "+1.8%", up: true },
  { sym: "ETH", name: "Ethereum", amount: "4.220 ETH", value: "$14,402", change: "+3.1%", up: true },
  { sym: "SOL", name: "Solana", amount: "120.4 SOL", value: "$17,114", change: "-0.6%", up: false },
];

export default function Hero() {
  return (
    <div className="max-w-[1180px] mx-auto px-5 md:px-8">
      <section className="grid grid-cols-1 md:grid-cols-[1.05fr_0.85fr] gap-12 md:gap-16 items-start pt-12 md:pt-24 pb-0">
        {/* Left: copy */}
        <div>
          <div className="flex items-center gap-3 mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-moss" />
            <span className="font-mono text-[13px] text-paper-dim">
              MANAGED CUSTODY · NO TRADING REQUIRED
            </span>
          </div>

          <h1 className="font-serif font-medium text-[42px] md:text-[60px] leading-[1.05] tracking-tight text-paper">
            Deposit once,
            <br />
            let it <em className="italic text-gold font-normal">grow</em>.
          </h1>

          <p className="mt-6 text-[17px] leading-relaxed text-paper-dim max-w-[44ch]">
            Vaulted assigns you a dedicated deposit address the moment you
            sign up. Send your assets in, and we handle the rest — no
            trading, no timing the market, no dashboard to babysit.
          </p>

          <div className="mt-9 flex items-center gap-7">
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
              See how custody works
            </a>
          </div>

          <div className="flex gap-6 md:gap-10 mt-10 md:mt-14 pt-6 md:pt-7 border-t border-line flex-wrap">
            <div>
              <div className="font-mono text-[22px] text-paper">$4.1B</div>
              <div className="text-[12.5px] text-paper-dim mt-1">
                Assets under custody
              </div>
            </div>
            <div>
              <div className="font-mono text-[22px] text-paper">210K</div>
              <div className="text-[12.5px] text-paper-dim mt-1">
                Accounts funded
              </div>
            </div>
            <div>
              <div className="font-mono text-[22px] text-paper">99.98%</div>
              <div className="text-[12.5px] text-paper-dim mt-1">
                Cold-storage ratio
              </div>
            </div>
          </div>
        </div>

        {/* Right: portfolio panel */}
        <div className="bg-slate border border-line">
          <div className="px-6 py-[22px] border-b border-line flex justify-between items-baseline">
            <div className="text-[14px] text-paper-dim">Portfolio value</div>
            <div className="font-mono text-[13px] text-moss">growing</div>
          </div>

          <div className="px-6 pt-[26px] pb-1.5">
            <span className="font-mono text-[38px] text-paper">$128,942</span>
            <span className="font-mono text-[14px] text-moss ml-2.5">
              +2.34%
            </span>
          </div>

          <div className="px-5 pt-1.5 pb-[22px]">
            <svg
              width="100%"
              height="52"
              viewBox="0 0 320 52"
              preserveAspectRatio="none"
            >
              <polyline
                points="0,38 20,34 40,36 60,28 80,30 100,20 120,24 140,16 160,18 180,10 200,14 220,8 240,12 260,6 280,9 300,4 320,7"
                fill="none"
                stroke="#4F7A5C"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          <div className="border-t border-line">
            {holdings.map((h, i) => (
              <div
                key={h.sym}
                className={`flex justify-between items-center px-6 py-[15px] ${
                  i < holdings.length - 1 ? "border-b border-line" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center font-mono text-[11px] bg-slate-2 text-gold border border-line">
                    {h.sym}
                  </div>
                  <div>
                    <div className="text-[14.5px]">{h.name}</div>
                    <div className="text-[12px] text-paper-dim font-mono">
                      {h.amount}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[14.5px]">{h.value}</div>
                  <div
                    className={`font-mono text-[12px] ${
                      h.up ? "text-moss" : "text-rust"
                    }`}
                  >
                    {h.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
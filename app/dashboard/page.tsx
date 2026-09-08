import DashboardShell from "@/components/DashboardShell";

type Holding = {
  sym: string;
  name: string;
  amount: string;
  price: string;
  value: string;
  change: string;
  up: boolean;
};

const holdings: Holding[] = [
  {
    sym: "BTC",
    name: "Bitcoin",
    amount: "0.912 BTC",
    price: "$61,204.11",
    value: "$55,818.15",
    change: "+1.8%",
    up: true,
  },
  {
    sym: "ETH",
    name: "Ethereum",
    amount: "4.220 ETH",
    price: "$3,412.90",
    value: "$14,402.44",
    change: "+3.1%",
    up: true,
  },
  {
    sym: "SOL",
    name: "Solana",
    amount: "120.4 SOL",
    price: "$142.08",
    value: "$17,114.63",
    change: "-0.6%",
    up: false,
  },
  {
    sym: "AVAX",
    name: "Avalanche",
    amount: "58.0 AVAX",
    price: "$28.44",
    value: "$1,649.52",
    change: "+0.9%",
    up: true,
  },
];

type Tx = {
  type: string;
  asset: string;
  amount: string;
  date: string;
  status: string;
};

const transactions: Tx[] = [
  { type: "Growth", asset: "Portfolio", amount: "+2.34%", date: "Sep 8", status: "Complete" },
  { type: "Deposit", asset: "BTC", amount: "0.05 BTC", date: "Sep 6", status: "Complete" },
  { type: "Deposit", asset: "USDT", amount: "$5,000.00", date: "Sep 4", status: "Complete" },
  { type: "Deposit", asset: "ETH", amount: "1.2 ETH", date: "Aug 29", status: "Complete" },
];

export default function DashboardPage() {
  return (
    <DashboardShell>
      {/* Portfolio summary */}
      <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-4 md:gap-6 mb-10">
        <div className="bg-slate border border-line px-7 py-7">
          <div className="text-[14px] text-paper-dim mb-2">
            Total portfolio value
          </div>
          <div className="flex items-baseline gap-3 mb-6">
            <span className="font-mono text-[36px]">$88,984.74</span>
            <span className="font-mono text-[14px] text-moss">+2.34%</span>
          </div>
          <svg
            width="100%"
            height="60"
            viewBox="0 0 500 60"
            preserveAspectRatio="none"
          >
            <polyline
              points="0,46 25,42 50,44 75,34 100,37 125,24 150,29 175,18 200,21 225,10 250,15 275,6 300,10 325,4 350,8 375,2 400,7 425,3 450,9 475,4 500,7"
              fill="none"
              stroke="#4F7A5C"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        <div className="bg-slate border border-line px-7 py-7 flex flex-col justify-between">
          <div>
            <div className="text-[14px] text-paper-dim mb-2">
              Available cash
            </div>
            <div className="font-mono text-[26px]">$12,204.00</div>
          </div>
          <div className="flex gap-3 mt-6">
            <a
              href="/dashboard/deposit"
              className="flex-1 text-center bg-gold text-ink text-[13.5px] font-medium py-2.5"
            >
              Deposit
            </a>
            <a
              href="/dashboard/withdraw"
              className="flex-1 text-center border border-line text-paper text-[13.5px] py-2.5"
            >
              Withdraw
            </a>
          </div>
        </div>
      </div>

      {/* Holdings */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-[20px] font-medium">Holdings</h2>
          <a href="#" className="text-[13.5px] text-paper-dim border-b border-paper-dim">
            View all
          </a>
        </div>

        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        <table className="w-full border-collapse min-w-[480px]">
          <thead>
            <tr>
              <th className="text-left font-mono text-[12px] text-paper-dim font-normal pb-3 border-b border-line">
                Asset
              </th>
              <th className="text-right font-mono text-[12px] text-paper-dim font-normal pb-3 border-b border-line">
                Price
              </th>
              <th className="text-right font-mono text-[12px] text-paper-dim font-normal pb-3 border-b border-line">
                24h
              </th>
              <th className="text-right font-mono text-[12px] text-paper-dim font-normal pb-3 border-b border-line">
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((h) => (
              <tr key={h.sym}>
                <td className="py-4 border-b border-line text-[14.5px]">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center font-mono text-[11px] bg-slate-2 text-gold border border-line">
                      {h.sym}
                    </div>
                    <div>
                      <div>{h.name}</div>
                      <div className="text-[12px] text-paper-dim font-mono">
                        {h.amount}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="text-right py-4 border-b border-line font-mono text-[14px]">
                  {h.price}
                </td>
                <td
                  className={`text-right py-4 border-b border-line font-mono text-[14px] ${
                    h.up ? "text-moss" : "text-rust"
                  }`}
                >
                  {h.change}
                </td>
                <td className="text-right py-4 border-b border-line font-mono text-[14px]">
                  {h.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* Recent transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-[20px] font-medium">
            Recent transactions
          </h2>
          <a href="#" className="text-[13.5px] text-paper-dim border-b border-paper-dim">
            View all
          </a>
        </div>

        <div className="border-t border-line">
          {transactions.map((tx, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-4 border-b border-line text-[14px]"
            >
              <div className="flex items-center gap-4">
                <span className="font-mono text-paper-dim text-[12.5px] w-16">
                  {tx.date}
                </span>
                <span>
                  {tx.type === "Growth" ? "Portfolio growth" : `${tx.type} ${tx.asset}`}
                </span>
              </div>
              <div className="flex items-center gap-6">
                <span className="font-mono text-[13.5px]">{tx.amount}</span>
                <span className="text-[12.5px] text-moss font-mono">
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
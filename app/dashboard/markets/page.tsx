import DashboardShell from "@/components/DashboardShell";

type Asset = {
  sym: string;
  name: string;
  price: string;
  change24h: string;
  up24h: boolean;
  change7d: string;
  up7d: boolean;
  marketCap: string;
  owned: boolean;
};

const assets: Asset[] = [
  { sym: "BTC", name: "Bitcoin", price: "$61,204.11", change24h: "+1.82%", up24h: true, change7d: "+6.40%", up7d: true, marketCap: "$1.20T", owned: true },
  { sym: "ETH", name: "Ethereum", price: "$3,412.90", change24h: "+3.10%", up24h: true, change7d: "-1.20%", up7d: false, marketCap: "$410.5B", owned: true },
  { sym: "SOL", name: "Solana", price: "$142.08", change24h: "-0.60%", up24h: false, change7d: "+9.80%", up7d: true, marketCap: "$64.2B", owned: true },
  { sym: "AVAX", name: "Avalanche", price: "$28.44", change24h: "+0.94%", up24h: true, change7d: "+2.10%", up7d: true, marketCap: "$11.1B", owned: true },
  { sym: "DOGE", name: "Dogecoin", price: "$0.164", change24h: "-1.40%", up24h: false, change7d: "+4.20%", up7d: true, marketCap: "$23.6B", owned: false },
  { sym: "ADA", name: "Cardano", price: "$0.612", change24h: "+0.82%", up24h: true, change7d: "-0.90%", up7d: false, marketCap: "$21.4B", owned: false },
  { sym: "MATIC", name: "Polygon", price: "$0.921", change24h: "-0.32%", up24h: false, change7d: "+1.60%", up7d: true, marketCap: "$8.9B", owned: false },
  { sym: "DOT", name: "Polkadot", price: "$7.42", change24h: "+1.15%", up24h: true, change7d: "+3.30%", up7d: true, marketCap: "$10.2B", owned: false },
  { sym: "LINK", name: "Chainlink", price: "$14.88", change24h: "+2.04%", up24h: true, change7d: "+5.70%", up7d: true, marketCap: "$9.1B", owned: false },
  { sym: "XRP", name: "XRP", price: "$0.582", change24h: "-0.78%", up24h: false, change7d: "-2.10%", up7d: false, marketCap: "$32.8B", owned: false },
];

export default function MarketsPage() {
  return (
    <DashboardShell>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-[26px] font-medium">Markets</h1>
        <input
          type="text"
          placeholder="Search assets..."
          className="bg-slate border border-line text-paper placeholder:text-paper-dim px-4 py-2 text-[14px] w-[220px] focus:outline-none focus:border-gold"
        />
      </div>

      <table className="w-full border-collapse">
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
              7d
            </th>
            <th className="text-right font-mono text-[12px] text-paper-dim font-normal pb-3 border-b border-line">
              Market cap
            </th>
            <th className="text-right font-mono text-[12px] text-paper-dim font-normal pb-3 border-b border-line">
              {" "}
            </th>
          </tr>
        </thead>
        <tbody>
          {assets.map((a) => (
            <tr key={a.sym}>
              <td className="py-4 border-b border-line text-[14.5px]">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center font-mono text-[11px] bg-slate-2 text-gold border border-line">
                    {a.sym}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      {a.name}
                      {a.owned && (
                        <span className="text-[10px] font-mono text-moss border border-moss px-1.5 py-0.5">
                          OWNED
                        </span>
                      )}
                    </div>
                    <div className="text-[12px] text-paper-dim font-mono">
                      {a.sym}
                    </div>
                  </div>
                </div>
              </td>
              <td className="text-right py-4 border-b border-line font-mono text-[14px]">
                {a.price}
              </td>
              <td
                className={`text-right py-4 border-b border-line font-mono text-[14px] ${
                  a.up24h ? "text-moss" : "text-rust"
                }`}
              >
                {a.change24h}
              </td>
              <td
                className={`text-right py-4 border-b border-line font-mono text-[14px] ${
                  a.up7d ? "text-moss" : "text-rust"
                }`}
              >
                {a.change7d}
              </td>
              <td className="text-right py-4 border-b border-line font-mono text-[14px]">
                {a.marketCap}
              </td>
              <td className="text-right py-4 border-b border-line">
                <button className="text-[13px] text-ink bg-gold px-3.5 py-1.5 font-medium">
                  Trade
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DashboardShell>
  );
}

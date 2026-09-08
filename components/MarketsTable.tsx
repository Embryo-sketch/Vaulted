type Asset = {
  sym: string;
  name: string;
  price: string;
  change24h: string;
  up24h: boolean;
  change7d: string;
  up7d: boolean;
  marketCap: string;
};

const assets: Asset[] = [
  {
    sym: "BTC",
    name: "Bitcoin",
    price: "$61,204.11",
    change24h: "+1.82%",
    up24h: true,
    change7d: "+6.40%",
    up7d: true,
    marketCap: "$1.20T",
  },
  {
    sym: "ETH",
    name: "Ethereum",
    price: "$3,412.90",
    change24h: "+3.10%",
    up24h: true,
    change7d: "-1.20%",
    up7d: false,
    marketCap: "$410.5B",
  },
  {
    sym: "SOL",
    name: "Solana",
    price: "$142.08",
    change24h: "-0.60%",
    up24h: false,
    change7d: "+9.80%",
    up7d: true,
    marketCap: "$64.2B",
  },
  {
    sym: "AVAX",
    name: "Avalanche",
    price: "$28.44",
    change24h: "+0.94%",
    up24h: true,
    change7d: "+2.10%",
    up7d: true,
    marketCap: "$11.1B",
  },
];

export default function MarketsTable() {
  return (
    <div className="max-w-[1180px] mx-auto px-5 md:px-8">
      <section className="pb-24">
        <div className="grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-12 items-end mb-14 border-b border-line pb-10">
          <div>
            <div className="font-mono text-[12.5px] text-gold">ASSETS WE HOLD</div>
            <h2 className="font-serif font-medium text-[36px] leading-tight mt-3.5">
              Priced transparently, updated by the second.
            </h2>
          </div>
          <p className="text-paper-dim text-[15.5px] leading-relaxed max-w-[42ch]">
            A sample of the assets your deposits can be held and grown in.
            No need to pick or manage any of these yourself.
          </p>
        </div>

        <div className="overflow-x-auto -mx-5 px-5 md:mx-0 md:px-0">
        <table className="w-full border-collapse min-w-[560px]">
          <thead>
            <tr>
              <th className="text-left font-mono text-[12px] text-paper-dim font-normal pb-3.5 border-b border-line">
                Asset
              </th>
              <th className="text-right font-mono text-[12px] text-paper-dim font-normal pb-3.5 border-b border-line">
                Price
              </th>
              <th className="text-right font-mono text-[12px] text-paper-dim font-normal pb-3.5 border-b border-line">
                24h
              </th>
              <th className="text-right font-mono text-[12px] text-paper-dim font-normal pb-3.5 border-b border-line">
                7d
              </th>
              <th className="text-right font-mono text-[12px] text-paper-dim font-normal pb-3.5 border-b border-line">
                Market cap
              </th>
            </tr>
          </thead>
          <tbody>
            {assets.map((a) => (
              <tr key={a.sym}>
                <td className="py-5 border-b border-line text-[15px]">
                  <div className="flex items-center gap-3.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center font-mono text-[11px] bg-slate-2 text-gold border border-line">
                      {a.sym}
                    </div>
                    <div>
                      <div>{a.name}</div>
                      <div className="text-[12.5px] text-paper-dim font-mono">
                        {a.sym}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="text-right py-5 border-b border-line font-mono text-[14.5px]">
                  {a.price}
                </td>
                <td
                  className={`text-right py-5 border-b border-line font-mono text-[14.5px] ${
                    a.up24h ? "text-moss" : "text-rust"
                  }`}
                >
                  {a.change24h}
                </td>
                <td
                  className={`text-right py-5 border-b border-line font-mono text-[14.5px] ${
                    a.up7d ? "text-moss" : "text-rust"
                  }`}
                >
                  {a.change7d}
                </td>
                <td className="text-right py-5 border-b border-line font-mono text-[14.5px]">
                  {a.marketCap}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </section>
    </div>
  );
}
"use client";

type TickerCoin = {
  sym: string;
  price: string;
  up: boolean;
};

const tickerData: TickerCoin[] = [
  { sym: "BTC", price: "$61,204.11", up: true },
  { sym: "ETH", price: "$3,412.90", up: true },
  { sym: "SOL", price: "$142.08", up: false },
  { sym: "AVAX", price: "$28.44", up: true },
  { sym: "DOGE", price: "$0.164", up: false },
  { sym: "ADA", price: "$0.612", up: true },
  { sym: "MATIC", price: "$0.921", up: false },
  { sym: "DOT", price: "$7.42", up: true },
  { sym: "LINK", price: "$14.88", up: true },
  { sym: "XRP", price: "$0.582", up: false },
];

function TickerItems() {
  return (
    <>
      {tickerData.map((coin) => (
        <span
          key={coin.sym}
          className="font-mono text-[12.5px] inline-flex gap-2.5 items-baseline text-paper-dim"
        >
          <span className="text-paper">{coin.sym}</span>
          {coin.price}
          <span className={coin.up ? "text-moss" : "text-rust"}>
            {coin.up ? "▲" : "▼"}
          </span>
        </span>
      ))}
    </>
  );
}

export default function TickerStrip() {
  return (
    <div className="border-b border-line bg-slate overflow-hidden whitespace-nowrap">
      <div className="inline-flex gap-12 py-[11px] animate-ticker motion-reduce:animate-none">
        <TickerItems />
        <TickerItems />
      </div>
    </div>
  );
}

/*
Add to globals.css (or a Tailwind @layer utilities block):

@keyframes ticker-scroll {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.animate-ticker {
  animation: ticker-scroll 32s linear infinite;
}
*/

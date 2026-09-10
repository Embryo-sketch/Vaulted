import Link from "next/link";
import CryptoIcon from "@/components/CryptoIcon";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { HoldingWithValue } from "@/lib/crypto-data";

function amountLabel(amount: number, sym: string): string {
  // Trim trailing zeros for cleaner display (e.g. 0.912 BTC, not 0.9120)
  const trimmed = parseFloat(amount.toFixed(4));
  return `${trimmed} ${sym}`;
}

export function HoldingRow({ holding }: { holding: HoldingWithValue }) {
  const { asset, amount, value } = holding;
  const up = asset.change24h >= 0;

  return (
    <tr>
      <td className="py-4 border-b border-line text-[14.5px]">
        <div className="flex items-center gap-3">
          <CryptoIcon sym={asset.sym} size={28} />
          <div>
            <div>{asset.name}</div>
            <div className="text-[12px] text-paper-dim font-mono">
              {amountLabel(amount, asset.sym)}
            </div>
          </div>
        </div>
      </td>
      <td className="text-right py-4 border-b border-line font-mono text-[14px]">
        {formatCurrency(asset.price)}
      </td>
      <td
        className={`text-right py-4 border-b border-line font-mono text-[14px] ${
          up ? "text-moss" : "text-rust"
        }`}
      >
        {formatPercent(asset.change24h)}
      </td>
      <td className="text-right py-4 border-b border-line font-mono text-[14px]">
        {formatCurrency(value)}
      </td>
    </tr>
  );
}

type HoldingsTableProps = {
  holdings: HoldingWithValue[];
  title?: string;
  viewAllHref?: string;
};

export default function HoldingsTable({
  holdings,
  title = "Holdings",
  viewAllHref,
}: HoldingsTableProps) {
  if (holdings.length === 0) {
    return (
      <div>
        <h2 className="font-serif text-[20px] font-medium mb-4">{title}</h2>
        <div className="border border-line border-dashed px-6 py-10 text-center">
          <div className="text-[14.5px] text-paper-dim">
            No holdings yet — deposit an asset to see it here.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-[20px] font-medium">{title}</h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-[13.5px] text-paper-dim border-b border-paper-dim"
          >
            View all
          </Link>
        )}
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
              <HoldingRow key={h.sym} holding={h} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
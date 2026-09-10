import CryptoIcon from "@/components/CryptoIcon";
import {
  transactionColor,
  transactionLabel,
  type Transaction,
} from "@/lib/transactions-data";

/** Compact single-line row — used in the Overview page's recent activity feed. */
export function TransactionListItem({ tx }: { tx: Transaction }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-line text-[14px]">
      <div className="flex items-center gap-4">
        <span className="font-mono text-paper-dim text-[12.5px] w-16 shrink-0">
          {tx.date.replace(", 2026", "")}
        </span>
        <span className={transactionColor(tx)}>{transactionLabel(tx)}</span>
      </div>
      <div className="flex items-center gap-6">
        <span className="font-mono text-[13.5px]">{tx.amountLabel}</span>
        <span
          className={`text-[12.5px] font-mono ${
            tx.status === "Complete" ? "text-moss" : "text-gold"
          }`}
        >
          {tx.status}
        </span>
      </div>
    </div>
  );
}

/** Full table row — used on the Transactions page. */
export function TransactionTableRow({ tx }: { tx: Transaction }) {
  return (
    <tr>
      <td className="py-4 border-b border-line font-mono text-[13.5px] text-paper-dim">
        {tx.date}
      </td>
      <td className={`py-4 border-b border-line text-[14.5px] ${transactionColor(tx)}`}>
        <div className="flex items-center gap-2.5">
          {tx.sym && <CryptoIcon sym={tx.sym} size={20} />}
          {transactionLabel(tx)}
        </div>
      </td>
      <td className="text-right py-4 border-b border-line font-mono text-[14px]">
        {tx.amountLabel}
      </td>
      <td className="text-right py-4 border-b border-line font-mono text-[14px]">
        {tx.valueLabel}
      </td>
      <td className="text-right py-4 border-b border-line">
        <span
          className={`text-[12px] font-mono px-2 py-1 border ${
            tx.status === "Complete"
              ? "text-moss border-moss"
              : "text-gold border-gold"
          }`}
        >
          {tx.status.toUpperCase()}
        </span>
      </td>
    </tr>
  );
}
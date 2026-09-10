export type TransactionType = "Deposit" | "Growth" | "Withdraw";

export type Transaction = {
  id: string;
  type: TransactionType;
  sym?: string; // asset symbol, e.g. "BTC" — omitted for portfolio-wide growth events
  amountLabel: string; // e.g. "0.05 BTC", "+2.34%", "$5,000.00"
  valueLabel: string; // dollar value shown on the full transactions page
  date: string;
  status: "Complete" | "Pending";
};

// Single source of truth for transaction history.
// The Overview page shows the most recent few; the Transactions page
// shows (and filters) the full list — both read from this one array.
export const TRANSACTIONS: Transaction[] = [
  { id: "t1", type: "Growth", amountLabel: "+2.34%", valueLabel: "+$2,958.10", date: "Sep 8, 2026", status: "Complete" },
  { id: "t2", type: "Deposit", sym: "BTC", amountLabel: "0.05 BTC", valueLabel: "$3,060.21", date: "Sep 6, 2026", status: "Complete" },
  { id: "t3", type: "Deposit", sym: "USDT", amountLabel: "$5,000.00", valueLabel: "$5,000.00", date: "Sep 4, 2026", status: "Complete" },
  { id: "t4", type: "Growth", amountLabel: "+1.12%", valueLabel: "+$1,401.55", date: "Sep 1, 2026", status: "Complete" },
  { id: "t5", type: "Deposit", sym: "ETH", amountLabel: "1.2 ETH", valueLabel: "$4,095.48", date: "Aug 29, 2026", status: "Complete" },
  { id: "t6", type: "Withdraw", sym: "USDT", amountLabel: "$1,200.00", valueLabel: "$1,200.00", date: "Aug 24, 2026", status: "Complete" },
  { id: "t7", type: "Deposit", sym: "AVAX", amountLabel: "20.0 AVAX", valueLabel: "$568.80", date: "Aug 20, 2026", status: "Complete" },
  { id: "t8", type: "Deposit", sym: "USDT", amountLabel: "$10,000.00", valueLabel: "$10,000.00", date: "Aug 12, 2026", status: "Pending" },
];

export function getRecentTransactions(count: number): Transaction[] {
  return TRANSACTIONS.slice(0, count);
}

export function transactionLabel(tx: Transaction): string {
  if (tx.type === "Growth") return "Portfolio growth";
  return `${tx.type} ${tx.sym ?? ""}`.trim();
}

export function transactionColor(tx: Transaction): string {
  if (tx.type === "Growth") return "text-moss";
  if (tx.type === "Withdraw") return "text-paper-dim";
  return "text-paper";
}
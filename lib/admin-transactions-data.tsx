import type { Transaction } from "@/lib/transactions-data";

// Mock transaction history keyed by admin user id. Once the backend is
// wired up, this becomes a real query scoped to the selected user.
export const ADMIN_USER_TRANSACTIONS: Record<string, Transaction[]> = {
  u1: [
    { id: "u1-t1", type: "Growth", amountLabel: "+2.34%", valueLabel: "+$2,958.10", date: "Sep 8, 2026", status: "Complete" },
    { id: "u1-t2", type: "Deposit", sym: "BTC", amountLabel: "0.05 BTC", valueLabel: "$3,060.21", date: "Sep 6, 2026", status: "Complete" },
    { id: "u1-t3", type: "Deposit", sym: "USDT", amountLabel: "$5,000.00", valueLabel: "$5,000.00", date: "Sep 4, 2026", status: "Complete" },
    { id: "u1-t4", type: "Deposit", sym: "ETH", amountLabel: "1.2 ETH", valueLabel: "$4,095.48", date: "Aug 29, 2026", status: "Complete" },
  ],
  u2: [
    { id: "u2-t1", type: "Deposit", sym: "ETH", amountLabel: "2.0 ETH", valueLabel: "$6,825.80", date: "Sep 5, 2026", status: "Complete" },
    { id: "u2-t2", type: "Growth", amountLabel: "+1.10%", valueLabel: "+$265.10", date: "Sep 1, 2026", status: "Complete" },
  ],
  u3: [],
  u4: [
    { id: "u4-t1", type: "Deposit", sym: "BTC", amountLabel: "1.8 BTC", valueLabel: "$110,167.40", date: "Sep 3, 2026", status: "Complete" },
    { id: "u4-t2", type: "Growth", amountLabel: "+3.20%", valueLabel: "+$4,890.56", date: "Aug 30, 2026", status: "Complete" },
    { id: "u4-t3", type: "Withdraw", sym: "USDT", amountLabel: "$2,000.00", valueLabel: "$2,000.00", date: "Aug 22, 2026", status: "Complete" },
  ],
  u5: [
    { id: "u5-t1", type: "Deposit", sym: "SOL", amountLabel: "40 SOL", valueLabel: "$5,683.20", date: "Jul 28, 2026", status: "Complete" },
  ],
  u6: [
    { id: "u6-t1", type: "Deposit", sym: "USDT", amountLabel: "$40,000.00", valueLabel: "$40,000.00", date: "Sep 8, 2026", status: "Complete" },
    { id: "u6-t2", type: "Growth", amountLabel: "+3.10%", valueLabel: "+$1,250.00", date: "Sep 9, 2026", status: "Pending" },
  ],
  u7: [],
};

export function getUserTransactions(userId: string): Transaction[] {
  return ADMIN_USER_TRANSACTIONS[userId] ?? [];
}
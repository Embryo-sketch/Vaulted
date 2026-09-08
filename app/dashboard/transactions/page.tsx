import DashboardShell from "@/components/DashboardShell";

type Tx = {
  type: "Deposit" | "Growth" | "Withdraw";
  asset: string;
  amount: string;
  value: string;
  date: string;
  status: "Complete" | "Pending";
};

const transactions: Tx[] = [
  { type: "Growth", asset: "Portfolio", amount: "+2.34%", value: "+$2,958.10", date: "Sep 8, 2026", status: "Complete" },
  { type: "Deposit", asset: "BTC", amount: "0.05 BTC", value: "$3,060.21", date: "Sep 6, 2026", status: "Complete" },
  { type: "Deposit", asset: "USDT", amount: "$5,000.00", value: "$5,000.00", date: "Sep 4, 2026", status: "Complete" },
  { type: "Growth", asset: "Portfolio", amount: "+1.12%", value: "+$1,401.55", date: "Sep 1, 2026", status: "Complete" },
  { type: "Deposit", asset: "ETH", amount: "1.2 ETH", value: "$4,095.48", date: "Aug 29, 2026", status: "Complete" },
  { type: "Withdraw", asset: "USDT", amount: "$1,200.00", value: "$1,200.00", date: "Aug 24, 2026", status: "Complete" },
  { type: "Deposit", asset: "AVAX", amount: "20.0 AVAX", value: "$568.80", date: "Aug 20, 2026", status: "Complete" },
  { type: "Deposit", asset: "USDT", amount: "$10,000.00", value: "$10,000.00", date: "Aug 12, 2026", status: "Pending" },
];

const typeColor: Record<Tx["type"], string> = {
  Deposit: "text-paper",
  Growth: "text-moss",
  Withdraw: "text-paper-dim",
};

export default function TransactionsPage() {
  return (
    <DashboardShell>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="font-serif text-[22px] md:text-[26px] font-medium">Transactions</h1>
        <div className="flex gap-2 overflow-x-auto">
          {["All", "Deposit", "Growth", "Withdraw"].map((f, i) => (
            <button
              key={f}
              className={`text-[13px] px-3.5 py-1.5 border ${
                i === 0
                  ? "bg-gold text-ink border-gold font-medium"
                  : "border-line text-paper-dim"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
      <table className="w-full border-collapse min-w-[560px]">
        <thead>
          <tr>
            <th className="text-left font-mono text-[12px] text-paper-dim font-normal pb-3 border-b border-line">
              Date
            </th>
            <th className="text-left font-mono text-[12px] text-paper-dim font-normal pb-3 border-b border-line">
              Type
            </th>
            <th className="text-right font-mono text-[12px] text-paper-dim font-normal pb-3 border-b border-line">
              Amount
            </th>
            <th className="text-right font-mono text-[12px] text-paper-dim font-normal pb-3 border-b border-line">
              Value
            </th>
            <th className="text-right font-mono text-[12px] text-paper-dim font-normal pb-3 border-b border-line">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, i) => (
            <tr key={i}>
              <td className="py-4 border-b border-line font-mono text-[13.5px] text-paper-dim">
                {tx.date}
              </td>
              <td className={`py-4 border-b border-line text-[14.5px] ${typeColor[tx.type]}`}>
                {tx.type === "Growth" ? "Portfolio growth" : `${tx.type} ${tx.asset}`}
              </td>
              <td className="text-right py-4 border-b border-line font-mono text-[14px]">
                {tx.amount}
              </td>
              <td className="text-right py-4 border-b border-line font-mono text-[14px]">
                {tx.value}
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
          ))}
        </tbody>
      </table>
      </div>
    </DashboardShell>
  );
}
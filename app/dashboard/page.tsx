import DashboardShell from "@/components/DashboardShell";
import PortfolioCard from "@/components/PortfolioCard";
import HoldingsTable from "@/components/HoldingsTable";
import { getHoldingsWithValues, getPortfolioTotal } from "@/lib/crypto-data";
import { formatCurrency } from "@/lib/format";

type Tx = {
  type: "Deposit" | "Growth" | "Withdraw";
  asset: string;
  amount: string;
  date: string;
  status: "Complete" | "Pending";
};

const transactions: Tx[] = [
  { type: "Growth", asset: "Portfolio", amount: "+2.34%", date: "Sep 8", status: "Complete" },
  { type: "Deposit", asset: "BTC", amount: "0.05 BTC", date: "Sep 6", status: "Complete" },
  { type: "Deposit", asset: "USDT", amount: "$5,000.00", date: "Sep 4", status: "Complete" },
  { type: "Deposit", asset: "ETH", amount: "1.2 ETH", date: "Aug 29", status: "Complete" },
];

const AVAILABLE_CASH = 12204.0;
const PORTFOLIO_CHANGE_PERCENT = 2.34;

export default function DashboardPage() {
  const holdings = getHoldingsWithValues();
  const total = getPortfolioTotal();

  return (
    <DashboardShell>
      {/* Portfolio summary */}
      <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-4 md:gap-6 mb-10">
        <PortfolioCard total={total} changePercent={PORTFOLIO_CHANGE_PERCENT} />

        <div className="bg-slate border border-line px-7 py-7 flex flex-col justify-between">
          <div>
            <div className="text-[14px] text-paper-dim mb-2">
              Available cash
            </div>
            <div className="font-mono text-[26px]">
              {formatCurrency(AVAILABLE_CASH)}
            </div>
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
        <HoldingsTable holdings={holdings} />
      </div>

      {/* Recent transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-[20px] font-medium">
            Recent transactions
          </h2>
          <a href="/dashboard/transactions" className="text-[13.5px] text-paper-dim border-b border-paper-dim">
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
import DashboardShell from "@/components/DashboardShell";
import TransactionsTable from "@/components/TransactionsTable";

export default function TransactionsPage() {
  return (
    <DashboardShell>
      <TransactionsTable />
    </DashboardShell>
  );
}
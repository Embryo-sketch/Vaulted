import DashboardShell from "@/components/DashboardShell";

export default function WithdrawPage() {
  return (
    <DashboardShell>
      <div className="max-w-[520px]">
        <h1 className="font-serif text-[22px] md:text-[26px] font-medium mb-6">
          Withdraw
        </h1>

        <div className="bg-slate border border-line px-6 md:px-8 py-8 md:py-10">
          <div className="w-10 h-10 border border-gold flex items-center justify-center mb-6">
            <span className="font-mono text-gold text-[16px]">!</span>
          </div>

          <h2 className="font-serif text-[20px] font-medium mb-3">
            Contact your broker to withdraw
          </h2>
          <p className="text-paper-dim text-[14.5px] leading-relaxed mb-6">
            Please contact your broker directly to arrange your withdrawal.
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}

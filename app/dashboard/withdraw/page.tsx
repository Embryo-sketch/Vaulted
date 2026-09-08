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
            Withdrawals on Vaulted are handled directly by your assigned
            broker to keep your funds secure. Reach out to them with your
            account details and the amount you&apos;d like to withdraw, and
            they&apos;ll take it from there.
          </p>

          <div className="border-t border-line pt-6 flex flex-col gap-4">
            <div className="flex justify-between text-[13.5px]">
              <span className="text-paper-dim">Broker email</span>
              <span className="font-mono">broker@vaulted.com</span>
            </div>
            <div className="flex justify-between text-[13.5px]">
              <span className="text-paper-dim">Broker phone</span>
              <span className="font-mono">+1 (555) 010-0199</span>
            </div>
            <div className="flex justify-between text-[13.5px]">
              <span className="text-paper-dim">Support hours</span>
              <span className="font-mono">Mon–Fri, 9am–6pm</span>
            </div>
          </div>

          <a
            href="mailto:broker@vaulted.com"
            className="bg-gold text-ink font-medium text-[14px] px-5 py-2.5 mt-7 inline-block"
          >
            Email your broker
          </a>
        </div>
      </div>
    </DashboardShell>
  );
}
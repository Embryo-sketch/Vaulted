import DashboardShell from "@/components/DashboardShell";

export default function AboutPage() {
  return (
    <DashboardShell>
      <h1 className="font-serif text-[22px] md:text-[26px] font-medium mb-8">
        About Vaulted
      </h1>

      <div className="flex flex-col gap-8 max-w-[640px]">
        <p className="text-paper-dim text-[15px] leading-relaxed">
          Vaulted was built on a simple idea: owning digital assets shouldn&apos;t
          require watching charts all day. We handle custody, security, and
          growth on your behalf, so depositing is the only step you ever have
          to take.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-line">
          <div className="bg-slate px-6 py-6">
            <div className="font-mono text-[26px] text-gold">$4.1B</div>
            <div className="text-[12.5px] text-paper-dim mt-1">
              Assets under custody
            </div>
          </div>
          <div className="bg-slate px-6 py-6">
            <div className="font-mono text-[26px] text-gold">210K</div>
            <div className="text-[12.5px] text-paper-dim mt-1">
              Accounts funded
            </div>
          </div>
          <div className="bg-slate px-6 py-6">
            <div className="font-mono text-[26px] text-gold">99.98%</div>
            <div className="text-[12.5px] text-paper-dim mt-1">
              Cold-storage ratio
            </div>
          </div>
        </div>

        <section>
          <h2 className="font-mono text-[12.5px] text-gold mb-4">
            OUR APPROACH
          </h2>
          <p className="text-paper-dim text-[15px] leading-relaxed">
            Every deposit is moved into cold storage and managed by our team.
            We don&apos;t ask you to trade, time the market, or maintain a
            portfolio — you send funds in once, and your balance is grown on
            your behalf over time.
          </p>
        </section>

        <section>
          <h2 className="font-mono text-[12.5px] text-gold mb-4">
            SECURITY FIRST
          </h2>
          <p className="text-paper-dim text-[15px] leading-relaxed">
            95%+ of all client assets are held offline, air-gapped from any
            network. Holdings are independently insured, and proof of
            reserves is published monthly for full transparency.
          </p>
        </section>
      </div>
    </DashboardShell>
  );
}
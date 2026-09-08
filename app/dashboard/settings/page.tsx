import DashboardShell from "@/components/DashboardShell";

export default function SettingsPage() {
  return (
    <DashboardShell>
      <h1 className="font-serif text-[22px] md:text-[26px] font-medium mb-8">Settings</h1>

      <div className="flex flex-col gap-10 max-w-[560px]">
        {/* Profile */}
        <section>
          <h2 className="font-mono text-[12.5px] text-gold mb-5">PROFILE</h2>
          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-[13px] text-paper-dim mb-2">
                Full name
              </label>
              <input
                type="text"
                defaultValue="Jane Doe"
                className="w-full bg-slate border border-line text-paper px-4 py-3 text-[14.5px] focus:outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="block text-[13px] text-paper-dim mb-2">
                Email
              </label>
              <input
                type="email"
                defaultValue="jane@example.com"
                className="w-full bg-slate border border-line text-paper px-4 py-3 text-[14.5px] focus:outline-none focus:border-gold"
              />
            </div>
            <div>
              <button className="bg-gold text-ink font-medium text-[14px] px-5 py-2.5 self-start">
                Save changes
              </button>
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="border-t border-line pt-8">
          <h2 className="font-mono text-[12.5px] text-gold mb-5">SECURITY</h2>
          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-[13px] text-paper-dim mb-2">
                Current password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-slate border border-line text-paper placeholder:text-paper-dim px-4 py-3 text-[14.5px] focus:outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="block text-[13px] text-paper-dim mb-2">
                New password
              </label>
              <input
                type="password"
                placeholder="At least 8 characters"
                className="w-full bg-slate border border-line text-paper placeholder:text-paper-dim px-4 py-3 text-[14.5px] focus:outline-none focus:border-gold"
              />
            </div>
            <div className="flex items-center justify-between bg-slate border border-line px-5 py-4">
              <div>
                <div className="text-[14.5px]">Two-factor authentication</div>
                <div className="text-[12.5px] text-paper-dim mt-1">
                  Add an extra layer of security to your account
                </div>
              </div>
              <button className="text-[13px] border border-gold text-gold px-3.5 py-1.5">
                Enable
              </button>
            </div>
            <div>
              <button className="bg-gold text-ink font-medium text-[14px] px-5 py-2.5 self-start">
                Update password
              </button>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="border-t border-line pt-8">
          <h2 className="font-mono text-[12.5px] text-gold mb-5">
            NOTIFICATIONS
          </h2>
          <div className="flex flex-col gap-4">
            {[
              { label: "Price alerts", desc: "Get notified on significant price moves" },
              { label: "Transaction confirmations", desc: "Email me when a trade completes" },
              { label: "Product updates", desc: "Occasional news about new features" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between py-3 border-b border-line last:border-b-0"
              >
                <div>
                  <div className="text-[14.5px]">{item.label}</div>
                  <div className="text-[12.5px] text-paper-dim mt-1">
                    {item.desc}
                  </div>
                </div>
                <div className="w-10 h-5 bg-slate-2 border border-line relative cursor-pointer">
                  <div className="w-3.5 h-3.5 bg-gold absolute top-[2px] left-[2px]" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Danger zone */}
        <section className="border-t border-line pt-8">
          <h2 className="font-mono text-[12.5px] text-rust mb-5">
            DANGER ZONE
          </h2>
          <div className="flex items-center justify-between bg-slate border border-rust px-5 py-4">
            <div>
              <div className="text-[14.5px]">Close account</div>
              <div className="text-[12.5px] text-paper-dim mt-1">
                Withdraw all funds and permanently delete your account
              </div>
            </div>
            <button className="text-[13px] border border-rust text-rust px-3.5 py-1.5">
              Close account
            </button>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
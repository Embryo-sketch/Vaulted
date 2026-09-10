import DashboardShell from "@/components/DashboardShell";

export default function ProfilePage() {
  return (
    <DashboardShell>
      <h1 className="font-serif text-[22px] md:text-[26px] font-medium mb-8">
        Profile
      </h1>

      <div className="flex flex-col gap-8 max-w-[560px]">
        <div className="flex items-center gap-4 bg-slate border border-line px-6 py-6">
          <div className="w-14 h-14 rounded-full bg-slate-2 border border-line flex items-center justify-center font-mono text-[18px] text-gold shrink-0">
            JD
          </div>
          <div>
            <div className="text-[17px] font-serif">Jane Doe</div>
            <div className="text-[13px] text-paper-dim mt-1">
              jane@example.com
            </div>
          </div>
        </div>

        <section>
          <h2 className="font-mono text-[12.5px] text-gold mb-5">
            ACCOUNT DETAILS
          </h2>
          <div className="flex flex-col">
            <div className="flex justify-between py-3.5 border-b border-line text-[14.5px]">
              <span className="text-paper-dim">Full name</span>
              <span>Jane Doe</span>
            </div>
            <div className="flex justify-between py-3.5 border-b border-line text-[14.5px]">
              <span className="text-paper-dim">Email</span>
              <span>jane@example.com</span>
            </div>
            <div className="flex justify-between py-3.5 border-b border-line text-[14.5px]">
              <span className="text-paper-dim">Member since</span>
              <span className="font-mono">Aug 2026</span>
            </div>
            <div className="flex justify-between py-3.5 border-b border-line text-[14.5px]">
              <span className="text-paper-dim">Account status</span>
              <span className="text-moss font-mono">VERIFIED</span>
            </div>
          </div>
        </section>

        <a
          href="/dashboard/settings"
          className="bg-gold text-ink font-medium text-[14px] px-5 py-2.5 self-start"
        >
          Edit in Settings
        </a>
      </div>
    </DashboardShell>
  );
}
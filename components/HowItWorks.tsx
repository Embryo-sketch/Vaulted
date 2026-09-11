type Step = {
  num: string;
  title: string;
  desc: string;
};

const steps: Step[] = [
  {
    num: "01",
    title: "Create your account",
    desc: "Sign up in a couple of minutes. As soon as you're verified, Vaulted assigns you a dedicated deposit address for each supported asset.",
  },
  {
    num: "02",
    title: "Send your assets in",
    desc: "Deposit from any wallet or exchange to your address. There's no minimum trade size and no order book — just a transfer.",
  },
  {
    num: "03",
    title: "Let it grow",
    desc: "Your holdings are managed and grown on your behalf. Check your balance any time — there's nothing to actively trade or manage.",
  },
];

export default function HowItWorks() {
  return (
    <div className="max-w-[1180px] mx-auto px-5 md:px-8">
      <section className="py-24">
        <div className="grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-12 items-end mb-14 border-b border-line pb-10">
          <div>
            <div className="font-mono text-[12.5px] text-gold">
              HOW IT WORKS
            </div>
            <h2 className="font-serif font-medium text-[36px] leading-tight mt-3.5">
              Three steps between you and a growing balance.
            </h2>
          </div>
          <p className="text-paper-dim text-[15.5px] leading-relaxed max-w-[42ch]">
            No order books, no charts to watch — deposit once and let your
            holdings work in the background.
          </p>
        </div>

        <div className="flex flex-col">
          {steps.map((step, i) => (
            <div
              key={step.num}
              className={`grid grid-cols-[50px_1fr] md:grid-cols-[80px_1fr_1.2fr] gap-6 md:gap-8 py-8 items-start border-b border-line transition-colors hover:bg-slate/40 -mx-5 px-5 md:mx-0 md:px-0 ${
                i === 0 ? "border-t" : ""
              }`}
            >
              <div className="font-mono text-[14px] text-paper-dim pt-1">
                {step.num}
              </div>
              <div className="font-serif text-[22px] font-medium">
                {step.title}
              </div>
              <div className="text-paper-dim text-[15px] leading-relaxed max-w-[52ch] col-span-2 md:col-span-1 mt-1.5 md:mt-0">
                {step.desc}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
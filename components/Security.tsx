type SecItem = {
  letter: string;
  title: string;
  desc: string;
};

const items: SecItem[] = [
  {
    letter: "A",
    title: "Offline by default",
    desc: "95%+ of all client assets sit in geographically distributed cold storage, air-gapped from any network.",
  },
  {
    letter: "B",
    title: "Independently insured",
    desc: "Custodied assets are covered against theft and loss through a dedicated third-party underwriter.",
  },
  {
    letter: "C",
    title: "Proof of reserves",
    desc: "Published monthly, cryptographically verifiable — you can check our liabilities against our holdings yourself.",
  },
];

export default function Security() {
  return (
    <div className="bg-slate border-t border-b border-line">
      <div className="max-w-[1180px] mx-auto px-5 md:px-8">
        <section className="pb-24 pt-24">
          <div className="grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-12 items-end">
            <div>
              <div className="font-mono text-[12.5px] text-gold">
                CUSTODY &amp; SECURITY
              </div>
              <h2 className="font-serif font-medium text-[36px] leading-tight mt-3.5">
                Built like a vault, not an app.
              </h2>
            </div>
            <p className="text-paper-dim text-[15.5px] leading-relaxed max-w-[42ch]">
              Every design decision starts from the assumption that someone
              is trying to get in.
            </p>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-line">
        {items.map((item) => (
          <div key={item.letter} className="bg-slate px-6 md:px-9 py-8 md:py-10 hover:bg-slate-2 transition-colors">
            <div className="font-mono text-gold text-[13px]">
              {item.letter}
            </div>
            <h3 className="font-serif text-[21px] font-medium mt-4">
              {item.title}
            </h3>
            <p className="text-paper-dim text-[14.5px] leading-relaxed mt-3">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
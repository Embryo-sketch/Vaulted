export default function Footer() {
  return (
    <footer className="border-t border-line py-14 pb-10">
      <div className="max-w-[1180px] mx-auto px-5 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10">
          <div>
            <div className="flex items-center gap-2.5 font-serif text-[18px]">
              <span className="relative w-4 h-4 border-[1.5px] border-gold inline-block" />
              Vaulted
            </div>
            <p className="text-paper-dim text-[13.5px] mt-3.5 max-w-[30ch] leading-relaxed">
              Direct ownership of digital assets, custodied like it matters.
            </p>
          </div>

          <div>
            <h4 className="font-mono text-[12.5px] text-paper-dim mb-4">
              PRODUCT
            </h4>
            <a href="#" className="block text-[14px] text-paper mb-2.5">
              Markets
            </a>
            <a href="#" className="block text-[14px] text-paper mb-2.5">
              Custody
            </a>
            <a href="#" className="block text-[14px] text-paper mb-2.5">
              Pricing
            </a>
          </div>

          <div>
            <h4 className="font-mono text-[12.5px] text-paper-dim mb-4">
              COMPANY
            </h4>
            <a href="#" className="block text-[14px] text-paper mb-2.5">
              About
            </a>
            <a href="#" className="block text-[14px] text-paper mb-2.5">
              Security
            </a>
            <a href="#" className="block text-[14px] text-paper mb-2.5">
              Careers
            </a>
          </div>

          <div>
            <h4 className="font-mono text-[12.5px] text-paper-dim mb-4">
              LEGAL
            </h4>
            <a href="#" className="block text-[14px] text-paper mb-2.5">
              Terms
            </a>
            <a href="#" className="block text-[14px] text-paper mb-2.5">
              Privacy
            </a>
            <a href="#" className="block text-[14px] text-paper mb-2.5">
              Disclosures
            </a>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-line flex flex-col md:flex-row justify-between gap-2 text-[12.5px] text-paper-dim font-mono">
          <span>© 2026 VAULTED FINANCIAL</span>
          <span>
            DIGITAL ASSETS ARE VOLATILE — INVEST WHAT YOU CAN AFFORD TO LOSE
          </span>
        </div>
      </div>
    </footer>
  );
}
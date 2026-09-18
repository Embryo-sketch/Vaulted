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
            <Link href="/markets" className="block text-[14px] text-paper mb-2.5 hover:text-gold transition-colors">
              Markets
            </Link>
            <Link href="/custody" className="block text-[14px] text-paper mb-2.5 hover:text-gold transition-colors">
              Custody
            </Link>
            <Link href="/pricing" className="block text-[14px] text-paper mb-2.5 hover:text-gold transition-colors">
              Pricing
            </Link>
          </div>

          <div>
            <h4 className="font-mono text-[12.5px] text-paper-dim mb-4">
              COMPANY
            </h4>
            <Link href="/about" className="block text-[14px] text-paper mb-2.5 hover:text-gold transition-colors">
              About
            </Link>
            <Link href="/security" className="block text-[14px] text-paper mb-2.5 hover:text-gold transition-colors">
              Security
            </Link>
            <Link href="/careers" className="block text-[14px] text-paper mb-2.5 hover:text-gold transition-colors">
              Careers
            </Link>
          </div>

          <div>
            <h4 className="font-mono text-[12.5px] text-paper-dim mb-4">
              LEGAL
            </h4>
            <Link href="/terms" className="block text-[14px] text-paper mb-2.5 hover:text-gold transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="block text-[14px] text-paper mb-2.5 hover:text-gold transition-colors">
              Privacy
            </Link>
            <Link href="/disclosures" className="block text-[14px] text-paper mb-2.5 hover:text-gold transition-colors">
              Disclosures
            </Link>
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
import Link from "next/link";

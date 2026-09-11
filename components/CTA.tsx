import Link from "next/link";

export default function CTA() {
  return (
    <div className="max-w-[1180px] mx-auto px-5 md:px-8">
      <section className="py-28">
        <div className="grid grid-cols-1 md:grid-cols-[1.3fr_0.7fr] gap-10 items-end border-t border-gold pt-11">
          <h2 className="font-serif font-medium text-[32px] md:text-[44px] leading-tight max-w-[16ch]">
            Start with as little as $200. Deposit once, grow over time.
          </h2>
          <div className="flex flex-col items-start gap-4">
            <Link
              href="/signup"
              className="bg-gold text-ink px-6 py-3.5 text-[15px] font-medium"
            >
              Open an account
            </Link>
            <p className="text-paper-dim text-[14px]">
              No trading fees for your first 30 days.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
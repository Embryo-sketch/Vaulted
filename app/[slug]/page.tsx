import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import MarketsTable from "@/components/MarketsTable";
import HowItWorks from "@/components/HowItWorks";
import Security from "@/components/Security";

const pages: Record<string, { eyebrow: string; title: string; intro: string; sections: { title: string; body: string }[] }> = {
  about: { eyebrow: "ABOUT VAULTED", title: "A simpler way to own digital assets.", intro: "Vaulted is built for people who want a clear, considered way to hold digital assets without spending their day watching markets.", sections: [{ title: "Our approach", body: "We focus on a straightforward experience: open an account, complete verification, make a deposit, and review your account from one secure dashboard." }, { title: "Built for clarity", body: "Your account shows your available balance, holdings, and transaction history in one place." }] },
  custody: { eyebrow: "CUSTODY", title: "Digital-asset custody with care at every step.", intro: "Vaulted is designed around secure account access, clear transaction records, and a custody-first experience.", sections: [{ title: "Account controls", body: "Account verification and administrator review help keep deposit and transaction activity controlled." }, { title: "Transparent records", body: "Your dashboard keeps your holdings and completed transaction history easy to review." }] },
  pricing: { eyebrow: "PRICING", title: "Straightforward investment tiers.", intro: "Choose the tier that fits your deposit amount. Rates are annualized and shown before you invest.", sections: [{ title: "Starter", body: "$200–$999 · 4.5% annual percentage rate." }, { title: "Growth", body: "$1,000–$4,999 · 6.2% annual percentage rate." }, { title: "Advanced through Elite", body: "$5,000 and above · Rates from 8.1% to 12.8%, based on the selected tier." }] },
  careers: { eyebrow: "CAREERS", title: "Help shape a calmer way to own digital assets.", intro: "We are building a thoughtful product for customers who value clarity, control, and a well-designed experience.", sections: [{ title: "Our team", body: "We value careful thinking, direct communication, and putting customer trust first." }, { title: "Future opportunities", body: "There are no open roles listed at this time. Please check back for future opportunities." }] },
  terms: { eyebrow: "LEGAL", title: "Terms of use.", intro: "These terms explain the general rules for using the Vaulted website and account experience.", sections: [{ title: "Using the service", body: "You are responsible for providing accurate information, securing your sign-in credentials, and using the service lawfully." }, { title: "Important notice", body: "Digital assets are volatile. Nothing on this website is financial, legal, or tax advice. Review all information carefully before making financial decisions." }] },
  privacy: { eyebrow: "LEGAL", title: "Privacy policy.", intro: "We collect the information needed to create and operate your account, provide support, and meet verification requirements.", sections: [{ title: "Information we use", body: "This can include account details, verification information, transaction records, and messages sent to support." }, { title: "How it is protected", body: "We use access controls and limit information access to the purposes needed to operate the service and support customers." }] },
  disclosures: { eyebrow: "LEGAL", title: "Risk disclosures.", intro: "Digital assets involve risk, including price volatility, technology risk, and the possibility of loss.", sections: [{ title: "Market risk", body: "The value of digital assets can change rapidly and may decline significantly. Past performance does not guarantee future results." }, { title: "No guarantee", body: "Rates, availability, and account features may change. Review the current information in your account before proceeding." }] },
};

export function generateStaticParams() { return ["about", "custody", "pricing", "careers", "terms", "privacy", "disclosures", "how-it-works", "security", "markets"].map((slug) => ({ slug })); }

function StandardPage({ page }: { page: (typeof pages)[string] }) { return <><Nav /><main className="max-w-[1180px] mx-auto px-5 md:px-8 py-16 md:py-24"><div className="max-w-[780px] border-b border-line pb-10"><p className="font-mono text-[12px] text-gold">{page.eyebrow}</p><h1 className="font-serif text-[40px] md:text-[58px] leading-[1.05] mt-4">{page.title}</h1><p className="text-paper-dim text-[17px] leading-relaxed mt-6 max-w-[62ch]">{page.intro}</p></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">{page.sections.map((section) => <section key={section.title} className="border border-line bg-slate px-6 py-7"><h2 className="font-serif text-[23px]">{section.title}</h2><p className="text-paper-dim text-[14.5px] leading-relaxed mt-3">{section.body}</p></section>)}</div><Link href="/signup" className="inline-block bg-gold text-ink font-medium px-5 py-3 mt-10">Open an account</Link></main><Footer /></>; }

export default async function PublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === "markets") return <><Nav /><MarketsTable /><Footer /></>;
  if (slug === "how-it-works") return <><Nav /><HowItWorks /><Footer /></>;
  if (slug === "security") return <><Nav /><Security /><Footer /></>;
  const page = pages[slug];
  if (!page) notFound();
  return <StandardPage page={page} />;
}

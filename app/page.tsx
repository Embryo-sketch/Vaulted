import Nav from "@/components/Nav";
import TickerStrip from "@/components/TickerStrip";
import Hero from "@/components/Hero";
import InvestmentTiersSection from "@/components/InvestmentTiersSection";
import HowItWorks from "@/components/HowItWorks";
import MarketsTable from "@/components/MarketsTable";
import Security from "@/components/Security";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";

export default function Home() {
  return (
    <>
      <Nav />
      <TickerStrip />
      <Hero />
      <Reveal>
        <InvestmentTiersSection />
      </Reveal>
      <Reveal>
        <HowItWorks />
      </Reveal>
      <Reveal>
        <MarketsTable />
      </Reveal>
      <Reveal>
        <Security />
      </Reveal>
      <Reveal>
        <CTA />
      </Reveal>
      <Footer />
    </>
  );
}
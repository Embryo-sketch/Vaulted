import Nav from "@/components/Nav";
import TickerStrip from "@/components/TickerStrip";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import MarketsTable from "@/components/MarketsTable";
import Security from "@/components/Security";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <TickerStrip />
      <Hero />
      <HowItWorks />
      <MarketsTable />
      <Security />
      <CTA />
      <Footer />
    </>
  );
}
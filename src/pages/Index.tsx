import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FoundingMemberBanner from "@/components/FoundingMemberBanner";
import CareMembershipBanner from "@/components/CareMembershipBanner";
import ServicesGrid from "@/components/ServicesGrid";
import IVDirectBookBanner from "@/components/IVDirectBookBanner";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import SEOSchema from "@/components/SEOSchema";
import AssistantHub from "@/components/AssistantHub";
import { FloatingMobileCTA } from "@/components/FloatingMobileCTA";
import { FloatingMobileChatCTA } from "@/components/FloatingMobileChatCTA";
import CacheRefreshBanner from "@/components/CacheRefreshBanner";

const Index = () => {
  return (
    <div className="min-h-screen">
      <CacheRefreshBanner />
      <SEOSchema />
      <Navbar />
      <main>
        <Hero />
        <IVDirectBookBanner />
        <FoundingMemberBanner />
        <div className="section-divider max-w-5xl mx-auto" />
        <ServicesGrid />
        <CareMembershipBanner />
        <div className="section-divider max-w-5xl mx-auto" />
        {/* Credibility bar */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-6">
            <div className="flex flex-wrap items-center justify-center gap-6 text-muted-foreground text-xs font-jost font-medium tracking-[2.5px] uppercase text-center">
              <span>Board-Certified Physician Direction</span>
              <span className="text-accent/40">·</span>
              <span>Evans Town Center</span>
              <span className="text-accent/40">·</span>
              <span>BCBS</span>
              <span className="text-accent/40">·</span>
              <span>TRICARE</span>
              <span className="text-accent/40">·</span>
              <span>VA Accepted</span>
            </div>
          </div>
        </section>
        <div className="section-divider max-w-5xl mx-auto" />
        <Contact />
      </main>
      <Footer />
      <AssistantHub />
      <FloatingMobileCTA />
      <FloatingMobileChatCTA />
    </div>
  );
};

export default Index;
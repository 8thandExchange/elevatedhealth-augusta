import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FoundingMemberBanner from "@/components/FoundingMemberBanner";
import CareMembershipBanner from "@/components/CareMembershipBanner";
import IVDirectBookBanner from "@/components/IVDirectBookBanner";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import SEOSchema from "@/components/SEOSchema";
import AssistantHub from "@/components/AssistantHub";
import { FloatingMobileCTA } from "@/components/FloatingMobileCTA";
import { FloatingMobileChatCTA } from "@/components/FloatingMobileChatCTA";
import CacheRefreshBanner from "@/components/CacheRefreshBanner";

import PromiseSection from "@/components/home/PromiseSection";
import WhyElevatedSection from "@/components/home/WhyElevatedSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import WhatWeDoSection from "@/components/home/WhatWeDoSection";
import DifferenceSection from "@/components/home/DifferenceSection";
import ClinicalTeamSection from "@/components/home/ClinicalTeamSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <CacheRefreshBanner />
      <SEOSchema />
      <Navbar />
      <main>
        <Hero />

        <PromiseSection />
        <div className="section-divider max-w-5xl mx-auto" />

        <WhyElevatedSection />
        <div className="section-divider max-w-5xl mx-auto" />

        <HowItWorksSection />
        <div className="section-divider max-w-5xl mx-auto" />

        <WhatWeDoSection />
        <div className="section-divider max-w-5xl mx-auto" />

        <IVDirectBookBanner />
        <FoundingMemberBanner />

        <DifferenceSection />
        <div className="section-divider max-w-5xl mx-auto" />

        <CareMembershipBanner />
        <div className="section-divider max-w-5xl mx-auto" />

        <ClinicalTeamSection />
        <div className="section-divider max-w-5xl mx-auto" />

        {/* TODO: Press & Recognition section — hidden until at least 4 real partner/press logos exist. */}

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

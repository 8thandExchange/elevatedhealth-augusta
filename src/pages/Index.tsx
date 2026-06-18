import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import IVDirectBookBanner from "@/components/IVDirectBookBanner";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import SEOSchema from "@/components/SEOSchema";
import { FloatingMobileCTA } from "@/components/FloatingMobileCTA";
import CacheRefreshBanner from "@/components/CacheRefreshBanner";

import PromiseSection from "@/components/home/PromiseSection";
import WhyElevatedSection from "@/components/home/WhyElevatedSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import WhatWeDoSection from "@/components/home/WhatWeDoSection";
import DifferenceSection from "@/components/home/DifferenceSection";
import ClinicalTeamSection from "@/components/home/ClinicalTeamSection";
import HomeClinicGallery from "@/components/home/HomeClinicGallery";
import { EverythingIncludedPillars } from "@/components/marketing/EverythingIncludedPillars";

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

        <HomeClinicGallery />
        <div className="section-divider max-w-5xl mx-auto" />

        <section className="py-16 md:py-20 bg-surface">
          <div className="container mx-auto px-6 lg:px-8 max-w-5xl">
            <EverythingIncludedPillars />
          </div>
        </section>
        <div className="section-divider max-w-5xl mx-auto" />

        <WhyElevatedSection />
        <div className="section-divider max-w-5xl mx-auto" />

        <HowItWorksSection />
        <div className="section-divider max-w-5xl mx-auto" />

        <WhatWeDoSection />
        <div className="section-divider max-w-5xl mx-auto" />

        <IVDirectBookBanner />

        <DifferenceSection />
        <div className="section-divider max-w-5xl mx-auto" />

        <ClinicalTeamSection />
        <div className="section-divider max-w-5xl mx-auto" />

        {/* TODO: Press & Recognition section — hidden until at least 4 real partner/press logos exist. */}

        {/* Credibility bar */}
        <section className="py-12 bg-surface border-t border-border">
          <div className="container mx-auto px-6">
            <div className="flex flex-wrap items-center justify-center gap-6 text-muted-foreground text-xs font-jost font-medium tracking-[2.5px] uppercase text-center">
              <span>Physician-owned · Evans, GA</span>
              <span className="text-accent/40">·</span>
              <span>Cash-pay · Superbills available</span>
              <span className="text-accent/40">·</span>
              <span>HSA / FSA welcome</span>
            </div>
          </div>
        </section>

        <div className="section-divider max-w-5xl mx-auto" />
        <Contact />
      </main>
      <Footer />
      <FloatingMobileCTA />
    </div>
  );
};

export default Index;

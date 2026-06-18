import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import IVDirectBookBanner from "@/components/IVDirectBookBanner";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import SEOSchema from "@/components/SEOSchema";
import { FloatingMobileCTA } from "@/components/FloatingMobileCTA";
import CacheRefreshBanner from "@/components/CacheRefreshBanner";

import TrustStatsSection from "@/components/home/TrustStatsSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import ConditionsMarquee from "@/components/home/ConditionsMarquee";
import PromiseSection from "@/components/home/PromiseSection";
import LabFocusSection from "@/components/home/LabFocusSection";
import WhyElevatedSection from "@/components/home/WhyElevatedSection";
import WhatWeDoSection from "@/components/home/WhatWeDoSection";
import PatientStoriesSection from "@/components/home/PatientStoriesSection";
import DifferenceSection from "@/components/home/DifferenceSection";
import HomePricingSection from "@/components/home/HomePricingSection";
import ClinicalTeamSection from "@/components/home/ClinicalTeamSection";
import HomeClinicGallery from "@/components/home/HomeClinicGallery";
import { EverythingIncludedPillars } from "@/components/marketing/EverythingIncludedPillars";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CacheRefreshBanner />
      <SEOSchema />
      <Navbar />
      <main className="flex-1">
        <Hero />
        <TrustStatsSection />
        <HowItWorksSection />
        <ConditionsMarquee />
        <PromiseSection />
        <LabFocusSection />
        <WhyElevatedSection />
        <WhatWeDoSection />
        <section className="py-16 md:py-20 bg-background">
          <div className="container mx-auto px-6 lg:px-8 max-w-5xl">
            <EverythingIncludedPillars className="shadow-[var(--shadow-sm)]" />
          </div>
        </section>
        <PatientStoriesSection />
        <DifferenceSection />
        <HomePricingSection />
        <HomeClinicGallery />
        <ClinicalTeamSection />
        <IVDirectBookBanner />
        <Contact showCredibilityBar />
      </main>
      <Footer />
      <FloatingMobileCTA />
    </div>
  );
};

export default Index;

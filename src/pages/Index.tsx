import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FinancingBanner from "@/components/FinancingBanner";
import OurTreatments from "@/components/OurTreatments";
import MissionStatement from "@/components/MissionStatement";
import NotReadyToBook from "@/components/NotReadyToBook";
import WhyUsCompare from "@/components/WhyUsCompare";
import ClinicVideo from "@/components/ClinicVideo";
import InsuranceLogos from "@/components/InsuranceLogos";
import MediaFeature from "@/components/MediaFeature";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import ConsultationModal from "@/components/ConsultationModal";
import SEOSchema from "@/components/SEOSchema";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import AssistantHub from "@/components/AssistantHub";
import { FloatingMobileCTA } from "@/components/FloatingMobileCTA";
import { FloatingMobileChatCTA } from "@/components/FloatingMobileChatCTA";
import { useState } from "react";

const Index = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <SEOSchema />
      <Navbar />
      <main>
        <Hero onOpenBooking={() => setIsBookingOpen(true)} />
        <FinancingBanner />
        <MissionStatement onOpenBooking={() => setIsBookingOpen(true)} />
        <OurTreatments onOpenBooking={() => setIsBookingOpen(true)} />
        <div className="container mx-auto px-4 py-12">
          <NotReadyToBook />
        </div>
        <WhyUsCompare onOpenBooking={() => setIsBookingOpen(true)} />
        <ClinicVideo />
        <InsuranceLogos />
        <MediaFeature />
        <Contact onOpenBooking={() => setIsBookingOpen(true)} />
      </main>
      <Footer />
      <AssistantHub />
      <FloatingMobileCTA />
      <FloatingMobileChatCTA />
      <PWAInstallPrompt />
      <ConsultationModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
    </div>
  );
};

export default Index;

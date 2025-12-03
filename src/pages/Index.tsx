import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import OurTreatments from "@/components/OurTreatments";
import MissionStatement from "@/components/MissionStatement";
import WhyUsCompare from "@/components/WhyUsCompare";
import ClinicVideo from "@/components/ClinicVideo";
import InsuranceLogos from "@/components/InsuranceLogos";
import MediaFeature from "@/components/MediaFeature";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import ConsultationModal from "@/components/ConsultationModal";
import SEOSchema from "@/components/SEOSchema";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

import ChatBot from "@/components/ChatBot";

import MobileBookNow from "@/components/MobileBookNow";
import { useState } from "react";

const Index = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <SEOSchema />
      <Navbar onOpenBooking={() => setIsBookingOpen(true)} />
      <main>
        <Hero onOpenBooking={() => setIsBookingOpen(true)} />
        <MissionStatement onOpenBooking={() => setIsBookingOpen(true)} />
        <OurTreatments onOpenBooking={() => setIsBookingOpen(true)} />
        <WhyUsCompare onOpenBooking={() => setIsBookingOpen(true)} />
        <ClinicVideo />
        <InsuranceLogos />
        <MediaFeature />
        <Contact onOpenBooking={() => setIsBookingOpen(true)} />
      </main>
      <Footer />
      <ChatBot />
      
      <MobileBookNow />
      <PWAInstallPrompt />
      <ConsultationModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
    </div>
  );
};

export default Index;
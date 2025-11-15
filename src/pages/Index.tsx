import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import PillarGrid from "@/components/PillarGrid";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import ConsultationModal from "@/components/ConsultationModal";

import ChatBot from "@/components/ChatBot";
import { ServedModal } from "@/components/ServedModal";
import MobileBookNow from "@/components/MobileBookNow";
import { useState } from "react";

const Index = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Navbar onOpenBooking={() => setIsBookingOpen(true)} />
      <main>
        <Hero onOpenBooking={() => setIsBookingOpen(true)} />
        <PillarGrid onOpenBooking={() => setIsBookingOpen(true)} />
        <Contact />
      </main>
      <Footer />
      <ChatBot />
      <ServedModal />
      <MobileBookNow />
      <ConsultationModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
    </div>
  );
};

export default Index;

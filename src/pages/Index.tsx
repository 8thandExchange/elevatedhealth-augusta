import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Treatments from "@/components/Treatments";
import Compare from "@/components/Compare";
import Team from "@/components/Team";
import ClinicTour from "@/components/ClinicTour";
import KetamineTherapy from "@/components/KetamineTherapy";
import Veterans from "@/components/Veterans";
import Insurance from "@/components/Insurance";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import BookingWidget from "@/components/BookingWidget";
import ChatBot from "@/components/ChatBot";
import { ServedModal } from "@/components/ServedModal";
import MobileBookNow from "@/components/MobileBookNow";
import WhatToExpect from "@/components/WhatToExpect";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Treatments />
        <Compare />
        <WhatToExpect />
        <Team />
        <ClinicTour />
        <KetamineTherapy />
        <Veterans />
        <Insurance />
        <Testimonials />
        <BookingWidget />
        <Contact />
      </main>
      <Footer />
      <ChatBot />
      <ServedModal />
      <MobileBookNow />
    </div>
  );
};

export default Index;

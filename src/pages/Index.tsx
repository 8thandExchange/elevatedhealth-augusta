import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import PillarGrid from "@/components/PillarGrid";
import Compare from "@/components/Compare";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

import ChatBot from "@/components/ChatBot";
import { ServedModal } from "@/components/ServedModal";
import MobileBookNow from "@/components/MobileBookNow";
import { useState } from "react";

const Index = () => {
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <PillarGrid />
        <Compare isQuizOpen={isQuizOpen} onQuizClose={() => setIsQuizOpen(false)} />
        <Testimonials />
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

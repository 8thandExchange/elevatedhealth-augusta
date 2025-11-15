import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Treatments from "@/components/Treatments";
import Compare from "@/components/Compare";
import About from "@/components/About";
import Team from "@/components/Team";
import ClinicTour from "@/components/ClinicTour";
import KetraTherapy from "@/components/KetraTherapy";
import Veterans from "@/components/Veterans";
import Insurance from "@/components/Insurance";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import BookingWidget from "@/components/BookingWidget";
import ChatBot from "@/components/ChatBot";
import { ServedModal } from "@/components/ServedModal";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Treatments />
        <Compare />
        <About />
        <Team />
        <ClinicTour />
        <KetraTherapy />
        <Veterans />
        <Insurance />
        <Testimonials />
        <BookingWidget />
        <Contact />
      </main>
      <Footer />
      <ChatBot />
      <ServedModal />
    </div>
  );
};

export default Index;

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import KetraTherapy from "@/components/KetraTherapy";
import Veterans from "@/components/Veterans";
import Insurance from "@/components/Insurance";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <About />
        <KetraTherapy />
        <Veterans />
        <Insurance />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      <ChatBot />
    </div>
  );
};

export default Index;

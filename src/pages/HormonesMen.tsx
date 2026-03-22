import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useBooking } from "@/contexts/BookingContext";
import { useEffect } from "react";

const HormonesMen = () => {
  const { openBooking } = useBooking();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const services = [
    "Testosterone replacement therapy (TRT) — in-clinic injections",
    "Testosterone cypionate and enanthate protocols",
    "Pellet therapy (coming soon)",
    "Peptide protocols (Sermorelin, CJC/Ipamorelin)",
    "GLP-1 weight loss (semaglutide, tirzepatide)",
    "Comprehensive men's hormone panel",
    "Quarterly labs and monitoring",
  ];

  return (
    <>
      <Helmet>
        <title>Men's Health & TRT | Réveil</title>
        <meta name="description" content="Testosterone replacement therapy, peptide protocols & GLP-1 weight loss for men. Physician-supervised in Evans, GA." />
        <link rel="canonical" href="https://reveil.health/hormones-men" />
      </Helmet>
      <div className="min-h-screen">
        <Navbar />
        <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-background">
          <div className="container mx-auto px-6 lg:px-8 max-w-3xl">
            <p className="section-label mb-6">Men's Health</p>
            <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl text-foreground mb-8 leading-tight">
              Your drive didn't disappear.<br /><span className="italic">Your testosterone did.</span>
            </h1>
            <p className="font-jost font-light text-lg text-muted-foreground leading-relaxed mb-8">
              Low energy. Stubborn weight. A libido that's gone quiet. These aren't signs of getting older — they're signs your testosterone has declined.
            </p>
            <p className="font-jost font-light text-lg text-muted-foreground leading-relaxed">
              At Réveil, we test your levels, confirm the diagnosis, and prescribe a physician-supervised protocol that actually works. In-clinic injections. Monitored quarterly. Not shipped to your door and forgotten.
            </p>
          </div>
        </section>
        <div className="section-divider max-w-3xl mx-auto" />
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-6 lg:px-8 max-w-3xl">
            <p className="section-label mb-6">What We Offer</p>
            <ul className="space-y-4">
              {services.map((s) => (
                <li key={s} className="font-jost font-light text-foreground text-lg flex items-start gap-3">
                  <span className="text-accent mt-1.5 text-sm">—</span>{s}
                </li>
              ))}
            </ul>
          </div>
        </section>
        <div className="section-divider max-w-3xl mx-auto" />
        <section className="py-16 md:py-24 bg-background text-center">
          <div className="container mx-auto px-6">
            <Button onClick={openBooking} size="lg" className="bg-primary text-accent font-jost font-medium tracking-wide text-sm px-10 py-6 rounded-sm hover:bg-primary-light">
              Check your levels — $149 consultation<ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
        <Footer />
      </div>
    </>
  );
};

export default HormonesMen;
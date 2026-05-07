import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CareMembershipBanner from "@/components/CareMembershipBanner";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useBooking } from "@/contexts/BookingContext";
import { useEffect } from "react";

const peptides = [
  { name: "Sermorelin", desc: "Growth hormone support, sleep, energy, body composition", price: "$199–249/mo" },
  { name: "CJC-1295 / Ipamorelin", desc: "Performance, muscle, fat loss, recovery", price: "$249–299/mo" },
  { name: "NAD+ (IV)", desc: "Cellular energy, brain clarity, anti-aging", price: "$299–399/infusion" },
  { name: "GHK-Cu", desc: "Tissue repair, skin, collagen, hair", price: "$149–179/mo" },
  { name: "Semaglutide / Tirzepatide", desc: "GLP-1 weight loss, up to 22% body weight reduction", price: "$299–499/mo" },
  { name: "Thymosin Alpha-1", desc: "Immune modulation", price: "$199–249/mo" },
];

const PeptideTherapy = () => {
  const { openBooking } = useBooking();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <>
      <Helmet>
        <title>Peptide Therapy | Elevated Health Augusta</title>
        <meta name="description" content="The first physician-supervised peptide program in the Augusta area. Sermorelin, CJC/Ipamorelin, NAD+, GHK-Cu & more." />
        <link rel="canonical" href="https://elevatedhealthaugusta.com/peptides" />
      </Helmet>
      <div className="min-h-screen">
        <Navbar />
        <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-background">
          <div className="container mx-auto px-6 lg:px-8 max-w-3xl">
            <p className="section-label mb-6">Peptide Protocols</p>
            <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl text-foreground mb-8 leading-tight">
              Physician-prescribed. Precision-compounded.<br /><span className="italic">The first peptide program in the Augusta area.</span>
            </h1>
            <p className="font-jost font-light text-lg text-muted-foreground leading-relaxed">
              Peptides are short chains of amino acids that signal your body to perform specific functions — stimulate growth hormone, accelerate tissue repair, enhance fat metabolism, sharpen cognition. No Augusta-area clinic is offering this under physician oversight. Elevated Health Augusta is first.
            </p>
          </div>
        </section>
        <div className="section-divider max-w-3xl mx-auto" />
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-6 lg:px-8 max-w-3xl">
            <div className="space-y-0">
              {peptides.map((p) => (
                <div key={p.name} className="py-6 border-b border-border/50">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-playfair text-lg text-foreground">{p.name}</h3>
                    <span className="font-jost font-medium text-accent text-sm shrink-0 ml-4">{p.price}</span>
                  </div>
                  <p className="font-jost font-light text-sm text-muted-foreground">{p.desc}</p>
                </div>
              ))}
            </div>
            <p className="font-jost font-light text-sm text-muted-foreground mt-8 italic">
              All peptide protocols require physician consultation and prescription. Compounded via PCAB-accredited pharmacy. Starting at $79 Wellness Assessment.
            </p>
          </div>
        </section>
        <div className="section-divider max-w-3xl mx-auto" />
        <section className="py-16 md:py-24 bg-background text-center">
          <div className="container mx-auto px-6">
            <Button onClick={openBooking} size="lg" className="bg-primary text-accent font-jost font-medium tracking-wide text-sm px-10 py-6 rounded-sm hover:bg-primary-light">
              Schedule your peptide consultation<ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
        <CareMembershipBanner />
        <Footer />
      </div>
    </>
  );
};

export default PeptideTherapy;
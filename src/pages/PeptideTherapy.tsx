import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ConsultationModal from "@/components/ConsultationModal";
import { SITE_CONFIG } from "@/lib/siteConfig";

// Custom elegant line icons in gold
const NeuralGrowthIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1">
    <circle cx="24" cy="12" r="6" />
    <circle cx="24" cy="36" r="6" />
    <circle cx="12" cy="24" r="5" />
    <circle cx="36" cy="24" r="5" />
    <line x1="24" y1="18" x2="24" y2="30" />
    <line x1="17" y1="24" x2="19" y2="24" />
    <line x1="29" y1="24" x2="31" y2="24" />
    <line x1="18" y1="16" x2="20" y2="18" />
    <line x1="28" y1="18" x2="30" y2="16" />
    <line x1="18" y1="32" x2="20" y2="30" />
    <line x1="28" y1="30" x2="30" y2="32" />
  </svg>
);

const CellEnergyIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1">
    <ellipse cx="24" cy="24" rx="16" ry="20" />
    <ellipse cx="24" cy="24" rx="8" ry="10" />
    <circle cx="24" cy="24" r="3" fill="currentColor" fillOpacity="0.3" />
    <path d="M24 4 L24 8" />
    <path d="M24 40 L24 44" />
    <path d="M8 24 L12 24" />
    <path d="M36 24 L40 24" />
    <circle cx="16" cy="14" r="2" />
    <circle cx="32" cy="18" r="2" />
    <circle cx="18" cy="32" r="2" />
    <circle cx="30" cy="30" r="2" />
  </svg>
);

const VitalitySunIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1">
    <circle cx="24" cy="24" r="10" />
    <circle cx="24" cy="24" r="5" fill="currentColor" fillOpacity="0.2" />
    <line x1="24" y1="2" x2="24" y2="10" />
    <line x1="24" y1="38" x2="24" y2="46" />
    <line x1="2" y1="24" x2="10" y2="24" />
    <line x1="38" y1="24" x2="46" y2="24" />
    <line x1="8" y1="8" x2="14" y2="14" />
    <line x1="34" y1="34" x2="40" y2="40" />
    <line x1="8" y1="40" x2="14" y2="34" />
    <line x1="34" y1="14" x2="40" y2="8" />
  </svg>
);

const DNAHelixIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1">
    <path d="M16 4 Q24 12 16 20 Q8 28 16 36 Q24 44 16 52" strokeLinecap="round" />
    <path d="M32 4 Q24 12 32 20 Q40 28 32 36 Q24 44 32 52" strokeLinecap="round" />
    <line x1="16" y1="8" x2="32" y2="8" />
    <line x1="18" y1="14" x2="30" y2="14" />
    <line x1="16" y1="20" x2="32" y2="20" />
    <line x1="14" y1="26" x2="34" y2="26" />
    <line x1="16" y1="32" x2="32" y2="32" />
    <line x1="18" y1="38" x2="30" y2="38" />
    <line x1="16" y1="44" x2="32" y2="44" />
  </svg>
);

const pillars = [
  {
    icon: NeuralGrowthIcon,
    title: "Growth Hormone Support",
    subtitle: "Sermorelin / Tesamorelin",
    benefit: "Stimulates natural HGH production to improve sleep quality, burn visceral fat, and enhance skin elasticity.",
    category: "Metabolic & Growth",
    price: "From $149/mo",
  },
  {
    icon: CellEnergyIcon,
    title: "NAD+ Brain Restoration",
    subtitle: "NAD+ Therapy",
    benefit: "Replenishes cellular energy to banish brain fog, improve focus, and support DNA repair.",
    category: "Cognitive & Cellular Energy",
    price: "Troches from $99/mo | Injections from $199/mo",
  },
  {
    icon: VitalitySunIcon,
    title: "Desire & Intimacy",
    subtitle: "PT-141 Protocol",
    benefit: "Neurologically activates desire and arousal in both men and women, restoring the spark that stress often steals.",
    category: "Libido & Vitality",
    price: "$225 per 10-Dose Kit",
  },
];

const PeptideTherapy = () => {
  const [isConsultOpen, setIsConsultOpen] = useState(false);

  const schema = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "name": "Elevated Health Augusta - Peptide Therapy",
    "image": "https://elevatedhealthaugusta.com/og-image.jpg",
    "description": "Advanced peptide therapy protocols in Augusta, GA. Sermorelin, NAD+, and PT-141 treatments for cellular optimization and longevity.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": SITE_CONFIG.address.line1,
      "addressLocality": "Evans",
      "addressRegion": "GA",
      "postalCode": "30809",
      "addressCountry": "US"
    },
    "telephone": SITE_CONFIG.phone,
    "medicalSpecialty": "Regenerative Medicine",
    "availableService": [
      { "@type": "MedicalTherapy", "name": "Sermorelin Therapy" },
      { "@type": "MedicalTherapy", "name": "NAD+ Therapy" },
      { "@type": "MedicalTherapy", "name": "PT-141 Therapy" }
    ]
  };

  return (
    <>
      <Helmet>
        <title>Peptide Therapy Augusta | Sermorelin, NAD+, PT-141 - Elevated Health</title>
        <meta name="description" content="Advanced peptide therapy protocols in Augusta, GA. FDA-compliant Sermorelin, NAD+, and PT-141 treatments for cellular optimization, longevity, and vitality." />
        <meta name="keywords" content="peptide therapy Augusta, Sermorelin Augusta GA, NAD+ therapy Augusta, PT-141 Augusta, HGH therapy Georgia, anti-aging peptides" />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main>
          {/* Hero Section */}
          <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden">
            {/* Abstract DNA/Cell background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-gold/5" />
            <div className="absolute inset-0 opacity-10">
              <DNAHelixIcon className="absolute top-20 right-10 w-48 h-48 text-gold" />
              <DNAHelixIcon className="absolute bottom-20 left-10 w-32 h-32 text-primary" />
            </div>
            
            <div className="container mx-auto px-4 sm:px-6 relative z-10">
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-cormorant mb-6 animate-fade-in-up text-foreground">
                  Cellular Optimization<br />& Longevity
                </h1>
                <p className="text-lg md:text-xl lg:text-2xl font-cormorant text-muted-foreground leading-relaxed mb-10 animate-fade-in-up max-w-2xl mx-auto" style={{ animationDelay: "0.1s" }}>
                  Advanced peptide protocols to signal your body to repair, restore, and rejuvenate.
                </p>
                <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                  <Button
                    onClick={() => setIsConsultOpen(true)}
                    size="lg"
                    className="bg-transparent border border-foreground text-foreground hover:bg-gold hover:text-white hover:border-gold px-10 py-6 text-base md:text-lg transition-all duration-300"
                  >
                    Request a Peptide Strategy Session
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Legal & Safe Disclaimer */}
          <section className="py-12 md:py-16 bg-secondary/30 border-y border-gold/20">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold/10 mb-6">
                  <svg className="w-6 h-6 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                </div>
                <p className="text-lg md:text-xl font-cormorant text-foreground leading-relaxed">
                  At Elevated Health, safety is our north star. We strictly utilize <span className="text-gold font-semibold">FDA-compliant, pharmacy-compounded peptides</span> sourced from licensed US facilities. We do not use research-grade or gray-market substances.
                </p>
              </div>
            </div>
          </section>

          {/* Three Pillars of Peptides */}
          <section className="py-20 md:py-28 bg-background">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-cormorant mb-4 text-foreground">
                    The Three Pillars of Peptides
                  </h2>
                  <p className="text-lg font-cormorant text-muted-foreground max-w-2xl mx-auto">
                    Targeted protocols for every dimension of your vitality.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {pillars.map((pillar, index) => {
                    const Icon = pillar.icon;
                    return (
                      <Card 
                        key={index} 
                        className="bg-card border border-gold/30 rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                      >
                        <CardContent className="p-8 text-center">
                          <div className="text-xs font-lato uppercase tracking-widest text-gold mb-4">
                            {pillar.category}
                          </div>
                          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gold/10 mb-6">
                            <Icon className="w-12 h-12 text-gold" />
                          </div>
                          <h3 className="text-xl md:text-2xl font-cormorant mb-2 text-foreground">
                            {pillar.title}
                          </h3>
                          <p className="text-sm font-lato text-gold mb-4">
                            {pillar.subtitle}
                          </p>
                          <p className="text-base font-cormorant text-muted-foreground leading-relaxed mb-4">
                            {pillar.benefit}
                          </p>
                          <p className="text-sm font-lato font-semibold text-gold">
                            {pillar.price}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 md:py-28 bg-gradient-to-b from-secondary/30 to-background">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-cormorant mb-6 text-foreground">
                  Ready to Optimize Your Biology?
                </h2>
                <p className="text-lg font-cormorant text-muted-foreground mb-6 max-w-xl mx-auto">
                  Schedule a personalized peptide strategy session to discover which protocols align with your health goals.
                </p>
                <p className="text-sm font-lato text-muted-foreground mb-10 max-w-md mx-auto italic">
                  All peptide protocols include supplies and shipping.
                </p>
                <Button
                  onClick={() => setIsConsultOpen(true)}
                  size="lg"
                  className="bg-transparent border border-foreground text-foreground hover:bg-gold hover:text-white hover:border-gold px-10 py-6 text-base md:text-lg transition-all duration-300"
                >
                  Request a Peptide Strategy Session
                </Button>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>

      <ConsultationModal isOpen={isConsultOpen} onClose={() => setIsConsultOpen(false)} />
    </>
  );
};

export default PeptideTherapy;

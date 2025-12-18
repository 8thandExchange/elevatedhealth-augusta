import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ConsultationModal from "@/components/ConsultationModal";
import AssistantHub from "@/components/AssistantHub";
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

const HeartPulseIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1">
    <path d="M24 42 C10 30 4 22 4 14 C4 8 9 4 15 4 C19 4 22 6 24 9 C26 6 29 4 33 4 C39 4 44 8 44 14 C44 22 38 30 24 42Z" />
    <path d="M8 24 L16 24 L20 16 L24 32 L28 20 L32 24 L40 24" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MetabolicIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1">
    <circle cx="24" cy="24" r="18" />
    <path d="M24 8 L24 12" />
    <path d="M24 36 L24 40" />
    <path d="M8 24 L12 24" />
    <path d="M36 24 L40 24" />
    <path d="M16 24 Q20 16 24 24 Q28 32 32 24" strokeLinecap="round" />
    <circle cx="24" cy="24" r="4" fill="currentColor" fillOpacity="0.2" />
  </svg>
);

const RegenerationIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1">
    <path d="M24 4 L24 16 M24 32 L24 44" />
    <path d="M4 24 L16 24 M32 24 L44 24" />
    <circle cx="24" cy="24" r="8" />
    <circle cx="24" cy="24" r="16" strokeDasharray="4 4" />
    <circle cx="24" cy="4" r="2" fill="currentColor" />
    <circle cx="24" cy="44" r="2" fill="currentColor" />
    <circle cx="4" cy="24" r="2" fill="currentColor" />
    <circle cx="44" cy="24" r="2" fill="currentColor" />
  </svg>
);

const peptideCategories = [
  {
    category: "Growth & Recovery",
    icon: NeuralGrowthIcon,
    description: "Stimulate natural HGH production for better sleep, fat loss, and healing.",
    products: [
      {
        name: "Sermorelin",
        subtitle: "Growth Hormone Secretagogue",
        benefit: "Supports your body's natural nighttime hormone rhythms. Improves sleep quality, reduces visceral fat, and enhances recovery.",
        price: "$149/mo",
        type: "recurring",
      },
      {
        name: "CJC-1295/Ipamorelin",
        subtitle: "Short-Acting GH Pulse Stimulation",
        benefit: "Gently stimulates growth hormone pulses during sleep without supplying hormone directly. Often better tolerated than longer-acting formulations.",
        price: "$179/mo",
        type: "recurring",
        badge: "Alternative",
      },
      {
        name: "Tesamorelin",
        subtitle: "FDA-Approved GH Releasing Hormone",
        benefit: "FDA-approved for visceral fat reduction. Affects growth hormone signaling to help reduce central adiposity in select patients.",
        price: "$399/mo",
        type: "recurring",
        badge: "FDA-Approved",
      },
    ],
  },
  {
    category: "Cellular Energy",
    icon: CellEnergyIcon,
    description: "Restore mitochondrial function and banish brain fog.",
    products: [
      {
        name: "NAD+ Troches",
        subtitle: "Sublingual NAD+ Precursor",
        benefit: "Daily sublingual tablets to replenish NAD+ levels. Supports cellular energy production; some patients notice improved energy or mental clarity.",
        price: "$99/mo",
        type: "recurring",
      },
      {
        name: "NAD+ Injection",
        subtitle: "Direct NAD+ Delivery",
        benefit: "Higher bioavailability for maximum cellular energy restoration. Ideal for fatigue and anti-aging protocols.",
        price: "$199/mo",
        type: "recurring",
      },
      {
        name: "NAD+ Nasal Spray",
        subtitle: "Fast-Acting NAD+",
        benefit: "Rapid absorption through nasal mucosa. Convenient daily boost for cognitive performance.",
        price: "$99",
        type: "one_time",
      },
    ],
  },
  {
    category: "Sexual Wellness",
    icon: HeartPulseIcon,
    description: "Restore desire, arousal, and intimate health.",
    products: [
      {
        name: "PT-141",
        subtitle: "Desire & Arousal",
        benefit: "FDA-approved medication that works on the brain's desire pathways. Helps improve sexual interest and arousal in both men and women.",
        price: "$225/kit",
        type: "one_time",
        note: "10-dose kit",
        badge: "FDA-Approved",
      },
      {
        name: "Oxytocin Nasal Spray",
        subtitle: "Bonding & Connection",
        benefit: "Often called the 'love hormone,' oxytocin supports emotional bonding, intimacy, and connection. May help reduce anxiety in social and intimate settings.",
        price: "$79/mo",
        type: "recurring",
      },
    ],
  },
  {
    category: "Metabolic Enhancement",
    icon: MetabolicIcon,
    description: "Target stubborn fat and optimize metabolic pathways.",
    products: [
      {
        name: "5-Amino-1MQ",
        subtitle: "NNMT Inhibitor",
        benefit: "Targets the NNMT enzyme to help the body use fat for energy more efficiently. Supports metabolic health and may help reduce stubborn adipose tissue.",
        price: "$279/mo",
        type: "recurring",
        badge: "Advanced",
      },
    ],
  },
  {
    category: "Skin & Hair Regeneration",
    icon: RegenerationIcon,
    description: "Support skin repair and hair health with copper peptides.",
    products: [
      {
        name: "GHK-Cu Sublingual",
        subtitle: "Copper Peptide Complex",
        benefit: "Supports skin repair and collagen signaling. Often used to improve skin quality and texture.",
        price: "$99",
        type: "one_time",
      },
      {
        name: "GHK-Cu Topical",
        subtitle: "Targeted Skin Therapy",
        benefit: "Apply directly to skin for collagen synthesis, wound healing, and anti-aging benefits.",
        price: "$149",
        type: "one_time",
      },
    ],
  },
];

const PeptideTherapy = () => {
  const [isConsultOpen, setIsConsultOpen] = useState(false);

  const schema = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "name": "Elevated Health Augusta - Peptide Therapy",
    "image": "https://elevatedhealthaugusta.com/og-image.jpg",
    "description": "Advanced peptide therapy protocols in Augusta, GA. Sermorelin, NAD+, PT-141, Oxytocin, GHK-Cu, and more for cellular optimization and longevity.",
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
      { "@type": "MedicalTherapy", "name": "PT-141 Therapy" },
      { "@type": "MedicalTherapy", "name": "Oxytocin Therapy" },
      { "@type": "MedicalTherapy", "name": "GHK-Cu Therapy" },
      { "@type": "MedicalTherapy", "name": "5-Amino-1MQ Therapy" }
    ]
  };

  return (
    <>
      <Helmet>
        <title>Peptide Therapy Augusta | Sermorelin, NAD+, PT-141, Oxytocin, GHK-Cu - Elevated Health</title>
        <meta name="description" content="Advanced peptide therapy protocols in Augusta, GA. FDA-compliant Sermorelin, NAD+, PT-141, Oxytocin, GHK-Cu, and metabolic peptides for cellular optimization and longevity." />
        <meta name="keywords" content="peptide therapy Augusta, Sermorelin Augusta GA, NAD+ therapy Augusta, PT-141 Augusta, Oxytocin therapy, GHK-Cu peptide, 5-Amino-1MQ, anti-aging peptides Georgia" />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main>
          {/* Hero Section */}
          <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-gold/5" />
            <div className="absolute inset-0 opacity-10">
              <DNAHelixIcon className="absolute top-20 right-10 w-48 h-48 text-gold" />
              <DNAHelixIcon className="absolute bottom-20 left-10 w-32 h-32 text-primary" />
            </div>
            
            <div className="container mx-auto px-4 sm:px-6 relative z-10">
              <div className="max-w-4xl mx-auto text-center">
                <Badge variant="outline" className="mb-4 px-4 py-1.5 border-gold/30 text-gold font-lato">
                  5 Categories • FDA-Compliant Protocols
                </Badge>
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

          {/* Getting Started - Entry Point */}
          <section className="py-16 md:py-20 bg-background">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl font-cormorant mb-4 text-foreground">
                    Your Entry Point
                  </h2>
                  <p className="text-lg font-cormorant text-muted-foreground">
                    Start with a personalized strategy session to determine which protocols align with your goals.
                  </p>
                </div>

                <Card className="bg-card border-2 border-gold/50 rounded-2xl shadow-lg p-8">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                        <DNAHelixIcon className="w-7 h-7 text-gold" />
                      </div>
                      <div>
                        <span className="inline-block mb-2 px-3 py-1 bg-gold/10 text-gold rounded-full text-xs font-lato">
                          Step 1: Consultation
                        </span>
                        <h3 className="text-xl font-cormorant text-foreground mb-1">
                          Peptide Strategy Session
                        </h3>
                        <p className="text-sm text-muted-foreground font-lato">
                          Meet with our provider to review your health goals and determine which peptide protocols are right for you. The $99 fee is credited toward your treatment.
                        </p>
                      </div>
                    </div>
                    <div className="text-center md:text-right shrink-0">
                      <span className="text-3xl font-cormorant text-foreground">$99</span>
                      <p className="text-xs text-muted-foreground">one-time</p>
                      <Button
                        onClick={() => setIsConsultOpen(true)}
                        className="mt-4 bg-gold hover:bg-gold-dark text-white rounded-full px-6"
                      >
                        Book Strategy Session
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </section>

          {/* Five Categories of Peptides */}
          {peptideCategories.map((category, catIndex) => {
            const Icon = category.icon;
            return (
              <section 
                key={category.category} 
                className={`py-16 md:py-20 ${catIndex % 2 === 0 ? 'bg-secondary/30' : 'bg-background'}`}
              >
                <div className="container mx-auto px-4 sm:px-6">
                  <div className="max-w-6xl mx-auto">
                    {/* Category Header */}
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center">
                        <Icon className="w-8 h-8 text-gold" />
                      </div>
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-cormorant text-foreground">
                          {category.category}
                        </h2>
                        <p className="text-muted-foreground font-lato">
                          {category.description}
                        </p>
                      </div>
                    </div>

                    {/* Products Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {category.products.map((product, prodIndex) => (
                        <Card 
                          key={product.name}
                          className="bg-card border border-border/50 rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-gold/30"
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                {product.badge && (
                                  <Badge 
                                    className={`mb-2 text-xs ${
                                      product.badge === 'New' 
                                        ? 'bg-green-500/10 text-green-600 border-green-500/30' 
                                        : product.badge === 'Premium'
                                        ? 'bg-gold/10 text-gold border-gold/30'
                                        : 'bg-purple-500/10 text-purple-600 border-purple-500/30'
                                    }`}
                                    variant="outline"
                                  >
                                    {product.badge}
                                  </Badge>
                                )}
                                <h3 className="text-xl font-cormorant text-foreground">
                                  {product.name}
                                </h3>
                                <p className="text-sm text-gold font-lato">
                                  {product.subtitle}
                                </p>
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground font-lato leading-relaxed mb-4">
                              {product.benefit}
                            </p>
                            
                            <div className="flex items-end justify-between pt-4 border-t border-border/50">
                              <div>
                                <span className="text-2xl font-cormorant text-foreground">
                                  {product.price}
                                </span>
                                {product.note && (
                                  <p className="text-xs text-muted-foreground">{product.note}</p>
                                )}
                              </div>
                              <Badge variant="outline" className="text-xs text-muted-foreground">
                                {product.type === 'recurring' ? 'Monthly' : 'One-Time'}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            );
          })}

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
        <AssistantHub />
      </div>

      <ConsultationModal isOpen={isConsultOpen} onClose={() => setIsConsultOpen(false)} />
    </>
  );
};

export default PeptideTherapy;

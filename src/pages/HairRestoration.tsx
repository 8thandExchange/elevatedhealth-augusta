import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ConsultationModal from "@/components/ConsultationModal";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { HAIR_RESTORATION_PRODUCTS, CORE_SERVICES } from "@/lib/stripeConfig";
import { Check, Sparkles, Shield, Zap, Users } from "lucide-react";
import NotReadyToBook from "@/components/NotReadyToBook";

// Custom Hair/Follicle Icons
const FollicleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1">
    <ellipse cx="24" cy="38" rx="10" ry="6" />
    <path d="M24 32 Q20 20 24 8" strokeLinecap="round" />
    <path d="M24 32 Q28 20 24 8" strokeLinecap="round" />
    <circle cx="24" cy="38" r="3" fill="currentColor" fillOpacity="0.2" />
    <path d="M18 34 Q16 24 20 14" strokeLinecap="round" strokeOpacity="0.5" />
    <path d="M30 34 Q32 24 28 14" strokeLinecap="round" strokeOpacity="0.5" />
  </svg>
);

const ScalpIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1">
    <path d="M8 28 Q24 8 40 28" strokeLinecap="round" />
    <line x1="16" y1="24" x2="16" y2="14" />
    <line x1="24" y1="20" x2="24" y2="8" />
    <line x1="32" y1="24" x2="32" y2="14" />
    <line x1="20" y1="22" x2="20" y2="12" />
    <line x1="28" y1="22" x2="28" y2="12" />
    <path d="M8 32 Q24 36 40 32" strokeLinecap="round" strokeDasharray="2 2" />
  </svg>
);

const treatmentOptions = [
  {
    name: "Minoxidil + Finasteride",
    subtitle: "The Foundation Protocol",
    description: "Our most popular hair restoration protocol combining two proven medications. Minoxidil stimulates blood flow to follicles while Finasteride blocks DHT—the hormone responsible for male pattern baldness.",
    price: HAIR_RESTORATION_PRODUCTS.minoxidilFinasteride.displayPrice.replace("/mo", ""),
    priceNote: "/month",
    priceId: HAIR_RESTORATION_PRODUCTS.minoxidilFinasteride.priceId,
    benefits: [
      "FDA-approved medications",
      "Stops hair loss at the source",
      "Stimulates new growth",
      "Topical or oral options available",
      "Compounded for optimal absorption"
    ],
    bestFor: "Early to moderate hair loss",
    badge: "Most Popular",
  },
  {
    name: "Dutasteride Protocol",
    subtitle: "Advanced DHT Blocker",
    description: "For patients who need stronger DHT blocking, Dutasteride inhibits both Type I and Type II 5-alpha reductase enzymes—providing more comprehensive protection than Finasteride alone.",
    price: HAIR_RESTORATION_PRODUCTS.dutasteride.displayPrice.replace("/mo", ""),
    priceNote: "/month",
    priceId: HAIR_RESTORATION_PRODUCTS.dutasteride.priceId,
    benefits: [
      "Blocks 90%+ of DHT production",
      "More effective than Finasteride",
      "Once-daily dosing",
      "Combined with Minoxidil",
      "Ideal for aggressive hair loss"
    ],
    bestFor: "Moderate to advanced hair loss",
    badge: "Premium",
  },
  {
    name: HAIR_RESTORATION_PRODUCTS.ghkCuScalp.name,
    subtitle: "Regenerative Copper Peptide",
    description: "A powerful regenerative peptide that stimulates hair follicle stem cells, increases follicle size, and extends the growth phase of the hair cycle. Can be used alone or combined with other protocols.",
    price: HAIR_RESTORATION_PRODUCTS.ghkCuScalp.displayPrice.replace("/mo", ""),
    priceNote: "/month",
    priceId: HAIR_RESTORATION_PRODUCTS.ghkCuScalp.priceId,
    benefits: [
      "Stimulates hair follicle stem cells",
      "Increases blood vessel formation",
      "Anti-inflammatory properties",
      "Enhances results of other treatments",
      "Available as topical or sublingual"
    ],
    bestFor: "All stages • Enhancement therapy",
    badge: "Peptide",
  },
];

const comparisonData = [
  { feature: "DHT Blocking", minFin: "70%", dut: "90%+", ghk: "Indirect" },
  { feature: "Growth Stimulation", minFin: "Yes", dut: "Yes", ghk: "Yes" },
  { feature: "FDA Approved", minFin: "Yes", dut: "Off-label", ghk: "Research" },
  { feature: "Best For", minFin: "Early Loss", dut: "Advanced Loss", ghk: "All Stages" },
  { feature: "Mechanism", minFin: "DHT + Blood Flow", dut: "Strong DHT Block", ghk: "Stem Cell" },
];

const HairRestoration = () => {
  const [isConsultOpen, setIsConsultOpen] = useState(false);

  const schema = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "name": "Elevated Health Augusta - Hair Restoration",
    "image": "https://elevatedhealthaugusta.com/og-image.jpg",
    "description": "Medical hair restoration in Augusta, GA. Prescription Minoxidil, Finasteride, Dutasteride, and GHK-Cu peptide therapy for hair loss treatment.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": SITE_CONFIG.address.line1,
      "addressLocality": "Evans",
      "addressRegion": "GA",
      "postalCode": "30809",
      "addressCountry": "US"
    },
    "telephone": SITE_CONFIG.phone,
    "medicalSpecialty": "Dermatology",
    "availableService": [
      { "@type": "MedicalTherapy", "name": "Minoxidil Therapy" },
      { "@type": "MedicalTherapy", "name": "Finasteride Therapy" },
      { "@type": "MedicalTherapy", "name": "Dutasteride Therapy" },
      { "@type": "MedicalTherapy", "name": "GHK-Cu Peptide Therapy" }
    ]
  };

  return (
    <>
      <Helmet>
        <title>Hair Restoration Augusta | Minoxidil, Finasteride, Dutasteride, GHK-Cu - Elevated Health Augusta</title>
        <meta name="description" content={`Hair restoration in Augusta, GA. ${CORE_SERVICES.wellnessAssessment.displayPrice} Wellness Assessment, paid at booking. Minoxidil, Finasteride, Dutasteride, and GHK-Cu scalp protocols when prescribed.`} />
        <meta name="keywords" content="hair restoration Augusta, hair loss treatment Augusta GA, Minoxidil Augusta, Finasteride Augusta, Dutasteride hair loss, GHK-Cu hair growth, male pattern baldness treatment Georgia" />
        <meta property="og:title" content="Hair Restoration Augusta | Elevated Health Augusta" />
        <meta property="og:description" content={`Hair restoration in Augusta, GA. ${CORE_SERVICES.wellnessAssessment.displayPrice} Wellness Assessment. Physician-prescribed protocols.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://elevatedhealthaugusta.com/hair-restoration" />
        <meta property="og:image" content="https://elevatedhealthaugusta.com/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Hair Restoration Augusta | Elevated Health Augusta" />
        <meta name="twitter:description" content={`${CORE_SERVICES.wellnessAssessment.displayPrice} Wellness Assessment. Physician-prescribed hair protocols in Evans, GA.`} />
        <meta name="twitter:image" content="https://elevatedhealthaugusta.com/og-image.jpg" />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <div className="public-page-shell">
        <Navbar />

        <main className="flex-1" id="main-content">
          {/* Hero Section */}
          <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
            <div className="absolute inset-0 opacity-10">
              <FollicleIcon className="absolute top-20 right-10 w-48 h-48 text-accent" />
              <ScalpIcon className="absolute bottom-20 left-10 w-32 h-32 text-primary" />
            </div>
            
            <div className="container mx-auto px-3 sm:px-4 md:px-6 relative z-10">
              <div className="max-w-4xl mx-auto text-center">
                <Badge variant="outline" className="mb-4 px-4 py-1.5 border-accent/30 text-accent font-jost">
                  For Men & Women
                </Badge>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-playfair mb-6 animate-fade-in-up text-foreground">
                  Hair Restoration<br />& Regrowth
                </h1>
                <p className="text-lg md:text-xl lg:text-2xl font-playfair text-muted-foreground leading-relaxed mb-10 animate-fade-in-up max-w-2xl mx-auto" style={{ animationDelay: "0.1s" }}>
                  Clinically proven treatments to stop hair loss and stimulate new growth. FDA-approved medications combined with cutting-edge peptides.
                </p>
                <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                  <Button
                    onClick={() => setIsConsultOpen(true)}
                    size="lg"
                    className="bg-transparent border border-foreground text-foreground hover:bg-primary hover:text-white hover:border-accent px-10 py-6 text-base md:text-lg transition-all duration-300"
                  >
                    Start Your Hair Restoration Journey
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Why It Works */}
          <section className="py-12 md:py-16 bg-secondary/30 border-y border-accent/20">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                  <div>
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-4">
                      <Shield className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="text-lg font-playfair text-foreground mb-2">Block DHT</h3>
                    <p className="text-sm text-muted-foreground font-jost">
                      Stop the hormone that shrinks follicles and causes pattern baldness.
                    </p>
                  </div>
                  <div>
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-4">
                      <Zap className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="text-lg font-playfair text-foreground mb-2">Stimulate Growth</h3>
                    <p className="text-sm text-muted-foreground font-jost">
                      Increase blood flow and nutrients to dormant follicles.
                    </p>
                  </div>
                  <div>
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-4">
                      <Sparkles className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="text-lg font-playfair text-foreground mb-2">Regenerate</h3>
                    <p className="text-sm text-muted-foreground font-jost">
                      Peptide therapy activates stem cells for follicle regeneration.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Entry Point */}
          <section className="py-16 md:py-20 bg-background">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl font-playfair mb-4 text-foreground">
                    Your Entry Point
                  </h2>
                  <p className="text-lg font-playfair text-muted-foreground">
                    Start with a personalized consultation to assess your hair loss pattern and determine the best protocol.
                  </p>
                </div>

                <Card className="bg-card border-2 border-accent/50 rounded-2xl shadow-lg p-8">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                        <FollicleIcon className="w-7 h-7 text-accent" />
                      </div>
                      <div>
                        <span className="inline-block mb-2 px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-jost">
                          Step 1: Consultation
                        </span>
                        <h3 className="text-xl font-playfair text-foreground mb-1">
                          Hair Restoration Consultation
                        </h3>
                        <p className="text-sm text-muted-foreground font-jost">
                          Meet with our provider to assess your hair loss pattern, discuss your goals, and design a personalized protocol. {CORE_SERVICES.wellnessAssessment.displayPrice} paid at booking.
                        </p>
                      </div>
                    </div>
                    <div className="text-center md:text-right shrink-0">
                      <span className="text-3xl font-playfair text-foreground">{CORE_SERVICES.wellnessAssessment.displayPrice}</span>
                      <p className="text-xs text-muted-foreground">Wellness Assessment</p>
                      <Button
                        onClick={() => setIsConsultOpen(true)}
                        className="mt-4 bg-primary hover:bg-primary-dark text-white rounded-full px-6"
                      >
                        Book Consultation
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </section>

          {/* Have Questions? Section */}
          <section className="section-spacing-sm bg-background">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="max-w-2xl mx-auto">
                <NotReadyToBook 
                  variant="compact" 
                  title="Wondering which protocol is right for you?"
                  description="Hair loss treatment depends on your stage and pattern. We can help you understand options before your consultation."
                  ctaText="Discuss Hair Restoration: (706) 760-3470"
                />
              </div>
            </div>
          </section>

          {/* Treatment Options */}
          <section className="py-16 md:py-20 bg-secondary/30">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl font-playfair mb-4 text-foreground">
                    Treatment Protocols
                  </h2>
                  <p className="text-lg font-playfair text-muted-foreground max-w-2xl mx-auto">
                    Clinically proven medications and peptides tailored to your stage of hair loss.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {treatmentOptions.map((treatment) => (
                    <Card 
                      key={treatment.name} 
                      className={`bg-card border rounded-2xl p-6 flex flex-col ${
                        treatment.badge === "Most Popular" ? "border-2 border-accent/50 shadow-lg" : "border-border/50"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          {treatment.badge && (
                            <Badge 
                              variant="outline" 
                              className={`mb-2 text-xs ${
                                treatment.badge === "Most Popular" 
                                  ? "border-accent/50 text-accent bg-accent/10" 
                                  : treatment.badge === "Premium"
                                  ? "border-amber-500/50 text-amber-600 bg-amber-500/10"
                                  : "border-primary/50 text-primary bg-primary/10"
                              }`}
                            >
                              {treatment.badge}
                            </Badge>
                          )}
                          <h3 className="text-xl font-playfair text-foreground">{treatment.name}</h3>
                          <p className="text-sm text-accent font-jost">{treatment.subtitle}</p>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground font-jost mb-4 flex-grow">
                        {treatment.description}
                      </p>

                      <div className="space-y-2 mb-6">
                        {treatment.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                            <span className="text-sm text-foreground font-jost">{benefit}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-auto">
                        <div className="flex items-baseline gap-1 mb-2">
                          <span className="text-2xl font-playfair text-foreground">{treatment.price}</span>
                          <span className="text-sm text-muted-foreground">{treatment.priceNote}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-4">Best for: {treatment.bestFor}</p>
                        <Button
                          onClick={() => setIsConsultOpen(true)}
                          className={`w-full rounded-full ${
                            treatment.badge === "Most Popular"
                              ? "bg-primary hover:bg-primary-dark text-white"
                              : "bg-transparent border border-foreground text-foreground hover:bg-primary hover:text-white hover:border-accent"
                          }`}
                        >
                          Get Started
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Comparison Table */}
          <section className="py-16 md:py-20 bg-background">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl font-playfair mb-4 text-foreground">
                    Protocol Comparison
                  </h2>
                  <p className="text-lg font-playfair text-muted-foreground">
                    Compare our treatment options to find the best fit for your needs.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-accent/30">
                        <th className="text-left py-4 px-4 font-playfair text-lg text-foreground">Feature</th>
                        <th className="text-center py-4 px-4 font-playfair text-lg text-foreground">Min + Fin</th>
                        <th className="text-center py-4 px-4 font-playfair text-lg text-foreground">Dutasteride</th>
                        <th className="text-center py-4 px-4 font-playfair text-lg text-foreground">GHK-Cu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonData.map((row, idx) => (
                        <tr key={idx} className="border-b border-border/30">
                          <td className="py-4 px-4 text-muted-foreground font-jost">{row.feature}</td>
                          <td className="py-4 px-4 text-center text-foreground font-jost">{row.minFin}</td>
                          <td className="py-4 px-4 text-center text-foreground font-jost">{row.dut}</td>
                          <td className="py-4 px-4 text-center text-foreground font-jost">{row.ghk}</td>
                        </tr>
                      ))}
                      <tr>
                        <td className="py-4 px-4 text-muted-foreground font-jost">Price</td>
                        <td className="py-4 px-4 text-center text-accent font-playfair text-lg">$129/mo</td>
                        <td className="py-4 px-4 text-center text-accent font-playfair text-lg">$149/mo</td>
                        <td className="py-4 px-4 text-center text-accent font-playfair text-lg">$149</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* For Men & Women */}
          <section className="py-16 md:py-20 bg-secondary/30">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-4">
                    <Users className="w-6 h-6 text-accent" />
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-playfair mb-4 text-foreground">
                    For Men & Women
                  </h2>
                  <p className="text-lg font-playfair text-muted-foreground max-w-2xl mx-auto">
                    Hair loss affects both men and women differently. Our protocols are tailored to your specific pattern and hormonal profile.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="bg-card border border-border/50 rounded-2xl p-6">
                    <h3 className="text-xl font-playfair text-foreground mb-4">Male Pattern Hair Loss</h3>
                    <p className="text-sm text-muted-foreground font-jost mb-4">
                      Characterized by receding hairline and crown thinning. Driven primarily by DHT sensitivity. Our protocols focus on aggressive DHT blocking combined with growth stimulation.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm text-foreground">
                        <Check className="w-4 h-4 text-accent" />
                        Finasteride or Dutasteride for DHT control
                      </li>
                      <li className="flex items-center gap-2 text-sm text-foreground">
                        <Check className="w-4 h-4 text-accent" />
                        Minoxidil for growth stimulation
                      </li>
                      <li className="flex items-center gap-2 text-sm text-foreground">
                        <Check className="w-4 h-4 text-accent" />
                        Optional GHK-Cu for enhanced results
                      </li>
                    </ul>
                  </Card>

                  <Card className="bg-card border border-border/50 rounded-2xl p-6">
                    <h3 className="text-xl font-playfair text-foreground mb-4">Female Pattern Hair Loss</h3>
                    <p className="text-sm text-muted-foreground font-jost mb-4">
                      Typically presents as overall thinning, especially at the crown. Often linked to hormonal changes. We coordinate with our hormone optimization protocols for comprehensive treatment.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm text-foreground">
                        <Check className="w-4 h-4 text-accent" />
                        Minoxidil topical therapy
                      </li>
                      <li className="flex items-center gap-2 text-sm text-foreground">
                        <Check className="w-4 h-4 text-accent" />
                        Hormone optimization if indicated
                      </li>
                      <li className="flex items-center gap-2 text-sm text-foreground">
                        <Check className="w-4 h-4 text-accent" />
                        GHK-Cu peptide for regeneration
                      </li>
                    </ul>
                  </Card>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 md:py-20 bg-background">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl sm:text-4xl font-playfair mb-6 text-foreground">
                  Ready to Restore Your Hair?
                </h2>
                <p className="text-lg font-playfair text-muted-foreground mb-8">
                  Book your {CORE_SERVICES.wellnessAssessment.displayPrice} Wellness Assessment to begin a personalized protocol.
                </p>
                <Button
                  onClick={() => setIsConsultOpen(true)}
                  size="lg"
                  className="bg-primary hover:bg-primary-dark text-white px-10 py-6 text-base md:text-lg rounded-full"
                >
                  Book Hair Restoration Consultation
                </Button>
              </div>
            </div>
          </section>
        </main>

        <Footer />
        <ConsultationModal 
          isOpen={isConsultOpen} 
          onClose={() => setIsConsultOpen(false)} 
        />
      </div>
    </>
  );
};

export default HairRestoration;

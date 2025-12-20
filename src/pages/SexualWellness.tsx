import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ConsultationModal from "@/components/ConsultationModal";
import AssistantHub from "@/components/AssistantHub";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { Check, Shield, Clock, Package, Heart } from "lucide-react";
import NotReadyToBook from "@/components/NotReadyToBook";

// Custom Vitality Icon
const VitalityIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1">
    <circle cx="24" cy="24" r="18" />
    <path d="M24 10 L24 24 L34 24" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="24" cy="24" r="4" fill="currentColor" fillOpacity="0.2" />
    <path d="M16 32 Q24 38 32 32" strokeLinecap="round" />
  </svg>
);

const FlameIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1">
    <path d="M24 44 C14 44 8 36 8 28 C8 20 14 14 18 10 C18 18 22 20 24 16 C26 20 30 18 30 10 C34 14 40 20 40 28 C40 36 34 44 24 44Z" />
    <path d="M24 44 C20 44 16 40 16 36 C16 32 20 28 24 28 C28 28 32 32 32 36 C32 40 28 44 24 44Z" fill="currentColor" fillOpacity="0.2" />
  </svg>
);

const treatmentOptions = [
  {
    name: "Tadalafil",
    subtitle: "Daily or As-Needed",
    description: "The active ingredient in Cialis. Available in daily low-dose (2.5-5mg) for spontaneity or higher doses (10-20mg) for as-needed use. Effects last up to 36 hours.",
    price: "$99",
    priceNote: "/month",
    priceId: "price_1SfijREOtKRY99puq0ITndfC",
    benefits: [
      "Effects last up to 36 hours",
      "Daily option for spontaneity",
      "Less timing-dependent",
      "May improve exercise capacity",
      "Discreet monthly delivery"
    ],
    bestFor: "Men seeking flexibility and spontaneity",
    badge: "Most Popular",
    duration: "Up to 36 hours",
  },
  {
    name: "Sildenafil",
    subtitle: "As-Needed",
    description: "The active ingredient in Viagra. Taken 30-60 minutes before activity. Available in 25mg, 50mg, and 100mg doses tailored to your needs.",
    price: "$79",
    priceNote: "/month",
    priceId: "price_1SfijSEOtKRY99pumi7jjNvs",
    benefits: [
      "Fast-acting (30-60 min)",
      "Well-established safety profile",
      "Multiple dose options",
      "Cost-effective solution",
      "Discreet monthly delivery"
    ],
    bestFor: "Men who prefer as-needed treatment",
    badge: null,
    duration: "4-6 hours",
  },
];

const comparisonData = [
  { feature: "Onset Time", tadalafil: "30-45 min", sildenafil: "30-60 min" },
  { feature: "Duration", tadalafil: "Up to 36 hours", sildenafil: "4-6 hours" },
  { feature: "Daily Option", tadalafil: "Yes (2.5-5mg)", sildenafil: "No" },
  { feature: "Food Interaction", tadalafil: "Minimal", sildenafil: "Avoid fatty meals" },
  { feature: "Best For", tadalafil: "Spontaneity", sildenafil: "Planned use" },
];

const SexualWellness = () => {
  const [isConsultOpen, setIsConsultOpen] = useState(false);

  const schema = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "name": "Elevated Health Augusta - Sexual Wellness",
    "image": "https://elevatedhealthaugusta.com/og-image.jpg",
    "description": "Discreet sexual wellness treatments for men in Augusta, GA. Prescription Tadalafil and Sildenafil with telehealth consultations and discreet delivery.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": SITE_CONFIG.address.line1,
      "addressLocality": "Evans",
      "addressRegion": "GA",
      "postalCode": "30809",
      "addressCountry": "US"
    },
    "telephone": SITE_CONFIG.phone,
    "medicalSpecialty": "Urology",
    "availableService": [
      { "@type": "MedicalTherapy", "name": "Tadalafil Therapy" },
      { "@type": "MedicalTherapy", "name": "Sildenafil Therapy" }
    ]
  };

  return (
    <>
      <Helmet>
        <title>Sexual Wellness for Men Augusta | Tadalafil, Sildenafil - Elevated Health</title>
        <meta name="description" content="Discreet sexual wellness treatments for men in Augusta, GA. Prescription Tadalafil (Cialis) and Sildenafil (Viagra) with telehealth consultations and private delivery." />
        <meta name="keywords" content="sexual wellness Augusta, ED treatment Augusta GA, Tadalafil Augusta, Sildenafil Augusta, mens health clinic Georgia, erectile dysfunction treatment" />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar onOpenBooking={() => setIsConsultOpen(true)} />

        <main id="main-content">
          {/* Hero Section */}
          <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-gold/5" />
            <div className="absolute inset-0 opacity-10">
              <FlameIcon className="absolute top-20 right-10 w-48 h-48 text-gold" />
              <VitalityIcon className="absolute bottom-20 left-10 w-32 h-32 text-primary" />
            </div>
            
            <div className="container mx-auto px-4 sm:px-6 relative z-10">
              <div className="max-w-4xl mx-auto text-center">
                <Badge variant="outline" className="mb-4 px-4 py-1.5 border-gold/30 text-gold font-lato">
                  Discreet & Confidential
                </Badge>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-cormorant mb-6 animate-fade-in-up text-foreground">
                  Sexual Wellness<br />for Men
                </h1>
                <p className="text-lg md:text-xl lg:text-2xl font-cormorant text-muted-foreground leading-relaxed mb-10 animate-fade-in-up max-w-2xl mx-auto" style={{ animationDelay: "0.1s" }}>
                  Restore confidence with FDA-approved treatments. Private consultations, personalized dosing, and discreet monthly delivery.
                </p>
                <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                  <Button
                    onClick={() => setIsConsultOpen(true)}
                    size="lg"
                    className="bg-transparent border border-foreground text-foreground hover:bg-gold hover:text-white hover:border-gold px-10 py-6 text-base md:text-lg transition-all duration-300"
                  >
                    Start Your Private Consultation
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Trust Indicators */}
          <section className="py-12 md:py-16 bg-secondary/30 border-y border-gold/20">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                  <div>
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold/10 mb-4">
                      <Shield className="w-6 h-6 text-gold" />
                    </div>
                    <h3 className="text-lg font-cormorant text-foreground mb-2">FDA-Approved</h3>
                    <p className="text-sm text-muted-foreground font-lato">
                      Genuine medications from licensed pharmacies
                    </p>
                  </div>
                  <div>
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold/10 mb-4">
                      <Package className="w-6 h-6 text-gold" />
                    </div>
                    <h3 className="text-lg font-cormorant text-foreground mb-2">Discreet Delivery</h3>
                    <p className="text-sm text-muted-foreground font-lato">
                      Unmarked packaging shipped to your door
                    </p>
                  </div>
                  <div>
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold/10 mb-4">
                      <Heart className="w-6 h-6 text-gold" />
                    </div>
                    <h3 className="text-lg font-cormorant text-foreground mb-2">Provider Support</h3>
                    <p className="text-sm text-muted-foreground font-lato">
                      Ongoing care and dose adjustments
                    </p>
                  </div>
                  <div>
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold/10 mb-4">
                      <Clock className="w-6 h-6 text-gold" />
                    </div>
                    <h3 className="text-lg font-cormorant text-foreground mb-2">Quick Start</h3>
                    <p className="text-sm text-muted-foreground font-lato">
                      Same-day prescriptions available
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Have Questions? Section */}
          <section className="section-spacing-sm bg-secondary/30">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="max-w-2xl mx-auto">
                <NotReadyToBook 
                  variant="compact" 
                  title="Questions? 100% confidential."
                  description="We understand this is personal. Ask about treatment options, dosing, or delivery—completely private, no judgment."
                  ctaText="Call Discreetly: (706) 760-3470"
                />
              </div>
            </div>
          </section>

          {/* Entry Point */}
          <section className="py-16 md:py-20 bg-background">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl font-cormorant mb-4 text-foreground">
                    Private & Confidential
                  </h2>
                  <p className="text-lg font-cormorant text-muted-foreground">
                    Your consultation is completely private. We will discuss your health history, goals, and determine the best treatment option for you.
                  </p>
                </div>

                <Card className="bg-card border-2 border-gold/50 rounded-2xl shadow-lg p-8">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                        <VitalityIcon className="w-7 h-7 text-gold" />
                      </div>
                      <div>
                        <span className="inline-block mb-2 px-3 py-1 bg-gold/10 text-gold rounded-full text-xs font-lato">
                          Step 1: Consultation
                        </span>
                        <h3 className="text-xl font-cormorant text-foreground mb-1">
                          Private Health Assessment
                        </h3>
                        <p className="text-sm text-muted-foreground font-lato">
                          A confidential conversation with our provider to review your health, discuss options, and create your personalized treatment plan. The $99 fee is credited toward your first month.
                        </p>
                      </div>
                    </div>
                    <div className="text-center md:text-right shrink-0">
                      <span className="text-3xl font-cormorant text-foreground">$99</span>
                      <p className="text-xs text-muted-foreground">credited toward treatment</p>
                      <Button
                        onClick={() => setIsConsultOpen(true)}
                        className="mt-4 bg-gold hover:bg-gold-dark text-white rounded-full px-6"
                      >
                        Book Private Consultation
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </section>

          {/* Treatment Options */}
          <section className="py-16 md:py-20 bg-secondary/30">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl font-cormorant mb-4 text-foreground">
                    Treatment Options
                  </h2>
                  <p className="text-lg font-cormorant text-muted-foreground max-w-2xl mx-auto">
                    Two proven medications with different profiles. Your provider will help you choose the best fit.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {treatmentOptions.map((treatment) => (
                    <Card 
                      key={treatment.name} 
                      className={`bg-card border rounded-2xl p-8 flex flex-col ${
                        treatment.badge === "Most Popular" ? "border-2 border-gold/50 shadow-lg" : "border-border/50"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          {treatment.badge && (
                            <Badge 
                              variant="outline" 
                              className="mb-2 text-xs border-gold/50 text-gold bg-gold/10"
                            >
                              {treatment.badge}
                            </Badge>
                          )}
                          <h3 className="text-2xl font-cormorant text-foreground">{treatment.name}</h3>
                          <p className="text-sm text-gold font-lato">{treatment.subtitle}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">
                            {treatment.duration}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground font-lato mb-6">
                        {treatment.description}
                      </p>

                      <div className="space-y-3 mb-6 flex-grow">
                        {treatment.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                            <span className="text-sm text-foreground font-lato">{benefit}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-auto pt-6 border-t border-border/30">
                        <div className="flex items-baseline gap-1 mb-2">
                          <span className="text-3xl font-cormorant text-foreground">{treatment.price}</span>
                          <span className="text-sm text-muted-foreground">{treatment.priceNote}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-4">{treatment.bestFor}</p>
                        <Button
                          onClick={() => setIsConsultOpen(true)}
                          className={`w-full rounded-full ${
                            treatment.badge === "Most Popular"
                              ? "bg-gold hover:bg-gold-dark text-white"
                              : "bg-transparent border border-foreground text-foreground hover:bg-gold hover:text-white hover:border-gold"
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
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl font-cormorant mb-4 text-foreground">
                    Compare Your Options
                  </h2>
                  <p className="text-lg font-cormorant text-muted-foreground">
                    Both medications are effective. The choice depends on your lifestyle and preferences.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gold/30">
                        <th className="text-left py-4 px-4 font-cormorant text-lg text-foreground">Feature</th>
                        <th className="text-center py-4 px-4 font-cormorant text-lg text-foreground">Tadalafil</th>
                        <th className="text-center py-4 px-4 font-cormorant text-lg text-foreground">Sildenafil</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonData.map((row, idx) => (
                        <tr key={idx} className="border-b border-border/30">
                          <td className="py-4 px-4 text-muted-foreground font-lato">{row.feature}</td>
                          <td className="py-4 px-4 text-center text-foreground font-lato">{row.tadalafil}</td>
                          <td className="py-4 px-4 text-center text-foreground font-lato">{row.sildenafil}</td>
                        </tr>
                      ))}
                      <tr>
                        <td className="py-4 px-4 text-muted-foreground font-lato">Monthly Price</td>
                        <td className="py-4 px-4 text-center text-gold font-cormorant text-xl">$99/mo</td>
                        <td className="py-4 px-4 text-center text-gold font-cormorant text-xl">$79/mo</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="py-16 md:py-20 bg-secondary/30">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl font-cormorant mb-4 text-foreground">
                    How It Works
                  </h2>
                  <p className="text-lg font-cormorant text-muted-foreground">
                    Simple, private, and convenient.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl font-cormorant text-gold">1</span>
                    </div>
                    <h3 className="text-lg font-cormorant text-foreground mb-2">Private Consultation</h3>
                    <p className="text-sm text-muted-foreground font-lato">
                      Complete a confidential health assessment with our provider to discuss your needs and medical history.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl font-cormorant text-gold">2</span>
                    </div>
                    <h3 className="text-lg font-cormorant text-foreground mb-2">Personalized Prescription</h3>
                    <p className="text-sm text-muted-foreground font-lato">
                      If appropriate, your provider prescribes the right medication and dose for your situation.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl font-cormorant text-gold">3</span>
                    </div>
                    <h3 className="text-lg font-cormorant text-foreground mb-2">Discreet Delivery</h3>
                    <p className="text-sm text-muted-foreground font-lato">
                      Your medication arrives in unmarked packaging. Ongoing refills and support are included.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-16 md:py-20 bg-background">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl font-cormorant mb-4 text-foreground">
                    Common Questions
                  </h2>
                </div>

                <div className="space-y-6">
                  <div className="border-b border-border/30 pb-6">
                    <h3 className="text-lg font-cormorant text-foreground mb-2">Is this really private?</h3>
                    <p className="text-sm text-muted-foreground font-lato">
                      Yes. Your consultation is confidential. Medications ship in unmarked packaging with no indication of contents. Your privacy is our priority.
                    </p>
                  </div>
                  <div className="border-b border-border/30 pb-6">
                    <h3 className="text-lg font-cormorant text-foreground mb-2">How do I know which medication is right for me?</h3>
                    <p className="text-sm text-muted-foreground font-lato">
                      During your consultation, your provider will discuss your health history, lifestyle, and preferences to recommend the best option. Many men prefer Tadalafil for its longer duration and daily-dose option.
                    </p>
                  </div>
                  <div className="border-b border-border/30 pb-6">
                    <h3 className="text-lg font-cormorant text-foreground mb-2">Are these real medications?</h3>
                    <p className="text-sm text-muted-foreground font-lato">
                      Yes. We prescribe FDA-approved Tadalafil and Sildenafil from licensed US pharmacies. These are the same active ingredients found in Cialis and Viagra.
                    </p>
                  </div>
                  <div className="pb-6">
                    <h3 className="text-lg font-cormorant text-foreground mb-2">Can I cancel anytime?</h3>
                    <p className="text-sm text-muted-foreground font-lato">
                      Yes. There are no long-term commitments. You can pause, adjust, or cancel your subscription at any time through your patient portal.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 md:py-20 bg-secondary/30">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl sm:text-4xl font-cormorant mb-6 text-foreground">
                  Ready to Restore Your Confidence?
                </h2>
                <p className="text-lg font-cormorant text-muted-foreground mb-8">
                  Start with a private consultation. The $99 fee is credited toward your first month of treatment.
                </p>
                <Button
                  onClick={() => setIsConsultOpen(true)}
                  size="lg"
                  className="bg-gold hover:bg-gold-dark text-white px-10 py-6 text-base md:text-lg rounded-full"
                >
                  Book Private Consultation
                </Button>
              </div>
            </div>
          </section>
        </main>

        <Footer />
        <AssistantHub />
        <ConsultationModal 
          isOpen={isConsultOpen} 
          onClose={() => setIsConsultOpen(false)} 
        />
      </div>
    </>
  );
};

export default SexualWellness;

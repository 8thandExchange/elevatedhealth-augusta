import { Helmet } from "react-helmet";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MessageCircle, ClipboardCheck, Heart, Shield, Clock, Phone, DollarSign, CheckCircle } from "lucide-react";
import { trackCTAClick, trackEvent } from "@/lib/analytics";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { useBooking } from "@/contexts/BookingContext";

const WhatToExpectPage = () => {
  const [isCompareQuizOpen, setIsCompareQuizOpen] = useState(false);
  const { openBooking } = useBooking();

  useEffect(() => {
    window.scrollTo(0, 0);
    trackEvent('page_view', { page: 'what_to_expect' });
  }, []);

  const handleBookConsult = () => {
    trackEvent('consult_book', { source: 'what_to_expect_page' });
    trackCTAClick('what_to_expect_consult', 'payment_modal');
    openBooking();
  };

  const handleCallClick = () => {
    trackCTAClick('what_to_expect_call', `tel:+1${SITE_CONFIG.phoneRaw}`);
    window.location.href = `tel:+1${SITE_CONFIG.phoneRaw}`;
  };

  const steps = [
    {
      icon: MessageCircle,
      title: "1. Chat with Our Virtual Care Team",
      description: "Get instant answers about pricing, insurance, and our process. Available 24/7 for all your administrative questions.",
      duration: "Instant • 24/7 • FREE",
      color: "text-accent"
    },
    {
      icon: ClipboardCheck,
      title: "2. $149 Medical Consultation",
      description: "Your first conversation with a provider. Discuss your goals, review your health history, and get a personalized plan.",
      duration: "$99 • Credited toward treatment",
      color: "text-primary"
    },
    {
      icon: Heart,
      title: "3. Your First Treatment",
      description: "Arrive at our private, comfortable suite. Provider-monitored IV infusion or SPRAVATO® nasal spray in a relaxing environment.",
      duration: "45-90 minutes",
      color: "text-accent"
    },
    {
      icon: Shield,
      title: "4. Post-Treatment Care",
      description: "Relax in our recovery area. Our team monitors you until you're ready to leave (with a ride home).",
      duration: "30 minutes",
      color: "text-primary"
    }
  ];

  const protocolBenefits = [
    "70% of patients report relief within hours",
    "Provider-monitored infusions in private suites",
    "Personalized treatment plans",
    "Flexible scheduling options",
    "Insurance verification assistance",
    "Ongoing support and follow-up care"
  ];

  return (
    <>
      <Helmet>
        <title>What to Expect from Ketamine Therapy Augusta | Réveil</title>
        <meta 
          name="description" 
          content="Learn about ketamine infusion cost Augusta, treatment protocol, and what to expect during your visit. 6-8 infusions at $400 each. $149 consultation available." 
        />
        <meta name="keywords" content="ketamine infusion cost Augusta, ketamine therapy protocol, ketamine treatment Augusta GA, IV ketamine price, SPRAVATO cost" />
        <link rel="canonical" href="https://www.reveil.health/what-to-expect" />
        
        {/* Open Graph */}
        <meta property="og:title" content="What to Expect from Ketamine Therapy Augusta | Réveil" />
        <meta property="og:description" content="Complete guide to ketamine therapy at Réveil. Pricing, protocol, and patient journey explained." />
        <meta property="og:url" content="https://www.reveil.health/what-to-expect" />
        <meta property="og:type" content="website" />

        {/* FAQ Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How much does ketamine infusion cost in Augusta?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "IV ketamine infusions are $400 per session. A typical initial protocol consists of 6-8 infusions over 3-4 weeks, followed by monthly maintenance sessions."
                }
              },
              {
                "@type": "Question",
                "name": "What is the ketamine therapy protocol?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The standard protocol includes 6-8 initial infusions administered 2-3 times per week over 3-4 weeks. After the initial series, maintenance infusions are typically scheduled monthly or as needed."
                }
              },
              {
                "@type": "Question",
                "name": "Does insurance cover ketamine therapy?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Many insurance plans cover SPRAVATO® (esketamine) nasal spray. IV ketamine is typically out-of-pocket. We accept Blue Cross Blue Shield, Tricare, and provide insurance verification assistance."
                }
              },
              {
                "@type": "Question",
                "name": "What should I bring to my first ketamine therapy visit?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Bring a government-issued ID, insurance card, list of current medications, comfortable clothing, and a trusted person to drive you home after treatment."
                }
              }
            ]
          })}
        </script>

        {/* Medical Service Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MedicalBusiness",
            "name": "Réveil",
            "description": "Ketamine therapy for treatment-resistant depression, PTSD, and anxiety in Augusta, GA",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": SITE_CONFIG.address.line1,
              "addressLocality": "Evans",
              "addressRegion": "GA",
              "postalCode": "30809"
            },
            "telephone": SITE_CONFIG.phone,
            "priceRange": "$400",
            "medicalSpecialty": "Psychiatry"
          })}
        </script>
      </Helmet>

      <div className="min-h-screen">
        <Navbar />
        
        {/* Hero Section */}
        <section className="relative bg-primary text-primary-foreground py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                What to Expect from Ketamine Therapy Augusta
              </h1>
              <p className="font-inter text-xl md:text-2xl text-primary-foreground/90 mb-8">
                Your complete guide to treatment protocol, pricing, and the patient journey at Réveil
              </p>
              <Button
                variant="secondary"
                size="lg"
                className="gap-2 shadow-lg hover:shadow-xl transition-all"
                onClick={handleBookConsult}
              >
                <ClipboardCheck className="h-5 w-5" />
                Book $149 Medical Consultation
              </Button>
            </div>
          </div>
        </section>

        {/* Video Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto mb-16">
              <div className="text-center mb-12">
                <h2 className="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Tour Our Clinic
                </h2>
                <p className="font-inter text-lg text-muted-foreground">
                  Experience the calming environment where your healing journey begins
                </p>
              </div>
              
              <Card className="overflow-hidden shadow-2xl border-2 border-accent/20">
                <CardContent className="p-0">
                  <div className="aspect-video w-full bg-muted">
                    <video
                      controls
                      className="w-full h-full object-cover"
                      preload="auto"
                      style={{ 
                        objectFit: 'cover',
                        filter: 'contrast(1.05) saturate(1.1)'
                      }}
                    >
                      <source src="/videos/clinic-experience.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Patient Journey Steps */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-secondary/5 to-accent/5">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="font-playfair text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
                Your Journey in 4 Simple Steps
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                {steps.map((step, index) => (
                  <Card 
                    key={index}
                    className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-border hover:border-accent/40"
                  >
                    <CardContent className="p-6 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
                        <step.icon className={`h-8 w-8 ${step.color}`} />
                      </div>
                      
                      <h3 className="font-playfair text-xl font-semibold text-foreground mb-3">
                        {step.title}
                      </h3>
                      
                      <p className="font-inter text-sm text-muted-foreground mb-4 leading-relaxed">
                        {step.description}
                      </p>
                      
                      <div className="inline-flex items-center gap-1 px-3 py-1 bg-secondary/50 rounded-full">
                        <Clock className="h-3 w-3 text-accent" />
                        <span className="text-xs font-medium text-foreground">{step.duration}</span>
                      </div>
                    </CardContent>
                    
                    {index < steps.length - 1 && (
                      <div className="hidden lg:block absolute top-1/3 -right-3 w-6 h-0.5 bg-accent/30 z-10" />
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing & Protocol Accordion */}
        <section id="pricing" className="py-16 md:py-24 bg-background scroll-mt-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Pricing & Treatment Protocol
                </h2>
                <p className="font-inter text-lg text-muted-foreground">
                  Transparent pricing and clear treatment pathways
                </p>
              </div>

              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="iv-ketamine" className="border-2 border-border rounded-lg px-6">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-accent" />
                      <span className="font-playfair text-xl font-semibold">IV Ketamine Infusion Cost</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-3">
                    <p className="font-inter text-muted-foreground">
                      <strong className="text-foreground">$400 per session</strong>
                    </p>
                    <p className="font-inter text-muted-foreground">
                      Initial Protocol: 6-8 infusions over 3-4 weeks (2-3 sessions per week)
                    </p>
                    <p className="font-inter text-muted-foreground">
                      Total Initial Investment: $2,400 - $3,200
                    </p>
                    <p className="font-inter text-muted-foreground">
                      Maintenance: Monthly sessions as needed ($400/month)
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="spravato" className="border-2 border-border rounded-lg px-6">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-primary" />
                      <span className="font-playfair text-xl font-semibold">SPRAVATO® Nasal Spray</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-3">
                    <p className="font-inter text-muted-foreground">
                      <strong className="text-foreground">Often covered by insurance</strong> (Blue Cross Blue Shield, Tricare, and others)
                    </p>
                    <p className="font-inter text-muted-foreground">
                      Protocol: Twice weekly for 4 weeks, then weekly for 4 weeks, then maintenance
                    </p>
                    <p className="font-inter text-muted-foreground">
                      We provide insurance verification and prior authorization assistance
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="protocol" className="border-2 border-border rounded-lg px-6">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Heart className="h-5 w-5 text-accent" />
                      <span className="font-playfair text-xl font-semibold">Treatment Protocol Details</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-3">
                    <p className="font-inter text-muted-foreground">
                      <strong className="text-foreground">Initial Phase (3-4 weeks):</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-2 font-inter text-muted-foreground ml-4">
                      <li>6-8 infusions administered 2-3 times per week</li>
                      <li>Each session lasts 45-90 minutes</li>
                      <li>Provider-monitored in private treatment suites</li>
                      <li>Vital signs tracked throughout treatment</li>
                    </ul>
                    <p className="font-inter text-muted-foreground pt-2">
                      <strong className="text-foreground">Maintenance Phase:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-2 font-inter text-muted-foreground ml-4">
                      <li>Monthly or as-needed sessions</li>
                      <li>Personalized to your response</li>
                      <li>Ongoing provider support</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="insurance" className="border-2 border-border rounded-lg px-6">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span className="font-playfair text-xl font-semibold">Insurance & Payment Options</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-3">
                    <p className="font-inter text-muted-foreground">
                      <strong className="text-foreground">We Accept:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-2 font-inter text-muted-foreground ml-4">
                      <li>Blue Cross Blue Shield (SPRAVATO® often covered)</li>
                      <li>Tricare (100% coverage for eligible veterans)</li>
                      <li>Most major insurance plans (SPRAVATO® coverage)</li>
                      <li>Cash pay for IV ketamine infusions</li>
                    </ul>
                    <p className="font-inter text-muted-foreground pt-2">
                      Our team will verify your insurance benefits and help with prior authorizations at no cost to you.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="what-to-bring" className="border-2 border-border rounded-lg px-6">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <ClipboardCheck className="h-5 w-5 text-accent" />
                      <span className="font-playfair text-xl font-semibold">What to Bring</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <ul className="list-disc list-inside space-y-2 font-inter text-muted-foreground ml-4">
                      <li>Government-issued ID and insurance card</li>
                      <li>List of current medications and dosages</li>
                      <li>Comfortable clothing (layers recommended)</li>
                      <li>A trusted friend or family member to drive you home</li>
                      <li>Any questions you'd like to discuss with our team</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-accent/5 to-primary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-playfair text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
                Why Choose Réveil?
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {protocolBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center mt-1">
                      <CheckCircle className="h-4 w-4 text-accent" />
                    </div>
                    <p className="font-inter text-base text-foreground">
                      {benefit}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-6">
                Ready to Start Your Healing Journey?
              </h2>
              <p className="font-inter text-xl mb-8 text-primary-foreground/90">
                Book your 30-minute consultation today. No obligation, completely confidential.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  variant="secondary"
                  size="lg"
                  className="gap-2 shadow-lg hover:shadow-xl transition-all"
                  onClick={handleBookConsult}
                >
                  <ClipboardCheck className="h-5 w-5" />
                  Book $149 Medical Consultation
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10"
                  onClick={handleCallClick}
                >
                  <Phone className="h-5 w-5" />
                  Call {SITE_CONFIG.phone}
                </Button>
              </div>

              <p className="font-inter text-sm text-primary-foreground/80 mt-6">
                Most insurance plans cover SPRAVATO® • Veterans receive special benefits • Flexible scheduling
              </p>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default WhatToExpectPage;

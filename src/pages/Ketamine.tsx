import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useState } from "react";
import ConsultationModal from "@/components/ConsultationModal";

const Ketamine = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  
  const scrollToContact = () => {
    const element = document.getElementById("cta-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const experienceItems = [
    "Private, serene treatment suite",
    "Continuous vitals monitoring",
    "Board-certified provider oversight",
    "Comfortable, spa-like environment",
    "Integration support & follow-up"
  ];

  const faqs = [
    {
      q: "How quickly does ketamine work?",
      a: "Many patients notice improvement within 24 hours of their first infusion, with full effects developing over a series of 6-8 treatments."
    },
    {
      q: "Is ketamine therapy covered by insurance?",
      a: "SPRAVATO® (esketamine) is often covered by insurance for treatment-resistant depression. IV ketamine is typically not covered but we accept Blue Cross Blue Shield, Tricare, and offer flexible payment options."
    },
    {
      q: "What's the difference between IV ketamine and SPRAVATO®?",
      a: "IV ketamine is administered via infusion and allows for precise dosing. SPRAVATO® is an FDA-approved nasal spray used with an oral antidepressant. Both are effective; the choice depends on your specific needs and insurance coverage."
    },
    {
      q: "Are there side effects?",
      a: "Common side effects include temporary dissociation, mild nausea, or dizziness during treatment. These typically resolve shortly after your session. Our team monitors you throughout to ensure safety and comfort."
    }
  ];

  return (
    <>
      <Helmet>
        <title>Ketamine Therapy Augusta | IV Ketamine & SPRAVATO® - Elevated Health</title>
        <meta name="description" content="Evidence-based ketamine therapy in Augusta, GA. IV ketamine infusions ($400/session) & FDA-approved SPRAVATO® nasal spray for treatment-resistant depression." />
        <meta name="keywords" content="ketamine therapy Augusta, IV ketamine Augusta GA, SPRAVATO Augusta, treatment-resistant depression Augusta, ketamine infusion Georgia" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar onOpenBooking={() => setIsBookingOpen(true)} />
        
        <main>
        {/* Hero Section - Full Width Gradient Background */}
        <section className="relative min-h-[70vh] flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-[hsl(200,25%,35%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/50" />
            
          <div className="relative z-10 container mx-auto px-6 text-center py-32">
            <p className="text-sm tracking-[0.3em] uppercase text-white/70 mb-6 font-lato font-light animate-fade-in">
              Mental Wellness
            </p>
            <h1 className="font-cormorant text-white mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Ketamine Therapy
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10 font-lato font-light leading-relaxed animate-fade-in" style={{ animationDelay: "0.2s" }}>
              A breakthrough treatment for depression, anxiety, and PTSD—delivered with compassion in a sanctuary of healing.
            </p>
            <Button
              onClick={scrollToContact}
              size="lg"
              className="animate-fade-in bg-gold border-gold text-white hover:bg-gold-dark"
              style={{ animationDelay: "0.3s" }}
            >
              Begin Your Journey
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>

          {/* The Philosophy / Science Section */}
          <section className="section-spacing bg-background">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="max-w-3xl mx-auto text-center">
                <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4 font-lato font-light">
                  The Science
                </p>
                <h2 className="font-cormorant text-foreground mb-8">
                  Understanding Ketamine
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed font-light mb-8">
                  Ketamine works differently than traditional antidepressants. Rather than modulating serotonin, 
                  it targets glutamate—the brain's most abundant neurotransmitter—helping to rapidly rebuild 
                  neural connections damaged by chronic stress, trauma, or depression.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed font-light">
                  This mechanism enables ketamine to provide relief within hours rather than weeks, 
                  offering hope to those who haven't responded to conventional treatments.
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-8 mt-16 pt-16 border-t border-border">
                  <div>
                    <div className="text-4xl lg:text-5xl font-cormorant text-primary mb-2">70%</div>
                    <p className="text-sm text-muted-foreground font-light">Response rate in treatment-resistant depression</p>
                  </div>
                  <div>
                    <div className="text-4xl lg:text-5xl font-cormorant text-primary mb-2">24h</div>
                    <p className="text-sm text-muted-foreground font-light">Many patients notice improvement within one day</p>
                  </div>
                  <div>
                    <div className="text-4xl lg:text-5xl font-cormorant text-primary mb-2">FDA</div>
                    <p className="text-sm text-muted-foreground font-light">SPRAVATO® approved for depression</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

        {/* The Experience Section - Single Column */}
        <section className="section-spacing bg-secondary/30">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4 font-lato font-light">
                  The Experience
                </p>
                <h2 className="font-cormorant text-foreground mb-6">
                  What to Expect
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed font-light">
                  Your journey begins in a private, spa-like setting designed for comfort and tranquility. 
                  Every aspect of your experience is curated to support healing.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {experienceItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border/50">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-foreground font-light text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

          {/* Treatment Options */}
          <section className="section-spacing bg-background">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                  <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4 font-lato font-light">
                    Treatment Paths
                  </p>
                  <h2 className="font-cormorant text-foreground mb-6">
                    Choose Your Path
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-10">
                  {/* IV Ketamine */}
                  <Card className="border border-border/50 hover:border-primary/30 transition-all duration-500 bg-card/80">
                    <CardContent className="p-10">
                      <h3 className="text-2xl font-cormorant mb-4 text-foreground">IV Ketamine Infusion</h3>
                      <div className="mb-6">
                        <span className="text-3xl font-cormorant text-primary">$400</span>
                        <span className="text-muted-foreground font-light ml-2">/session</span>
                      </div>
                      <ul className="space-y-4 mb-8">
                        <li className="flex gap-3 items-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          <span className="text-muted-foreground font-light">Precise dosing via infusion</span>
                        </li>
                        <li className="flex gap-3 items-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          <span className="text-muted-foreground font-light">45-60 minute sessions</span>
                        </li>
                        <li className="flex gap-3 items-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          <span className="text-muted-foreground font-light">6-8 sessions recommended</span>
                        </li>
                        <li className="flex gap-3 items-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          <span className="text-muted-foreground font-light">Continuous monitoring</span>
                        </li>
                      </ul>
                      <Button variant="outline" className="w-full" onClick={() => setIsBookingOpen(true)}>
                        Learn More
                      </Button>
                    </CardContent>
                  </Card>

                  {/* SPRAVATO */}
                  <Card className="border border-border/50 hover:border-primary/30 transition-all duration-500 bg-card/80">
                    <CardContent className="p-10">
                      <h3 className="text-2xl font-cormorant mb-4 text-foreground">SPRAVATO® Nasal Spray</h3>
                      <div className="mb-6">
                        <span className="text-muted-foreground font-light">Often covered by insurance</span>
                      </div>
                      <ul className="space-y-4 mb-8">
                        <li className="flex gap-3 items-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          <span className="text-muted-foreground font-light">FDA-approved treatment</span>
                        </li>
                        <li className="flex gap-3 items-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          <span className="text-muted-foreground font-light">Self-administered under supervision</span>
                        </li>
                        <li className="flex gap-3 items-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          <span className="text-muted-foreground font-light">2-hour observation period</span>
                        </li>
                        <li className="flex gap-3 items-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          <span className="text-muted-foreground font-light">REMS-certified clinic</span>
                        </li>
                      </ul>
                      <Button className="w-full" onClick={() => setIsBookingOpen(true)}>
                        Check Coverage
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="section-spacing-sm bg-secondary/30">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-16">
                  <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4 font-lato font-light">
                    Common Questions
                  </p>
                  <h2 className="font-cormorant text-foreground">
                    Frequently Asked
                  </h2>
                </div>

                <div className="space-y-8">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border-b border-border pb-8">
                      <h3 className="text-xl font-cormorant text-foreground mb-4">{faq.q}</h3>
                      <p className="text-muted-foreground font-light leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section - Full Width Banner */}
          <section id="cta-section" className="section-spacing bg-primary text-primary-foreground">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="max-w-3xl mx-auto text-center">
                <p className="text-sm tracking-[0.3em] uppercase text-primary-foreground/70 mb-4 font-lato font-light">
                  Begin Today
                </p>
                <h2 className="font-cormorant text-primary-foreground mb-6">
                  Your Journey Awaits
                </h2>
                <p className="text-lg text-primary-foreground/90 mb-10 font-light leading-relaxed">
                  Take the first step toward lasting relief. Schedule a complimentary consultation 
                  to discuss your path to wellness.
                </p>
                <Button 
                  size="lg"
                  variant="outline"
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 border-primary-foreground"
                  onClick={() => setIsBookingOpen(true)}
                >
                  Request Consultation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <p className="mt-6 text-sm text-primary-foreground/60 font-light">
                  Request an appointment to receive your secure Osmind portal invitation.
                </p>
              </div>
            </div>
          </section>
        </main>

        <Footer />
        <ConsultationModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
      </div>
    </>
  );
};

export default Ketamine;

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowRight, Brain, TestTube, Heart } from "lucide-react";
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
      q: "How is this different from traditional antidepressants?",
      a: "Traditional antidepressants modulate serotonin and can take weeks to work. Our Neural Restoration protocols target glutamate pathways, creating rapid neuroplasticity—often within 24 hours. We also test your cortisol and thyroid levels to ensure we address the biological root, not just the symptom."
    },
    {
      q: "Do you test hormones before treatment?",
      a: "Yes. Mental health is physical health. We routinely check cortisol, thyroid, and sex hormones before initiating treatment. Untreated hormone imbalances can mimic depression and anxiety, so we address both pathways."
    },
    {
      q: "What can I expect during a session?",
      a: "You will recline in a private, spa-like suite with continuous monitoring. Sessions typically last 45-60 minutes. Most patients describe a sense of deep relaxation and mental clarity. Our provider remains present throughout to ensure safety and comfort."
    },
    {
      q: "Is SPRAVATO® covered by insurance?",
      a: "SPRAVATO® (esketamine) is often covered by insurance for treatment-resistant depression. We accept Blue Cross Blue Shield, Tricare, and can verify your coverage before your first appointment."
    }
  ];

  return (
    <>
      <Helmet>
        <title>Neural Restoration Therapy Augusta | Ketamine Treatment - Elevated Health</title>
        <meta name="description" content="Advanced ketamine therapy in Augusta, GA. Neural restoration for treatment-resistant depression, anxiety, and PTSD. We test before we treat." />
        <meta name="keywords" content="ketamine therapy Augusta, neural restoration Augusta GA, SPRAVATO Augusta, treatment-resistant depression Augusta, ketamine infusion Georgia" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar onOpenBooking={() => setIsBookingOpen(true)} />
        
        <main>
        {/* Hero Section - Neural Restoration */}
        <section className="relative min-h-[70vh] flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-[hsl(200,25%,35%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/50" />
            
          <div className="relative z-10 container mx-auto px-6 text-center py-32">
            <p className="text-sm tracking-[0.3em] uppercase text-gold mb-6 font-lato font-light animate-fade-in">
              Neural Optimization
            </p>
            <h1 className="font-cormorant text-white mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Neural Restoration Therapy
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10 font-lato font-light leading-relaxed animate-fade-in" style={{ animationDelay: "0.2s" }}>
              You cannot talk your way out of biology. Reset the neural pathways that chronic stress and trauma have altered.
            </p>
            <Button
              onClick={scrollToContact}
              size="lg"
              className="animate-fade-in bg-gold border-gold text-white hover:bg-gold-dark"
              style={{ animationDelay: "0.3s" }}
            >
              Request Access
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>

          {/* The Philosophy / Science Section */}
          <section className="section-spacing bg-background">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="max-w-3xl mx-auto text-center">
                <p className="text-sm tracking-[0.3em] uppercase text-gold mb-4 font-lato font-light">
                  The Philosophy
                </p>
                <h2 className="font-cormorant text-foreground mb-8">
                  Rebuilding What Stress Has Broken
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed font-light mb-8">
                  Chronic stress, anxiety, and trauma physically alter your neural architecture. 
                  Traditional talk therapy cannot undo what has been structurally changed. Our Ketamine 
                  protocols are designed to create a biological window for healing—rapidly restoring 
                  glutamate pathways and enabling neuroplasticity that would otherwise take years.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed font-light">
                  This is not about numbing symptoms. It is about restoring the biological foundation 
                  that allows genuine healing to occur.
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-8 mt-16 pt-16 border-t border-border">
                  <div>
                    <div className="text-4xl lg:text-5xl font-cormorant text-primary mb-2">70%</div>
                    <p className="text-sm text-muted-foreground font-light">Response rate in treatment-resistant cases</p>
                  </div>
                  <div>
                    <div className="text-4xl lg:text-5xl font-cormorant text-primary mb-2">24h</div>
                    <p className="text-sm text-muted-foreground font-light">Many experience relief within one day</p>
                  </div>
                  <div>
                    <div className="text-4xl lg:text-5xl font-cormorant text-primary mb-2">FDA</div>
                    <p className="text-sm text-muted-foreground font-light">SPRAVATO® approved for depression</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* The Hormone Connection Section */}
          <section className="section-spacing bg-secondary/30">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div>
                    <p className="text-sm tracking-[0.3em] uppercase text-gold mb-4 font-lato font-light">
                      The Hormone Connection
                    </p>
                    <h2 className="font-cormorant text-foreground mb-6 text-3xl">
                      Mental Health Is Physical Health
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed font-light mb-6">
                      We often pair Ketamine therapy with hormone analysis because untreated cortisol 
                      dysregulation or thyroid imbalances can mimic depression. Many patients arrive 
                      believing they have a "brain chemistry" problem when they actually have a 
                      hormonal imbalance that has never been properly tested.
                    </p>
                    <p className="text-lg text-muted-foreground leading-relaxed font-light">
                      <span className="text-foreground font-medium">We check both.</span> Using 
                      advanced saliva diagnostics, we map your cortisol rhythm and hormone levels 
                      before prescribing anything. This ensures we treat the root, not just the symptom.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <Card className="bg-card/80 border-border/50">
                      <CardContent className="p-6 flex items-start gap-4">
                        <Brain className="h-8 w-8 text-gold shrink-0" />
                        <div>
                          <h4 className="font-cormorant text-lg text-foreground mb-1">Neural Assessment</h4>
                          <p className="text-sm text-muted-foreground font-light">Evaluate treatment response patterns and mental health history</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-card/80 border-border/50">
                      <CardContent className="p-6 flex items-start gap-4">
                        <TestTube className="h-8 w-8 text-gold shrink-0" />
                        <div>
                          <h4 className="font-cormorant text-lg text-foreground mb-1">Hormone Testing</h4>
                          <p className="text-sm text-muted-foreground font-light">Cortisol, thyroid, and sex hormones via saliva diagnostics</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-card/80 border-border/50">
                      <CardContent className="p-6 flex items-start gap-4">
                        <Heart className="h-8 w-8 text-gold shrink-0" />
                        <div>
                          <h4 className="font-cormorant text-lg text-foreground mb-1">Integrated Protocol</h4>
                          <p className="text-sm text-muted-foreground font-light">Ketamine + hormone support for complete restoration</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </section>

        {/* The Experience Section */}
        <section className="section-spacing bg-background">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <p className="text-sm tracking-[0.3em] uppercase text-gold mb-4 font-lato font-light">
                  The Experience
                </p>
                <h2 className="font-cormorant text-foreground mb-6">
                  A Sanctuary for Healing
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed font-light">
                  Your journey begins in a private, spa-like setting designed for comfort and tranquility. 
                  Every aspect of your experience is curated to support deep restoration.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {experienceItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border/50">
                    <CheckCircle2 className="h-5 w-5 text-gold shrink-0" />
                    <span className="text-foreground font-light text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

          {/* Treatment Options */}
          <section className="section-spacing bg-secondary/30">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                  <p className="text-sm tracking-[0.3em] uppercase text-gold mb-4 font-lato font-light">
                    Treatment Paths
                  </p>
                  <h2 className="font-cormorant text-foreground mb-6">
                    Choose Your Protocol
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-10">
                  {/* IV Ketamine */}
                  <Card className="border border-border/50 hover:border-primary/30 transition-all duration-500 bg-card/80">
                    <CardContent className="p-10">
                      <h3 className="text-2xl font-cormorant mb-4 text-foreground">IV Ketamine Infusion</h3>
                      <p className="text-muted-foreground font-light mb-6">
                        Precision-dosed neural restoration
                      </p>
                      <ul className="space-y-4 mb-8">
                        <li className="flex gap-3 items-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-gold" />
                          <span className="text-muted-foreground font-light">Precise dosing via infusion</span>
                        </li>
                        <li className="flex gap-3 items-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-gold" />
                          <span className="text-muted-foreground font-light">45-60 minute sessions</span>
                        </li>
                        <li className="flex gap-3 items-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-gold" />
                          <span className="text-muted-foreground font-light">6-8 sessions recommended</span>
                        </li>
                        <li className="flex gap-3 items-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-gold" />
                          <span className="text-muted-foreground font-light">Continuous monitoring</span>
                        </li>
                      </ul>
                      <Button variant="outline" className="w-full" onClick={() => setIsBookingOpen(true)}>
                        Request Consultation
                      </Button>
                    </CardContent>
                  </Card>

                  {/* SPRAVATO */}
                  <Card className="border border-border/50 hover:border-primary/30 transition-all duration-500 bg-card/80">
                    <CardContent className="p-10">
                      <h3 className="text-2xl font-cormorant mb-4 text-foreground">SPRAVATO® Protocol</h3>
                      <p className="text-muted-foreground font-light mb-6">
                        FDA-approved, often insurance covered
                      </p>
                      <ul className="space-y-4 mb-8">
                        <li className="flex gap-3 items-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-gold" />
                          <span className="text-muted-foreground font-light">FDA-approved treatment</span>
                        </li>
                        <li className="flex gap-3 items-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-gold" />
                          <span className="text-muted-foreground font-light">Self-administered under supervision</span>
                        </li>
                        <li className="flex gap-3 items-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-gold" />
                          <span className="text-muted-foreground font-light">2-hour observation period</span>
                        </li>
                        <li className="flex gap-3 items-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-gold" />
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
          <section className="section-spacing-sm bg-background">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-16">
                  <p className="text-sm tracking-[0.3em] uppercase text-gold mb-4 font-lato font-light">
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

          {/* CTA Section */}
          <section id="cta-section" className="section-spacing bg-primary text-primary-foreground">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="max-w-3xl mx-auto text-center">
                <p className="text-sm tracking-[0.3em] uppercase text-primary-foreground/70 mb-4 font-lato font-light">
                  Begin Your Restoration
                </p>
                <h2 className="font-cormorant text-primary-foreground mb-6">
                  Your Neural Reset Awaits
                </h2>
                <p className="text-lg text-primary-foreground/90 mb-10 font-light leading-relaxed">
                  Take the first step toward lasting restoration. We will test your biology, 
                  understand your history, and architect a protocol designed specifically for you.
                </p>
                <Button 
                  size="lg"
                  variant="outline"
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 border-primary-foreground"
                  onClick={() => setIsBookingOpen(true)}
                >
                  Apply for Consultation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <p className="mt-6 text-sm text-primary-foreground/60 font-light">
                  Request access to receive your secure patient portal invitation.
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
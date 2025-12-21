import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowRight, Brain, TestTube, Heart, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useState } from "react";
import ConsultationModal from "@/components/ConsultationModal";
import AssistantHub from "@/components/AssistantHub";
import NotReadyToBook from "@/components/NotReadyToBook";

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
      a: "Treatment can begin right away. For patients interested in a deeper look at what's driving their symptoms, we offer optional neurotransmitter and hormone analysis that can help fine-tune your protocol over time."
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
        <meta name="description" content="Advanced ketamine therapy in Augusta, GA. $99 medical consultation credited toward treatment. Chat with our Virtual Care Team or call (706) 760-3470. BCBS, TRICARE accepted." />
        <meta name="keywords" content="ketamine therapy Augusta, neural restoration Augusta GA, SPRAVATO Augusta, treatment-resistant depression Augusta, ketamine infusion Georgia" />
        <meta property="og:title" content="Neural Restoration Therapy Augusta | Ketamine Treatment - Elevated Health" />
        <meta property="og:description" content="Advanced ketamine therapy in Augusta, GA. $99 medical consultation credited toward treatment. Chat with our Virtual Care Team 24/7. BCBS, TRICARE accepted." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://elevatedhealthaugusta.com/ketamine" />
        <meta property="og:image" content="https://elevatedhealthaugusta.com/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Neural Restoration Therapy Augusta | Ketamine Treatment" />
        <meta name="twitter:description" content="$99 medical consultation credited toward treatment. Chat with our Virtual Care Team 24/7. BCBS, TRICARE accepted." />
        <meta name="twitter:image" content="https://elevatedhealthaugusta.com/og-image.jpg" />
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
            
            {/* As low as pricing badge */}
            <div className="mb-4 animate-fade-in" style={{ animationDelay: "0.05s" }}>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 text-white rounded-full text-xs font-medium">
                💳 As low as $100/month with Affirm
              </span>
            </div>
            
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
              Book $99 Consultation
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

          {/* Have Questions? Section */}
          <section className="section-spacing-sm bg-background">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="max-w-2xl mx-auto">
                <NotReadyToBook 
                  variant="b" 
                  title="Nervous about trying ketamine therapy?"
                  description="It's natural to have questions about this treatment. Our Care Team has helped hundreds of patients understand if ketamine is right for them—discussing eligibility, what to expect, and how our supervised protocols keep you safe."
                  ctaText="Talk to Our Care Team"
                />
              </div>
            </div>
          </section>

          {/* Your Path to Healing - Vertical Stepper */}
          <section className="section-spacing bg-secondary/30">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                  <p className="text-sm tracking-[0.3em] uppercase text-gold mb-4 font-lato font-light">
                    Your Path to Healing
                  </p>
                  <h2 className="font-cormorant text-foreground mb-6">
                    Three Steps to Neural Restoration
                  </h2>
                  <p className="text-lg text-muted-foreground font-light">
                    A clear pathway from assessment to transformation.
                  </p>
                </div>

                {/* Vertical Stepper */}
                <div className="relative">
                  {/* STEP 1 - Clinical Eligibility Review */}
                  <Card className="relative bg-card rounded-2xl border border-border/50 p-8 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start gap-6">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-cormorant text-lg">
                          1
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="inline-block mb-3 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-lato">
                          Step 1: Mental Health Screening
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-cormorant text-foreground mb-1">
                              Clinical Eligibility Review
                            </h3>
                            <p className="text-sm text-muted-foreground font-light leading-relaxed">
                              Meet with our provider to review your mental health history, discuss treatment goals, and determine if ketamine therapy is right for you. The $99 fee is credited toward treatment.
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-3xl font-cormorant text-foreground">$99</span>
                            <p className="text-xs text-muted-foreground">one-time</p>
                          </div>
                        </div>
                        <div className="mt-6">
                          <Button 
                            onClick={() => setIsBookingOpen(true)}
                            className="bg-gold hover:bg-gold-dark text-white rounded-full px-6"
                          >
                            Book Eligibility Review
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Connecting Line */}
                  <div className="flex justify-start ml-[1.4rem]">
                    <div className="w-0.5 h-8 bg-gradient-to-b from-gold to-border" />
                  </div>

                  {/* STEP 2 - Neurotransmitter Analysis (Optional) */}
                  <Card className="relative bg-card rounded-2xl border border-border/50 p-8 shadow-sm opacity-90">
                    <div className="flex items-start gap-6">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-cormorant text-lg">
                          2
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="inline-block mb-3 px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-lato">
                          Step 2: Brain Chemistry Mapping (Optional)
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-cormorant text-foreground mb-1">
                              Neurotransmitter Analysis
                            </h3>
                            <p className="text-sm text-muted-foreground font-light leading-relaxed">
                              Optional ZRT urine panel measuring Serotonin, Dopamine, and GABA levels to help fine-tune your ketamine protocol for optimal results.
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-3xl font-cormorant text-foreground">$399</span>
                            <p className="text-xs text-muted-foreground">one-time</p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-muted-foreground">
                          <TestTube className="w-5 h-5" />
                          <span className="text-xs font-lato">Unlocked after Step 1 — Enhances protocol precision</span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Connecting Line */}
                  <div className="flex justify-start ml-[1.4rem]">
                    <div className="w-0.5 h-8 bg-gradient-to-b from-border to-gold" />
                  </div>

                  {/* STEP 3 - Treatment Protocol */}
                  <Card className="relative bg-card rounded-2xl border-2 border-gold/50 p-8 shadow-lg">
                    <div className="flex items-start gap-6">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-gold text-white flex items-center justify-center font-cormorant text-lg">
                          3
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="inline-block mb-3 px-3 py-1 bg-gold/10 text-gold rounded-full text-xs font-lato">
                          Step 3: Treatment
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-cormorant text-foreground mb-1">
                              Neural Restoration Protocol
                            </h3>
                            <p className="text-sm text-muted-foreground font-light leading-relaxed">
                              Provider determines your optimal treatment: IV Ketamine ($400/session) or SPRAVATO® (often $0-50 copay with insurance). Both delivered in our private, spa-like suite.
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-3xl font-cormorant text-foreground">$400</span>
                            <p className="text-xs text-muted-foreground">/session (IV)</p>
                            <p className="text-xs text-gold mt-1">SPRAVATO® often $0-50</p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                          <Brain className="w-5 h-5 text-gold" />
                          <span className="text-xs text-muted-foreground font-lato">
                            Requires Medical Clearance — Provider determines treatment type
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* 6-Session Series Note */}
                <div className="mt-8 p-6 bg-card rounded-2xl border border-border/50">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <span className="inline-block mb-2 px-3 py-1 bg-gold/10 text-gold rounded-full text-xs font-lato">
                        Best Value
                      </span>
                      <h4 className="font-cormorant text-lg text-foreground">6-Session IV Ketamine Series</h4>
                      <p className="text-sm text-muted-foreground font-light">
                        Save $200 with our recommended treatment series
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-cormorant text-foreground">$2,200</span>
                      <span className="text-muted-foreground font-lato text-sm ml-1">(reg $2,400)</span>
                    </div>
                  </div>
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
                  Have questions first? Call us at (762) 333-3018 or use our chat.
                </p>
              </div>
            </div>
          </section>
        </main>

        <Footer />
        <AssistantHub />
        <ConsultationModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
      </div>
    </>
  );
};

export default Ketamine;
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CheckCircle2, Award, Heart, Users, TrendingDown, Activity, 
  Apple, Scale, Droplet, LineChart, Brain, Pill, Clock, 
  MessageCircle, Shield, Sparkles
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { Helmet } from "react-helmet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { trackEvent } from "@/lib/analytics";

const WeightLoss = () => {
  const scrollToBooking = () => {
    trackEvent("cta_click", { cta_name: "weight_loss_booking", destination: SITE_CONFIG.bookingUrl });
    window.open(SITE_CONFIG.bookingUrl, "_blank");
  };

  // 3-Step Concierge Workflow
  const processSteps = [
    {
      step: "01",
      headline: "Test, Don't Guess.",
      body: "We ship a ZRT Saliva Test kit directly to your door. No labs, no needles, and no waiting rooms. Simply complete the swab at home to reveal your cortisol, estrogen, and testosterone levels."
    },
    {
      step: "02",
      headline: "Identify Your Barriers.",
      body: "Our providers analyze your lab results to find the invisible hormonal blockers—like high cortisol or low testosterone—that have made previous diets fail."
    },
    {
      step: "03",
      headline: "GLP-1s + Hormone Support.",
      body: "Receive your FDA-approved GLP-1 medication alongside targeted hormone support to ensure you burn fat while protecting your energy and lean muscle."
    }
  ];

  const programIncludes = [
    { icon: Pill, text: "Weekly GLP-1 Medication (Semaglutide)" },
    { icon: Droplet, text: "ZRT Home Hormone Kit (Included)" },
    { icon: Activity, text: "'Blocker' Analysis Review" },
    { icon: MessageCircle, text: "Direct Provider Messaging" },
    { icon: Apple, text: "Nutrition & Macro Guidance" }
  ];

  const differentiators = [
    {
      icon: Award,
      title: "A Real Medical Clinic",
      description: "Not a retail spa. We're a trusted medical practice with therapeutic, healing-oriented care."
    },
    {
      icon: Users,
      title: "True Medical Oversight",
      description: "Ketamine-quality medical supervision applied to weight loss. Your safety is our priority."
    },
    {
      icon: Heart,
      title: "Psychological Support",
      description: "The only clinic in Augusta offering mental health integration with weight loss treatment."
    },
    {
      icon: Activity,
      title: "Integrative Approach",
      description: "Weight loss + hormone optimization + mental wellness under one roof."
    }
  ];

  const pricingTiers = [
    {
      name: "Semaglutide Program",
      price: "$349-399",
      period: "/month",
      description: "Perfect for those starting their weight loss journey",
      features: [
        "Starter or maintenance dose",
        "All visits included",
        "Weekly support",
        "B12 included",
        "Injection supplies",
        "Side-effect management"
      ],
      highlight: false,
      color: "border-border"
    },
    {
      name: "Tirzepatide Program",
      price: "$499-699",
      period: "/month",
      description: "Enhanced medication for accelerated results",
      features: [
        "Starter to therapeutic doses",
        "All visits included",
        "Weekly support",
        "B12 included",
        "Injection supplies",
        "Priority scheduling",
        "Enhanced monitoring"
      ],
      highlight: false,
      color: "border-accent"
    },
    {
      name: "Hormone Add-On",
      price: "$149",
      period: "/month",
      description: "Optimize hormones while losing weight",
      features: [
        "Hormone labs",
        "Testosterone/estrogen optimization",
        "Symptom tracking",
        "Consultation + follow-up",
        "Combines with any program"
      ],
      highlight: false,
      color: "border-gold"
    },
    {
      name: "Full Body Renewal",
      price: "$799",
      period: "/month",
      description: "Our signature all-inclusive transformation package",
      features: [
        "GLP-1 weight loss medication",
        "Hormone optimization",
        "Monthly metabolic labs",
        "Mental health check-ins",
        "Priority scheduling",
        "Supplement starter kit",
        "Unlimited support",
        "Complete care coordination"
      ],
      highlight: true,
      color: "border-primary"
    }
  ];

  const faqs = [
    {
      q: "How is this different from other online Semaglutide clinics?",
      a: "Most clinics prescribe blindly. We are the only program that combines GLP-1 therapy with advanced saliva testing. We don't just suppress your appetite; we identify if stress (cortisol) or hormonal imbalances are driving your weight gain in the first place."
    },
    {
      q: "Do I need to go to a lab for blood work?",
      a: "No. We use advanced ZRT Saliva testing which is more accurate for tissue hormone levels and can be done from the comfort of your home. No needles required."
    },
    {
      q: "Why do you test hormones for weight loss?",
      a: "Because calories aren't the whole story. High cortisol causes belly fat, and estrogen dominance causes hip retention. If we don't fix the hormones, the weight often comes back."
    },
    {
      q: "What if I have 'Adrenal Fatigue'?",
      a: "This is exactly why we test. If your cortisol is dysregulated, we add a specific Adrenal Support protocol to your plan to ensure your body feels safe enough to release the weight."
    }
  ];

  return (
    <>
      <Helmet>
        <title>Metabolic Optimization Program - Weight Loss Augusta | Elevated Health</title>
        <meta name="description" content="Repair your metabolism at the cellular level. GLP-1 therapy + ZRT hormone testing + metabolic analysis. Augusta's only comprehensive metabolic program." />
        <meta name="keywords" content="metabolic optimization Augusta, semaglutide Augusta GA, tirzepatide Augusta, GLP-1 Augusta, weight loss clinic Georgia, ZRT testing Augusta, metabolic labs" />
      </Helmet>

      <div className="min-h-screen">
        <Navbar />
        
        <main>
          {/* Hero Section - Warm Alabaster with Golden Balance */}
          <section className="pt-32 pb-16 md:pb-24 relative overflow-hidden">
            {/* Warm Alabaster/Cream Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#f5f0e8] via-[#faf7f2] to-[#f0ebe3]">
              {/* Abstract Golden Fluid Balance Pattern */}
              <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
                {/* Zen stone-like circles representing balance */}
                <ellipse cx="600" cy="400" rx="120" ry="40" fill="none" stroke="hsl(var(--gold))" strokeWidth="1" opacity="0.6" />
                <ellipse cx="600" cy="360" rx="100" ry="35" fill="none" stroke="hsl(var(--gold))" strokeWidth="0.8" opacity="0.5" />
                <ellipse cx="600" cy="325" rx="80" ry="28" fill="none" stroke="hsl(var(--gold))" strokeWidth="0.6" opacity="0.4" />
                <ellipse cx="600" cy="295" rx="60" ry="22" fill="none" stroke="hsl(var(--gold))" strokeWidth="0.5" opacity="0.3" />
                {/* Flowing golden curves */}
                <path d="M0,300 Q200,250 300,350 Q400,450 500,350 Q600,250 800,300" fill="none" stroke="hsl(var(--gold))" strokeWidth="1.5" opacity="0.3" />
                <path d="M0,350 Q150,300 250,380 Q350,460 450,380 Q550,300 700,350 Q800,400 900,350" fill="none" stroke="hsl(var(--gold))" strokeWidth="1" opacity="0.2" />
                {/* Equilibrium circles */}
                <circle cx="150" cy="200" r="60" fill="none" stroke="hsl(var(--gold))" strokeWidth="0.5" opacity="0.4" />
                <circle cx="150" cy="200" r="40" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.3" opacity="0.3" />
              </svg>
              {/* Soft gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#f5f0e8]/50" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 relative z-10">
              <div className="max-w-5xl mx-auto text-center">
                <div className="inline-block mb-6 animate-fade-in-up">
                  <span className="px-4 py-2 bg-primary/10 text-primary border border-gold/30 rounded-full text-sm font-semibold">
                    Hormonal Weight Reset
                  </span>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 animate-fade-in-up text-primary font-cormorant" style={{ animationDelay: "0.1s" }}>
                  Hormonal Weight Reset
                </h1>
                <p className="text-xl md:text-2xl text-gold mb-6 animate-fade-in-up font-lato font-medium" style={{ animationDelay: "0.15s" }}>
                  FDA-Approved GLP-1s. Optimized by Your Biology.
                </p>
                <p className="text-lg md:text-xl text-primary/70 leading-relaxed mb-10 max-w-3xl mx-auto animate-fade-in-up font-lato" style={{ animationDelay: "0.2s" }}>
                  Weight loss isn't just about calories—it's about hormones. We combine Semaglutide therapy 
                  with advanced Saliva Diagnostics to identify and treat the hidden blockers (like High Cortisol 
                  or Estrogen Dominance) that stall your progress.
                </p>

                {/* Differentiator Icons */}
                <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
                  {/* Saliva Diagnostics */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 rounded-full border border-gold/30">
                      <svg className="w-8 h-8 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2v6" />
                        <path d="M12 8a4 4 0 0 1 4 4c0 3-4 10-4 10s-4-7-4-10a4 4 0 0 1 4-4z" />
                      </svg>
                    </div>
                    <span className="text-sm font-lato text-primary font-medium">Saliva Diagnostics</span>
                  </div>
                  {/* Fat vs Muscle Targeting */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 rounded-full border border-gold/30">
                      <svg className="w-8 h-8 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="6" />
                        <circle cx="12" cy="12" r="2" />
                      </svg>
                    </div>
                    <span className="text-sm font-lato text-primary font-medium">Fat vs. Muscle Targeting</span>
                  </div>
                  {/* Adrenal Support */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 rounded-full border border-gold/30">
                      <svg className="w-8 h-8 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="4" />
                        <path d="M12 2v2" />
                        <path d="M12 20v2" />
                        <path d="m4.93 4.93 1.41 1.41" />
                        <path d="m17.66 17.66 1.41 1.41" />
                        <path d="M2 12h2" />
                        <path d="M20 12h2" />
                        <path d="m6.34 17.66-1.41 1.41" />
                        <path d="m19.07 4.93-1.41 1.41" />
                      </svg>
                    </div>
                    <span className="text-sm font-lato text-primary font-medium">Adrenal Support</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                  <Button onClick={scrollToBooking} size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-white">
                    Check Your Hormone Blockers
                  </Button>
                  <Button onClick={() => window.open(`tel:${SITE_CONFIG.phone}`, "_self")} size="lg" variant="outline" className="text-lg px-8 py-6 border-primary/30 text-primary bg-transparent hover:bg-primary/5">
                    Call {SITE_CONFIG.phone}
                  </Button>
                </div>

                <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-primary/60 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-gold" />
                    <span>ZRT Saliva Testing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-gold" />
                    <span>FDA-Approved GLP-1s</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-gold" />
                    <span>Hormone Blocker Analysis</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works - 3-Step Concierge Workflow */}
          <section className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-4xl mx-auto text-center mb-16">
                <p className="text-sm tracking-[0.3em] uppercase text-gold mb-4 font-lato font-light">
                  The Process
                </p>
                <h2 className="font-cormorant text-primary text-3xl md:text-4xl font-bold mb-4">
                  Your Concierge Weight Loss Journey
                </h2>
                <p className="text-lg text-muted-foreground font-lato">
                  A medically-guided pathway designed around your biology
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {processSteps.map((step, index) => (
                  <div 
                    key={index}
                    className="relative animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.15}s` }}
                  >
                    {/* Step Number */}
                    <div className="text-6xl font-cormorant text-gold/30 font-bold mb-4">
                      {step.step}
                    </div>
                    {/* Content */}
                    <h3 className="text-xl font-cormorant text-primary font-bold mb-3">
                      {step.headline}
                    </h3>
                    <p className="text-muted-foreground font-lato leading-relaxed">
                      {step.body}
                    </p>
                    {/* Connector line (except last) */}
                    {index < processSteps.length - 1 && (
                      <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-gold/30 to-transparent -translate-x-8" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* What's Included Section - Cream/Gold Theme */}
          <section className="py-16 md:py-24 bg-gradient-to-br from-[#f5f0e8] via-[#faf7f2] to-[#f0ebe3]">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-4xl mx-auto text-center mb-12">
                <p className="text-sm tracking-[0.3em] uppercase text-gold mb-4 font-lato font-light">
                  What You Get
                </p>
                <h2 className="font-cormorant text-primary text-3xl md:text-4xl font-bold mb-4">
                  Hormonal Weight Reset Includes
                </h2>
                <p className="text-lg text-primary/70 font-lato">
                  Everything you need for sustainable, biology-based weight loss
                </p>
              </div>

              <div className="max-w-2xl mx-auto">
                <div className="space-y-4">
                  {programIncludes.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div 
                        key={index} 
                        className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gold/20 animate-fade-in-up"
                        style={{ animationDelay: `${index * 0.08}s` }}
                      >
                        <div className="shrink-0">
                          <CheckCircle2 className="h-6 w-6 text-gold" />
                        </div>
                        <p className="text-primary font-lato font-medium">{item.text}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-10 text-center">
                  <Button onClick={scrollToBooking} size="lg" className="font-lato bg-primary hover:bg-primary/90 text-white">
                    Check Your Hormone Blockers
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Why Elevated Health is Different */}
          <section className="py-16 md:py-24">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-4xl mx-auto text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Why Elevated Health is Different
                </h2>
                <p className="text-lg text-muted-foreground">
                  Augusta has NO program offering this level of comprehensive care
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                {differentiators.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="text-center animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="inline-flex p-4 bg-accent/10 rounded-2xl mb-4 hover:scale-110 transition-transform">
                        <Icon className="h-8 w-8 text-accent" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-16 max-w-3xl mx-auto text-center bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 border-2 border-primary/20">
                <h3 className="text-2xl font-bold mb-4 text-primary">We Don't Just Prescribe. We Transform.</h3>
                <p className="text-lg text-foreground leading-relaxed">
                  You can become the gold standard for weight loss in Augusta. Our program combines medical expertise, 
                  psychological support, weekly accountability, and lifestyle coaching—creating sustainable, 
                  life-changing results that pills-in-the-box programs can't match.
                </p>
              </div>
            </div>
          </section>

          {/* Pricing Tiers */}
          <section className="py-16 md:py-24 bg-secondary/30">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-4xl mx-auto text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Choose Your Program
                </h2>
                <p className="text-lg text-muted-foreground">
                  Select the program that fits your goals and budget
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                {pricingTiers.map((tier, index) => (
                  <Card 
                    key={index} 
                    className={`relative border-2 ${tier.color} hover:shadow-2xl transition-all animate-fade-in-up ${
                      tier.highlight ? 'ring-2 ring-primary ring-offset-2 scale-105' : ''
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {tier.highlight && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <CardContent className="p-6">
                      <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                      <div className="mb-4">
                        <span className="text-4xl font-bold">{tier.price}</span>
                        <span className="text-muted-foreground">{tier.period}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-6">{tier.description}</p>
                      
                      <ul className="space-y-3 mb-6">
                        {tier.features.map((feature, fIndex) => (
                          <li key={fIndex} className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button 
                        onClick={scrollToBooking} 
                        className="w-full"
                        variant={tier.highlight ? "default" : "outline"}
                      >
                        Get Started
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-12 text-center">
                <p className="text-muted-foreground mb-4">
                  Questions about which program is right for you?
                </p>
                <Button onClick={scrollToBooking} size="lg" variant="outline">
                  Schedule Free Consultation
                </Button>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-16 md:py-24">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Frequently Asked Questions
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Everything you need to know about our Weight Reset Program™
                  </p>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left text-lg font-semibold">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-accent/10 to-background">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Ready to Start Your Transformation?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Book your free consultation today and discover why Elevated Health is Augusta's 
                  most comprehensive weight loss program. No generic dosing. No rushed appointments. 
                  Just expert support and real results.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                  <Button onClick={scrollToBooking} size="lg" className="text-lg px-8 py-6">
                    Book Free Consultation
                  </Button>
                  <Button 
                    onClick={() => {
                      trackEvent("phone_click", { source: "weight_loss_final_cta" });
                      window.open(`tel:${SITE_CONFIG.phone}`, "_self");
                    }}
                    size="lg" 
                    variant="outline" 
                    className="text-lg px-8 py-6"
                  >
                    Call {SITE_CONFIG.phone}
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground">
                  Most consultations available within 48 hours
                </p>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default WeightLoss;

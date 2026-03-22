import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CheckCircle2, Award, Heart, Users, TrendingDown, Activity, 
  Apple, Scale, Droplet, LineChart, Brain, Pill, Clock, 
  MessageCircle, Shield, Sparkles, CreditCard, Loader2, Calendar
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { Helmet } from "react-helmet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { trackEvent } from "@/lib/analytics";
import AssistantHub from "@/components/AssistantHub";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import NotReadyToBook from "@/components/NotReadyToBook";
import HowGLP1Works from "@/components/HowGLP1Works";

const WeightLoss = () => {
  const [isConsultationLoading, setIsConsultationLoading] = useState(false);
  const [isSemaglutideLoading, setIsSemaglutideLoading] = useState(false);
  const [isTirzepatideLoading, setIsTirzepatideLoading] = useState(false);

  const handleConsultationCheckout = async () => {
    setIsConsultationLoading(true);
    trackEvent("cta_click", { cta_name: "weight_loss_consultation", destination: "checkout" });
    try {
      const { data, error } = await supabase.functions.invoke("create-consultation-checkout", {
        body: { serviceType: "weight_loss" }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      console.error("Consultation checkout error:", err);
      toast.error("Failed to start checkout. Please try again or call us.");
    } finally {
      setIsConsultationLoading(false);
    }
  };

  const handleSemaglutideCheckout = async () => {
    setIsSemaglutideLoading(true);
    trackEvent("cta_click", { cta_name: "semaglutide_membership", destination: "checkout" });
    try {
      const { data, error } = await supabase.functions.invoke("create-semaglutide-checkout", {
        body: {}
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      console.error("Semaglutide checkout error:", err);
      toast.error("Failed to start checkout. Please try again or call us.");
    } finally {
      setIsSemaglutideLoading(false);
    }
  };

  const handleTirzepatideCheckout = async () => {
    setIsTirzepatideLoading(true);
    trackEvent("cta_click", { cta_name: "tirzepatide_membership", destination: "checkout" });
    try {
      const { data, error } = await supabase.functions.invoke("create-tirzepatide-checkout", {
        body: {}
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      console.error("Tirzepatide checkout error:", err);
      toast.error("Failed to start checkout. Please try again or call us.");
    } finally {
      setIsTirzepatideLoading(false);
    }
  };

  // 3-Step Concierge Workflow
  const processSteps = [
    {
      step: "01",
      headline: "Book Your $149 Consultation.",
      body: "Schedule your 30-minute in-person visit at our Evans clinic. Your provider will review your medical history, medications, and determine your GLP-1 eligibility."
    },
    {
      step: "02",
      headline: "Get Cleared Same Day.",
      body: "Most patients are approved immediately during their consultation. If your provider needs additional information, they'll coordinate with your PCP."
    },
    {
      step: "03",
      headline: "Start Medication with First Month Discount.",
      body: "Your $149 consultation fee is credited toward your first month — pay just $300 for Semaglutide or $400 for Tirzepatide to start."
    }
  ];

  const programIncludes = [
    { icon: Pill, text: "Weekly GLP-1 Medications" },
    { icon: Shield, text: "Medical Eligibility Assessment" },
    { icon: Activity, text: "Ongoing Provider Supervision" },
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

  const membershipInclusions = [
    "FDA-Approved GLP-1 Medication (Semaglutide) included.",
    "Medical eligibility screening included.",
    "Unlimited provider messaging and support.",
    "Dosage adjustments as needed.",
    "Priority Shipping from our Compounding Partner."
  ];

  const faqs = [
    {
      q: "How is this different from other online Semaglutide clinics?",
      a: "Unlike telehealth-only clinics, we meet you in person at our Evans clinic. Your provider reviews your complete medical history, checks for contraindications, and provides ongoing supervision—not just a prescription and a wave goodbye."
    },
    {
      q: "Do I need labs to start?",
      a: "Most patients can start GLP-1 medication after their $149 consultation. If your provider determines additional lab work would benefit your safety or results, they may request recent labs from your PCP or recommend optional hormone testing."
    },
    {
      q: "What if I want hormone testing too?",
      a: "If you suspect hormonal barriers (high cortisol, thyroid issues), you can add our Hormone Optimization Bundle ($149/month) to your membership for comprehensive testing and bio-identical support."
    },
    {
      q: "How quickly can I start medication?",
      a: "Most patients start within a week of their consultation. Your provider will determine eligibility during your in-person visit and can often authorize treatment the same day."
    }
  ];

  return (
    <>
      <Helmet>
        <title>Metabolic Optimization Program - Weight Loss Augusta | Réveil</title>
        <meta name="description" content="Medical weight loss in Augusta, GA. $149 consultation credited toward treatment. Chat with our Virtual Care Team 24/7. GLP-1 therapy + ZRT hormone testing + metabolic analysis." />
        <meta name="keywords" content="metabolic optimization Augusta, semaglutide Augusta GA, tirzepatide Augusta, GLP-1 Augusta, weight loss clinic Georgia, ZRT testing Augusta, metabolic labs" />
        <meta property="og:title" content="Metabolic Optimization Program - Weight Loss Augusta | Réveil" />
        <meta property="og:description" content="Medical weight loss in Augusta, GA. $149 consultation credited toward treatment. Chat with our Virtual Care Team 24/7. GLP-1 therapy + hormone testing." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://reveil.health/weight-loss" />
        <meta property="og:image" content="https://reveil.health/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Medical Weight Loss Augusta | Metabolic Optimization" />
        <meta name="twitter:description" content="$149 consultation credited toward treatment. Chat with our Virtual Care Team 24/7. GLP-1 + hormone testing." />
        <meta name="twitter:image" content="https://reveil.health/og-image.jpg" />
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

            <div className="container mx-auto px-3 sm:px-4 md:px-6 relative z-10">
              <div className="max-w-5xl mx-auto text-center">
                <div className="inline-block mb-6 animate-fade-in-up">
                  <span className="px-4 py-2 bg-primary/10 text-primary border border-gold/30 rounded-full text-sm font-semibold">
                    Hormonal Weight Reset
                  </span>
                </div>
                
                {/* As low as pricing badge */}
                <div className="mb-4 animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#FFB3C7]/20 text-[#17120F] rounded-full text-xs font-medium">
                    💳 As low as $100/month with Klarna
                  </span>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 animate-fade-in-up text-primary font-cormorant" style={{ animationDelay: "0.1s" }}>
                  Hormonal Weight Reset
                </h1>
                <p className="text-xl md:text-2xl text-gold mb-6 animate-fade-in-up font-lato font-medium" style={{ animationDelay: "0.15s" }}>
                  FDA-Approved GLP-1s. Optimized by Your Biology.
                </p>
                <p className="text-lg md:text-xl text-primary/70 leading-relaxed mb-10 max-w-3xl mx-auto animate-fade-in-up font-lato" style={{ animationDelay: "0.2s" }}>
                  Weight loss isn't just about calories—it's about hormones. We combine state-of-the-art GLP-1 therapy 
                  with advanced saliva diagnostics to identify and treat the hidden blockers (like High Cortisol 
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
                  <Button 
                    onClick={handleConsultationCheckout} 
                    disabled={isConsultationLoading}
                    size="lg" 
                    className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-white"
                  >
                    {isConsultationLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <CreditCard className="mr-2 h-5 w-5" />
                    )}
                    {isConsultationLoading ? "Processing..." : "Discovery Consultation - $99"}
                  </Button>
                  <Button onClick={() => window.open(`tel:${SITE_CONFIG.phone}`, "_self")} size="lg" variant="outline" className="text-lg px-8 py-6 border-primary/30 text-primary bg-transparent hover:bg-primary/5">
                    Call {SITE_CONFIG.phone}
                  </Button>
                </div>
                <p className="text-center text-xs text-green-600 font-medium mt-2 animate-fade-in-up" style={{ animationDelay: "0.35s" }}>
                  $149 consultation fee credited toward your treatment
                </p>

                <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-primary/60 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-gold" />
                    <span>Powered by ZRT Diagnostics</span>
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

          {/* Have Questions? Section */}
          <section className="section-spacing-sm bg-secondary/30">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="max-w-2xl mx-auto">
                <NotReadyToBook 
                  variant="b" 
                  title="Frustrated by failed diets? Let's talk."
                  description="If you've tried everything and nothing has worked, there may be a metabolic reason. Our team can explain how hormone testing reveals hidden blockers and whether GLP-1 therapy might finally break the cycle."
                  ctaText="Understand Your Metabolism"
                />
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
                  <Button 
                    onClick={handleConsultationCheckout} 
                    disabled={isConsultationLoading}
                    size="lg" 
                    className="font-lato bg-primary hover:bg-primary/90 text-white"
                  >
                    {isConsultationLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <CreditCard className="mr-2 h-5 w-5" />
                    )}
                    {isConsultationLoading ? "Processing..." : "Book Discovery Consultation - $99"}
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* How GLP-1 Works - Educational Section */}
          <HowGLP1Works />

          {/* Why Réveil is Different */}
          <section className="py-16 md:py-24">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-4xl mx-auto text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Why Réveil is Different
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

          {/* Stop Overpaying - National Brand Comparison */}
          <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 to-secondary/30">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                  <p className="text-sm tracking-[0.3em] uppercase text-gold mb-4 font-lato font-light">
                    The Real Cost
                  </p>
                  <h2 className="font-cormorant text-primary text-3xl md:text-4xl font-bold mb-4">
                    Stop Overpaying for Less Care
                  </h2>
                  <p className="text-lg text-muted-foreground font-lato max-w-2xl mx-auto">
                    Telehealth apps split charges to hide the real cost. We include everything in one transparent price.
                  </p>
                </div>

                {/* Savings Callout */}
                <div className="mb-10 flex flex-col sm:flex-row gap-4 justify-center">
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-500 rounded-full">
                      <TrendingDown className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-green-600 font-medium font-lato">Save up to</p>
                      <p className="text-2xl font-bold text-green-700 font-cormorant">$1,140/year</p>
                    </div>
                  </div>
                </div>

                {/* Comparison Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse bg-white rounded-xl shadow-sm overflow-hidden">
                    <thead>
                      <tr className="bg-primary/5">
                        <th className="p-4 text-left font-cormorant text-lg text-primary"></th>
                        <th className="p-4 text-center font-cormorant text-lg text-muted-foreground">
                          <span className="block">Telehealth Apps</span>
                          <span className="text-sm font-lato font-normal">(Ro, Hims, etc.)</span>
                        </th>
                        <th className="p-4 text-center font-cormorant text-lg text-gold bg-gold/10">
                          <span className="block">Réveil</span>
                          <span className="text-sm font-lato font-normal">Augusta, GA</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/50">
                        <td className="p-4 font-lato text-primary font-medium">Real Cost (Semaglutide)</td>
                        <td className="p-4 text-center">
                          <span className="text-lg font-bold text-muted-foreground line-through">$494/mo</span>
                          <p className="text-xs text-muted-foreground">$145 membership + $250 lab + medication</p>
                        </td>
                        <td className="p-4 text-center bg-gold/5">
                          <span className="text-xl font-bold text-gold">$399/mo</span>
                          <p className="text-xs text-green-600 font-medium">All-inclusive</p>
                        </td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="p-4 font-lato text-primary font-medium">Real Cost (Tirzepatide)</td>
                        <td className="p-4 text-center">
                          <span className="text-lg font-bold text-muted-foreground line-through">$594/mo</span>
                          <p className="text-xs text-muted-foreground">$145 membership + $449 medication</p>
                        </td>
                        <td className="p-4 text-center bg-gold/5">
                          <span className="text-xl font-bold text-gold">$499/mo</span>
                          <p className="text-xs text-green-600 font-medium">All-inclusive</p>
                        </td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="p-4 font-lato text-primary font-medium">Hidden Membership Fees</td>
                        <td className="p-4 text-center">
                          <span className="text-red-500 font-medium">Yes — $145/month ongoing</span>
                        </td>
                        <td className="p-4 text-center bg-gold/5">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                          <span className="text-xs text-green-600">No hidden fees</span>
                        </td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="p-4 font-lato text-primary font-medium">In-Person Medical Exam</td>
                        <td className="p-4 text-center">
                          <span className="text-muted-foreground">Video call or questionnaire</span>
                        </td>
                        <td className="p-4 text-center bg-gold/5">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                          <span className="text-xs text-green-600">30-min with your provider</span>
                        </td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="p-4 font-lato text-primary font-medium">Same-Day Approval</td>
                        <td className="p-4 text-center">
                          <span className="text-muted-foreground">2-5 business days</span>
                        </td>
                        <td className="p-4 text-center bg-gold/5">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                          <span className="text-xs text-green-600">Most patients</span>
                        </td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="p-4 font-lato text-primary font-medium">Local Provider Access</td>
                        <td className="p-4 text-center">
                          <span className="text-muted-foreground">Call center support</span>
                        </td>
                        <td className="p-4 text-center bg-gold/5">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                          <span className="text-xs text-green-600">Direct messaging</span>
                        </td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="p-4 font-lato text-primary font-medium">Hormone Integration</td>
                        <td className="p-4 text-center">
                          <span className="text-muted-foreground">Not offered</span>
                        </td>
                        <td className="p-4 text-center bg-gold/5">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                          <span className="text-xs text-green-600">$149/mo add-on</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-4 font-lato text-primary font-medium">Mental Health Support</td>
                        <td className="p-4 text-center">
                          <span className="text-muted-foreground">Not offered</span>
                        </td>
                        <td className="p-4 text-center bg-gold/5">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                          <span className="text-xs text-green-600">Ketamine-certified provider</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="text-center text-xs text-muted-foreground mt-6 font-lato">
                  Comparison based on publicly available Ro pricing as of January 2025. Membership: $45 first month, then $145/mo. 
                  Medication costs are additional and vary by dosage.
                </p>

                <div className="mt-10 text-center">
                  <Button 
                    onClick={handleConsultationCheckout}
                    disabled={isConsultationLoading}
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-white font-lato"
                  >
                    {isConsultationLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Calendar className="mr-2 h-4 w-4" />
                    )}
                    {isConsultationLoading ? "Processing..." : "Book $149 Consultation — Get $99 Credit"}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">First month: $300 (Semaglutide) or $400 (Tirzepatide)</p>
                </div>
              </div>
            </div>
          </section>

          {/* GLP-1 Comparison Table */}
          <section className="py-16 md:py-24 bg-gradient-to-br from-[#f5f0e8] via-[#faf7f2] to-[#f0ebe3]">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                  <p className="text-sm tracking-[0.3em] uppercase text-gold mb-4 font-lato font-light">
                    Compare Your Options
                  </p>
                  <h2 className="font-cormorant text-primary text-3xl md:text-4xl font-bold mb-4">
                    Semaglutide vs. Tirzepatide
                  </h2>
                  <p className="text-lg text-muted-foreground font-lato max-w-2xl mx-auto">
                    Both are FDA-approved GLP-1 medications. Choose based on your goals and budget.
                  </p>
                </div>

                {/* Comparison Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="p-4 text-left font-cormorant text-lg text-primary bg-white/50 border-b border-gold/20 rounded-tl-xl"></th>
                        <th className="p-4 text-center font-cormorant text-xl text-primary bg-white/50 border-b border-gold/20">
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-bold">Semaglutide</span>
                            <span className="text-gold text-lg font-lato">$399/mo</span>
                          </div>
                        </th>
                        <th className="p-4 text-center font-cormorant text-xl text-primary bg-gold/10 border-b border-gold/30 rounded-tr-xl">
                          <div className="flex flex-col items-center gap-1">
                            <span className="inline-block px-2 py-0.5 bg-gold text-white text-xs rounded-full mb-1 font-lato">Premium</span>
                            <span className="font-bold">Tirzepatide</span>
                            <span className="text-gold text-lg font-lato">$499/mo</span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white/70">
                      <tr className="border-b border-gold/10">
                        <td className="p-4 font-lato text-primary font-medium">Mechanism</td>
                        <td className="p-4 text-center font-lato text-primary/70">GLP-1 receptor agonist</td>
                        <td className="p-4 text-center font-lato text-primary/70 bg-gold/5">Dual GLP-1 + GIP agonist</td>
                      </tr>
                      <tr className="border-b border-gold/10">
                        <td className="p-4 font-lato text-primary font-medium">Avg. Weight Loss (Clinical Trials)</td>
                        <td className="p-4 text-center font-lato text-primary/70">
                          <span className="text-lg font-bold text-primary">~15%</span>
                          <br />
                          <span className="text-xs text-muted-foreground">of body weight</span>
                        </td>
                        <td className="p-4 text-center font-lato bg-gold/5">
                          <span className="text-lg font-bold text-gold">~22.5%</span>
                          <br />
                          <span className="text-xs text-muted-foreground">of body weight</span>
                        </td>
                      </tr>
                      <tr className="border-b border-gold/10">
                        <td className="p-4 font-lato text-primary font-medium">Blood Sugar Control</td>
                        <td className="p-4 text-center">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                        </td>
                        <td className="p-4 text-center bg-gold/5">
                          <div className="flex items-center justify-center gap-1">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          </div>
                          <span className="text-xs text-muted-foreground">Superior A1C reduction</span>
                        </td>
                      </tr>
                      <tr className="border-b border-gold/10">
                        <td className="p-4 font-lato text-primary font-medium">Appetite Suppression</td>
                        <td className="p-4 text-center font-lato text-primary/70">Strong</td>
                        <td className="p-4 text-center font-lato text-gold bg-gold/5 font-medium">Very Strong</td>
                      </tr>
                      <tr className="border-b border-gold/10">
                        <td className="p-4 font-lato text-primary font-medium">FDA Approved For</td>
                        <td className="p-4 text-center font-lato text-primary/70 text-sm">Diabetes (Ozempic) & Weight Loss (Wegovy)</td>
                        <td className="p-4 text-center font-lato text-primary/70 text-sm bg-gold/5">Diabetes (Mounjaro) & Weight Loss (Zepbound)</td>
                      </tr>
                      <tr className="border-b border-gold/10">
                        <td className="p-4 font-lato text-primary font-medium">Injection Frequency</td>
                        <td className="p-4 text-center font-lato text-primary/70">Once weekly</td>
                        <td className="p-4 text-center font-lato text-primary/70 bg-gold/5">Once weekly</td>
                      </tr>
                      <tr className="border-b border-gold/10">
                        <td className="p-4 font-lato text-primary font-medium">Time on Market</td>
                        <td className="p-4 text-center font-lato text-primary/70">Since 2017</td>
                        <td className="p-4 text-center font-lato text-primary/70 bg-gold/5">Since 2022</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-lato text-primary font-medium">Best For</td>
                        <td className="p-4 text-center font-lato text-primary/70 text-sm">
                          Steady, sustainable weight loss with proven long-term data
                        </td>
                        <td className="p-4 text-center font-lato text-primary/70 text-sm bg-gold/5">
                          Maximum weight loss, insulin resistance, or plateau breakers
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="text-center text-xs text-muted-foreground mt-6 font-lato">
                  Clinical trial data from STEP (Semaglutide) and SURMOUNT (Tirzepatide) studies. Individual results may vary.
                </p>

                <div className="mt-8 text-center">
                  <Button 
                    onClick={handleConsultationCheckout}
                    disabled={isConsultationLoading}
                    className="bg-gold hover:bg-gold-dark text-white font-lato"
                  >
                    {isConsultationLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {isConsultationLoading ? "Processing..." : "Not Sure Which? Book a Consultation - $99"}
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing Section - Simplified */}
          <section className="py-16 md:py-24 relative overflow-hidden">
            {/* Soft Slate Blue Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#2C3E50]/10 via-[#34495e]/15 to-[#2C3E50]/20" />
            
            <div className="container mx-auto px-4 sm:px-6 relative z-10">
              <div className="max-w-4xl mx-auto text-center mb-12">
                <p className="text-sm tracking-[0.3em] uppercase text-gold mb-4 font-lato font-light">
                  Simple Pricing
                </p>
                <h2 className="font-cormorant text-primary text-3xl md:text-4xl font-bold mb-4">
                  Start Your Journey
                </h2>
                <p className="text-lg text-muted-foreground font-lato">
                  $149 consultation credited toward your first month of treatment
                </p>
              </div>

              {/* Three Cards: Consultation + Two Memberships */}
              <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
                
                {/* Discovery Consultation */}
                <Card className="border border-gold/30 hover:border-gold/50 transition-all">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex p-3 bg-gold/10 rounded-full mb-4">
                      <MessageCircle className="h-6 w-6 text-gold" />
                    </div>
                    <h3 className="font-cormorant text-xl text-primary font-bold mb-2">
                      Discovery Consultation
                    </h3>
                    <p className="text-3xl font-cormorant text-primary mb-2">$149</p>
                    <p className="text-xs text-green-600 font-medium mb-2">
                      Credited toward your first month
                    </p>
                    <p className="text-sm text-muted-foreground mb-4 font-lato">
                      30-minute in-person session to assess eligibility and create your personalized plan.
                    </p>
                    <Button 
                      onClick={handleConsultationCheckout}
                      disabled={isConsultationLoading}
                      className="w-full bg-gold hover:bg-gold-dark text-white"
                    >
                      {isConsultationLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Calendar className="mr-2 h-4 w-4" />
                      )}
                      {isConsultationLoading ? "..." : "Book Consultation"}
                    </Button>
                  </CardContent>
                </Card>

                {/* Semaglutide Membership */}
                <div 
                  className="relative p-6 rounded-2xl border border-gold/30 animate-fade-in-up"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 50%, rgba(250,247,242,0.8) 100%)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 32px rgba(44, 62, 80, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)'
                  }}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gold text-white text-xs px-3 py-1 rounded-full font-lato">
                      Most Popular
                    </span>
                  </div>
                  <div className="relative z-10 text-center pt-2">
                    <div className="inline-flex p-3 bg-gold/10 rounded-full mb-4">
                      <Pill className="h-6 w-6 text-gold" />
                    </div>
                    <h3 className="font-cormorant text-xl text-primary font-bold mb-2">
                      Semaglutide Membership
                    </h3>
                    <div className="flex items-baseline justify-center gap-1 mb-1">
                      <span className="font-cormorant text-3xl text-primary font-light">$399</span>
                      <span className="text-primary/60 font-lato text-sm">/ month</span>
                    </div>
                    <p className="text-xs text-green-600 font-medium mb-3">
                      First month $300 with consultation credit
                    </p>
                    <p className="text-sm text-muted-foreground mb-4 font-lato">
                      FDA-approved GLP-1 for steady, sustainable weight loss with full provider support.
                    </p>
                    
                    <ul className="space-y-2 mb-4 text-sm text-left">
                      {membershipInclusions.slice(0, 4).map((inclusion, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                          <span className="text-primary/70 font-lato text-xs">{inclusion}</span>
                        </li>
                      ))}
                    </ul>

                    <Button 
                      onClick={handleSemaglutideCheckout}
                      disabled={isSemaglutideLoading}
                      size="lg" 
                      className="w-full bg-primary hover:bg-primary/90 text-white font-lato"
                    >
                      {isSemaglutideLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {isSemaglutideLoading ? "Processing..." : "Start Semaglutide"}
                    </Button>
                  </div>
                </div>

                {/* Tirzepatide Membership - Premium */}
                <div 
                  className="relative p-6 rounded-2xl border-2 border-gold/60 animate-fade-in-up"
                  style={{
                    animationDelay: "0.1s",
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(250,247,242,0.9) 50%, rgba(212,160,23,0.05) 100%)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 32px rgba(212, 160, 23, 0.15), inset 0 1px 0 rgba(255,255,255,0.9)'
                  }}
                >
                  {/* Premium Badge */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-gold to-gold-dark text-white text-xs px-4 py-1 rounded-full font-lato font-medium shadow-lg">
                      Premium Tier
                    </span>
                  </div>

                  <div className="relative z-10 text-center pt-2">
                    <div className="inline-flex p-3 bg-gold/10 rounded-full mb-4">
                      <Sparkles className="h-6 w-6 text-gold" />
                    </div>
                    <h3 className="font-cormorant text-xl text-primary font-bold mb-2">
                      Tirzepatide Membership
                    </h3>
                    <div className="flex items-baseline justify-center gap-1 mb-1">
                      <span className="font-cormorant text-3xl text-gold font-light">$499</span>
                      <span className="text-primary/60 font-lato text-sm">/ month</span>
                    </div>
                    <p className="text-xs text-green-600 font-medium mb-3">
                      First month $400 with consultation credit
                    </p>
                    <p className="text-sm text-muted-foreground mb-4 font-lato">
                      Dual-action GLP-1/GIP for accelerated results — up to 22.5% weight loss.
                    </p>

                    <ul className="space-y-2 mb-4 text-sm text-left">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                        <span className="text-primary/70 font-lato text-xs">FDA-Approved Tirzepatide (dual GLP-1/GIP)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                        <span className="text-primary/70 font-lato text-xs">Medical eligibility screening included</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                        <span className="text-primary/70 font-lato text-xs">Unlimited provider messaging & support</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                        <span className="text-primary/70 font-lato text-xs">Priority shipping from our partner</span>
                      </li>
                    </ul>

                    <Button 
                      onClick={handleTirzepatideCheckout}
                      disabled={isTirzepatideLoading}
                      size="lg" 
                      className="w-full bg-gold hover:bg-gold-dark text-white font-lato"
                    >
                      {isTirzepatideLoading ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : null}
                      {isTirzepatideLoading ? "Processing..." : "Start Tirzepatide"}
                    </Button>
                  </div>
                </div>
              </div>

              <p className="mt-8 text-center text-xs text-primary/50 font-lato">
                Cancel anytime. Most patients see results within the first month.
              </p>
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
                  Book your $149 consultation today and discover why Réveil is Augusta's 
                  most comprehensive weight loss program. No generic dosing. No rushed appointments. 
                  Just expert support and real results.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                  <Button 
                    onClick={handleConsultationCheckout}
                    disabled={isConsultationLoading}
                    size="lg" 
                    className="text-lg px-8 py-6"
                  >
                    {isConsultationLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <CreditCard className="mr-2 h-5 w-5" />
                    )}
                    {isConsultationLoading ? "Processing..." : "Book $149 Consultation"}
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
        <AssistantHub />
      </div>
    </>
  );
};

export default WeightLoss;

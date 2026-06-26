import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CheckCircle2, Award, Heart, Users, TrendingDown, Activity, 
  Apple, Scale, Droplet, LineChart, Brain, Pill, Clock, 
  MessageCircle, Shield, CreditCard, Calendar
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { trackEvent } from "@/lib/analytics";
import { useState, useEffect } from "react";
import NotReadyToBook from "@/components/NotReadyToBook";
import HowGLP1Works from "@/components/HowGLP1Works";
import {
  CORE_SERVICES,
  ELEVATED_PROGRAMS,
  GLP1_DISPLAY_PRICE_RANGE,
  GLP1_PROGRAM_VARIANTS,
  MEDICATION_FILLS,
} from "@/lib/stripeConfig";
import { PUBLIC_GLP1_CARE_FLOW } from "@/lib/clinicalOptimizationCatalog";
import { EverythingIncludedPillars } from "@/components/marketing/EverythingIncludedPillars";
import ElevatedComboUpsell from "@/components/marketing/ElevatedComboUpsell";
import { MembershipComparison } from "@/components/marketing/MembershipComparison";
import { BodyRecompositionTeaser } from "@/components/marketing/BodyRecompositionTeaser";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ArrowRight } from "lucide-react";
import {
  storefrontHeroInner,
  storefrontHeroLabel,
  storefrontHeroLead,
  storefrontHeroSection,
  storefrontHeroTitle,
} from "@/lib/storefrontHero";

// Display values — actual charges flow through Stripe
// (create-consultation-checkout, semaglutide/tirzepatide checkouts).
const PRICE_CONSULT = CORE_SERVICES.wellnessAssessment.displayPrice;
const PRICE_PANEL_WEIGHT = CORE_SERVICES.expandedPanel.displayPrice;
// GLP-1 program is molecule-priced: semaglutide $349/mo, tirzepatide $449/mo.
const PRICE_PROGRAM_GLP1 = GLP1_DISPLAY_PRICE_RANGE;
const PRICE_PROGRAM_GLP1_SEMA = GLP1_PROGRAM_VARIANTS.semaglutide.displayPrice;
const PRICE_PROGRAM_GLP1_TIRZ = GLP1_PROGRAM_VARIANTS.tirzepatide.displayPrice;

const WeightLoss = () => {
  const navigate = useNavigate();
  const [glpComparisonDrug, setGlpComparisonDrug] = useState<"semaglutide" | "tirzepatide">("semaglutide");

  useEffect(() => {
    if (window.location.hash === "#body-recomposition") {
      window.requestAnimationFrame(() => {
        document.getElementById("body-recomposition")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, []);

  const handleConsultationCheckout = () => {
    trackEvent("cta_click", { cta_name: "weight_loss_consultation", destination: "consult_start" });
    navigate("/consult/start?reasons=weight_loss");
  };

  // GLP-1 is consult-gated (Lane B): the public storefront routes every purchase
  // intent to the $79 wellness assessment. Subscription enrollment and à la carte
  // fills are created post-clearance from the patient portal / staff payment links,
  // so no direct GLP-1 checkout handler lives here.

  // 3-Step Concierge Workflow
  const processSteps = [
    {
      step: "01",
      headline: "Book Your $79 Wellness Assessment.",
      body: "Schedule your 30-minute in-person visit at our Evans clinic. Your provider will review your medical history, medications, and determine your GLP-1 eligibility."
    },
    {
      step: "02",
      headline: "Get Cleared Same Day.",
      body: "Most patients are approved immediately during their Wellness Assessment visit. If your provider needs additional information, they'll coordinate with your PCP.",
    },
    {
      step: "03",
      headline: "Enroll in ELEVATED GLP-1 monthly care.",
      body: `One program (${PRICE_PROGRAM_GLP1}) bundles medication when prescribed, monthly check-ins with our clinical team, quarterly labs, and unlimited messaging. À la carte single fills are ${MEDICATION_FILLS.semaglutide.displayPrice} (semaglutide) or ${MEDICATION_FILLS.tirzepatide.displayPrice} (tirzepatide) when your clinician recommends pay-per-fill fulfillment.`,
    },
  ];

  const programIncludes = [
    { icon: Pill, text: "GLP-1 medication when prescribed (bundled in ELEVATED GLP-1)" },
    { icon: Shield, text: "Medical eligibility review at your Wellness Assessment" },
    { icon: Activity, text: "Ongoing provider supervision and dose adjustments" },
    { icon: Apple, text: "Nutrition and lifestyle coaching support" },
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
      description: "Physician-led protocols with the same rigor we apply across every service line. Your safety is our priority.",
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
    "Medication included when you are on the ELEVATED GLP-1 program.",
    "Monthly check-in with our clinical team and unlimited secure messaging.",
    "Quarterly labs and lab review included in program pricing.",
    "Dosage adjustments as clinically appropriate.",
    "Compounded medication from our 503A pharmacy partner when prescribed.",
  ];

  const faqs = [
    {
      q: "How is this different from other online Semaglutide clinics?",
      a: "Unlike telehealth-only clinics, we meet you in person at our Evans clinic. Your provider reviews your complete medical history, checks for contraindications, and provides ongoing supervision—not just a prescription and a wave goodbye."
    },
    {
      q: "Do I need labs to start?",
      a: "Most patients can start GLP-1 medication after their $79 Wellness Assessment. If your provider determines additional lab work would benefit your safety or results, they may request recent labs from your PCP or recommend optional hormone testing."
    },
    {
      q: "What if I want hormone or metabolic labs too?",
      a: `If your clinician recommends additional markers beyond your visit, we order LabCorp panels such as the ${CORE_SERVICES.comprehensivePanel.name} (${CORE_SERVICES.comprehensivePanel.displayPrice}) or ${CORE_SERVICES.expandedPanel.name} (${CORE_SERVICES.expandedPanel.displayPrice}) when clinically appropriate.`,
    },
    {
      q: "How quickly can I start medication?",
      a: "Most patients start within a week of their Wellness Assessment. Your provider will determine eligibility during your in-person visit and can often authorize treatment the same day.",
    }
  ];

  return (
    <>
      <Helmet>
        <title>Medical Weight Loss Augusta GA — Elevated Health</title>
        <meta name="description" content="Medical weight loss in Augusta, GA. $79 Wellness Assessment, in-person GLP-1 care, LabCorp labs, compounded semaglutide and tirzepatide when appropriate." />
        <link rel="canonical" href="https://elevatedhealthaugusta.com/weight-loss" />
        <meta property="og:title" content="Medical Weight Loss Augusta GA — Elevated Health" />
        <meta property="og:description" content="$79 Wellness Assessment. In-person GLP-1 therapy with transparent monthly program pricing." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://elevatedhealthaugusta.com/weight-loss" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Medical Weight Loss Augusta | Elevated Health" />
        <meta name="twitter:description" content="$79 Wellness Assessment. In-person GLP-1 care with clear monthly pricing." />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "MedicalProcedure",
          "name": "Medical Weight Loss Program",
          "description": "Physician-supervised GLP-1 weight loss with semaglutide or tirzepatide, lab monitoring, and lifestyle coaching.",
          "procedureType": "https://schema.org/TherapeuticProcedure",
          "url": "https://elevatedhealthaugusta.com/weight-loss",
          "provider": { "@type": "MedicalClinic", "name": "Elevated Health Augusta", "url": "https://elevatedhealthaugusta.com" }
        })}</script>
      </Helmet>

      <div className="public-page-shell">
        <Navbar />
        
        <main className="flex-1">
          <BodyRecompositionTeaser variant="banner" />
          <section className={storefrontHeroSection}>
            <div className={`${storefrontHeroInner} text-center max-w-4xl mx-auto`}>
              <p className={storefrontHeroLabel}>Medical Weight Loss</p>
              <h1 className={storefrontHeroTitle}>
                Medically supervised
                <br />
                <span className="italic">weight management.</span>
              </h1>
              <p className={`${storefrontHeroLead} mx-auto`}>
                Compounded semaglutide and tirzepatide — prescribed and monitored in person after your{" "}
                {PRICE_CONSULT} Wellness Assessment. Transparent ELEVATED GLP-1 program pricing, LabCorp labs,
                and a physician-led team in Evans.
              </p>
              <p className="font-jost text-sm text-muted-foreground mb-10 max-w-2xl mx-auto">
                Individual results vary. We do not promise specific weight-loss amounts or timelines.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-10">
                {[
                  { icon: Activity, label: "In-person Evans visits" },
                  { icon: Pill, label: "Compounded GLP-1s" },
                  { icon: Droplet, label: "Lab-driven dosing" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="premium-card-muted flex flex-col items-center gap-2 p-4">
                    <Icon className="w-6 h-6 text-accent" />
                    <span className="text-sm font-jost text-foreground">{label}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={handleConsultationCheckout} size="lg">
                  Book {PRICE_CONSULT} Wellness Assessment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  onClick={() => window.open(`tel:${SITE_CONFIG.phoneRaw}`, "_self")}
                  size="lg"
                  variant="outline"
                >
                  Call {SITE_CONFIG.phone}
                </Button>
              </div>

              <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  <span>LabCorp on-site draws</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  <span>503A compounding when prescribed</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  <span>Transparent program pricing</span>
                </div>
              </div>
            </div>
          </section>

          <section className="py-16 md:py-24 bg-muted/20 border-y border-border">
            <div className="container mx-auto px-6 lg:px-8 max-w-5xl space-y-10">
              <EverythingIncludedPillars intro="ELEVATED GLP-1 bundles medication when prescribed with the same clinical rhythm we use across every ELEVATED program." />
              <ElevatedComboUpsell variant="glp1_led" className="mt-8" showCta={false} />
              <div className="flex flex-col items-center gap-4">
                <p className="font-jost text-sm text-muted-foreground text-center max-w-md">
                  Compare program vs. à la carte for the medication you are considering.
                </p>
                <ToggleGroup
                  type="single"
                  value={glpComparisonDrug}
                  onValueChange={(v) => {
                    if (v === "semaglutide" || v === "tirzepatide") setGlpComparisonDrug(v);
                  }}
                  className="justify-center"
                >
                  <ToggleGroupItem value="semaglutide" className="font-jost">
                    Semaglutide
                  </ToggleGroupItem>
                  <ToggleGroupItem value="tirzepatide" className="font-jost">
                    Tirzepatide
                  </ToggleGroupItem>
                </ToggleGroup>
                <MembershipComparison program="glp1" drug={glpComparisonDrug} />
              </div>
            </div>
          </section>

          {/* Pricing Strip (Pattern B) */}
          <section className="py-16 md:py-20 bg-background border-y border-border">
            <div className="container mx-auto px-6 lg:px-8 max-w-5xl">
              <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
                {[
                  { l: "Wellness Assessment", p: PRICE_CONSULT, sub: "RN intake, in-person at Evans" },
                  {
                    l: CORE_SERVICES.expandedPanel.name,
                    p: PRICE_PANEL_WEIGHT,
                    sub: "when your clinician orders expanded metabolic markers",
                  },
                  {
                    l: ELEVATED_PROGRAMS.glp1.name,
                    p: PRICE_PROGRAM_GLP1,
                    sub: "medication when prescribed, check-ins, quarterly labs, messaging",
                  },
                ].map((c) => (
                  <div key={c.l} className="px-6 py-8 md:py-4 text-center">
                    <p className="section-label mb-3">{c.l}</p>
                    <p className="font-playfair text-3xl md:text-4xl text-foreground mb-2">{c.p}</p>
                    <p className="font-jost text-xs text-muted-foreground">{c.sub}</p>
                  </div>
                ))}
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
                  description="If you have tried everything and nothing has worked, there may be a metabolic reason. Our team can explain how in-person GLP-1 care works and whether it is a fit."
                  ctaText="Understand Your Metabolism"
                />
              </div>
            </div>
          </section>

          <section className="py-12 bg-muted/30 border-y border-border">
            <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
              <p className="section-label text-center mb-4">Care pathway</p>
              <ol className="flex flex-col md:flex-row md:flex-wrap justify-center gap-4 md:gap-2 font-jost text-sm text-center">
                {PUBLIC_GLP1_CARE_FLOW.map((step, i) => (
                  <li key={step} className="flex items-center gap-2">
                    <span className="font-playfair italic text-accent">{String(i + 1).padStart(2, "0")}</span>
                    <span>{step}</span>
                    {i < PUBLIC_GLP1_CARE_FLOW.length - 1 && (
                      <span className="hidden md:inline text-muted-foreground">→</span>
                    )}
                  </li>
                ))}
              </ol>
              <p className="font-jost text-xs text-muted-foreground text-center mt-6 max-w-xl mx-auto">
                Advanced body recomposition programs are physician-directed and discussed after your Wellness
                Assessment when clinically appropriate — not self-serve online.
              </p>
            </div>
          </section>

          <BodyRecompositionTeaser />

          {/* How It Works - 3-Step Concierge Workflow */}
          <section className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-4xl mx-auto text-center mb-16">
                <p className="text-sm tracking-[0.3em] uppercase text-accent mb-4 font-jost font-light">
                  The Process
                </p>
                <h2 className="font-playfair text-primary text-3xl md:text-4xl font-bold mb-4">
                  Your Concierge Weight Loss Journey
                </h2>
                <p className="text-lg text-muted-foreground font-jost">
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
                    <div className="text-6xl font-playfair text-accent/30 font-bold mb-4">
                      {step.step}
                    </div>
                    {/* Content */}
                    <h3 className="text-xl font-playfair text-primary font-bold mb-3">
                      {step.headline}
                    </h3>
                    <p className="text-muted-foreground font-jost leading-relaxed">
                      {step.body}
                    </p>
                    {/* Connector line (except last) */}
                    {index < processSteps.length - 1 && (
                      <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-accent/30 to-transparent -translate-x-8" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* What's Included Section - Cream/Gold Theme */}
          <section className="py-16 md:py-24 section-band-surface">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-4xl mx-auto text-center mb-12">
                <p className="text-sm tracking-[0.3em] uppercase text-accent mb-4 font-jost font-light">
                  What You Get
                </p>
                <h2 className="font-playfair text-primary text-3xl md:text-4xl font-bold mb-4">
                  Hormonal Weight Reset Includes
                </h2>
                <p className="text-lg text-primary/70 font-jost">
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
                        className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-accent/20 animate-fade-in-up"
                        style={{ animationDelay: `${index * 0.08}s` }}
                      >
                        <div className="shrink-0">
                          <CheckCircle2 className="h-6 w-6 text-accent" />
                        </div>
                        <p className="text-primary font-jost font-medium">{item.text}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-10 text-center">
                  <Button 
                    onClick={handleConsultationCheckout} 
                    size="lg" 
                    className="font-jost bg-primary hover:bg-primary/90 text-white"
                  >
                    <CreditCard className="mr-2 h-5 w-5" />
                    Book Wellness Assessment - $79
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* How GLP-1 Works - Educational Section */}
          <HowGLP1Works />

          {/* Why Elevated Health Augusta is Different */}
          <section className="py-16 md:py-24">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-4xl mx-auto text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Why Elevated Health Augusta is Different
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
                  <p className="text-sm tracking-[0.3em] uppercase text-accent mb-4 font-jost font-light">
                    The Real Cost
                  </p>
                  <h2 className="font-playfair text-primary text-3xl md:text-4xl font-bold mb-4">
                    Stop Overpaying for Less Care
                  </h2>
                  <p className="text-lg text-muted-foreground font-jost max-w-2xl mx-auto">
                    Telehealth apps split charges to hide the real cost. We include everything in one transparent price.
                  </p>
                </div>

                {/* Comparison highlights */}
                <div className="mb-10 flex flex-col sm:flex-row gap-4 justify-center">
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-500 rounded-full">
                      <TrendingDown className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-green-600 font-medium font-jost">Program pricing</p>
                      <p className="text-lg font-bold text-green-700 font-playfair">{PRICE_PROGRAM_GLP1} bundled</p>
                    </div>
                  </div>
                </div>

                {/* Comparison Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse bg-white rounded-xl shadow-sm overflow-hidden">
                    <thead>
                      <tr className="bg-primary/5">
                        <th className="p-4 text-left font-playfair text-lg text-primary"></th>
                        <th className="p-4 text-center font-playfair text-lg text-muted-foreground">
                          <span className="block">Telehealth Apps</span>
                          <span className="text-sm font-jost font-normal">(Ro, Hims, etc.)</span>
                        </th>
                        <th className="p-4 text-center font-playfair text-lg text-accent bg-accent/10">
                          <span className="block">Elevated Health Augusta</span>
                          <span className="text-sm font-jost font-normal">Augusta, GA</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/50">
                        <td className="p-4 font-jost text-primary font-medium">ELEVATED GLP-1 program</td>
                        <td className="p-4 text-center">
                          <span className="text-sm text-muted-foreground">Not offered</span>
                        </td>
                        <td className="p-4 text-center bg-accent/5">
                          <span className="text-xl font-bold text-accent">{PRICE_PROGRAM_GLP1}</span>
                          <p className="text-xs text-green-600 font-medium">Medication + ongoing care bundle</p>
                        </td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="p-4 font-jost text-primary font-medium">À la carte semaglutide fill</td>
                        <td className="p-4 text-center">
                          <span className="text-lg font-bold text-muted-foreground line-through">$300+/mo</span>
                          <p className="text-xs text-muted-foreground">Hidden fees & rebill traps</p>
                        </td>
                        <td className="p-4 text-center bg-accent/5">
                          <span className="text-xl font-bold text-accent">{MEDICATION_FILLS.semaglutide.displayPrice}</span>
                          <p className="text-xs text-green-600 font-medium">Single fill when not on program</p>
                        </td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="p-4 font-jost text-primary font-medium">À la carte tirzepatide fill</td>
                        <td className="p-4 text-center">
                          <span className="text-lg font-bold text-muted-foreground line-through">$600+/mo</span>
                          <p className="text-xs text-muted-foreground">Compounded, often unstable supply</p>
                        </td>
                        <td className="p-4 text-center bg-accent/5">
                          <span className="text-xl font-bold text-accent">{MEDICATION_FILLS.tirzepatide.displayPrice}</span>
                          <p className="text-xs text-green-600 font-medium">Single fill when not on program</p>
                        </td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="p-4 font-jost text-primary font-medium">Hidden Membership Fees</td>
                        <td className="p-4 text-center">
                          <span className="text-red-500 font-medium">Yes — surprise fees & rebills</span>
                        </td>
                        <td className="p-4 text-center bg-accent/5">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                          <span className="text-xs text-green-600">No hidden fees</span>
                        </td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="p-4 font-jost text-primary font-medium">In-Person Medical Exam</td>
                        <td className="p-4 text-center">
                          <span className="text-muted-foreground">Video call or questionnaire</span>
                        </td>
                        <td className="p-4 text-center bg-accent/5">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                          <span className="text-xs text-green-600">30-min with your provider</span>
                        </td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="p-4 font-jost text-primary font-medium">Same-Day Approval</td>
                        <td className="p-4 text-center">
                          <span className="text-muted-foreground">2-5 business days</span>
                        </td>
                        <td className="p-4 text-center bg-accent/5">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                          <span className="text-xs text-green-600">Most patients</span>
                        </td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="p-4 font-jost text-primary font-medium">Local Provider Access</td>
                        <td className="p-4 text-center">
                          <span className="text-muted-foreground">Call center support</span>
                        </td>
                        <td className="p-4 text-center bg-accent/5">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                          <span className="text-xs text-green-600">Direct messaging</span>
                        </td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="p-4 font-jost text-primary font-medium">Hormone & metabolic integration</td>
                        <td className="p-4 text-center">
                          <span className="text-muted-foreground">Not offered</span>
                        </td>
                        <td className="p-4 text-center bg-accent/5">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                          <span className="text-xs text-green-600">Optional ELEVATED TRT / HRT programs</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-4 font-jost text-primary font-medium">Mental Health Support</td>
                        <td className="p-4 text-center">
                          <span className="text-muted-foreground">Not offered</span>
                        </td>
                        <td className="p-4 text-center bg-accent/5">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                          <span className="text-xs text-green-600">Integrated behavioral support</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="text-center text-xs text-muted-foreground mt-6 font-jost">
                  Comparison based on publicly available Ro pricing as of January 2025. Membership: $45 first month, then $145/mo. 
                  Medication costs are additional and vary by dosage.
                </p>

                <div className="mt-10 text-center">
                  <Button 
                    onClick={handleConsultationCheckout}
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-white font-jost"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Book a {PRICE_CONSULT} Wellness Assessment
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Program {PRICE_PROGRAM_GLP1}; à la carte fills {MEDICATION_FILLS.semaglutide.displayPrice} /{" "}
                    {MEDICATION_FILLS.tirzepatide.displayPrice} when not bundled.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* GLP-1 Comparison Table */}
          <section className="py-16 md:py-24 section-band-surface">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                  <p className="text-sm tracking-[0.3em] uppercase text-accent mb-4 font-jost font-light">
                    Compare Your Options
                  </p>
                  <h2 className="font-playfair text-primary text-3xl md:text-4xl font-bold mb-4">
                    Semaglutide vs. Tirzepatide
                  </h2>
                  <p className="text-lg text-muted-foreground font-jost max-w-2xl mx-auto">
                    Both are FDA-approved GLP-1 medications. Choose based on your goals and budget.
                  </p>
                </div>

                {/* Comparison Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="p-4 text-left font-playfair text-lg text-primary bg-white/50 border-b border-accent/20 rounded-tl-xl"></th>
                        <th className="p-4 text-center font-playfair text-xl text-primary bg-white/50 border-b border-accent/20">
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-bold">Semaglutide</span>
                            <span className="text-accent text-lg font-jost">{MEDICATION_FILLS.semaglutide.displayPrice} fill</span>
                          </div>
                        </th>
                        <th className="p-4 text-center font-playfair text-xl text-primary bg-accent/10 border-b border-accent/30 rounded-tr-xl">
                          <div className="flex flex-col items-center gap-1">
                            <span className="inline-block px-2 py-0.5 bg-accent text-white text-xs rounded-full mb-1 font-jost">Premium</span>
                            <span className="font-bold">Tirzepatide</span>
                            <span className="text-accent text-lg font-jost">{MEDICATION_FILLS.tirzepatide.displayPrice} fill</span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white/70">
                      <tr className="border-b border-accent/10">
                        <td className="p-4 font-jost text-primary font-medium">Mechanism</td>
                        <td className="p-4 text-center font-jost text-primary/70">GLP-1 receptor agonist</td>
                        <td className="p-4 text-center font-jost text-primary/70 bg-accent/5">Dual GLP-1 + GIP agonist</td>
                      </tr>
                      <tr className="border-b border-accent/10">
                        <td className="p-4 font-jost text-primary font-medium">Avg. Weight Loss (Clinical Trials)</td>
                        <td className="p-4 text-center font-jost text-primary/70">
                          <span className="text-lg font-bold text-primary">~15%</span>
                          <br />
                          <span className="text-xs text-muted-foreground">of body weight</span>
                        </td>
                        <td className="p-4 text-center font-jost bg-accent/5">
                          <span className="text-lg font-bold text-accent">~22.5%</span>
                          <br />
                          <span className="text-xs text-muted-foreground">of body weight</span>
                        </td>
                      </tr>
                      <tr className="border-b border-accent/10">
                        <td className="p-4 font-jost text-primary font-medium">Blood Sugar Control</td>
                        <td className="p-4 text-center">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                        </td>
                        <td className="p-4 text-center bg-accent/5">
                          <div className="flex items-center justify-center gap-1">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          </div>
                          <span className="text-xs text-muted-foreground">Superior A1C reduction</span>
                        </td>
                      </tr>
                      <tr className="border-b border-accent/10">
                        <td className="p-4 font-jost text-primary font-medium">Appetite Suppression</td>
                        <td className="p-4 text-center font-jost text-primary/70">Strong</td>
                        <td className="p-4 text-center font-jost text-accent bg-accent/5 font-medium">Very Strong</td>
                      </tr>
                      <tr className="border-b border-accent/10">
                        <td className="p-4 font-jost text-primary font-medium">Regulatory context</td>
                        <td className="p-4 text-center font-jost text-primary/70 text-sm">Compounded semaglutide (503A patient-specific)</td>
                        <td className="p-4 text-center font-jost text-primary/70 text-sm bg-accent/5">Compounded tirzepatide (503A patient-specific)</td>
                      </tr>
                      <tr className="border-b border-accent/10">
                        <td className="p-4 font-jost text-primary font-medium">Injection Frequency</td>
                        <td className="p-4 text-center font-jost text-primary/70">Once weekly</td>
                        <td className="p-4 text-center font-jost text-primary/70 bg-accent/5">Once weekly</td>
                      </tr>
                      <tr className="border-b border-accent/10">
                        <td className="p-4 font-jost text-primary font-medium">Time on Market</td>
                        <td className="p-4 text-center font-jost text-primary/70">Since 2017</td>
                        <td className="p-4 text-center font-jost text-primary/70 bg-accent/5">Since 2022</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-jost text-primary font-medium">Best For</td>
                        <td className="p-4 text-center font-jost text-primary/70 text-sm">
                          Steady, sustainable weight loss with proven long-term data
                        </td>
                        <td className="p-4 text-center font-jost text-primary/70 text-sm bg-accent/5">
                          Maximum weight loss, insulin resistance, or plateau breakers
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="text-center text-xs text-muted-foreground mt-6 font-jost">
                  Clinical trial data from STEP (Semaglutide) and SURMOUNT (Tirzepatide) studies. Individual results may vary.
                </p>

                <div className="mt-8 text-center">
                  <Button 
                    onClick={handleConsultationCheckout}
                    className="bg-accent hover:bg-accent text-white font-jost"
                  >
                    Book a {PRICE_CONSULT} Wellness Assessment
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
                <p className="text-sm tracking-[0.3em] uppercase text-accent mb-4 font-jost font-light">
                  Simple Pricing
                </p>
                <h2 className="font-playfair text-primary text-3xl md:text-4xl font-bold mb-4">
                  Start Your Journey
                </h2>
                <p className="text-lg text-muted-foreground font-jost">
                  Start with a {PRICE_CONSULT} Wellness Assessment, then enroll in {ELEVATED_PROGRAMS.glp1.name} or pay per fill when your clinician recommends it.
                </p>
              </div>

              <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
                <Card className="border border-accent/30 hover:border-accent/50 transition-all">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex p-3 bg-accent/10 rounded-full mb-4">
                      <MessageCircle className="h-6 w-6 text-accent" />
                    </div>
                    <h3 className="font-playfair text-xl text-primary font-bold mb-2">{CORE_SERVICES.wellnessAssessment.name}</h3>
                    <p className="text-3xl font-playfair text-primary mb-2">{PRICE_CONSULT}</p>
                    <p className="text-sm text-muted-foreground mb-4 font-jost">
                      In-person visit to assess eligibility and build your plan.
                    </p>
                    <Button
                      onClick={handleConsultationCheckout}
                      className="w-full bg-accent hover:bg-accent text-white"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Book {PRICE_CONSULT} Wellness Assessment
                    </Button>
                  </CardContent>
                </Card>

                <div
                  className="relative p-6 rounded-2xl border border-accent/30 md:col-span-1"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 50%, rgba(250,247,242,0.8) 100%)",
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 8px 32px rgba(44, 62, 80, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
                  }}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-accent text-white text-xs px-3 py-1 rounded-full font-jost">Flagship</span>
                  </div>
                  <div className="relative z-10 text-center pt-2">
                    <div className="inline-flex p-3 bg-accent/10 rounded-full mb-4">
                      <Pill className="h-6 w-6 text-accent" />
                    </div>
                    <h3 className="font-playfair text-xl text-primary font-bold mb-2">{ELEVATED_PROGRAMS.glp1.name}</h3>
                    <div className="flex items-baseline justify-center gap-1 mb-1">
                      <span className="font-playfair text-3xl text-primary font-light">{PRICE_PROGRAM_GLP1}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 font-jost">
                      Medication when prescribed, monthly check-in, quarterly labs, lab review, and unlimited messaging.
                    </p>
                    <ul className="space-y-2 mb-4 text-sm text-left">
                      {membershipInclusions.slice(0, 4).map((inclusion, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                          <span className="text-primary/70 font-jost text-xs">{inclusion}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col gap-1 mb-1 text-sm font-jost">
                        <div className="flex justify-between gap-2">
                          <span className="text-primary/70">Semaglutide</span>
                          <span className="font-medium text-accent">{PRICE_PROGRAM_GLP1_SEMA}/mo</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-primary/70">Tirzepatide</span>
                          <span className="font-medium text-accent">{PRICE_PROGRAM_GLP1_TIRZ}/mo</span>
                        </div>
                      </div>
                      <Button
                        onClick={handleConsultationCheckout}
                        size="lg"
                        className="w-full bg-primary hover:bg-primary/90 text-white font-jost"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Start with your {PRICE_CONSULT} assessment
                      </Button>
                      <p className="text-[11px] text-primary/50 font-jost leading-snug">
                        GLP-1 therapy is prescription-only. You'll enroll in monthly care after your assessment and
                        provider clearance.
                      </p>
                    </div>
                  </div>
                </div>

                <Card className="border border-border">
                  <CardContent className="p-6 text-center flex flex-col h-full">
                    <h3 className="font-playfair text-xl text-primary font-bold mb-2">À la carte single fills</h3>
                    <p className="text-sm text-muted-foreground mb-4 font-jost flex-1">
                      When your clinician recommends pay-per-fill instead of the monthly program bundle.
                    </p>
                    <div className="space-y-3 text-left font-jost text-sm mb-4">
                      <div className="flex justify-between gap-2">
                        <span>{MEDICATION_FILLS.semaglutide.name}</span>
                        <span className="font-medium text-accent">{MEDICATION_FILLS.semaglutide.displayPrice}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span>{MEDICATION_FILLS.tirzepatide.name}</span>
                        <span className="font-medium text-accent">{MEDICATION_FILLS.tirzepatide.displayPrice}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 mt-auto">
                      <Button
                        onClick={handleConsultationCheckout}
                        size="sm"
                        variant="outline"
                        className="w-full font-jost"
                      >
                        Start with your {PRICE_CONSULT} assessment
                      </Button>
                      <p className="text-[11px] text-muted-foreground font-jost leading-snug">
                        Pay-per-fill is arranged by your clinician after your assessment — no online self-checkout.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <p className="mt-8 text-center text-xs text-primary/50 font-jost">
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
                  Book your $79 Wellness Assessment today and discover why Elevated Health Augusta is Augusta's 
                  most comprehensive weight loss program. No generic dosing. No rushed appointments. 
                  Just expert support and real results.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                  <Button 
                    onClick={handleConsultationCheckout}
                    size="lg" 
                    className="text-lg px-8 py-6"
                  >
                    <CreditCard className="mr-2 h-5 w-5" />
                    Book $79 Wellness Assessment
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

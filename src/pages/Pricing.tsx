import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { useBooking } from "@/contexts/BookingContext";
import { EverythingIncludedPillars } from "@/components/marketing/EverythingIncludedPillars";
import { CORE_SERVICES, ELEVATED_PROGRAMS, MEDICATION_FILLS, MEMBER_DISCOUNT_PERCENT } from "@/lib/stripeConfig";
import {
  Check,
  Star,
  Shield,
  Clock,
  Phone,
  Sparkles,
  Brain,
  Scale,
  Heart,
  Droplets,
  Syringe,
  ArrowRight,
  BadgeCheck,
  Calendar,
  ChevronUp,
  Stethoscope,
  Activity,
  Lock,
  ShieldAlert,
  Scissors,
  HeartPulse,
  MessageCircle,
} from "lucide-react";

const serviceCategories = [
  { id: "all", label: "All Services" },
  { id: "mental", label: "Mental Wellness", icon: Brain },
  { id: "weight", label: "Weight Loss", icon: Scale },
  { id: "hormones", label: "Hormones", icon: Heart },
  // SUNSETTED: peptides, iv, hair, sexual - hidden but code preserved
];

const Pricing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "all");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const navigate = useNavigate();
  const { openBooking } = useBooking();

  // Update URL when category changes
  useEffect(() => {
    if (activeCategory === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", activeCategory);
    }
    setSearchParams(searchParams, { replace: true });
  }, [activeCategory, searchParams, setSearchParams]);

  // Show/hide back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // SUNSETTED: peptides, iv, hair, sexual are excluded from "all" view
  const sunsettedCategories = ["peptides", "iv", "hair", "sexual"];
  
  const shouldShow = (category: string) => {
    // Never show sunsetted categories
    if (sunsettedCategories.includes(category)) {
      return false;
    }
    return activeCategory === "all" || activeCategory === category;
  };

  const structuredOfferCatalog = {
    "@type": "OfferCatalog" as const,
    name: "Elevated Health Augusta Services",
    itemListElement: [
      ...Object.values(ELEVATED_PROGRAMS).map((p) => ({
        "@type": "Offer" as const,
        itemOffered: {
          "@type": "Service" as const,
          name: p.name,
          description: "Monthly ELEVATED program membership",
        },
        price: String(p.amount / 100),
        priceCurrency: "USD",
      })),
      {
        "@type": "Offer" as const,
        itemOffered: {
          "@type": "MedicalProcedure" as const,
          name: CORE_SERVICES.wellnessAssessment.name,
        },
        price: String(CORE_SERVICES.wellnessAssessment.amount / 100),
        priceCurrency: "USD",
      },
      {
        "@type": "Offer" as const,
        itemOffered: {
          "@type": "MedicalProcedure" as const,
          name: CORE_SERVICES.comprehensivePanel.name,
        },
        price: String(CORE_SERVICES.comprehensivePanel.amount / 100),
        priceCurrency: "USD",
      },
      {
        "@type": "Offer" as const,
        itemOffered: {
          "@type": "MedicalProcedure" as const,
          name: CORE_SERVICES.expandedPanel.name,
        },
        price: String(CORE_SERVICES.expandedPanel.amount / 100),
        priceCurrency: "USD",
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>Pricing - Transparent Healthcare Pricing | Elevated Health Augusta</title>
        <meta
          name="description"
          content="Transparent pricing for Elevated Health Augusta. $79 Wellness Assessment entry. ELEVATED TRT, HRT, GLP-1, and Wellness memberships with medication included where prescribed."
        />
        <meta
          name="keywords"
          content="wellness pricing Evans GA, hormone therapy pricing, medical weight loss cost, IV therapy prices, transparent healthcare pricing"
        />
        <link rel="canonical" href="https://elevatedhealthaugusta.com/pricing" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Transparent Healthcare Pricing | Elevated Health Augusta" />
        <meta property="og:description" content="Transparent pricing. $79 Wellness Assessment. ELEVATED program memberships with Everything Included messaging." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://elevatedhealthaugusta.com/pricing" />
        <meta property="og:image" content="https://elevatedhealthaugusta.com/og-image.jpg" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Healthcare Pricing | Elevated Health Augusta" />
        <meta name="twitter:description" content="Transparent pricing. $79 Wellness Assessment. ELEVATED memberships." />
        <meta name="twitter:image" content="https://elevatedhealthaugusta.com/og-image.jpg" />
        
        {/* FAQ Schema for Rich Snippets */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Can I switch between programs?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Your health journey may evolve. You can discuss changing ELEVATED programs with your care team; terms depend on your active subscription and clinical appropriateness.",
                },
              },
              {
                "@type": "Question",
                "name": "What if I need to pause my membership?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Memberships are month-to-month with cancellation notice per your patient agreement. Ask the front office about pausing if your circumstances change.",
                },
              },
              {
                "@type": "Question",
                "name": "Do you offer payment plans?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "We partner with Klarna and Affirm for eligible purchases at checkout. HSA and FSA cards may be used for many services; patients may also submit superbills for potential reimbursement.",
                },
              },
              {
                "@type": "Question",
                "name": "Is any of this covered by insurance?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Elevated Health Augusta is a cash-pay practice. We provide documentation so patients may self-submit to insurance or use HSA/FSA where permitted.",
                },
              },
              {
                "@type": "Question",
                "name": "What is included in an ELEVATED membership?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "ELEVATED program memberships include monthly medication where applicable to the program, monthly check-in with our clinical team, free quarterly labs at the clinic, clinically appropriate lab review and protocol adjustments, and unlimited messaging—one transparent monthly price. Initial Wellness Assessment and baseline labs are separate one-time onboarding fees.",
                },
              },
            ],
          })}
        </script>

        {/* Service Schema for Pricing Rich Snippets */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MedicalBusiness",
            name: SITE_CONFIG.clinicName,
            address: {
              "@type": "PostalAddress",
              streetAddress: SITE_CONFIG.address.line1,
              addressLocality: "Evans",
              addressRegion: "GA",
              postalCode: "30809",
            },
            telephone: SITE_CONFIG.phone,
            hasOfferCatalog: structuredOfferCatalog,
          })}
        </script>
      </Helmet>

      <Navbar />

      <main id="main-content" className="min-h-screen bg-background">

        {/* Hero Section - Reduced padding */}
        <section className="relative py-16 lg:py-20 bg-gradient-to-b from-secondary to-background">
          <div className="container mx-auto px-4 text-center">
            <Badge variant="outline" className="mb-6 px-4 py-1.5 border-gold/30 text-gold font-lato">
              Transparent Pricing
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-cormorant text-foreground mb-6">
              Investment in Your <span className="text-gold">Wellness</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 font-lato">
              No hidden fees. No surprise bills. Just honest pricing for 
              transformative healthcare that fits your life and budget.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-10">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-5 h-5 text-gold" />
                <span>Insurance Options</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-5 h-5 text-gold" />
                <span>Cancel Anytime</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BadgeCheck className="w-5 h-5 text-gold" />
                <span>Board-Certified Providers</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="w-5 h-5 text-gold" />
                <span>Pay in 4 with Klarna/Affirm</span>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-6">
              {serviceCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-lato transition-all duration-300 ${
                    activeCategory === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border hover:border-gold/50 text-foreground"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Pricing Comparison CTA */}
            <Link 
              to="/pricing-comparison" 
              className="inline-flex items-center gap-2 text-sm text-gold hover:text-gold/80 transition-colors"
            >
              <span>Compare Membership vs. À La Carte Pricing</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        <section className="py-14 bg-muted/10 border-y border-border">
          <div className="container mx-auto px-4 max-w-6xl">
            <EverythingIncludedPillars className="border-0 bg-transparent shadow-none mb-12" />
            <div className="text-center mb-10">
              <p className="section-label mb-2">ELEVATED Programs</p>
              <h2 className="font-playfair text-3xl md:text-4xl text-foreground mb-3">
                One monthly price. Everything that matters.
              </h2>
              <p className="text-muted-foreground font-jost text-sm max-w-2xl mx-auto leading-relaxed">
                Every new patient starts with a {CORE_SERVICES.wellnessAssessment.displayPrice}{" "}
                {CORE_SERVICES.wellnessAssessment.name.toLowerCase()} and baseline labs (
                {CORE_SERVICES.comprehensivePanel.displayPrice} comprehensive panel, or{" "}
                {CORE_SERVICES.expandedPanel.displayPrice} expanded when clinically indicated). Then
                enroll in the ELEVATED program that matches your care plan.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(
                [
                  ["trt", "/hormones-men"],
                  ["hrt", "/hormones-women"],
                  ["glp1", "/weightloss"],
                  ["wellness", "/membership"],
                ] as const
              ).map(([key, href]) => {
                const p = ELEVATED_PROGRAMS[key];
                return (
                  <Card key={key} className="border-border flex flex-col">
                    <CardHeader className="pb-2">
                      <h3 className="font-playfair text-xl text-foreground">{p.name}</h3>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-grow pt-0">
                      <p className="text-3xl font-playfair text-foreground mb-4">{p.displayPrice}</p>
                      <p className="text-xs text-muted-foreground font-jost flex-grow mb-4 leading-relaxed">
                        Medication included where prescribed, monthly check-in with our clinical team, quarterly labs,
                        lab review when needed, unlimited messaging.
                      </p>
                      <Button variant="outline" asChild className="mt-auto rounded-full">
                        <Link to={href}>View program</Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Mental Wellness — no ketamine / esketamine services offered (Phase 3 may expand) */}
        {shouldShow("mental") && (
          <section className="py-12 lg:py-16 bg-background">
            <div className="container mx-auto px-4 max-w-3xl text-center">
              <div className="w-12 h-12 rounded-full bg-hope/10 flex items-center justify-center mx-auto mb-6">
                <Brain className="w-6 h-6 text-hope" />
              </div>
              <h2 className="text-2xl md:text-3xl font-cormorant text-foreground mb-4">
                Mental wellness
              </h2>
              <p className="text-muted-foreground font-lato text-sm leading-relaxed">
                IV ketamine and SPRAVATO® (esketamine) are not offered at Elevated Health Augusta. If
                you are working with depression or anxiety, our clinicians can discuss evidence-based
                options within our active service lines—such as medical weight loss, hormone
                optimization, IV hydration, and primary care coordination. Call{" "}
                <a className="text-accent underline-offset-4 hover:underline" href={`tel:+1${SITE_CONFIG.phoneRaw}`}>
                  {SITE_CONFIG.phone}
                </a>{" "}
                to learn more.
              </p>
            </div>
          </section>
        )}

        {/* Weight Loss Section - Vertical Stepper Journey */}
        {shouldShow("weight") && (
          <section className="py-12 lg:py-16 bg-slate-50">
            <div className="container mx-auto px-4">
              {/* Section Header */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 mb-4">
                  <Scale className="w-6 h-6 text-amber-600" />
                  <span className="text-sm font-lato uppercase tracking-widest text-slate-500">Medical Weight Loss</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-cormorant text-slate-900 mb-3">
                  Your Path to Metabolic Reset
                </h2>
                <p className="text-slate-600 font-lato max-w-2xl mx-auto">
                  A medically-supervised journey with clear milestones. Each step unlocks the next.
                </p>
              </div>

              {/* Vertical Stepper */}
              <div className="max-w-2xl mx-auto">
                {/* Step 1: The Gatekeeper */}
                <div className="relative">
                  <Card className="bg-white rounded-2xl border-0 shadow-lg hover:shadow-xl transition-shadow p-8">
                    <div className="flex items-start gap-6">
                      {/* Step Number & Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 rounded-full bg-amber-600 flex items-center justify-center shadow-md">
                          <Stethoscope className="w-7 h-7 text-white stroke-[1.5]" />
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-grow">
                        <Badge className="bg-slate-100 text-slate-700 font-lato text-xs mb-3">
                          Step 1: Clinical Intake
                        </Badge>
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-cormorant text-slate-900 mb-2">
                              {CORE_SERVICES.wellnessAssessment.name}
                            </h3>
                            <p className="text-slate-600 font-lato text-sm leading-relaxed">
                              Meet with our clinical team for an in-office intake. The{" "}
                              {CORE_SERVICES.wellnessAssessment.displayPrice} fee covers your visit;
                              labs and program enrollment are priced separately and shown upfront.
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-3xl font-cormorant text-slate-900">
                              {CORE_SERVICES.wellnessAssessment.displayPrice}
                            </span>
                            <span className="block text-xs text-slate-500 font-lato">one-time</span>
                          </div>
                        </div>
                        <Button 
                          className="mt-6 bg-amber-600 hover:bg-amber-700 text-white rounded-full px-8"
                          onClick={openBooking}
                        >
                          Book {CORE_SERVICES.wellnessAssessment.displayPrice} Wellness Assessment
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                  
                  {/* Connector Line */}
                  <div className="absolute left-[2.25rem] top-full w-0.5 h-8 bg-gradient-to-b from-amber-500 to-slate-300" />
                </div>

                {/* Step 2: Medical Clearance */}
                <div className="relative mt-8">
                  <Card className="bg-white rounded-2xl border-0 shadow-md hover:shadow-lg transition-shadow p-8 opacity-95">
                    <div className="flex items-start gap-6">
                      {/* Step Number & Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center">
                          <Shield className="w-7 h-7 text-slate-600 stroke-[1.5]" />
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-grow">
                        <Badge className="bg-green-100 text-green-700 font-lato text-xs mb-3">
                          Step 2: Medical Clearance
                        </Badge>
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-cormorant text-slate-900 mb-2">
                              Provider Review
                            </h3>
                            <p className="text-slate-600 font-lato text-sm leading-relaxed">
                              Your provider reviews your eligibility and may request recent labs from your PCP if needed. Most patients are cleared to start during their consultation.
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-2xl font-cormorant text-green-600">Included</span>
                            <span className="block text-xs text-slate-500 font-lato">no extra cost</span>
                          </div>
                        </div>
                        <p className="mt-4 text-xs text-green-600 font-lato flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Labs NOT required to start — most patients begin same week
                        </p>
                      </div>
                    </div>
                  </Card>
                  
                  {/* Connector Line */}
                  <div className="absolute left-[2.25rem] top-full w-0.5 h-8 bg-gradient-to-b from-slate-300 to-amber-500" />
                </div>

                {/* Step 3: The Transformation */}
                <div className="relative mt-8">
                  <Card className="bg-white rounded-2xl border-2 border-amber-500 shadow-lg hover:shadow-xl transition-shadow p-8">
                    <div className="absolute -top-3 right-6">
                      <Badge className="bg-amber-600 text-white font-lato text-xs">
                        Premium Membership
                      </Badge>
                    </div>
                    <div className="flex items-start gap-6">
                      {/* Step Number & Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-md">
                          <Sparkles className="w-7 h-7 text-white stroke-[1.5]" />
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-grow">
                        <Badge className="bg-amber-50 text-amber-700 font-lato text-xs mb-3">
                          Step 3: Treatment
                        </Badge>
                        <div className="flex flex-col gap-4">
                          <div>
                            <h3 className="text-xl font-cormorant text-slate-900 mb-2">
                              Metabolic Reset Membership
                            </h3>
                            <p className="text-slate-600 font-lato text-sm leading-relaxed">
                              Once medically cleared, you unlock the all-inclusive membership. Choose your GLP-1 medication with 24/7 provider access.
                            </p>
                          </div>
                          
                          {/* Medication Options */}
                          <div className="grid sm:grid-cols-2 gap-3 mt-2">
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                              <div className="flex items-center justify-between">
                                <span className="font-lato font-medium text-slate-800">Semaglutide</span>
                                <div className="text-right">
                                  <span className="text-xl font-cormorant text-slate-900">$399</span>
                                  <span className="text-xs text-slate-500 font-lato">/mo</span>
                                </div>
                              </div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                              <div className="flex items-center justify-between">
                                <span className="font-lato font-medium text-slate-800">Tirzepatide</span>
                                <div className="text-right">
                                  <span className="text-xl font-cormorant text-slate-900">$499</span>
                                  <span className="text-xs text-slate-500 font-lato">/mo</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Membership Benefits */}
                        <ul className="mt-6 space-y-2">
                          <li className="flex items-center gap-2 text-sm font-lato text-slate-700">
                            <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />
                            <span>GLP-1 medication, supplies & shipping included</span>
                          </li>
                          <li className="flex items-center gap-2 text-sm font-lato text-slate-700">
                            <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />
                            <span>Unlimited provider messaging</span>
                          </li>
                          <li className="flex items-center gap-2 text-sm font-lato text-slate-700">
                            <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />
                            <span>Dosing adjustments & ongoing supervision</span>
                          </li>
                        </ul>
                        
                        <div className="mt-6 p-3 bg-slate-50 rounded-lg flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-slate-500" />
                          <span className="text-xs text-slate-600 font-lato">
                            Requires Medical Clearance — Complete Steps 1 & 2 first
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Hormone Add-on */}
              <div className="max-w-2xl mx-auto mt-12 p-6 bg-white rounded-2xl border border-amber-200 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <Badge variant="outline" className="mb-2 border-amber-400 text-amber-700 font-lato text-xs">
                      Optional Add-on
                    </Badge>
                    <h4 className="font-cormorant text-lg text-slate-900">Hormone Optimization Bundle</h4>
                    <p className="text-sm text-slate-600 font-lato">
                      Add bio-identical hormones to accelerate results & preserve muscle
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-cormorant text-slate-900">+$149</span>
                    <span className="text-slate-500 font-lato">/month</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Hormone Optimization Section - Vertical Stepper */}
        {shouldShow("hormones") && (
          <section className="py-12 lg:py-16 bg-background">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-full bg-feminine/10 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-feminine" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-cormorant text-foreground">
                    Hormone Optimization
                  </h2>
                  <p className="text-muted-foreground font-lato text-sm">
                    Your path to hormonal balance
                  </p>
                </div>
              </div>

              {/* Vertical Stepper - Linear Journey */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  {/* STEP 1 - Wellness Assessment */}
                  <Card className="relative bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start gap-6">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-cormorant text-lg">
                          1
                        </div>
                      </div>
                      <div className="flex-1">
                        <Badge className="mb-3 bg-slate-100 text-slate-700 hover:bg-slate-100 font-lato text-xs">
                          Step 1: Clinical Intake
                        </Badge>
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-cormorant text-slate-900 mb-1">
                              {CORE_SERVICES.wellnessAssessment.name}
                            </h3>
                            <p className="text-sm text-slate-600 font-lato leading-relaxed">
                              In-office visit with our RN to review symptoms, history, and goals.
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-3xl font-cormorant text-slate-900">
                              {CORE_SERVICES.wellnessAssessment.displayPrice}
                            </span>
                            <p className="text-xs text-slate-500 font-lato">one-time</p>
                          </div>
                        </div>
                        <div className="mt-6 flex items-center gap-3">
                          <Stethoscope className="w-5 h-5 text-amber-600 stroke-[1.5]" />
                          <Button 
                            className="bg-amber-600 hover:bg-amber-700 text-white font-lato rounded-full px-6"
                            onClick={openBooking}
                          >
                            Book {CORE_SERVICES.wellnessAssessment.displayPrice} Wellness Assessment
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Connecting Line */}
                  <div className="flex justify-start ml-[1.4rem]">
                    <div className="w-0.5 h-8 bg-gradient-to-b from-amber-500 to-slate-300" />
                  </div>

                  {/* STEP 2 - Baseline labs */}
                  <Card className="relative bg-white rounded-2xl border border-slate-200 p-8 shadow-sm opacity-90">
                    <div className="flex items-start gap-6">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-cormorant text-lg">
                          2
                        </div>
                      </div>
                      <div className="flex-1">
                        <Badge variant="outline" className="mb-3 border-slate-300 text-slate-500 font-lato text-xs">
                          Step 2: Diagnostics
                        </Badge>
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-cormorant text-slate-900 mb-1">
                              {CORE_SERVICES.comprehensivePanel.name}
                            </h3>
                            <p className="text-sm text-slate-600 font-lato leading-relaxed">
                              Blood draw in our Evans office; processed through LabCorp. Expanded panels
                              available when clinically indicated ({CORE_SERVICES.expandedPanel.displayPrice}).
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-3xl font-cormorant text-slate-900">
                              {CORE_SERVICES.comprehensivePanel.displayPrice}
                            </span>
                            <p className="text-xs text-slate-500 font-lato">typical baseline</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Connecting Line */}
                  <div className="flex justify-start ml-[1.4rem]">
                    <div className="w-0.5 h-8 bg-gradient-to-b from-slate-300 to-amber-500" />
                  </div>

                  {/* STEP 3 - ELEVATED programs */}
                  <Card className="relative bg-white rounded-2xl border-2 border-amber-500 p-8 shadow-lg">
                    <div className="flex items-start gap-6">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-amber-600 text-white flex items-center justify-center font-cormorant text-lg">
                          3
                        </div>
                      </div>
                      <div className="flex-1">
                        <Badge className="mb-3 bg-amber-100 text-amber-800 hover:bg-amber-100 font-lato text-xs">
                          Step 3: ELEVATED membership
                        </Badge>
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-cormorant text-slate-900 mb-1">
                              {ELEVATED_PROGRAMS.trt.name} / {ELEVATED_PROGRAMS.hrt.name}
                            </h3>
                            <p className="text-sm text-slate-600 font-lato leading-relaxed">
                              Program memberships include hormone therapy where prescribed, monthly check-ins with our clinical team,
                              quarterly labs, clinically appropriate physician review, and
                              unlimited messaging—see men&apos;s and women&apos;s program pages for
                              details.
                            </p>
                          </div>
                          <div className="text-right shrink-0 space-y-1">
                            <span className="text-3xl font-cormorant text-slate-900 block">
                              {ELEVATED_PROGRAMS.hrt.displayPrice}
                            </span>
                            <p className="text-xs text-slate-500 font-lato">
                              {ELEVATED_PROGRAMS.trt.displayPrice} men&apos;s TRT
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" className="rounded-full" onClick={() => navigate("/hormones-men")}>
                            Men (TRT)
                          </Button>
                          <Button variant="outline" size="sm" className="rounded-full" onClick={() => navigate("/hormones-women")}>
                            Women (HRT)
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

              </div>

              {/* Gender-Specific Pages */}
              <div className="mt-12 max-w-2xl mx-auto grid md:grid-cols-2 gap-4">
                <Card className="border border-feminine/30 bg-feminine/5 hover:border-feminine/50 transition-all cursor-pointer" onClick={() => navigate("/hormones-women")}>
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-feminine/10 flex items-center justify-center">
                      <Heart className="w-6 h-6 text-feminine" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-cormorant text-lg text-foreground">Elevated+ for Her</h4>
                      <p className="text-sm text-muted-foreground font-lato">
                        Menopause, perimenopause & women's hormone health
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-feminine" />
                  </CardContent>
                </Card>

                <Card className="border border-masculine/30 bg-masculine/5 hover:border-masculine/50 transition-all cursor-pointer" onClick={() => navigate("/hormones-men")}>
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-masculine/10 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-masculine" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-cormorant text-lg text-foreground">Elevated+ for Him</h4>
                      <p className="text-sm text-muted-foreground font-lato">
                        Testosterone therapy, energy & performance
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-masculine" />
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        )}

        {/* Peptides Section - Expanded 5 Categories */}
        {shouldShow("peptides") && (
          <section className="py-12 lg:py-16 bg-secondary/30">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                  <Syringe className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-cormorant text-foreground">
                    Peptide Therapy
                  </h2>
                  <p className="text-muted-foreground font-lato text-sm">
                    5 categories • 15+ protocols • Cellular optimization & longevity
                  </p>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-2 mb-8">
                <Badge variant="outline" className="px-3 py-1 border-blue-500/30 text-blue-600">Growth & Recovery</Badge>
                <Badge variant="outline" className="px-3 py-1 border-amber-500/30 text-amber-600">Cellular Energy</Badge>
                <Badge variant="outline" className="px-3 py-1 border-pink-500/30 text-pink-600">Intimacy & Mood</Badge>
                <Badge variant="outline" className="px-3 py-1 border-green-500/30 text-green-600">Metabolic</Badge>
                <Badge variant="outline" className="px-3 py-1 border-purple-500/30 text-purple-600">Regeneration</Badge>
              </div>

              {/* Featured Peptides Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Sermorelin */}
                <Card className="border border-border hover:border-gold/30 transition-all hover:shadow-lg flex flex-col">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="w-fit text-blue-600 border-blue-500/30">
                        Growth & Recovery
                      </Badge>
                    </div>
                    <h3 className="text-xl font-cormorant text-foreground">Sermorelin</h3>
                    <p className="text-sm text-muted-foreground font-lato">
                      Stimulates natural growth hormone production
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-grow">
                    <div className="mb-2">
                      <span className="text-3xl font-cormorant text-foreground">$79</span>
                      <span className="text-muted-foreground font-lato">/month</span>
                    </div>
                    <p className="text-xs text-gold font-lato mb-4">
                      or 4 payments of $37 with Klarna
                    </p>
                    <ul className="space-y-2 mb-6 flex-grow">
                      <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                        <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        Improved sleep quality
                      </li>
                      <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                        <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        Enhanced recovery
                      </li>
                      <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                        <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        Reduced body fat
                      </li>
                    </ul>
                    <Button variant="outline" className="w-full mt-auto" onClick={() => navigate("/peptides")}>
                      Learn More
                    </Button>
                  </CardContent>
                </Card>

                {/* NAD+ */}
                <Card className="border border-border hover:border-gold/30 transition-all hover:shadow-lg flex flex-col">
                  <CardHeader className="pb-4">
                    <Badge variant="outline" className="w-fit text-amber-600 border-amber-500/30">
                      Cellular Energy
                    </Badge>
                    <h3 className="text-xl font-cormorant text-foreground">NAD+</h3>
                    <p className="text-sm text-muted-foreground font-lato">
                      Cellular energy & cognitive enhancement
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-grow">
                    <div className="mb-4">
                      <span className="text-xl font-cormorant text-foreground">Troches</span>
                      <span className="text-3xl font-cormorant text-foreground ml-2">$149</span>
                      <span className="text-muted-foreground font-lato">/mo</span>
                    </div>
                    <div className="mb-4 text-sm text-muted-foreground">
                      or Injections <span className="font-cormorant text-foreground text-lg">$199</span>/mo
                    </div>
                    <ul className="space-y-2 mb-6 flex-grow">
                      <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                        <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        Mental clarity & focus
                      </li>
                      <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                        <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        Anti-aging benefits
                      </li>
                    </ul>
                    <Button variant="outline" className="w-full mt-auto" onClick={() => navigate("/peptides")}>
                      Learn More
                    </Button>
                  </CardContent>
                </Card>

                {/* PT-141 + Oxytocin */}
                <Card className="border border-border hover:border-gold/30 transition-all hover:shadow-lg flex flex-col">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-fit text-pink-600 border-pink-500/30">
                        Intimacy & Mood
                      </Badge>
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/30 text-[10px]" variant="outline">
                        New
                      </Badge>
                    </div>
                    <h3 className="text-xl font-cormorant text-foreground">PT-141 & Oxytocin</h3>
                    <p className="text-sm text-muted-foreground font-lato">
                      Restore desire, connection & intimacy
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-grow">
                    <div className="mb-2">
                      <span className="text-xl font-cormorant text-foreground">PT-141</span>
                      <span className="text-3xl font-cormorant text-foreground ml-2">$225</span>
                      <span className="text-muted-foreground font-lato">/kit</span>
                    </div>
                    <div className="mb-4 text-sm text-muted-foreground">
                      Oxytocin from <span className="font-cormorant text-foreground text-lg">$79</span>
                    </div>
                    <ul className="space-y-2 mb-6 flex-grow">
                      <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                        <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        Works for men & women
                      </li>
                      <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                        <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        Anxiety & bonding support
                      </li>
                    </ul>
                    <Button variant="outline" className="w-full mt-auto" onClick={() => navigate("/peptides")}>
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* New Peptides Highlight */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border border-green-500/30 bg-green-500/5 hover:border-green-500/50 transition-all">
                  <CardContent className="p-4 text-center">
                    <Badge className="mb-2 bg-green-500/10 text-green-600 border-green-500/30" variant="outline">New</Badge>
                    <h4 className="font-cormorant text-lg text-foreground">5-Amino-1MQ</h4>
                    <p className="text-xs text-muted-foreground mb-2">Metabolic Enhancer</p>
                    <span className="text-xl font-cormorant text-foreground">$279/mo</span>
                  </CardContent>
                </Card>

                <Card className="border border-green-500/30 bg-green-500/5 hover:border-green-500/50 transition-all">
                  <CardContent className="p-4 text-center">
                    <Badge className="mb-2 bg-green-500/10 text-green-600 border-green-500/30" variant="outline">New</Badge>
                    <h4 className="font-cormorant text-lg text-foreground">GHK-Cu</h4>
                    <p className="text-xs text-muted-foreground mb-2">Regeneration & Repair</p>
                    <span className="text-xl font-cormorant text-foreground">From $149</span>
                  </CardContent>
                </Card>

                <Card className="border border-green-500/30 bg-green-500/5 hover:border-green-500/50 transition-all">
                  <CardContent className="p-4 text-center">
                    <Badge className="mb-2 bg-gold/10 text-gold border-gold/30" variant="outline">Premium</Badge>
                    <h4 className="font-cormorant text-lg text-foreground">Tesamorelin</h4>
                    <p className="text-xs text-muted-foreground mb-2">Advanced GH Release</p>
                    <span className="text-xl font-cormorant text-foreground">$399/mo</span>
                  </CardContent>
                </Card>

                <Card className="border border-purple-500/30 bg-purple-500/5 hover:border-purple-500/50 transition-all">
                  <CardContent className="p-4 text-center">
                    <Badge className="mb-2 bg-purple-500/10 text-purple-600 border-purple-500/30" variant="outline">Advanced</Badge>
                    <h4 className="font-cormorant text-lg text-foreground">Tesofensine</h4>
                    <p className="text-xs text-muted-foreground mb-2">Appetite & Energy</p>
                    <span className="text-xl font-cormorant text-foreground">$249/mo</span>
                  </CardContent>
                </Card>
              </div>

              {/* View All CTA */}
              <div className="text-center mt-8">
                <Button 
                  className="bg-gold hover:bg-gold-dark text-white rounded-full px-8"
                  onClick={() => navigate("/peptides")}
                >
                  View All 15+ Peptide Protocols
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* IV Lounge Section - Reduced padding + clickable cards */}
        {shouldShow("iv") && (
          <section className="py-12 lg:py-16 bg-background">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-full bg-hope/10 flex items-center justify-center">
                  <Droplets className="w-6 h-6 text-hope" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-cormorant text-foreground">
                    IV Hydration Lounge
                  </h2>
                  <p className="text-muted-foreground font-lato text-sm">
                    Walk-ins welcome • No membership required
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { name: "The Meyers", price: "$149", desc: "Classic vitamin infusion" },
                  { name: "The Shield", price: "$179", desc: "Immunity boost" },
                  { name: "The Glow", price: "$169", desc: "Beauty & skin hydration" },
                  { name: "The Resurrection", price: "$169", desc: "Hangover recovery" },
                  { name: "Beast Mode", price: "$189", desc: "Athletic recovery" },
                ].map((drip) => (
                  <Card 
                    key={drip.name} 
                    className="border border-border hover:border-gold/30 transition-all text-center cursor-pointer hover:shadow-lg"
                    onClick={() => navigate("/iv-lounge")}
                  >
                    <CardContent className="p-5">
                      <Droplets className="w-8 h-8 text-hope mx-auto mb-3" />
                      <h4 className="font-cormorant text-lg text-foreground mb-1">{drip.name}</h4>
                      <p className="text-xs text-muted-foreground font-lato mb-3">{drip.desc}</p>
                      <span className="text-2xl font-cormorant text-foreground">{drip.price}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs text-gold font-lato mb-2">
                  Pay in 4 interest-free payments with Klarna at checkout
                </p>
                <p className="text-sm text-muted-foreground font-lato mb-4">
                  Add-ons: <span className="text-foreground">B12 $25</span> • <span className="text-foreground">Glutathione $35</span> • <span className="text-foreground">NAD+ Booster $50</span>
                </p>
                <Button variant="outline" onClick={() => navigate("/iv-lounge")}>
                  View Full IV Menu <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Hair Restoration Section */}
        {shouldShow("hair") && (
          <section className="py-12 lg:py-16 bg-secondary/30">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                  <Scissors className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-cormorant text-foreground">
                    Hair Restoration
                  </h2>
                  <p className="text-muted-foreground font-lato text-sm">
                    Clinically proven treatments for hair loss & thinning
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Minoxidil + Finasteride */}
                <Card className="border border-border hover:border-gold/30 transition-all hover:shadow-lg flex flex-col">
                  <CardHeader className="pb-4">
                    <Badge variant="outline" className="w-fit text-gold border-gold/30">
                      Most Popular
                    </Badge>
                    <h3 className="text-xl font-cormorant text-foreground">Minoxidil + Finasteride</h3>
                    <p className="text-sm text-muted-foreground font-lato">
                      Topical combination therapy for hair regrowth
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-grow">
                    <div className="mb-2">
                      <span className="text-3xl font-cormorant text-foreground">$129</span>
                      <span className="text-muted-foreground font-lato">/month</span>
                    </div>
                    <p className="text-xs text-gold font-lato mb-4">
                      or 4 payments of $32 with Klarna
                    </p>
                    <ul className="space-y-2 mb-6 flex-grow">
                      <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                        <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        FDA-approved ingredients
                      </li>
                      <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                        <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        Blocks DHT & stimulates growth
                      </li>
                      <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                        <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        Easy topical application
                      </li>
                    </ul>
                    <Button variant="outline" className="w-full mt-auto" onClick={openBooking}>
                      Book Consultation
                    </Button>
                  </CardContent>
                </Card>

                {/* Dutasteride */}
                <Card className="border border-border hover:border-gold/30 transition-all hover:shadow-lg flex flex-col">
                  <CardHeader className="pb-4">
                    <Badge variant="outline" className="w-fit text-muted-foreground">
                      Advanced Option
                    </Badge>
                    <h3 className="text-xl font-cormorant text-foreground">Dutasteride</h3>
                    <p className="text-sm text-muted-foreground font-lato">
                      Stronger DHT blocker for stubborn hair loss
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-grow">
                    <div className="mb-2">
                      <span className="text-3xl font-cormorant text-foreground">$149</span>
                      <span className="text-muted-foreground font-lato">/month</span>
                    </div>
                    <p className="text-xs text-gold font-lato mb-4">
                      or 4 payments of $37 with Klarna
                    </p>
                    <ul className="space-y-2 mb-6 flex-grow">
                      <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                        <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        More potent than Finasteride
                      </li>
                      <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                        <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        For advanced hair loss
                      </li>
                      <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                        <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        Once daily oral medication
                      </li>
                    </ul>
                    <Button variant="outline" className="w-full mt-auto" onClick={openBooking}>
                      Book Consultation
                    </Button>
                  </CardContent>
                </Card>

                {/* GHK-Cu Scalp Therapy */}
                <Card className="border border-border hover:border-gold/30 transition-all hover:shadow-lg flex flex-col">
                  <CardHeader className="pb-4">
                    <Badge variant="outline" className="w-fit text-purple-600 border-purple-500/30">
                      Peptide Therapy
                    </Badge>
                    <h3 className="text-xl font-cormorant text-foreground">GHK-Cu Scalp Therapy</h3>
                    <p className="text-sm text-muted-foreground font-lato">
                      Copper peptide for scalp rejuvenation
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-grow">
                    <div className="mb-2">
                      <span className="text-3xl font-cormorant text-foreground">$149</span>
                      <span className="text-muted-foreground font-lato"> one-time</span>
                    </div>
                    <p className="text-xs text-gold font-lato mb-4">
                      or 4 payments of $25 with Klarna
                    </p>
                    <ul className="space-y-2 mb-6 flex-grow">
                      <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                        <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        Promotes hair follicle health
                      </li>
                      <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                        <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        Improves scalp circulation
                      </li>
                      <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                        <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        Works with other treatments
                      </li>
                    </ul>
                    <Button variant="outline" className="w-full mt-auto" onClick={openBooking}>
                      Book Consultation
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-8 text-center">
                <Button onClick={() => navigate("/hair-restoration")}>
                  View Hair Restoration Details <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Sexual Wellness Section */}
        {shouldShow("sexual") && (
          <section className="py-12 lg:py-16 bg-background">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center">
                  <HeartPulse className="w-6 h-6 text-pink-500" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-cormorant text-foreground">
                    Sexual Wellness
                  </h2>
                  <p className="text-muted-foreground font-lato text-sm">
                    Restore intimacy, desire & confidence
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Tadalafil */}
                <Card className="border border-border hover:border-gold/30 transition-all hover:shadow-lg flex flex-col">
                  <CardHeader className="pb-4">
                    <Badge variant="outline" className="w-fit text-blue-600 border-blue-500/30">
                      Men's Health
                    </Badge>
                    <h3 className="text-xl font-cormorant text-foreground">Tadalafil</h3>
                    <p className="text-sm text-muted-foreground font-lato">
                      Generic Cialis for ED treatment
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-grow">
                    <div className="mb-2">
                      <span className="text-3xl font-cormorant text-foreground">$149</span>
                      <span className="text-muted-foreground font-lato">/month</span>
                    </div>
                    <ul className="space-y-2 mb-6 flex-grow">
                      <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                        <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        Daily or as-needed dosing
                      </li>
                      <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                        <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        36-hour effectiveness
                      </li>
                    </ul>
                    <Button variant="outline" className="w-full mt-auto" onClick={openBooking}>
                      Book Consultation
                    </Button>
                  </CardContent>
                </Card>

                {/* Sildenafil */}
                <Card className="border border-border hover:border-gold/30 transition-all hover:shadow-lg flex flex-col">
                  <CardHeader className="pb-4">
                    <Badge variant="outline" className="w-fit text-blue-600 border-blue-500/30">
                      Men's Health
                    </Badge>
                    <h3 className="text-xl font-cormorant text-foreground">Sildenafil</h3>
                    <p className="text-sm text-muted-foreground font-lato">
                      Generic Viagra for ED treatment
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-grow">
                    <div className="mb-2">
                      <span className="text-3xl font-cormorant text-foreground">$79</span>
                      <span className="text-muted-foreground font-lato">/month</span>
                    </div>
                    <ul className="space-y-2 mb-6 flex-grow">
                      <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                        <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        Fast-acting formula
                      </li>
                      <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                        <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        4-6 hour effectiveness
                      </li>
                    </ul>
                    <Button variant="outline" className="w-full mt-auto" onClick={openBooking}>
                      Book Consultation
                    </Button>
                  </CardContent>
                </Card>

                {/* PT-141 */}
                <Card className="border border-border hover:border-gold/30 transition-all hover:shadow-lg flex flex-col">
                  <CardHeader className="pb-4">
                    <Badge variant="outline" className="w-fit text-pink-600 border-pink-500/30">
                      For All
                    </Badge>
                    <h3 className="text-xl font-cormorant text-foreground">PT-141</h3>
                    <p className="text-sm text-muted-foreground font-lato">
                      Peptide for desire & arousal
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-grow">
                    <div className="mb-2">
                      <span className="text-3xl font-cormorant text-foreground">$225</span>
                      <span className="text-muted-foreground font-lato">/kit</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">10-dose kit</p>
                    <ul className="space-y-2 mb-6 flex-grow">
                      <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                        <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        Works on brain chemistry
                      </li>
                      <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                        <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        For men and women
                      </li>
                    </ul>
                    <Button variant="outline" className="w-full mt-auto" onClick={openBooking}>
                      Book Consultation
                    </Button>
                  </CardContent>
                </Card>

                {/* Oxytocin */}
                <Card className="border border-border hover:border-gold/30 transition-all hover:shadow-lg flex flex-col">
                  <CardHeader className="pb-4">
                    <Badge variant="outline" className="w-fit text-pink-600 border-pink-500/30">
                      For All
                    </Badge>
                    <h3 className="text-xl font-cormorant text-foreground">Oxytocin Nasal Spray</h3>
                    <p className="text-sm text-muted-foreground font-lato">
                      Bonding & connection enhancement
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-grow">
                    <div className="mb-2">
                      <span className="text-3xl font-cormorant text-foreground">$89</span>
                      <span className="text-muted-foreground font-lato">/month</span>
                    </div>
                    <ul className="space-y-2 mb-6 flex-grow">
                      <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                        <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        Enhances emotional bonding
                      </li>
                      <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                        <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        Easy nasal administration
                      </li>
                    </ul>
                    <Button variant="outline" className="w-full mt-auto" onClick={openBooking}>
                      Book Consultation
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-8 text-center">
                <Button onClick={() => navigate("/sexual-wellness")}>
                  View Sexual Wellness Details <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* À La Carte Pricing Section */}
        <section className="py-12 lg:py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-4 px-4 py-1.5 border-gold/30 text-gold font-lato">
                No Membership Required
              </Badge>
              <h2 className="text-3xl md:text-4xl font-cormorant text-foreground mb-4">
                À La Carte Pricing
              </h2>
              <p className="text-lg text-muted-foreground font-lato max-w-2xl mx-auto">
                Need individual medications without a membership? We offer pay-as-you-go options 
                for patients who prefer flexibility over commitment.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Card className="border border-border hover:border-gold/30 transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="text-masculine border-masculine/30">
                      Men&apos;s TRT fill
                    </Badge>
                  </div>
                  <h3 className="text-xl font-cormorant text-foreground mb-1">{MEDICATION_FILLS.testosterone.name}</h3>
                  <p className="text-sm text-muted-foreground font-lato mb-4">
                    Non-member single fill (medication included in {ELEVATED_PROGRAMS.trt.name})
                  </p>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-cormorant text-foreground">
                      {MEDICATION_FILLS.testosterone.displayPrice}
                    </span>
                    <span className="text-sm text-muted-foreground">one-time</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border hover:border-gold/30 transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="text-feminine border-feminine/30">
                      Women&apos;s HRT fill
                    </Badge>
                  </div>
                  <h3 className="text-xl font-cormorant text-foreground mb-1">{MEDICATION_FILLS.biEst.name}</h3>
                  <p className="text-sm text-muted-foreground font-lato mb-4">
                    Non-member single fill (included in {ELEVATED_PROGRAMS.hrt.name})
                  </p>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-cormorant text-foreground">
                      {MEDICATION_FILLS.biEst.displayPrice}
                    </span>
                    <span className="text-sm text-muted-foreground">one-time</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border hover:border-gold/30 transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="text-feminine border-feminine/30">
                      Women&apos;s HRT fill
                    </Badge>
                  </div>
                  <h3 className="text-xl font-cormorant text-foreground mb-1">{MEDICATION_FILLS.progesterone.name}</h3>
                  <p className="text-sm text-muted-foreground font-lato mb-4">
                    Non-member single fill (included in {ELEVATED_PROGRAMS.hrt.name})
                  </p>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-cormorant text-foreground">
                      {MEDICATION_FILLS.progesterone.displayPrice}
                    </span>
                    <span className="text-sm text-muted-foreground">one-time</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border hover:border-gold/30 transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <Badge variant="outline" className="text-muted-foreground mb-4">
                    Physician escalation
                  </Badge>
                  <h3 className="text-xl font-cormorant text-foreground mb-1">{CORE_SERVICES.medicalReview.name}</h3>
                  <p className="text-sm text-muted-foreground font-lato mb-4">
                    Patient-requested extended consults beyond standard program care.
                  </p>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-cormorant text-foreground">
                      {CORE_SERVICES.medicalReview.displayPrice}
                    </span>
                    <span className="text-sm text-muted-foreground">one-time</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border hover:border-gold/30 transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <Badge variant="outline" className="text-muted-foreground mb-4">
                    Diagnostics
                  </Badge>
                  <h3 className="text-xl font-cormorant text-foreground mb-1">{CORE_SERVICES.comprehensivePanel.name}</h3>
                  <p className="text-sm text-muted-foreground font-lato mb-4">
                    In-office LabCorp draw; quarterly panels included in active ELEVATED memberships.
                  </p>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-cormorant text-foreground">
                      {CORE_SERVICES.comprehensivePanel.displayPrice}
                    </span>
                    <span className="text-sm text-muted-foreground">one-time</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-gold bg-gold/5 hover:bg-gold/10 transition-all">
                <CardContent className="p-6 flex flex-col h-full justify-center text-center">
                  <Sparkles className="w-8 h-8 text-gold mx-auto mb-4" />
                  <h3 className="text-xl font-cormorant text-foreground mb-2">Compare programs</h3>
                  <p className="text-sm text-muted-foreground font-lato mb-4">
                    See non-member vs. ELEVATED member economics for TRT, HRT, GLP-1, and Wellness.
                  </p>
                  <Button 
                    className="bg-gold hover:bg-gold-dark text-gold-foreground w-full"
                    onClick={() => navigate("/pricing-comparison")}
                  >
                    Open pricing comparison
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="mt-10 max-w-4xl mx-auto bg-card rounded-xl border border-border p-6 text-center">
              <p className="font-lato text-sm text-muted-foreground">
                ELEVATED members receive {MEMBER_DISCOUNT_PERCENT}% off eligible à la carte IV, peptide, and injectable
                services where checkout supports the discount. Program medications are included in TRT, HRT, and GLP-1
                memberships—not billed separately.
              </p>
            </div>
          </div>
        </section>

        {/* Dedicated Financing Section - Reduced padding + stronger borders */}
        <section className="py-12 lg:py-16 bg-gradient-to-b from-[#F5E6D3]/30 to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <Badge variant="outline" className="mb-4 px-4 py-1.5 border-gold/30 text-gold font-lato">
                  Flexible Financing
                </Badge>
                <h2 className="text-3xl md:text-4xl font-cormorant text-foreground mb-4">
                  Don't Let Cost Be a Barrier
                </h2>
                <p className="text-lg text-muted-foreground font-lato max-w-2xl mx-auto">
                  We've partnered with trusted financing providers to make your wellness journey accessible.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-10">
                {/* Klarna Card - Strengthened border */}
                <Card className="border-2 border-[#FFB3C7]/50 bg-gradient-to-br from-[#FFB3C7]/5 to-transparent">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="px-4 py-2 bg-[#FFB3C7]/20 rounded-lg">
                        <span className="font-bold text-lg text-[#E91E8A]">Klarna</span>
                      </div>
                      <Badge variant="outline" className="text-xs">Interest-Free</Badge>
                    </div>
                    <h3 className="font-cormorant text-xl text-foreground mb-2">Pay in 4</h3>
                    <p className="text-muted-foreground font-lato text-sm mb-4">
                      Split your purchase into 4 interest-free payments, paid every 2 weeks. No impact on credit score.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm font-lato text-foreground">
                        <Check className="w-4 h-4 text-gold" />
                        Approved in seconds at checkout
                      </li>
                      <li className="flex items-center gap-2 text-sm font-lato text-foreground">
                        <Check className="w-4 h-4 text-gold" />
                        0% interest, no fees if paid on time
                      </li>
                      <li className="flex items-center gap-2 text-sm font-lato text-foreground">
                        <Check className="w-4 h-4 text-gold" />
                        Soft credit check only
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Affirm Card - Strengthened border */}
                <Card className="border-2 border-[#0FA0EA]/50 bg-gradient-to-br from-[#0FA0EA]/5 to-transparent">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="px-4 py-2 bg-[#0FA0EA]/10 rounded-lg">
                        <span className="font-bold text-lg text-[#0FA0EA]">affirm</span>
                      </div>
                      <Badge variant="outline" className="text-xs">Monthly Plans</Badge>
                    </div>
                    <h3 className="font-cormorant text-xl text-foreground mb-2">Pay Over Time</h3>
                    <p className="text-muted-foreground font-lato text-sm mb-4">
                      Choose monthly payments from 3-36 months. Know your rate upfront—no hidden fees, ever.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm font-lato text-foreground">
                        <Check className="w-4 h-4 text-gold" />
                        Plans from 3 to 36 months
                      </li>
                      <li className="flex items-center gap-2 text-sm font-lato text-foreground">
                        <Check className="w-4 h-4 text-gold" />
                        Rates as low as 0% APR
                      </li>
                      <li className="flex items-center gap-2 text-sm font-lato text-foreground">
                        <Check className="w-4 h-4 text-gold" />
                        No prepayment penalties
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-secondary/50 rounded-xl p-6 border border-border">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                      <BadgeCheck className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <h4 className="font-cormorant text-lg text-foreground">HSA/FSA Accepted</h4>
                      <p className="text-sm text-muted-foreground font-lato">
                        Use your pre-tax health savings for most of our services
                      </p>
                    </div>
                  </div>
                  <Link to="/affordability" className="text-gold hover:text-gold-dark font-lato text-sm flex items-center gap-1">
                    View all payment options <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Reduced padding */}
        <section className="py-16 lg:py-20 bg-gradient-to-b from-secondary to-background">
          <div className="container mx-auto px-4 text-center">
            <Sparkles className="w-10 h-10 text-gold mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-cormorant text-foreground mb-4">
              Not Sure Where to Start?
            </h2>
            <p className="text-lg text-muted-foreground font-lato max-w-2xl mx-auto mb-4">
              Chat with our <span className="font-semibold text-foreground">Virtual Care Team</span> for instant answers about pricing, insurance, and logistics—24/7.
            </p>
            <p className="text-sm text-muted-foreground font-lato max-w-xl mx-auto mb-8 italic">
              When you&apos;re ready for personalized medical guidance, book a{" "}
              {CORE_SERVICES.wellnessAssessment.displayPrice} {CORE_SERVICES.wellnessAssessment.name}. Optional{" "}
              {CORE_SERVICES.medicalReview.displayPrice} medical review visits are available when clinically appropriate.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={() => {
                  const chatButton = document.querySelector('[aria-label="Open assistant"]');
                  if (chatButton) (chatButton as HTMLButtonElement).click();
                }}
              >
                <span className="inline-flex items-center gap-2 bg-green-500/20 text-green-600 text-xs font-semibold px-2 py-0.5 rounded-full mr-2">
                  FREE
                </span>
                <MessageCircle className="w-5 h-5 mr-2" />
                Chat with Virtual Care Team
              </Button>
              <Button 
                size="lg" 
                className="bg-gold hover:bg-gold-dark text-gold-foreground"
                onClick={openBooking}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book $79 Wellness Assessment
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ Section - Reduced padding + improved accordion spacing */}
        <section className="py-12 lg:py-16 bg-background">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-cormorant text-foreground text-center mb-10">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="border border-border rounded-lg px-6 py-1">
                <AccordionTrigger className="text-left font-cormorant text-lg hover:no-underline py-4">
                  Can I switch between programs?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-lato pb-4">
                  Absolutely! Your health journey may evolve, and we're here to adapt with you. 
                  You can upgrade, downgrade, or switch programs at any time. Just message your 
                  provider and we'll adjust your plan.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border border-border rounded-lg px-6 py-1">
                <AccordionTrigger className="text-left font-cormorant text-lg hover:no-underline py-4">
                  What if I need to pause my membership?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-lato pb-4">
                  Life happens! You can pause your membership for up to 3 months without 
                  losing your spot. Just let us know at least 5 days before your next 
                  billing date.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border border-border rounded-lg px-6 py-1">
                <AccordionTrigger className="text-left font-cormorant text-lg hover:no-underline py-4">
                  Do you offer payment plans?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-lato pb-4">
                  Yes. Larger packages may qualify for installment plans at checkout through Klarna or Affirm. Ask
                  the front office if you need help choosing an option.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border border-border rounded-lg px-6 py-1">
                <AccordionTrigger className="text-left font-cormorant text-lg hover:no-underline py-4">
                  Is any of this covered by insurance?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-lato pb-4">
                  Elevated Health Augusta is cash-pay. We provide superbills for potential out-of-network reimbursement
                  and accept many HSA/FSA cards. Coverage varies by plan.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border border-border rounded-lg px-6 py-1">
                <AccordionTrigger className="text-left font-cormorant text-lg hover:no-underline py-4">
                  What's included in the à la carte consultations?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-lato pb-4">
                  {CORE_SERVICES.wellnessAssessment.displayPrice} visits include history, goals, vitals, and a written
                  plan recommendation. Labs and program fees are quoted separately before you commit—no hidden bundles.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Trust Footer */}
        <section className="py-12 bg-secondary/50 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-5 h-5 text-gold" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BadgeCheck className="w-5 h-5 text-gold" />
                <span>Board-Certified Providers</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="w-5 h-5 text-gold" />
                <span>LabCorp in-office diagnostics</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-gold text-gold-foreground shadow-lg hover:bg-gold-dark transition-all duration-300 flex items-center justify-center"
          aria-label="Back to top"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
    </>
  );
};

export default Pricing;

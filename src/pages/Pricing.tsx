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

// All services now use the single Clinical Strategy Session calendar
const serviceBookingUrls: Record<string, string> = {
  mental: SITE_CONFIG.bookingUrl,
  weight: SITE_CONFIG.bookingUrl,
  hormones: SITE_CONFIG.bookingUrl,
  default: SITE_CONFIG.bookingUrl,
};

const Pricing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "all");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const navigate = useNavigate();

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

  const handleBookCall = (service?: string) => {
    const url = service ? serviceBookingUrls[service] || serviceBookingUrls.default : serviceBookingUrls.default;
    window.open(url, "_blank");
  };

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

  return (
    <>
      <Helmet>
        <title>Pricing - Transparent Healthcare Pricing | Elevated Health Augusta</title>
        <meta
          name="description"
          content="Transparent pricing for all services. $99 medical consultation credited toward treatment. Chat with our Virtual Care Team 24/7. Memberships and à la carte options available."
        />
        <meta
          name="keywords"
          content="ketamine therapy pricing Augusta, weight loss program cost, hormone therapy pricing, IV therapy prices, medical spa pricing Georgia"
        />
        <link rel="canonical" href="https://elevatedhealthaugusta.com/pricing" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Transparent Healthcare Pricing | $99 Consultation Credited | Elevated Health Augusta" />
        <meta property="og:description" content="Transparent pricing for all services. $99 medical consultation credited toward treatment. Chat with our Virtual Care Team 24/7." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://elevatedhealthaugusta.com/pricing" />
        <meta property="og:image" content="https://elevatedhealthaugusta.com/og-image.jpg" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Healthcare Pricing | $99 Consultation Credited" />
        <meta name="twitter:description" content="Transparent pricing. $99 medical consultation credited toward treatment. Chat with our Virtual Care Team 24/7." />
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
                  "text": "Absolutely! Your health journey may evolve, and we're here to adapt with you. You can upgrade, downgrade, or switch programs at any time. Just message your provider and we'll adjust your plan—no penalties or waiting periods."
                }
              },
              {
                "@type": "Question",
                "name": "What if I need to pause my membership?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Life happens. You can pause your membership for up to 3 months without losing your rate or benefits. When you're ready to resume, everything picks up right where you left off."
                }
              },
              {
                "@type": "Question",
                "name": "Do you offer payment plans?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! We've partnered with Klarna and Affirm to offer flexible financing options. At checkout, you can choose to split your payment into 4 interest-free installments or select monthly financing up to 36 months. Approval takes seconds and won't affect your credit score for the soft check. We also accept HSA/FSA cards for most services."
                }
              },
              {
                "@type": "Question",
                "name": "Is any of this covered by insurance?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "SPRAVATO® (esketamine) is typically covered by most major insurance plans including BCBS and TRICARE. We verify your benefits before treatment. For other services, we provide detailed superbills for potential out-of-network reimbursement. Many HSA/FSA plans cover our treatments."
                }
              },
              {
                "@type": "Question",
                "name": "What's included in the membership vs. paying per visit?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Memberships include medication, quarterly lab testing, unlimited provider messaging, weekly check-ins, and priority scheduling. Per-visit pricing covers just that single service. Most patients save 30-40% annually with membership compared to à la carte pricing."
                }
              },
              {
                "@type": "Question",
                "name": "How much does ketamine therapy cost in Augusta, GA?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "At Elevated Health Augusta, IV ketamine therapy is $400 per session, or $2,200 for a 6-session series (saving $200). SPRAVATO® (esketamine) is often covered by insurance with $0-50 copays. We also offer an optional Neurotransmitter Analysis for $399 to optimize your treatment."
                }
              },
              {
                "@type": "Question",
                "name": "What is the cheapest way to get started at Elevated Health?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The most affordable entry point is chatting with our Virtual Care Team—available 24/7 to answer questions about pricing, insurance, and logistics. When you're ready for personalized medical guidance, our $99 Medical Consultation provides a comprehensive clinical assessment and the fee is credited toward your first treatment."
                }
              },
              {
                "@type": "Question",
                "name": "Can I use my HSA or FSA for treatment?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! Most of our services qualify for HSA (Health Savings Account) and FSA (Flexible Spending Account) payment. This includes ketamine therapy, hormone optimization, medical weight loss, and peptide therapy. We provide all necessary documentation for your records."
                }
              }
            ]
          })}
        </script>

        {/* Service Schema for Pricing Rich Snippets */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MedicalBusiness",
            "name": SITE_CONFIG.clinicName,
            "address": {
              "@type": "PostalAddress",
              "streetAddress": SITE_CONFIG.address.line1,
              "addressLocality": "Evans",
              "addressRegion": "GA",
              "postalCode": "30809"
            },
            "telephone": SITE_CONFIG.phone,
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Healthcare Services",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "MedicalProcedure",
                    "name": "IV Ketamine Therapy Session",
                    "procedureType": "Therapeutic"
                  },
                  "price": "400",
                  "priceCurrency": "USD",
                  "priceValidUntil": "2025-12-31"
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "MedicalProcedure",
                    "name": "6-Session Ketamine Series",
                    "procedureType": "Therapeutic"
                  },
                  "price": "2200",
                  "priceCurrency": "USD",
                  "priceValidUntil": "2025-12-31"
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Metabolic Reset Program (Monthly)",
                    "description": "Medical weight loss with GLP-1 medication and provider support"
                  },
                  "price": "399",
                  "priceCurrency": "USD"
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Hormone Concierge Membership (Monthly)",
                    "description": "Complete hormone optimization with testing and medication"
                  },
                  "price": "399",
                  "priceCurrency": "USD"
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Vitality Membership (Monthly)",
                    "description": "Hormone optimization without GLP-1 medication"
                  },
                  "price": "249",
                  "priceCurrency": "USD"
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Hormone Mapping Experience",
                    "description": "Comprehensive hormone testing and protocol design"
                  },
                  "price": "349",
                  "priceCurrency": "USD"
                }
              ]
            }
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

        {/* Mental Wellness / Ketamine Section - Reduced padding */}
        {shouldShow("mental") && (
          <section className="py-12 lg:py-16 bg-background">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-full bg-hope/10 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-hope" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-cormorant text-foreground">
                    Mental Wellness & Ketamine Therapy
                  </h2>
                  <p className="text-muted-foreground font-lato text-sm">
                    Breakthrough treatments for depression, anxiety & PTSD
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Single Session */}
                <Card className="border border-border hover:border-gold/30 transition-all duration-300 hover:shadow-lg flex flex-col">
                  <CardHeader className="pb-4">
                    <Badge variant="outline" className="w-fit mb-2 text-muted-foreground">
                      Try First
                    </Badge>
                    <h3 className="text-xl font-cormorant text-foreground">IV Ketamine Session</h3>
                    <p className="text-sm text-muted-foreground font-lato">
                      Single infusion with provider monitoring
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-grow">
                    <div className="mb-2">
                      <span className="text-4xl font-cormorant text-foreground">$400</span>
                      <span className="text-muted-foreground font-lato">/session</span>
                    </div>
                    <p className="text-xs text-gold font-lato mb-4">
                      or 4 payments of $100 with Klarna
                    </p>
                    <ul className="space-y-2 mb-6 flex-grow">
                      <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                        <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        60-90 minute monitored infusion
                      </li>
                      <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                        <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        Private treatment suite
                      </li>
                      <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                        <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        Board-certified provider supervision
                      </li>
                    </ul>
                    <Button variant="outline" className="w-full mt-auto" onClick={() => handleBookCall("mental")}>
                      Book Session
                    </Button>
                  </CardContent>
                </Card>

                {/* 6-Session Series */}
                <Card className="border-2 border-gold/50 relative hover:shadow-lg transition-all duration-300 flex flex-col">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gold text-gold-foreground">
                      <Star className="w-3 h-3 mr-1" /> Best Value
                    </Badge>
                  </div>
                  <CardHeader className="pb-4">
                    <Badge variant="outline" className="w-fit mb-2 text-gold border-gold/30">
                      Save $200
                    </Badge>
                    <h3 className="text-xl font-cormorant text-foreground">6-Session Series</h3>
                    <p className="text-sm text-muted-foreground font-lato">
                      Complete induction protocol
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-grow">
                    <div className="mb-2">
                      <span className="text-4xl font-cormorant text-foreground">$2,200</span>
                      <span className="text-muted-foreground font-lato ml-2 line-through text-sm">$2,400</span>
                    </div>
                    <p className="text-xs text-gold font-lato mb-4">
                      or ~$183/mo for 12 months with Affirm
                    </p>
                    <ul className="space-y-2 mb-6 flex-grow">
                      <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                        <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        6 infusions over 2-3 weeks
                      </li>
                      <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                        <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        Optimized dosing protocol
                      </li>
                      <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                        <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        Integration support included
                      </li>
                      <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                        <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        Maintenance session discount
                      </li>
                    </ul>
                    <Button className="w-full bg-gold hover:bg-gold-dark text-gold-foreground mt-auto" onClick={() => handleBookCall("mental")}>
                      Start Treatment
                    </Button>
                  </CardContent>
                </Card>

                {/* SPRAVATO */}
                <Card className="border border-border hover:border-gold/30 transition-all duration-300 hover:shadow-lg flex flex-col">
                  <CardHeader className="pb-4">
                    <Badge variant="outline" className="w-fit mb-2 text-hope border-hope/30">
                      Insurance Covered
                    </Badge>
                    <h3 className="text-xl font-cormorant text-foreground">SPRAVATO® (Esketamine)</h3>
                    <p className="text-sm text-muted-foreground font-lato">
                      FDA-approved nasal spray treatment
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-grow">
                    <div className="mb-4">
                      <span className="text-2xl font-cormorant text-foreground">Often $0-50</span>
                      <span className="text-muted-foreground font-lato text-sm block">with insurance coverage</span>
                    </div>
                    <ul className="space-y-2 mb-6 flex-grow">
                      <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                        <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        BCBS, TRICARE & most major plans
                      </li>
                      <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                        <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        We verify your benefits for you
                      </li>
                      <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                        <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        REMS-certified administration
                      </li>
                    </ul>
                    <Button variant="outline" className="w-full mt-auto" onClick={() => handleBookCall("mental")}>
                      Check Coverage
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Optional Add-on */}
              <div className="mt-8 p-6 bg-secondary/50 rounded-xl border border-border">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h4 className="font-cormorant text-lg text-foreground">Neurotransmitter Analysis</h4>
                    <p className="text-sm text-muted-foreground font-lato">
                      Advanced urine analysis measuring Serotonin, Dopamine & GABA levels
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-cormorant text-foreground">$399</span>
                    <Badge variant="outline">Optional Add-on</Badge>
                  </div>
                </div>
              </div>
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
                              Provider Strategy Session
                            </h3>
                            <p className="text-slate-600 font-lato text-sm leading-relaxed">
                              Skip the waiting room. Meet directly with Lauren Bursey, NP to review your medical history and determine eligibility. The $99 fee is credited toward your first treatment.
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-3xl font-cormorant text-slate-900">$99</span>
                            <span className="block text-xs text-slate-500 font-lato">one-time</span>
                          </div>
                        </div>
                        <Button 
                          className="mt-6 bg-amber-600 hover:bg-amber-700 text-white rounded-full px-8"
                          onClick={() => handleBookCall("weight")}
                        >
                          Book Strategy Session
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
                              Lauren reviews your eligibility and may request recent labs from your PCP if needed. Most patients are cleared to start during their consultation.
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
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-cormorant text-slate-900 mb-2">
                              Metabolic Reset Membership
                            </h3>
                            <p className="text-slate-600 font-lato text-sm leading-relaxed">
                              Once medically cleared, you unlock the all-inclusive membership. Includes GLP-1 Medication (Semaglutide), supplies, and 24/7 provider access.
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-3xl font-cormorant text-slate-900">$399</span>
                            <span className="block text-xs text-slate-500 font-lato">/month</span>
                          </div>
                        </div>
                        
                        {/* Membership Benefits */}
                        <ul className="mt-6 space-y-2">
                          <li className="flex items-center gap-2 text-sm font-lato text-slate-700">
                            <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />
                            <span>GLP-1 medication (Semaglutide or Tirzepatide)</span>
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
                  {/* STEP 1 - Provider Strategy Session */}
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
                              Provider Strategy Session
                            </h3>
                            <p className="text-sm text-slate-600 font-lato leading-relaxed">
                              Meet with Lauren Bursey, NP to review your symptoms, medical history, and treatment goals. The $99 fee is fully credited toward your Hormone Mapping.
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-3xl font-cormorant text-slate-900">$99</span>
                            <p className="text-xs text-slate-500 font-lato">one-time</p>
                          </div>
                        </div>
                        <div className="mt-6 flex items-center gap-3">
                          <Stethoscope className="w-5 h-5 text-amber-600 stroke-[1.5]" />
                          <Button 
                            className="bg-amber-600 hover:bg-amber-700 text-white font-lato rounded-full px-6"
                            onClick={() => handleBookCall("hormones")}
                          >
                            Book Strategy Session
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

                  {/* STEP 2 - Hormone Mapping */}
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
                              Hormone Mapping Panel
                            </h3>
                            <p className="text-sm text-slate-600 font-lato leading-relaxed">
                              A comprehensive at-home Saliva & Blood Spot kit. We test Estrogen, Testosterone, Progesterone, Cortisol, and Thyroid to engineer your custom protocol.
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-3xl font-cormorant text-slate-900">$349</span>
                            <p className="text-xs text-slate-500 font-lato">one-time</p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-slate-500">
                          <Activity className="w-5 h-5 stroke-[1.5]" />
                          <span className="text-xs font-lato">Unlocked after Step 1 — $99 credit applied</span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Connecting Line */}
                  <div className="flex justify-start ml-[1.4rem]">
                    <div className="w-0.5 h-8 bg-gradient-to-b from-slate-300 to-amber-500" />
                  </div>

                  {/* STEP 3 - Membership */}
                  <Card className="relative bg-white rounded-2xl border-2 border-amber-500 p-8 shadow-lg">
                    <div className="flex items-start gap-6">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-amber-600 text-white flex items-center justify-center font-cormorant text-lg">
                          3
                        </div>
                      </div>
                      <div className="flex-1">
                        <Badge className="mb-3 bg-amber-100 text-amber-800 hover:bg-amber-100 font-lato text-xs">
                          Step 3: Treatment
                        </Badge>
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-cormorant text-slate-900 mb-1">
                              Vitality Membership
                            </h3>
                            <p className="text-sm text-slate-600 font-lato leading-relaxed">
                              Once medically cleared, unlock ongoing hormone optimization. Includes quarterly ZRT testing, $50/month medication credit, and unlimited provider messaging.
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-3xl font-cormorant text-slate-900">$249</span>
                            <p className="text-xs text-slate-500 font-lato">/month</p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-amber-600 stroke-[1.5]" />
                          <div className="flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-amber-600" />
                            <span className="text-xs text-slate-600 font-lato">
                              Requires Medical Clearance — Complete Steps 1 & 2 first
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Concierge Upgrade */}
                <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div>
                        <Badge variant="outline" className="mb-2 border-amber-400 text-amber-700 font-lato text-xs">
                          All-Inclusive Option
                        </Badge>
                        <h4 className="font-cormorant text-lg text-slate-900">Concierge Membership</h4>
                        <p className="text-sm text-slate-600 font-lato">
                          Complete metabolic + hormonal optimization in one plan
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-2xl font-cormorant text-slate-900">$499</span>
                        <span className="text-slate-500 font-lato">/month</span>
                      </div>
                    </div>
                    
                    {/* Expanded Feature List */}
                    <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                      <div>
                        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">Vitality Base</p>
                        <ul className="space-y-1.5 text-sm text-slate-600 font-lato">
                          <li className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                            Quarterly ZRT testing
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                            $50/mo medication credit
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                            Unlimited provider messaging
                          </li>
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">+ GLP-1 Weight Loss</p>
                        <ul className="space-y-1.5 text-sm text-slate-600 font-lato">
                          <li className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                            Semaglutide or Tirzepatide
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                            Monthly dosing adjustments
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                            B12/Lipotropic support
                          </li>
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">+ Adrenal Protocol</p>
                        <ul className="space-y-1.5 text-sm text-slate-600 font-lato">
                          <li className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                            DHEA + Pregnenolone
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                            Adaptogenic herbs (AdreneVive)
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                            Cortisol rhythm optimization
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <p className="text-xs text-slate-500 font-lato italic mt-2">
                      Addresses HPA-axis dysfunction for patients with chronic fatigue, burnout, or stress-related hormone imbalances.
                    </p>
                  </div>
                </div>
              </div>

              {/* Gender-Specific Pages */}
              <div className="mt-12 max-w-2xl mx-auto grid md:grid-cols-2 gap-4">
                <Card className="border border-feminine/30 bg-feminine/5 hover:border-feminine/50 transition-all cursor-pointer" onClick={() => navigate("/hormones/women")}>
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

                <Card className="border border-masculine/30 bg-masculine/5 hover:border-masculine/50 transition-all cursor-pointer" onClick={() => navigate("/hormones/men")}>
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
                      <span className="text-3xl font-cormorant text-foreground">$149</span>
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
                      <span className="text-3xl font-cormorant text-foreground ml-2">$99</span>
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
                    <span className="text-xl font-cormorant text-foreground">From $99</span>
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
                    <Button variant="outline" className="w-full mt-auto" onClick={() => handleBookCall("hair")}>
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
                    <Button variant="outline" className="w-full mt-auto" onClick={() => handleBookCall("hair")}>
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
                      <span className="text-3xl font-cormorant text-foreground">$99</span>
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
                    <Button variant="outline" className="w-full mt-auto" onClick={() => handleBookCall("hair")}>
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
                      <span className="text-3xl font-cormorant text-foreground">$99</span>
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
                    <Button variant="outline" className="w-full mt-auto" onClick={() => handleBookCall("sexual")}>
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
                    <Button variant="outline" className="w-full mt-auto" onClick={() => handleBookCall("sexual")}>
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
                    <Button variant="outline" className="w-full mt-auto" onClick={() => handleBookCall("sexual")}>
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
                    <Button variant="outline" className="w-full mt-auto" onClick={() => handleBookCall("sexual")}>
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
              {/* Testosterone Cream */}
              <Card className="border border-border hover:border-gold/30 transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="text-masculine border-masculine/30">
                      Men's HRT
                    </Badge>
                    <span className="text-xs text-muted-foreground font-lato">10-week fill</span>
                  </div>
                  <h3 className="text-xl font-cormorant text-foreground mb-1">Testosterone Cream</h3>
                  <p className="text-sm text-muted-foreground font-lato mb-4">
                    Compounded testosterone cream for optimization
                  </p>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-cormorant text-foreground">$149</span>
                    <span className="text-sm text-muted-foreground line-through">$249 membership</span>
                  </div>
                  <p className="text-xs text-gold font-lato">
                    Save $100/month with Vitality Membership
                  </p>
                </CardContent>
              </Card>

              {/* Bi-Est Cream */}
              <Card className="border border-border hover:border-gold/30 transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="text-feminine border-feminine/30">
                      Women's HRT
                    </Badge>
                    <span className="text-xs text-muted-foreground font-lato">30-day fill</span>
                  </div>
                  <h3 className="text-xl font-cormorant text-foreground mb-1">Bi-Est Cream</h3>
                  <p className="text-sm text-muted-foreground font-lato mb-4">
                    Bioidentical estrogen (estriol + estradiol)
                  </p>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-cormorant text-foreground">$89</span>
                    <span className="text-sm text-muted-foreground line-through">$249 membership</span>
                  </div>
                  <p className="text-xs text-gold font-lato">
                    Save with Vitality Membership (includes labs)
                  </p>
                </CardContent>
              </Card>

              {/* Progesterone */}
              <Card className="border border-border hover:border-gold/30 transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="text-feminine border-feminine/30">
                      Women's HRT
                    </Badge>
                    <span className="text-xs text-muted-foreground font-lato">30-day fill</span>
                  </div>
                  <h3 className="text-xl font-cormorant text-foreground mb-1">Progesterone</h3>
                  <p className="text-sm text-muted-foreground font-lato mb-4">
                    Bioidentical progesterone capsules
                  </p>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-cormorant text-foreground">$79</span>
                    <span className="text-sm text-muted-foreground line-through">$249 membership</span>
                  </div>
                  <p className="text-xs text-gold font-lato">
                    Save with Vitality Membership (includes labs)
                  </p>
                </CardContent>
              </Card>

              {/* Follow-up Consultation */}
              <Card className="border border-border hover:border-gold/30 transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="text-muted-foreground">
                      Consultation
                    </Badge>
                    <span className="text-xs text-muted-foreground font-lato">30 minutes</span>
                  </div>
                  <h3 className="text-xl font-cormorant text-foreground mb-1">Follow-up Consult</h3>
                  <p className="text-sm text-muted-foreground font-lato mb-4">
                    Video or in-person follow-up visit
                  </p>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-cormorant text-foreground">$99</span>
                    <span className="text-sm text-muted-foreground">one-time</span>
                  </div>
                  <p className="text-xs text-gold font-lato">
                    FREE with any active membership
                  </p>
                </CardContent>
              </Card>

              {/* Lab Panel */}
              <Card className="border border-border hover:border-gold/30 transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="text-muted-foreground">
                      Diagnostics
                    </Badge>
                    <span className="text-xs text-muted-foreground font-lato">Individual</span>
                  </div>
                  <h3 className="text-xl font-cormorant text-foreground mb-1">Lab Panel</h3>
                  <p className="text-sm text-muted-foreground font-lato mb-4">
                    Comprehensive hormone or metabolic panel
                  </p>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-cormorant text-foreground">$149</span>
                    <span className="text-sm text-muted-foreground">one-time</span>
                  </div>
                  <p className="text-xs text-gold font-lato">
                    Quarterly labs included in membership
                  </p>
                </CardContent>
              </Card>

              {/* Membership Savings CTA */}
              <Card className="border-2 border-gold bg-gold/5 hover:bg-gold/10 transition-all">
                <CardContent className="p-6 flex flex-col h-full justify-center text-center">
                  <Sparkles className="w-8 h-8 text-gold mx-auto mb-4" />
                  <h3 className="text-xl font-cormorant text-foreground mb-2">Save with Membership</h3>
                  <p className="text-sm text-muted-foreground font-lato mb-4">
                    Vitality members save up to <span className="text-gold font-semibold">60%</span> compared to à la carte pricing
                  </p>
                  <Button 
                    className="bg-gold hover:bg-gold-dark text-gold-foreground w-full"
                    onClick={() => navigate("/pricing-comparison")}
                  >
                    Compare Pricing
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Comparison Banner */}
            <div className="mt-10 max-w-4xl mx-auto bg-card rounded-xl border border-border p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <h4 className="font-cormorant text-xl text-foreground mb-2">
                    Annual Cost Comparison
                  </h4>
                  <p className="text-sm text-muted-foreground font-lato">
                    See how much you could save with a Vitality Membership
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="text-center px-6 py-3 bg-secondary/50 rounded-lg">
                    <p className="text-xs text-muted-foreground font-lato uppercase tracking-wide mb-1">À La Carte</p>
                    <p className="text-2xl font-cormorant text-foreground">$4,500+</p>
                    <p className="text-xs text-muted-foreground font-lato">/year</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gold hidden sm:block" />
                  <div className="text-center px-6 py-3 bg-gold/10 border border-gold/30 rounded-lg">
                    <p className="text-xs text-gold font-lato uppercase tracking-wide mb-1">Membership</p>
                    <p className="text-2xl font-cormorant text-foreground">$2,988</p>
                    <p className="text-xs text-muted-foreground font-lato">/year</p>
                  </div>
                </div>
              </div>
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
              When you're ready for personalized medical guidance, book a $99 Medical Consultation.
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
                onClick={() => handleBookCall()}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book $99 Consultation
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
                  Yes! For larger one-time purchases like the 6-session ketamine series, 
                  we offer interest-free payment plans through our payment processor. 
                  Ask about options during your consultation.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border border-border rounded-lg px-6 py-1">
                <AccordionTrigger className="text-left font-cormorant text-lg hover:no-underline py-4">
                  Is any of this covered by insurance?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-lato pb-4">
                  SPRAVATO® (esketamine) is often covered by insurance—we verify your 
                  benefits at no cost. Our other services are generally not covered by 
                  insurance, but we provide superbills you can submit for potential 
                  out-of-network reimbursement. Many patients with HSA/FSA accounts 
                  use those funds for our services.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border border-border rounded-lg px-6 py-1">
                <AccordionTrigger className="text-left font-cormorant text-lg hover:no-underline py-4">
                  What's included in the à la carte consultations?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-lato pb-4">
                  Our $99 consultations include a thorough review of your symptoms and 
                  health history, discussion of treatment options, and a personalized 
                  recommendation. If you decide to proceed with treatment, the consultation 
                  fee is applied toward your first month or diagnostic package.
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
                <span>SPRAVATO® REMS Certified</span>
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

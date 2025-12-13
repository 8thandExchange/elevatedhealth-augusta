import { useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
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
} from "lucide-react";

const serviceCategories = [
  { id: "all", label: "All Services" },
  { id: "mental", label: "Mental Wellness", icon: Brain },
  { id: "weight", label: "Weight Loss", icon: Scale },
  { id: "hormones", label: "Hormones", icon: Heart },
  { id: "peptides", label: "Peptides", icon: Syringe },
  { id: "iv", label: "IV Hydration", icon: Droplets },
];

const Pricing = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const navigate = useNavigate();

  const handleBookCall = () => {
    window.open(SITE_CONFIG.bookingUrl, "_blank");
  };

  const shouldShow = (category: string) => {
    return activeCategory === "all" || activeCategory === category;
  };

  return (
    <>
      <Helmet>
        <title>Pricing - Transparent Healthcare Pricing | Elevated Health Augusta</title>
        <meta
          name="description"
          content="View our transparent pricing for ketamine therapy, medical weight loss, hormone optimization, peptide therapy, and IV hydration in Augusta, GA. Memberships and à la carte options available."
        />
        <meta
          name="keywords"
          content="ketamine therapy pricing Augusta, weight loss program cost, hormone therapy pricing, IV therapy prices, medical spa pricing Georgia"
        />
        <link rel="canonical" href="https://elevatedhealthaugusta.com/pricing" />
        
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
                  "text": "The most affordable entry point is our free 15-minute Discovery Call to discuss your goals. For committed patients, our $99 Discovery Consultation provides a comprehensive assessment. If you're interested in weight loss or hormone therapy, the $299 Metabolic or Hormone Mapping provides the best diagnostic value."
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
            "name": "Elevated Health Augusta",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "105 Davis Rd, Building 2, Suites 1-2",
              "addressLocality": "Augusta",
              "addressRegion": "GA",
              "postalCode": "30907"
            },
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
                  "price": "199",
                  "priceCurrency": "USD"
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Hormone Mapping Experience",
                    "description": "Comprehensive hormone testing and protocol design"
                  },
                  "price": "299",
                  "priceCurrency": "USD"
                }
              ]
            }
          })}
        </script>
      </Helmet>

      <Navbar />

      <main id="main-content" className="min-h-screen bg-background">

        {/* Hero Section */}
        <section className="relative py-20 lg:py-28 bg-gradient-to-b from-secondary to-background">
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
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-12">
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
            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
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
          </div>
        </section>

        {/* Mental Wellness / Ketamine Section */}
        {shouldShow("mental") && (
          <section className="py-16 lg:py-20 bg-background">
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
                <Card className="border border-border hover:border-gold/30 transition-all duration-300 hover:shadow-lg">
                  <CardHeader className="pb-4">
                    <Badge variant="outline" className="w-fit mb-2 text-muted-foreground">
                      Try First
                    </Badge>
                    <h3 className="text-xl font-cormorant text-foreground">IV Ketamine Session</h3>
                    <p className="text-sm text-muted-foreground font-lato">
                      Single infusion with provider monitoring
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-2">
                      <span className="text-4xl font-cormorant text-foreground">$400</span>
                      <span className="text-muted-foreground font-lato">/session</span>
                    </div>
                    <p className="text-xs text-gold font-lato mb-4">
                      or 4 payments of $100 with Klarna
                    </p>
                    <ul className="space-y-2 mb-6">
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
                    <Button variant="outline" className="w-full" onClick={handleBookCall}>
                      Book Session
                    </Button>
                  </CardContent>
                </Card>

                {/* 6-Session Series */}
                <Card className="border-2 border-gold/50 relative hover:shadow-lg transition-all duration-300">
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
                  <CardContent>
                    <div className="mb-2">
                      <span className="text-4xl font-cormorant text-foreground">$2,200</span>
                      <span className="text-muted-foreground font-lato ml-2 line-through text-sm">$2,400</span>
                    </div>
                    <p className="text-xs text-gold font-lato mb-4">
                      or ~$183/mo for 12 months with Affirm
                    </p>
                    <ul className="space-y-2 mb-6">
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
                    <Button className="w-full bg-gold hover:bg-gold-dark text-gold-foreground" onClick={handleBookCall}>
                      Start Treatment
                    </Button>
                  </CardContent>
                </Card>

                {/* SPRAVATO */}
                <Card className="border border-border hover:border-gold/30 transition-all duration-300 hover:shadow-lg">
                  <CardHeader className="pb-4">
                    <Badge variant="outline" className="w-fit mb-2 text-hope border-hope/30">
                      Insurance Covered
                    </Badge>
                    <h3 className="text-xl font-cormorant text-foreground">SPRAVATO® (Esketamine)</h3>
                    <p className="text-sm text-muted-foreground font-lato">
                      FDA-approved nasal spray treatment
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <span className="text-2xl font-cormorant text-foreground">Often $0-50</span>
                      <span className="text-muted-foreground font-lato text-sm block">with insurance coverage</span>
                    </div>
                    <ul className="space-y-2 mb-6">
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
                    <Button variant="outline" className="w-full" onClick={handleBookCall}>
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

        {/* Weight Loss Section */}
        {shouldShow("weight") && (
          <section className="py-16 lg:py-20 bg-secondary/30">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                  <Scale className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-cormorant text-foreground">
                    Medical Weight Loss
                  </h2>
                  <p className="text-muted-foreground font-lato text-sm">
                    GLP-1 medications with comprehensive metabolic support
                  </p>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* À La Carte Options */}
                <div>
                  <h3 className="text-lg font-cormorant text-foreground mb-4 flex items-center gap-2">
                    <span className="w-8 h-[1px] bg-border"></span>
                    Try First
                    <span className="w-8 h-[1px] bg-border"></span>
                  </h3>
                  <div className="space-y-4">
                    <Card className="border border-border hover:border-gold/30 transition-all">
                      <CardContent className="p-5 flex justify-between items-center">
                        <div>
                          <h4 className="font-cormorant text-lg text-foreground">Discovery Consultation</h4>
                          <p className="text-sm text-muted-foreground font-lato">
                            30-minute consult with metabolic specialist
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-cormorant text-foreground">$99</span>
                          <span className="block text-xs text-muted-foreground">one-time</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-border hover:border-gold/30 transition-all">
                      <CardContent className="p-5 flex justify-between items-center">
                        <div>
                          <h4 className="font-cormorant text-lg text-foreground">Metabolic Mapping</h4>
                          <p className="text-sm text-muted-foreground font-lato">
                            Complete lab panel + body composition + protocol design
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-cormorant text-foreground">$299</span>
                          <span className="block text-xs text-muted-foreground">one-time</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-border hover:border-gold/30 transition-all">
                      <CardContent className="p-5 flex justify-between items-center">
                        <div>
                          <h4 className="font-cormorant text-lg text-foreground">GLP-1 Starter Month</h4>
                          <p className="text-sm text-muted-foreground font-lato">
                            First month medication + supplies (no commitment)
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-cormorant text-foreground">$349</span>
                          <span className="block text-xs text-muted-foreground">one-time</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-border hover:border-gold/30 transition-all">
                      <CardContent className="p-5 flex justify-between items-center">
                        <div>
                          <h4 className="font-cormorant text-lg text-foreground">GLP-1 Continuation Month</h4>
                          <p className="text-sm text-muted-foreground font-lato">
                            Returning patients • medication + check-in
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-cormorant text-foreground">$449</span>
                          <span className="block text-xs text-muted-foreground">one-time</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Membership */}
                <div>
                  <h3 className="text-lg font-cormorant text-foreground mb-4 flex items-center gap-2">
                    <span className="w-8 h-[1px] bg-gold/50"></span>
                    <Star className="w-4 h-4 text-gold" />
                    Best Value
                    <span className="w-8 h-[1px] bg-gold/50"></span>
                  </h3>
                  <Card className="border-2 border-gold/50 relative h-full">
                    <div className="absolute -top-3 right-4">
                      <Badge className="bg-gold text-gold-foreground">Most Popular</Badge>
                    </div>
                    <CardHeader>
                      <h3 className="text-2xl font-cormorant text-foreground">Metabolic Reset Program</h3>
                      <p className="text-muted-foreground font-lato">
                        Complete concierge weight loss with ongoing support
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <span className="text-4xl font-cormorant text-foreground">$399</span>
                        <span className="text-muted-foreground font-lato">/month</span>
                        <p className="text-xs text-gold font-lato mt-1">
                          or 4 payments of $100 with Klarna • Save over $150/month vs à la carte
                        </p>
                      </div>
                      <ul className="space-y-3 mb-8">
                        <li className="flex items-start gap-2 text-sm font-lato text-foreground">
                          <Check className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                          <span><strong>GLP-1 medication</strong> (Semaglutide or Tirzepatide)</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm font-lato text-foreground">
                          <Check className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                          <span><strong>Unlimited messaging</strong> with your provider</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm font-lato text-foreground">
                          <Check className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                          <span><strong>Quarterly metabolic labs</strong> included</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm font-lato text-foreground">
                          <Check className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                          <span><strong>Weekly check-ins</strong> with dose adjustments</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm font-lato text-foreground">
                          <Check className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                          <span><strong>Nutritional guidance</strong> & behavioral support</span>
                        </li>
                      </ul>
                      <Button 
                        className="w-full bg-gold hover:bg-gold-dark text-gold-foreground" 
                        size="lg"
                        onClick={handleBookCall}
                      >
                        Start Your Transformation <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      <p className="text-center text-xs text-muted-foreground mt-3">
                        Cancel anytime • No long-term contracts
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Hormone Add-on */}
              <div className="mt-8 p-6 bg-background rounded-xl border border-gold/20">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <Badge variant="outline" className="mb-2 border-gold/30 text-gold">Premium Add-on</Badge>
                    <h4 className="font-cormorant text-lg text-foreground">Hormone Optimization Bundle</h4>
                    <p className="text-sm text-muted-foreground font-lato">
                      Add bio-identical hormones to accelerate results & preserve muscle
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-cormorant text-foreground">+$149</span>
                    <span className="text-muted-foreground font-lato">/month</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Hormone Optimization Section */}
        {shouldShow("hormones") && (
          <section className="py-16 lg:py-20 bg-background">
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
                    Bio-identical hormone therapy for men & women
                  </p>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* À La Carte */}
                <div>
                  <h3 className="text-lg font-cormorant text-foreground mb-4 flex items-center gap-2">
                    <span className="w-8 h-[1px] bg-border"></span>
                    Explore First
                    <span className="w-8 h-[1px] bg-border"></span>
                  </h3>
                  <div className="space-y-4">
                    <Card className="border border-border hover:border-gold/30 transition-all">
                      <CardContent className="p-5 flex justify-between items-center">
                        <div>
                          <h4 className="font-cormorant text-lg text-foreground">Hormone Consultation</h4>
                          <p className="text-sm text-muted-foreground font-lato">
                            Symptom review & treatment options discussion
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-cormorant text-foreground">$99</span>
                          <span className="block text-xs text-muted-foreground">one-time</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-gold/30 relative hover:border-gold/50 transition-all">
                      <div className="absolute -top-2 right-3">
                        <Badge variant="outline" className="text-xs border-gold/50 text-gold">Most Popular</Badge>
                      </div>
                      <CardContent className="p-5 flex justify-between items-center">
                        <div>
                          <h4 className="font-cormorant text-lg text-foreground">Hormone Mapping</h4>
                          <p className="text-sm text-muted-foreground font-lato">
                            At-home ZRT test + 45-min clinical review + protocol design
                          </p>
                          <p className="text-xs text-gold font-lato mt-1">
                            or 4 payments of $75 with Klarna
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-cormorant text-foreground">$299</span>
                          <span className="block text-xs text-muted-foreground">one-time</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-border hover:border-gold/30 transition-all">
                      <CardContent className="p-5 flex justify-between items-center">
                        <div>
                          <h4 className="font-cormorant text-lg text-foreground">Comprehensive Panel</h4>
                          <p className="text-sm text-muted-foreground font-lato">
                            Full hormone + thyroid + metabolic blood panel
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-cormorant text-foreground">$399</span>
                          <span className="block text-xs text-muted-foreground">one-time</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Memberships */}
                <div>
                  <h3 className="text-lg font-cormorant text-foreground mb-4 flex items-center gap-2">
                    <span className="w-8 h-[1px] bg-gold/50"></span>
                    <Star className="w-4 h-4 text-gold" />
                    Membership Plans
                    <span className="w-8 h-[1px] bg-gold/50"></span>
                  </h3>
                  <div className="space-y-4">
                    <Card className="border border-border hover:border-gold/30 transition-all">
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <h4 className="font-cormorant text-xl text-foreground">Vitality Membership</h4>
                            <p className="text-sm text-muted-foreground font-lato">
                              Hormone optimization only (no weight loss)
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-3xl font-cormorant text-foreground">$199</span>
                            <span className="text-muted-foreground font-lato">/mo</span>
                          </div>
                        </div>
                        <p className="text-xs text-gold font-lato mb-3">
                          or 4 payments of $50 with Klarna
                        </p>
                        <ul className="space-y-2 mb-4">
                          <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                            <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                            Clinical management & provider access
                          </li>
                          <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                            <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                            Quarterly hormone testing
                          </li>
                          <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                            <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                            $50/month credit toward prescriptions
                          </li>
                        </ul>
                        <Button variant="outline" className="w-full" onClick={handleBookCall}>
                          Learn More
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-gold/50 relative">
                      <div className="absolute -top-3 right-4">
                        <Badge className="bg-gold text-gold-foreground">Best Value</Badge>
                      </div>
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <h4 className="font-cormorant text-xl text-foreground">Concierge Membership</h4>
                            <p className="text-sm text-muted-foreground font-lato">
                              Complete hormone + metabolic optimization
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-3xl font-cormorant text-foreground">$399</span>
                            <span className="text-muted-foreground font-lato">/mo</span>
                          </div>
                        </div>
                        <p className="text-xs text-gold font-lato mb-3">
                          or 4 payments of $100 with Klarna
                        </p>
                        <ul className="space-y-2 mb-4">
                          <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                            <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                            Everything in Vitality, plus:
                          </li>
                          <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                            <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                            GLP-1 medication included
                          </li>
                          <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                            <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                            Unlimited provider messaging
                          </li>
                          <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                            <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                            Adrenal support protocols
                          </li>
                        </ul>
                        <Button className="w-full bg-gold hover:bg-gold-dark text-gold-foreground" onClick={handleBookCall}>
                          Get Started
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Peptides Section */}
        {shouldShow("peptides") && (
          <section className="py-16 lg:py-20 bg-secondary/30">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Syringe className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-cormorant text-foreground">
                    Peptide Therapy
                  </h2>
                  <p className="text-muted-foreground font-lato text-sm">
                    Cellular optimization & longevity protocols
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <Card className="border border-border hover:border-gold/30 transition-all hover:shadow-lg">
                  <CardHeader className="pb-4">
                    <Badge variant="outline" className="w-fit mb-2 text-muted-foreground">
                      Growth & Recovery
                    </Badge>
                    <h3 className="text-xl font-cormorant text-foreground">Sermorelin/Tesamorelin</h3>
                    <p className="text-sm text-muted-foreground font-lato">
                      Stimulates natural growth hormone production
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-2">
                      <span className="text-3xl font-cormorant text-foreground">$149</span>
                      <span className="text-muted-foreground font-lato">/month</span>
                    </div>
                    <p className="text-xs text-gold font-lato mb-4">
                      or 4 payments of $37 with Klarna
                    </p>
                    <ul className="space-y-2 mb-6">
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
                    <Button variant="outline" className="w-full" onClick={() => navigate("/peptides")}>
                      Learn More
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border border-border hover:border-gold/30 transition-all hover:shadow-lg">
                  <CardHeader className="pb-4">
                    <Badge variant="outline" className="w-fit mb-2 text-muted-foreground">
                      Brain Restoration
                    </Badge>
                    <h3 className="text-xl font-cormorant text-foreground">NAD+</h3>
                    <p className="text-sm text-muted-foreground font-lato">
                      Cellular energy & cognitive enhancement
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <span className="text-xl font-cormorant text-foreground">Troches</span>
                      <span className="text-3xl font-cormorant text-foreground ml-2">$99</span>
                      <span className="text-muted-foreground font-lato">/mo</span>
                    </div>
                    <div className="mb-4 text-sm text-muted-foreground">
                      or Injections <span className="font-cormorant text-foreground text-lg">$199</span>/mo
                    </div>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                        <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        Mental clarity & focus
                      </li>
                      <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                        <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        Anti-aging benefits
                      </li>
                    </ul>
                    <Button variant="outline" className="w-full" onClick={() => navigate("/peptides")}>
                      Learn More
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border border-border hover:border-gold/30 transition-all hover:shadow-lg">
                  <CardHeader className="pb-4">
                    <Badge variant="outline" className="w-fit mb-2 text-muted-foreground">
                      Intimacy & Desire
                    </Badge>
                    <h3 className="text-xl font-cormorant text-foreground">PT-141</h3>
                    <p className="text-sm text-muted-foreground font-lato">
                      Restore sexual desire naturally
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-2">
                      <span className="text-3xl font-cormorant text-foreground">$225</span>
                      <span className="text-muted-foreground font-lato">/kit</span>
                    </div>
                    <p className="text-xs text-gold font-lato mb-4">
                      10-dose kit • or 4 payments of $56 with Klarna
                    </p>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                        <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        Works for men & women
                      </li>
                      <li className="flex items-start gap-2 text-sm font-lato text-muted-foreground">
                        <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        Non-hormonal solution
                      </li>
                    </ul>
                    <Button variant="outline" className="w-full" onClick={() => navigate("/peptides")}>
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        )}

        {/* IV Lounge Section */}
        {shouldShow("iv") && (
          <section className="py-16 lg:py-20 bg-background">
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

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: "Hydration Basics", price: "$139", desc: "Fluids + Electrolytes" },
                  { name: "Energy Boost", price: "$159", desc: "B-Complex + B12 + Fluids" },
                  { name: "Immune Defense", price: "$179", desc: "Vitamin C + Zinc + Glutathione" },
                  { name: "Executive Recovery", price: "$199", desc: "Full vitamin complex + NAD+" },
                ].map((drip) => (
                  <Card key={drip.name} className="border border-border hover:border-gold/30 transition-all text-center">
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
                  Add booster shots to any drip: <span className="text-foreground">+$25 each</span>
                </p>
                <Button variant="outline" onClick={() => navigate("/iv-lounge")}>
                  View Full IV Menu <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Dedicated Financing Section */}
        <section className="py-16 lg:py-20 bg-gradient-to-b from-[#F5E6D3]/30 to-background">
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
                {/* Klarna Card */}
                <Card className="border-2 border-[#FFB3C7]/30 bg-gradient-to-br from-[#FFB3C7]/5 to-transparent">
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

                {/* Affirm Card */}
                <Card className="border-2 border-[#0FA0EA]/30 bg-gradient-to-br from-[#0FA0EA]/5 to-transparent">
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

        {/* CTA Section */}
        <section className="py-20 lg:py-28 bg-gradient-to-b from-secondary to-background">
          <div className="container mx-auto px-4 text-center">
            <Sparkles className="w-10 h-10 text-gold mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-cormorant text-foreground mb-4">
              Not Sure Where to Start?
            </h2>
            <p className="text-lg text-muted-foreground font-lato max-w-xl mx-auto mb-8">
              Schedule a free 15-minute discovery call. We'll help you find 
              the right path—no pressure, no commitment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gold hover:bg-gold-dark text-gold-foreground"
                onClick={handleBookCall}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book Free Discovery Call
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => window.location.href = `tel:${SITE_CONFIG.phoneRaw}`}
              >
                <Phone className="w-5 h-5 mr-2" />
                Call {SITE_CONFIG.phone}
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 lg:py-20 bg-background">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-cormorant text-foreground text-center mb-10">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="border border-border rounded-lg px-6">
                <AccordionTrigger className="text-left font-cormorant text-lg hover:no-underline">
                  Can I switch between programs?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-lato">
                  Absolutely! Your health journey may evolve, and we're here to adapt with you. 
                  You can upgrade, downgrade, or switch programs at any time. Just message your 
                  provider and we'll adjust your plan.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border border-border rounded-lg px-6">
                <AccordionTrigger className="text-left font-cormorant text-lg hover:no-underline">
                  What if I need to pause my membership?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-lato">
                  Life happens! You can pause your membership for up to 3 months without 
                  losing your spot. Just let us know at least 5 days before your next 
                  billing date.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border border-border rounded-lg px-6">
                <AccordionTrigger className="text-left font-cormorant text-lg hover:no-underline">
                  Do you offer payment plans?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-lato">
                  Yes! For larger one-time purchases like the 6-session ketamine series, 
                  we offer interest-free payment plans through our payment processor. 
                  Ask about options during your consultation.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border border-border rounded-lg px-6">
                <AccordionTrigger className="text-left font-cormorant text-lg hover:no-underline">
                  Is any of this covered by insurance?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-lato">
                  SPRAVATO® (esketamine) is often covered by insurance—we verify your 
                  benefits at no cost. Our other services are generally not covered by 
                  insurance, but we provide superbills you can submit for potential 
                  out-of-network reimbursement. Many patients with HSA/FSA accounts 
                  use those funds for our services.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border border-border rounded-lg px-6">
                <AccordionTrigger className="text-left font-cormorant text-lg hover:no-underline">
                  What's included in the à la carte consultations?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-lato">
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
    </>
  );
};

export default Pricing;

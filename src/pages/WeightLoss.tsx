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

  const programIncludes = [
    { icon: LineChart, text: "Comprehensive metabolic labs (CBC, CMP, A1c, lipids, TSH, cortisol)" },
    { icon: Scale, text: "Body composition analysis (monthly)" },
    { icon: Droplet, text: "Personalized dosing plan for semaglutide or tirzepatide" },
    { icon: Clock, text: "Weekly progress check-ins (virtual or in-person)" },
    { icon: MessageCircle, text: "Unlimited messaging support" },
    { icon: Shield, text: "Side-effect management + dose adjustments" },
    { icon: Apple, text: "Nutritional guidance" },
    { icon: Brain, text: "Behavioral support modules" },
    { icon: Heart, text: "Optional mental health integration" },
    { icon: Sparkles, text: "No hidden fees" }
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
      q: "How is this different from other weight loss programs?",
      a: "We don't just prescribe medication—we transform lives. Unlike other programs, we offer comprehensive metabolic labs, psychological support, weekly check-ins, lifestyle coaching, and ketamine-quality medical oversight. You'll never feel alone in your journey."
    },
    {
      q: "What makes the Full Body Renewal Package special?",
      a: "This is Augusta's only comprehensive program combining weight loss, hormone optimization, and mental health support under one roof. It's designed for patients who want complete transformation, not just a prescription."
    },
    {
      q: "Do you offer weekly check-ins?",
      a: "Yes! Unlike most programs, we provide weekly progress check-ins either virtually or in-person, plus unlimited messaging support. You'll always have access to our medical team."
    },
    {
      q: "What is semaglutide and tirzepatide?",
      a: "Both are FDA-approved GLP-1 medications that help regulate appetite, slow digestion, and improve blood sugar control. Tirzepatide (dual GLP-1/GIP) typically provides faster results. We'll help you choose the right medication during your consultation."
    },
    {
      q: "Will I be monitored by a real doctor?",
      a: "Absolutely. You'll receive the same level of medical oversight we provide for our ketamine therapy patients. This includes comprehensive labs, body composition analysis, and ongoing adjustments to your treatment plan."
    },
    {
      q: "What if I hit a plateau?",
      a: "Plateaus are normal, but unlike other programs, we won't leave you frustrated. We'll adjust your dosing, review your labs, modify your nutrition plan, and provide behavioral support to get you back on track."
    },
    {
      q: "Is the hormone optimization necessary?",
      a: "Not required, but highly recommended. Many patients struggle to lose weight due to hormone imbalances. Optimizing hormones while on GLP-1 therapy accelerates results and improves overall wellbeing."
    },
    {
      q: "What kind of results can I expect?",
      a: "With our comprehensive program, patients typically achieve 15-20% body weight loss or more. Results vary based on starting weight, medication choice, and commitment to lifestyle changes. We'll set realistic goals during your consultation."
    },
    {
      q: "Do you accept insurance?",
      a: "We accept several insurance plans and can provide documentation for reimbursement. Contact us to verify your specific coverage. Many patients find our program more affordable than national chains when you factor in the level of support included."
    }
  ];

  return (
    <>
      <Helmet>
        <title>Weight Reset Program™ - Medical Weight Loss Augusta | Elevated Health</title>
        <meta name="description" content="Finally—A Weight Loss Program That Treats the Whole You. GLP-1 therapy + metabolic labs + hormone optimization + mental health support. Augusta's only comprehensive program." />
        <meta name="keywords" content="medical weight loss Augusta, semaglutide Augusta GA, tirzepatide Augusta, GLP-1 Augusta, weight loss clinic Georgia, hormone optimization Augusta, metabolic labs" />
      </Helmet>

      <div className="min-h-screen">
        <Navbar />
        
        <main>
          {/* Hero Section */}
          <section className="pt-32 pb-16 md:pb-24 bg-gradient-to-b from-primary/5 via-accent/5 to-background">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-5xl mx-auto text-center">
                <div className="inline-block mb-6 animate-fade-in-up">
                  <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                    Introducing the Weight Reset Program™
                  </span>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                  Finally—A Weight Loss Program<br />That Treats the Whole You
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                  Elevated Health Augusta offers medically supervised weight loss with GLP-1 medications, 
                  metabolic testing, hormone optimization, and mental-health-supported coaching.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                  <div className="text-center">
                    <div className="text-xl text-muted-foreground mb-1">Starting at</div>
                    <div className="text-5xl font-bold text-primary">$349</div>
                    <div className="text-lg text-muted-foreground">/month</div>
                  </div>
                  <div className="hidden sm:block w-px h-20 bg-border"></div>
                  <div className="text-center">
                    <div className="text-xl text-muted-foreground mb-1">Premium Package</div>
                    <div className="text-5xl font-bold text-accent">$799</div>
                    <div className="text-lg text-muted-foreground">/month</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
                  <Button onClick={scrollToBooking} size="lg" className="text-lg px-8 py-6">
                    Book Free Consultation
                  </Button>
                  <Button onClick={() => window.open(`tel:${SITE_CONFIG.phone}`, "_self")} size="lg" variant="outline" className="text-lg px-8 py-6">
                    Call {SITE_CONFIG.phone}
                  </Button>
                </div>

                <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>No generic dosing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>No rushed appointments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>No feeling lost</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* What's Included Section */}
          <section className="py-16 md:py-24 bg-secondary/30">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-4xl mx-auto text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Weight Reset Program™ Includes
                </h2>
                <p className="text-lg text-muted-foreground">
                  A medically supervised GLP-1 & metabolic optimization program
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
                {programIncludes.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <Card 
                      key={index} 
                      className="border-2 hover:border-primary/50 transition-all hover:shadow-lg animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <CardContent className="p-6 flex gap-4">
                        <div className="shrink-0">
                          <div className="p-3 bg-primary/10 rounded-lg">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                        <div className="flex items-center">
                          <p className="text-foreground">{item.text}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
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

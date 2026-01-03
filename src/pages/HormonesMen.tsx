import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CheckCircle2, 
  Shield, 
  Zap, 
  Activity, 
  Calendar,
  Phone,
  ClipboardList,
  Users,
  TestTube,
  UserCheck,
  TrendingUp,
  Heart,
  Dumbbell,
  Target,
  CreditCard,
  Loader2,
  Droplet
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SITE_CONFIG } from "@/lib/siteConfig";
import providerPortrait from "@/assets/provider-portrait.jpg";
import elevatedForHimLogo from "@/assets/elevated-for-him-logo.png";
import { Helmet } from "react-helmet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HRTQuizModal } from "@/components/HRTQuizModal";
import { WhyTransdermalCream } from "@/components/WhyTransdermalCream";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AssistantHub from "@/components/AssistantHub";


const HormonesMen = () => {
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isMembershipLoading, setIsMembershipLoading] = useState(false);
  const [isConsultationLoading, setIsConsultationLoading] = useState(false);

  const scrollToBooking = () => {
    const bookingSection = document.getElementById('booking-section');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleConsultationCheckout = async () => {
    setIsConsultationLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-consultation-checkout", {
        body: { serviceType: "hormone" }
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


  const handleMembershipCheckout = async () => {
    setIsMembershipLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-membership-checkout");
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      console.error("Membership checkout error:", err);
      toast.error("Failed to start checkout. Please try again or call us.");
    } finally {
      setIsMembershipLoading(false);
    }
  };

  const symptoms = [
    "Persistent fatigue and low energy",
    "Decreased sex drive and erectile dysfunction",
    "Loss of muscle mass and strength",
    "Unexplained weight gain (especially belly fat)",
    "Mood changes, irritability, and depression",
    "Poor focus and mental fog",
    "Decreased motivation and drive",
    "Poor sleep quality and insomnia"
  ];

  const howItWorks = [
    {
      step: 1,
      icon: Calendar,
      title: "In-Person Consultation",
      description: "$99 for a 30-minute visit at our Evans clinic with Lauren (credited toward labs)"
    },
    {
      step: 2,
      icon: TestTube,
      title: "Receive Your Kit",
      description: "Lauren hands you your ZRT hormone panel and explains exactly how to complete it at home"
    },
    {
      step: 3,
      icon: TrendingUp,
      title: "Start Your Membership",
      description: "Begin the Concierge Membership with your personalized TRT protocol and ongoing support"
    }
  ];

  const treatmentOptions = [
    {
      title: "Testosterone Transdermal Cream",
      description: "Our gold standard: pharmaceutical-grade liposomal cream with precision daily dosing. Unlike pellets that lock you in for months, adjust your dose weekly based on labs and how you feel."
    },
    {
      title: "Precision Daily Dosing",
      description: "Mimics your body's natural testosterone rhythm with stable morning application. No peaks and valleys—just consistent energy, mood, and drive all day."
    },
    {
      title: "Zero Injection Protocol",
      description: "100% needle-free TRT. No painful injections, no anxiety, no injection site reactions. Just smooth, effective hormone delivery through the skin."
    },
    {
      title: "Estrogen Management",
      description: "Control estrogen levels to maximize testosterone benefits and prevent side effects like water retention or gynecomastia."
    }
  ];

  const faqs = [
    {
      q: "What is testosterone replacement therapy (TRT)?",
      a: "TRT is a medically supervised treatment that restores testosterone levels to a healthy, youthful range. It's designed for men with clinically low testosterone who are experiencing symptoms like fatigue, low libido, weight gain, and decreased muscle mass."
    },
    {
      q: "How do I know if I need TRT?",
      a: "If you're experiencing symptoms of low testosterone—like persistent fatigue, low sex drive, difficulty building muscle, weight gain, or mood changes—you may benefit from TRT. We'll confirm with comprehensive lab testing and a clinical evaluation."
    },
    {
      q: "How long before I see results from TRT?",
      a: "Many men notice improvements in energy and mood within 3-4 weeks. Sexual function and muscle mass improvements typically occur over 8-12 weeks. Full optimization usually takes 3-6 months with proper dosing."
    },
    {
      q: "Why transdermal cream instead of pellets or injections?",
      a: "Our pharmaceutical-grade liposomal transdermal cream is the gold standard for TRT. Unlike pellets that lock you into a fixed dose for months (even if side effects occur), our cream allows for weekly micro-adjustments. Unlike injections that cause hormone peaks and valleys, cream provides stable daily levels that mimic your body's natural rhythm. Plus, there's no needle anxiety, no injection site reactions, and no trips to the clinic for shots."
    },
    {
      q: "Why doesn't Elevated Health offer injections?",
      a: "After years of clinical experience, we've found that transdermal cream delivers superior results for most men. Injections cause hormone fluctuations between doses (high right after injection, low before the next), which can affect mood, energy, and estrogen levels. Cream provides stable, consistent hormone levels every day. It's also completely painless, easy to adjust, and allows for true precision dosing."
    },
    {
      q: "Is TRT safe for men?",
      a: "When properly prescribed and monitored by a qualified provider, TRT is safe and effective. We monitor your blood work regularly, manage any side effects, and adjust treatment to optimize results while minimizing risks."
    },
    {
      q: "Will TRT help with weight loss and muscle gain?",
      a: "Optimized testosterone levels support healthy body composition by increasing muscle mass and reducing fat, especially abdominal fat. Combined with proper nutrition and exercise, TRT can significantly improve physique and performance."
    }
  ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "name": "Elevated Health Augusta - Men's Testosterone Therapy",
    "image": "https://elevatedhealthaugusta.com/og-image.jpg",
    "description": "Men's testosterone replacement therapy in Augusta, GA. TRT clinic for low testosterone treatment. Expert hormone optimization from board-certified providers.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": SITE_CONFIG.address.line1,
      "addressLocality": "Evans",
      "addressRegion": "GA",
      "postalCode": "30809",
      "addressCountry": "US"
    },
    "telephone": SITE_CONFIG.phone,
    "priceRange": "$149-$699",
    "medicalSpecialty": "Endocrinology",
    "availableService": [
      {
        "@type": "MedicalTherapy",
        "name": "Testosterone Replacement Therapy",
        "description": "TRT for men with low testosterone"
      },
      {
        "@type": "MedicalTest",
        "name": "Comprehensive Male Hormone Testing",
        "description": "Complete hormone panel for men"
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>Testosterone Therapy Augusta | TRT Clinic GA - Elevated Health</title>
        <meta name="description" content="Men's testosterone therapy in Augusta, GA. $99 consultation credited toward treatment. Chat with our Virtual Care Team 24/7. Board-certified TRT starting at $149/month." />
        <meta name="keywords" content="testosterone therapy Augusta, TRT clinic Augusta, men's hormone therapy GA, low testosterone treatment Augusta, men's health optimization, male hormone testing" />
        <meta property="og:title" content="Testosterone Therapy | $99 Consultation Credited | Elevated Health Augusta" />
        <meta property="og:description" content="Men's testosterone therapy in Augusta, GA. $99 consultation credited toward treatment. Chat with our Virtual Care Team 24/7." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://elevatedhealthaugusta.com/hormones/men" />
        <meta property="og:image" content="https://elevatedhealthaugusta.com/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="TRT Clinic Augusta | $99 Consultation" />
        <meta name="twitter:description" content="$99 consultation credited toward treatment. Chat with our Virtual Care Team 24/7. Board-certified TRT starting at $149/month." />
        <meta name="twitter:image" content="https://elevatedhealthaugusta.com/og-image.jpg" />
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
        <Navbar />
        
        <main>
          {/* Gender Toggle */}
          <div className="bg-card border-b sticky top-[112px] z-40">
            <div className="container mx-auto px-4 py-3">
              <div className="flex justify-center gap-4">
                <Button
                  asChild
                  variant="outline"
                  className="border-2"
                >
                  <Link to="/hormones-women">
                    <Heart className="mr-2 h-4 w-4" />
                    For Women
                  </Link>
                </Button>
                <Button
                  variant="default"
                  className="bg-primary hover:bg-primary-light text-primary-foreground"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  For Men
                </Button>
              </div>
            </div>
          </div>

          {/* Hero Section */}
          <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary-dark/5">
            <div className="container mx-auto px-3 sm:px-4 md:px-6 relative z-10">
              <div className="max-w-5xl mx-auto text-center">
                <div className="mb-8 animate-fade-in-up">
                  <img 
                    src={elevatedForHimLogo} 
                    alt="Elevated+ for Him" 
                    className="h-20 sm:h-24 md:h-32 w-auto max-w-full mx-auto"
                  />
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in-up leading-tight" style={{ animationDelay: "0.1s" }}>
                  Take Your Strength,<br />Drive, and Energy Back
                </h1>
                <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed mb-10 animate-fade-in-up max-w-3xl mx-auto" style={{ animationDelay: "0.2s" }}>
                  Expert testosterone replacement therapy and men's hormone optimization in Augusta. Reclaim your performance, vitality, and confidence.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                  <Button
                    onClick={() => setIsQuizOpen(true)}
                    size="lg"
                    className="bg-primary hover:bg-primary-light text-primary-foreground text-base md:text-lg px-8 py-6 shadow-lg w-full sm:w-auto"
                  >
                    <Zap className="mr-2 h-5 w-5" />
                    Start Your Evaluation
                  </Button>
                  <Button
                    onClick={scrollToBooking}
                    variant="outline"
                    size="lg"
                    className="text-base md:text-lg px-8 py-6 border-2 border-primary hover:bg-primary hover:text-primary-foreground w-full sm:w-auto"
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    Schedule a Consult
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Symptoms of Low T */}
          <section className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    Symptoms of Low Testosterone
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Low testosterone affects more than just your sex drive. It impacts your entire quality of life.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {symptoms.map((symptom, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow border-primary/20">
                      <CardContent className="p-6">
                        <div className="flex gap-4 items-center">
                          <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                          <span className="text-base leading-relaxed">{symptom}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* How TRT Works */}
          <section className="py-16 md:py-24 bg-primary/5">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    How TRT & Men's HRT Works
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    A straightforward, evidence-based approach to restoring your hormonal health.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                  {howItWorks.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <Card key={index} className="text-center hover:shadow-lg transition-all hover:-translate-y-1 border-primary/20">
                        <CardContent className="p-6">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                            <Icon className="h-8 w-8 text-primary" />
                          </div>
                          <div className="text-2xl font-bold text-primary mb-2">Step {item.step}</div>
                          <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Delivery Methods Section */}
          <section className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4 font-serif">
                    The Gold Standard in Testosterone Delivery
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    We use pharmaceutical-grade Liposomal Transdermal Cream—the pinnacle of TRT technology. 
                    Unlike pellets that lock you into a dose for months, or injections that cause peaks and valleys, 
                    our cream allows for precision daily dosing with weekly micro-adjustments based on how you feel.
                  </p>
                </div>
                
                <div className="max-w-3xl mx-auto">
                  {/* Single Card: Liposomal Transdermal Cream */}
                  <Card className="border-gold/30 hover:shadow-xl transition-all">
                    <CardContent className="p-8 md:p-10">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center">
                          <Droplet className="h-7 w-7 text-gold" />
                        </div>
                        <div>
                          <span className="text-xs font-semibold bg-gold/10 text-gold px-3 py-1 rounded-full">
                            EXCLUSIVE DELIVERY METHOD
                          </span>
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold mb-4">
                        Liposomal Transdermal Cream
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        A high-potency, pharmaceutical-grade cream applied daily to large hairless muscle areas 
                        (shoulder or thigh). Our proprietary liposomal base ensures deep absorption without the 
                        sticky residue of standard gels.
                      </p>
                      
                      <div className="grid sm:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-sm">Mimics Natural Rhythm</p>
                              <p className="text-xs text-muted-foreground">Morning application matches your body's circadian testosterone cycle</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-sm">No Peaks & Valleys</p>
                              <p className="text-xs text-muted-foreground">Stable energy and mood all day, unlike injection fluctuations</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-sm">Weekly Dose Adjustments</p>
                              <p className="text-xs text-muted-foreground">Fine-tune your protocol based on labs and how you feel</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-sm">Zero Needle Anxiety</p>
                              <p className="text-xs text-muted-foreground">No injections, no pain, no injection site reactions</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-sm">Superior Absorption</p>
                              <p className="text-xs text-muted-foreground">Liposomal technology for pharmaceutical-grade delivery</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-sm">Better Estrogen Control</p>
                              <p className="text-xs text-muted-foreground">Steady levels = fewer estrogen-related side effects</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                        <p className="text-sm text-center">
                          <span className="font-semibold">Why not pellets?</span>{" "}
                          <span className="text-muted-foreground">
                            Pellets lock you into a dose for months—even if side effects occur. 
                            With cream, we can adjust your dose weekly based on real results.
                          </span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>

          {/* Why Transdermal Cream Educational Section */}
          <WhyTransdermalCream onBookConsultation={scrollToBooking} />

          {/* Treatment Options */}
          <section className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    Men's Hormone Treatment Options
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Customized testosterone and hormone therapy tailored to your goals and lifestyle.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {treatmentOptions.map((option, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow border-primary/20">
                      <CardContent className="p-6">
                        <h3 className="font-bold text-lg mb-3 text-primary">{option.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{option.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Getting Started - 3 Step Process */}
          <section className="py-16 md:py-24 bg-primary/5">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    Getting Started: Your 3-Step Journey
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    A clear, transparent path to testosterone optimization with no surprises.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                  {/* Step 1 - Discovery Consultation */}
                  <Card className="hover:shadow-xl transition-shadow border-primary/30 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
                    <CardContent className="p-8">
                      <div className="text-5xl font-bold text-primary/20 mb-4">01</div>
                      <h3 className="text-xl font-bold mb-2">Discovery Consultation</h3>
                      <div className="text-3xl font-bold text-primary mb-2">$99</div>
                      <p className="text-xs text-green-600 font-medium mb-4">
                        Includes $99 credit toward Diagnostics
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        A 15-minute consultation to discuss your goals and determine if you are a candidate for testosterone optimization.
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1.5 mb-4">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                          Symptom & history review
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                          Personalized recommendations
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                          $99 credit if you proceed
                        </li>
                      </ul>
                      <Button 
                        onClick={handleConsultationCheckout}
                        disabled={isConsultationLoading}
                        className="w-full bg-primary hover:bg-primary-light text-primary-foreground"
                      >
                        {isConsultationLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <CreditCard className="mr-2 h-4 w-4" />
                        )}
                        {isConsultationLoading ? "Processing..." : "Book Consultation - $99"}
                      </Button>
                      <p className="text-[10px] text-muted-foreground text-center mt-3 italic">
                        Not ready to commit? Call us at {SITE_CONFIG.phone}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Step 2 */}
                  <Card className="hover:shadow-xl transition-shadow border-2 border-primary shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
                    <div className="absolute -top-4 right-4 top-3">
                      <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                        Required Before Treatment
                      </span>
                    </div>
                    <CardContent className="p-8">
                      <div className="text-5xl font-bold text-primary/20 mb-4">02</div>
                      <h3 className="text-xl font-bold mb-2">The Hormone Mapping Experience</h3>
                      <div className="text-3xl font-bold text-primary mb-4">$349</div>
                      <p className="text-xs text-green-600 font-medium mb-4">
                        → $250 after $99 consultation credit
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        This comprehensive diagnostic phase includes:
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          Comprehensive Hormone Panel – Powered by ZRT Diagnostics
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          Clinical Lab Review with Lauren Bursey, NP
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          Customized TRT Protocol Design
                        </li>
                      </ul>
                      <p className="text-xs text-muted-foreground italic mb-4">
                        This fee covers your diagnostics and provider time. There is no obligation to proceed with treatment.
                      </p>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                        <p className="text-xs text-amber-800 font-medium text-center">
                          ⬆️ Complete Step 1 first to unlock Hormone Mapping
                        </p>
                      </div>
                      <Button 
                        variant="outline"
                        disabled
                        className="w-full border-primary/50 text-muted-foreground"
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Book Consultation First
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Step 3 */}
                  <Card className="hover:shadow-xl transition-shadow border-primary/30 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
                    <CardContent className="p-8">
                      <div className="text-5xl font-bold text-primary/20 mb-4">03</div>
                      <h3 className="text-xl font-bold mb-2">The Concierge Membership</h3>
                      <div className="text-3xl font-bold text-primary mb-4">$399<span className="text-lg font-normal">/mo</span></div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Once your protocol is designed, your monthly membership covers:
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          Your testosterone prescription
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          Ongoing monitoring & dose optimization
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          Direct provider access
                        </li>
                      </ul>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                        <p className="text-xs text-amber-800 font-medium text-center">
                          ⬆️ Complete Steps 1 & 2 first to unlock Membership
                        </p>
                      </div>
                      <Button 
                        variant="outline"
                        disabled
                        className="w-full border-primary/50 text-muted-foreground"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Book Consultation First
                      </Button>
                      <p className="text-[10px] text-muted-foreground text-center mt-3 italic">
                        Your provider will enroll you after your consultation and lab review.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Precision Dosing Advantage */}
                <Card className="mt-12 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30">
                  <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                          <Target className="h-8 w-8 text-primary" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">The Precision Dosing Advantage</h3>
                        <p className="text-muted-foreground">
                          Unlike pellets, which lock you into a dose for months even if side effects occur, our <strong>injection and cream protocols allow for weekly micro-adjustments</strong> to ensure optimal testosterone levels. We can fine-tune your therapy in real-time based on how you feel and your lab results.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Provider Section */}
          <section className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="relative h-[500px] rounded-lg overflow-hidden shadow-xl">
                    <img 
                      src={providerPortrait} 
                      alt="Lauren Bursey, NP-C" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                      Expert Men's Hormone Therapy
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                      Our board-certified nurse practitioner specializes in men's hormone optimization and testosterone replacement therapy, helping men reclaim their strength and vitality.
                    </p>
                    <ul className="space-y-4 mb-8">
                      <li className="flex gap-3 items-start">
                        <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                        <span>Specialized training in testosterone therapy and men's health</span>
                      </li>
                      <li className="flex gap-3 items-start">
                        <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                        <span>Evidence-based protocols for optimal hormone optimization</span>
                      </li>
                      <li className="flex gap-3 items-start">
                        <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                        <span>Personalized approach focused on your performance goals</span>
                      </li>
                    </ul>
                    <Button
                      onClick={scrollToBooking}
                      size="lg"
                      className="bg-primary hover:bg-primary-light text-primary-foreground"
                    >
                      <Calendar className="mr-2 h-5 w-5" />
                      Schedule Your Consult
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQs */}
          <section className="py-16 md:py-24 bg-primary/5">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    Men's TRT FAQ
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Your questions about testosterone therapy, answered.
                  </p>
                </div>
                
                <Accordion type="single" collapsible className="space-y-4">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6 bg-card">
                      <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline py-6 hover:text-primary">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-base text-muted-foreground leading-relaxed pb-6">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </section>

          {/* Final CTA / Booking */}
          <section id="booking-section" className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-primary-dark/5">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                  <img 
                    src={elevatedForHimLogo} 
                    alt="Elevated+ for Him" 
                    className="h-24 mx-auto mb-6"
                  />
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                    Ready to Reclaim Your Edge?
                  </h2>
                  <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                    Take the first step toward optimal testosterone levels and peak performance. Our expert team is ready to help you succeed.
                  </p>
                </div>

                <Card className="shadow-2xl overflow-hidden">
                  <CardContent className="p-8 md:p-12">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold mb-4">Book Your $99 Discovery Consultation</h3>
                      <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                        Your $99 consultation fee is credited toward your labs or membership when you proceed with treatment.
                      </p>
                      <Button
                        onClick={handleConsultationCheckout}
                        disabled={isConsultationLoading}
                        size="lg"
                        className="bg-primary hover:bg-primary-light text-primary-foreground text-lg px-10 py-7 shadow-lg"
                      >
                        {isConsultationLoading ? (
                          "Processing..."
                        ) : (
                          <>
                            <Calendar className="mr-2 h-5 w-5" />
                            Pay $99 & Schedule Your Consultation
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="border-t pt-8">
                      <p className="text-center text-lg mb-6 font-semibold">
                        Prefer to speak with us directly?
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                          asChild
                          size="lg"
                          variant="outline"
                          className="border-2 border-primary hover:bg-primary hover:text-primary-foreground text-lg px-8 py-6 w-full sm:w-auto"
                        >
                          <a href={`tel:${SITE_CONFIG.phoneRaw}`}>
                            <Phone className="mr-2 h-5 w-5" />
                            Call Now — {SITE_CONFIG.phone}
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </main>

        <Footer />
        <AssistantHub />
        <HRTQuizModal isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
      </div>
    </>
  );
};

export default HormonesMen;
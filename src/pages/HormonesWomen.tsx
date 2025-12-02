import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CheckCircle2, 
  Heart, 
  Sparkles, 
  Activity, 
  Calendar,
  Phone,
  ClipboardList,
  Users,
  TestTube,
  UserCheck,
  TrendingUp,
  Shield,
  CreditCard,
  Loader2
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SITE_CONFIG } from "@/lib/siteConfig";
import elevatedForHerLogo from "@/assets/elevated-for-her-logo.png";
import providerPortrait from "@/assets/provider-portrait.jpg";
import { Helmet } from "react-helmet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HRTQuizModal } from "@/components/HRTQuizModal";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const HormonesWomen = () => {
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isMembershipLoading, setIsMembershipLoading] = useState(false);

  const scrollToBooking = () => {
    const bookingSection = document.getElementById('booking-section');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCheckout = async () => {
    setIsCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-hormone-checkout");
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Failed to start checkout. Please try again or call us.");
    } finally {
      setIsCheckoutLoading(false);
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
    "Hot flashes and night sweats",
    "Persistent fatigue and low energy",
    "Mood swings, anxiety, or depression",
    "Difficulty sleeping or insomnia",
    "Unexplained weight gain",
    "Decreased libido and vaginal dryness",
    "Brain fog and memory issues",
    "Hair thinning or loss"
  ];

  const howItWorks = [
    {
      step: 1,
      icon: ClipboardList,
      title: "Take Your Assessment",
      description: "Complete our comprehensive women's hormone questionnaire"
    },
    {
      step: 2,
      icon: TestTube,
      title: "Get Your Labs",
      description: "Comprehensive hormone panel including estrogen, progesterone, testosterone, thyroid"
    },
    {
      step: 3,
      icon: UserCheck,
      title: "Consultation",
      description: "Review results with our nurse practitioner and create your personalized plan"
    },
    {
      step: 4,
      icon: TrendingUp,
      title: "Start Treatment & Monitor",
      description: "Begin your personalized therapy with ongoing support and adjustments"
    }
  ];

  const treatmentOptions = [
    {
      title: "Bioidentical Estrogen",
      description: "Molecularly identical to your body's natural estrogen for symptom relief"
    },
    {
      title: "Progesterone Therapy",
      description: "Balance and protect uterine health while improving sleep and mood"
    },
    {
      title: "Topical Transdermal Cream",
      description: "Precision dosing with daily micro-adjustments—unlike pellets, you're never locked into a dose"
    },
    {
      title: "Thyroid Optimization",
      description: "Support metabolism, energy, and mood with thyroid hormone balance"
    },
    {
      title: "Testosterone (for Women)",
      description: "Low-dose testosterone to restore energy, libido, and muscle tone"
    },
    {
      title: "Peptide Add-Ons",
      description: "Advanced therapies for enhanced results and anti-aging benefits"
    }
  ];

  const faqs = [
    {
      q: "What is bioidentical hormone replacement therapy (BHRT)?",
      a: "Bioidentical hormones are derived from natural plant sources and are molecularly identical to the hormones your body produces. This means they work more naturally with your body's chemistry, often with fewer side effects than synthetic hormones."
    },
    {
      q: "Am I a good candidate for women's HRT?",
      a: "If you're experiencing symptoms of perimenopause, menopause, or hormone imbalance such as hot flashes, mood changes, low energy, or decreased libido, you may be a great candidate. We'll review your symptoms and lab work to create a personalized plan."
    },
    {
      q: "How long does it take to feel results?",
      a: "Many women notice improvements in hot flashes and mood within 2-4 weeks. Energy levels, sleep quality, and other symptoms typically improve over 2-3 months as your hormones reach optimal levels."
    },
    {
      q: "Why transdermal cream instead of pellets?",
      a: "Unlike pellets, which lock you into a dose for months even if side effects occur, our Transdermal Cream protocols allow for daily micro-adjustments to ensure you feel your best every single day. This precision dosing approach means we can fine-tune your therapy in real-time."
    },
    {
      q: "Is HRT safe for women?",
      a: "When properly prescribed and monitored, bioidentical HRT is safe and effective for most women. We follow current NAMS (North American Menopause Society) guidelines and customize treatment based on your individual health profile and risk factors."
    },
    {
      q: "Will HRT help with weight loss?",
      a: "Balanced hormones can support healthy metabolism and make weight management easier. Many women find it easier to maintain a healthy weight when their hormones are optimized, especially when combined with nutrition and exercise."
    }
  ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "name": "Elevated Health Augusta - Women's Hormone Therapy",
    "image": "https://elevatedhealthaugusta.com/og-image.jpg",
    "description": "Women's hormone replacement therapy in Augusta, GA. Bioidentical HRT for menopause, perimenopause, and hormone imbalance. Expert care from board-certified providers.",
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
        "name": "Women's Bioidentical Hormone Replacement Therapy",
        "description": "Personalized BHRT for menopause and perimenopause"
      },
      {
        "@type": "MedicalTest",
        "name": "Comprehensive Hormone Testing",
        "description": "Complete hormone panel for women"
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>Women's Hormone Therapy Augusta | Menopause Treatment GA - Elevated Health</title>
        <meta name="description" content="Women's bioidentical hormone replacement therapy in Augusta, GA. Expert treatment for menopause, perimenopause, hot flashes, and hormone imbalance. Board-certified care starting at $149/month." />
        <meta name="keywords" content="women's hormone therapy Augusta, menopause treatment Augusta, perimenopause treatment GA, estrogen progesterone balance, female hormone testing Augusta, BHRT for women" />
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-feminine/5 to-background">
        <Navbar />
        
        <main>
          {/* Gender Toggle */}
          <div className="bg-card border-b sticky top-16 z-40">
            <div className="container mx-auto px-4 py-3">
              <div className="flex justify-center gap-4">
                <Button
                  variant="default"
                  className="bg-feminine hover:bg-feminine-light text-feminine-foreground"
                >
                  <Heart className="mr-2 h-4 w-4" />
                  For Women
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-2"
                >
                  <Link to="/hormones-men">
                    <Shield className="mr-2 h-4 w-4" />
                    For Men
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Hero Section */}
          <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-feminine/10 via-background to-feminine/5"></div>
            <div className="container mx-auto px-4 sm:px-6 relative z-10">
              <div className="max-w-5xl mx-auto text-center">
                <img 
                  src={elevatedForHerLogo} 
                  alt="Elevated+ for Her" 
                  className="h-32 mx-auto mb-8 animate-fade-in-up"
                />
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in-up leading-tight" style={{ animationDelay: "0.1s" }}>
                  Finally Feel Like<br />Yourself Again
                </h1>
                <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed mb-10 animate-fade-in-up max-w-3xl mx-auto" style={{ animationDelay: "0.2s" }}>
                  Personalized bioidentical hormone replacement therapy for women in Augusta. Say goodbye to hot flashes, fatigue, and hormonal chaos.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                  <Button
                    onClick={() => setIsQuizOpen(true)}
                    size="lg"
                    className="bg-feminine hover:bg-feminine-light text-feminine-foreground text-base md:text-lg px-8 py-6 shadow-lg w-full sm:w-auto"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Start Your Assessment
                  </Button>
                  <Button
                    onClick={scrollToBooking}
                    variant="outline"
                    size="lg"
                    className="text-base md:text-lg px-8 py-6 border-2 border-feminine hover:bg-feminine hover:text-feminine-foreground w-full sm:w-auto"
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    Book a Consultation
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* What We Treat */}
          <section className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    Symptoms We Treat with Women's HRT
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    If hormonal changes are affecting your quality of life, you're not alone. We help women reclaim their vitality.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {symptoms.map((symptom, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow border-feminine/20">
                      <CardContent className="p-6">
                        <div className="flex gap-4 items-center">
                          <CheckCircle2 className="h-6 w-6 text-feminine flex-shrink-0" />
                          <span className="text-base leading-relaxed">{symptom}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="py-16 md:py-24 bg-feminine/5">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    How Our Women's HRT Works
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    A simple, supportive process designed to restore your hormonal balance and well-being.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {howItWorks.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <Card key={index} className="text-center hover:shadow-lg transition-all hover:-translate-y-1">
                        <CardContent className="p-6">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-feminine/10 mb-4">
                            <Icon className="h-8 w-8 text-feminine" />
                          </div>
                          <div className="text-2xl font-bold text-feminine mb-2">Step {item.step}</div>
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

          {/* Treatment Options */}
          <section className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    Female-Specific Hormone Options
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Personalized treatment plans tailored to your unique hormonal needs.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {treatmentOptions.map((option, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow border-feminine/20">
                      <CardContent className="p-6">
                        <h3 className="font-bold text-lg mb-3 text-feminine">{option.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{option.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Getting Started - 3 Step Process */}
          <section className="py-16 md:py-24 bg-feminine/5">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    Getting Started: Your 3-Step Journey
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    A clear, transparent path to hormonal optimization with no surprises.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                  {/* Step 1 */}
                  <Card className="hover:shadow-xl transition-shadow border-feminine/30 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-feminine"></div>
                    <CardContent className="p-8">
                      <div className="text-5xl font-bold text-feminine/20 mb-4">01</div>
                      <h3 className="text-xl font-bold mb-2">The Discovery Call</h3>
                      <div className="text-3xl font-bold text-feminine mb-4">Complimentary</div>
                      <p className="text-sm text-muted-foreground mb-6">
                        A 15-minute phone consultation to discuss your goals and determine if you are a candidate for bio-identical optimization.
                      </p>
                      <Button 
                        onClick={scrollToBooking}
                        variant="outline" 
                        className="w-full border-feminine hover:bg-feminine hover:text-feminine-foreground"
                      >
                        <Phone className="mr-2 h-4 w-4" />
                        Schedule Call
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Step 2 */}
                  <Card className="hover:shadow-xl transition-shadow border-2 border-feminine shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-feminine"></div>
                    <div className="absolute -top-4 right-4 top-3">
                      <span className="bg-feminine text-feminine-foreground px-3 py-1 rounded-full text-xs font-semibold">
                        Required Before Treatment
                      </span>
                    </div>
                    <CardContent className="p-8">
                      <div className="text-5xl font-bold text-feminine/20 mb-4">02</div>
                      <h3 className="text-xl font-bold mb-2">The Hormone Mapping Experience</h3>
                      <div className="text-3xl font-bold text-feminine mb-4">$299</div>
                      <p className="text-sm text-muted-foreground mb-4">
                        This comprehensive diagnostic phase includes:
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-feminine flex-shrink-0 mt-0.5" />
                          Your At-Home ZRT Saliva Test Kit (shipped to your door)
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-feminine flex-shrink-0 mt-0.5" />
                          45-Minute Deep-Dive Clinical Review with Lauren Bursey, NP
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-feminine flex-shrink-0 mt-0.5" />
                          Customized Protocol Design
                        </li>
                      </ul>
                      <p className="text-xs text-muted-foreground italic mb-4">
                        This fee covers your diagnostics and provider time. There is no obligation to proceed with treatment.
                      </p>
                      <Button 
                        onClick={handleCheckout}
                        disabled={isCheckoutLoading}
                        className="w-full bg-feminine hover:bg-feminine-light text-feminine-foreground"
                      >
                        {isCheckoutLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <CreditCard className="mr-2 h-4 w-4" />
                        )}
                        {isCheckoutLoading ? "Processing..." : "Get Started - $299"}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Step 3 */}
                  <Card className="hover:shadow-xl transition-shadow border-feminine/30 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-feminine"></div>
                    <CardContent className="p-8">
                      <div className="text-5xl font-bold text-feminine/20 mb-4">03</div>
                      <h3 className="text-xl font-bold mb-2">The Concierge Membership</h3>
                      <div className="text-3xl font-bold text-feminine mb-4">$399<span className="text-lg font-normal">/mo</span></div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Once your protocol is designed, your monthly membership covers:
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-feminine flex-shrink-0 mt-0.5" />
                          Your prescription medications
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-feminine flex-shrink-0 mt-0.5" />
                          Ongoing monitoring & adjustments
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-feminine flex-shrink-0 mt-0.5" />
                          Direct provider access
                        </li>
                      </ul>
                      <Button 
                        onClick={handleMembershipCheckout}
                        disabled={isMembershipLoading}
                        variant="outline" 
                        className="w-full border-feminine hover:bg-feminine hover:text-feminine-foreground"
                      >
                        {isMembershipLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <CreditCard className="mr-2 h-4 w-4" />
                        )}
                        {isMembershipLoading ? "Processing..." : "Apply for Membership"}
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Transdermal Advantage */}
                <Card className="mt-12 bg-gradient-to-r from-feminine/10 to-feminine/5 border-feminine/30">
                  <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-feminine/20 flex items-center justify-center">
                          <Activity className="h-8 w-8 text-feminine" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">The Transdermal Cream Advantage</h3>
                        <p className="text-muted-foreground">
                          Unlike pellets, which lock you into a dose for months even if side effects occur, our <strong>Transdermal Cream protocols allow for daily micro-adjustments</strong> to ensure you feel your best every single day. Precision dosing means we can fine-tune your therapy in real-time.
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
                      Expert, Compassionate Care for Women
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                      Our board-certified nurse practitioner, Lauren Bursey, specializes in women's hormone health and understands the unique challenges of hormonal transitions.
                    </p>
                    <ul className="space-y-4 mb-8">
                      <li className="flex gap-3 items-start">
                        <CheckCircle2 className="h-6 w-6 text-feminine flex-shrink-0 mt-0.5" />
                        <span>Specialized training in bioidentical hormone therapy</span>
                      </li>
                      <li className="flex gap-3 items-start">
                        <CheckCircle2 className="h-6 w-6 text-feminine flex-shrink-0 mt-0.5" />
                        <span>Patient-centered, individualized treatment approach</span>
                      </li>
                      <li className="flex gap-3 items-start">
                        <CheckCircle2 className="h-6 w-6 text-feminine flex-shrink-0 mt-0.5" />
                        <span>Evidence-based protocols following NAMS guidelines</span>
                      </li>
                    </ul>
                    <Button
                      onClick={scrollToBooking}
                      size="lg"
                      className="bg-feminine hover:bg-feminine-light text-feminine-foreground"
                    >
                      <Calendar className="mr-2 h-5 w-5" />
                      Schedule with Lauren
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQs */}
          <section className="py-16 md:py-24 bg-feminine/5">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    Women's HRT FAQ
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Your questions about hormone replacement therapy, answered.
                  </p>
                </div>
                
                <Accordion type="single" collapsible className="space-y-4">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6 bg-card">
                      <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline py-6 hover:text-feminine">
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
          <section id="booking-section" className="py-16 md:py-24 bg-gradient-to-br from-feminine/10 via-background to-feminine/5">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                  <img 
                    src={elevatedForHerLogo} 
                    alt="Elevated+ for Her" 
                    className="h-24 mx-auto mb-6"
                  />
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                    Ready to Feel Like Yourself Again?
                  </h2>
                  <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                    Take the first step toward hormonal balance and renewed vitality. Our compassionate team is here to support you.
                  </p>
                </div>

                <Card className="shadow-2xl overflow-hidden">
                  <CardContent className="p-8 md:p-12">
                    <div className="mb-8">
                      <h3 className="text-2xl font-bold mb-6 text-center">Schedule Your Free Consultation</h3>
                      <div className="w-full h-[600px] rounded-lg overflow-hidden">
                        <iframe 
                          src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ1hhrEVpqc7nipsCg8QbgW72gW8vbl-SnUXT-LL4z4zFT1w8jTUBr5cfiruiNd47uu28seod93b?gv=true"
                          className="w-full h-full border-0"
                          title="Book Women's Hormone Consultation"
                        />
                      </div>
                    </div>

                    <div className="border-t pt-8">
                      <p className="text-center text-lg mb-6 font-semibold">
                        Prefer to speak with us directly?
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                          asChild
                          size="lg"
                          className="bg-feminine hover:bg-feminine-light text-feminine-foreground text-lg px-8 py-6 w-full sm:w-auto"
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
        <HRTQuizModal isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
      </div>
    </>
  );
};

export default HormonesWomen;
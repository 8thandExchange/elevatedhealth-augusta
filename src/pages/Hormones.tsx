import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CheckCircle2, 
  Award, 
  Heart, 
  Microscope, 
  UserCheck, 
  FileText, 
  Pill, 
  TrendingUp, 
  MessageSquare,
  Zap,
  Moon,
  Smile,
  Target,
  Activity,
  Brain,
  Phone,
  Calendar
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SITE_CONFIG } from "@/lib/siteConfig";
import clinicInterior from "@/assets/clinic-interior.jpg";
import { Helmet } from "react-helmet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Hormones = () => {
  const scrollToBooking = () => {
    const bookingSection = document.getElementById('booking-section');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const menSymptoms = [
    "Low energy and persistent fatigue",
    "Difficulty focusing and brain fog",
    "Unexplained weight gain",
    "Decreased libido and sexual function",
    "Increased irritability and mood changes",
    "Poor sleep quality",
    "Reduced muscle strength and mass",
    "Loss of motivation"
  ];

  const womenSymptoms = [
    "Hot flashes and night sweats",
    "Mood swings and anxiety",
    "Sleep disturbances",
    "Unexplained weight gain",
    "Decreased libido",
    "Irregular or absent menstrual cycles",
    "Brain fog and memory issues",
    "Vaginal dryness"
  ];

  const approachSteps = [
    {
      icon: Microscope,
      title: "Comprehensive Lab Testing",
      description: "In-depth hormone panel to identify specific imbalances"
    },
    {
      icon: UserCheck,
      title: "Deep Clinical Evaluation",
      description: "Thorough assessment of symptoms, health history, and lifestyle"
    },
    {
      icon: FileText,
      title: "Personalized Treatment Plan",
      description: "Custom protocol designed for your unique needs and goals"
    },
    {
      icon: Pill,
      title: "Medication Options",
      description: "Testosterone, estrogen, progesterone, and thyroid optimization"
    },
    {
      icon: TrendingUp,
      title: "Ongoing Monitoring",
      description: "Regular follow-ups and dose adjustments for optimal results"
    },
    {
      icon: Heart,
      title: "Whole-Body Wellness",
      description: "Integrated approach with weight loss and mental health support"
    }
  ];

  const programIncludes = [
    "Comprehensive hormone lab panel (testosterone, estrogen, progesterone, thyroid, cortisol)",
    "In-depth provider consultation and review",
    "Personalized bioidentical hormone therapy plan",
    "Monthly follow-up appointments",
    "Direct messaging support with our clinical team",
    "Ongoing dose titration and optimization",
    "Coordination with weight loss programs (if appropriate)",
    "Integration with mental health services (ketamine therapy)"
  ];

  const testimonials = [
    {
      quote: "After years of feeling exhausted, my energy is finally back. I feel like myself again.",
      author: "HRT Patient"
    },
    {
      quote: "My mood and sleep improved more than I imagined. The whole team has been incredible.",
      author: "HRT Patient"
    },
    {
      quote: "I wish I had done this years ago. The difference in my quality of life is remarkable.",
      author: "HRT Patient"
    }
  ];

  const faqs = [
    {
      q: "What hormones do you treat?",
      a: "We treat a full spectrum of hormone imbalances including testosterone, estrogen, progesterone, thyroid hormones (T3, T4, TSH), and cortisol. Our treatment plans are customized based on your specific lab results and symptoms."
    },
    {
      q: "How long until I feel results?",
      a: "Many patients notice improvements in energy and mood within 2-4 weeks of starting treatment. Full optimization typically occurs over 3-6 months as we fine-tune your hormone levels to achieve optimal balance."
    },
    {
      q: "Do you treat both men and women?",
      a: "Yes! We provide hormone optimization therapy for both men and women. Hormone imbalances affect people differently based on age, gender, and individual health factors, and we tailor treatment accordingly."
    },
    {
      q: "Are labs required?",
      a: "Yes, comprehensive lab testing is essential to safely and effectively optimize your hormones. We need to know your baseline levels before treatment and monitor your progress to ensure optimal results and safety."
    },
    {
      q: "Do you accept insurance?",
      a: "We accept many insurance plans. Coverage varies by plan and specific treatments. Our team will verify your benefits and discuss all costs transparently before you begin treatment. Labs may be covered separately."
    },
    {
      q: "Is hormone replacement therapy safe?",
      a: "When properly monitored by a qualified healthcare provider, bioidentical hormone replacement therapy is safe and effective. We use evidence-based protocols and closely monitor your progress to ensure the best outcomes."
    }
  ];

  return (
    <>
      <Helmet>
        <title>Hormone Replacement Therapy Augusta | BHRT for Men & Women - Elevated Health</title>
        <meta name="description" content="Restore balance and vitality with bioidentical hormone replacement therapy in Augusta, GA. Comprehensive hormone optimization for men and women. Starting at $149/month." />
        <meta name="keywords" content="hormone replacement Augusta, BHRT Augusta GA, bioidentical hormones Georgia, testosterone therapy Augusta, hormone optimization, menopause treatment Augusta" />
      </Helmet>

      <div className="min-h-screen">
        <Navbar />
        
        <main>
          {/* Hero Section */}
          <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-br from-accent/10 via-background to-accent/5 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-subtle opacity-50"></div>
            <div className="container mx-auto px-4 sm:px-6 relative z-10">
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in-up leading-tight">
                  Restore Balance.<br />Renew Your Vitality.
                </h1>
                <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed mb-10 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                  Comprehensive hormone optimization for men and women in Augusta.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                  <Button
                    onClick={scrollToBooking}
                    size="lg"
                    className="bg-hope hover:bg-hope-light text-hope-foreground text-base md:text-lg px-8 py-6 shadow-lg w-full sm:w-auto"
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    Book Your Free Consultation
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="text-base md:text-lg px-8 py-6 border-2 border-primary hover:bg-primary hover:text-primary-foreground w-full sm:w-auto"
                  >
                    <a href={`tel:${SITE_CONFIG.phoneRaw}`}>
                      <Phone className="mr-2 h-5 w-5" />
                      Call Our Clinic
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Intro Section */}
          <section className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                      Comprehensive Hormone Care in Augusta
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                      Hormone imbalances can affect your energy, mood, sleep, metabolism, libido, and overall well-being. 
                    </p>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      Elevated Health Augusta offers personalized, medically supervised hormone replacement therapy designed to help you feel like yourself again. Our compassionate team combines clinical expertise with a whole-person approach to wellness.
                    </p>
                  </div>
                  <div className="relative h-[400px] rounded-lg overflow-hidden shadow-lg">
                    <img 
                      src={clinicInterior} 
                      alt="Elevated Health Augusta clinic interior" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Symptoms Checklist */}
          <section className="py-16 md:py-24 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    Is Hormone Therapy Right for You?
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Hormone imbalances affect men and women differently. See if you recognize any of these symptoms.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Men's Symptoms */}
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <Target className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold">Men</h3>
                      </div>
                      <ul className="space-y-3">
                        {menSymptoms.map((symptom, index) => (
                          <li key={index} className="flex gap-3 items-start">
                            <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                            <span className="text-base leading-relaxed">{symptom}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Women's Symptoms */}
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-accent/10 rounded-lg">
                          <Activity className="h-6 w-6 text-accent" />
                        </div>
                        <h3 className="text-2xl font-bold">Women</h3>
                      </div>
                      <ul className="space-y-3">
                        {womenSymptoms.map((symptom, index) => (
                          <li key={index} className="flex gap-3 items-start">
                            <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                            <span className="text-base leading-relaxed">{symptom}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>

          {/* Our Approach */}
          <section className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    Our Approach to Hormone Optimization
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Evidence-based, personalized care that treats the whole you—not just your symptoms.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {approachSteps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <Card key={index} className="p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                        <div className="flex flex-col items-center text-center">
                          <div className="p-4 bg-accent/10 rounded-full mb-4">
                            <Icon className="h-8 w-8 text-accent" />
                          </div>
                          <h3 className="font-bold text-xl mb-3">{step.title}</h3>
                          <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* What's Included */}
          <section className="py-16 md:py-24 bg-primary/5">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    What's Included in Your Program
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Comprehensive support every step of your hormone optimization journey.
                  </p>
                </div>
                
                <Card className="shadow-xl">
                  <CardContent className="p-8 md:p-10">
                    <ul className="space-y-4">
                      {programIncludes.map((item, index) => (
                        <li key={index} className="flex gap-4 items-start">
                          <CheckCircle2 className="h-6 w-6 text-hope flex-shrink-0 mt-0.5" />
                          <span className="text-base md:text-lg leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    Transparent, Affordable Pricing
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    We believe quality healthcare should be accessible and straightforward.
                  </p>
                </div>
                
                <Card className="shadow-2xl border-2 border-accent/20">
                  <CardContent className="p-8 md:p-12 text-center">
                    <div className="mb-6">
                      <div className="inline-block p-4 bg-accent/10 rounded-full mb-4">
                        <Heart className="h-12 w-12 text-accent" />
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold mb-2">
                        Hormone Optimization Membership
                      </h3>
                      <div className="my-6">
                        <span className="text-5xl md:text-6xl font-bold text-accent">$149</span>
                        <span className="text-2xl text-muted-foreground">/month</span>
                      </div>
                      <p className="text-lg text-muted-foreground mb-6">
                        Includes follow-ups, support, and monitoring
                      </p>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          * Labs billed separately unless included in special programs. We'll review all costs during your free consultation.
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={scrollToBooking}
                      size="lg"
                      className="bg-hope hover:bg-hope-light text-hope-foreground text-lg px-10 py-6 shadow-lg w-full sm:w-auto"
                    >
                      Get Started Today
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-16 md:py-24 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    Real Results from Real Patients
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    See what hormone optimization has done for our patients.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                  {testimonials.map((testimonial, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-8">
                        <div className="mb-4">
                          <svg className="h-8 w-8 text-accent/30" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                          </svg>
                        </div>
                        <p className="text-lg mb-6 leading-relaxed">{testimonial.quote}</p>
                        <p className="text-sm font-semibold text-muted-foreground">— {testimonial.author}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    Frequently Asked Questions
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Everything you need to know about hormone replacement therapy.
                  </p>
                </div>
                
                <Accordion type="single" collapsible className="space-y-4">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6 bg-card">
                      <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline py-6">
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

          {/* Booking Section */}
          <section id="booking-section" className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-accent/5">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                    Ready to Restore Your Balance?
                  </h2>
                  <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                    Schedule your free hormone consultation today. Our team is here to answer your questions and create a personalized plan for your wellness journey.
                  </p>
                </div>

                <Card className="shadow-2xl overflow-hidden">
                  <CardContent className="p-8 md:p-12">
                    <div className="mb-8">
                      <h3 className="text-2xl font-bold mb-6 text-center">Book Your Free Consultation</h3>
                      <div className="w-full h-[600px] rounded-lg overflow-hidden">
                        <iframe 
                          src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ1hhrEVpqc7nipsCg8QbgW72gW8vbl-SnUXT-LL4z4zFT1w8jTUBr5cfiruiNd47uu28seod93b?gv=true"
                          className="w-full h-full border-0"
                          title="Book Hormone Replacement Appointment"
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
                          className="bg-primary hover:bg-primary-light text-primary-foreground text-lg px-8 py-6 w-full sm:w-auto"
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
      </div>
    </>
  );
};

export default Hormones;

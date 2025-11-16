import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Award, Heart, GraduationCap, Shield, Clock, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Compare from "@/components/Compare";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { Link } from "react-router-dom";
import providerImage from "@/assets/provider-portrait.jpg";
import quoteImage from "@/assets/provider-testimonial.jpg";
import { Helmet } from "react-helmet";
import { useState } from "react";

const Ketamine = () => {
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  
  const scrollToBooking = () => {
    window.open(SITE_CONFIG.bookingUrl, "_blank");
  };

  const conditions = [
    "Treatment-Resistant Depression",
    "Major Depressive Disorder (MDD)",
    "Post-Traumatic Stress Disorder (PTSD)",
    "Anxiety Disorders",
    "Suicidal Ideation (with supervision)"
  ];

  const safetyItems = [
    "Comprehensive screening including cardiovascular history, current medications, and substance-use assessment",
    "Continuous vitals monitoring throughout your infusion session",
    "Integration visits to support your treatment journey and discuss progress",
    "Coordination with your primary care provider and mental health professionals"
  ];

  const benefits = [
    "FDA-approved for treatment-resistant depression (TRD)",
    "Used with an oral antidepressant for comprehensive treatment",
    "Self-administered nasal spray under medical supervision",
    "Minimum 2-hour observation period following each dose",
    "REMS-certified clinic ensuring highest safety standards"
  ];

  const faqs = [
    {
      q: "How quickly does ketamine work?",
      a: "Many patients notice improvement within 24 hours of their first infusion, with full effects developing over a series of 6-8 treatments."
    },
    {
      q: "Is ketamine therapy covered by insurance?",
      a: "SPRAVATO® (esketamine) is often covered by insurance for treatment-resistant depression. IV ketamine is typically not covered but we accept Blue Cross Blue Shield, Tricare, and offer flexible payment options."
    },
    {
      q: "What's the difference between IV ketamine and SPRAVATO®?",
      a: "IV ketamine is administered via infusion and allows for precise dosing. SPRAVATO® is an FDA-approved nasal spray used with an oral antidepressant. Both are effective; the choice depends on your specific needs and insurance coverage."
    },
    {
      q: "Are there side effects?",
      a: "Common side effects include temporary dissociation, mild nausea, or dizziness during treatment. These typically resolve shortly after your session. Our team monitors you throughout to ensure safety and comfort."
    }
  ];

  return (
    <>
      <Helmet>
        <title>Ketamine Therapy Augusta | IV Ketamine & SPRAVATO® - Elevated Health</title>
        <meta name="description" content="Evidence-based ketamine therapy in Augusta, GA. IV ketamine infusions ($400/session) & FDA-approved SPRAVATO® nasal spray for treatment-resistant depression." />
        <meta name="keywords" content="ketamine therapy Augusta, IV ketamine Augusta GA, SPRAVATO Augusta, treatment-resistant depression Augusta, ketamine infusion Georgia" />
      </Helmet>

      <div className="min-h-screen">
        <Navbar />
        
        <main>
          {/* Hero Section */}
          <section className="pt-32 pb-16 md:pb-24 bg-gradient-to-b from-primary/5 to-background">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 animate-fade-in-up">
                  Ketamine Therapy in Augusta, GA
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                  Evidence-based ketamine therapy delivered with compassion, precision, and respect for your journey. 
                  Offering both IV ketamine infusions and FDA-approved SPRAVATO® nasal spray.
                </p>
                <Button
                  onClick={scrollToBooking}
                  size="lg"
                  className="bg-accent hover:bg-accent-light text-white text-base md:text-lg px-8 py-6 animate-fade-in-up"
                  style={{ animationDelay: "0.2s" }}
                >
                  Book Free Consultation
                </Button>
              </div>
            </div>
          </section>

          {/* What It Treats */}
          <section className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">
                  What Ketamine Therapy Treats
                </h2>
                <Card>
                  <CardContent className="p-6 md:p-8">
                    <p className="text-muted-foreground mb-6">
                      Ketamine therapy has shown remarkable results for patients who haven't found relief with traditional treatments:
                    </p>
                    <ul className="space-y-4">
                      {conditions.map((condition, index) => (
                        <li key={index} className="flex gap-3 items-start">
                          <CheckCircle2 className="h-6 w-6 text-accent flex-shrink-0 mt-0.5" />
                          <span className="text-base leading-relaxed">{condition}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="py-16 md:py-24 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center">
                  The Science Behind Ketamine Therapy
                </h2>
                <Card className="p-8 md:p-12 border-accent/20 bg-card/60 backdrop-blur-sm">
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    Ketamine works differently than traditional antidepressants. Instead of altering serotonin or dopamine, 
                    it targets <strong className="text-foreground">glutamate</strong>—the brain's most abundant neurotransmitter—helping 
                    to rapidly rebuild neural connections damaged by chronic stress, trauma, or depression.
                  </p>
                  <div className="grid md:grid-cols-3 gap-6 mt-8">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-accent mb-2">70%</div>
                      <p className="text-sm text-muted-foreground">Response rate in treatment-resistant depression</p>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-accent mb-2">24hrs</div>
                      <p className="text-sm text-muted-foreground">Many patients notice improvement within 1 day</p>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-accent mb-2">FDA</div>
                      <p className="text-sm text-muted-foreground">SPRAVATO® nasal spray FDA-approved for depression</p>
                    </div>
                  </div>
                </Card>

                <div className="mt-12 text-center">
                  <Link 
                    to="/how-ketamine-works"
                    className="inline-flex items-center gap-2 font-inter text-lg font-semibold text-accent hover:text-accent-light transition-colors group"
                  >
                    <span className="border-b-2 border-accent group-hover:border-accent-light">
                      Watch: How Ketamine Works
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* IV vs SPRAVATO Comparison */}
          <section className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center">
                  Choose Your Treatment Path
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  {/* IV Ketamine */}
                  <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
                    <CardContent className="p-8">
                      <h3 className="text-2xl font-bold mb-4 text-primary">IV Ketamine Infusion</h3>
                      <div className="mb-6">
                        <span className="text-3xl font-bold text-foreground">$400</span>
                        <span className="text-muted-foreground">/session</span>
                      </div>
                      <ul className="space-y-4 mb-8">
                        <li className="flex gap-3">
                          <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                          <span>Precise dosing via infusion</span>
                        </li>
                        <li className="flex gap-3">
                          <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                          <span>45-60 minute sessions</span>
                        </li>
                        <li className="flex gap-3">
                          <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                          <span>6-8 sessions recommended</span>
                        </li>
                        <li className="flex gap-3">
                          <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                          <span>Continuous monitoring</span>
                        </li>
                      </ul>
                      <Button onClick={scrollToBooking} className="w-full" variant="outline">
                        Learn More About IV Ketamine
                      </Button>
                    </CardContent>
                  </Card>

                  {/* SPRAVATO */}
                  <Card className="border-2 border-accent/20 hover:border-accent/40 transition-colors">
                    <CardContent className="p-8">
                      <h3 className="text-2xl font-bold mb-4 text-accent">SPRAVATO® Nasal Spray</h3>
                      <div className="mb-6">
                        <span className="text-muted-foreground">Often covered by insurance</span>
                      </div>
                      <ul className="space-y-4 mb-8">
                        {benefits.map((benefit, index) => (
                          <li key={index} className="flex gap-3">
                            <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                      <Button onClick={scrollToBooking} className="w-full bg-accent hover:bg-accent-light">
                        Check Insurance Coverage
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>

          {/* Safety & Monitoring */}
          <section className="py-16 md:py-24 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">
                  Safety & Monitoring
                </h2>
                <Card>
                  <CardContent className="p-6 md:p-8">
                    <p className="text-muted-foreground mb-6">
                      Your safety is our top priority. Every ketamine session includes:
                    </p>
                    <ul className="space-y-4">
                      {safetyItems.map((item, index) => (
                        <li key={index} className="flex gap-3 items-start">
                          <Shield className="h-6 w-6 text-accent flex-shrink-0 mt-0.5" />
                          <span className="text-base leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Provider Section with Quote */}
          <section className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center">
                  Expert Care Across All Our Services
                </h2>
                
                {/* Provider Card */}
                <div className="max-w-4xl mx-auto mb-12">
                  <Card className="overflow-hidden bg-card shadow-xl hover:shadow-2xl transition-all duration-300">
                    <div className="grid md:grid-cols-2 gap-0">
                      <div className="relative h-[500px] md:h-auto">
                        <img 
                          src={providerImage} 
                          alt="Lauren Bursey, FNP-C - Board-Certified Family Nurse Practitioner" 
                          className="w-full h-full object-cover"
                          loading="lazy"
                          width="800"
                          height="1000"
                        />
                      </div>
                      <div className="p-8 md:p-10 flex flex-col justify-center bg-gradient-subtle">
                        <div className="mb-6">
                          <h3 className="font-playfair text-3xl font-bold text-primary mb-2">Lauren Bursey, FNP-C</h3>
                          <p className="text-lg text-muted-foreground">Board-Certified Family Nurse Practitioner</p>
                        </div>
                        
                        <div className="space-y-6">
                          <div className="flex items-start gap-4">
                            <GraduationCap className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                            <div>
                              <div className="font-semibold text-foreground mb-1">Specialized Training</div>
                              <div className="text-muted-foreground">
                                Advanced certification in ketamine therapy, medical weight loss, and hormone replacement therapy
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-4">
                            <Heart className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                            <div>
                              <div className="font-semibold text-foreground mb-1">Patient-Centered Approach</div>
                              <div className="text-muted-foreground">
                                Committed to creating a safe, welcoming environment where patients feel heard and supported
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-4">
                            <Award className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                            <div>
                              <div className="font-semibold text-foreground mb-1">Evidence-Based Care</div>
                              <div className="text-muted-foreground">
                                Utilizes the latest research and proven protocols to deliver optimal outcomes
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Quote Graphic */}
                <div className="max-w-3xl mx-auto">
                  <Card className="p-0 overflow-hidden border-0 shadow-lg">
                    <img 
                      src={quoteImage} 
                      alt="Patient testimonial about ketamine therapy at Elevated Health Augusta" 
                      className="w-full h-auto"
                      loading="lazy"
                    />
                  </Card>
                </div>
              </div>
            </div>
          </section>

          {/* Veterans Support */}
          <section className="py-16 md:py-24 bg-primary text-white">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-4xl mx-auto text-center">
                <Users className="h-16 w-16 mx-auto mb-6 text-gold" />
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                  Supporting Our Veterans & First Responders
                </h2>
                <p className="text-lg mb-8 opacity-90">
                  We're honored to serve those who've served us. We accept TRICARE and work with veterans to 
                  make ketamine therapy accessible for PTSD, depression, and anxiety.
                </p>
                <Button 
                  onClick={scrollToBooking}
                  size="lg"
                  variant="outline"
                  className="bg-white text-primary hover:bg-gold hover:text-white border-white"
                >
                  Learn About Veteran Benefits
                </Button>
              </div>
            </div>
          </section>

          {/* Insurance */}
          <section className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                  Insurance & Payment Options
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  We accept Blue Cross Blue Shield, TRICARE, and offer flexible payment plans. 
                  SPRAVATO® is often covered by insurance for treatment-resistant depression.
                </p>
                <div className="grid sm:grid-cols-3 gap-6">
                  <Card className="p-6">
                    <h3 className="font-bold mb-2">Blue Cross Blue Shield</h3>
                    <p className="text-sm text-muted-foreground">Full coverage accepted</p>
                  </Card>
                  <Card className="p-6">
                    <h3 className="font-bold mb-2">TRICARE</h3>
                    <p className="text-sm text-muted-foreground">Veterans & military families</p>
                  </Card>
                  <Card className="p-6">
                    <h3 className="font-bold mb-2">Flexible Plans</h3>
                    <p className="text-sm text-muted-foreground">Self-pay options available</p>
                  </Card>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-16 md:py-24 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center">
                  Patient Success Stories
                </h2>
                <div className="space-y-8">
                  <Card className="p-0 overflow-hidden border-0 shadow-2xl max-w-2xl mx-auto">
                    <img 
                      src={quoteImage} 
                      alt="Patient testimonial about ketamine therapy at Elevated Health Augusta" 
                      className="w-full h-auto"
                    />
                  </Card>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-6">
                  {faqs.map((faq, index) => (
                    <Card key={index} className="p-6">
                      <h3 className="font-bold text-lg mb-3 text-primary">{faq.q}</h3>
                      <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="py-16 md:py-24 bg-gradient-to-r from-accent/10 via-primary/10 to-gold/10">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                  Ready to Start Your Healing Journey?
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Schedule a free consultation to learn if ketamine therapy is right for you
                </p>
                <Button
                  onClick={scrollToBooking}
                  size="lg"
                  className="bg-accent hover:bg-accent-light text-white text-base md:text-lg px-8 py-6"
                >
                  Book Your Free Consultation
                </Button>
              </div>
            </div>
          </section>

          {/* Compare Section */}
          <Compare isQuizOpen={isQuizOpen} onQuizClose={() => setIsQuizOpen(false)} />
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Ketamine;

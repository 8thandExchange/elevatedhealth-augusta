import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Award, Heart, GraduationCap, Zap, Moon, Smile } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SITE_CONFIG } from "@/lib/siteConfig";
import providerImage from "@/assets/provider-portrait.jpg";
import { Helmet } from "react-helmet";

const Hormones = () => {
  const scrollToBooking = () => {
    window.open(SITE_CONFIG.bookingUrl, "_blank");
  };

  const symptoms = [
    "Persistent fatigue and low energy",
    "Difficulty sleeping or insomnia",
    "Mood swings, anxiety, or depression",
    "Weight gain or difficulty losing weight",
    "Low libido or sexual dysfunction",
    "Hot flashes or night sweats",
    "Brain fog and memory issues",
    "Muscle loss or weakness"
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Increased Energy",
      description: "Restore vitality and feel like yourself again"
    },
    {
      icon: Moon,
      title: "Better Sleep",
      description: "Improve sleep quality and wake refreshed"
    },
    {
      icon: Smile,
      title: "Enhanced Mood",
      description: "Balance emotions and reduce anxiety"
    }
  ];

  const processSteps = [
    "Comprehensive lab testing to assess hormone levels",
    "Personalized bioidentical hormone therapy plan",
    "Regular monitoring and dose adjustments",
    "Ongoing support and lifestyle guidance"
  ];

  const faqs = [
    {
      q: "What is bioidentical hormone replacement therapy (BHRT)?",
      a: "BHRT uses hormones that are molecularly identical to those your body produces naturally. This approach provides more natural results with fewer side effects compared to synthetic hormones."
    },
    {
      q: "Who is a good candidate for HRT?",
      a: "Adults experiencing symptoms of hormone imbalance—such as fatigue, mood changes, weight gain, or low libido—may benefit from HRT. We'll assess your symptoms and lab results during your consultation."
    },
    {
      q: "How long before I see results?",
      a: "Many patients notice improvements in energy and mood within 2-4 weeks. Full benefits typically develop over 3-6 months as hormone levels stabilize."
    },
    {
      q: "Is hormone replacement therapy safe?",
      a: "When properly monitored by a healthcare provider, BHRT is safe and effective. We use the latest research and clinical guidelines (NAMS 2025) to ensure optimal safety and results."
    }
  ];

  return (
    <>
      <Helmet>
        <title>Hormone Replacement Therapy Augusta | BHRT $299/mo - Elevated Health</title>
        <meta name="description" content="Bioidentical hormone replacement therapy in Augusta, GA. Restore energy, improve sleep, and balance mood with physician-supervised BHRT. $299/month." />
        <meta name="keywords" content="hormone replacement Augusta, BHRT Augusta GA, bioidentical hormones Georgia, hormone therapy Augusta, menopause treatment" />
      </Helmet>

      <div className="min-h-screen">
        <Navbar />
        
        <main>
          {/* Hero Section */}
          <section className="pt-32 pb-16 md:pb-24 bg-gradient-to-b from-gold/5 to-background">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 animate-fade-in-up">
                  Hormone Replacement Therapy in Augusta, GA
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                  Restore balance and vitality with bioidentical hormone replacement therapy (BHRT). 
                  Personalized treatment to help you feel like yourself again.
                </p>
                <div className="mb-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                  <span className="text-4xl font-bold text-gold">$299</span>
                  <span className="text-xl text-muted-foreground">/month</span>
                </div>
              </div>
            </div>
          </section>

          {/* Symptoms We Treat */}
          <section className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">
                  Symptoms of Hormone Imbalance
                </h2>
                <Card>
                  <CardContent className="p-6 md:p-8">
                    <p className="text-muted-foreground mb-6">
                      Hormone imbalances can significantly impact your quality of life. Common symptoms include:
                    </p>
                    <ul className="space-y-4">
                      {symptoms.map((symptom, index) => (
                        <li key={index} className="flex gap-3 items-start">
                          <CheckCircle2 className="h-6 w-6 text-gold flex-shrink-0 mt-0.5" />
                          <span className="text-base leading-relaxed">{symptom}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Benefits */}
          <section className="py-16 md:py-24 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center">
                  Benefits of Hormone Replacement Therapy
                </h2>
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                  {benefits.map((benefit, index) => {
                    const Icon = benefit.icon;
                    return (
                      <Card key={index} className="p-8 text-center hover:shadow-lg transition-shadow">
                        <Icon className="h-12 w-12 text-gold mx-auto mb-4" />
                        <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                        <p className="text-sm text-muted-foreground">{benefit.description}</p>
                      </Card>
                    );
                  })}
                </div>
                <Card className="p-8 md:p-12 bg-gold/5">
                  <p className="text-lg text-muted-foreground leading-relaxed text-center">
                    Bioidentical hormones are derived from natural plant sources and are molecularly identical 
                    to the hormones your body produces, offering a more natural approach to hormone therapy 
                    with fewer side effects (NAMS 2025 Guidelines).
                  </p>
                </Card>
              </div>
            </div>
          </section>

          {/* Our Process */}
          <section className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">
                  Our BHRT Process
                </h2>
                <Card>
                  <CardContent className="p-6 md:p-8">
                    <p className="text-muted-foreground mb-6">
                      We take a comprehensive, personalized approach to hormone replacement therapy:
                    </p>
                    <ul className="space-y-4">
                      {processSteps.map((step, index) => (
                        <li key={index} className="flex gap-3 items-start">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gold text-white flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>
                          <span className="text-base leading-relaxed pt-1">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Provider Section */}
          <section className="py-16 md:py-24 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center">
                  Expert Care Across All Our Services
                </h2>
                
                <div className="max-w-4xl mx-auto">
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
                            <GraduationCap className="h-6 w-6 text-gold flex-shrink-0 mt-1" />
                            <div>
                              <div className="font-semibold text-foreground mb-1">Specialized Training</div>
                              <div className="text-muted-foreground">
                                Advanced certification in hormone replacement therapy, ketamine therapy, and medical weight loss
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-4">
                            <Heart className="h-6 w-6 text-gold flex-shrink-0 mt-1" />
                            <div>
                              <div className="font-semibold text-foreground mb-1">Patient-Centered Approach</div>
                              <div className="text-muted-foreground">
                                Committed to creating a safe, welcoming environment where patients feel heard and supported
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-4">
                            <Award className="h-6 w-6 text-gold flex-shrink-0 mt-1" />
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
                      <h3 className="font-bold text-lg mb-3 text-gold">{faq.q}</h3>
                      <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="py-16 md:py-24 bg-gradient-to-r from-gold/10 via-primary/10 to-accent/10">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                  Rebalance Your Hormones, Reclaim Your Life
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Join the waitlist to be among the first to access our hormone replacement therapy program
                </p>
                <Button
                  onClick={scrollToBooking}
                  size="lg"
                  className="bg-gold hover:bg-gold-light text-gold-foreground text-base md:text-lg px-8 py-6"
                >
                  Join Waitlist
                </Button>
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

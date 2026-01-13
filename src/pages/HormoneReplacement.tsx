import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NotReadyToBook from "@/components/NotReadyToBook";
import { SITE_CONFIG } from "@/lib/siteConfig";

const HormoneReplacement = () => {
  const scrollToBooking = () => {
    window.location.href = "/#booking";
  };

  const benefits = [
    "Comprehensive hormone testing and analysis",
    "Personalized treatment plans for men and women",
    "Bioidentical hormone replacement options",
    "Improved energy, mood, and mental clarity",
    "Enhanced metabolism and body composition",
    "Ongoing monitoring and dosage optimization"
  ];

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Hormone Replacement Therapy Augusta | HRT Clinic - Elevated Health</title>
        <meta name="description" content="Hormone replacement therapy in Augusta, GA. $99 consultation credited toward treatment. Chat with our Virtual Care Team 24/7. Personalized HRT for men and women." />
      </Helmet>
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 animate-fade-in-up">
                Hormone Replacement Therapy
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                Restore hormonal balance and reclaim your vitality with personalized, physician-guided 
                hormone optimization for men and women.
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">
                What We Offer
              </h2>
              <Card>
                <CardContent className="p-6 md:p-8">
                  <p className="text-muted-foreground mb-6">
                    Our hormone replacement programs are designed to address age-related hormone decline 
                    and restore optimal function:
                  </p>
                  <ul className="space-y-4">
                    {benefits.map((item, index) => (
                      <li key={index} className="flex gap-3 items-start">
                        <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-base leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Have Questions? Section */}
        <section className="section-spacing-sm bg-background">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
              <NotReadyToBook 
                variant="compact" 
                title="Curious about hormone replacement?"
                description="Learn how we test, prescribe, and monitor your treatment. No pressure—just honest answers about the process."
                ctaText="Ask Our Team: (706) 760-3470"
              />
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">
                Who Can Benefit?
              </h2>
              <div className="bg-card border border-border rounded-lg p-6 md:p-8 mb-12">
                <p className="text-base leading-relaxed mb-4">
                  Hormone replacement therapy may be right for you if you're experiencing:
                </p>
                <ul className="space-y-2 text-muted-foreground ml-6">
                  <li className="list-disc">Persistent fatigue and low energy</li>
                  <li className="list-disc">Mood changes, irritability, or depression</li>
                  <li className="list-disc">Weight gain and difficulty losing weight</li>
                  <li className="list-disc">Reduced muscle mass and strength</li>
                  <li className="list-disc">Low libido and sexual function concerns</li>
                  <li className="list-disc">Sleep disturbances and brain fog</li>
                </ul>
              </div>

              <div className="text-center">
                <h3 className="text-2xl sm:text-3xl font-bold mb-6">
                  Start Your Journey to Optimal Health
                </h3>
                <p className="text-lg text-muted-foreground mb-8">
                  Schedule a consultation to discuss hormone testing and personalized treatment options.
                </p>
                <Button
                  variant="hero"
                  size="lg"
                  asChild
                  className="text-base md:text-lg px-8 py-6"
                >
                  <a
                    href={SITE_CONFIG.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Book Your $99 Consultation
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HormoneReplacement;

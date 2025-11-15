import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const WeightLoss = () => {
  const scrollToBooking = () => {
    window.location.href = "/#booking";
  };

  const programFeatures = [
    "Comprehensive metabolic assessment and lab work",
    "Physician-supervised treatment plans",
    "FDA-approved weight loss medications when appropriate",
    "Personalized nutrition and lifestyle coaching",
    "Regular progress monitoring and plan adjustments",
    "Long-term maintenance strategies for sustained results"
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 animate-fade-in-up">
                Medical Weight Loss Programs
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                Achieve sustainable weight loss with physician-guided programs that combine medical science, 
                nutrition, and personalized support.
              </p>
            </div>
          </div>
        </section>

        {/* Program Features Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">
                Our Comprehensive Approach
              </h2>
              <Card>
                <CardContent className="p-6 md:p-8">
                  <p className="text-muted-foreground mb-6">
                    Our medical weight loss programs go beyond simple diet and exercise, addressing the 
                    underlying factors that affect your metabolism and weight:
                  </p>
                  <ul className="space-y-4">
                    {programFeatures.map((item, index) => (
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

        {/* Why Choose Us Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">
                Why Medical Weight Loss?
              </h2>
              <div className="bg-card border border-border rounded-lg p-6 md:p-8 mb-12">
                <p className="text-base leading-relaxed mb-6">
                  Medical weight loss programs offer advantages that traditional dieting cannot:
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Evidence-Based Approach</h3>
                    <p className="text-muted-foreground text-sm">
                      Treatments backed by clinical research and proven to deliver results.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Medical Supervision</h3>
                    <p className="text-muted-foreground text-sm">
                      Physician oversight ensures safety and effectiveness throughout your journey.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Personalized Plans</h3>
                    <p className="text-muted-foreground text-sm">
                      Customized strategies based on your unique metabolism, health history, and goals.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Sustainable Results</h3>
                    <p className="text-muted-foreground text-sm">
                      Focus on long-term lifestyle changes, not quick fixes that don't last.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-2xl sm:text-3xl font-bold mb-6">
                  Take the First Step Toward Your Goals
                </h3>
                <p className="text-lg text-muted-foreground mb-8">
                  Schedule a consultation to learn about our medical weight loss programs and start your transformation.
                </p>
                <Button
                  variant="hero"
                  size="lg"
                  asChild
                  className="text-base md:text-lg px-8 py-6"
                >
                  <a
                    href="https://calendar.google.com/calendar/appointments/AcRdB1234567890"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Book Your Free Consultation
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

export default WeightLoss;
